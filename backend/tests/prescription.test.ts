import zlib from 'zlib';
import { generatePrescriptionPDF, getPrescriptionFilename } from '../src/services/prescriptionGenerator';
import { prisma } from '../src/config/database';

const extractPdfText = (pdfBuffer: Buffer): string => {
  const rawPdf = pdfBuffer.toString('latin1');
  const streamMatches = [...rawPdf.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)];

  return streamMatches
    .map((match) => {
      const streamData = match[1].trim();
      try {
        return zlib.inflateSync(Buffer.from(streamData, 'binary')).toString('latin1');
      } catch {
        return streamData;
      }
    })
    .join('\n')
    .replace(/<([0-9a-f]+)>/gi, (_match, hex: string) => Buffer.from(hex, 'hex').toString('latin1'));
};

  const normalizePdfText = (text: string): string => text.replace(/[\s\d-]+/g, '');

jest.mock('../src/config/database', () => ({
  prisma: {
    visit: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Prescription PDF generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a prescription PDF within 10 seconds and include visit details', async () => {
    const startTime = Date.now();
    const mockVisit = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      visitDate: '2026-09-15T09:30:00.000Z',
      complaints: 'Fever and body ache',
      diagnosis: 'Viral fever',
      temperature: 38.5,
      bloodPressure: '120/80',
      pulse: 82,
      patient: {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'John Doe',
        age: 34,
        gender: 'Male',
        phone: '9876543210',
      },
      medications: [
        {
          id: 'med-1',
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 days',
          instructions: 'After meals',
        },
      ],
    };

    (prisma.visit.findUnique as jest.Mock).mockResolvedValue(mockVisit);

    const pdfBuffer = await generatePrescriptionPDF(mockVisit.id);
    const pdfText = extractPdfText(pdfBuffer);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    const normalizedText = normalizePdfText(pdfText);
    expect(normalizedText).toContain('JohnDoe');
    expect(normalizedText).toContain('Paracetamol');
    expect(normalizedText).toContain('Viralfever');
    expect(Date.now() - startTime).toBeLessThan(10000);
  });

  it('should generate a valid PDF when no medications are attached', async () => {
    const mockVisit = {
      id: '223e4567-e89b-12d3-a456-426614174001',
      visitDate: '2026-08-12T11:00:00.000Z',
      complaints: 'Mild cough',
      diagnosis: 'Upper respiratory infection',
      temperature: 37.2,
      bloodPressure: '110/70',
      pulse: 74,
      patient: {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Jane Smith',
        age: 28,
        gender: 'Female',
        phone: '1234567890',
      },
      medications: [],
    };

    (prisma.visit.findUnique as jest.Mock).mockResolvedValue(mockVisit);

    const pdfBuffer = await generatePrescriptionPDF(mockVisit.id);
    const pdfText = extractPdfText(pdfBuffer);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    const normalizedText = normalizePdfText(pdfText);
    expect(normalizedText).toContain('JaneSmith');
    expect(normalizedText).toContain('No');
    expect(normalizedText).toContain('medications');
    expect(normalizedText).toContain('prescribed');
  });

  it('should include custom clinic details in the generated PDF', async () => {
    const mockVisit = {
      id: '323e4567-e89b-12d3-a456-426614174002',
      visitDate: '2026-09-20T08:00:00.000Z',
      complaints: 'Back pain',
      diagnosis: 'Muscle strain',
      temperature: 36.9,
      bloodPressure: '118/76',
      pulse: 70,
      patient: {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Alice Brown',
        age: 41,
        gender: 'Female',
        phone: '5551234567',
      },
      medications: [{
        id: 'med-2',
        name: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'Once daily',
        duration: '3 days',
        instructions: 'Take with food',
      }],
    };

    (prisma.visit.findUnique as jest.Mock).mockResolvedValue(mockVisit);

    const customClinicInfo = {
      name: 'BrightCare Clinic',
      address: '25 Wellness Avenue, Suite 300',
      phone: '+1 (555) 111-2222',
      email: 'care@brightcare.example',
    };

    const pdfBuffer = await generatePrescriptionPDF(mockVisit.id, customClinicInfo);
    const pdfText = extractPdfText(pdfBuffer);

    const normalizedText = normalizePdfText(pdfText);
    expect(normalizedText).toContain('BrightCareClinic');
    expect(normalizedText).toContain('WellnessAvenue,Suite');
  });

  it('should generate a readable filename for a prescription', () => {
    const filename = getPrescriptionFilename({
      patient: { name: 'Mary Johnson' },
      visitDate: '2026-09-15T00:00:00.000Z',
    });

    expect(filename).toBe('Prescription_Mary_Johnson_2026-09-15.pdf');
  });
});
