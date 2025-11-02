import { apiClient } from './client';
import type { User, UserFormData } from '@/lib/types/user';

/**
 * Get all users with roles
 */
export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/v1/users');
  return response.data;
}

/**
 * Get a single user by ID with roles
 */
export async function getUser(id: number | string): Promise<User> {
  const response = await apiClient.get<User>(`/v1/users/${id}`);
  return response.data;
}

/**
 * Create a new user
 */
export async function createUser(data: UserFormData): Promise<User> {
  const response = await apiClient.post<User>('/v1/users', data);
  return response.data;
}

/**
 * Update an existing user
 */
export async function updateUser(id: number | string, data: Partial<UserFormData>): Promise<User> {
  const response = await apiClient.put<User>(`/v1/users/${id}`, data);
  return response.data;
}

/**
 * Delete a user
 */
export async function deleteUser(id: number | string): Promise<void> {
  await apiClient.delete(`/v1/users/${id}`);
}

