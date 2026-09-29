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
    user: { id: '1', name: 'Test', email: 'doctor@test.com', role: 'DOCTOR' },
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

const SEARCH_PLACEHOLDER = /search by name or phone/i;

// Mock patient data (matches GET /api/patients: formatted patients with visitCount)
const patients = [
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
];

// Build a response body in the backend's shape:
// { success, data: Patient[], pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage } }
const buildResponse = (
  data: typeof patients,
  { page = 1, limit = 20, total = data.length }: { page?: number; limit?: number; total?: number } = {}
) => {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const mockPatients = buildResponse(patients);
// Two pages of results (limit 20, total 25)
const multiPageResponse = buildResponse(patients, { total: 25 });

const getRowFor = (name: string) => {
  const row = screen.getByText(name).closest('tr');
  expect(row).not.toBeNull();
  return row as HTMLTableRowElement;
};

describe('PatientList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation (axios response: { data: body })
    vi.mocked(apiClient.default.get).mockResolvedValue({ data: mockPatients });
  });

  describe('Rendering', () => {
    it('should render patient list page with header', async () => {
      renderWithProviders(<PatientList />);

      const header = screen.getByRole('banner');
      expect(within(header).getByText('Patient Management System')).toBeInTheDocument();
      expect(within(header).getByText('Welcome, Dr. Test')).toBeInTheDocument();
      expect(within(header).getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    });

    it('should render sidebar navigation', async () => {
      renderWithProviders(<PatientList />);

      const nav = screen.getByRole('navigation');
      expect(within(nav).getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
      expect(within(nav).getByRole('button', { name: 'Patients' })).toHaveClass('active');
      expect(within(nav).getByRole('button', { name: 'Appointments' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: 'Patients' })).toBeInTheDocument();
    });

    it('should render "Add New Patient" button', async () => {
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new patient/i });
      expect(addButton).toBeInTheDocument();
    });

    it('should render search input', async () => {
      renderWithProviders(<PatientList />);

      const searchInput = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Patient Data Display', () => {
    it('should display loading skeleton while fetching data', async () => {
      // Delay the API response
      vi.mocked(apiClient.default.get).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: mockPatients }), 100))
      );

      const { container } = renderWithProviders(<PatientList />);

      expect(container.querySelector('.loading-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      expect(container.querySelector('.loading-skeleton')).not.toBeInTheDocument();
    });

    it('should display all patients from API', async () => {
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });

      expect(apiClient.default.get).toHaveBeenCalledWith(
        expect.stringMatching(/^\/patients\?page=1&limit=20$/)
      );
    });

    it('should display patient information correctly', async () => {
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const row = within(getRowFor('John Doe'));
      expect(row.getByText('35')).toBeInTheDocument(); // Age
      expect(row.getByText('Male')).toBeInTheDocument(); // Gender
      expect(row.getByText('1234567890')).toBeInTheDocument(); // Phone
      expect(row.getByText('5')).toBeInTheDocument(); // Visit count
    });

    it('should display gender badges', async () => {
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const maleBadges = screen.getAllByText('Male');
      const femaleBadges = screen.getAllByText('Female');
      expect(maleBadges).toHaveLength(2);
      expect(femaleBadges).toHaveLength(1);
      maleBadges.forEach((badge) => expect(badge).toHaveClass('gender-badge', 'male'));
      expect(femaleBadges[0]).toHaveClass('gender-badge', 'female');
    });

    it('should display empty state when no patients found', async () => {
      vi.mocked(apiClient.default.get).mockResolvedValue({
        data: buildResponse([]),
      });

      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText(/no patients found/i)).toBeInTheDocument();
      });
      expect(screen.getByText('Get started by adding a new patient')).toBeInTheDocument();
    });

    it('should display error message on API failure', async () => {
      vi.mocked(apiClient.default.get).mockRejectedValue(new Error('API Error'));

      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('Error loading patients')).toBeInTheDocument();
      });
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should update search input value on change', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      const searchInput = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);
      await user.type(searchInput, 'John');

      expect(searchInput).toHaveValue('John');
    });

    it('should trigger search with debounce', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      vi.mocked(apiClient.default.get).mockResolvedValue({
        data: buildResponse([patients[0]]),
      });

      const searchInput = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);
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

      // Debounced: no request for partial terms
      expect(apiClient.default.get).not.toHaveBeenCalledWith(
        expect.stringMatching(/search=J(&|$)/)
      );
    });

    it('should display search results', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      vi.mocked(apiClient.default.get).mockResolvedValue({
        data: buildResponse([patients[0]]),
      });

      const searchInput = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);
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
      vi.mocked(apiClient.default.get).mockResolvedValue({ data: multiPageResponse });

      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Move to page 2 first
      await user.click(screen.getByRole('button', { name: 'Next page' }));
      await waitFor(() => {
        expect(apiClient.default.get).toHaveBeenLastCalledWith(
          expect.stringContaining('page=2')
        );
      });

      const searchInput = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(apiClient.default.get).toHaveBeenLastCalledWith(
          '/patients?page=1&limit=20&search=test'
        );
      }, { timeout: 1000 });
    });
  });

  describe('Pagination', () => {
    it('should not display pagination controls for a single page', async () => {
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: 'Previous page' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
    });

    it('should display pagination controls', async () => {
      vi.mocked(apiClient.default.get).mockResolvedValue({ data: multiPageResponse });

      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '1' })).toHaveClass('active');
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    });

    it('should navigate to next page', async () => {
      vi.mocked(apiClient.default.get).mockResolvedValue({ data: multiPageResponse });

      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: 'Next page' });
      expect(nextButton).toBeEnabled();

      await user.click(nextButton);

      await waitFor(() => {
        expect(apiClient.default.get).toHaveBeenCalledWith(
          expect.stringContaining('page=2')
        );
      });
    });

    it('should disable previous button on first page', async () => {
      vi.mocked(apiClient.default.get).mockResolvedValue({ data: multiPageResponse });

      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    });

    it('should display pagination information', async () => {
      vi.mocked(apiClient.default.get).mockResolvedValue({ data: multiPageResponse });

      const { container } = renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const info = container.querySelector('.pagination-info');
      expect(info).not.toBeNull();
      expect(info).toHaveTextContent('Showing 1 to 20 of 25 results');
    });
  });

  describe('User Interactions', () => {
    it('should navigate to add patient page when clicking "Add New Patient"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new patient/i });
      await user.click(addButton);

      expect(mockNavigate).toHaveBeenCalledWith('/patients/new');
    });

    it('should navigate to patient profile when clicking on a patient name', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      await user.click(screen.getByText('John Doe'));

      expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-1');
    });

    it('should navigate to patient profile when clicking the View button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const row = within(getRowFor('Jane Smith'));
      await user.click(row.getByRole('button', { name: /view/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/patients/patient-2');
    });

    it('should handle logout', async () => {
      const mockLogout = vi.fn();
      const { useAuthStore } = await import('../stores/authStore');
      vi.mocked(useAuthStore).mockReturnValue({
        user: { id: '1', name: 'Test', email: 'doctor@test.com', role: 'DOCTOR' },
        isAuthenticated: true,
        logout: mockLogout,
        login: vi.fn(),
        setUser: vi.fn(),
      });

      const user = userEvent.setup();
      renderWithProviders(<PatientList />);

      await user.click(screen.getByRole('button', { name: 'Logout' }));

      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
