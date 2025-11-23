<?php

namespace Database\Seeders;

use App\Models\Absensi;
use App\Models\Cuti;
use App\Models\Employee;
use App\Models\RealisasiSesi;
use App\Models\SesiKerja;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TestingDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting comprehensive testing data seeding...');
        $this->command->newLine();

        // 1. Seed Employees
        $this->seedEmployees();

        // 2. Seed Sesi Kerja
        $this->seedSesiKerja();

        // 3. Seed Absensi (untuk 2 bulan terakhir)
        $this->seedAbsensi();

        // 4. Seed Cuti
        $this->seedCuti();

        // 5. Seed Realisasi Sesi
        $this->seedRealisasiSesi();

        $this->command->newLine();
        $this->command->info('✅ Testing data seeding completed successfully!');
    }

    /**
     * Seed employees dengan variasi yang masuk akal
     */
    protected function seedEmployees(): void
    {
        $this->command->info('🔄 Seeding employees...');

        $employees = [
            // Tetap Full Time
            ['name' => 'Budi Santoso', 'email' => 'budi.santoso@shineeducationbali.com', 'kategori' => 'tetap', 'subtipe' => null, 'tipe_gaji' => 'bulanan', 'gaji_pokok' => 12000000],
            ['name' => 'Siti Nurhaliza', 'email' => 'siti.nurhaliza@shineeducationbali.com', 'kategori' => 'tetap', 'subtipe' => null, 'tipe_gaji' => 'bulanan', 'gaji_pokok' => 15000000],
            ['name' => 'Ahmad Fauzi', 'email' => 'ahmad.fauzi@shineeducationbali.com', 'kategori' => 'tetap', 'subtipe' => null, 'tipe_gaji' => 'bulanan', 'gaji_pokok' => 10000000],
            
            // Kontrak Full Time
            ['name' => 'Dewi Lestari', 'email' => 'dewi.lestari@shineeducationbali.com', 'kategori' => 'kontrak', 'subtipe' => 'full_time', 'tipe_gaji' => 'bulanan', 'gaji_pokok' => 8000000],
            ['name' => 'Rudi Hartono', 'email' => 'rudi.hartono@shineeducationbali.com', 'kategori' => 'kontrak', 'subtipe' => 'full_time', 'tipe_gaji' => 'bulanan', 'gaji_pokok' => 7500000],
            
            // Kontrak Part Time
            ['name' => 'Maya Sari', 'email' => 'maya.sari@shineeducationbali.com', 'kategori' => 'kontrak', 'subtipe' => 'part_time', 'tipe_gaji' => 'bulanan', 'gaji_pokok' => 5000000],
            ['name' => 'Indra Gunawan', 'email' => 'indra.gunawan@shineeducationbali.com', 'kategori' => 'kontrak', 'subtipe' => 'part_time', 'tipe_gaji' => 'bulanan', 'gaji_pokok' => 4500000],
            
            // Freelance
            ['name' => 'Lina Wijaya', 'email' => 'lina.wijaya@shineeducationbali.com', 'kategori' => 'freelance', 'subtipe' => null, 'tipe_gaji' => 'per_sesi', 'gaji_pokok' => null],
            ['name' => 'Bambang Sutrisno', 'email' => 'bambang.sutrisno@shineeducationbali.com', 'kategori' => 'freelance', 'subtipe' => null, 'tipe_gaji' => 'per_sesi', 'gaji_pokok' => null],
            ['name' => 'Ratna Dewi', 'email' => 'ratna.dewi@shineeducationbali.com', 'kategori' => 'freelance', 'subtipe' => null, 'tipe_gaji' => 'per_sesi', 'gaji_pokok' => null],
        ];

        $adminUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['Admin', 'Owner']);
        })->get();

        $karyawanRole = \Spatie\Permission\Models\Role::where('name', 'Karyawan')->first();

        $createdCount = 0;
        foreach ($employees as $empData) {
            // Check if user exists
            $user = User::where('email', $empData['email'])->first();
            
            if (!$user) {
                // Create user
                $user = User::create([
                    'name' => $empData['name'],
                    'email' => $empData['email'],
                    'password' => bcrypt('password123'),
                    'email_verified_at' => now(),
                ]);
                
                if ($karyawanRole) {
                    $user->assignRole($karyawanRole);
                }
            }

            // Create or update employee
            $employee = Employee::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'kategori_karyawan' => $empData['kategori'],
                    'subtipe_kontrak' => $empData['subtipe'],
                    'tipe_gaji' => $empData['tipe_gaji'],
                    'gaji_pokok' => $empData['gaji_pokok'],
                    'bank_nama' => fake()->randomElement(['Bank Central Asia', 'Bank Mandiri', 'Bank Negara Indonesia', 'Bank Rakyat Indonesia']),
                    'bank_no_rekening' => fake()->numerify('##########'),
                    'nomor_hp' => '08' . fake()->numerify('##########'),
                    'alamat' => fake()->address(),
                    'tanggal_lahir' => fake()->dateTimeBetween('-50 years', '-22 years')->format('Y-m-d'),
                    'status' => 'aktif',
                ]
            );

            // Generate kode_karyawan if not exists
            if (empty($employee->kode_karyawan)) {
                $employee->kode_karyawan = $this->generateKodeKaryawan();
                $employee->save();
            }

            $createdCount++;
            $this->command->line("   → {$user->name} ({$employee->kode_karyawan}) - {$empData['kategori']} - {$empData['tipe_gaji']}");
        }

        $this->command->info("✅ Seeded {$createdCount} employees successfully!");
    }

    /**
     * Seed sesi kerja dengan jadwal yang masuk akal
     */
    protected function seedSesiKerja(): void
    {
        $this->command->info('🔄 Seeding sesi kerja...');

        // Delete existing sesi kerja untuk testing (tidak bisa truncate karena foreign key)
        SesiKerja::query()->delete();

        $kategoris = ['coding', 'non_coding'];
        $haris = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
        
        $tarifMap = [
            'coding' => 35000,
            'non_coding' => 30000,
        ];

        $mataPelajaranMap = [
            'coding' => ['Python Programming', 'JavaScript & Web Development', 'Mobile App Development', 'Data Science & Analytics', 'Game Development', 'Full Stack Development'],
            'non_coding' => ['Matematika', 'Bahasa Inggris', 'IPA (Fisika, Kimia, Biologi)', 'IPS (Sejarah, Geografi)', 'Bahasa Indonesia', 'Seni & Budaya'],
        ];

        // Jadwal sesi yang masuk akal (Senin-Jumat: 08:00-17:00, Sabtu: 08:00-12:00)
        $sesiJadwal = [
            1 => ['mulai' => '08:00:00', 'selesai' => '09:00:00'],
            2 => ['mulai' => '09:00:00', 'selesai' => '10:00:00'],
            3 => ['mulai' => '10:00:00', 'selesai' => '11:00:00'],
            4 => ['mulai' => '11:00:00', 'selesai' => '12:00:00'],
            5 => ['mulai' => '13:00:00', 'selesai' => '14:00:00'],
            6 => ['mulai' => '14:00:00', 'selesai' => '15:00:00'],
            7 => ['mulai' => '15:00:00', 'selesai' => '16:00:00'],
            8 => ['mulai' => '16:00:00', 'selesai' => '17:00:00'],
        ];

        $createdCount = 0;
        foreach ($kategoris as $kategori) {
            foreach ($haris as $hari) {
                // Senin-Jumat: 5-6 sesi, Sabtu: 3-4 sesi
                $jumlahSesi = ($hari === 'sabtu') ? fake()->numberBetween(3, 4) : fake()->numberBetween(5, 6);
                
                $nomorSesiTerpakai = [];
                for ($i = 0; $i < $jumlahSesi; $i++) {
                    // Pilih nomor sesi yang belum terpakai
                    $availableSesi = array_diff(range(1, ($hari === 'sabtu') ? 4 : 8), $nomorSesiTerpakai);
                    if (empty($availableSesi)) {
                        break;
                    }
                    $nomorSesi = fake()->randomElement($availableSesi);
                    $nomorSesiTerpakai[] = $nomorSesi;

                    SesiKerja::create([
                        'kategori' => $kategori,
                        'mata_pelajaran' => fake()->randomElement($mataPelajaranMap[$kategori]),
                        'hari' => $hari,
                        'nomor_sesi' => $nomorSesi,
                        'jam_mulai' => $sesiJadwal[$nomorSesi]['mulai'],
                        'jam_selesai' => $sesiJadwal[$nomorSesi]['selesai'],
                        'tarif' => $tarifMap[$kategori],
                        'status' => 'aktif',
                    ]);

                    $createdCount++;
                }
            }
        }

        $this->command->info("✅ Seeded {$createdCount} sesi kerja records successfully!");
    }

    /**
     * Seed absensi untuk November 2025
     */
    protected function seedAbsensi(): void
    {
        $this->command->info('🔄 Seeding absensi...');

        $employees = Employee::active()->get();
        if ($employees->isEmpty()) {
            $this->command->warn('⚠️  No active employees found.');
            return;
        }

        // Data khusus untuk November 2025
        $startDate = Carbon::create(2025, 11, 1)->startOfMonth();
        $endDate = Carbon::create(2025, 11, 30)->endOfMonth();
        $createdCount = 0;

        foreach ($employees as $employee) {
            $currentDate = $startDate->copy();
            
            while ($currentDate->lte($endDate)) {
                // Skip Sunday
                if ($currentDate->dayOfWeek === Carbon::SUNDAY) {
                    $currentDate->addDay();
                    continue;
                }

                // Check if absensi already exists - skip if exists (bisa dihapus manual jika ingin regenerate)
                $existing = Absensi::where('karyawan_id', $employee->id)
                    ->where('tanggal', $currentDate->format('Y-m-d'))
                    ->first();

                if ($existing) {
                    $currentDate->addDay();
                    continue;
                }

                // Skip jika ada cuti yang disetujui di tanggal ini
                $hasCuti = Cuti::where('karyawan_id', $employee->id)
                    ->where('tanggal', $currentDate->format('Y-m-d'))
                    ->where('status', 'disetujui')
                    ->exists();

                if ($hasCuti) {
                    $currentDate->addDay();
                    continue; // Skip hari dengan cuti yang disetujui
                }

                // 85% hadir, 15% izin
                $random = rand(1, 100);
                
                if ($random <= 85) {
                    // Hadir
                    $jamMasuk = $currentDate->copy()->setTime(rand(7, 8), rand(0, 59), 0);
                    $jamPulang = $currentDate->copy()->setTime(rand(16, 17), rand(0, 59), 0);
                    
                    if ($jamPulang->lessThanOrEqualTo($jamMasuk)) {
                        $jamPulang = $jamMasuk->copy()->addHours(8);
                    }
                    
                    Absensi::create([
                        'karyawan_id' => $employee->id,
                        'tanggal' => $currentDate->format('Y-m-d'),
                        'status_kehadiran' => 'hadir',
                        'jam_masuk' => $jamMasuk->format('H:i:s'),
                        'jam_pulang' => $jamPulang->format('H:i:s'),
                        'durasi_kerja' => $jamMasuk->diffInMinutes($jamPulang),
                        'sumber_absen' => fake()->randomElement(['mobile', 'kiosk', 'web']),
                        'catatan' => null,
                    ]);
                } else {
                    // Izin
                    Absensi::create([
                        'karyawan_id' => $employee->id,
                        'tanggal' => $currentDate->format('Y-m-d'),
                        'status_kehadiran' => 'izin',
                        'jam_masuk' => null,
                        'jam_pulang' => null,
                        'durasi_kerja' => null,
                        'sumber_absen' => fake()->optional(0.3)->randomElement(['mobile', 'kiosk', 'web']),
                        'catatan' => fake()->randomElement([
                            'Izin keperluan pribadi',
                            'Izin keluarga',
                            'Izin acara keluarga',
                            'Izin keperluan mendesak',
                        ]),
                    ]);
                }

                $createdCount++;
                $currentDate->addDay();
            }
        }

        $this->command->info("✅ Seeded {$createdCount} absensi records successfully!");
    }

    /**
     * Seed cuti dengan lebih banyak yang disetujui untuk November 2025
     */
    protected function seedCuti(): void
    {
        $this->command->info('🔄 Seeding cuti...');

        $employees = Employee::active()->get();
        if ($employees->isEmpty()) {
            $this->command->warn('⚠️  No active employees found.');
            return;
        }

        $adminUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['Admin', 'Owner']);
        })->get();

        if ($adminUsers->isEmpty()) {
            $this->command->warn('⚠️  No admin users found.');
            return;
        }

        // Data khusus untuk November 2025
        $startDate = Carbon::create(2025, 11, 1)->startOfMonth();
        $endDate = Carbon::create(2025, 11, 30)->endOfMonth();
        $createdCount = 0;

        foreach ($employees as $employee) {
            // Generate 3-8 cuti records per employee
            $cutiCount = fake()->numberBetween(3, 8);

            for ($i = 0; $i < $cutiCount; $i++) {
                $tanggal = Carbon::createFromFormat('Y-m-d', fake()->dateTimeBetween($startDate, $endDate)->format('Y-m-d'));
                
                // Skip Sunday
                if ($tanggal->dayOfWeek === Carbon::SUNDAY) {
                    continue;
                }

                // Check if cuti already exists
                $existing = Cuti::where('karyawan_id', $employee->id)
                    ->where('tanggal', $tanggal->format('Y-m-d'))
                    ->first();

                if ($existing) {
                    continue;
                }

                // 70% disetujui, 20% diajukan, 10% ditolak
                $random = rand(1, 100);
                
                if ($random <= 70) {
                    $status = 'disetujui';
                    $disetujuiOleh = $adminUsers->random()->id;
                } elseif ($random <= 90) {
                    $status = 'diajukan';
                    $disetujuiOleh = null;
                } else {
                    $status = 'ditolak';
                    $disetujuiOleh = $adminUsers->random()->id;
                }

                $jenis = fake()->randomElement(['izin', 'sakit']);
                
                $catatanMap = [
                    'izin' => [
                        'Izin keperluan pribadi',
                        'Izin keluarga',
                        'Izin acara keluarga',
                        'Izin keperluan mendesak',
                        'Izin cuti tahunan',
                        'Izin cuti bersama',
                    ],
                    'sakit' => [
                        'Sakit demam',
                        'Sakit kepala',
                        'Sakit perut',
                        'Sakit flu',
                        'Sakit dengan surat dokter',
                    ],
                ];

                Cuti::create([
                    'karyawan_id' => $employee->id,
                    'tanggal' => $tanggal->format('Y-m-d'),
                    'jenis' => $jenis,
                    'status' => $status,
                    'disetujui_oleh' => $disetujuiOleh,
                    'catatan' => fake()->randomElement($catatanMap[$jenis]),
                ]);

                $createdCount++;
            }
        }

        $this->command->info("✅ Seeded {$createdCount} cuti records successfully!");
    }

    /**
     * Seed realisasi sesi dengan distribusi sumber yang lebih baik
     */
    protected function seedRealisasiSesi(): void
    {
        $this->command->info('🔄 Seeding realisasi sesi...');

        $employees = Employee::active()->get();
        if ($employees->isEmpty()) {
            $this->command->warn('⚠️  No active employees found.');
            return;
        }

        $sesiKerjaAktif = SesiKerja::aktif()->get();
        if ($sesiKerjaAktif->isEmpty()) {
            $this->command->warn('⚠️  No active sesi kerja found.');
            return;
        }

        $adminUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['Admin', 'Owner']);
        })->get();

        if ($adminUsers->isEmpty()) {
            $this->command->warn('⚠️  No admin users found.');
            return;
        }

        // Data khusus untuk November 2025
        $startDate = Carbon::create(2025, 11, 1)->startOfMonth();
        $endDate = Carbon::create(2025, 11, 30)->endOfMonth();
        $createdCount = 0;

        foreach ($employees as $employee) {
            $currentDate = $startDate->copy();
            
            while ($currentDate->lte($endDate)) {
                // Skip Sunday
                if ($currentDate->dayOfWeek === Carbon::SUNDAY) {
                    $currentDate->addDay();
                    continue;
                }

                $hariMap = [
                    1 => 'senin',
                    2 => 'selasa',
                    3 => 'rabu',
                    4 => 'kamis',
                    5 => 'jumat',
                    6 => 'sabtu',
                ];
                $hari = $hariMap[$currentDate->dayOfWeek] ?? 'senin';

                // Get sesi kerja for this hari
                $sesiKerjaHari = $sesiKerjaAktif->where('hari', $hari);

                if ($sesiKerjaHari->isEmpty()) {
                    $currentDate->addDay();
                    continue;
                }

                // Untuk tetap/kontrak: lebih banyak wajib, sedikit lembur
                // Untuk freelance: lebih banyak lembur
                $isTetapKontrak = in_array($employee->kategori_karyawan, ['tetap', 'kontrak']);
                $sumberWajibRatio = $isTetapKontrak ? 0.7 : 0.3; // 70% wajib untuk tetap/kontrak, 30% untuk freelance

                // Generate 1-4 realisasi sesi per day
                $jumlahRealisasi = fake()->numberBetween(1, min(4, $sesiKerjaHari->count()));
                $sesiTerpakai = [];

                for ($i = 0; $i < $jumlahRealisasi; $i++) {
                    $availableSesi = $sesiKerjaHari->whereNotIn('id', $sesiTerpakai);
                    if ($availableSesi->isEmpty()) {
                        break;
                    }
                    $sesiKerja = $availableSesi->random();
                    $sesiTerpakai[] = $sesiKerja->id;

                    // Check if realisasi sesi already exists for this employee
                    $existingForEmployee = RealisasiSesi::where('karyawan_id', $employee->id)
                        ->where('tanggal', $currentDate->format('Y-m-d'))
                        ->where('sesi_kerja_id', $sesiKerja->id)
                        ->first();

                    if ($existingForEmployee) {
                        continue;
                    }

                    // Check if sesi kerja already taken by another employee on this date
                    // (Constraint: satu sesi kerja per tanggal hanya bisa diisi oleh satu karyawan)
                    $existingForSesi = RealisasiSesi::where('tanggal', $currentDate->format('Y-m-d'))
                        ->where('sesi_kerja_id', $sesiKerja->id)
                        ->first();

                    if ($existingForSesi) {
                        continue; // Skip this sesi, sudah diambil karyawan lain
                    }

                    // 80% disetujui, 15% diajukan, 5% ditolak
                    $random = rand(1, 100);
                    
                    if ($random <= 80) {
                        $status = 'disetujui';
                        $disetujuiOleh = $adminUsers->random()->id;
                    } elseif ($random <= 95) {
                        $status = 'diajukan';
                        $disetujuiOleh = null;
                    } else {
                        $status = 'ditolak';
                        $disetujuiOleh = $adminUsers->random()->id;
                    }

                    // Tentukan sumber berdasarkan ratio
                    $sumber = (rand(1, 100) / 100) <= $sumberWajibRatio ? 'wajib' : 'lembur';

                    RealisasiSesi::create([
                        'karyawan_id' => $employee->id,
                        'tanggal' => $currentDate->format('Y-m-d'),
                        'sesi_kerja_id' => $sesiKerja->id,
                        'status' => $status,
                        'disetujui_oleh' => $disetujuiOleh,
                        'sumber' => $sumber,
                        'catatan' => $status === 'ditolak' ? fake()->randomElement([
                            'Sesi tidak sesuai dengan jadwal',
                            'Karyawan tidak hadir',
                            'Sesi dibatalkan',
                        ]) : fake()->optional(0.3)->sentence(),
                    ]);

                    $createdCount++;
                }
                
                $currentDate->addDay();
            }
        }

        $this->command->info("✅ Seeded {$createdCount} realisasi sesi records successfully!");
    }

    /**
     * Generate unique employee code
     */
    protected function generateKodeKaryawan(): string
    {
        $maxAttempts = 100;
        $attempts = 0;

        do {
            $randomDigits = str_pad((string) rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            $kodeKaryawan = 'SEB' . $randomDigits;

            $exists = DB::table('karyawan')
                ->where('kode_karyawan', $kodeKaryawan)
                ->exists();

            $attempts++;

            if (!$exists) {
                return $kodeKaryawan;
            }

        } while ($attempts < $maxAttempts);

        return 'SEB' . substr(time(), -4) . rand(0, 9);
    }
}

