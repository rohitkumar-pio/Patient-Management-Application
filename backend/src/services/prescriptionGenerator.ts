import PDFDocument from 'pdfkit';
import { prisma } from '../config/database';

interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email?: string;
}

const defaultClinicInfo: ClinicInfo = {
  name: 'Patient Management Clinic',
  address: '123 Medical Center Drive, Healthcare City, HC 12345',
  phone: '+1 (555) 123-4567',
  email: 'contact@patientclinic.com'
};

/**
 * Generate a prescription PDF for a given visit
 * @param visitId - UUID of the visit
 * @param clinicInfo - Optional clinic information (uses default if not provided)
 * @returns PDF buffer
 */
export async function generatePrescriptionPDF(
  visitId: string,
  clinicInfo: ClinicInfo = defaultClinicInfo
): Promise<Buffer> {
  // Fetch visit with patient and medications
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      medications: true
    }
  });

  if (!visit) {
    throw new Error('Visit not found');
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ===== HEADER SECTION =====
      // Clinic Name (Large, Bold)
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(clinicInfo.name, { align: 'center' });

      // Clinic Address and Contact
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(clinicInfo.address, { align: 'center' })
        .text(`Phone: ${clinicInfo.phone}`, { align: 'center' });

      if (clinicInfo.email) {
        doc.text(`Email: ${clinicInfo.email}`, { align: 'center' });
      }

      // Horizontal line
      doc
        .moveTo(50, doc.y + 10)
        .lineTo(550, doc.y + 10)
        .stroke();

      doc.moveDown(1.5);

      // ===== DATE SECTION =====
      const visitDate = new Date(visit.visitDate);
      const formattedDate = visitDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Date: ${formattedDate}`, 400, 120, { align: 'right' });

      doc.moveDown(2);

      // ===== PATIENT INFORMATION SECTION =====
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('PATIENT INFORMATION', { underline: true });

      doc.moveDown(0.5);

      const patientInfo = [
        `Name: ${visit.patient.name}`,
        `Age: ${visit.patient.age} years`,
        `Gender: ${visit.patient.gender}`,
        `Phone: ${visit.patient.phone}`
      ];

      doc.fontSize(11).font('Helvetica');
      patientInfo.forEach((info) => {
        doc.text(info);
      });

      doc.moveDown(1.5);

      // ===== VITALS SECTION =====
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('VITALS', { underline: true });

      doc.moveDown(0.5);

      const vitals = [
        `Temperature: ${visit.temperature}°C`,
        `Blood Pressure: ${visit.bloodPressure} mmHg`,
        `Pulse: ${visit.pulse} BPM`
      ];

      doc.fontSize(11).font('Helvetica');
      vitals.forEach((vital) => {
        doc.text(vital);
      });

      doc.moveDown(1.5);

      // ===== COMPLAINTS SECTION =====
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('COMPLAINTS / SYMPTOMS', { underline: true });

      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(visit.complaints, { align: 'justify' });

      doc.moveDown(1.5);

      // ===== DIAGNOSIS SECTION =====
      if (visit.diagnosis) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('DIAGNOSIS', { underline: true });

        doc.moveDown(0.5);

        doc
          .fontSize(11)
          .font('Helvetica')
          .text(visit.diagnosis, { align: 'justify' });

        doc.moveDown(1.5);
      }

      // ===== MEDICATIONS TABLE =====
      if (visit.medications && visit.medications.length > 0) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('PRESCRIPTION / MEDICATIONS', { underline: true });

        doc.moveDown(0.5);

        // Check if we need a new page
        if (doc.y > 650) {
          doc.addPage();
        }

        // Table header
        const tableTop = doc.y;
        const col1X = 50;
        const col2X = 200;
        const col3X = 300;
        const col4X = 400;
        const rowHeight = 25;

        // Draw header background
        doc
          .rect(col1X, tableTop, 495, rowHeight)
          .fillAndStroke('#e5e7eb', '#d1d5db');

        // Header text
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#000')
          .text('Medicine', col1X + 5, tableTop + 8, { width: 140 })
          .text('Dosage', col2X + 5, tableTop + 8, { width: 90 })
          .text('Frequency', col3X + 5, tableTop + 8, { width: 90 })
          .text('Duration', col4X + 5, tableTop + 8, { width: 60 });

        let currentY = tableTop + rowHeight;

        // Table rows
        visit.medications.forEach((med, index) => {
          // Check if we need a new page
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }

          // Alternate row colors
          const rowColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
          doc
            .rect(col1X, currentY, 495, rowHeight)
            .fillAndStroke(rowColor, '#d1d5db');

          // Row text
          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor('#000')
            .text(med.name, col1X + 5, currentY + 5, {
              width: 140,
              height: rowHeight - 10
            })
            .text(med.dosage, col2X + 5, currentY + 5, {
              width: 90,
              height: rowHeight - 10
            })
            .text(med.frequency, col3X + 5, currentY + 5, {
              width: 90,
              height: rowHeight - 10
            })
            .text(med.duration, col4X + 5, currentY + 5, {
              width: 60,
              height: rowHeight - 10
            });

          // Instructions (if any) - shown below the row
          if (med.instructions) {
            currentY += rowHeight;
            doc
              .fontSize(8)
              .font('Helvetica-Oblique')
              .fillColor('#6b7280')
              .text(`Note: ${med.instructions}`, col1X + 5, currentY + 2, {
                width: 490
              });
            currentY += 15;
          } else {
            currentY += rowHeight;
          }
        });

        doc.moveDown(2);
      } else {
        doc
          .fontSize(11)
          .font('Helvetica-Oblique')
          .text('No medications prescribed for this visit.');
        doc.moveDown(2);
      }

      // ===== FOOTER SECTION =====
      // Check if we need space for footer
      if (doc.y > 650) {
        doc.addPage();
      }

      doc.moveDown(3);

      // Doctor signature line
      doc
        .moveTo(350, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc
        .fontSize(10)
        .font('Helvetica')
        .text("Doctor's Signature", 350, doc.y + 5, { align: 'center', width: 195 });

      doc.moveDown(2);

      // Clinic notes
      doc
        .fontSize(9)
        .font('Helvetica-Oblique')
        .fillColor('#6b7280')
        .text(
          'This is a digitally generated prescription. Please follow the medication schedule as prescribed.',
          { align: 'center' }
        )
        .text(
          'For any queries or concerns, please contact the clinic.',
          { align: 'center' }
        );

      // Page number (optional)
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#6b7280')
          .text(
            `Page ${i + 1} of ${pages.count}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
      }

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get the prescription filename for a visit
 * @param visit - Visit object with patient information
 * @returns Formatted filename
 */
export function getPrescriptionFilename(visit: {
  patient: { name: string };
  visitDate: Date | string;
}): string {
  const patientName = visit.patient.name.replace(/\s+/g, '_');
  const date = new Date(visit.visitDate);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `Prescription_${patientName}_${dateStr}.pdf`;
}
