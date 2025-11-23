<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('🔄 Creating permissions...');

        // Define permissions
        $permissions = [
            // User Management
            'mengelola users',

            // Role Management
            'mengelola roles',

            // Permission Management
            'mengelola permissions',

            // Karyawan Management
            'mengelola karyawan',

            // Absensi Management
            'mengelola absensi',
            'melakukan absensi',

            // Rekap Bulanan Management
            'mengelola rekap bulanan',

            // Gaji Management
            'mengelola gaji',
            'melihat gaji',
            'mengelola pembayaran gaji',

            // Cuti Management
            'mengelola cuti',
            'melakukan cuti',

            // Sesi Kerja Management
            'mengelola sesi kerja',

            // Realisasi Sesi Management
            'mengelola realisasi sesi',
            'mengajukan realisasi sesi',

            // Reports
            'mencetak laporan',
        ];

        // Create permissions
        $createdPermissions = [];
        foreach ($permissions as $permission) {
            $createdPermissions[$permission] = Permission::firstOrCreate(['name' => $permission]);
        }

        $this->command->info('✅ Created ' . count($createdPermissions) . ' permissions');

        $this->command->info('🔄 Creating roles...');

        // Create Owner Role
        $owner = Role::firstOrCreate(['name' => 'Owner', 'guard_name' => 'web']);
        $ownerPermissions = [
            'mengelola users',
            'mengelola rekap bulanan',
            'mengelola gaji',
            'mengelola pembayaran gaji',
            'mengelola cuti',
            'mengelola absensi',
            'mengelola sesi kerja',
            'mengelola realisasi sesi',
            'mencetak laporan',
        ];
        $owner->givePermissionTo($ownerPermissions);
        $this->command->info('✅ Created Owner role with ' . count($ownerPermissions) . ' permissions');

        // Create Admin Role
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $adminPermissions = [
            'mengelola users',
            'mengelola roles',
            'mengelola permissions',
            'mengelola karyawan',
            'mengelola absensi',
            'mengelola rekap bulanan',
            'mengelola gaji',
            'mengelola pembayaran gaji',
            'mengelola cuti',
            'mengelola sesi kerja',
            'mengelola realisasi sesi',
            'mencetak laporan',
        ];
        $admin->givePermissionTo($adminPermissions);
        $this->command->info('✅ Created Admin role with ' . count($adminPermissions) . ' permissions');

        // Create Karyawan Role
        $karyawan = Role::firstOrCreate(['name' => 'Karyawan', 'guard_name' => 'web']);
        $karyawanPermissions = [
            'melakukan absensi',
            'melihat gaji',
            'melakukan cuti',
            'mengajukan realisasi sesi',
        ];
        $karyawan->givePermissionTo($karyawanPermissions);
        $this->command->info('✅ Created Karyawan role with ' . count($karyawanPermissions) . ' permissions');

        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('✅ Role and Permission seeding completed!');
        $this->command->info('📊 Total Roles: ' . Role::count());
        $this->command->info('📊 Total Permissions: ' . Permission::count());
    }
}
