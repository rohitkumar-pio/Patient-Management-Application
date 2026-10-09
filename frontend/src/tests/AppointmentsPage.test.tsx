import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppointmentsPage } from '../pages/Appointments/AppointmentsPage';
import { toDateString } from '../lib/appointments';
import apiClient from '../lib/api';
import { showToast } from '../components/Toast';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../components/Toast', () => ({
  showToast: vi.fn(),
}));

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', name: 'Test', email: 'doctor@test.com', role: 'DOCTOR' },
    isAuthenticated: true,
    logout: vi.fn(),
  })),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Fixed date that is never "today", so the Today button is shown
const SELECTED_DATE = '2030-03-12';

const patient1 = { id: 'patient-1', name: 'John Doe', phone: '1234567890', age: 35, gender: 'Male' };
const patient2 = { id: 'patient-2', name: 'Jane Smith', phone: '0987654321', age: 28, gender: 'Female' };

// Local-time timestamps, as created by the Add Appointment form
const localIso = (date: string, hours: number, minutes: number) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, hours, minutes).toISOString();
};

const buildAppointments = () => [
  {
    id: 'appt-1',
    patientId: patient1.id,
    appointmentDate: localIso(SELECTED_DATE, 9, 30),
    status: 'SCHEDULED',
    notes: 'Follow-up for fever',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    patient: patient1,
  },
  {
    id: 'appt-2',
    patientId: patient2.id,
    appointmentDate: localIso(SELECTED_DATE, 0, 0), // no specific time
    status: 'COMPLETED',
    notes: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    patient: patient2,
  },
];

let currentSearch = '';
const LocationProbe = () => {
  currentSearch = useLocation().search;
  return null;
};

const renderPage = (initialPath = `/appointments?date=${SELECTED_DATE}`) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/appointments"
            element={
              <>
                <AppointmentsPage />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// In-memory fake server: PATCH/DELETE change what later GETs return, like the real API,
// so refetches after a mutation see the updated data. Tests can override individual calls.
let serverAppointments: any[] = [];
const mockServer = (appointments: any[] = buildAppointments()) => {
  serverAppointments = appointments;
  vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
    if (url.startsWith('/appointments')) {
      const data = serverAppointments.map((a) => ({ ...a }));
      return { data: { success: true, data, count: data.length } };
    }
    if (url.startsWith('/patients')) {
      return { data: { success: true, data: [patient1, patient2] } };
    }
    throw new Error(`Unexpected GET ${url}`);
  });
  vi.mocked(apiClient.patch).mockImplementation(async (url: string, body: any) => {
    const id = url.split('/')[2];
    serverAppointments = serverAppointments.map((a) => (a.id === id ? { ...a, status: body.status } : a));
    return { data: { success: true } };
  });
  vi.mocked(apiClient.post).mockImplementation(async (_url: string, body: any) => {
    const patient = [patient1, patient2].find((p) => p.id === body.patientId)!;
    const created = {
      id: `appt-new-${serverAppointments.length + 1}`,
      patientId: body.patientId,
      appointmentDate: body.appointmentDate,
      status: 'SCHEDULED',
      notes: body.notes ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient,
    };
    // The fake server serves one day; keep only appointments booked on SELECTED_DATE
    if (toDateString(new Date(body.appointmentDate)) === SELECTED_DATE) {
      serverAppointments = [...serverAppointments, created];
    }
    return { data: { success: true, data: created } };
  });
  vi.mocked(apiClient.delete).mockImplementation(async (url: string) => {
    const id = url.split('/')[2];
    serverAppointments = serverAppointments.filter((a) => a.id !== id);
    return { data: { success: true } };
  });
};

const getCard = (name: string) => screen.getByRole('article', { name: `Appointment for ${name}` });

