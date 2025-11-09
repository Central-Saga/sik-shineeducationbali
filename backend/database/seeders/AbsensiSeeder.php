<?php

namespace Database\Seeders;

use App\Models\Absensi;
use App\Models\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AbsensiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Seeding absensi...');

        // Get active employees only
        $employees = Employee::active()->with('user')->get();

        if ($employees->isEmpty()) {
            $this->command->warn('⚠️  No active employees found. Please run EmployeeSeeder first.');
            return;
        }

        $createdCount = 0;
        $startDate = now()->subDays(30);
        $endDate = now();

        foreach ($employees as $employee) {
            $this->command->line("   → Seeding absensi for {$employee->user->name} ({$employee->kode_karyawan})");

            // Generate absensi for each day in the last 30 days
            $currentDate = $startDate->copy();
            
            while ($currentDate->lte($endDate)) {
                // Skip weekends (Saturday and Sunday) - adjust as needed
                // Uncomment below if you want to skip weekends:
                // if ($currentDate->isWeekend()) {
                //     $currentDate->addDay();
                //     continue;
                // }

                // Check if absensi already exists for this employee and date
                $existingAbsensi = Absensi::where('karyawan_id', $employee->id)
                    ->where('tanggal', $currentDate->format('Y-m-d'))
                    ->first();

                if ($existingAbsensi) {
                    $currentDate->addDay();
                    continue;
                }

                // Determine status based on probability
                // 70% hadir, 30% izin
                $random = rand(1, 100);
                
                if ($random <= 70) {
                    // 70% chance of being present
                    $status = 'hadir';
                    // Generate random time between 07:00 and 09:00 for jam_masuk
                    $jamMasukHour = rand(7, 9);
                    $jamMasukMinute = rand(0, 59);
                    $jamMasuk = \Carbon\Carbon::parse($currentDate->format('Y-m-d') . " {$jamMasukHour}:{$jamMasukMinute}:00");
                    
                    // Generate random time between 16:00 and 18:00 for jam_pulang
                    $jamPulangHour = rand(16, 18);
                    $jamPulangMinute = rand(0, 59);
                    $jamPulang = \Carbon\Carbon::parse($currentDate->format('Y-m-d') . " {$jamPulangHour}:{$jamPulangMinute}:00");
                    
                    // Ensure jam_pulang is after jam_masuk
                    if ($jamPulang->lessThanOrEqualTo($jamMasuk)) {
                        $jamPulang->setTime(17, 0, 0);
                    }
                    
                    $durasiKerja = $jamMasuk->diffInMinutes($jamPulang);
                    
                    $sumberAbsenOptions = ['mobile', 'kiosk', 'web'];
                    $absensiData = [
                        'karyawan_id' => $employee->id,
                        'tanggal' => $currentDate->format('Y-m-d'),
                        'status_kehadiran' => $status,
                        'jam_masuk' => $jamMasuk->format('H:i:s'),
                        'jam_pulang' => $jamPulang->format('H:i:s'),
                        'durasi_kerja' => $durasiKerja,
                        'sumber_absen' => $sumberAbsenOptions[array_rand($sumberAbsenOptions)],
                        'catatan' => null,
                    ];
                } else {
                    // 30% chance of leave (izin)
                    $status = 'izin';
                    $sumberAbsenOptions = ['mobile', 'kiosk', 'web'];
                    $catatanOptions = [
                        'Izin pribadi',
                        'Izin keluarga',
                        'Izin acara keluarga',
                        'Izin keperluan pribadi',
                    ];
                    
                    // 30% chance of having sumber_absen
                    $sumberAbsen = (rand(1, 100) <= 30) ? $sumberAbsenOptions[array_rand($sumberAbsenOptions)] : null;
                    
                    $absensiData = [
                        'karyawan_id' => $employee->id,
                        'tanggal' => $currentDate->format('Y-m-d'),
                        'status_kehadiran' => $status,
                        'jam_masuk' => null,
                        'jam_pulang' => null,
                        'durasi_kerja' => null,
                        'sumber_absen' => $sumberAbsen,
                        'catatan' => $catatanOptions[array_rand($catatanOptions)],
                    ];
                }

                Absensi::create($absensiData);
                $createdCount++;
                
                $currentDate->addDay();
            }
        }

        $this->command->info("✅ Seeded {$createdCount} attendance records successfully!");
        $this->command->info("📊 Total absensi in database: " . Absensi::count());
    }
}


