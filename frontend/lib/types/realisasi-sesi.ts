export type StatusRealisasi = 'diajukan' | 'disetujui' | 'ditolak';
export type SumberRealisasi = 'wajib' | 'lembur';

export interface RealisasiSesi {
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
  sesi_kerja_id: number;
  sesi_kerja?: {
    id: number;
    kategori: string;
    mata_pelajaran?: string | null;
    hari: string;
    nomor_sesi: number;
    jam_mulai?: string | null;
    jam_selesai?: string | null;
    tarif?: number | null;
    status: string;
  };
  status: StatusRealisasi;
  disetujui_oleh?: number | null;
  approved_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
  sumber: SumberRealisasi;
  catatan?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RealisasiSesiFormData {
  karyawan_id: number;
  tanggal: string;
  sesi_kerja_id: number;
  status?: StatusRealisasi;
  sumber: SumberRealisasi;
  catatan?: string | null;
}

