import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrescriptionPreview } from '../components/PrescriptionPreview';
import apiClient from '../lib/api';

// vi.mock factories are hoisted, so shared mocks must be hoisted too
const { mockSave, jsPDFMock } = vi.hoisted(() => {
  const mockSave = vi.fn();
  const jsPDFMock = vi.fn(function (this: any) {
    this.internal = { pageSize: { width: 595 } };
    this.setFontSize = vi.fn();
    this.setFont = vi.fn();
    this.text = vi.fn();
    this.line = vi.fn();
    this.setLineWidth = vi.fn();
    this.splitTextToSize = vi.fn((value: string) => [value]);
    this.autoTable = vi.fn();
    this.save = mockSave;
    this.lastAutoTable = { finalY: 100 };
  });
  return { mockSave, jsPDFMock };
});

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

vi.mock('jspdf', () => ({
  default: jsPDFMock,
}));

const mockVisit = {
  id: 'visit-123',
  visitDate: '2026-09-15T00:00:00.000Z',
  complaints: 'Fever and sore throat',
  diagnosis: 'Viral infection',
  temperature: 38.1,
  bloodPressure: '120/80',
  pulse: 80,
  patient: {
    id: 'patient-123',
    name: 'John Doe',
    age: 34,
    gender: 'Male',
    phone: '9876543210',
    address: '123 Main St',
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

const renderPreview = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <PrescriptionPreview visitId="visit-123" onClose={vi.fn()} />
    </QueryClientProvider>
  );
};

describe('PrescriptionPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'print', {
      writable: true,
      value: vi.fn(),
    });

    (apiClient.get as any).mockResolvedValue({
      data: {
        success: true,
        data: mockVisit,
      },
    });
  });

  it('renders the prescription preview with visit details', async () => {
    renderPreview();

    expect(await screen.findByText(/Prescription Preview/i)).toBeInTheDocument();
    expect(await screen.findByText(/John Doe/i)).toBeInTheDocument();
    expect(await screen.findByText(/Viral infection/i)).toBeInTheDocument();
  });

  it('triggers window.print when the print button is clicked', async () => {
    const printSpy = vi.spyOn(window, 'print');
    renderPreview();

    const printButton = await screen.findByRole('button', { name: /print/i });
    fireEvent.click(printButton);

    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it('downloads a PDF when the download button is clicked', async () => {
    renderPreview();

    const downloadButton = await screen.findByRole('button', { name: /download pdf/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });
});
