export interface RekapBulanan {
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
  jumlah_hadir: number;
  jumlah_izin: number;
  jumlah_sakit: number;
  jumlah_cuti: number;
  jumlah_alfa: number;
  jumlah_sesi_coding: number;
  jumlah_sesi_non_coding: number;
  nilai_sesi_coding: number;
  nilai_sesi_non_coding: number;
  total_pendapatan_sesi: number;
  created_at?: string;
  updated_at?: string;
}

export interface RekapBulananFormData {
  periode: string;
}

