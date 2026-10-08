import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { DailyQueue } from '../components/DailyQueue';
import { AddAppointmentModal } from '../components/AddAppointmentModal';
import { useUpdateAppointmentStatus } from '../hooks/useAppointmentStatus';
import { fetchTodayAppointments, todayAppointmentsKey } from '../lib/appointments';
import type { Appointment, AppointmentStatus } from '../types';
import './Dashboard.scss';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', route: '/dashboard' },
  { id: 'patients', label: 'Patients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', route: '/patients' },
  { id: 'appointments', label: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', route: '/appointments' },
  { id: 'consultations', label: 'Consultations', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/consultations' },
  { id: 'export', label: 'Export Data', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', route: '/export' },
  { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/reports' },
];

const getGreeting = (hour: number) => {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const { data: appointments = [], isLoading, isError } = useQuery({
    queryKey: todayAppointmentsKey,
    queryFn: fetchTodayAppointments,
    // Keep the queue current while the dashboard stays open (e.g. bookings made at reception)
    refetchInterval: 60_000,
  });

  const statusMutation = useUpdateAppointmentStatus(todayAppointmentsKey);

  const countByStatus = (status: AppointmentStatus) => appointments.filter((a) => a.status === status).length;
  const cancelledCount = countByStatus('CANCELLED');

  const handleStartConsultation = (appointment: Appointment) => {
    navigate(`/visits/new?patientId=${appointment.patientId}`);
  };

  const now = new Date();
  const doctorName = user?.name || 'John Admin';

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title">Patient Management System</div>
        <div className="header-right">
          <span className="welcome-text">Welcome, Dr. {doctorName}</span>
          <button onClick={handleLogout} className="header-logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-main">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${item.id === 'dashboard' ? 'active' : ''}`}
                onClick={() => navigate(item.route)}
              >
                <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="sidebar-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content">
          {/* Welcome */}
          <div className="dashboard-welcome">
            <h1 className="welcome-title">
              {getGreeting(now.getHours())}, Dr. {doctorName}
            </h1>
            <p className="welcome-date">
              {now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-section" aria-label="Today's summary">
            <div className="stat-card">
              <div className="stat-number">{isLoading ? '–' : appointments.length}</div>
              <div className="stat-label">Total Appointments</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{isLoading ? '–' : countByStatus('COMPLETED')}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card stat-warning">
              <div className="stat-number">{isLoading ? '–' : countByStatus('SCHEDULED')}</div>
              <div className="stat-label">Waiting</div>
            </div>
            <div className="stat-card stat-danger">
              <div className="stat-number">{isLoading ? '–' : countByStatus('NO_SHOW')}</div>
              <div className="stat-label">No-show</div>
            </div>
          </div>

          {/* Today's Appointments */}
          <section className="appointments-section" aria-labelledby="todays-appointments-title">
            <div className="section-header">
              <div>
                <h2 className="section-title" id="todays-appointments-title">
                  Today's Appointments
                </h2>
                {!isLoading && !isError && (
                  <p className="section-subtitle">
                    {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} today
                    {cancelledCount > 0 && ` (${cancelledCount} cancelled)`}
                  </p>
                )}
              </div>
              <button type="button" className="view-all-btn" onClick={() => navigate('/appointments')}>
                View All Appointments
              </button>
            </div>

            {isError ? (
              <p className="section-error" role="alert">
                Couldn't load today's appointments. Please try again.
              </p>
            ) : (
              <DailyQueue
                appointments={appointments}
                isLoading={isLoading}
                updatingId={statusMutation.isPending ? statusMutation.variables?.id : null}
                onStartConsultation={handleStartConsultation}
                onStatusChange={(appointment, status) => statusMutation.mutate({ id: appointment.id, status })}
                onViewPatient={(patientId) => navigate(`/patients/${patientId}`)}
              />
            )}
          </section>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={() => navigate('/patients')}>
                Search Patient
              </button>
              <button className="quick-action-btn" onClick={() => setIsScheduleOpen(true)}>
                Schedule Appointment
              </button>
            </div>
          </div>
        </main>
      </div>

      <AddAppointmentModal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
    </div>
  );
};
