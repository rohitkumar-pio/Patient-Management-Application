import React from 'react';
import { Appointment, AppointmentStatus } from '../types';
import './AppointmentCard.scss';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
};

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className={`appointment-status-badge status-${status.toLowerCase().replace('_', '-')}`}>
    {STATUS_LABELS[status]}
  </span>
);

/**
 * Appointments created without a specific time are stored at local midnight;
 * show those as date-only.
 */
export const formatAppointmentTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (date.getHours() === 0 && date.getMinutes() === 0) {
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange: (appointment: Appointment, status: AppointmentStatus) => void;
  onDelete: (appointment: Appointment) => void;
  onViewPatient: (patientId: string) => void;
  isUpdating?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onStatusChange,
  onDelete,
  onViewPatient,
  isUpdating = false,
}) => {
  const { patient, status } = appointment;
  const isScheduled = status === 'SCHEDULED';

  // Action buttons must not trigger the card's "view patient" click
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <article
      className={`appointment-card status-${status.toLowerCase().replace('_', '-')}`}
      onClick={() => onViewPatient(patient.id)}
      aria-label={`Appointment for ${patient.name}`}
    >
      <div className="appointment-time">{formatAppointmentTime(appointment.appointmentDate)}</div>

      <div className="appointment-info">
        <div className="appointment-header">
          <button
            type="button"
            className="appointment-patient-name"
            onClick={(e) => handleAction(e, () => onViewPatient(patient.id))}
            title="View patient profile"
          >
            {patient.name}
          </button>
          <StatusBadge status={status} />
        </div>
        <div className="appointment-patient-meta">
          {[patient.age != null ? `${patient.age} yrs` : null, patient.gender, patient.phone]
            .filter(Boolean)
            .join(' • ')}
        </div>
        {appointment.notes && <p className="appointment-notes">{appointment.notes}</p>}
      </div>

      <div className="appointment-actions">
        {isScheduled ? (
          <>
            <button
              type="button"
              className="appointment-action-btn complete"
              disabled={isUpdating}
              onClick={(e) => handleAction(e, () => onStatusChange(appointment, 'COMPLETED'))}
            >
              Mark Complete
            </button>
            <button
              type="button"
              className="appointment-action-btn cancel"
              disabled={isUpdating}
              onClick={(e) => handleAction(e, () => onStatusChange(appointment, 'CANCELLED'))}
            >
              Cancel
            </button>
            <button
              type="button"
              className="appointment-action-btn no-show"
              disabled={isUpdating}
              onClick={(e) => handleAction(e, () => onStatusChange(appointment, 'NO_SHOW'))}
            >
              No-show
            </button>
          </>
        ) : (
          <button
            type="button"
            className="appointment-action-btn reschedule"
            disabled={isUpdating}
            onClick={(e) => handleAction(e, () => onStatusChange(appointment, 'SCHEDULED'))}
            title="Set back to Scheduled"
          >
            Undo
          </button>
        )}
        <button
          type="button"
          className="appointment-action-btn delete"
          disabled={isUpdating}
          onClick={(e) => handleAction(e, () => onDelete(appointment))}
          aria-label={`Delete appointment for ${patient.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
};

export default AppointmentCard;
