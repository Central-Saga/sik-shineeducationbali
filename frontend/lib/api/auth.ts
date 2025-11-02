import { apiClient, setAuthToken } from './client';
import type { ApiResponse } from '@/lib/types/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    roles?: string[];
  };
  token: string;
  token_type: string;
}

/**
 * Login user and store token
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/v1/login', credentials);
  const authData = response.data;
  
  // Store token
  setAuthToken(authData.token, true);
  
  return authData;
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/v1/register', data);
  const authData = response.data;
  
  // Store token
  setAuthToken(authData.token, true);
  
  return authData;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResponse['user']> {
  const response = await apiClient.get<AuthResponse['user']>('/v1/me');
  return response.data;
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  const { removeAuthToken } = await import('./client');
  try {
    await apiClient.post('/v1/logout');
  } finally {
    // Remove token regardless of API response
    removeAuthToken();
  }
}

