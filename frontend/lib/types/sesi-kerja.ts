export type KategoriSesi = 'coding' | 'non_coding';
export type HariSesi = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
export type StatusSesi = 'aktif' | 'non aktif';

export interface SesiKerja {
  id: number;
  kategori: KategoriSesi;
  mata_pelajaran?: string | null;
  hari: HariSesi;
  nomor_sesi: number;
  jam_mulai?: string | null;
  jam_selesai?: string | null;
  tarif?: number | null;
  status: StatusSesi;
  realisasi_sesi?: Array<{
    id: number;
    karyawan_id: number;
    tanggal?: string | null;
    status: string;
    sumber: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface SesiKerjaFormData {
  kategori: KategoriSesi;
  mata_pelajaran?: string | null;
  hari: HariSesi;
  nomor_sesi?: number; // Optional, will be auto-generated
  jam_mulai: string;
  jam_selesai: string;
  tarif: number;
  status?: StatusSesi;
}

