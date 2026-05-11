import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { PatientForm } from '../components/PatientForm';
import * as apiClient from '../lib/api';

// Mock the API client
vi.mock('../lib/api', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
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

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('PatientForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      renderWithProviders(<PatientForm />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithProviders(<PatientForm />);

      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      renderWithProviders(<PatientForm />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it('should display form title for new patient', () => {
      renderWithProviders(<PatientForm />);

      const title = screen.queryByText(/new patient|add patient|create patient/i);
      expect(title).toBeInTheDocument();
    });

    it('should populate form fields in edit mode', () => {
      const existingPatient = {
        id: 'patient-1',
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '1234567890',
        address: '123 Main St',
        dateOfBirth: '1989-01-01',
        visitCount: 5,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      renderWithProviders(<PatientForm patient={existingPatient} />);

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('35')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty name', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientForm />);

      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });

      await user.clear(nameInput);
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(/name.*required/i) || 
                           screen.queryByText(/required/i);
        expect(errorMessage).toBeInTheDocument();
      });

      expect(apiClient.default.post).not.toHaveBeenCalled();
    });

    it('should show validation error for name too short', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientForm />);

      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });

      await user.clear(nameInput);
      await user.type(nameInput, 'A');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(/name.*2.*characters/i) ||
                           screen.queryByText(/too short/i);
        expect(errorMessage).toBeInTheDocument();
      });

      expect(apiClient.default.post).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid phone number', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientForm />);

      const phoneInput = screen.getByLabelText(/phone/i);
      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });

      await user.type(phoneInput, '123');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(/phone.*10/i) ||
                           screen.queryByText(/invalid.*phone/i);
        expect(errorMessage).toBeInTheDocument();
      });

      expect(apiClient.default.post).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid age', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientForm />);

      const ageInput = screen.getByLabelText(/age/i);
      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });

      await user.clear(ageInput);
      await user.type(ageInput, '200');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(/age.*150/i) ||
                           screen.queryByText(/invalid.*age/i);
        expect(errorMessage).toBeInTheDocument();
      });

      expect(apiClient.default.post).not.toHaveBeenCalled();
    });

    it('should validate that name is between 2-100 characters', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientForm />);

      const nameInput = screen.getByLabelText(/name/i);
      
      // Test max length
      const longName = 'A'.repeat(101);
      await user.clear(nameInput);
      await user.type(nameInput, longName);

      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(/name.*100/i) ||
                           screen.queryByText(/too long/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should validate phone number format (10 digits)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientForm />);

      const phoneInput = screen.getByLabelText(/phone/i);
      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });

      // Test with letters
      await user.clear(phoneInput);
      await user.type(phoneInput, 'abcdefghij');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(/phone/i);
        expect(errorMessage).toBeInTheDocument();
      });

      expect(apiClient.default.post).not.toHaveBeenCalled();
    });
  });

  describe('Age Auto-Calculation', () => {
    it('should auto-calculate age from date of birth', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientForm />);

      const dobInput = screen.getByLabelText(/date of birth/i);
      const ageInput = screen.getByLabelText(/age/i);

      // Set date of birth to 35 years ago
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 35);
      const formattedDate = birthDate.toISOString().split('T')[0];

      await user.type(dobInput, formattedDate);

      // Wait for age calculation
      await waitFor(() => {
        const ageValue = (ageInput as HTMLInputElement).value;
        expect(parseInt(ageValue)).toBeGreaterThanOrEqual(34);
        expect(parseInt(ageValue)).toBeLessThanOrEqual(36);
      });
    });

    it('should allow manual age entry when no date of birth', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientForm />);

      const ageInput = screen.getByLabelText(/age/i);

      await user.clear(ageInput);
      await user.type(ageInput, '45');

      expect(ageInput).toHaveValue('45');
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.default.post).mockResolvedValue({
        data: {
          success: true,
          data: {
            id: 'patient-1',
            name: 'John Doe',
            age: 35,
            gender: 'Male',
            phone: '1234567890',
            address: '123 Main St',
          },
        },
      });

      renderWithProviders(<PatientForm />);

      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/age/i), '35');
      await user.selectOptions(screen.getByLabelText(/gender/i), 'Male');
      await user.type(screen.getByLabelText(/phone/i), '1234567890');
      await user.type(screen.getByLabelText(/address/i), '123 Main St');

      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.default.post).toHaveBeenCalledWith(
          '/patients',
          expect.objectContaining({
            name: 'John Doe',
            age: 35,
            gender: 'Male',
            phone: '1234567890',
            address: '123 Main St',
          })
        );
      });
    });

    it('should update patient in edit mode', async () => {
      const user = userEvent.setup();
      const existingPatient = {
        id: 'patient-1',
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '1234567890',
        address: '123 Main St',
        dateOfBirth: '1989-01-01',
        visitCount: 5,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(apiClient.default.put).mockResolvedValue({
        data: {
          success: true,
          data: { ...existingPatient, name: 'John Doe Updated' },
        },
      });

      renderWithProviders(<PatientForm patient={existingPatient} />);

      const nameInput = screen.getByDisplayValue('John Doe');
      await user.clear(nameInput);
      await user.type(nameInput, 'John Doe Updated');

      const submitButton = screen.getByRole('button', { name: /save|submit|update/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.default.put).toHaveBeenCalledWith(
          `/patients/${existingPatient.id}`,
          expect.objectContaining({
            name: 'John Doe Updated',
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.default.post).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { success: true, data: {} }
        }), 100))
      );

      renderWithProviders(<PatientForm />);

      // Fill required fields
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/phone/i), '1234567890');

      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });
      await user.click(submitButton);

      // Check for loading state
      await waitFor(() => {
        const loadingButton = screen.queryByRole('button', { name: /saving|loading/i }) ||
                             screen.getByRole('button', { name: /create patient|save|submit/i });
        expect(loadingButton).toBeDisabled();
      });
    });

    it('should navigate after successful submission', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      vi.mocked(apiClient.default.post).mockResolvedValue({
        data: {
          success: true,
          data: {
            id: 'patient-1',
            name: 'John Doe',
            phone: '1234567890',
          },
        },
      });

      renderWithProviders(<PatientForm onSuccess={mockOnSuccess} />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/phone/i), '1234567890');

      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display duplicate phone error', async () => {
      const user = userEvent.setup();
      
      vi.mocked(apiClient.default.post).mockRejectedValue({
        response: {
          status: 409,
          data: {
            success: false,
            message: 'Phone number already exists',
          },
        },
      });

      renderWithProviders(<PatientForm />);

      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/phone/i), '1234567890');

      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(/phone.*exists|already|duplicate/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should display generic error on API failure', async () => {
      const user = userEvent.setup();
      
      vi.mocked(apiClient.default.post).mockRejectedValue({
        response: {
          status: 500,
          data: {
            success: false,
            message: 'Server error',
          },
        },
      });

      renderWithProviders(<PatientForm />);

      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/phone/i), '1234567890');

      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(/error|failed/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      
      vi.mocked(apiClient.default.post).mockRejectedValue(new Error('Network error'));

      renderWithProviders(<PatientForm />);

      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/phone/i), '1234567890');

      const submitButton = screen.getByRole('button', { name: /create patient|save|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.queryByText(/error|failed/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();

      renderWithProviders(<PatientForm onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should navigate back when cancel is clicked without onCancel prop', async () => {
      const user = userEvent.setup();

      renderWithProviders(<PatientForm />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });
});
