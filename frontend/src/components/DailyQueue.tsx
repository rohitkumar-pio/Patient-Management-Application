import React from 'react';
import { StatusBadge, formatAppointmentTime } from './AppointmentCard';
import type { Appointment, AppointmentStatus } from '../types';
import './DailyQueue.scss';

interface DailyQueueProps {
  appointments: Appointment[];
  isLoading?: boolean;
  /** Id of the appointment whose status is being updated (disables its buttons) */
  updatingId?: string | null;
  onStartConsultation: (appointment: Appointment) => void;
  onStatusChange: (appointment: Appointment, status: AppointmentStatus) => void;
  onViewPatient: (patientId: string) => void;
}

/** Compact list of today's appointments with quick actions */
export const DailyQueue: React.FC<DailyQueueProps> = ({
  appointments,
  isLoading = false,
  updatingId = null,
  onStartConsultation,
  onStatusChange,
  onViewPatient,
}) => {
  if (isLoading) {
    return (
      <div className="daily-queue-loading" aria-label="Loading today's appointments">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="daily-queue-skeleton" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return <p className="daily-queue-empty">No appointments scheduled for today.</p>;
  }

  // Highlight the first patient still waiting
  const nextUpId = appointments.find((a) => a.status === 'SCHEDULED')?.id;

  return (
    <ul className="daily-queue" aria-label="Today's appointments">
      {appointments.map((appointment) => {
        const { patient, status } = appointment;
        const isScheduled = status === 'SCHEDULED';
        const isUpdating = updatingId === appointment.id;

        return (
          <li
            key={appointment.id}
            className={`daily-queue-item status-${status.toLowerCase().replace('_', '-')}`}
            aria-label={`${patient.name}, ${formatAppointmentTime(appointment.appointmentDate)}`}
          >
            <span className="queue-time">{formatAppointmentTime(appointment.appointmentDate)}</span>

            <div className="queue-patient">
              <button
                type="button"
                className="queue-patient-name"
                onClick={() => onViewPatient(patient.id)}
                title="View patient profile"
              >
                {patient.name}
              </button>
              <span className="queue-patient-phone">{patient.phone}</span>
              {appointment.notes && <span className="queue-notes">{appointment.notes}</span>}
            </div>

            <div className="queue-status">
              {appointment.id === nextUpId && <span className="queue-next-pill">Next</span>}
              <StatusBadge status={status} />
            </div>

            <div className="queue-actions">
              {isScheduled ? (
                <>
                  <button
                    type="button"
                    className="queue-btn start"
                    onClick={() => onStartConsultation(appointment)}
                    disabled={isUpdating}
                  >
                    Start Consultation
                  </button>
                  <button
                    type="button"
                    className="queue-btn complete"
                    onClick={() => onStatusChange(appointment, 'COMPLETED')}
                    disabled={isUpdating}
                    aria-label={`Mark ${patient.name} complete`}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="queue-btn no-show"
                    onClick={() => onStatusChange(appointment, 'NO_SHOW')}
                    disabled={isUpdating}
                    aria-label={`Mark ${patient.name} as no-show`}
                  >
                    No-show
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="queue-btn undo"
                  onClick={() => onStatusChange(appointment, 'SCHEDULED')}
                  disabled={isUpdating}
                  aria-label={`Set ${patient.name} back to scheduled`}
                >
                  Undo
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default DailyQueue;
