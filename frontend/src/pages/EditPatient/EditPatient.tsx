import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PatientForm } from '../../components/PatientForm';
import apiClient from '../../lib/api';
import type { Patient } from '../../types';
import '../PatientList.scss';
import '../NewPatient/NewPatient.scss';

export const EditPatient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading, error } = useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await apiClient.get(`/patients/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="patient-list-layout">
        <header className="patient-list-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="header-title">Patient Management System</h1>
              <p className="header-subtitle">Edit Patient</p>
            </div>
          </div>
        </header>

        <div className="new-patient-content">
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Loading patient data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="patient-list-layout">
        <header className="patient-list-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="header-title">Patient Management System</h1>
              <p className="header-subtitle">Edit Patient</p>
            </div>
          </div>
        </header>

        <div className="new-patient-content">
          <div className="error-container">
            <svg className="error-icon-large" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3>Patient Not Found</h3>
            <p>The patient you're trying to edit could not be found.</p>
            <button onClick={() => navigate('/patients')} className="btn-primary">
              Back to Patient List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-list-layout">
      <header className="patient-list-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">Patient Management System</h1>
            <p className="header-subtitle">Edit Patient - {patient.name}</p>
          </div>
        </div>
      </header>

      <div className="new-patient-content">
        <PatientForm patient={patient} />
      </div>
    </div>
  );
};
