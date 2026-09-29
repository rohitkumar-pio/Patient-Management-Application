import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { NewVisitForm } from '../pages/NewVisit/NewVisitForm';
import apiClient from '../lib/api';

// Mock API client
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock toast notifications (the form imports showToast from components/Toast)
vi.mock('../components/Toast', () => ({
  showToast: vi.fn(),
}));

// Stub the prescription preview (it has its own test suite and pulls in jsPDF)
vi.mock('../components/PrescriptionPreview', () => ({
  PrescriptionPreview: ({ visitId, onClose }: { visitId: string; onClose: () => void }) => (
    <div role="dialog" aria-label="Prescription preview">
      <p>Prescription preview for {visitId}</p>
      <button type="button" onClick={onClose}>
        Close preview
      </button>
    </div>
  ),
}));

import { showToast } from '../components/Toast';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const DRAFT_KEY = 'visit-draft';

const mockPatients = [
  {
    id: 'patient-1',
    name: 'John Doe',
    age: 30,
    gender: 'Male',
    phone: '1234567890',
    visitCount: 5,
  },
  {
    id: 'patient-2',
    name: 'Jane Smith',
    age: 25,
    gender: 'Female',
    phone: '0987654321',
    visitCount: 3,
  },
];

// Mirrors the backend: GET /patients -> { success, data: Patient[], pagination }
// and GET /patients/:id -> { success, data: Patient }
const mockGetImplementation = (url: string) => {
  if (url.startsWith('/patients?')) {
    return Promise.resolve({
      data: {
        success: true,
        data: mockPatients,
        pagination: { total: 2, page: 1, limit: 100, totalPages: 1 },
      },
    });
  }
  const match = url.match(/^\/patients\/([^/?]+)$/);
  if (match) {
    const patient = mockPatients.find((p) => p.id === match[1]);
    return patient
      ? Promise.resolve({ data: { success: true, data: patient } })
      : Promise.reject(new Error('Patient not found'));
  }
  return Promise.reject(new Error(`Unexpected GET ${url}`));
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

// Queries
const getPatientSelect = () => screen.getByRole('combobox', { name: /select patient/i });
const getTemperatureInput = () => screen.getByLabelText(/temperature/i);
const getBloodPressureInput = () => screen.getByLabelText(/blood pressure/i);
const getPulseInput = () => screen.getByLabelText(/pulse/i);
const getComplaintsTextarea = () => screen.getByPlaceholderText(/describe patient's symptoms/i);
const getDiagnosisTextarea = () => screen.getByPlaceholderText(/enter diagnosis and treatment plan/i);
const getSaveButton = () => screen.getByRole('button', { name: /^save visit$/i });
const getAddMedicationButton = () => screen.getByRole('button', { name: /add medication/i });

const waitForPatientsLoaded = () => screen.findByRole('option', { name: /John Doe/ });

type User = ReturnType<typeof userEvent.setup>;

const fillRequiredFields = async (user: User, complaints = 'Test complaint') => {
  await waitForPatientsLoaded();
  await user.selectOptions(getPatientSelect(), 'patient-1');
  await user.type(getTemperatureInput(), '37.5');
  await user.type(getBloodPressureInput(), '120/80');
  await user.type(getPulseInput(), '75');
  await user.type(getComplaintsTextarea(), complaints);
};

const fillMedicationRow = async (
  user: User,
  index: number,
  med: { name: string; dosage: string; frequency: string; duration: string }
) => {
  await user.type(screen.getAllByPlaceholderText(/med name/i)[index], med.name);
  await user.type(screen.getAllByPlaceholderText(/e\.g\., 500mg/i)[index], med.dosage);
  await user.type(screen.getAllByPlaceholderText(/e\.g\., twice daily/i)[index], med.frequency);
  await user.type(screen.getAllByPlaceholderText(/e\.g\., 5 days/i)[index], med.duration);
};

describe('NewVisitForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    (apiClient.get as any).mockImplementation(mockGetImplementation);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Form Rendering', () => {
    it('should render all form sections', async () => {
      renderWithProviders(<NewVisitForm />);

      expect(
        await screen.findByRole('heading', { level: 1, name: /new consultation/i })
      ).toBeInTheDocument();

      expect(screen.getByRole('heading', { name: /patient selection/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /vitals/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /complaints/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /diagnosis/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /^medications$/i })).toBeInTheDocument();
    });

    it('should render patient dropdown', async () => {
      renderWithProviders(<NewVisitForm />);

      await waitForPatientsLoaded();
      const patientSelect = getPatientSelect();
      expect(patientSelect).toBeEnabled();
      expect(within(patientSelect).getByRole('option', { name: /select a patient/i })).toBeInTheDocument();
    });

    it('should render vitals input fields', () => {
      renderWithProviders(<NewVisitForm />);

      expect(getTemperatureInput()).toHaveAttribute('placeholder', 'e.g., 37.5');
      expect(getBloodPressureInput()).toHaveAttribute('placeholder', 'e.g., 120/80');
      expect(getPulseInput()).toHaveAttribute('placeholder', 'e.g., 72');
    });

    it('should render complaints and diagnosis textareas', () => {
      renderWithProviders(<NewVisitForm />);

      expect(getComplaintsTextarea().tagName).toBe('TEXTAREA');
      expect(getDiagnosisTextarea().tagName).toBe('TEXTAREA');
    });

    it('should render medication section with Add button', () => {
      renderWithProviders(<NewVisitForm />);

      expect(getAddMedicationButton()).toBeInTheDocument();
    });

    it('should render form action buttons', () => {
      renderWithProviders(<NewVisitForm />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(getSaveButton()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save & print/i })).toBeInTheDocument();
    });
  });

  describe('Patient Selection', () => {
    it('should load and display patients in dropdown', async () => {
      renderWithProviders(<NewVisitForm />);

      await waitForPatientsLoaded();

      expect(apiClient.get).toHaveBeenCalledWith('/patients?limit=100');
      const select = getPatientSelect();
      expect(
        within(select).getByRole('option', { name: 'John Doe - 30 years - 1234567890' })
      ).toHaveValue('patient-1');
      expect(
        within(select).getByRole('option', { name: 'Jane Smith - 25 years - 0987654321' })
      ).toHaveValue('patient-2');
    });

    it('should display patient information after selection', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await waitForPatientsLoaded();
      await user.selectOptions(getPatientSelect(), 'patient-1');

      expect(
        await screen.findByText((_, el) => el?.textContent === 'Name: John Doe')
      ).toBeInTheDocument();
      expect(screen.getByText((_, el) => el?.textContent === 'Gender: Male')).toBeInTheDocument();
      expect(screen.getByText((_, el) => el?.textContent === 'Total Visits: 5')).toBeInTheDocument();
      expect(apiClient.get).toHaveBeenCalledWith('/patients/patient-1');
    });
  });

  describe('Vitals Validation', () => {
    it('should show error for invalid temperature (too low)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await user.type(getTemperatureInput(), '30');
      await user.click(getSaveButton());

      expect(
        await screen.findByText(/temperature must be between 35°C and 42°C/i)
      ).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should show error for invalid temperature (too high)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await user.type(getTemperatureInput(), '45');
      await user.click(getSaveButton());

      expect(
        await screen.findByText(/temperature must be between 35°C and 42°C/i)
      ).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should show error for invalid blood pressure format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await user.type(getBloodPressureInput(), 'invalid');
      await user.click(getSaveButton());

      expect(await screen.findByText(/format: xxx\/yyy/i)).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should show error for invalid pulse (too low)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await user.type(getPulseInput(), '30');
      await user.click(getSaveButton());

      expect(
        await screen.findByText(/pulse must be between 40 and 200 bpm/i)
      ).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should accept valid vitals', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await user.type(getTemperatureInput(), '37.5');
      await user.type(getBloodPressureInput(), '120/80');
      await user.type(getPulseInput(), '75');
      await user.click(getSaveButton());

      // Other required fields fail, proving validation ran...
      expect(await screen.findByText(/please select a patient/i)).toBeInTheDocument();
      // ...but no vitals errors are reported
      expect(screen.queryByText(/temperature (is required|must be)/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/blood pressure is required|format: xxx\/yyy|invalid blood pressure/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/pulse (is required|must be)/i)).not.toBeInTheDocument();
    });
  });

  describe('Complaints and Diagnosis', () => {
    it('should show character count for complaints', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await user.type(getComplaintsTextarea(), 'Test complaint');

      expect(screen.getByText('14 / 1000')).toBeInTheDocument();
    });

    it('should show error when complaints exceed max length', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await user.click(getComplaintsTextarea());
      await user.paste('a'.repeat(1001));
      expect(screen.getByText('1001 / 1000')).toBeInTheDocument();

      await user.click(getSaveButton());

      expect(await screen.findByText(/maximum 1000 characters/i)).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should show character count for diagnosis', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await user.type(getDiagnosisTextarea(), 'Test diagnosis');

      expect(screen.getByText('14 / 2000')).toBeInTheDocument();
    });
  });

  describe('Medication Management', () => {
    it('should show empty state when no medications added', () => {
      renderWithProviders(<NewVisitForm />);

      expect(screen.getByText(/no medications added/i)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/med name/i)).not.toBeInTheDocument();
    });

    it('should add medication row when Add Medication clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await user.click(getAddMedicationButton());

      expect(screen.getByPlaceholderText(/med name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e\.g\., 500mg/i)).toBeInTheDocument();
      expect(screen.queryByText(/no medications added/i)).not.toBeInTheDocument();
    });

    it('should add multiple medication rows', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const addButton = getAddMedicationButton();
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);

      expect(screen.getAllByPlaceholderText(/med name/i)).toHaveLength(3);
    });

    it('should remove medication row when remove button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const addButton = getAddMedicationButton();
      await user.click(addButton);
      await user.click(addButton);

      const nameInputs = screen.getAllByPlaceholderText(/med name/i);
      expect(nameInputs).toHaveLength(2);
      await user.type(nameInputs[0], 'Paracetamol');
      await user.type(nameInputs[1], 'Ibuprofen');

      const removeButtons = screen.getAllByRole('button', { name: '×' });
      await user.click(removeButtons[0]);

      const remaining = screen.getAllByPlaceholderText(/med name/i);
      expect(remaining).toHaveLength(1);
      expect(remaining[0]).toHaveValue('Ibuprofen');
    });

    it('should validate medication fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await fillRequiredFields(user);
      await user.click(getAddMedicationButton());
      await user.type(screen.getByPlaceholderText(/med name/i), 'P');
      await user.click(getSaveButton());

      expect(await screen.findByText(/name is required \(min 2 characters\)/i)).toBeInTheDocument();
      expect(screen.getByText(/dosage is required/i)).toBeInTheDocument();
      expect(screen.getByText(/frequency is required/i)).toBeInTheDocument();
      expect(screen.getByText(/duration is required/i)).toBeInTheDocument();
      expect(apiClient.post).not.toHaveBeenCalled();

      // Filled fields keep their values
      const dosageInput = screen.getByPlaceholderText(/e\.g\., 500mg/i);
      await user.type(dosageInput, '500mg');
      expect(screen.getByPlaceholderText(/med name/i)).toHaveValue('P');
      expect(dosageInput).toHaveValue('500mg');
    });
  });

  describe('Auto-Save Functionality', () => {
    const readDraft = () => {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    };

    it('should not auto-save before a patient is selected', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<NewVisitForm />);

      await user.type(getComplaintsTextarea(), 'Test');
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(readDraft()).toBeNull();
    });

    it('should auto-save after 30 seconds', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<NewVisitForm />);

      await waitForPatientsLoaded();
      await user.selectOptions(getPatientSelect(), 'patient-1');
      await user.type(getComplaintsTextarea(), 'Test');

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      const draft = readDraft();
      expect(draft).not.toBeNull();
      expect(draft.data).toEqual(
        expect.objectContaining({ patientId: 'patient-1', complaints: 'Test' })
      );
    });

    it('should show draft saved indicator', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(<NewVisitForm />);

      await waitForPatientsLoaded();
      await user.selectOptions(getPatientSelect(), 'patient-1');
      await user.type(getComplaintsTextarea(), 'Test');
      expect(screen.queryByText(/draft saved at/i)).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(await screen.findByText(/draft saved at/i)).toBeInTheDocument();
    });

    it('should offer to resume a saved draft on mount', async () => {
      const user = userEvent.setup();
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          data: {
            patientId: 'patient-1',
            temperature: '37.2',
            bloodPressure: '118/76',
            pulse: '70',
            complaints: 'Saved complaint',
            diagnosis: '',
            medications: [],
          },
          savedAt: new Date().toISOString(),
        })
      );

      renderWithProviders(<NewVisitForm />);

      expect(await screen.findByRole('heading', { name: /resume draft\?/i })).toBeInTheDocument();
      await waitForPatientsLoaded();
      await user.click(screen.getByRole('button', { name: /resume draft/i }));

      expect(getComplaintsTextarea()).toHaveValue('Saved complaint');
      expect(getBloodPressureInput()).toHaveValue('118/76');
      expect(getPatientSelect()).toHaveValue('patient-1');
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();

      (apiClient.post as any).mockResolvedValue({
        data: {
          success: true,
          data: { id: 'visit-1', patientId: 'patient-1' },
        },
      });

      renderWithProviders(<NewVisitForm />);

      await fillRequiredFields(user);
      await user.type(getDiagnosisTextarea(), 'Test diagnosis');

      await user.click(getAddMedicationButton());
      await fillMedicationRow(user, 0, {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
      });

      await user.click(getSaveButton());

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/visits', {
          patientId: 'patient-1',
          complaints: 'Test complaint',
          diagnosis: 'Test diagnosis',
          temperature: 37.5,
          bloodPressure: '120/80',
          pulse: 75,
          medications: [
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: '5 days',
              instructions: '',
            },
          ],
        });
      });
      expect(showToast).toHaveBeenCalledWith('Visit recorded successfully', 'success');

      // After saving, the user is asked what to do next instead of being redirected
      expect(await screen.findByRole('heading', { name: /visit saved/i })).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: /view patient profile/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-1');
    });

    it('should open prescription preview from the Visit Saved dialog', async () => {
      const user = userEvent.setup();

      (apiClient.post as any).mockResolvedValue({
        data: { success: true, data: { id: 'visit-1' } },
      });

      renderWithProviders(<NewVisitForm />);

      await fillRequiredFields(user);
      await user.click(getSaveButton());

      await screen.findByRole('heading', { name: /visit saved/i });
      await user.click(screen.getByRole('button', { name: /^print prescription$/i }));

      const preview = await screen.findByRole('dialog', { name: /prescription preview/i });
      expect(within(preview).getByText(/prescription preview for visit-1/i)).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /visit saved/i })).not.toBeInTheDocument();

      await user.click(within(preview).getByRole('button', { name: /close preview/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-1');
    });

    it('should open prescription preview directly on Save & Print', async () => {
      const user = userEvent.setup();

      (apiClient.post as any).mockResolvedValue({
        data: { success: true, data: { id: 'visit-1' } },
      });

      renderWithProviders(<NewVisitForm />);

      await fillRequiredFields(user);
      await user.click(screen.getByRole('button', { name: /save & print prescription/i }));

      expect(await screen.findByRole('dialog', { name: /prescription preview/i })).toBeInTheDocument();
      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('heading', { name: /visit saved/i })).not.toBeInTheDocument();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();

      // API call that never resolves during the test
      (apiClient.post as any).mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<NewVisitForm />);

      await fillRequiredFields(user, 'Test');

      const submitButton = getSaveButton();
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
      expect(submitButton).toHaveTextContent('Saving...');
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });

    it('should clear draft after successful submission', async () => {
      const user = userEvent.setup();

      (apiClient.post as any).mockResolvedValue({
        data: { success: true, data: { id: 'visit-1' } },
      });

      // Pre-existing draft without a patient (no resume prompt is shown)
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ data: { complaints: 'Old draft' }, savedAt: new Date().toISOString() })
      );

      renderWithProviders(<NewVisitForm />);

      await fillRequiredFields(user, 'Test');
      expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();

      await user.click(getSaveButton());

      await screen.findByRole('heading', { name: /visit saved/i });
      expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    });

    it('should handle submission error', async () => {
      const user = userEvent.setup();

      (apiClient.post as any).mockRejectedValue({
        response: { data: { message: 'Submission failed' } },
      });

      renderWithProviders(<NewVisitForm />);

      await fillRequiredFields(user, 'Test');

      const submitButton = getSaveButton();
      await user.click(submitButton);

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith('Submission failed', 'error');
      });
      // Form is re-enabled and the user stays on the form
      expect(submitButton).toBeEnabled();
      expect(submitButton).toHaveTextContent('Save Visit');
      expect(screen.queryByRole('heading', { name: /visit saved/i })).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(getComplaintsTextarea()).toHaveValue('Test');
    });
  });

  describe('Performance Test', () => {
    it('should complete full form interaction in reasonable time', async () => {
      const user = userEvent.setup({ delay: null });
      const startTime = Date.now();

      (apiClient.post as any).mockResolvedValue({
        data: { success: true, data: { id: 'visit-1' } },
      });

      renderWithProviders(<NewVisitForm />);

      await fillRequiredFields(user);
      await user.type(getDiagnosisTextarea(), 'Test diagnosis');

      const addButton = getAddMedicationButton();
      await user.click(addButton);
      await user.click(addButton);
      await fillMedicationRow(user, 0, {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
      });
      await fillMedicationRow(user, 1, {
        name: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'Thrice daily',
        duration: '3 days',
      });

      await user.click(getSaveButton());

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/visits',
          expect.objectContaining({
            medications: [
              expect.objectContaining({ name: 'Paracetamol' }),
              expect.objectContaining({ name: 'Ibuprofen' }),
            ],
          })
        );
      });
      await screen.findByRole('heading', { name: /visit saved/i });

      const duration = (Date.now() - startTime) / 1000;

      // BRD requirement: < 3 minutes (180 seconds)
      // In test environment, should be much faster
      expect(duration).toBeLessThan(10);
    });
  });
});
