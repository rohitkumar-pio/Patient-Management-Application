import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import './Login.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      setIsLoading(true);
      console.log('Sending login request with:', data);
      const response = await api.post('/auth/login', data);
      console.log('Login response:', response.data);
      
      // Backend returns: { success, message, data: { user, token } }
      if (response.data && response.data.data) {
        login(response.data.data.token, response.data.data.user);
        navigate('/dashboard');
      } else {
        console.error('Unexpected response structure:', response.data);
        setError('Login failed. Unexpected response from server.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* User Icon */}
        <div className="login-logo">
          <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '2.5rem', height: '2.5rem' }}>
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>

        <h2 className="login-title">User Login</h2>
        <p className="login-subtitle">Sign in to continue to Patient Management</p>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <div className="error-banner-content">
              <svg className="error-banner-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="error-banner-text">{error}</span>
            </div>
          </div>
        )}

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <p className="demo-credentials-header">
            <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Demo Login
          </p>
          <div>
            <span className="demo-credential-item">doctor@test.com</span>
            <span className="demo-credential-item">password123</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label form-label-required">
              Email
            </label>
            <input
              {...register('email')}
              type="text"
              id="email"
              placeholder="doctor@test.com"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            />
            {errors.email && (
              <span className="error-message">
                <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label form-label-required">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              placeholder="Enter your password"
              className={`form-input ${errors.password ? 'form-input-error' : ''}`}
            />
            {errors.password && (
              <span className="error-message">
                <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Logging in...
              </>
            ) : (
              <>
                Login
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* Bottom Links */}
          <div className="login-footer">
            <div className="login-footer-links">
              <a href="#" className="login-link">
                Reset password
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
