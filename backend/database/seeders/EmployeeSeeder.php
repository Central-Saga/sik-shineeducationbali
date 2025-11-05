<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Seeding employees...');

        // Get existing users
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠️  No users found. Please run UserSeeder first.');
            return;
        }

        $employees = [
            [
                'user_id' => $users->where('email', 'sri@shineeducationbali.com')->first()?->id,
                'kategori_karyawan' => 'tetap',
                'subtipe_kontrak' => null,
                'tipe_gaji' => 'bulanan',
                'gaji_pokok' => 15000000,
                'bank_nama' => 'Bank Central Asia',
                'bank_no_rekening' => '1234567890',
                'nomor_hp' => '081234567890',
                'alamat' => 'Jl. Contoh No. 123, Denpasar, Bali',
                'tanggal_lahir' => '1985-05-15',
                'status' => 'aktif',
            ],
            [
                'user_id' => $users->where('email', 'admin@shineeducationbali.com')->first()?->id,
                'kategori_karyawan' => 'tetap',
                'subtipe_kontrak' => null,
                'tipe_gaji' => 'bulanan',
                'gaji_pokok' => 12000000,
                'bank_nama' => 'Bank Mandiri',
                'bank_no_rekening' => '0987654321',
                'nomor_hp' => '081987654321',
                'alamat' => 'Jl. Contoh No. 456, Denpasar, Bali',
                'tanggal_lahir' => '1990-08-20',
                'status' => 'aktif',
            ],
            [
                'user_id' => $users->where('email', 'john.doe@shineeducationbali.com')->first()?->id,
                'kategori_karyawan' => 'kontrak',
                'subtipe_kontrak' => 'full_time',
                'tipe_gaji' => 'bulanan',
                'gaji_pokok' => 8000000,
                'bank_nama' => 'Bank Negara Indonesia',
                'bank_no_rekening' => '1122334455',
                'nomor_hp' => '081122334455',
                'alamat' => 'Jl. Contoh No. 789, Denpasar, Bali',
                'tanggal_lahir' => '1995-03-10',
                'status' => 'aktif',
            ],
            [
                'user_id' => $users->where('email', 'jane.smith@shineeducationbali.com')->first()?->id,
                'kategori_karyawan' => 'freelance',
                'subtipe_kontrak' => null,
                'tipe_gaji' => 'per_sesi',
                'gaji_pokok' => null,
                'bank_nama' => 'Bank Rakyat Indonesia',
                'bank_no_rekening' => '5566778899',
                'nomor_hp' => '085556677889',
                'alamat' => 'Jl. Contoh No. 321, Denpasar, Bali',
                'tanggal_lahir' => '1992-11-25',
                'status' => 'aktif',
            ],
        ];

        $createdCount = 0;
        $updatedCount = 0;
        $codeGeneratedCount = 0;

        foreach ($employees as $employeeData) {
            if (!$employeeData['user_id']) {
                continue;
            }

            $employee = Employee::updateOrCreate(
                ['user_id' => $employeeData['user_id']],
                $employeeData
            );

            // Generate kode_karyawan jika belum ada
            if (empty($employee->kode_karyawan)) {
                $employee->kode_karyawan = $this->generateKodeKaryawan();
                $employee->save();
                $codeGeneratedCount++;
            }

            $user = $employee->user;
            $kodeInfo = $employee->kode_karyawan ? " ({$employee->kode_karyawan})" : "";
            $this->command->line(
                "   → {$user->name} ({$user->email})$kodeInfo - " .
                "{$employee->kategori_karyawan} - " .
                "{$employee->tipe_gaji} - " .
                "Status: {$employee->status}"
            );

            if ($employee->wasRecentlyCreated) {
                $createdCount++;
            } else {
                $updatedCount++;
            }
        }

        $this->command->info("✅ Seeded {$createdCount} new employees and updated {$updatedCount} existing employees successfully!");
        if ($codeGeneratedCount > 0) {
            $this->command->info("🔑 Generated {$codeGeneratedCount} employee codes.");
        }
        $this->command->info("📊 Total employees in database: " . Employee::count());
    }

    /**
     * Generate unique employee code (SEB + 4 random digits).
     *
     * @return string
     */
    protected function generateKodeKaryawan(): string
    {
        $maxAttempts = 100;
        $attempts = 0;

        do {
            // Generate 4 random digits (1000-9999)
            $randomDigits = str_pad((string) rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            $kodeKaryawan = 'SEB' . $randomDigits;

            // Check if code already exists
            $exists = DB::table('karyawan')
                ->where('kode_karyawan', $kodeKaryawan)
                ->exists();

            $attempts++;

            if (!$exists) {
                return $kodeKaryawan;
            }

        } while ($attempts < $maxAttempts);

        // Fallback to timestamp-based code if all attempts failed
        return 'SEB' . substr(time(), -4) . rand(0, 9);
    }
}

