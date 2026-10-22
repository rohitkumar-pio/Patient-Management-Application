import React, { useEffect, useId, useRef } from 'react';
import { VitalChip, formatVisitDate } from './VisitCard';
import { getVitalStatus, VITAL_STATUS_LABELS } from '../lib/vitals';
import type { Visit } from '../types';
import './VisitDetailModal.scss';

interface VisitDetailModalProps {
  visit: Visit | null;
  patientName?: string;
  onClose: () => void;
  onPrintPrescription: (visitId: string) => void;
}

const statusText = (status: ReturnType<typeof getVitalStatus>) => (status ? VITAL_STATUS_LABELS[status] : 'Not recorded');

/** Full details of one visit: vitals, complaints, diagnosis and medications */
export const VisitDetailModal: React.FC<VisitDetailModalProps> = ({ visit, patientName, onClose, onPrintPrescription }) => {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!visit) return;
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visit, onClose]);

  if (!visit) return null;

  const date = formatVisitDate(visit.visitDate);
  const medications = visit.medications ?? [];

  return (
    <div className="visit-detail-overlay" onClick={onClose}>
      <div
        className="visit-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="visit-detail-header">
          <div>
            <h2 id={titleId}>Visit on {date.full}</h2>
            <p className="visit-detail-subtitle">
              {date.time}
              {patientName && ` · ${patientName}`}
            </p>
          </div>
          <button ref={closeRef} type="button" className="visit-detail-close" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </header>

        <section className="visit-detail-section" aria-labelledby={`${titleId}-vitals`}>
          <h3 id={`${titleId}-vitals`}>Vitals</h3>
          <dl className="visit-detail-vitals">
            <div>
              <dt>Temperature</dt>
              <dd>
                <VitalChip type="temperature" label="" value={visit.temperature} unit="°C" />
                <span className="vital-status-text">{statusText(getVitalStatus('temperature', visit.temperature))}</span>
              </dd>
            </div>
            <div>
              <dt>Blood pressure</dt>
              <dd>
                <VitalChip type="bp" label="" value={visit.bloodPressure} unit=" mmHg" />
                <span className="vital-status-text">{statusText(getVitalStatus('bp', visit.bloodPressure))}</span>
              </dd>
            </div>
            <div>
              <dt>Pulse</dt>
              <dd>
                <VitalChip type="pulse" label="" value={visit.pulse} unit=" bpm" />
                <span className="vital-status-text">{statusText(getVitalStatus('pulse', visit.pulse))}</span>
              </dd>
            </div>
          </dl>
        </section>

        <section className="visit-detail-section">
          <h3>Complaints</h3>
          <p className="visit-detail-text">{visit.complaints}</p>
        </section>

        <section className="visit-detail-section">
          <h3>Diagnosis</h3>
          <p className="visit-detail-text">{visit.diagnosis || <span className="visit-detail-muted">Not recorded</span>}</p>
        </section>

        <section className="visit-detail-section">
          <h3>Medications ({medications.length})</h3>
          {medications.length > 0 ? (
            <div className="visit-detail-table-wrap">
              <table className="visit-detail-table">
                <thead>
                  <tr>
                    <th scope="col">Medication</th>
                    <th scope="col">Dosage</th>
                    <th scope="col">Frequency</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med) => (
                    <tr key={med.id}>
                      <td>{med.name}</td>
                      <td>{med.dosage}</td>
                      <td>{med.frequency}</td>
                      <td>{med.duration}</td>
                      <td>{med.instructions || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="visit-detail-muted">No medications prescribed.</p>
          )}
        </section>

        <footer className="visit-detail-actions">
          <button type="button" className="visit-detail-btn secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="visit-detail-btn primary" onClick={() => onPrintPrescription(visit.id)}>
            🖨️ Print Prescription
          </button>
        </footer>
      </div>
    </div>
  );
};

export default VisitDetailModal;
