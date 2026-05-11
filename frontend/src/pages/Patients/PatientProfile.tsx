import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { ConfirmDialog } from '../../components';
import { showToast } from '../../components/Toast';
import { Patient } from '../../types';
import './PatientProfile.scss';

type TabType = 'overview' | 'visits' | 'appointments';

export const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch patient data
  const { data: patient, isLoading, error } = useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await apiClient.get(`/patients/${id}`);
      return response.data.data; // Extract data from {success, data} response
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEdit = () => {
    navigate(`/patients/${id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/patients/${id}`);
      showToast('Patient deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate('/patients');
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      showToast(error.response?.data?.message || 'Failed to delete patient', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleNewVisit = () => {
    navigate(`/visits/new?patientId=${id}`);
  };

  const handleScheduleAppointment = () => {
    navigate(`/appointments/new?patientId=${id}`);
  };

  if (isLoading) {
    return (
      <div className="patient-profile-layout">
        <header className="patient-profile-header">
          <div className="header-content">
            <h1>Patient Management System</h1>
            <div className="header-user">
              <span>Welcome, {user?.name || 'Doctor'}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </header>

        <aside className="patient-profile-sidebar">
          <nav>
            <a href="/dashboard" className="nav-item">
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </a>
            <a href="/patients" className="nav-item active">
              <span className="nav-icon">👥</span>
              <span>Patients</span>
            </a>
            <a href="/appointments" className="nav-item">
              <span className="nav-icon">📅</span>
              <span>Appointments</span>
            </a>
            <a href="/visits" className="nav-item">
              <span className="nav-icon">🩺</span>
              <span>Consultations</span>
            </a>
            <a href="/export" className="nav-item">
              <span className="nav-icon">📤</span>
              <span>Export Data</span>
            </a>
            <a href="/reports" className="nav-item">
              <span className="nav-icon">📈</span>
              <span>Reports</span>
            </a>
          </nav>
        </aside>

        <main className="patient-profile-content">
          <div className="loading-skeleton">
            <div className="skeleton-header"></div>
            <div className="skeleton-card"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="patient-profile-layout">
        <main className="patient-profile-content">
          <div className="error-message">
            <p>Failed to load patient data</p>
            <button onClick={() => navigate('/patients')} className="btn-primary">
              Back to Patients
            </button>
          </div>
        </main>
      </div>
    );
  }

  const age = patient.age || patient.visitCount || patient._count?.visits || 
    (patient.dateOfBirth 
      ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 'N/A');

  const visitCount = patient.visitCount || patient._count?.visits || 0;

  return (
    <div className="patient-profile-layout">
      <header className="patient-profile-header">
        <div className="header-content">
          <h1>Patient Management System</h1>
          <div className="header-user">
            <span>Welcome, {user?.name || 'Doctor'}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <aside className="patient-profile-sidebar">
        <nav>
          <a href="/dashboard" className="nav-item">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="/patients" className="nav-item active">
            <span className="nav-icon">👥</span>
            <span>Patients</span>
          </a>
          <a href="/appointments" className="nav-item">
            <span className="nav-icon">📅</span>
            <span>Appointments</span>
          </a>
          <a href="/visits" className="nav-item">
            <span className="nav-icon">🩺</span>
            <span>Consultations</span>
          </a>
          <a href="/export" className="nav-item">
            <span className="nav-icon">📤</span>
            <span>Export Data</span>
          </a>
          <a href="/reports" className="nav-item">
            <span className="nav-icon">📈</span>
            <span>Reports</span>
          </a>
        </nav>
      </aside>

      <main className="patient-profile-content">
        <div className="profile-container">
          {/* Back button */}
          <div className="profile-navigation">
            <button onClick={() => navigate('/patients')} className="back-btn">
              ← Back to Patients
            </button>
          </div>

          {/* Patient Details Card */}
          <div className="patient-details-card">
            <div className="patient-header">
              <div className="patient-info">
                <h2>{patient.name}</h2>
                <div className="patient-meta">
                  <span className="meta-item">
                    <strong>Age:</strong> {age} years
                  </span>
                  <span className="meta-item">
                    <strong>Gender:</strong> {patient.gender}
                  </span>
                  <span className="meta-item">
                    <strong>Phone:</strong> {patient.phone}
                  </span>
                </div>
              </div>
              <div className="patient-actions">
                <button onClick={handleEdit} className="btn-edit">
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => setShowDeleteDialog(true)} 
                  className="btn-delete"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>

            {patient.address && (
              <div className="patient-address">
                <strong>Address:</strong> {patient.address}
              </div>
            )}

            <div className="patient-stats">
              <div className="stat-item">
                <div className="stat-value">{visitCount}</div>
                <div className="stat-label">Total Visits</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {patient.lastVisitDate 
                    ? new Date(patient.lastVisitDate).toLocaleDateString() 
                    : 'No visits'}
                </div>
                <div className="stat-label">Last Visit</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </div>
                <div className="stat-label">Registered</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <button onClick={handleNewVisit} className="action-btn action-primary">
                🩺 New Visit
              </button>
              <button onClick={handleScheduleAppointment} className="action-btn action-secondary">
                📅 Schedule Appointment
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tabs-container">
            <div className="tabs-header">
              <button
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`tab ${activeTab === 'visits' ? 'active' : ''}`}
                onClick={() => setActiveTab('visits')}
              >
                Visits
              </button>
              <button
                className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                Appointments
              </button>
            </div>

            <div className="tabs-content">
              {activeTab === 'overview' && (
                <div className="tab-panel">
                  <h3>Patient Overview</h3>
                  <p>Complete patient summary and recent activity will be displayed here.</p>
                  <div className="overview-grid">
                    <div className="overview-card">
                      <h4>Contact Information</h4>
                      <p><strong>Phone:</strong> {patient.phone}</p>
                      {patient.address && <p><strong>Address:</strong> {patient.address}</p>}
                    </div>
                    <div className="overview-card">
                      <h4>Demographics</h4>
                      <p><strong>Age:</strong> {age} years</p>
                      <p><strong>Gender:</strong> {patient.gender}</p>
                      {patient.dateOfBirth && (
                        <p><strong>Date of Birth:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'visits' && (
                <div className="tab-panel">
                  <h3>Visit History</h3>
                  <p>Patient visit history will be implemented in Phase 1F.</p>
                  <button onClick={() => navigate(`/patients/${id}/history`)} className="btn-secondary">
                    View Full History
                  </button>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="tab-panel">
                  <h3>Appointments</h3>
                  <p>Appointment list will be implemented in Phase 1E.</p>
                  <button onClick={() => navigate('/appointments')} className="btn-secondary">
                    View All Appointments
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Patient"
        message={`Are you sure you want to delete ${patient.name}? This action cannot be undone and will delete all associated visits and appointments.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        variant="danger"
      />
    </div>
  );
};

export default PatientProfile;
