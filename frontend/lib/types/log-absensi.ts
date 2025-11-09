export interface LogAbsensi {
  id: number;
  absensi_id: number;
  absensi?: {
    id: number;
    tanggal?: string;
    status_kehadiran?: string;
    jam_masuk?: string | null;
    jam_pulang?: string | null;
    employee?: {
      id: number;
      kode_karyawan?: string;
      user?: {
        id: number;
        name: string;
        email: string;
      };
    };
  };
  jenis: 'check_in' | 'check_out';
  jenis_label?: string;
  waktu?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  akurasi?: number | null;
  akurasi_formatted?: string | null;
  foto_selfie?: string | null;
  foto_selfie_path?: string | null;
  sumber: 'mobile' | 'web';
  sumber_label?: string;
  validasi_gps?: boolean;
  validasi_gps_label?: string;
  latitude_referensi?: number | null;
  longitude_referensi?: number | null;
  radius_min?: number | null;
  radius_max?: number | null;
  distance?: number | null; // Jarak dari titik utama dalam meter (dari backend)
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}



