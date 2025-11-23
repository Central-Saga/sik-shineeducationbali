import { apiClient } from './client';
import type { Cuti, CutiFormData } from '@/lib/types/cuti';

export interface GetCutiParams {
  karyawan_id?: number;
  tanggal?: string;
  start_date?: string;
  end_date?: string;
  jenis?: 'cuti' | 'izin' | 'sakit';
  status?: 'diajukan' | 'disetujui' | 'ditolak';
  include?: string;
}

/**
 * Get all leave requests with optional filters
 */
export async function getCuti(params?: GetCutiParams): Promise<Cuti[]> {
  const response = await apiClient.get<Cuti[]>('/v1/cuti', { params });
  return response.data;
}

/**
 * Get a single leave request by ID
 */
export async function getCutiById(id: number | string): Promise<Cuti> {
  const response = await apiClient.get<Cuti>(`/v1/cuti/${id}`);
  return response.data;
}

/**
 * Create a new leave request
 */
export async function createCuti(data: CutiFormData): Promise<Cuti> {
  const response = await apiClient.post<Cuti>('/v1/cuti', data);
  return response.data;
}

/**
 * Update an existing leave request
 */
export async function updateCuti(id: number | string, data: Partial<CutiFormData>): Promise<Cuti> {
  const response = await apiClient.put<Cuti>(`/v1/cuti/${id}`, data);
  return response.data;
}

/**
 * Delete a leave request
 */
export async function deleteCuti(id: number | string): Promise<void> {
  await apiClient.delete(`/v1/cuti/${id}`);
}

/**
 * Get leave requests by employee ID
 */
export async function getCutiByKaryawan(
  karyawanId: number | string,
  params?: Omit<GetCutiParams, 'karyawan_id'>
): Promise<Cuti[]> {
  const response = await apiClient.get<Cuti[]>(`/v1/cuti/karyawan/${karyawanId}`, { params });
  return response.data;
}

/**
 * Get leave request by employee ID and date
 */
export async function getCutiByKaryawanAndTanggal(
  karyawanId: number | string,
  tanggal: string
): Promise<Cuti> {
  const response = await apiClient.get<Cuti>(`/v1/cuti/karyawan/${karyawanId}/tanggal/${tanggal}`);
  return response.data;
}

/**
 * Get leave requests by jenis
 */
export async function getCutiByJenis(
  jenis: 'cuti' | 'izin' | 'sakit',
  params?: Omit<GetCutiParams, 'jenis'>
): Promise<Cuti[]> {
  const response = await apiClient.get<Cuti[]>(`/v1/cuti/jenis/${jenis}`, { params });
  return response.data;
}

/**
 * Get leave requests by status
 */
export async function getCutiByStatus(
  status: 'diajukan' | 'disetujui' | 'ditolak',
  params?: Omit<GetCutiParams, 'status'>
): Promise<Cuti[]> {
  const response = await apiClient.get<Cuti[]>(`/v1/cuti/status/${status}`, { params });
  return response.data;
}

/**
 * Approve a leave request
 */
export async function approveCuti(id: number | string): Promise<Cuti> {
  return updateCuti(id, { status: 'disetujui' });
}

/**
 * Reject a leave request
 */
export async function rejectCuti(id: number | string): Promise<Cuti> {
  return updateCuti(id, { status: 'ditolak' });
}

