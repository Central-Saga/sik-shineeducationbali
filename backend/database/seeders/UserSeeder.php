<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
            }

            if ($user->wasRecentlyCreated) {
                $createdCount++;
            } else {
                $updatedCount++;
            }
        }

        $this->command->info("✅ Seeded {$createdCount} new users and updated {$updatedCount} existing users successfully!");
        $this->command->info("📊 Total users in database: " . User::count());
    }
}

