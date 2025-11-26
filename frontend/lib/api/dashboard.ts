import { apiClient } from './client';

export interface DashboardStatistics {
  // Admin statistics
  total_users?: number;
  total_karyawan?: number;
  absensi_hari_ini?: number;
  cuti_pending?: number;
  realisasi_sesi_pending?: number;
  total_gaji_bulan_ini?: number;
  
  // Owner statistics
  total_rekap_bulanan?: number;
  
  // Karyawan statistics
  cuti_tersisa?: number;
  gaji_terakhir?: {
    periode: string;
    total_gaji: number;
  } | null;
  realisasi_sesi_saya?: number;
}

export interface ChartDataPoint {
  date?: string;
  periode?: string;
  label: string;
  value: number;
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  color: string;
}

/**
 * Get dashboard statistics based on user role
 */
export async function getDashboardStatistics(): Promise<DashboardStatistics> {
  const response = await apiClient.get<DashboardStatistics>('/v1/dashboard/statistics');
  return response.data;
}

/**
 * Get chart data by type
 * Types: 'absensi-trend', 'cuti-distribution', 'gaji-trend', 'realisasi-sesi-distribution', 'absensi-bulan-ini', 'realisasi-sesi-status'
 */
export async function getChartData(type: string): Promise<ChartDataPoint[] | PieChartDataPoint[]> {
  const response = await apiClient.get<ChartDataPoint[] | PieChartDataPoint[]>(`/v1/dashboard/charts/${type}`);
  return response.data;
}

