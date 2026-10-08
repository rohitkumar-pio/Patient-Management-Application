import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import apiClient from '../lib/api';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const authState = {
  isAuthenticated: false,
  token: null as string | null,
  user: { id: '1', name: 'Test', email: 'doctor@test.com', role: 'DOCTOR' },
  login: vi.fn(),
  logout: vi.fn(),
  setAuth: vi.fn(),
};

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(() => authState),
}));

const renderAt = (path: string) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

describe('App routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({ data: { success: true, data: [] } });
  });

  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  describe('signed out', () => {
    beforeEach(() => {
      authState.isAuthenticated = false;
      authState.token = null;
    });

    it.each(['/', '/dashboard', '/appointments'])('redirects %s to /login', async (path) => {
      renderAt(path);

      await waitFor(() => expect(window.location.pathname).toBe('/login'));
      expect(screen.getByRole('heading', { name: /user login/i })).toBeInTheDocument();
    });

    it('redirects unknown paths to /login', async () => {
      renderAt('/does-not-exist');
      await waitFor(() => expect(window.location.pathname).toBe('/login'));
    });
  });

  describe('signed in', () => {
    beforeEach(() => {
      authState.isAuthenticated = true;
      authState.token = 'token';
    });

    it.each(['/', '/dashboard'])('shows the dashboard at %s', async (path) => {
      renderAt(path);

      expect(await screen.findByRole('heading', { name: "Today's Appointments" })).toBeInTheDocument();
      expect(window.location.pathname).toBe(path);
    });

    it('redirects /login to the dashboard', async () => {
      renderAt('/login');

      await waitFor(() => expect(window.location.pathname).toBe('/'));
      expect(await screen.findByRole('heading', { name: "Today's Appointments" })).toBeInTheDocument();
    });
  });
});
