import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../lib/api';
import {
  appointmentsByDateKey,
  fetchAppointmentsByDate,
  formatLongDate,
  isValidDateString,
  shiftDate,
  toDateString,
} from '../../lib/appointments';
import { AppointmentCard } from '../../components/AppointmentCard';
import { AddAppointmentModal } from '../../components/AddAppointmentModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { showToast } from '../../components/Toast';
import { useAuthStore } from '../../stores/authStore';
import { Appointment, AppointmentStatus } from '../../types';
import './AppointmentsPage.scss';

const STATUS_SUCCESS_MESSAGES: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Appointment set back to scheduled',
  COMPLETED: 'Appointment marked as completed',
  CANCELLED: 'Appointment cancelled',
  NO_SHOW: 'Appointment marked as no-show',
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', route: '/dashboard' },
  { id: 'patients', label: 'Patients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', route: '/patients' },
  { id: 'appointments', label: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', route: '/appointments' },
  { id: 'consultations', label: 'Consultations', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/consultations' },
  { id: 'export', label: 'Export Data', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', route: '/export' },
  { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/reports' },
];

export const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  // Selected date lives in the URL so refresh/back keeps it; defaults to today
  const today = toDateString(new Date());
  const dateParam = searchParams.get('date');
  const selectedDate = isValidDateString(dateParam) ? dateParam : today;
  const queryKey = appointmentsByDateKey(selectedDate);

  const setSelectedDate = (value: string) => {
    if (!isValidDateString(value)) return;
    setSearchParams(value === today ? {} : { date: value });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const { data: appointments = [], isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () => fetchAppointmentsByDate(selectedDate),
  });

  // Optimistic status update so the card changes immediately; rolled back on failure
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) =>
      apiClient.patch(`/appointments/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Appointment[]>(queryKey);
      queryClient.setQueryData<Appointment[]>(queryKey, (old = []) =>
        old.map((a) => (a.id === id ? { ...a, status } : a))
      );
      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      showToast(err.response?.data?.message || 'Failed to update appointment status', 'error');
    },
    onSuccess: (_res, { status }) => {
      showToast(STATUS_SUCCESS_MESSAGES[status], 'success');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/appointments/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Appointment[]>(queryKey);
      queryClient.setQueryData<Appointment[]>(queryKey, (old = []) => old.filter((a) => a.id !== id));
      return { previous };
    },
    onError: (err: any, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      showToast(err.response?.data?.message || 'Failed to delete appointment', 'error');
    },
    onSuccess: () => {
      showToast('Appointment deleted', 'success');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const handleStatusChange = (appointment: Appointment, status: AppointmentStatus) => {
    statusMutation.mutate({ id: appointment.id, status });
  };

  const handleConfirmDelete = () => {
    if (appointmentToDelete) deleteMutation.mutate(appointmentToDelete.id);
    setAppointmentToDelete(null);
  };

  const counts = appointments.reduce(
    (acc, a) => ({ ...acc, [a.status]: acc[a.status] + 1 }),
    { SCHEDULED: 0, COMPLETED: 0, CANCELLED: 0, NO_SHOW: 0 } as Record<AppointmentStatus, number>
  );

  const selectedDateLabel = formatLongDate(selectedDate);

  return (
    <div className="appointments-layout">
      {/* Header */}
      <header className="appointments-header">
        <div className="header-title">Patient Management System</div>
        <div className="header-right">
          <span className="welcome-text">Welcome, Dr. {user?.name || 'John Admin'}</span>
          <button onClick={handleLogout} className="header-logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="appointments-main">
        {/* Sidebar */}
        <aside className="appointments-sidebar">
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${item.id === 'appointments' ? 'active' : ''}`}
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
        <main className="appointments-content">
          <div className="page-header">
            <h1 className="page-title">Appointments</h1>
            <p className="page-description">Daily schedule and patient queue</p>
          </div>

          {/* Date navigation and add button */}
          <div className="appointments-toolbar">
            <div className="date-navigation">
              <button
                type="button"
                className="date-nav-btn"
                onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                aria-label="Previous day"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              <input
                type="date"
                className="date-input"
                aria-label="Select date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button
                type="button"
                className="date-nav-btn"
                onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                aria-label="Next day"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
              {selectedDate !== today && (
                <button type="button" className="date-today-btn" onClick={() => setSelectedDate(today)}>
                  Today
                </button>
              )}
            </div>
            <button type="button" className="add-appointment-btn" onClick={() => setIsAddOpen(true)}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Appointment
            </button>
          </div>

          <div className="appointments-day-summary">
            <h2 className="selected-date-label">
              {selectedDateLabel}
              {selectedDate === today && <span className="today-pill">Today</span>}
            </h2>
            {!isLoading && appointments.length > 0 && (
              <div className="status-counts" aria-label="Status summary">
                <span>{appointments.length} total</span>
                <span className="count-scheduled">{counts.SCHEDULED} scheduled</span>
                <span className="count-completed">{counts.COMPLETED} completed</span>
                <span className="count-cancelled">{counts.CANCELLED} cancelled</span>
                <span className="count-no-show">{counts.NO_SHOW} no-show</span>
              </div>
            )}
          </div>

          {isError && (
            <div className="error-alert" role="alert">
              <div className="error-content">
                <h3 className="error-title">Error loading appointments</h3>
                <p className="error-message">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="appointments-loading" aria-label="Loading appointments">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="appointment-skeleton" />
              ))}
            </div>
          ) : !isError && appointments.length === 0 ? (
            <div className="appointments-empty">
              <h3 className="empty-title">No appointments</h3>
              <p className="empty-description">Nothing scheduled for this day.</p>
              <button type="button" className="empty-action" onClick={() => setIsAddOpen(true)}>
                Schedule one
              </button>
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onStatusChange={handleStatusChange}
                  onDelete={setAppointmentToDelete}
                  onViewPatient={(patientId) => navigate(`/patients/${patientId}`)}
                  isUpdating={
                    (statusMutation.isPending && statusMutation.variables?.id === appointment.id) ||
                    (deleteMutation.isPending && deleteMutation.variables === appointment.id)
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <AddAppointmentModal
        isOpen={isAddOpen}
        defaultDate={selectedDate}
        onClose={() => setIsAddOpen(false)}
        // Show the day the appointment was booked on, so it appears in the list
        onCreated={setSelectedDate}
      />

      <ConfirmDialog
        isOpen={!!appointmentToDelete}
        title="Delete Appointment"
        message={`Delete the appointment for ${appointmentToDelete?.patient.name ?? 'this patient'}? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Keep"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setAppointmentToDelete(null)}
      />
    </div>
  );
};

export default AppointmentsPage;
