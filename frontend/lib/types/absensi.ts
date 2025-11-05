export interface Absensi {
  id: number;
  karyawan_id: number;
  employee?: {
    id: number;
    kode_karyawan?: string;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
  tanggal: string;
  status_kehadiran: 'hadir' | 'izin' | 'sakit' | 'alpa';
  jam_masuk?: string | null;
  jam_pulang?: string | null;
  durasi_kerja?: number | null;
  durasi_kerja_formatted?: string | null;
  sumber_absen?: string | null;
  catatan?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface AbsensiFormData {
  karyawan_id: number;
  tanggal: string;
  status_kehadiran: 'hadir' | 'izin' | 'sakit' | 'alpa';
  jam_masuk?: string | null;
  jam_pulang?: string | null;
  sumber_absen?: string | null;
  catatan?: string | null;
}



