// Patient types
export interface Patient {
  id: string;
  name: string;
  age?: number;
  dateOfBirth?: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  visitCount?: number;
  lastVisitDate?: string;
  _count?: {
    visits: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response wrappers
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// API Error type
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
