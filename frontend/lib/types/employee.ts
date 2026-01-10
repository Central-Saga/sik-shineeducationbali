export interface Employee {
  id: number;
  kode_karyawan?: string;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  kategori_karyawan: 'tetap' | 'kontrak' | 'freelance';
  subtipe_kontrak?: 'full_time' | 'part_time' | null;
  tipe_gaji: 'bulanan' | 'per_sesi';
  gaji_pokok?: number | null;
  bank_nama?: string | null;
  bank_no_rekening?: string | null;
  nomor_hp?: string | null;
  alamat?: string | null;
  tanggal_lahir?: string | null;
  status: 'aktif' | 'nonaktif';
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeFormData {
  name?: string;
  email?: string;
  password?: string;
  user_id?: number;
  kategori_karyawan: 'tetap' | 'kontrak' | 'freelance';
  subtipe_kontrak?: 'full_time' | 'part_time' | null;
  tipe_gaji: 'bulanan' | 'per_sesi';
  gaji_pokok?: number | null;
  bank_nama?: string | null;
  bank_no_rekening?: string | null;
  nomor_hp?: string | null;
  alamat?: string | null;
  tanggal_lahir?: string | null;
  status?: 'aktif' | 'nonaktif';
}

