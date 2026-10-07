import React, { useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import {
  appointmentsByDateKey,
  fetchAppointmentsByDate,
  formatLongDate,
  isValidDateString,
  toAppointmentIso,
  toDateString,
} from '../lib/appointments';
import { useDebounce } from '../hooks/useDebounce';
import { showToast } from './Toast';
import { formatAppointmentTime } from './AppointmentCard';
import type { Appointment, Patient } from '../types';
import './AddAppointmentModal.scss';

type PatientOption = Pick<Patient, 'id' | 'name' | 'phone'>;

const STATUS_LABELS: Record<Appointment['status'], string> = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
};

const appointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine(isValidDateString, 'Enter a valid date')
    .refine((value) => value >= toDateString(new Date()), 'Date cannot be in the past'),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid time')
    .or(z.literal('')),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters'),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** YYYY-MM-DD; used when it is today or later, otherwise today */
  defaultDate?: string;
  /** Pre-selects and locks the patient (e.g. from the patient profile) */
  patient?: PatientOption;
  /** Called with the created appointment's date (YYYY-MM-DD) */
  onCreated?: (date: string) => void;
}

const getInitialValues = (defaultDate?: string, patient?: PatientOption): AppointmentFormData => {
  const today = toDateString(new Date());
  return {
    patientId: patient?.id ?? '',
    date: isValidDateString(defaultDate) && defaultDate >= today ? defaultDate : today,
    time: '',
    notes: '',
  };
};

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  patient,
  onCreated,
}) => {
  const queryClient = useQueryClient();
  const idPrefix = useId();
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(patient ?? null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: getInitialValues(defaultDate, patient),
  });

  // Fresh form every time the modal opens
  useEffect(() => {
    if (isOpen) {
      reset(getInitialValues(defaultDate, patient));
      setSelectedPatient(patient ?? null);
      setServerError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const patientId = watch('patientId');
  const date = watch('date');

  // Same cache entry as the appointments page for that day
  const { data: dayAppointments = [] } = useQuery({
    queryKey: appointmentsByDateKey(date),
    queryFn: () => fetchAppointmentsByDate(date),
    enabled: isOpen && !!patientId && isValidDateString(date),
  });

  const duplicates = patientId
    ? dayAppointments.filter((a) => a.patientId === patientId && a.status !== 'CANCELLED')
    : [];

  const createMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) =>
      apiClient.post('/appointments', {
        patientId: data.patientId,
        appointmentDate: toAppointmentIso(data.date, data.time),
        ...(data.notes.trim() && { notes: data.notes.trim() }),
      }),
    onSuccess: (_res, data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      showToast(
        `Appointment scheduled for ${selectedPatient?.name ?? 'patient'} on ${formatLongDate(data.date)}`,
        'success'
      );
      onCreated?.(data.date);
      onClose();
    },
    onError: (err: any) => {
      setServerError(err.response?.data?.message || 'Failed to schedule appointment. Please try again.');
    },
  });

  if (!isOpen) return null;

  const selectPatient = (option: PatientOption | null) => {
    setSelectedPatient(option);
    setValue('patientId', option?.id ?? '', { shouldValidate: !!option });
  };

  const onSubmit = (data: AppointmentFormData) => {
    setServerError(null);
    createMutation.mutate(data);
  };

  const fieldId = (name: string) => `${idPrefix}-${name}`;
  const isSubmitting = createMutation.isPending;

  return (
    <div className="add-appointment-overlay" onClick={onClose}>
      <div
        className="add-appointment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={fieldId('title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="add-appointment-header">
          <h2 id={fieldId('title')}>Schedule Appointment</h2>
          <button type="button" className="add-appointment-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <input type="hidden" {...register('patientId')} />

          {/* Patient */}
          <div className="add-appointment-field">
            <span className="add-appointment-label" id={fieldId('patient-label')}>
              Patient <span className="required">*</span>
            </span>
            {selectedPatient ? (
              <div className="selected-patient" aria-labelledby={fieldId('patient-label')}>
                <div>
                  <div className="selected-patient-name">{selectedPatient.name}</div>
                  <div className="selected-patient-phone">📞 {selectedPatient.phone}</div>
                </div>
                {!patient && (
                  <button type="button" className="selected-patient-change" onClick={() => selectPatient(null)}>
                    Change
                  </button>
                )}
              </div>
            ) : (
              <PatientCombobox
                inputId={fieldId('patient')}
                labelledBy={fieldId('patient-label')}
                invalid={!!errors.patientId}
                onSelect={selectPatient}
              />
            )}
            {errors.patientId && <p className="add-appointment-error">{errors.patientId.message}</p>}
          </div>

          {/* Date and time */}
          <div className="add-appointment-row">
            <div className="add-appointment-field">
              <label className="add-appointment-label" htmlFor={fieldId('date')}>
                Date <span className="required">*</span>
              </label>
              <input
                id={fieldId('date')}
                type="date"
                min={toDateString(new Date())}
                className={errors.date ? 'invalid' : ''}
                {...register('date')}
              />
              {errors.date && <p className="add-appointment-error">{errors.date.message}</p>}
            </div>
            <div className="add-appointment-field">
              <label className="add-appointment-label" htmlFor={fieldId('time')}>
                Time <span className="optional">(optional)</span>
              </label>
              <input
                id={fieldId('time')}
                type="time"
                className={errors.time ? 'invalid' : ''}
                {...register('time')}
              />
              {errors.time && <p className="add-appointment-error">{errors.time.message}</p>}
            </div>
          </div>

          {/* Duplicate warning (non-blocking) */}
          {duplicates.length > 0 && selectedPatient && (
            <div className="add-appointment-warning" role="status">
              <strong>{selectedPatient.name}</strong> already has{' '}
              {duplicates.length === 1 ? 'an appointment' : `${duplicates.length} appointments`} on{' '}
              {formatLongDate(date)}:{' '}
              {duplicates
                .map((a) => `${formatAppointmentTime(a.appointmentDate)} (${STATUS_LABELS[a.status]})`)
                .join(', ')}
              . You can still schedule another one.
            </div>
          )}

          {/* Notes */}
          <div className="add-appointment-field">
            <label className="add-appointment-label" htmlFor={fieldId('notes')}>
              Notes <span className="optional">(optional)</span>
            </label>
            <textarea
              id={fieldId('notes')}
              rows={3}
              placeholder="Reason for visit, follow-up details..."
              className={errors.notes ? 'invalid' : ''}
              {...register('notes')}
            />
            {errors.notes && <p className="add-appointment-error">{errors.notes.message}</p>}
          </div>

          {serverError && (
            <div className="add-appointment-server-error" role="alert">
              {serverError}
            </div>
          )}

          <div className="add-appointment-actions">
            <button type="button" className="add-appointment-btn secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="add-appointment-btn primary" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : duplicates.length > 0 ? 'Schedule Anyway' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PatientComboboxProps {
  inputId: string;
  labelledBy: string;
  invalid: boolean;
  onSelect: (patient: PatientOption) => void;
}

