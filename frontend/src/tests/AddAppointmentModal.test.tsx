import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddAppointmentModal } from '../components/AddAppointmentModal';
import { toDateString, shiftDate } from '../lib/appointments';
import apiClient from '../lib/api';
import { showToast } from '../components/Toast';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../components/Toast', () => ({
  showToast: vi.fn(),
}));

const FUTURE_DATE = '2030-03-12';

const patients = [
  { id: 'patient-1', name: 'John Doe', phone: '1234567890' },
  { id: 'patient-2', name: 'Jane Smith', phone: '0987654321' },
];

const localIso = (date: string, hours: number, minutes: number) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, hours, minutes).toISOString();
};

let dayAppointments: any[] = [];

const mockApi = () => {
  vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
    if (url.startsWith('/patients')) {
      const search = new URLSearchParams(url.split('?')[1]).get('search')?.toLowerCase();
      const data = search
        ? patients.filter((p) => p.name.toLowerCase().includes(search) || p.phone.includes(search))
        : patients;
      return { data: { success: true, data } };
    }
    if (url.startsWith('/appointments')) {
      return { data: { success: true, data: dayAppointments } };
    }
    throw new Error(`Unexpected GET ${url}`);
  });
  vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true, data: { id: 'new' } } });
};

const renderModal = (props: Partial<React.ComponentProps<typeof AddAppointmentModal>> = {}) => {
  const onClose = vi.fn();
  const onCreated = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <AddAppointmentModal isOpen onClose={onClose} onCreated={onCreated} {...props} />
    </QueryClientProvider>
  );
  return { onClose, onCreated, dialog: within(screen.getByRole('dialog', { name: 'Schedule Appointment' })) };
};

const pickPatient = async (
  user: ReturnType<typeof userEvent.setup>,
  dialog: ReturnType<typeof within>,
  name: string
) => {
  await user.type(dialog.getByRole('combobox'), name.split(' ')[0]);
  await user.click(await dialog.findByRole('option', { name: new RegExp(name) }));
};

