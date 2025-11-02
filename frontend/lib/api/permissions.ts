import { apiClient } from './client';
import type { Permission } from '@/lib/types/permission';
import type { ApiResponse } from '@/lib/types/api';

/**
 * Get all permissions
 */
export async function getPermissions(): Promise<Permission[]> {
  const response = await apiClient.get<Permission[]>('/v1/permissions');
  return response.data;
}

