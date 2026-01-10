import { apiClient } from './client';
import type {
  Gaji,
  GajiFormData,
  KomponenGaji,
  KomponenGajiFormData,
  PembayaranGaji,
  PembayaranGajiFormData,
  StatusGaji,
  StatusPembayaran,
} from '@/lib/types/gaji';

export interface GetGajiParams {
  periode?: string;
  karyawan_id?: number;
  status?: StatusGaji;
}

/**
 * Generate gaji from rekap bulanan
 */
export async function generateGajiFromRekap(rekapId: number | string): Promise<Gaji> {
  const response = await apiClient.post<Gaji>(`/v1/gaji/generate-from-rekap/${rekapId}`);
  return response.data;
}

/**
 * Get all gaji records with optional filters
 */
export async function getGaji(params?: GetGajiParams): Promise<Gaji[]> {
  const response = await apiClient.get<Gaji[]>('/v1/gaji', { params });
  return response.data;
}

/**
 * Get a single gaji record by ID
 */
export async function getGajiById(id: number | string): Promise<Gaji> {
  const response = await apiClient.get<Gaji>(`/v1/gaji/${id}`);
  return response.data;
}

/**
 * Create a new gaji record
 */
export async function createGaji(data: GajiFormData): Promise<Gaji> {
  const response = await apiClient.post<Gaji>('/v1/gaji', data);
  return response.data;
}

/**
 * Update an existing gaji record
 */
export async function updateGaji(id: number | string, data: Partial<GajiFormData>): Promise<Gaji> {
  const response = await apiClient.put<Gaji>(`/v1/gaji/${id}`, data);
  return response.data;
}

/**
 * Update gaji status
 */
export async function updateGajiStatus(id: number | string, status: StatusGaji): Promise<Gaji> {
  const response = await apiClient.patch<Gaji>(`/v1/gaji/${id}/status`, { status });
  return response.data;
}

/**
 * Delete a gaji record
 */
export async function deleteGaji(id: number | string): Promise<void> {
  await apiClient.delete(`/v1/gaji/${id}`);
}

/**
 * Get komponen gaji records by gaji_id
 */
export async function getKomponenGaji(gajiId: number | string): Promise<KomponenGaji[]> {
  const response = await apiClient.get<KomponenGaji[]>(`/v1/gaji/${gajiId}/komponen`);
  return response.data;
}

/**
 * Create a new komponen gaji record
 */
export async function createKomponenGaji(gajiId: number | string, data: KomponenGajiFormData): Promise<KomponenGaji> {
  const response = await apiClient.post<KomponenGaji>(`/v1/gaji/${gajiId}/komponen`, data);
  return response.data;
}

/**
 * Get a single komponen gaji record by ID
 */
export async function getKomponenGajiById(id: number | string): Promise<KomponenGaji> {
  const response = await apiClient.get<KomponenGaji>(`/v1/komponen-gaji/${id}`);
  return response.data;
}

/**
 * Update an existing komponen gaji record
 */
export async function updateKomponenGaji(id: number | string, data: Partial<KomponenGajiFormData>): Promise<KomponenGaji> {
  const response = await apiClient.put<KomponenGaji>(`/v1/komponen-gaji/${id}`, data);
  return response.data;
}

/**
 * Delete a komponen gaji record
 */
export async function deleteKomponenGaji(id: number | string): Promise<void> {
  await apiClient.delete(`/v1/komponen-gaji/${id}`);
}

/**
 * Get pembayaran gaji records by gaji_id
 */
export async function getPembayaranGaji(gajiId: number | string): Promise<PembayaranGaji[]> {
  const response = await apiClient.get<PembayaranGaji[]>(`/v1/gaji/${gajiId}/pembayaran`);
  return response.data;
}

/**
 * Create a new pembayaran gaji record
 */
export async function createPembayaranGaji(gajiId: number | string, data: PembayaranGajiFormData): Promise<PembayaranGaji> {
  const response = await apiClient.post<PembayaranGaji>(`/v1/gaji/${gajiId}/pembayaran`, data);
  return response.data;
}

/**
 * Get a single pembayaran gaji record by ID
 */
export async function getPembayaranGajiById(id: number | string): Promise<PembayaranGaji> {
  const response = await apiClient.get<PembayaranGaji>(`/v1/pembayaran-gaji/${id}`);
  return response.data;
}

/**
 * Update an existing pembayaran gaji record
 */
export async function updatePembayaranGaji(id: number | string, data: Partial<PembayaranGajiFormData>): Promise<PembayaranGaji> {
  const response = await apiClient.put<PembayaranGaji>(`/v1/pembayaran-gaji/${id}`, data);
  return response.data;
}

/**
 * Update pembayaran gaji status
 */
export async function updatePembayaranGajiStatus(id: number | string, status: StatusPembayaran): Promise<PembayaranGaji> {
  const response = await apiClient.patch<PembayaranGaji>(`/v1/pembayaran-gaji/${id}/status`, { status });
  return response.data;
}

/**
 * Delete a pembayaran gaji record
 */
export async function deletePembayaranGaji(id: number | string): Promise<void> {
  await apiClient.delete(`/v1/pembayaran-gaji/${id}`);
}

