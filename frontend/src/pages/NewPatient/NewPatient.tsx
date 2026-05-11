import React from 'react';
import { PatientForm } from '../../components/PatientForm';
import '../PatientList.scss';
import './NewPatient.scss';

export const NewPatient: React.FC = () => {
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
        <PatientForm />
      </div>
    </div>
  );
};
