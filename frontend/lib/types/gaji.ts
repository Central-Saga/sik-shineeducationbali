export type StatusGaji = 'draft' | 'disetujui' | 'dibayar';
export type JenisKomponenGaji = 'gaji_pokok' | 'pendapatan_sesi' | 'lembur_sesi' | 'potongan' | 'bonus';
export type StatusPembayaran = 'menunggu' | 'berhasil' | 'gagal';

export interface KomponenGaji {
  id: number;
  gaji_id: number;
  gaji?: {
    id: number;
    periode: string;
    total_gaji: number;
    status: StatusGaji;
  };
  jenis: JenisKomponenGaji;
  nama_komponen: string;
  nominal: number;
  created_at?: string;
  updated_at?: string;
}

export interface KomponenGajiFormData {
  jenis: JenisKomponenGaji;
  nama_komponen: string;
  nominal: number;
}

export interface PembayaranGaji {
  id: number;
  gaji_id: number;
  gaji?: {
    id: number;
    periode: string;
    total_gaji: number;
    status: StatusGaji;
  };
  tanggal_transfer: string;
  bukti_transfer?: string | null;
  status_pembayaran: StatusPembayaran;
  disetujui_oleh?: number | null;
  disetujuiOleh?: {
    id: number;
    name: string;
    email: string;
  } | null;
  catatan?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PembayaranGajiFormData {
  tanggal_transfer: string;
  bukti_transfer?: string | null;
  status_pembayaran?: StatusPembayaran;
  catatan?: string | null;
}

export interface DetailLembur {
  id: number;
  tanggal: string;
  sesi_kerja?: {
    id: number;
    mata_pelajaran: string | null;
    kategori: string;
    tarif: number;
  } | null;
}

export interface Gaji {
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
  periode: string;
  hari_cuti: number;
  potongan_cuti: number;
  total_gaji: number;
  status: StatusGaji;
  dibuat_oleh?: number | null;
  dibuatOleh?: {
    id: number;
    name: string;
    email: string;
  } | null;
  komponen_gaji?: KomponenGaji[];
  pembayaran_gaji?: PembayaranGaji[];
  detail_lembur?: DetailLembur[];
  created_at?: string;
  updated_at?: string;
}

export interface GajiFormData {
  karyawan_id: number;
  periode: string;
  hari_cuti?: number;
  potongan_cuti?: number;
  total_gaji: number;
  status?: StatusGaji;
}

