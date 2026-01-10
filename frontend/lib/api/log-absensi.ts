import { apiClient } from './client';
import type { LogAbsensi } from '@/lib/types/log-absensi';

/**
 * Get all log absensi records
 */
export async function getLogAbsensi(): Promise<LogAbsensi[]> {
  const response = await apiClient.get<LogAbsensi[]>('/v1/log-absensi');
  return response.data;
}

/**
 * Get a single log absensi record by ID
 */
export async function getLogAbsensiById(id: number | string): Promise<LogAbsensi> {
  const response = await apiClient.get<LogAbsensi>(`/v1/log-absensi/${id}`);
  return response.data;
}

/**
 * Get all log absensi records by absensi ID
 */
export async function getLogAbsensiByAbsensiId(absensiId: number | string): Promise<LogAbsensi[]> {
  const response = await apiClient.get<LogAbsensi[]>(`/v1/log-absensi/absensi/${absensiId}`);
  return response.data;
}

/**
 * Get check-in log for specific absensi
 */
export async function getLogAbsensiCheckIn(absensiId: number | string): Promise<LogAbsensi | null> {
  try {
    const response = await apiClient.get<LogAbsensi>(`/v1/log-absensi/absensi/${absensiId}/check-in`);
    return response.data;
  } catch (error) {
    // Return null if not found
    return null;
  }
}

/**
 * Get check-out log for specific absensi
 */
export async function getLogAbsensiCheckOut(absensiId: number | string): Promise<LogAbsensi | null> {
  try {
    const response = await apiClient.get<LogAbsensi>(`/v1/log-absensi/absensi/${absensiId}/check-out`);
    return response.data;
  } catch (error) {
    // Return null if not found
    return null;
  }
}

/**
 * Get all check-in log records
 */
export async function getLogAbsensiCheckInAll(): Promise<LogAbsensi[]> {
  const response = await apiClient.get<LogAbsensi[]>('/v1/log-absensi/check-in');
  return response.data;
}

/**
 * Get all check-out log records
 */
export async function getLogAbsensiCheckOutAll(): Promise<LogAbsensi[]> {
  const response = await apiClient.get<LogAbsensi[]>('/v1/log-absensi/check-out');
  return response.data;
}

/**
 * Create a new log absensi record (check-in or check-out)
 */
export interface CreateLogAbsensiData {
  absensi_id: number;
  jenis: 'check_in' | 'check_out';
  waktu: string; // Format: Y-m-d H:i:s
  latitude: number;
  longitude: number;
  akurasi: number;
  foto_selfie?: string | null;
  sumber: 'mobile' | 'web';
  validasi_gps?: boolean;
  latitude_referensi?: number;
  longitude_referensi?: number;
  radius_min?: number;
  radius_max?: number;
}

export async function createLogAbsensi(data: CreateLogAbsensiData): Promise<LogAbsensi> {
  const response = await apiClient.post<LogAbsensi>('/v1/log-absensi', data);
  return response.data;
}

