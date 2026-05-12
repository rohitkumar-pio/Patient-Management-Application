import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
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

// Mock toast notifications
vi.mock('../utils', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

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

describe('NewVisitForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    
    // Mock patients API response
    (apiClient.get as any).mockResolvedValue({
      data: {
        success: true,
        data: {
          patients: mockPatients,
          pagination: {
            total: 2,
            page: 1,
            limit: 100,
            totalPages: 1,
          },
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Form Rendering', () => {
    it('should render all form sections', async () => {
      renderWithProviders(<NewVisitForm />);

      await waitFor(() => {
        expect(screen.getByText(/Record New Visit/i)).toBeInTheDocument();
      });

      // Check all sections are rendered
      expect(screen.getByText(/Patient Selection/i)).toBeInTheDocument();
      expect(screen.getByText(/Vitals/i)).toBeInTheDocument();
      expect(screen.getByText(/Complaints/i)).toBeInTheDocument();
      expect(screen.getByText(/Diagnosis/i)).toBeInTheDocument();
      expect(screen.getByText(/Medications/i)).toBeInTheDocument();
    });

    it('should render patient dropdown', async () => {
      renderWithProviders(<NewVisitForm />);

      await waitFor(() => {
        const patientSelect = screen.getByRole('combobox', { name: /patient/i });
        expect(patientSelect).toBeInTheDocument();
      });
    });

    it('should render vitals input fields', async () => {
      renderWithProviders(<NewVisitForm />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/37.0/i)).toBeInTheDocument(); // Temperature
        expect(screen.getByPlaceholderText(/120\/80/i)).toBeInTheDocument(); // Blood Pressure
        expect(screen.getByPlaceholderText(/75/i)).toBeInTheDocument(); // Pulse
      });
    });

    it('should render complaints and diagnosis textareas', () => {
      renderWithProviders(<NewVisitForm />);

      const complaintsTextarea = screen.getByPlaceholderText(/describe symptoms/i);
      const diagnosisTextarea = screen.getByPlaceholderText(/diagnosis details/i);

      expect(complaintsTextarea).toBeInTheDocument();
      expect(diagnosisTextarea).toBeInTheDocument();
    });

    it('should render medication section with Add button', () => {
      renderWithProviders(<NewVisitForm />);

      const addMedicationButton = screen.getByRole('button', { name: /add medication/i });
      expect(addMedicationButton).toBeInTheDocument();
    });

    it('should render form action buttons', () => {
      renderWithProviders(<NewVisitForm />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save visit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save & print/i })).toBeInTheDocument();
    });
  });

  describe('Patient Selection', () => {
    it('should load and display patients in dropdown', async () => {
      renderWithProviders(<NewVisitForm />);

      await waitFor(() => {
        const patientSelect = screen.getByRole('combobox', { name: /patient/i });
        expect(patientSelect).toBeInTheDocument();
      });

      // Check that API was called
      expect(apiClient.get).toHaveBeenCalledWith('/patients?limit=100');
    });

    it('should display patient information after selection', async () => {
      renderWithProviders(<NewVisitForm />);

      await waitFor(() => {
        const patientSelect = screen.getByRole('combobox', { name: /patient/i });
        fireEvent.change(patientSelect, { target: { value: 'patient-1' } });
      });

      // Wait for patient info to be displayed
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });

  describe('Vitals Validation', () => {
    it('should show error for invalid temperature (too low)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      await waitFor(() => {
        const tempInput = screen.getByPlaceholderText(/37.0/i);
        expect(tempInput).toBeInTheDocument();
      });

      const tempInput = screen.getByPlaceholderText(/37.0/i);
      await user.clear(tempInput);
      await user.type(tempInput, '30');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/temperature must be at least 35/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid temperature (too high)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const tempInput = await screen.findByPlaceholderText(/37.0/i);
      await user.clear(tempInput);
      await user.type(tempInput, '45');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/temperature must not exceed 42/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid blood pressure format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const bpInput = await screen.findByPlaceholderText(/120\/80/i);
      await user.clear(bpInput);
      await user.type(bpInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/blood pressure must be in/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid pulse (too low)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const pulseInput = await screen.findByPlaceholderText(/75/i);
      await user.clear(pulseInput);
      await user.type(pulseInput, '30');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/pulse must be at least 40/i)).toBeInTheDocument();
      });
    });

    it('should accept valid vitals', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const tempInput = await screen.findByPlaceholderText(/37.0/i);
      const bpInput = await screen.findByPlaceholderText(/120\/80/i);
      const pulseInput = await screen.findByPlaceholderText(/75/i);

      await user.clear(tempInput);
      await user.type(tempInput, '37.5');
      await user.clear(bpInput);
      await user.type(bpInput, '120/80');
      await user.clear(pulseInput);
      await user.type(pulseInput, '75');

      await waitFor(() => {
        const errors = screen.queryAllByRole('alert');
        expect(errors.length).toBe(0);
      });
    });
  });

  describe('Complaints and Diagnosis', () => {
    it('should show character count for complaints', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const complaintsTextarea = screen.getByPlaceholderText(/describe symptoms/i);
      await user.type(complaintsTextarea, 'Test complaint');

      await waitFor(() => {
        expect(screen.getByText(/14 \/ 1000/)).toBeInTheDocument();
      });
    });

    it('should show error when complaints exceed max length', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const complaintsTextarea = screen.getByPlaceholderText(/describe symptoms/i);
      const longText = 'a'.repeat(1001);
      await user.type(complaintsTextarea, longText);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/complaints must not exceed 1000/i)).toBeInTheDocument();
      });
    });

    it('should show character count for diagnosis', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const diagnosisTextarea = screen.getByPlaceholderText(/diagnosis details/i);
      await user.type(diagnosisTextarea, 'Test diagnosis');

      await waitFor(() => {
        expect(screen.getByText(/14 \/ 2000/)).toBeInTheDocument();
      });
    });
  });

  describe('Medication Management', () => {
    it('should show empty state when no medications added', () => {
      renderWithProviders(<NewVisitForm />);

      expect(screen.getByText(/no medications added yet/i)).toBeInTheDocument();
    });

    it('should add medication row when Add Medication clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const addButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/medication name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/e.g., 500mg/i)).toBeInTheDocument();
      });
    });

    it('should add multiple medication rows', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const addButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);

      await waitFor(() => {
        const medicationNames = screen.getAllByPlaceholderText(/medication name/i);
        expect(medicationNames).toHaveLength(3);
      });
    });

    it('should remove medication row when remove button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      const addButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(addButton);
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getAllByPlaceholderText(/medication name/i)).toHaveLength(2);
      });

      const removeButtons = screen.getAllByRole('button', { name: /×/ });
      await user.click(removeButtons[0]);

      await waitFor(() => {
        expect(screen.getAllByPlaceholderText(/medication name/i)).toHaveLength(1);
      });
    });

    it('should validate medication fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NewVisitForm />);

      // Add medication row
      const addButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/medication name/i)).toBeInTheDocument();
      });

      // Fill in medication details
      const nameInput = screen.getByPlaceholderText(/medication name/i);
      await user.type(nameInput, 'Paracetamol');

      const dosageInput = screen.getByPlaceholderText(/e.g., 500mg/i);
      await user.type(dosageInput, '500mg');

      // Fields should be filled
      expect(nameInput).toHaveValue('Paracetamol');
      expect(dosageInput).toHaveValue('500mg');
    });
  });

  describe('Auto-Save Functionality', () => {
    it('should save draft to localStorage on blur', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<NewVisitForm />);

      const complaintsTextarea = screen.getByPlaceholderText(/describe symptoms/i);
      await user.type(complaintsTextarea, 'Test complaint');
      await user.tab();

      // Fast-forward time to trigger auto-save
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        const savedData = localStorage.getItem('visit-draft');
        expect(savedData).toBeTruthy();
      });

      vi.useRealTimers();
    });

    it('should auto-save after 30 seconds', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<NewVisitForm />);

      const complaintsTextarea = screen.getByPlaceholderText(/describe symptoms/i);
      await user.type(complaintsTextarea, 'Test');

      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30000);

      await waitFor(() => {
        const savedData = localStorage.getItem('visit-draft');
        expect(savedData).toBeTruthy();
      });

      vi.useRealTimers();
    });

    it('should show draft saved indicator', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<NewVisitForm />);

      const complaintsTextarea = screen.getByPlaceholderText(/describe symptoms/i);
      await user.type(complaintsTextarea, 'Test');

      // Trigger auto-save
      vi.advanceTimersByTime(30000);

      await waitFor(() => {
        expect(screen.getByText(/draft saved/i)).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      
      (apiClient.post as any).mockResolvedValue({
        data: {
          success: true,
          data: {
            id: 'visit-1',
            patientId: 'patient-1',
          },
        },
      });

      renderWithProviders(<NewVisitForm />);

      await waitFor(() => {
        const patientSelect = screen.getByRole('combobox', { name: /patient/i });
        expect(patientSelect).toBeInTheDocument();
      });

      // Select patient
      const patientSelect = screen.getByRole('combobox', { name: /patient/i });
      await user.selectOptions(patientSelect, 'patient-1');

      // Fill vitals
      const tempInput = screen.getByPlaceholderText(/37.0/i);
      await user.clear(tempInput);
      await user.type(tempInput, '37.5');

      const bpInput = screen.getByPlaceholderText(/120\/80/i);
      await user.clear(bpInput);
      await user.type(bpInput, '120/80');

      const pulseInput = screen.getByPlaceholderText(/75/i);
      await user.clear(pulseInput);
      await user.type(pulseInput, '75');

      // Fill complaints
      const complaintsTextarea = screen.getByPlaceholderText(/describe symptoms/i);
      await user.type(complaintsTextarea, 'Test complaint');

      // Fill diagnosis
      const diagnosisTextarea = screen.getByPlaceholderText(/diagnosis details/i);
      await user.type(diagnosisTextarea, 'Test diagnosis');

      // Add medication
      const addButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/medication name/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/medication name/i);
      await user.type(nameInput, 'Paracetamol');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save visit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/visits', expect.objectContaining({
          patientId: 'patient-1',
          complaints: 'Test complaint',
          diagnosis: 'Test diagnosis',
          temperature: 37.5,
          bloodPressure: '120/80',
          pulse: 75,
        }));
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock slow API response
      (apiClient.post as any).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderWithProviders(<NewVisitForm />);

      await waitFor(() => {
        const patientSelect = screen.getByRole('combobox', { name: /patient/i });
        expect(patientSelect).toBeInTheDocument();
      });

      // Fill minimum required fields
      const patientSelect = screen.getByRole('combobox', { name: /patient/i });
      await user.selectOptions(patientSelect, 'patient-1');

      const tempInput = screen.getByPlaceholderText(/37.0/i);
      await user.type(tempInput, '37.5');

      const bpInput = screen.getByPlaceholderText(/120\/80/i);
      await user.type(bpInput, '120/80');

      const pulseInput = screen.getByPlaceholderText(/75/i);
      await user.type(pulseInput, '75');

      const complaintsTextarea = screen.getByPlaceholderText(/describe symptoms/i);
      await user.type(complaintsTextarea, 'Test');

      // Submit
      const submitButton = screen.getByRole('button', { name: /save visit/i });
      await user.click(submitButton);

      // Check loading state
      expect(submitButton).toBeDisabled();
    });

    it('should clear draft after successful submission', async () => {
      const user = userEvent.setup();
      
      (apiClient.post as any).mockResolvedValue({
        data: {
          success: true,
          data: { id: 'visit-1' },
        },
      });

      // Set initial draft
      localStorage.setItem('visit-draft', JSON.stringify({ complaints: 'Test' }));

      renderWithProviders(<NewVisitForm />);

      await waitFor(() => {
        const patientSelect = screen.getByRole('combobox', { name: /patient/i });
        expect(patientSelect).toBeInTheDocument();
      });

      // Fill and submit form
      const patientSelect = screen.getByRole('combobox', { name: /patient/i });
      await user.selectOptions(patientSelect, 'patient-1');

      const tempInput = screen.getByPlaceholderText(/37.0/i);
      await user.type(tempInput, '37.5');

      const bpInput = screen.getByPlaceholderText(/120\/80/i);
      await user.type(bpInput, '120/80');

      const pulseInput = screen.getByPlaceholderText(/75/i);
      await user.type(pulseInput, '75');

      const complaintsTextarea = screen.getByPlaceholderText(/describe symptoms/i);
      await user.type(complaintsTextarea, 'Test');

      const submitButton = screen.getByRole('button', { name: /save visit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const savedData = localStorage.getItem('visit-draft');
        expect(savedData).toBeNull();
      });
    });

    it('should handle submission error', async () => {
      const user = userEvent.setup();
      
      (apiClient.post as any).mockRejectedValue(new Error('Submission failed'));

      renderWithProviders(<NewVisitForm />);

      await waitFor(() => {
        const patientSelect = screen.getByRole('combobox', { name: /patient/i });
        expect(patientSelect).toBeInTheDocument();
      });

      const patientSelect = screen.getByRole('combobox', { name: /patient/i });
      await user.selectOptions(patientSelect, 'patient-1');

      const tempInput = screen.getByPlaceholderText(/37.0/i);
      await user.type(tempInput, '37.5');

      const bpInput = screen.getByPlaceholderText(/120\/80/i);
      await user.type(bpInput, '120/80');

      const pulseInput = screen.getByPlaceholderText(/75/i);
      await user.type(pulseInput, '75');

      const complaintsTextarea = screen.getByPlaceholderText(/describe symptoms/i);
      await user.type(complaintsTextarea, 'Test');

      const submitButton = screen.getByRole('button', { name: /save visit/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Form should be re-enabled after error
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Performance Test', () => {
    it('should complete full form interaction in reasonable time', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ delay: null });
      const startTime = Date.now();

      (apiClient.post as any).mockResolvedValue({
        data: {
          success: true,
          data: { id: 'visit-1' },
        },
      });

      renderWithProviders(<NewVisitForm />);

      await waitFor(() => {
        const patientSelect = screen.getByRole('combobox', { name: /patient/i });
        expect(patientSelect).toBeInTheDocument();
      });

      // Select patient
      const patientSelect = screen.getByRole('combobox', { name: /patient/i });
      await user.selectOptions(patientSelect, 'patient-1');

      // Fill vitals
      const tempInput = screen.getByPlaceholderText(/37.0/i);
      await user.clear(tempInput);
      await user.type(tempInput, '37.5');

      const bpInput = screen.getByPlaceholderText(/120\/80/i);
      await user.clear(bpInput);
      await user.type(bpInput, '120/80');

      const pulseInput = screen.getByPlaceholderText(/75/i);
      await user.clear(pulseInput);
      await user.type(pulseInput, '75');

      // Fill complaints and diagnosis
      const complaintsTextarea = screen.getByPlaceholderText(/describe symptoms/i);
      await user.type(complaintsTextarea, 'Test complaint');

      const diagnosisTextarea = screen.getByPlaceholderText(/diagnosis details/i);
      await user.type(diagnosisTextarea, 'Test diagnosis');

      // Add medications
      const addButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/medication name/i)).toBeInTheDocument();
      });

      await user.click(addButton); // Add second medication

      // Fill medication details
      const nameInputs = screen.getAllByPlaceholderText(/medication name/i);
      await user.type(nameInputs[0], 'Paracetamol');
      await user.type(nameInputs[1], 'Ibuprofen');

      // Submit
      const submitButton = screen.getByRole('button', { name: /save visit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalled();
      });

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // Convert to seconds

      // BRD requirement: < 3 minutes (180 seconds)
      // In test environment, should be much faster
      expect(duration).toBeLessThan(10); // 10 seconds for test execution

      vi.useRealTimers();
    });
  });
});
