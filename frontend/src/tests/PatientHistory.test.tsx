import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { PatientHistory, HISTORY_PAGE_SIZE, VIRTUALIZE_THRESHOLD } from '../pages/Patients/PatientHistory';
import { shiftDate, toDateString } from '../lib/appointments';
import apiClient from '../lib/api';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', name: 'Test', email: 'doctor@test.com', role: 'DOCTOR' },
    isAuthenticated: true,
    logout: vi.fn(),
  })),
}));

// The real preview loads jsPDF; it has its own tests
vi.mock('../components/PrescriptionPreview', () => ({
  PrescriptionPreview: ({ visitId, onClose }: { visitId: string; onClose: () => void }) => (
    <div role="dialog" aria-label="Prescription Preview">
      Prescription for {visitId}
      <button onClick={onClose}>Close preview</button>
    </div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const PATIENT_ID = 'patient-1';
const patient = {
  id: PATIENT_ID,
  name: 'John Doe',
  age: 45,
  gender: 'Male',
  phone: '1234567890',
  address: '12 Park Street',
  visitCount: 3,
};

/** Visit n is n days before 2026-05-31 at 10:00 local; newest first */
const buildVisit = (n: number, overrides: Record<string, unknown> = {}) => {
  const date = new Date(2026, 4, 31 - n, 10, 0);
  return {
    id: `visit-${n}`,
    patientId: PATIENT_ID,
    visitDate: date.toISOString(),
    complaints: `Complaint for visit ${n}`,
    diagnosis: `Diagnosis for visit ${n}`,
    temperature: 37.0,
    bloodPressure: '118/76',
    pulse: 72,
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
    medications: [
      { id: `med-${n}-a`, name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' },
      { id: `med-${n}-b`, name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '3 days' },
    ],
    ...overrides,
  };
};

// Fake server applying the API's filtering (inclusive local days) and paging
let serverVisits: any[] = [];
const historyRequests: URLSearchParams[] = [];

const mockServer = (visits: any[]) => {
  serverVisits = visits;
  historyRequests.length = 0;
  vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
    if (url === `/patients/${PATIENT_ID}`) {
      return { data: { success: true, data: patient } };
    }
    if (url.startsWith(`/patients/${PATIENT_ID}/visits?`)) {
      const params = new URLSearchParams(url.split('?')[1]);
      historyRequests.push(params);
      const toLocal = (s: string, addDays = 0) => {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d + addDays).getTime();
      };
      const start = params.get('startDate') ? toLocal(params.get('startDate')!) : -Infinity;
      const end = params.get('endDate') ? toLocal(params.get('endDate')!, 1) : Infinity;
      const filtered = serverVisits.filter((v) => {
        const t = new Date(v.visitDate).getTime();
        return t >= start && t < end;
      });
      const limit = Number(params.get('limit'));
      const offset = Number(params.get('offset'));
      const page = filtered.slice(offset, offset + limit);
      return {
        data: {
          success: true,
          data: page,
          pagination: { total: filtered.length, limit, offset, hasMore: offset + page.length < filtered.length },
        },
      };
    }
    throw new Error(`Unexpected GET ${url}`);
  });
};

let currentSearch = '';
const LocationProbe = () => {
  currentSearch = useLocation().search;
  return null;
};

const renderHistory = (search = '') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/patients/${PATIENT_ID}/history${search}`]}>
        <Routes>
          <Route
            path="/patients/:id/history"
            element={
              <>
                <PatientHistory />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const cards = () => screen.queryAllByRole('article');
const lastRequest = () => historyRequests[historyRequests.length - 1];

describe('PatientHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSearch = '';
    mockServer([buildVisit(1), buildVisit(5), buildVisit(40)]);
  });

  describe('Rendering', () => {
    it('shows the patient header and the first page of visits', async () => {
      renderHistory();

      expect(await screen.findByRole('heading', { name: 'John Doe — Visit History' })).toBeInTheDocument();
      expect(screen.getByText('45 years')).toBeInTheDocument();
      expect(screen.getByText(/1234567890/)).toBeInTheDocument();
      expect(screen.getByText(/12 Park Street/)).toBeInTheDocument();

      await waitFor(() => expect(cards()).toHaveLength(3));
      expect(lastRequest().get('limit')).toBe(String(HISTORY_PAGE_SIZE));
      expect(lastRequest().get('offset')).toBe('0');
      expect(screen.getByText('Showing 3 of 3 visits')).toBeInTheDocument();
    });

    it('lists visits newest first as a timeline', async () => {
      renderHistory();

      await waitFor(() => expect(cards()).toHaveLength(3));
      const timeline = screen.getByRole('list', { name: 'Visit history' });
      const labels = within(timeline).getAllByRole('article').map((a) => a.getAttribute('aria-label'));
      expect(labels[0]).toMatch(/30 May 2026|May 30, 2026/);
      expect(labels[2]).toMatch(/21 April 2026|April 21, 2026/);
    });

    it('shows vitals, truncated summaries, medication count and View Details', async () => {
      renderHistory();

      const card = within((await screen.findAllByRole('article'))[0]);
      expect(card.getByText('37°C')).toBeInTheDocument();
      expect(card.getByText('118/76')).toBeInTheDocument();
      expect(card.getByText('72 bpm')).toBeInTheDocument();
      expect(card.getByText('Complaint for visit 1').closest('p')).toHaveAttribute('title', 'Complaint for visit 1');
      expect(card.getByText('Diagnosis for visit 1').closest('p')).toHaveClass('visit-card-line');
      expect(card.getByText(/2 medications/)).toBeInTheDocument();
      expect(card.getByRole('button', { name: 'View Details' })).toBeInTheDocument();
    });

    it('color-codes vitals by range', async () => {
      mockServer([buildVisit(1, { temperature: 39.2, bloodPressure: '130/85', pulse: 72 })]);
      renderHistory();

      const card = within(await screen.findByRole('article'));
      expect(card.getByText('39.2°C').closest('.vital-chip')).toHaveClass('danger');
      expect(card.getByText('130/85').closest('.vital-chip')).toHaveClass('warning');
      expect(card.getByText('72 bpm').closest('.vital-chip')).toHaveClass('normal');
      expect(card.getByText('39.2°C').closest('.vital-chip')).toHaveAttribute('title', 'Temp: Abnormal');
    });

    it('handles missing diagnosis and vitals', async () => {
      mockServer([buildVisit(1, { diagnosis: null, temperature: null, medications: [] })]);
      renderHistory();

      const card = within(await screen.findByRole('article'));
      expect(card.getByText('Not recorded')).toBeInTheDocument();
      expect(card.getByText('—').closest('.vital-chip')).toHaveClass('unknown');
      expect(card.getByText(/0 medications/)).toBeInTheDocument();
    });

    it('shows an empty state for a patient without visits', async () => {
      mockServer([]);
      renderHistory();

      expect(await screen.findByText('No visits recorded yet')).toBeInTheDocument();
      await userEvent.setup().click(screen.getByRole('button', { name: 'Record a visit' }));
      expect(mockNavigate).toHaveBeenCalledWith(`/visits/new?patientId=${PATIENT_ID}`);
    });

    it('shows an error when history fails to load', async () => {
      mockServer([]);
      const base = vi.mocked(apiClient.get).getMockImplementation()!;
      vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
        if (url.includes('/visits?')) throw new Error('Network down');
        return base(url);
      });
      renderHistory();

      expect(await screen.findByText("Couldn't load visit history. Please try again.")).toBeInTheDocument();
    });
  });

  describe('Date filter', () => {
    it('filters by start and end date and keeps them in the URL', async () => {
      renderHistory();
      await waitFor(() => expect(cards()).toHaveLength(3));

      fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-05-20' } });
      await waitFor(() => expect(cards()).toHaveLength(2));
      expect(lastRequest().get('startDate')).toBe('2026-05-20');
      expect(currentSearch).toBe('?startDate=2026-05-20');

      fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-05-26' } });
      await waitFor(() => expect(cards()).toHaveLength(1));
      expect(lastRequest().get('endDate')).toBe('2026-05-26');
      expect(screen.getByText('Showing 1 of 1 visit')).toBeInTheDocument();
    });

    it('reads the date range from the URL', async () => {
      renderHistory('?startDate=2026-04-01&endDate=2026-04-30');

      await waitFor(() => expect(cards()).toHaveLength(1));
      expect(screen.getByLabelText('From')).toHaveValue('2026-04-01');
      expect(screen.getByLabelText('To')).toHaveValue('2026-04-30');
    });

    it('All Time clears the filter', async () => {
      const user = userEvent.setup();
      renderHistory('?startDate=2026-05-29');
      await waitFor(() => expect(cards()).toHaveLength(1));
      expect(screen.getByRole('button', { name: 'All Time' })).toHaveAttribute('aria-pressed', 'false');

      await user.click(screen.getByRole('button', { name: 'All Time' }));

      await waitFor(() => expect(cards()).toHaveLength(3));
      expect(currentSearch).toBe('');
      expect(screen.getByRole('button', { name: 'All Time' })).toHaveAttribute('aria-pressed', 'true');
      expect(lastRequest().has('startDate')).toBe(false);
    });

    it('Last 30 days sets the start date', async () => {
      const user = userEvent.setup();
      renderHistory();
      await waitFor(() => expect(cards()).toHaveLength(3));

      await user.click(screen.getByRole('button', { name: 'Last 30 days' }));

      const expected = shiftDate(toDateString(new Date()), -29);
      await waitFor(() => expect(lastRequest().get('startDate')).toBe(expected));
      expect(screen.getByRole('button', { name: 'Last 30 days' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('rejects a start date after the end date without requesting', async () => {
      renderHistory('?startDate=2026-05-20&endDate=2026-05-10');

      expect(await screen.findByRole('alert')).toHaveTextContent('Start date must be on or before end date');
      expect(historyRequests).toHaveLength(0);
      expect(cards()).toHaveLength(0);
    });

    it('shows an empty state for a range without visits', async () => {
      const user = userEvent.setup();
      renderHistory('?startDate=2025-01-01&endDate=2025-01-31');

      expect(await screen.findByText('No visits in this date range')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Show all time' }));
      await waitFor(() => expect(cards()).toHaveLength(3));
    });
  });

  describe('Visit details', () => {
    it('opens the full visit in a modal', async () => {
      const user = userEvent.setup();
      mockServer([buildVisit(1, { complaints: 'Fever, headache and a very long description '.repeat(5).trim() })]);
      renderHistory();

      await user.click(await screen.findByRole('button', { name: 'View Details' }));

      const dialog = within(screen.getByRole('dialog', { name: /Visit on/ }));
      expect(dialog.getByText(/John Doe/)).toBeInTheDocument();
      expect(dialog.getByText(/^Fever, headache and a very long description/)).toHaveTextContent(
        'Fever, headache and a very long description '.repeat(5).trim()
      );
      expect(dialog.getByText('Diagnosis for visit 1')).toBeInTheDocument();
      expect(dialog.getByText('Medications (2)')).toBeInTheDocument();

      const rows = dialog.getAllByRole('row');
      expect(rows).toHaveLength(3); // header + 2 medications
      expect(within(rows[1]).getAllByRole('cell').map((c) => c.textContent)).toEqual([
        'Paracetamol', '500mg', 'Twice daily', '5 days', 'After meals',
      ]);
      expect(within(rows[2]).getAllByRole('cell')[4]).toHaveTextContent('—');
    });

    it('closes with Close, the × button and Escape', async () => {
      const user = userEvent.setup();
      renderHistory();
      const openDetails = async () => user.click((await screen.findAllByRole('button', { name: 'View Details' }))[0]);

      await openDetails();
      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await openDetails();
      await user.click(screen.getByRole('button', { name: 'Close dialog' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await openDetails();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('Print Prescription opens the prescription preview for that visit', async () => {
      const user = userEvent.setup();
      renderHistory();

      await user.click((await screen.findAllByRole('button', { name: 'View Details' }))[1]);
      await user.click(screen.getByRole('button', { name: /Print Prescription/ }));

      const preview = screen.getByRole('dialog', { name: 'Prescription Preview' });
      expect(preview).toHaveTextContent('Prescription for visit-5');
      expect(screen.queryByRole('dialog', { name: /Visit on/ })).not.toBeInTheDocument();
    });
  });

  describe('Pagination and virtualization', () => {
    const manyVisits = (count: number) => Array.from({ length: count }, (_, i) => buildVisit(i + 1));

    it('loads more visits page by page', async () => {
      const user = userEvent.setup();
      mockServer(manyVisits(45));
      renderHistory();

      await waitFor(() => expect(cards()).toHaveLength(20));
      expect(screen.getByText('Showing 20 of 45 visits')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Load more' }));
      await waitFor(() => expect(screen.getByText('Showing 40 of 45 visits')).toBeInTheDocument());
      expect(lastRequest().get('offset')).toBe('20');

      await user.click(screen.getByRole('button', { name: 'Load more' }));
      await waitFor(() => expect(screen.getByText('Showing 45 of 45 visits')).toBeInTheDocument());
      expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
      expect(cards()).toHaveLength(45); // below the threshold: all rendered
    });

    it(`virtualizes once more than ${VIRTUALIZE_THRESHOLD} visits are loaded`, async () => {
      const user = userEvent.setup();
      mockServer(manyVisits(120));
      renderHistory();

      await waitFor(() => expect(cards()).toHaveLength(20));
      for (const loaded of [40, 60, 80, 100, 120]) {
        await user.click(screen.getByRole('button', { name: 'Load more' }));
        await waitFor(() => expect(screen.getByText(`Showing ${loaded} of 120 visits`)).toBeInTheDocument());
      }

      // Only the rows in view (plus overscan) are in the DOM
      const rendered = cards().length;
      expect(rendered).toBeGreaterThan(0);
      expect(rendered).toBeLessThan(20);
      expect(cards()[0]).toHaveAccessibleName(/30 May 2026|May 30, 2026/);
    });
  });

  it('goes back to the patient profile', async () => {
    const user = userEvent.setup();
    renderHistory();

    await user.click(screen.getByRole('button', { name: '← Back to Profile' }));
    expect(mockNavigate).toHaveBeenCalledWith(`/patients/${PATIENT_ID}`);
  });
});
