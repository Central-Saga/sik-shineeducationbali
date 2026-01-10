import { apiClient } from './client';
import type { RekapBulanan, RekapBulananFormData } from '@/lib/types/rekap-bulanan';

export interface GetRekapBulananParams {
  periode?: string;
  karyawan_id?: number;
}

/**
 * Generate rekap bulanan for all active employees
 */
export async function generateRekapBulanan(data: RekapBulananFormData): Promise<RekapBulanan[]> {
  const response = await apiClient.post<RekapBulanan[]>('/v1/rekap-bulanan/generate', data);
  return response.data;
}

/**
 * Get all rekap bulanan records with optional filters
 */
export async function getRekapBulanan(params?: GetRekapBulananParams): Promise<RekapBulanan[]> {
  const response = await apiClient.get<RekapBulanan[]>('/v1/rekap-bulanan', { params });
  return response.data;
}

/**
 * Get a single rekap bulanan record by ID
 */
export async function getRekapBulananById(id: number | string): Promise<RekapBulanan> {
  const response = await apiClient.get<RekapBulanan>(`/v1/rekap-bulanan/${id}`);
  return response.data;
}

/**
 * Delete a rekap bulanan record
 */
export async function deleteRekapBulanan(id: number | string): Promise<void> {
  await apiClient.delete(`/v1/rekap-bulanan/${id}`);
}

