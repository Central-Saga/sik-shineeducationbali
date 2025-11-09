<?php

namespace Database\Seeders;

use App\Models\Cuti;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;

class CutiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Seeding cuti...');

        // Get active employees only
        $employees = Employee::active()->with('user')->get();

        if ($employees->isEmpty()) {
            $this->command->warn('⚠️  No active employees found. Please run EmployeeSeeder first.');
            return;
        }

        // Get admin users for approval
        $adminUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['Admin', 'Owner']);
        })->get();

        if ($adminUsers->isEmpty()) {
            $this->command->warn('⚠️  No admin users found. Some cuti records may not have disetujui_oleh.');
        }

        $createdCount = 0;
        $startDate = now()->subDays(60);
        $endDate = now()->addDays(30);

        foreach ($employees as $employee) {
            $this->command->line("   → Seeding cuti for {$employee->user->name} ({$employee->kode_karyawan})");

            // Generate 5-10 cuti records per employee
            $cutiCount = fake()->numberBetween(5, 10);

            for ($i = 0; $i < $cutiCount; $i++) {
                $jenis = fake()->randomElement(['cuti', 'izin', 'sakit']);
                $status = fake()->randomElement(['diajukan', 'disetujui', 'ditolak']);

                // Generate catatan berdasarkan jenis
                $catatanMap = [
                    'cuti' => [
                        'Cuti tahunan',
                        'Cuti bersama',
                        'Cuti melahirkan',
                        'Cuti haji',
                        'Cuti besar',
                    ],
                    'izin' => [
                        'Izin pribadi',
                        'Izin keluarga',
                        'Izin acara keluarga',
                        'Izin keperluan pribadi',
                        'Izin keperluan mendesak',
                    ],
                    'sakit' => [
                        'Sakit demam',
                        'Sakit kepala',
                        'Sakit perut',
                        'Sakit flu',
                        'Sakit dengan surat dokter',
                    ],
                ];

                $catatan = fake()->randomElement($catatanMap[$jenis]);

                // Jika status disetujui, perlu disetujui_oleh
                $disetujuiOleh = null;
                if ($status === 'disetujui' && $adminUsers->isNotEmpty()) {
                    $disetujuiOleh = $adminUsers->random()->id;
                }

                // Generate tanggal yang unik untuk employee ini
                $tanggal = fake()->dateTimeBetween($startDate, $endDate)->format('Y-m-d');

                // Check if cuti already exists for this employee and date
                $existingCuti = Cuti::where('karyawan_id', $employee->id)
                    ->where('tanggal', $tanggal)
                    ->first();

                if ($existingCuti) {
                    continue;
                }

                Cuti::create([
                    'karyawan_id' => $employee->id,
                    'tanggal' => $tanggal,
                    'jenis' => $jenis,
                    'status' => $status,
                    'disetujui_oleh' => $disetujuiOleh,
                    'catatan' => $catatan,
                ]);

                $createdCount++;
            }
        }

        $this->command->info("✅ Seeded {$createdCount} cuti records successfully!");
        $this->command->info("📊 Total cuti in database: " . Cuti::count());
    }
}

