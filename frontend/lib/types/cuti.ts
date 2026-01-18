export interface Cuti {
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
  jenis: 'izin' | 'sakit';
  status: 'diajukan' | 'disetujui' | 'ditolak' | 'dibatalkan' | 'pembatalan_diajukan';
  disetujui_oleh?: number | null;
  approved_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
  catatan?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CutiFormData {
  karyawan_id: number;
  tanggal: string;
  jenis: 'izin' | 'sakit';
  status?: 'diajukan' | 'disetujui' | 'ditolak' | 'dibatalkan' | 'pembatalan_diajukan';
  catatan: string;
  disetujui_oleh?: number | null;
}

