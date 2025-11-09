import { apiClient } from './client';
import type { Absensi, AbsensiFormData } from '@/lib/types/absensi';

export interface GetAbsensiParams {
  karyawan_id?: number;
  tanggal?: string;
  start_date?: string;
  end_date?: string;
  status_kehadiran?: 'hadir' | 'izin' 
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
  // If foto_selfie is provided, use FormData, otherwise use JSON
  if (data.foto_selfie) {
    const formData = new FormData();
    
    // Add all form fields
    formData.append('karyawan_id', data.karyawan_id.toString());
    formData.append('tanggal', data.tanggal);
    formData.append('status_kehadiran', data.status_kehadiran);
    
    if (data.jam_masuk) {
      formData.append('jam_masuk', data.jam_masuk);
    }
    if (data.jam_pulang) {
      formData.append('jam_pulang', data.jam_pulang);
    }
    if (data.sumber_absen) {
      formData.append('sumber_absen', data.sumber_absen);
    }
    if (data.catatan) {
      formData.append('catatan', data.catatan);
    }
    
    // Add foto and geo location
    formData.append('foto_selfie', data.foto_selfie);
    if (data.latitude !== null && data.latitude !== undefined) {
      formData.append('latitude', data.latitude.toString());
    }
    if (data.longitude !== null && data.longitude !== undefined) {
      formData.append('longitude', data.longitude.toString());
    }
    if (data.akurasi !== null && data.akurasi !== undefined) {
      formData.append('akurasi', data.akurasi.toString());
    }
    if (data.jenis) {
      formData.append('jenis', data.jenis);
    }
    
    const response = await apiClient.post<Absensi>('/v1/absensi', formData);
    return response.data;
  } else {
    // Remove foto_selfie from data before sending (it's not a valid JSON field)
    const { foto_selfie, ...jsonData } = data;
    const response = await apiClient.post<Absensi>('/v1/absensi', jsonData);
    return response.data;
  }
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






