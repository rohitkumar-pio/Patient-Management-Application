import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/api';
import { showToast } from '../../components/Toast';
import { Patient } from '../../types';

interface AddAppointmentModalProps {
  isOpen: boolean;
  date: string; // YYYY-MM-DD
  onClose: () => void;
}

/**
 * Build the appointment timestamp in local time. Without a time the appointment
 * is stored at local midnight, which the card displays as date-only.
 */
const toAppointmentIso = (date: string, time: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];
  return new Date(year, month - 1, day, hours, minutes).toISOString();
};

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, date, onClose }) => {
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patients', 'options'],
    queryFn: async () => {
      const response = await apiClient.get('/patients?limit=100');
      return response.data.data as Patient[];
    },
    enabled: isOpen,
  });

  const resetAndClose = () => {
    setPatientId('');
    setTime('');
    setNotes('');
    setError(null);
    onClose();
  };

  const createMutation = useMutation({
    mutationFn: async () =>
      apiClient.post('/appointments', {
        patientId,
        appointmentDate: toAppointmentIso(date, time),
        ...(notes.trim() && { notes: notes.trim() }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      showToast('Appointment scheduled', 'success');
      resetAndClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to schedule appointment. Please try again.');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setError('Please select a patient');
      return;
    }
    setError(null);
    createMutation.mutate();
  };

  return (
    <div className="appointment-modal-overlay" onClick={resetAndClose}>
      <div
        className="appointment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-appointment-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-appointment-title" className="appointment-modal-title">
          Add Appointment
        </h2>
        <p className="appointment-modal-date">
          {new Date(toAppointmentIso(date, '')).toLocaleDateString([], {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="appointment-form-group">
            <label htmlFor="appointment-patient">
              Patient <span className="required">*</span>
            </label>
            <select
              id="appointment-patient"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={isLoadingPatients}
            >
              <option value="">{isLoadingPatients ? 'Loading patients...' : 'Select a patient'}</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="appointment-form-group">
            <label htmlFor="appointment-time">Time (optional)</label>
            <input
              id="appointment-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="appointment-form-group">
            <label htmlFor="appointment-notes">Notes (optional)</label>
            <textarea
              id="appointment-notes"
              rows={3}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for visit, follow-up details..."
            />
          </div>

          {error && (
            <p className="appointment-form-error" role="alert">
              {error}
            </p>
          )}

          <div className="appointment-modal-actions">
            <button
              type="button"
              className="appointment-modal-btn secondary"
              onClick={resetAndClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button type="submit" className="appointment-modal-btn primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointmentModal;
