import React from 'react';
import { getVitalStatus, VITAL_STATUS_LABELS, type VitalStatus, type VitalType } from '../lib/vitals';
import type { Visit } from '../types';
import './VisitCard.scss';

/** Row height used by the virtualized history list; the card is laid out to fit it exactly */
export const VISIT_CARD_HEIGHT = 164;

interface VitalChipProps {
  type: VitalType;
  label: string;
  value: string | number | null | undefined;
  unit?: string;
}

export const VitalChip: React.FC<VitalChipProps> = ({ type, label, value, unit = '' }) => {
  const hasValue = value !== null && value !== undefined && value !== '';
  const status: VitalStatus = getVitalStatus(type, value);
  const statusLabel = status ? VITAL_STATUS_LABELS[status] : 'Not recorded';

  return (
    <span className={`vital-chip ${status || 'unknown'}`} title={`${label}: ${statusLabel}`}>
      <span className="vital-chip-label">{label}</span>
      <span className="vital-chip-value">{hasValue ? `${value}${unit}` : '—'}</span>
      <span className="visually-hidden"> ({statusLabel})</span>
    </span>
  );
};

export const formatVisitDate = (visitDate: string) => {
  const date = new Date(visitDate);
  return {
    day: date.toLocaleDateString([], { day: 'numeric' }),
    monthYear: date.toLocaleDateString([], { month: 'short', year: 'numeric' }),
    weekday: date.toLocaleDateString([], { weekday: 'short' }),
    time: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    full: date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
};

interface VisitCardProps {
  visit: Visit;
  onViewDetails: (visit: Visit) => void;
}

/** Compact, fixed-height visit summary for the history timeline */
export const VisitCard: React.FC<VisitCardProps> = ({ visit, onViewDetails }) => {
  const date = formatVisitDate(visit.visitDate);
  const medicationCount = visit.medications?.length ?? 0;

  return (
    <article className="visit-card-compact" aria-label={`Visit on ${date.full}`}>
      <div className="visit-card-date" aria-hidden="true">
        <span className="visit-card-day">{date.day}</span>
        <span className="visit-card-month">{date.monthYear}</span>
        <span className="visit-card-time">
          {date.weekday} · {date.time}
        </span>
      </div>

      <div className="visit-card-body">
        <div className="visit-card-vitals">
          <VitalChip type="temperature" label="Temp" value={visit.temperature} unit="°C" />
          <VitalChip type="bp" label="BP" value={visit.bloodPressure} />
          <VitalChip type="pulse" label="Pulse" value={visit.pulse} unit=" bpm" />
        </div>
        <p className="visit-card-line" title={visit.complaints}>
          <span className="visit-card-line-label">Complaints:</span> {visit.complaints}
        </p>
        <p className="visit-card-line" title={visit.diagnosis || undefined}>
          <span className="visit-card-line-label">Diagnosis:</span>{' '}
          {visit.diagnosis || <span className="visit-card-muted">Not recorded</span>}
        </p>
      </div>

      <div className="visit-card-footer">
        <span className="visit-card-meds">
          💊 {medicationCount} {medicationCount === 1 ? 'medication' : 'medications'}
        </span>
        <button type="button" className="visit-card-details-btn" onClick={() => onViewDetails(visit)}>
          View Details
        </button>
      </div>
    </article>
  );
};

export default VisitCard;
