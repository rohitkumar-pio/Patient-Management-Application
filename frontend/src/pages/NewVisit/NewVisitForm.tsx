import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/api';
import { useAutoSave } from '../../hooks/useAutoSave';
import { showToast } from '../../components/Toast';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import './NewVisitForm.scss';

// Validation schema
const visitFormSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  temperature: z.string().min(1, 'Temperature is required').refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 35 && num <= 42;
  }, 'Temperature must be between 35°C and 42°C'),
  bloodPressure: z.string().min(1, 'Blood pressure is required').regex(
    /^\d{2,3}\/\d{2,3}$/,
    'Format: XXX/YYY (e.g., 120/80)'
  ).refine((val) => {
    const [systolic, diastolic] = val.split('/').map(Number);
    return systolic >= 80 && systolic <= 200 && diastolic >= 40 && diastolic <= 130 && systolic > diastolic;
  }, 'Invalid blood pressure range or systolic must be greater than diastolic'),
  pulse: z.string().min(1, 'Pulse is required').refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 40 && num <= 200;
  }, 'Pulse must be between 40 and 200 bpm'),
  complaints: z.string().min(1, 'Complaints are required').max(1000, 'Maximum 1000 characters'),
  diagnosis: z.string().max(2000, 'Maximum 2000 characters').optional(),
  medications: z.array(z.object({
    name: z.string().min(2, 'Name is required (min 2 characters)').max(200),
    dosage: z.string().min(1, 'Dosage is required').max(100),
    frequency: z.string().min(1, 'Frequency is required').max(200),
    duration: z.string().min(1, 'Duration is required').max(100),
    instructions: z.string().max(500).optional(),
  })).optional(),
});

type VisitFormData = z.infer<typeof visitFormSchema>;

