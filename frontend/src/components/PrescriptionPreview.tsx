import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../lib/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './PrescriptionPreview.scss';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface Visit {
  id: string;
  visitDate: string;
  complaints: string;
  diagnosis: string;
  temperature: number;
  bloodPressure: string;
  pulse: number;
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    address?: string;
  };
  medications: Medication[];
}

interface PrescriptionPreviewProps {
  visitId: string;
  onClose: () => void;
}

export const PrescriptionPreview: React.FC<PrescriptionPreviewProps> = ({
  visitId,
  onClose,
}) => {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'preview' | 'pdf'>('preview');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVisitData();
  }, [visitId]);

  const fetchVisitData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/visits/${visitId}`);
      setVisit(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch visit data');
      console.error('Error fetching visit:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateClientSidePDF = (): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    if (!visit) throw new Error('No visit data');

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPTION', pageWidth / 2, 20, { align: 'center' });

    // Clinic Info (placeholder - can be customized)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Medical Clinic Name', pageWidth / 2, 30, { align: 'center' });
    doc.text('123 Medical Street, City, State 12345', pageWidth / 2, 35, { align: 'center' });
    doc.text('Phone: (555) 123-4567', pageWidth / 2, 40, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(15, 45, pageWidth - 15, 45);

    // Date
    doc.setFontSize(10);
    const visitDate = new Date(visit.visitDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Date: ${visitDate}`, pageWidth - 15, 55, { align: 'right' });

    // Patient Information
    let yPos = 65;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 15, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    doc.text(`Name: ${visit.patient.name}`, 15, yPos);
    yPos += 6;
    doc.text(`Age / Gender: ${visit.patient.age} years / ${visit.patient.gender}`, 15, yPos);
    yPos += 6;
    doc.text(`Phone: ${visit.patient.phone}`, 15, yPos);
    if (visit.patient.address) {
      yPos += 6;
      doc.text(`Address: ${visit.patient.address}`, 15, yPos);
    }

    // Vitals
    yPos += 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Vitals', 15, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    doc.text(`Temperature: ${visit.temperature}°C`, 15, yPos);
    doc.text(`BP: ${visit.bloodPressure} mmHg`, 80, yPos);
    doc.text(`Pulse: ${visit.pulse} bpm`, 140, yPos);

    // Complaints
    yPos += 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Complaints', 15, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    const complaintsLines = doc.splitTextToSize(visit.complaints, pageWidth - 30);
    doc.text(complaintsLines, 15, yPos);
    yPos += complaintsLines.length * 5;

    // Diagnosis
    yPos += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis', 15, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    const diagnosisLines = doc.splitTextToSize(visit.diagnosis || 'N/A', pageWidth - 30);
    doc.text(diagnosisLines, 15, yPos);
    yPos += diagnosisLines.length * 5 + 10;

    // Medications Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Medications', 15, yPos);
    yPos += 5;

    // Use autoTable for medications
    const medicationData = visit.medications.map((med) => [
      med.name,
      med.dosage,
      med.frequency,
      med.duration,
      med.instructions || '-',
    ]);

    (doc as any).autoTable({
      startY: yPos,
      head: [['Medication', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
      body: medicationData,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 'auto' },
      },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Doctor Signature: ___________________', 15, finalY);
    doc.text('Dr. Name', 15, finalY + 10);

    return doc;
  };

  const handleDownloadPDF = () => {
    try {
      const doc = generateClientSidePDF();
      doc.save(`prescription-${visit?.patient.name}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewPDF = async () => {
    try {
      setMode('pdf');
      const response = await apiClient.get(`/visits/${visitId}/prescription`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Error loading PDF from server:', err);
      alert('Failed to load PDF from server');
    }
  };

  if (loading) {
    return (
      <div className="prescription-preview-modal">
        <div className="prescription-preview-overlay" onClick={onClose} />
        <div className="prescription-preview-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading prescription...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="prescription-preview-modal">
        <div className="prescription-preview-overlay" onClick={onClose} />
        <div className="prescription-preview-content">
          <div className="error-state">
            <p>{error || 'Failed to load visit data'}</p>
            <button onClick={onClose} className="btn-close">Close</button>
          </div>
        </div>
      </div>
    );
  }

  const visitDate = new Date(visit.visitDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="prescription-preview-modal">
      <div className="prescription-preview-overlay" onClick={onClose} />
      <div className="prescription-preview-content">
        <div className="prescription-header no-print">
          <h2>Prescription Preview</h2>
          <div className="mode-toggle">
            <button
              className={mode === 'preview' ? 'active' : ''}
              onClick={() => setMode('preview')}
            >
              Preview
            </button>
            <button
              className={mode === 'pdf' ? 'active' : ''}
              onClick={handleViewPDF}
            >
              PDF View
            </button>
          </div>
          <button onClick={onClose} className="btn-close-header">&times;</button>
        </div>

        {mode === 'preview' ? (
          <div className="prescription-body" ref={printRef}>
            <div className="prescription-document">
              {/* Header */}
              <div className="doc-header">
                <h1>PRESCRIPTION</h1>
                <div className="clinic-info">
                  <p className="clinic-name">Medical Clinic Name</p>
                  <p>123 Medical Street, City, State 12345</p>
                  <p>Phone: (555) 123-4567</p>
                </div>
              </div>

              <hr />

              <div className="doc-date">
                <strong>Date:</strong> {visitDate}
              </div>

              {/* Patient Info */}
              <div className="doc-section">
                <h3>Patient Information</h3>
                <div className="info-grid">
                  <div><strong>Name:</strong> {visit.patient.name}</div>
                  <div><strong>Age:</strong> {visit.patient.age} years</div>
                  <div><strong>Gender:</strong> {visit.patient.gender}</div>
                  <div><strong>Phone:</strong> {visit.patient.phone}</div>
                  {visit.patient.address && (
                    <div className="full-width"><strong>Address:</strong> {visit.patient.address}</div>
                  )}
                </div>
              </div>

              {/* Vitals */}
              <div className="doc-section">
                <h3>Vitals</h3>
                <div className="vitals-grid">
                  <div><strong>Temperature:</strong> {visit.temperature}°C</div>
                  <div><strong>Blood Pressure:</strong> {visit.bloodPressure} mmHg</div>
                  <div><strong>Pulse:</strong> {visit.pulse} bpm</div>
                </div>
              </div>

              {/* Complaints */}
              <div className="doc-section">
                <h3>Complaints</h3>
                <p className="doc-text">{visit.complaints}</p>
              </div>

              {/* Diagnosis */}
              <div className="doc-section">
                <h3>Diagnosis</h3>
                <p className="doc-text">{visit.diagnosis || 'N/A'}</p>
              </div>

              {/* Medications */}
              <div className="doc-section">
                <h3>Medications</h3>
                {visit.medications.length > 0 ? (
                  <table className="medications-table">
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visit.medications.map((med) => (
                        <tr key={med.id}>
                          <td>{med.name}</td>
                          <td>{med.dosage}</td>
                          <td>{med.frequency}</td>
                          <td>{med.duration}</td>
                          <td>{med.instructions || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No medications prescribed</p>
                )}
              </div>

              {/* Footer */}
              <div className="doc-footer">
                <div className="signature-line">
                  <p>Doctor Signature: ___________________</p>
                  <p>Dr. Name</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pdf-viewer">
            {pdfUrl ? (
              <iframe src={pdfUrl} title="Prescription PDF" />
            ) : (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading PDF...</p>
              </div>
            )}
          </div>
        )}

        <div className="prescription-actions no-print">
          <button onClick={handlePrint} className="btn-primary">
            <span>🖨️</span> Print
          </button>
          <button onClick={handleDownloadPDF} className="btn-secondary">
            <span>📥</span> Download PDF
          </button>
          <button onClick={onClose} className="btn-cancel">Close</button>
        </div>
      </div>
    </div>
  );
};
