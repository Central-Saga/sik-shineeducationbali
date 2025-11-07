<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Seed urutan:
     * 1. Roles & Permissions (harus pertama karena users butuh roles)
     * 2. Users (dengan assign roles)
     */
    public function run(): void
    {
        // Reset cached roles and permissions sebelum seeding
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('🚀 Starting database seeding...');
        $this->command->newLine();

        // Seed Roles and Permissions terlebih dahulu
        $this->call([
            RolePermissionSeeder::class,
        ]);

        $this->command->newLine();

        // Seed Users dengan roles
        $this->call([
            UserSeeder::class,
        ]);

        $this->command->newLine();

        // Seed Employees
        $this->call([
            EmployeeSeeder::class,
        ]);

        $this->command->newLine();

        // Seed Absensi
        $this->call([
            AbsensiSeeder::class,
        ]);

        $this->command->newLine();

        // Seed Log Absensi
        $this->call([
            LogAbsensiSeeder::class,
        ]);

        // Reset cached roles and permissions setelah seeding
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->newLine();
        $this->command->info('✅ Database seeding completed successfully!');
    }
}