export const NewVisitForm: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  const { register, control, handleSubmit, formState: { errors }, watch, reset } = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      patientId: '',
      temperature: '',
      bloodPressure: '',
      pulse: '',
      complaints: '',
      diagnosis: '',
      medications: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  const formData = watch();
  const selectedPatientId = watch('patientId');

  // Fetch patients for dropdown
  const { data: patientsResponse } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await apiClient.get('/patients?limit=1000');
      return response.data;
    },
  });

  const patients = patientsResponse?.data || [];

  // Fetch selected patient details
  const { data: selectedPatientResponse } = useQuery({
    queryKey: ['patient', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return null;
      const response = await apiClient.get(`/patients/${selectedPatientId}`);
      return response.data.data;
    },
    enabled: !!selectedPatientId,
  });

  const selectedPatient = selectedPatientResponse;

  // Auto-save functionality
  const storageKey = `visit-draft-${selectedPatientId || 'new'}-${Date.now()}`;
  const { isDraft, lastSaved, loadDraft, clearDraft } = useAutoSave({
    data: formData,
    enabled: autoSaveEnabled && !!selectedPatientId,
    storageKey,
    onSave: () => {
      // Show toast notification
      console.log('Draft saved at', new Date().toLocaleTimeString());
    },
  });

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.patientId) {
      setShowDraftDialog(true);
      // Store draft for later use
      (window as any).visitDraft = draft;
    }
  }, []);

  // Enable auto-save after patient is selected
  useEffect(() => {
    if (selectedPatientId) {
      setAutoSaveEnabled(true);
    }
  }, [selectedPatientId]);

  // Warn on navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSaveEnabled && formData.patientId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSaveEnabled, formData.patientId]);

  const handleLoadDraft = () => {
    const draft = (window as any).visitDraft;
    if (draft) {
      reset(draft);
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftDialog(false);
  };

  const getVitalStatus = (type: 'temperature' | 'pulse' | 'bp', value: string) => {
    if (!value) return '';

    if (type === 'temperature') {
      const temp = parseFloat(value);
      if (isNaN(temp)) return '';
      if (temp >= 36.1 && temp <= 37.2) return 'normal';
      if (temp >= 35 && temp < 36.1 || temp > 37.2 && temp <= 38) return 'warning';
      return 'danger';
    }

    if (type === 'pulse') {
      const pulseVal = parseInt(value, 10);
      if (isNaN(pulseVal)) return '';
      if (pulseVal >= 60 && pulseVal <= 100) return 'normal';
      if (pulseVal >= 50 && pulseVal < 60 || pulseVal > 100 && pulseVal <= 120) return 'warning';
      return 'danger';
    }

    if (type === 'bp') {
      const match = value.match(/^(\d{2,3})\/(\d{2,3})$/);
      if (!match) return '';
      const systolic = parseInt(match[1], 10);
      const diastolic = parseInt(match[2], 10);
      if (systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80) return 'normal';
      if (systolic >= 120 && systolic <= 140 || diastolic >= 80 && diastolic <= 90) return 'warning';
      return 'danger';
    }

    return '';
  };

  const onSubmit = async (data: VisitFormData, printPrescription: boolean = false) => {
    setIsSubmitting(true);

    try {
      const payload = {
        patientId: data.patientId,
        temperature: parseFloat(data.temperature),
        bloodPressure: data.bloodPressure,
        pulse: parseInt(data.pulse, 10),
        complaints: data.complaints,
        diagnosis: data.diagnosis || '',
        medications: data.medications || [],
      };

      const response = await apiClient.post('/visits', payload);
      const visitId = response.data.data.id;

      showToast('Visit recorded successfully', 'success');
      clearDraft();
      setAutoSaveEnabled(false);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', data.patientId] });

      if (printPrescription) {
        // Open prescription in new window/tab
        window.open(`/visits/${visitId}/prescription`, '_blank');
      }

      // Redirect to patient profile
      navigate(`/patients/${data.patientId}`);
    } catch (error: any) {
      console.error('Error creating visit:', error);
      const message = error.response?.data?.message || 'Failed to create visit';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.patientId || formData.complaints) {
      setShowCancelDialog(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleConfirmCancel = () => {
    clearDraft();
    setAutoSaveEnabled(false);
    navigate('/dashboard');
  };

  return (
    <div className="new-visit-form">
      <div className="new-visit-header">
        <h1>New Consultation</h1>
        {isDraft && lastSaved && (
          <span className="draft-indicator">
            Draft saved at {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="visit-form">
        {/* SECTION 1: Patient Selection */}
        <section className="form-section patient-section">
          <h2>Patient Selection</h2>
          <div className="form-group">
            <label htmlFor="patientId">Select Patient *</label>
            <select
              id="patientId"
              {...register('patientId')}
              className={errors.patientId ? 'error' : ''}
            >
              <option value="">-- Select a patient --</option>
              {patients.map((patient: any) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.age} years - {patient.phone}
                </option>
              ))}
            </select>
            {errors.patientId && <span className="error-message">{errors.patientId.message}</span>}
          </div>

          {selectedPatient && (
            <div className="patient-info">
              <div className="info-item">
                <strong>Name:</strong> {selectedPatient.name}
              </div>
              <div className="info-item">
                <strong>Age:</strong> {selectedPatient.age} years
              </div>
              <div className="info-item">
                <strong>Gender:</strong> {selectedPatient.gender}
              </div>
              <div className="info-item">
                <strong>Phone:</strong> {selectedPatient.phone}
              </div>
              <div className="info-item">
                <strong>Total Visits:</strong> {selectedPatient.visitCount || 0}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: Vitals */}
        <section className="form-section vitals-section">
          <h2>Vitals (Mandatory)</h2>
          <div className="vitals-grid">
            <div className="form-group">
              <label htmlFor="temperature">Temperature (°C) *</label>
              <input
                type="number"
                step="0.1"
                id="temperature"
                placeholder="e.g., 37.5"
                {...register('temperature')}
                className={`vital-input ${getVitalStatus('temperature', watch('temperature'))}`}
              />
              <span className="hint">Normal: 36.1 - 37.2°C</span>
              {errors.temperature && <span className="error-message">{errors.temperature.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="bloodPressure">Blood Pressure (mmHg) *</label>
              <input
                type="text"
                id="bloodPressure"
                placeholder="e.g., 120/80"
                {...register('bloodPressure')}
                className={`vital-input ${getVitalStatus('bp', watch('bloodPressure'))}`}
              />
              <span className="hint">Normal: 90-120 / 60-80</span>
              {errors.bloodPressure && <span className="error-message">{errors.bloodPressure.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="pulse">Pulse (BPM) *</label>
              <input
                type="number"
                id="pulse"
                placeholder="e.g., 72"
                {...register('pulse')}
                className={`vital-input ${getVitalStatus('pulse', watch('pulse'))}`}
              />
              <span className="hint">Normal: 60 - 100 bpm</span>
              {errors.pulse && <span className="error-message">{errors.pulse.message}</span>}
            </div>
          </div>
        </section>

        {/* SECTION 3: Complaints */}
        <section className="form-section complaints-section">
          <h2>Complaints *</h2>
          <div className="form-group">
            <textarea
              id="complaints"
              placeholder="Describe patient's symptoms and complaints..."
              {...register('complaints')}
              className={errors.complaints ? 'error' : ''}
              rows={5}
            />
            <div className="char-count">
              {watch('complaints')?.length || 0} / 1000
            </div>
            {errors.complaints && <span className="error-message">{errors.complaints.message}</span>}
          </div>
        </section>

        {/* SECTION 4: Diagnosis */}
        <section className="form-section diagnosis-section">
          <h2>Diagnosis</h2>
          <div className="form-group">
            <textarea
              id="diagnosis"
              placeholder="Enter diagnosis and treatment plan..."
              {...register('diagnosis')}
              className={errors.diagnosis ? 'error' : ''}
              rows={5}
            />
            <div className="char-count">
              {watch('diagnosis')?.length || 0} / 2000
            </div>
            {errors.diagnosis && <span className="error-message">{errors.diagnosis.message}</span>}
          </div>
        </section>

        {/* SECTION 5: Medications */}
        <section className="form-section medications-section">
          <div className="section-header">
            <h2>Medications</h2>
            <button
              type="button"
              onClick={() => append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })}
              className="btn-add-medication"
            >
              + Add Medication
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="empty-state">
              <p>No medications added. Click "Add Medication" to add prescriptions.</p>
            </div>
          ) : (
            <div className="medications-table">
              <table>
                <thead>
                  <tr>
                    <th>Name *</th>
                    <th>Dosage *</th>
                    <th>Frequency *</th>
                    <th>Duration *</th>
                    <th>Instructions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id}>
                      <td>
                        <input
                          type="text"
                          placeholder="Med name"
                          {...register(`medications.${index}.name`)}
                          className={errors.medications?.[index]?.name ? 'error' : ''}
                        />
                        {errors.medications?.[index]?.name && (
                          <span className="error-message">{errors.medications[index]?.name?.message}</span>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="e.g., 500mg"
                          {...register(`medications.${index}.dosage`)}
                          className={errors.medications?.[index]?.dosage ? 'error' : ''}
                        />
                        {errors.medications?.[index]?.dosage && (
                          <span className="error-message">{errors.medications[index]?.dosage?.message}</span>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="e.g., Twice daily"
                          {...register(`medications.${index}.frequency`)}
                          className={errors.medications?.[index]?.frequency ? 'error' : ''}
                        />
                        {errors.medications?.[index]?.frequency && (
                          <span className="error-message">{errors.medications[index]?.frequency?.message}</span>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="e.g., 5 days"
                          {...register(`medications.${index}.duration`)}
                          className={errors.medications?.[index]?.duration ? 'error' : ''}
                        />
                        {errors.medications?.[index]?.duration && (
                          <span className="error-message">{errors.medications[index]?.duration?.message}</span>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="e.g., After meals"
                          {...register(`medications.${index}.instructions`)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="btn-remove"
                          title="Remove medication"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FOOTER: Action Buttons */}
        <footer className="form-footer">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-save"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Visit'}
          </button>
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            className="btn-save-print"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save & Print Prescription'}
          </button>
        </footer>
      </form>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <ConfirmDialog
          isOpen={showCancelDialog}
          title="Discard Changes?"
          message="You have unsaved changes. Are you sure you want to cancel?"
          onConfirm={handleConfirmCancel}
          onCancel={() => setShowCancelDialog(false)}
          confirmText="Discard"
          cancelText="Keep Editing"
        />
      )}

      {/* Draft Resume Dialog */}
      {showDraftDialog && (
        <ConfirmDialog
          isOpen={showDraftDialog}
          title="Resume Draft?"
          message="You have an unsaved draft. Would you like to resume where you left off?"
          onConfirm={handleLoadDraft}
          onCancel={handleDiscardDraft}
          confirmText="Resume Draft"
          cancelText="Start Fresh"
        />
      )}
    </div>
  );
};
