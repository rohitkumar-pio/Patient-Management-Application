// Patient types
export interface Patient {
  id: number;
  name: string;
  age?: number;
  dateOfBirth?: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
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

// User types
export interface User {
  id: number;
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
