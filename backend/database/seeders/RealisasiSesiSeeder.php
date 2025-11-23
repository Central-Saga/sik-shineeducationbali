<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\RealisasiSesi;
use App\Models\SesiKerja;
use App\Models\User;
use Illuminate\Database\Seeder;

class RealisasiSesiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Seeding realisasi sesi...');

        // Get active employees only
        $employees = Employee::active()->with('user')->get();

        if ($employees->isEmpty()) {
            $this->command->warn('⚠️  No active employees found. Please run EmployeeSeeder first.');
            return;
        }

        // Get active sesi kerja
        $sesiKerjaAktif = SesiKerja::aktif()->get();

        if ($sesiKerjaAktif->isEmpty()) {
            $this->command->warn('⚠️  No active sesi kerja found. Please run SesiKerjaSeeder first.');
            return;
        }

        // Get admin users for approval
        $adminUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['Admin', 'Owner']);
        })->get();

        if ($adminUsers->isEmpty()) {
            $this->command->warn('⚠️  No admin users found. Please run UserSeeder first.');
            return;
        }

        $createdCount = 0;
        $startDate = now()->subDays(30);
        $endDate = now();

        foreach ($employees as $employee) {
            $this->command->line("   → Seeding realisasi sesi for {$employee->user->name} ({$employee->kode_karyawan})");

            // Generate realisasi sesi for each day in the last 30 days
            $currentDate = $startDate->copy();
            
            while ($currentDate->lte($endDate)) {
                // Skip weekends (Saturday and Sunday) - adjust as needed
                // Uncomment below if you want to skip weekends:
                // if ($currentDate->isWeekend()) {
                //     $currentDate->addDay();
                //     continue;
                // }

                // Get hari name in Indonesian
                $hariMap = [
                    1 => 'senin',
                    2 => 'selasa',
                    3 => 'rabu',
                    4 => 'kamis',
                    5 => 'jumat',
                    6 => 'sabtu',
                    0 => 'minggu',
                ];
                $hari = $hariMap[$currentDate->dayOfWeek] ?? 'senin';

                // Get sesi kerja for this hari
                $sesiKerjaHari = $sesiKerjaAktif->where('hari', $hari);

                if ($sesiKerjaHari->isEmpty()) {
                    $currentDate->addDay();
                    continue;
                }

                // Generate 1-3 realisasi sesi per day for this employee
                $jumlahRealisasi = fake()->numberBetween(1, 3);
                $sesiTerpakai = [];

                for ($i = 0; $i < $jumlahRealisasi && $i < $sesiKerjaHari->count(); $i++) {
                    // Pick random sesi kerja that hasn't been used
                    $availableSesi = $sesiKerjaHari->whereNotIn('id', $sesiTerpakai);
                    if ($availableSesi->isEmpty()) {
                        break;
                    }
                    $sesiKerja = $availableSesi->random();
                    $sesiTerpakai[] = $sesiKerja->id;

                    // Check if realisasi sesi already exists
                    $existingRealisasi = RealisasiSesi::where('karyawan_id', $employee->id)
                        ->where('tanggal', $currentDate->format('Y-m-d'))
                        ->where('sesi_kerja_id', $sesiKerja->id)
                        ->first();

                    if ($existingRealisasi) {
                        continue;
                    }

                    // Determine status based on probability
                    // 40% diajukan, 50% disetujui, 10% ditolak
                    $random = rand(1, 100);
                    
                    if ($random <= 40) {
                        $status = 'diajukan';
                        $disetujuiOleh = null;
                    } elseif ($random <= 90) {
                        $status = 'disetujui';
                        $disetujuiOleh = $adminUsers->random()->id;
                    } else {
                        $status = 'ditolak';
                        $disetujuiOleh = $adminUsers->random()->id;
                    }

                    $sumber = fake()->randomElement(['jadwal', 'manual']);
                    
                    $realisasiData = [
                        'karyawan_id' => $employee->id,
                        'tanggal' => $currentDate->format('Y-m-d'),
                        'sesi_kerja_id' => $sesiKerja->id,
                        'status' => $status,
                        'disetujui_oleh' => $disetujuiOleh,
                        'sumber' => $sumber,
                        'catatan' => fake()->optional(0.6)->sentence(),
                    ];

                    // Jika ditolak, wajib ada catatan
                    if ($status === 'ditolak' && empty($realisasiData['catatan'])) {
                        $realisasiData['catatan'] = fake()->randomElement([
                            'Sesi tidak sesuai dengan jadwal',
                            'Karyawan tidak hadir',
                            'Sesi dibatalkan',
                            'Tidak memenuhi syarat',
                        ]);
                    }

                    RealisasiSesi::create($realisasiData);
                    $createdCount++;
                }
                
                $currentDate->addDay();
            }
        }

        $this->command->info("✅ Seeded {$createdCount} realisasi sesi records successfully!");
        $this->command->info("📊 Total realisasi sesi in database: " . RealisasiSesi::count());
    }
}
