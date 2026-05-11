import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/api';
import type { Patient } from '../types';
import './PatientForm.scss';

// Zod validation schema
const patientFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  dateOfBirth: z.string().optional(),
  age: z.string().optional().refine((val) => {
    if (!val) return true; // Optional
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 0 && num <= 150;
  }, {
    message: 'Age must be a number between 0 and 150'
  }),
  gender: z.enum(['Male', 'Female', 'Other'], {
    message: 'Please select a gender',
  }),
  phone: z.string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone must not exceed 15 digits')
    .regex(/^\d+$/, 'Phone must contain only digits'),
  address: z.string().max(500, 'Address must not exceed 500 characters').optional(),
}).refine((data) => {
  // Either age or dateOfBirth must be provided
  const hasAge = data.age && data.age.trim() !== '';
  const hasDob = data.dateOfBirth && data.dateOfBirth.trim() !== '';
  return hasAge || hasDob;
}, {
  message: 'Either age or date of birth is required',
  path: ['age'],
});

type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  patient?: Patient;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ 
  patient, 
  onSuccess, 
  onCancel 
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const isEditMode = !!patient;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patient ? {
      name: patient.name,
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
      age: patient.age?.toString() || '',
      gender: patient.gender as 'Male' | 'Female' | 'Other',
      phone: patient.phone,
      address: patient.address || '',
    } : {
      gender: 'Male',
      age: '',
    },
  });

  const dateOfBirth = watch('dateOfBirth');

  // Auto-calculate age from date of birth
  useEffect(() => {
    if (dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age >= 0 && age <= 150) {
        setValue('age', age.toString());
      }
    }
  }, [dateOfBirth, setValue]);

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const payload = {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined,
        age: data.age ? parseInt(data.age, 10) : undefined,
      };

      if (isEditMode && patient) {
        // Update existing patient
        await apiClient.put(`/patients/${patient.id}`, payload);
        showToast('Patient updated successfully', 'success');
      } else {
        // Create new patient
        await apiClient.post('/patients', payload);
        showToast('Patient created successfully', 'success');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/patients');
      }
    } catch (error: any) {
      console.error('Error saving patient:', error);
      
      // Handle duplicate phone error
      if (error.response?.status === 409) {
        setServerError('A patient with this phone number already exists');
      } else if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('Failed to save patient. Please try again.');
      }
      
      showToast(serverError || 'Failed to save patient', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/patients');
    }
  };

  return (
    <div className="patient-form-container">
      <form onSubmit={handleSubmit(onSubmit)} className="patient-form">
        <div className="form-header">
          <h2>{isEditMode ? 'Edit Patient' : 'Add New Patient'}</h2>
        </div>

        {serverError && (
          <div className="error-alert">
            <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        <div className="form-grid">
          {/* Name Field */}
          <div className="form-group full-width">
            <label htmlFor="name" className="form-label">
              Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter patient name"
            />
            {errors.name && (
              <p className="error-message">{errors.name.message}</p>
            )}
          </div>

          {/* Date of Birth Field */}
          <div className="form-group">
            <label htmlFor="dateOfBirth" className="form-label">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              {...register('dateOfBirth')}
              className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.dateOfBirth && (
              <p className="error-message">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Age Field */}
          <div className="form-group">
            <label htmlFor="age" className="form-label">
              Age {!dateOfBirth && <span className="required">*</span>}
            </label>
            <input
              id="age"
              type="number"
              {...register('age')}
              className={`form-input ${errors.age ? 'error' : ''}`}
              placeholder="Auto-calculated or enter manually"
              min="0"
              max="150"
            />
            {errors.age && (
              <p className="error-message">{errors.age.message}</p>
            )}
            {dateOfBirth && (
              <p className="help-text">Auto-calculated from date of birth</p>
            )}
          </div>

          {/* Gender Field */}
          <div className="form-group">
            <label htmlFor="gender" className="form-label">
              Gender <span className="required">*</span>
            </label>
            <select
              id="gender"
              {...register('gender')}
              className={`form-select ${errors.gender ? 'error' : ''}`}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="error-message">{errors.gender.message}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone <span className="required">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="10-15 digits"
              maxLength={15}
            />
            {errors.phone && (
              <p className="error-message">{errors.phone.message}</p>
            )}
          </div>

          {/* Address Field */}
          <div className="form-group full-width">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <textarea
              id="address"
              {...register('address')}
              className={`form-textarea ${errors.address ? 'error' : ''}`}
              rows={3}
              placeholder="Enter patient address"
            />
            {errors.address && (
              <p className="error-message">{errors.address.message}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{isEditMode ? 'Update Patient' : 'Create Patient'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Toast notification helper
function showToast(message: string, type: 'success' | 'error' = 'success') {
  const event = new CustomEvent('toast', { detail: { message, type } });
  window.dispatchEvent(event);
}
