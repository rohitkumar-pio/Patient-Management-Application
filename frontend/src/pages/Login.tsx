import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../lib/api';

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');

      // Make API call to login endpoint
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { token, user } = response.data;

      // Store token and user in auth store
      login(token, user);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Left Side - Marketing Content */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-50 to-white p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Decorative Stars */}
            <div className="absolute top-12 right-20 text-blue-500 text-4xl animate-pulse">✦</div>
            <div className="absolute bottom-32 left-16 text-blue-400 text-2xl animate-pulse" style={{ animationDelay: '1s' }}>✦</div>
            
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
                Protect Yourself and Your Family — <br/>
                <span className="text-blue-600">Easy Online Appointments.</span>
              </h1>

              {/* Doctor Illustration */}
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 mb-8 shadow-xl">
                <div className="text-center">
                  <div className="text-8xl mb-4">👨‍⚕️</div>
                  <p className="text-white text-sm font-semibold">Professional Healthcare at Your Fingertips</p>
                </div>
                
                {/* Stats Badges */}
                <div className="absolute bottom-6 left-6 bg-white rounded-full px-4 py-2 shadow-lg flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-800">5.7 Million doses injected</span>
                </div>
                
                <div className="absolute top-6 right-6 bg-white rounded-full px-4 py-2 shadow-lg">
                  <span className="text-sm font-semibold text-gray-800">✓ 98% recovery rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">MyHiHub</span>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={() => setActiveTab('new')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'new'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  New Patient
                </button>
                <button
                  onClick={() => setActiveTab('existing')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'existing'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Existing Patient
                </button>
              </div>
            </div>

            {/* Login Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Login to start your session</h2>
              <p className="text-sm text-gray-500">Secure, quick, and easy</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email / Phone Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email ID / Phone
                </label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
                    <span className="text-sm text-gray-600">🇺🇸 US +1</span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    placeholder="7201368832"
                    className={`flex-1 px-4 py-3 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Reset Password Link */}
              <div className="text-right">
                <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Reset Password
                </a>
              </div>

              {/* Demo Credentials */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900 font-medium mb-1">Demo Credentials:</p>
                <p className="text-xs text-blue-700">
                  Email: <span className="font-mono bg-blue-100 px-1 rounded">doctor@test.com</span>
                </p>
                <p className="text-xs text-blue-700">
                  Password: <span className="font-mono bg-blue-100 px-1 rounded">password123</span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-lg text-white font-semibold text-base transition-all duration-200 ${
                  isLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-[1.02]'
                }`}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </button>

              {/* Login With Code */}
              <div className="text-center">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                  Login With Code
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