describe('AppointmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSearch = '';
    mockServer();
  });

  describe('Rendering', () => {
    it('loads appointments for the date in the URL', async () => {
      renderPage();

      expect(screen.getByRole('heading', { name: 'Appointments', level: 1 })).toBeInTheDocument();
      expect(await screen.findByText('John Doe')).toBeInTheDocument();
      expect(apiClient.get).toHaveBeenCalledWith(`/appointments?date=${SELECTED_DATE}`);
      expect(screen.getByLabelText('Select date')).toHaveValue(SELECTED_DATE);
      expect(screen.getByRole('heading', { name: /Tuesday, 12 March 2030|Tuesday, March 12, 2030/ })).toBeInTheDocument();
    });

    it('defaults to today when no date is given', async () => {
      renderPage('/appointments');

      const today = toDateString(new Date());
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith(`/appointments?date=${today}`);
      });
      expect(screen.getByLabelText('Select date')).toHaveValue(today);
      expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
    });

    it('falls back to today for an invalid date in the URL', async () => {
      renderPage('/appointments?date=2026-02-30');

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith(`/appointments?date=${toDateString(new Date())}`);
      });
    });

    it('shows card details: time, status badge, notes and actions', async () => {
      renderPage();

      const card = within(await screen.findByRole('article', { name: 'Appointment for John Doe' }));
      expect(card.getByText(/9:30/)).toBeInTheDocument();
      expect(card.getByText('Scheduled')).toHaveClass('appointment-status-badge', 'status-scheduled');
      expect(card.getByText('Follow-up for fever')).toBeInTheDocument();
      expect(card.getByText('35 yrs • Male • 1234567890')).toBeInTheDocument();
      expect(card.getByRole('button', { name: 'Mark Complete' })).toBeInTheDocument();
      expect(card.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(card.getByRole('button', { name: 'No-show' })).toBeInTheDocument();
      expect(card.getByRole('button', { name: 'Delete appointment for John Doe' })).toBeInTheDocument();
    });

    it('shows date-only for appointments without a time and Undo for non-scheduled', async () => {
      renderPage();

      const card = within(await screen.findByRole('article', { name: 'Appointment for Jane Smith' }));
      expect(card.getByText('Completed')).toHaveClass('status-completed');
      expect(card.queryByText(/12:00/)).not.toBeInTheDocument();
      expect(card.getByText(/2030/)).toBeInTheDocument();
      expect(card.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
      expect(card.queryByRole('button', { name: 'Mark Complete' })).not.toBeInTheDocument();
    });

    it('shows status counts for the day', async () => {
      renderPage();

      const summary = within(await screen.findByLabelText('Status summary'));
      expect(summary.getByText('2 total')).toBeInTheDocument();
      expect(summary.getByText('1 scheduled')).toBeInTheDocument();
      expect(summary.getByText('1 completed')).toBeInTheDocument();
    });

    it('shows an empty state when there are no appointments', async () => {
      mockServer([]);
      renderPage();

      expect(await screen.findByText('No appointments')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Schedule one' })).toBeInTheDocument();
    });

    it('shows an error when loading fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network down'));
      renderPage();

      expect(await screen.findByText('Error loading appointments')).toBeInTheDocument();
      expect(screen.getByText('Network down')).toBeInTheDocument();
      expect(screen.queryByText('No appointments')).not.toBeInTheDocument();
    });
  });

  describe('Date navigation', () => {
    it('moves to the previous and next day', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('John Doe');

      await user.click(screen.getByRole('button', { name: 'Next day' }));
      await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith('/appointments?date=2030-03-13'));
      expect(currentSearch).toBe('?date=2030-03-13');

      await user.click(screen.getByRole('button', { name: 'Previous day' }));
      await user.click(screen.getByRole('button', { name: 'Previous day' }));
      await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith('/appointments?date=2030-03-11'));
      expect(screen.getByLabelText('Select date')).toHaveValue('2030-03-11');
    });

    it('crosses month boundaries', async () => {
      const user = userEvent.setup();
      renderPage('/appointments?date=2026-10-31');
      await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith('/appointments?date=2026-10-31'));

      await user.click(screen.getByRole('button', { name: 'Next day' }));
      await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith('/appointments?date=2026-11-01'));
    });

    it('jumps to a date picked in the date selector', async () => {
      renderPage();
      await screen.findByText('John Doe');

      fireEvent.change(screen.getByLabelText('Select date'), { target: { value: '2026-12-25' } });
      await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith('/appointments?date=2026-12-25'));
    });

    it('returns to today with the Today button', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('John Doe');

      await user.click(screen.getByRole('button', { name: 'Today' }));
      await waitFor(() =>
        expect(apiClient.get).toHaveBeenCalledWith(`/appointments?date=${toDateString(new Date())}`)
      );
      expect(currentSearch).toBe('');
    });
  });

  describe('Status updates', () => {
    it('marks an appointment complete and updates the card immediately', async () => {
      const user = userEvent.setup();
      let resolvePatch!: (value: unknown) => void;
      vi.mocked(apiClient.patch).mockImplementation(() => new Promise((resolve) => { resolvePatch = resolve; }));
      renderPage();
      await screen.findByText('John Doe');

      await user.click(within(getCard('John Doe')).getByRole('button', { name: 'Mark Complete' }));

      // Optimistic: the badge changes before the request resolves
      expect(within(getCard('John Doe')).getByText('Completed')).toBeInTheDocument();
      expect(apiClient.patch).toHaveBeenCalledWith('/appointments/appt-1/status', { status: 'COMPLETED' });

      resolvePatch({ data: { success: true } });
      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith('Appointment marked as completed', 'success');
      });
    });

    it.each([
      ['Cancel', 'CANCELLED', 'Cancelled'],
      ['No-show', 'NO_SHOW', 'No-show'],
    ])('"%s" sends status %s', async (buttonName, status, badge) => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('John Doe');

      await user.click(within(getCard('John Doe')).getByRole('button', { name: buttonName }));

      expect(apiClient.patch).toHaveBeenCalledWith('/appointments/appt-1/status', { status });
      expect(within(getCard('John Doe')).getByText(badge, { selector: '.appointment-status-badge' })).toBeInTheDocument();
    });

    it('sets a completed appointment back to scheduled with Undo', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Jane Smith');

      await user.click(within(getCard('Jane Smith')).getByRole('button', { name: 'Undo' }));

      expect(apiClient.patch).toHaveBeenCalledWith('/appointments/appt-2/status', { status: 'SCHEDULED' });
    });

    it('rolls back the card and shows an error when the update fails', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.patch).mockRejectedValue({ response: { data: { message: 'Server unavailable' } } });
      // Keep the list stable so the rollback (not a refetch) is what restores the badge
      renderPage();
      await screen.findByText('John Doe');
      vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));

      await user.click(within(getCard('John Doe')).getByRole('button', { name: 'Mark Complete' }));

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith('Server unavailable', 'error');
      });
      expect(within(getCard('John Doe')).getByText('Scheduled')).toBeInTheDocument();
    });
  });

  describe('Delete', () => {
    it('asks for confirmation and removes the appointment', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('John Doe');

      await user.click(screen.getByRole('button', { name: 'Delete appointment for John Doe' }));
      expect(screen.getByText('Delete the appointment for John Doe? This cannot be undone.')).toBeInTheDocument();
      expect(apiClient.delete).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(apiClient.delete).toHaveBeenCalledWith('/appointments/appt-1');
      await waitFor(() => {
        expect(screen.queryByRole('article', { name: 'Appointment for John Doe' })).not.toBeInTheDocument();
      });
      expect(showToast).toHaveBeenCalledWith('Appointment deleted', 'success');
    });

    it('does not delete when the confirmation is dismissed', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('John Doe');

      await user.click(screen.getByRole('button', { name: 'Delete appointment for John Doe' }));
      await user.click(screen.getByRole('button', { name: 'Keep' }));

      expect(apiClient.delete).not.toHaveBeenCalled();
      expect(getCard('John Doe')).toBeInTheDocument();
    });
  });

  describe('Add appointment', () => {
    const openModalAndPick = async (user: ReturnType<typeof userEvent.setup>, patientName: string) => {
      await user.click(screen.getByRole('button', { name: 'Add Appointment' }));
      const dialog = within(screen.getByRole('dialog', { name: 'Schedule Appointment' }));
      await user.type(dialog.getByRole('combobox'), patientName.split(' ')[0]);
      await user.click(await dialog.findByRole('option', { name: new RegExp(patientName) }));
      return dialog;
    };

    it('opens the modal on the selected date and closes with Cancel', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('John Doe');

      await user.click(screen.getByRole('button', { name: 'Add Appointment' }));
      const dialog = within(screen.getByRole('dialog', { name: 'Schedule Appointment' }));
      expect(dialog.getByLabelText(/^Date/)).toHaveValue(SELECTED_DATE);

      await user.click(dialog.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('creates an appointment that then appears in the list', async () => {
      const user = userEvent.setup();
      mockServer([buildAppointments()[1]]); // only Jane Smith today
      renderPage();
      await screen.findByText('Jane Smith');

      const dialog = await openModalAndPick(user, 'John Doe');
      fireEvent.change(dialog.getByLabelText(/^Time/), { target: { value: '11:45' } });
      await user.click(dialog.getByRole('button', { name: 'Schedule' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(apiClient.post).toHaveBeenCalledWith('/appointments', {
        patientId: 'patient-1',
        appointmentDate: localIso(SELECTED_DATE, 11, 45),
      });
      expect(await screen.findByRole('article', { name: 'Appointment for John Doe' })).toBeInTheDocument();
      expect(showToast).toHaveBeenCalledWith(expect.stringContaining('Appointment scheduled for John Doe'), 'success');
    });

    it('switches the page to the booked date when it differs', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('John Doe');

      const dialog = await openModalAndPick(user, 'Jane Smith');
      fireEvent.change(dialog.getByLabelText(/^Date/), { target: { value: '2030-03-20' } });
      await user.click(dialog.getByRole('button', { name: 'Schedule' }));

      await waitFor(() => expect(currentSearch).toBe('?date=2030-03-20'));
      expect(screen.getByLabelText('Select date')).toHaveValue('2030-03-20');
    });
  });

  describe('Workflow', () => {
    it('add -> appears -> complete -> undo -> delete', async () => {
      const user = userEvent.setup();
      mockServer([buildAppointments()[1]]); // start with Jane Smith only (completed)
      renderPage();
      await screen.findByText('Jane Smith');
      const summary = () => within(screen.getByLabelText('Status summary'));
      expect(summary().getByText('1 total')).toBeInTheDocument();

      // Add John Doe at 10:00
      await user.click(screen.getByRole('button', { name: 'Add Appointment' }));
      const dialog = within(screen.getByRole('dialog', { name: 'Schedule Appointment' }));
      await user.type(dialog.getByRole('combobox'), 'John');
      await user.click(await dialog.findByRole('option', { name: /John Doe/ }));
      fireEvent.change(dialog.getByLabelText(/^Time/), { target: { value: '10:00' } });
      await user.click(dialog.getByRole('button', { name: 'Schedule' }));

      // Appears in the list as scheduled, counts update
      const johnCard = await screen.findByRole('article', { name: 'Appointment for John Doe' });
      expect(within(johnCard).getByText('Scheduled')).toBeInTheDocument();
      await waitFor(() => expect(summary().getByText('2 total')).toBeInTheDocument());
      expect(summary().getByText('1 scheduled')).toBeInTheDocument();

      // Mark complete
      await user.click(within(getCard('John Doe')).getByRole('button', { name: 'Mark Complete' }));
      await waitFor(() => expect(summary().getByText('2 completed')).toBeInTheDocument());
      expect(summary().getByText('0 scheduled')).toBeInTheDocument();

      // Undo
      await user.click(within(getCard('John Doe')).getByRole('button', { name: 'Undo' }));
      await waitFor(() => expect(summary().getByText('1 scheduled')).toBeInTheDocument());

      // Delete
      await user.click(screen.getByRole('button', { name: 'Delete appointment for John Doe' }));
      await user.click(screen.getByRole('button', { name: 'Delete' }));
      await waitFor(() =>
        expect(screen.queryByRole('article', { name: 'Appointment for John Doe' })).not.toBeInTheDocument()
      );
      expect(summary().getByText('1 total')).toBeInTheDocument();
      expect(serverAppointments.map((a) => a.patientId)).toEqual(['patient-2']);
    });
  });

  describe('Navigation', () => {
    it('opens the patient profile when a card is clicked', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('John Doe');

      await user.click(getCard('John Doe'));
      expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-1');
    });

    it('does not navigate when an action button is clicked', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('John Doe');

      await user.click(within(getCard('John Doe')).getByRole('button', { name: 'No-show' }));
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('highlights Appointments in the sidebar', async () => {
      renderPage();
      await screen.findByText('John Doe');

      const nav = within(screen.getByRole('navigation'));
      expect(nav.getByRole('button', { name: 'Appointments' })).toHaveClass('active');
    });
  });
});
