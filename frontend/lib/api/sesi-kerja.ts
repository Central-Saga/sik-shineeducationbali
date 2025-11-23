import { apiClient } from './client';
import type { SesiKerja, SesiKerjaFormData } from '@/lib/types/sesi-kerja';

export interface GetSesiKerjaParams {
  kategori?: 'coding' | 'non_coding';
  hari?: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
  status?: 'aktif' | 'non aktif';
}

/**
 * Get all sesi kerja records with optional filters
 */
export async function getSesiKerja(params?: GetSesiKerjaParams): Promise<SesiKerja[]> {
  const response = await apiClient.get<SesiKerja[]>('/v1/sesi-kerja', { params });
  return response.data;
}

/**
 * Get a single sesi kerja record by ID
 */
export async function getSesiKerjaById(id: number | string): Promise<SesiKerja> {
  const response = await apiClient.get<SesiKerja>(`/v1/sesi-kerja/${id}`);
  return response.data;
}

/**
 * Helper function to normalize time format to HH:mm:ss
 */
function normalizeTimeFormat(time: string | undefined | null): string {
  if (!time) return '08:00:00';
  const parts = time.split(':');
  if (parts.length === 2) {
    // HH:mm -> HH:mm:ss
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  } else if (parts.length === 3) {
    // HH:mm:ss -> ensure leading zeros
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
  }
  return time;
}

/**
 * Create a new sesi kerja record
 */
export async function createSesiKerja(data: SesiKerjaFormData): Promise<SesiKerja> {
  // Normalize time formats before sending
  const normalizedData = {
    ...data,
    jam_mulai: normalizeTimeFormat(data.jam_mulai),
    jam_selesai: normalizeTimeFormat(data.jam_selesai),
  };
  const response = await apiClient.post<SesiKerja>('/v1/sesi-kerja', normalizedData);
  return response.data;
}

/**
 * Update an existing sesi kerja record
 */
export async function updateSesiKerja(id: number | string, data: Partial<SesiKerjaFormData>): Promise<SesiKerja> {
  // Normalize time formats before sending
  const normalizedData = {
    ...data,
    ...(data.jam_mulai && { jam_mulai: normalizeTimeFormat(data.jam_mulai) }),
    ...(data.jam_selesai && { jam_selesai: normalizeTimeFormat(data.jam_selesai) }),
  };
  const response = await apiClient.put<SesiKerja>(`/v1/sesi-kerja/${id}`, normalizedData);
  return response.data;
}

/**
 * Delete a sesi kerja record
 */
export async function deleteSesiKerja(id: number | string): Promise<void> {
  await apiClient.delete(`/v1/sesi-kerja/${id}`);
}

/**
 * Get sesi kerja records by kategori
 */
export async function getSesiKerjaByKategori(kategori: 'coding' | 'non_coding', params?: Omit<GetSesiKerjaParams, 'kategori'>): Promise<SesiKerja[]> {
  const response = await apiClient.get<SesiKerja[]>(`/v1/sesi-kerja/kategori/${kategori}`, { params });
  return response.data;
}

/**
 * Get sesi kerja records by hari
 */
export async function getSesiKerjaByHari(hari: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu', params?: Omit<GetSesiKerjaParams, 'hari'>): Promise<SesiKerja[]> {
  const response = await apiClient.get<SesiKerja[]>(`/v1/sesi-kerja/hari/${hari}`, { params });
  return response.data;
}

/**
 * Get sesi kerja records by kategori and hari
 */
export async function getSesiKerjaByKategoriHari(kategori: 'coding' | 'non_coding', hari: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu'): Promise<SesiKerja[]> {
  const response = await apiClient.get<SesiKerja[]>(`/v1/sesi-kerja/kategori/${kategori}/hari/${hari}`);
  return response.data;
}

/**
 * Get active sesi kerja records
 */
export async function getSesiKerjaAktif(params?: Omit<GetSesiKerjaParams, 'status'>): Promise<SesiKerja[]> {
  const response = await apiClient.get<SesiKerja[]>('/v1/sesi-kerja/aktif', { params });
  return response.data;
}

