<?php

namespace Database\Seeders;

use App\Models\Absensi;
use App\Models\LogAbsensi;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class LogAbsensiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Seeding log_absensi...');

        // Get all absensi with status 'hadir' that have jam_masuk and jam_pulang
        $absensiList = Absensi::hadir()
            ->whereNotNull('jam_masuk')
            ->whereNotNull('jam_pulang')
            ->with('employee')
            ->get();

        if ($absensiList->isEmpty()) {
            $this->command->warn('⚠️  No attendance records with check-in/check-out times found. Please run AbsensiSeeder first.');
            return;
        }

        $createdCount = 0;
        // Koordinat referensi kantor
        $latitudeReferensi = -8.5209686;
        $longitudeReferensi = 115.1378956;
        $radiusMin = 20; // Radius minimum 20 meter
        $radiusMax = 50; // Radius maksimum 50 meter

        foreach ($absensiList as $absensi) {
            $this->command->line("   → Seeding log_absensi for attendance ID: {$absensi->id} ({$absensi->tanggal})");

            // Check if log already exists for this absensi
            $existingLogs = LogAbsensi::where('absensi_id', $absensi->id)->count();
            if ($existingLogs > 0) {
                $this->command->line("      ⏭️  Logs already exist, skipping...");
                continue;
            }

            // Parse jam_masuk and jam_pulang
            $tanggal = Carbon::parse($absensi->tanggal);
            $tanggalString = $tanggal->format('Y-m-d');
            $jamMasuk = Carbon::createFromFormat('Y-m-d H:i:s', $tanggalString . ' ' . $absensi->jam_masuk);
            $jamPulang = Carbon::createFromFormat('Y-m-d H:i:s', $tanggalString . ' ' . $absensi->jam_pulang);

            // Generate random offset untuk GPS (dalam radius 20-50 meter dari koordinat referensi)
            // 1 derajat latitude ≈ 111 km, jadi untuk 20-50 meter: 0.00018 - 0.00045 derajat
            $radiusInDegrees = (rand(20, 50) / 111000); // Random radius antara 20-50 meter dalam derajat
            $randomAngle = deg2rad(rand(0, 360)); // Random angle
            $latitudeOffset = $radiusInDegrees * cos($randomAngle);
            $longitudeOffset = $radiusInDegrees * sin($randomAngle);

            // Generate foto selfie path
            $year = $tanggal->format('Y');
            $month = $tanggal->format('m');
            $filenameCheckIn = 'checkin_' . $absensi->id . '_' . time() . '.jpg';
            $filenameCheckOut = 'checkout_' . $absensi->id . '_' . time() . '.jpg';

            // Determine sumber based on absensi's sumber_absen
            $sumber = match($absensi->sumber_absen) {
                'mobile' => 'mobile',
                'web' => 'web',
                default => fake()->randomElement(['mobile', 'web']),
            };

            // Create check-in log
            $checkInLog = LogAbsensi::create([
                'absensi_id' => $absensi->id,
                'jenis' => 'check_in',
                'waktu' => $jamMasuk,
                'latitude' => $latitudeReferensi + $latitudeOffset,
                'longitude' => $longitudeReferensi + $longitudeOffset,
                'akurasi' => fake()->numberBetween(5, 50),
                'foto_selfie' => "selfies/{$year}/{$month}/{$filenameCheckIn}",
                'sumber' => $sumber,
                'latitude_referensi' => $latitudeReferensi,
                'longitude_referensi' => $longitudeReferensi,
                'radius_min' => $radiusMin,
                'radius_max' => $radiusMax,
                // validasi_gps akan dihitung otomatis di service
            ]);
            $createdCount++;

            // Generate slight variation untuk check-out (masih dalam radius yang sama)
            $radiusInDegreesCheckOut = (rand(20, 50) / 111000);
            $randomAngleCheckOut = deg2rad(rand(0, 360));
            $latitudeOffsetCheckOut = $radiusInDegreesCheckOut * cos($randomAngleCheckOut);
            $longitudeOffsetCheckOut = $radiusInDegreesCheckOut * sin($randomAngleCheckOut);

            // Create check-out log
            $checkOutLog = LogAbsensi::create([
                'absensi_id' => $absensi->id,
                'jenis' => 'check_out',
                'waktu' => $jamPulang,
                'latitude' => $latitudeReferensi + $latitudeOffsetCheckOut,
                'longitude' => $longitudeReferensi + $longitudeOffsetCheckOut,
                'akurasi' => fake()->numberBetween(5, 50),
                'foto_selfie' => "selfies/{$year}/{$month}/{$filenameCheckOut}",
                'sumber' => $sumber,
                'latitude_referensi' => $latitudeReferensi,
                'longitude_referensi' => $longitudeReferensi,
                'radius_min' => $radiusMin,
                'radius_max' => $radiusMax,
                // validasi_gps akan dihitung otomatis di service
            ]);
            $createdCount++;

            $this->command->line(
                "      ✅ Created check-in log at {$jamMasuk->format('H:i:s')} and check-out log at {$jamPulang->format('H:i:s')}"
            );
        }

        $this->command->info("✅ Seeded {$createdCount} log_absensi records successfully!");
        $this->command->info("📊 Total log_absensi in database: " . LogAbsensi::count());
    }
}

