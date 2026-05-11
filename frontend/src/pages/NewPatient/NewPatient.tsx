import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PatientForm } from '../../components/PatientForm';
import '../PatientList.scss';
import './NewPatient.scss';

export const NewPatient: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    // Invalidate patients query to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['patients'] });
    navigate('/patients');
  };

  return (
    <div className="patient-list-layout">
      {/* Header */}
      <header className="patient-list-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">Patient Management System</h1>
            <p className="header-subtitle">Add New Patient</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="new-patient-content">
        <PatientForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};
