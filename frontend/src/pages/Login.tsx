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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-6xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Side - Marketing Content */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 via-blue-50 to-white p-6 sm:p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Decorative Stars with better positioning */}
            <div className="absolute top-8 sm:top-12 right-12 sm:right-20 text-blue-500 text-2xl sm:text-4xl animate-pulse">✦</div>
            <div className="absolute bottom-24 sm:bottom-32 left-8 sm:left-16 text-blue-400 text-xl sm:text-2xl animate-pulse" style={{ animationDelay: '1s' }}>✦</div>
            <div className="absolute top-32 left-12 text-cyan-400 text-lg opacity-60 animate-pulse" style={{ animationDelay: '2s' }}>✦</div>
            
            <div className="relative z-10 space-y-6 sm:space-y-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Protect Yourself and Your Family — <br className="hidden sm:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  Easy Online Appointments.
                </span>
              </h1>

              {/* Doctor Illustration with enhanced animations */}
              <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 transform transition-transform duration-300 hover:scale-110">👨‍⚕️</div>
                  <p className="text-white text-xs sm:text-sm font-semibold">Professional Healthcare at Your Fingertips</p>
                </div>
                
                {/* Stats Badges - Responsive positioning */}
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 bg-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg flex items-center space-x-2 transform transition-all duration-300 hover:scale-105">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">5.7M doses injected</span>
                </div>
                
                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg transform transition-all duration-300 hover:scale-105">
                  <span className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">✓ 98% recovery</span>
                </div>
              </div>

              {/* Additional Marketing Point */}
              <div className="hidden lg:flex items-center space-x-3 text-gray-700">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Trusted by thousands</p>
                  <p className="text-xs text-gray-500">Join our growing community</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white">
            {/* Logo/Brand */}
            <div className="mb-6 sm:mb-8 transform transition-all duration-700 hover:scale-105">
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:rotate-6">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">MyHiHub</span>
              </div>
            </div>

            {/* Login Form Header */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Login to start your session</h2>
              <p className="text-sm sm:text-base text-gray-500 flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure, quick, and easy</span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg shadow-md animate-shake flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              {/* Email / Phone Input */}
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email ID / Phone
                </label>
                <div className="flex rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-md">
                  <div className="flex items-center px-3 sm:px-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium whitespace-nowrap">🇺🇸 US +1</span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    placeholder="doctor@test.com"
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border text-sm sm:text-base ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    } rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center space-x-1 animate-shake">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-md">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={`w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-2.5 sm:py-3 text-sm sm:text-base border ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center transition-all duration-200 hover:scale-110"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center space-x-1 animate-shake">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Reset Password Link */}
              <div className="flex justify-end">
                <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 font-medium transition-all duration-200 hover:underline flex items-center space-x-1 group">
                  <span>Reset Password</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Demo Credentials */}
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01]">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-blue-900 mb-2">Demo Credentials:</p>
                    <div className="space-y-1">
                      <p className="text-xs text-blue-800 flex items-center space-x-2">
                        <span className="font-medium">Email:</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900">doctor@test.com</span>
                      </p>
                      <p className="text-xs text-blue-800 flex items-center space-x-2">
                        <span className="font-medium">Password:</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900">password123</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 sm:py-3.5 px-4 rounded-lg text-white font-bold text-sm sm:text-base transition-all duration-300 shadow-lg ${
                  isLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                } flex items-center justify-center space-x-2`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              {/* Additional Options */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-2">
                <a href="#" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 hover:underline flex items-center space-x-1 group">
                  <svg className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Login With Code</span>
                </a>
                <div className="text-xs text-gray-500">
                  New user? <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Create account</a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
