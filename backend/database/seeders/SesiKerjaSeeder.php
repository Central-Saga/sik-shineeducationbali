<?php

namespace Database\Seeders;

use App\Models\SesiKerja;
use Illuminate\Database\Seeder;

class SesiKerjaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Seeding sesi kerja...');

        $kategoris = ['coding', 'non_coding'];
        $haris = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
        $createdCount = 0;

        // Tarif sesuai kategori
        $tarifMap = [
            'coding' => 30000,
            'non_coding' => 25000,
        ];

        // Mata pelajaran sesuai kategori
        $mataPelajaranMap = [
            'coding' => ['Python', 'JavaScript', 'Web Development', 'Mobile Development', 'Data Science', 'Game Development'],
            'non_coding' => ['Matematika', 'Bahasa Inggris', 'IPA', 'IPS', 'Bahasa Indonesia', 'Seni & Budaya'],
        ];

        // Jam mulai dan selesai untuk setiap sesi (contoh jadwal)
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

        foreach ($kategoris as $kategori) {
            $this->command->line("   → Seeding sesi kerja untuk kategori: {$kategori}");

            foreach ($haris as $hari) {
                // Generate 4-6 sesi per hari untuk setiap kategori
                $jumlahSesi = fake()->numberBetween(4, 6);
                $nomorSesiTerpakai = [];

                for ($i = 0; $i < $jumlahSesi; $i++) {
                    // Pilih nomor sesi yang belum terpakai
                    $nomorSesi = fake()->numberBetween(1, 8);
                    while (in_array($nomorSesi, $nomorSesiTerpakai)) {
                        $nomorSesi = fake()->numberBetween(1, 8);
                    }
                    $nomorSesiTerpakai[] = $nomorSesi;

                    // Check if sesi kerja already exists
                    $existingSesi = SesiKerja::where('kategori', $kategori)
                        ->where('hari', $hari)
                        ->where('nomor_sesi', $nomorSesi)
                        ->first();

                    if ($existingSesi) {
                        continue;
                    }

                    $jamMulai = $sesiJadwal[$nomorSesi]['mulai'];
                    $jamSelesai = $sesiJadwal[$nomorSesi]['selesai'];
                    $mataPelajaran = fake()->randomElement($mataPelajaranMap[$kategori]);

                    SesiKerja::create([
                        'kategori' => $kategori,
                        'mata_pelajaran' => $mataPelajaran,
                        'hari' => $hari,
                        'nomor_sesi' => $nomorSesi,
                        'jam_mulai' => $jamMulai,
                        'jam_selesai' => $jamSelesai,
                        'tarif' => $tarifMap[$kategori],
                        'status' => fake()->randomElement(['aktif', 'non aktif']),
                    ]);

                    $createdCount++;
                }
            }
        }

        $this->command->info("✅ Seeded {$createdCount} sesi kerja records successfully!");
        $this->command->info("📊 Total sesi kerja in database: " . SesiKerja::count());
    }
}

