import { apiClient } from './client';
import type { RealisasiSesi, RealisasiSesiFormData } from '@/lib/types/realisasi-sesi';

export interface GetRealisasiSesiParams {
  karyawan_id?: number;
  sesi_kerja_id?: number;
  tanggal?: string;
  start_date?: string;
  end_date?: string;
  status?: 'diajukan' | 'disetujui' | 'ditolak';
  sumber?: 'jadwal' | 'manual';
}

/**
 * Get all realisasi sesi records with optional filters
 */
export async function getRealisasiSesi(params?: GetRealisasiSesiParams): Promise<RealisasiSesi[]> {
  const response = await apiClient.get<RealisasiSesi[]>('/v1/realisasi-sesi', { params });
  return response.data;
}

/**
 * Get a single realisasi sesi record by ID
 */
export async function getRealisasiSesiById(id: number | string): Promise<RealisasiSesi> {
  const response = await apiClient.get<RealisasiSesi>(`/v1/realisasi-sesi/${id}`);
  return response.data;
}

/**
 * Create a new realisasi sesi record
 */
export async function createRealisasiSesi(data: RealisasiSesiFormData): Promise<RealisasiSesi> {
  const response = await apiClient.post<RealisasiSesi>('/v1/realisasi-sesi', data);
  return response.data;
}

/**
 * Update an existing realisasi sesi record
 */
export async function updateRealisasiSesi(id: number | string, data: Partial<RealisasiSesiFormData>): Promise<RealisasiSesi> {
  const response = await apiClient.put<RealisasiSesi>(`/v1/realisasi-sesi/${id}`, data);
  return response.data;
}

/**
 * Delete a realisasi sesi record
 */
export async function deleteRealisasiSesi(id: number | string): Promise<void> {
  await apiClient.delete(`/v1/realisasi-sesi/${id}`);
}

/**
 * Approve a realisasi sesi record
 */
export async function approveRealisasiSesi(id: number | string, catatan?: string): Promise<RealisasiSesi> {
  const response = await apiClient.post<RealisasiSesi>(`/v1/realisasi-sesi/${id}/approve`, { catatan });
  return response.data;
}

/**
 * Reject a realisasi sesi record
 */
export async function rejectRealisasiSesi(id: number | string, catatan: string): Promise<RealisasiSesi> {
  const response = await apiClient.post<RealisasiSesi>(`/v1/realisasi-sesi/${id}/reject`, { catatan });
  return response.data;
}

/**
 * Get realisasi sesi records by karyawan ID
 */
export async function getRealisasiSesiByKaryawan(karyawanId: number | string, params?: Omit<GetRealisasiSesiParams, 'karyawan_id'>): Promise<RealisasiSesi[]> {
  const response = await apiClient.get<RealisasiSesi[]>(`/v1/realisasi-sesi/karyawan/${karyawanId}`, { params });
  return response.data;
}

/**
 * Get realisasi sesi records by sesi kerja ID
 */
export async function getRealisasiSesiBySesiKerja(sesiKerjaId: number | string, params?: Omit<GetRealisasiSesiParams, 'sesi_kerja_id'>): Promise<RealisasiSesi[]> {
  const response = await apiClient.get<RealisasiSesi[]>(`/v1/realisasi-sesi/sesi-kerja/${sesiKerjaId}`, { params });
  return response.data;
}

/**
 * Get realisasi sesi records by status
 */
export async function getRealisasiSesiByStatus(status: 'diajukan' | 'disetujui' | 'ditolak', params?: Omit<GetRealisasiSesiParams, 'status'>): Promise<RealisasiSesi[]> {
  const response = await apiClient.get<RealisasiSesi[]>(`/v1/realisasi-sesi/status/${status}`, { params });
  return response.data;
}