describe('AddAppointmentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dayAppointments = [];
    mockApi();
  });

  describe('Open and close', () => {
    it('renders nothing when closed', () => {
      render(
        <QueryClientProvider client={new QueryClient()}>
          <AddAppointmentModal isOpen={false} onClose={vi.fn()} />
        </QueryClientProvider>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes with Cancel, the close button, the overlay and Escape', async () => {
      const user = userEvent.setup();
      const { onClose, dialog } = renderModal();

      await user.click(dialog.getByRole('button', { name: 'Cancel' }));
      await user.click(dialog.getByRole('button', { name: 'Close' }));
      fireEvent.click(document.querySelector('.add-appointment-overlay')!);
      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(4);
    });

    it('does not close when clicking inside the dialog', async () => {
      const user = userEvent.setup();
      const { onClose, dialog } = renderModal();

      await user.click(dialog.getByRole('heading', { name: 'Schedule Appointment' }));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Defaults', () => {
    it('defaults the date to today', () => {
      const { dialog } = renderModal();
      expect(dialog.getByLabelText(/^Date/)).toHaveValue(toDateString(new Date()));
    });

    it('uses a future defaultDate', () => {
      const { dialog } = renderModal({ defaultDate: FUTURE_DATE });
      expect(dialog.getByLabelText(/^Date/)).toHaveValue(FUTURE_DATE);
    });

    it('falls back to today for a past defaultDate', () => {
      const { dialog } = renderModal({ defaultDate: shiftDate(toDateString(new Date()), -3) });
      expect(dialog.getByLabelText(/^Date/)).toHaveValue(toDateString(new Date()));
    });
  });

  describe('Patient selection', () => {
    it('searches patients by the typed term and shows name and phone', async () => {
      const user = userEvent.setup();
      const { dialog } = renderModal();

      await user.type(dialog.getByRole('combobox'), 'jan');

      // Results update once the debounced search request completes
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/patients?page=1&limit=10&search=jan');
        expect(dialog.queryByRole('option', { name: /John Doe/ })).not.toBeInTheDocument();
      });
      expect(dialog.getByRole('option', { name: /Jane Smith/ })).toHaveTextContent('0987654321');
    });

    it('shows a message when no patients match', async () => {
      const user = userEvent.setup();
      const { dialog } = renderModal();

      await user.type(dialog.getByRole('combobox'), 'zzz');
      expect(await dialog.findByText('No patients found')).toBeInTheDocument();
    });

    it('shows the selected patient with phone for confirmation and allows changing', async () => {
      const user = userEvent.setup();
      const { dialog } = renderModal();

      await pickPatient(user, dialog, 'Jane Smith');

      expect(dialog.queryByRole('combobox')).not.toBeInTheDocument();
      expect(dialog.getByText('Jane Smith')).toBeInTheDocument();
      expect(dialog.getByText(/0987654321/)).toBeInTheDocument();

      await user.click(dialog.getByRole('button', { name: 'Change' }));
      expect(dialog.getByRole('combobox')).toBeInTheDocument();
    });

    it('supports keyboard selection without submitting the form', async () => {
      const user = userEvent.setup();
      const { dialog } = renderModal();

      const input = dialog.getByRole('combobox');
      await user.click(input);
      await dialog.findByRole('option', { name: /John Doe/ });
      await user.keyboard('{ArrowDown}{Enter}');

      expect(dialog.getByText('Jane Smith')).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('Escape in the open list closes the list, not the modal', async () => {
      const user = userEvent.setup();
      const { onClose, dialog } = renderModal();

      await user.click(dialog.getByRole('combobox'));
      await dialog.findByRole('listbox');
      await user.keyboard('{Escape}');

      expect(dialog.queryByRole('listbox')).not.toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('locks a pre-selected patient', () => {
      const { dialog } = renderModal({ patient: patients[0] });

      expect(dialog.queryByRole('combobox')).not.toBeInTheDocument();
      expect(dialog.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument();
      expect(dialog.getByText('John Doe')).toBeInTheDocument();
      expect(dialog.getByText(/1234567890/)).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('requires a patient', async () => {
      const user = userEvent.setup();
      const { dialog } = renderModal();

      await user.click(dialog.getByRole('button', { name: 'Schedule' }));

      expect(await dialog.findByText('Please select a patient')).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('rejects a past date', async () => {
      const user = userEvent.setup();
      const { dialog } = renderModal({ patient: patients[0] });

      fireEvent.change(dialog.getByLabelText(/^Date/), {
        target: { value: shiftDate(toDateString(new Date()), -1) },
      });
      await user.click(dialog.getByRole('button', { name: 'Schedule' }));

      expect(await dialog.findByText('Date cannot be in the past')).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('requires a date', async () => {
      const user = userEvent.setup();
      const { dialog } = renderModal({ patient: patients[0] });

      fireEvent.change(dialog.getByLabelText(/^Date/), { target: { value: '' } });
      await user.click(dialog.getByRole('button', { name: 'Schedule' }));

      expect(await dialog.findByText('Date is required')).toBeInTheDocument();
    });

    it('limits notes to 1000 characters', async () => {
      const user = userEvent.setup();
      const { dialog } = renderModal({ patient: patients[0] });

      fireEvent.change(dialog.getByLabelText(/^Notes/), { target: { value: 'a'.repeat(1001) } });
      await user.click(dialog.getByRole('button', { name: 'Schedule' }));

      expect(await dialog.findByText('Notes must not exceed 1000 characters')).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('Duplicate warning', () => {
    it('warns when the patient already has an appointment that day, but still allows scheduling', async () => {
      const user = userEvent.setup();
      dayAppointments = [
        { id: 'a1', patientId: 'patient-1', appointmentDate: localIso(FUTURE_DATE, 9, 0), status: 'SCHEDULED' },
      ];
      const { dialog, onCreated } = renderModal({ defaultDate: FUTURE_DATE, patient: patients[0] });

      const warning = await dialog.findByRole('status');
      expect(warning).toHaveTextContent('John Doe already has an appointment on');
      expect(warning).toHaveTextContent(/9:00.*\(scheduled\)/);
      expect(apiClient.get).toHaveBeenCalledWith(`/appointments?date=${FUTURE_DATE}`);

      await user.click(dialog.getByRole('button', { name: 'Schedule Anyway' }));
      await waitFor(() => expect(onCreated).toHaveBeenCalledWith(FUTURE_DATE));
    });

    it('ignores cancelled appointments and other patients', async () => {
      dayAppointments = [
        { id: 'a1', patientId: 'patient-1', appointmentDate: localIso(FUTURE_DATE, 9, 0), status: 'CANCELLED' },
        { id: 'a2', patientId: 'patient-2', appointmentDate: localIso(FUTURE_DATE, 10, 0), status: 'SCHEDULED' },
      ];
      const { dialog } = renderModal({ defaultDate: FUTURE_DATE, patient: patients[0] });

      await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith(`/appointments?date=${FUTURE_DATE}`));
      expect(dialog.queryByRole('status')).not.toBeInTheDocument();
      expect(dialog.getByRole('button', { name: 'Schedule' })).toBeInTheDocument();
    });

    it('re-checks when the date changes', async () => {
      dayAppointments = [
        { id: 'a1', patientId: 'patient-1', appointmentDate: localIso(FUTURE_DATE, 9, 0), status: 'SCHEDULED' },
      ];
      const { dialog } = renderModal({ defaultDate: '2030-03-13', patient: patients[0] });

      await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith('/appointments?date=2030-03-13'));
      fireEvent.change(dialog.getByLabelText(/^Date/), { target: { value: FUTURE_DATE } });

      await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith(`/appointments?date=${FUTURE_DATE}`));
    });
  });

  describe('Submit', () => {
    it('creates the appointment, shows a success message and closes', async () => {
      const user = userEvent.setup();
      const { dialog, onClose, onCreated } = renderModal({ defaultDate: FUTURE_DATE });

      await pickPatient(user, dialog, 'Jane Smith');
      fireEvent.change(dialog.getByLabelText(/^Time/), { target: { value: '14:30' } });
      await user.type(dialog.getByLabelText(/^Notes/), '  Blood test review  ');
      await user.click(dialog.getByRole('button', { name: 'Schedule' }));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/appointments', {
          patientId: 'patient-2',
          appointmentDate: localIso(FUTURE_DATE, 14, 30),
          notes: 'Blood test review',
        });
      });
      expect(showToast).toHaveBeenCalledWith(
        expect.stringMatching(/^Appointment scheduled for Jane Smith on Tuesday/),
        'success'
      );
      expect(onCreated).toHaveBeenCalledWith(FUTURE_DATE);
      expect(onClose).toHaveBeenCalled();
    });

    it('stores local midnight when no time is given and omits empty notes', async () => {
      const user = userEvent.setup();
      const { dialog } = renderModal({ defaultDate: FUTURE_DATE, patient: patients[0] });

      await user.click(dialog.getByRole('button', { name: 'Schedule' }));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/appointments', {
          patientId: 'patient-1',
          appointmentDate: localIso(FUTURE_DATE, 0, 0),
        });
      });
    });

    it('shows the server error and stays open on failure', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockRejectedValue({ response: { data: { message: 'Patient not found' } } });
      const { dialog, onClose, onCreated } = renderModal({ patient: patients[0] });

      await user.click(dialog.getByRole('button', { name: 'Schedule' }));

      expect(await dialog.findByRole('alert')).toHaveTextContent('Patient not found');
      expect(onClose).not.toHaveBeenCalled();
      expect(onCreated).not.toHaveBeenCalled();
    });

    it('disables the buttons while submitting', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.post).mockImplementation(() => new Promise(() => {}));
      const { dialog } = renderModal({ patient: patients[0] });

      await user.click(dialog.getByRole('button', { name: 'Schedule' }));

      expect(await dialog.findByRole('button', { name: 'Scheduling...' })).toBeDisabled();
      expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });
});
