import { apiClient } from './client';
import type { Absensi, AbsensiFormData } from '@/lib/types/absensi';

export interface GetAbsensiParams {
  karyawan_id?: number;
  tanggal?: string;
  start_date?: string;
  end_date?: string;
  status_kehadiran?: 'hadir' | 'izin' | 'sakit' | 'alpa';
}

/**
 * Get all attendance records with optional filters
 */
export async function getAbsensi(params?: GetAbsensiParams): Promise<Absensi[]> {
  const response = await apiClient.get<Absensi[]>('/v1/absensi', { params });
  return response.data;
}

/**
 * Get a single attendance record by ID
 */
export async function getAbsensiById(id: number | string): Promise<Absensi> {
  const response = await apiClient.get<Absensi>(`/v1/absensi/${id}`);
  return response.data;
}

/**
 * Create a new attendance record
 */
export async function createAbsensi(data: AbsensiFormData): Promise<Absensi> {
  const response = await apiClient.post<Absensi>('/v1/absensi', data);
  return response.data;
}

/**
 * Update an existing attendance record
 */
export async function updateAbsensi(id: number | string, data: Partial<AbsensiFormData>): Promise<Absensi> {
  const response = await apiClient.put<Absensi>(`/v1/absensi/${id}`, data);
  return response.data;
}

/**
 * Delete an attendance record
 */
export async function deleteAbsensi(id: number | string): Promise<void> {
  await apiClient.delete(`/v1/absensi/${id}`);
}

/**
 * Get attendance records by employee ID
 */
export async function getAbsensiByKaryawan(karyawanId: number | string, params?: Omit<GetAbsensiParams, 'karyawan_id'>): Promise<Absensi[]> {
  const response = await apiClient.get<Absensi[]>(`/v1/absensi/karyawan/${karyawanId}`, { params });
  return response.data;
}

/**
 * Get attendance record by employee ID and date
 */
export async function getAbsensiByKaryawanAndTanggal(karyawanId: number | string, tanggal: string): Promise<Absensi> {
  const response = await apiClient.get<Absensi>(`/v1/absensi/karyawan/${karyawanId}/tanggal/${tanggal}`);
  return response.data;
}

/**
 * Get present attendance records (hadir)
 */
export async function getAbsensiHadir(tanggal?: string): Promise<Absensi[]> {
  const response = await apiClient.get<Absensi[]>('/v1/absensi/hadir', { params: { tanggal } });
  return response.data;
}



