<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Seeding users...');

        // Define users with their roles
        $users = [
            [
                'name' => 'Sri',
                'email' => 'sri@shineeducationbali.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'roles' => ['Owner'], // Assign Owner role
            ],
            [
                'name' => 'Shine Admin',
                'email' => 'admin@shineeducationbali.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'roles' => ['Admin'], // Assign Admin role
            ],
            [
                'name' => 'John Doe',
                'email' => 'john.doe@shineeducationbali.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'roles' => ['Karyawan'], // Assign Karyawan role
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane.smith@shineeducationbali.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'roles' => ['Karyawan'], // Assign Karyawan role
            ],
        ];

        $createdCount = 0;
        $updatedCount = 0;
        $employeeCreatedCount = 0;

        foreach ($users as $userData) {
            // Extract roles before creating user
            $roles = $userData['roles'] ?? [];
            unset($userData['roles']);

            // Create or update user
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // Assign roles to user
            if (!empty($roles)) {
                $user->syncRoles($roles);
                $rolesList = implode(', ', $roles);
                $this->command->line("   → {$user->name} ({$user->email}) - Roles: {$rolesList}");

                // Auto-create employee data if role is Karyawan
                if (in_array('Karyawan', $roles)) {
                    $employee = Employee::firstOrNew(['user_id' => $user->id]);

                    // Set default values if employee is new
                    if (!$employee->exists) {
                        $employee->kategori_karyawan = 'kontrak';
                        $employee->subtipe_kontrak = 'full_time';
                        $employee->tipe_gaji = 'bulanan';
                        $employee->gaji_pokok = 5000000;
                        $employee->status = 'aktif';

                        // Generate kode_karyawan
                        $employee->kode_karyawan = $this->generateKodeKaryawan();

                        $employee->save();
                        $employeeCreatedCount++;
                        $this->command->line("      └─ Created employee data with code: {$employee->kode_karyawan}");
                    } else {
                        // Generate kode_karyawan if not exists
                        if (empty($employee->kode_karyawan)) {
                            $employee->kode_karyawan = $this->generateKodeKaryawan();
                            $employee->save();
                            $this->command->line("      └─ Generated employee code: {$employee->kode_karyawan}");
                        }
                    }
                }
            }

            if ($user->wasRecentlyCreated) {
                $createdCount++;
            } else {
                $updatedCount++;
            }
        }

        $this->command->info("✅ Seeded {$createdCount} new users and updated {$updatedCount} existing users successfully!");
        if ($employeeCreatedCount > 0) {
            $this->command->info("👤 Auto-created {$employeeCreatedCount} employee records for Karyawan role users.");
        }
        $this->command->info("📊 Total users in database: " . User::count());
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
