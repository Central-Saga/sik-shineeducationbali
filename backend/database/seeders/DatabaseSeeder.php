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
        // UserSeeder akan otomatis membuat employee untuk user dengan role Karyawan
        $this->call([
            UserSeeder::class,
        ]);

        // Reset cached roles and permissions setelah seeding
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->newLine();
        $this->command->info('✅ Database seeding completed successfully!');
        $this->command->info('📝 Seeded: Roles, Permissions, Users, and Employees (only for Karyawan users)');
        
        // Note: Seeder hanya sampai User dan Role saja
        // Employee hanya dibuat untuk user dengan role Karyawan yang ada di UserSeeder
        // CutiSeeder, SesiKerjaSeeder, RealisasiSesiSeeder, AbsensiSeeder, dan LogAbsensiSeeder tidak dijalankan
    }
}
