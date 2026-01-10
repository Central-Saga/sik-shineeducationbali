import { apiClient } from './client';
import type { Role, RoleFormData } from '@/lib/types/role';
import type { ApiResponse } from '@/lib/types/api';

/**
 * Get all roles with permissions
 */
export async function getRoles(): Promise<Role[]> {
  const response = await apiClient.get<Role[]>('/v1/roles');
  return response.data;
}

/**
 * Get a single role by ID with permissions
 */
export async function getRole(id: number | string): Promise<Role> {
  const response = await apiClient.get<Role>(`/v1/roles/${id}`);
  return response.data;
}

/**
 * Create a new role
 */
export async function createRole(data: RoleFormData): Promise<Role> {
  const response = await apiClient.post<Role>('/v1/roles', data);
  return response.data;
}

/**
 * Update an existing role
 */
export async function updateRole(id: number | string, data: Partial<RoleFormData>): Promise<Role> {
  const response = await apiClient.put<Role>(`/v1/roles/${id}`, data);
  return response.data;
}

/**
 * Delete a role
 */
export async function deleteRole(id: number | string): Promise<void> {
  await apiClient.delete(`/v1/roles/${id}`);
}

