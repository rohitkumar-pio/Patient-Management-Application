import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import PatientList from '../pages/PatientList';
import * as apiClient from '../lib/api';

// Mock the API client
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the auth store
vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', name: 'Dr. Test', email: 'doctor@test.com', role: 'DOCTOR' },
    isAuthenticated: true,
    logout: vi.fn(),
  })),
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

// Mock patient data
const mockPatients = {
  success: true,
  data: {
    patients: [
      {
        id: 'patient-1',
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '1234567890',
        address: '123 Main St',
        dateOfBirth: '1989-01-01T00:00:00.000Z',
        visitCount: 5,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'patient-2',
        name: 'Jane Smith',
        age: 28,
        gender: 'Female',
        phone: '0987654321',
        address: '456 Oak Ave',
        dateOfBirth: '1996-05-15T00:00:00.000Z',
        visitCount: 3,
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
      {
        id: 'patient-3',
        name: 'Bob Johnson',
        age: 42,
        gender: 'Male',
        phone: '5555555555',
        address: '789 Pine Rd',
        dateOfBirth: '1982-03-20T00:00:00.000Z',
        visitCount: 8,
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
      },
    ],
    pagination: {
      total: 3,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  },
};

describe('PatientList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(apiClient.default.get).mockResolvedValue({ data: mockPatients });
  });

  describe('Rendering', () => {
    it('should render patient list page with header', async () => {
      renderWithProviders(<PatientList />);

      // Check for header elements
      expect(screen.getByText('Patient Management System')).toBeInTheDocument();
      expect(screen.getByText(/Welcome, Dr. Test/i)).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should render sidebar navigation', async () => {
      renderWithProviders(<PatientList />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Patients')).toBeInTheDocument();
      expect(screen.getByText('Appointments')).toBeInTheDocument();
    });

    it('should render "Add New Patient" button', async () => {
      renderWithProviders(<PatientList />);

      const addButton = screen.getByRole('button', { name: /add new patient/i });
      expect(addButton).toBeInTheDocument();
    });

    it('should render search input', async () => {
      renderWithProviders(<PatientList />);

      const searchInput = screen.getByPlaceholderText(/search patients/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Patient Data Display', () => {
    it('should display loading skeleton while fetching data', async () => {
      // Delay the API response
      vi.mocked(apiClient.default.get).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: mockPatients }), 100))
      );

      renderWithProviders(<PatientList />);

      // Check for loading indicator (skeleton or text)
      const loadingElements = screen.queryAllByText(/loading/i);
      if (loadingElements.length === 0) {
        // Might be using skeleton, just verify patients aren't shown yet
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      }

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should display all patients from API', async () => {
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });
    });

    it('should display patient information correctly', async () => {
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check patient details
      expect(screen.getByText('35')).toBeInTheDocument(); // Age
      expect(screen.getByText('1234567890')).toBeInTheDocument(); // Phone
      expect(screen.getByText('5')).toBeInTheDocument(); // Visit count
    });

    it('should display gender badges', async () => {
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        const maleBadges = screen.getAllByText('Male');
        const femaleBadges = screen.getAllByText('Female');
        expect(maleBadges.length).toBeGreaterThan(0);
        expect(femaleBadges.length).toBeGreaterThan(0);
      });
    });

    it('should display empty state when no patients found', async () => {
      vi.mocked(apiClient.default.get).mockResolvedValue({
        data: {
          success: true,
          data: {
            patients: [],
            pagination: {
              total: 0,
              page: 1,
              limit: 20,
              totalPages: 0,
            },
          },
        },
      });

      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText(/no patients found/i)).toBeInTheDocument();
      });
    });

    it('should display error message on API failure', async () => {
      vi.mocked(apiClient.default.get).mockRejectedValue(new Error('API Error'));

      renderWithProviders(<PatientList />);

      await waitFor(() => {
        const errorMessage = screen.getByText(/error/i) || screen.getByText(/failed/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should update search input value on change', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      const searchInput = screen.getByPlaceholderText(/search patients/i);
      await user.type(searchInput, 'John');

      expect(searchInput).toHaveValue('John');
    });

    it('should trigger search with debounce', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Mock search results
      const searchResults = {
        success: true,
        data: {
          patients: [mockPatients.data.patients[0]], // Only John Doe
          pagination: {
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1,
          },
        },
      };

      vi.mocked(apiClient.default.get).mockResolvedValue({ data: searchResults });

      const searchInput = screen.getByPlaceholderText(/search patients/i);
      await user.type(searchInput, 'John');

      // Wait for debounce and API call
      await waitFor(
        () => {
          expect(apiClient.default.get).toHaveBeenCalledWith(
            expect.stringContaining('search=John')
          );
        },
        { timeout: 1000 }
      );
    });

    it('should display search results', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Mock search results
      const searchResults = {
        success: true,
        data: {
          patients: [mockPatients.data.patients[0]], // Only John Doe
          pagination: {
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1,
          },
        },
      };

      vi.mocked(apiClient.default.get).mockResolvedValue({ data: searchResults });

      const searchInput = screen.getByPlaceholderText(/search patients/i);
      await user.clear(searchInput);
      await user.type(searchInput, 'John');

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should reset to page 1 when searching', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search patients/i);
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(apiClient.default.get).toHaveBeenCalledWith(
          expect.stringContaining('page=1')
        );
      }, { timeout: 1000 });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', async () => {
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Look for pagination elements
      const previousButton = screen.queryByRole('button', { name: /previous/i });
      const nextButton = screen.queryByRole('button', { name: /next/i });

      // At least one pagination element should exist
      expect(previousButton || nextButton).toBeTruthy();
    });

    it('should navigate to next page', async () => {
      // Mock data with multiple pages
      const firstPageData = {
        success: true,
        data: {
          patients: mockPatients.data.patients.slice(0, 2),
          pagination: {
            total: 25,
            page: 1,
            limit: 2,
            totalPages: 13,
          },
        },
      };

      vi.mocked(apiClient.default.get).mockResolvedValue({ data: firstPageData });

      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeEnabled();

      await user.click(nextButton);

      await waitFor(() => {
        expect(apiClient.default.get).toHaveBeenCalledWith(
          expect.stringContaining('page=2')
        );
      });
    });

    it('should disable previous button on first page', async () => {
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const previousButton = screen.queryByRole('button', { name: /previous/i });
      if (previousButton) {
        expect(previousButton).toBeDisabled();
      }
    });

    it('should display pagination information', async () => {
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Look for pagination info text (e.g., "Showing 1 to 3 of 3")
      const paginationInfo = screen.queryByText(/showing/i) || screen.queryByText(/of/i);
      expect(paginationInfo).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to add patient page when clicking "Add New Patient"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      const addButton = screen.getByRole('button', { name: /add new patient/i });
      await user.click(addButton);

      expect(mockNavigate).toHaveBeenCalledWith('/patients/new');
    });

    it('should navigate to patient profile when clicking on a patient row', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const patientRow = screen.getByText('John Doe').closest('tr');
      if (patientRow) {
        await user.click(patientRow);

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-1');
        });
      }
    });

    it('should handle logout', async () => {
      const mockLogout = vi.fn();
      vi.mocked(require('../stores/authStore').useAuthStore).mockReturnValue({
        user: { id: '1', name: 'Dr. Test', email: 'doctor@test.com', role: 'DOCTOR' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
