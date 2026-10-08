import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import apiClient from '../lib/api';
import { showToast } from '../components/Toast';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
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

const todayAt = (hours: number, minutes: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes).toISOString();
};

const patient = (id: string, name: string, phone: string) => ({ id, name, phone, age: 30, gender: 'Male' });

const buildQueue = () => [
  { id: 'a1', patientId: 'p1', appointmentDate: todayAt(9, 0), status: 'COMPLETED', notes: null, patient: patient('p1', 'Alice Johnson', '1111111111') },
  { id: 'a2', patientId: 'p2', appointmentDate: todayAt(10, 30), status: 'SCHEDULED', notes: 'Follow-up', patient: patient('p2', 'Bob Smith', '2222222222') },
  { id: 'a3', patientId: 'p3', appointmentDate: todayAt(11, 0), status: 'SCHEDULED', notes: null, patient: patient('p3', 'Carol White', '3333333333') },
  { id: 'a4', patientId: 'p4', appointmentDate: todayAt(12, 0), status: 'NO_SHOW', notes: null, patient: patient('p4', 'Dan Brown', '4444444444') },
  { id: 'a5', patientId: 'p5', appointmentDate: todayAt(13, 0), status: 'CANCELLED', notes: null, patient: patient('p5', 'Eve Black', '5555555555') },
];

// Fake server: PATCH changes what later GETs return, like the real API
let serverQueue: any[] = [];
const mockServer = (queue: any[] = buildQueue()) => {
  serverQueue = queue;
  vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
    if (url === '/appointments/today') {
      return { data: { success: true, data: serverQueue.map((a) => ({ ...a })), count: serverQueue.length } };
    }
    if (url.startsWith('/patients')) {
      return { data: { success: true, data: [] } };
    }
    throw new Error(`Unexpected GET ${url}`);
  });
  vi.mocked(apiClient.patch).mockImplementation(async (url: string, body: any) => {
    const id = url.split('/')[2];
    serverQueue = serverQueue.map((a) => (a.id === id ? { ...a, status: body.status } : a));
    return { data: { success: true } };
  });
};

const renderDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const getRow = (name: string) => {
  const queue = screen.getByRole('list', { name: "Today's appointments" });
  return within(queue).getAllByRole('listitem').find((li) => li.getAttribute('aria-label')?.startsWith(name))!;
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockServer();
  });

  describe("Today's queue", () => {
    it('shows a welcome message and loads today\'s appointments', async () => {
      renderDashboard();

      expect(screen.getByRole('heading', { level: 1, name: /^Good (morning|afternoon|evening), Dr\. Test$/ })).toBeInTheDocument();
      expect(await screen.findByText('Bob Smith')).toBeInTheDocument();
      expect(apiClient.get).toHaveBeenCalledWith('/appointments/today');
    });

    it('shows the count and status stats', async () => {
      renderDashboard();
      await screen.findByText('Bob Smith');

      expect(screen.getByText('5 appointments today (1 cancelled)')).toBeInTheDocument();
      const stats = within(screen.getByLabelText("Today's summary"));
      const stat = (label: string) => stats.getByText(label).previousElementSibling?.textContent;
      expect(stat('Total Appointments')).toBe('5');
      expect(stat('Completed')).toBe('1');
      expect(stat('Waiting')).toBe('2');
      expect(stat('No-show')).toBe('1');
    });

    it('lists appointments in time order with color-coded status badges', async () => {
      renderDashboard();
      await screen.findByText('Bob Smith');

      const rows = within(screen.getByRole('list', { name: "Today's appointments" })).getAllByRole('listitem');
      expect(rows.map((r) => r.querySelector('.queue-patient-name')?.textContent)).toEqual([
        'Alice Johnson',
        'Bob Smith',
        'Carol White',
        'Dan Brown',
        'Eve Black',
      ]);
      expect(within(getRow('Alice Johnson')).getByText('Completed')).toHaveClass('status-completed');
      expect(within(getRow('Bob Smith')).getByText('Scheduled')).toHaveClass('status-scheduled');
      expect(within(getRow('Dan Brown')).getByText('No-show')).toHaveClass('status-no-show');
      expect(within(getRow('Bob Smith')).getByText('Follow-up')).toBeInTheDocument();
      expect(within(getRow('Bob Smith')).getByText('2222222222')).toBeInTheDocument();
    });

    it('marks only the first waiting patient as Next', async () => {
      renderDashboard();
      await screen.findByText('Bob Smith');

      expect(screen.getAllByText('Next')).toHaveLength(1);
      expect(within(getRow('Bob Smith')).getByText('Next')).toBeInTheDocument();
    });

    it('shows Start Consultation only for scheduled appointments', async () => {
      renderDashboard();
      await screen.findByText('Bob Smith');

      expect(screen.getAllByRole('button', { name: 'Start Consultation' })).toHaveLength(2);
      expect(within(getRow('Alice Johnson')).queryByRole('button', { name: 'Start Consultation' })).not.toBeInTheDocument();
      expect(within(getRow('Alice Johnson')).getByRole('button', { name: 'Set Alice Johnson back to scheduled' })).toBeInTheDocument();
    });

    it('shows an empty state when there are no appointments today', async () => {
      mockServer([]);
      renderDashboard();

      expect(await screen.findByText('No appointments scheduled for today.')).toBeInTheDocument();
      expect(screen.getByText('0 appointments today')).toBeInTheDocument();
    });

    it('shows an error when the queue fails to load', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network down'));
      renderDashboard();

      expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load today's appointments");
      expect(screen.queryByText(/appointments today/)).not.toBeInTheDocument();
    });
  });

  describe('Quick actions', () => {
    it('Start Consultation opens the new visit form with the patient pre-selected', async () => {
      const user = userEvent.setup();
      renderDashboard();
      await screen.findByText('Bob Smith');

      await user.click(within(getRow('Bob Smith')).getByRole('button', { name: 'Start Consultation' }));

      expect(mockNavigate).toHaveBeenCalledWith('/visits/new?patientId=p2');
    });

    it('marks an appointment done immediately and updates the stats', async () => {
      const user = userEvent.setup();
      let resolvePatch!: (value: unknown) => void;
      vi.mocked(apiClient.patch).mockImplementationOnce(
        () => new Promise((resolve) => { resolvePatch = resolve; })
      );
      renderDashboard();
      await screen.findByText('Bob Smith');

      await user.click(screen.getByRole('button', { name: 'Mark Bob Smith complete' }));

      // Optimistic: badge and Next marker move before the request resolves
      expect(within(getRow('Bob Smith')).getByText('Completed')).toBeInTheDocument();
      expect(within(getRow('Carol White')).getByText('Next')).toBeInTheDocument();
      expect(apiClient.patch).toHaveBeenCalledWith('/appointments/a2/status', { status: 'COMPLETED' });

      resolvePatch({ data: { success: true } });
      await waitFor(() => expect(showToast).toHaveBeenCalledWith('Appointment marked as completed', 'success'));
    });

    it('marks an appointment as no-show', async () => {
      const user = userEvent.setup();
      renderDashboard();
      await screen.findByText('Carol White');

      await user.click(screen.getByRole('button', { name: 'Mark Carol White as no-show' }));

      expect(apiClient.patch).toHaveBeenCalledWith('/appointments/a3/status', { status: 'NO_SHOW' });
      await waitFor(() => expect(within(getRow('Carol White')).getByText('No-show', { selector: '.appointment-status-badge' })).toBeInTheDocument());
    });

    it('rolls back when a status update fails', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.patch).mockRejectedValueOnce({ response: { data: { message: 'Server unavailable' } } });
      renderDashboard();
      await screen.findByText('Bob Smith');
      // Hold refetches so the rollback (not a refetch) is what restores the badge
      vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));

      await user.click(screen.getByRole('button', { name: 'Mark Bob Smith complete' }));

      await waitFor(() => expect(showToast).toHaveBeenCalledWith('Server unavailable', 'error'));
      expect(within(getRow('Bob Smith')).getByText('Scheduled')).toBeInTheDocument();
    });

    it('opens the patient profile from the queue', async () => {
      const user = userEvent.setup();
      renderDashboard();
      await screen.findByText('Bob Smith');

      await user.click(screen.getByRole('button', { name: 'Bob Smith' }));
      expect(mockNavigate).toHaveBeenCalledWith('/patients/p2');
    });

    it('View All Appointments goes to the appointments page', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'View All Appointments' }));
      expect(mockNavigate).toHaveBeenCalledWith('/appointments');
    });

    it('Schedule Appointment opens the scheduling modal', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Schedule Appointment' }));
      expect(screen.getByRole('dialog', { name: 'Schedule Appointment' })).toBeInTheDocument();
    });

    it('Search Patient goes to the patient list', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Search Patient' }));
      expect(mockNavigate).toHaveBeenCalledWith('/patients');
    });
  });
});