/** Searchable patient dropdown: server-side search by name or phone, keyboard navigable */
const PatientCombobox: React.FC<PatientComboboxProps> = ({ inputId, labelledBy, invalid, onSelect }) => {
  const [term, setTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedTerm = useDebounce(term.trim(), 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = `${inputId}-listbox`;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data: options = [], isFetching } = useQuery({
    queryKey: ['patients', 'appointment-search', debouncedTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ page: '1', limit: '10' });
      if (debouncedTerm) params.append('search', debouncedTerm);
      const response = await apiClient.get(`/patients?${params.toString()}`);
      return response.data.data as PatientOption[];
    },
    enabled: isOpen,
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedTerm]);

  const choose = (option: PatientOption) => {
    setIsOpen(false);
    onSelect(option);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => Math.min(i + 1, Math.max(options.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      // Never submit the form from the search box
      e.preventDefault();
      if (isOpen && options[activeIndex]) choose(options[activeIndex]);
    } else if (e.key === 'Escape' && isOpen) {
      // Close the list without closing the modal
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      setIsOpen(false);
    }
  };

  return (
    <div className="patient-combobox">
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-labelledby={labelledBy}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={isOpen && options[activeIndex] ? `${listboxId}-${options[activeIndex].id}` : undefined}
        autoComplete="off"
        placeholder="Search by name or phone..."
        className={invalid ? 'invalid' : ''}
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <ul id={listboxId} role="listbox" className="patient-combobox-list">
          {options.map((option, index) => (
            <li
              key={option.id}
              id={`${listboxId}-${option.id}`}
              role="option"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? 'active' : ''}
              // mousedown (not click) so it fires before the input's blur closes the list
              onMouseDown={(e) => {
                e.preventDefault();
                choose(option);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="option-name">{option.name}</span>
              <span className="option-phone">{option.phone}</span>
            </li>
          ))}
          {options.length === 0 && (
            <li className="patient-combobox-empty" aria-live="polite">
              {isFetching ? 'Searching...' : 'No patients found'}
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default AddAppointmentModal;
