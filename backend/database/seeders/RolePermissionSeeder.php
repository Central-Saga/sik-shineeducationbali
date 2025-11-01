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
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Role Management
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',

            // Permission Management
            'permissions.view',
            'permissions.create',
            'permissions.edit',
            'permissions.delete',

            // Student Management (untuk pendidikan)
            'students.view',
            'students.create',
            'students.edit',
            'students.delete',

            // Course Management (untuk pendidikan)
            'courses.view',
            'courses.create',
            'courses.edit',
            'courses.delete',

            // Dashboard
            'dashboard.view',

            // Reports
            'reports.view',
            'reports.export',

            // Settings
            'settings.view',
            'settings.edit',
        ];

        // Create permissions
        $createdPermissions = [];
        foreach ($permissions as $permission) {
            $createdPermissions[$permission] = Permission::firstOrCreate(['name' => $permission]);
        }

        $this->command->info('✅ Created ' . count($createdPermissions) . ' permissions');

        $this->command->info('🔄 Creating roles...');

        // Create Super Admin Role
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        $superAdmin->givePermissionTo(Permission::all());
        $this->command->info('✅ Created Super Admin role with all permissions');

        // Create Admin Role
        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $adminPermissions = [
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'students.view',
            'students.create',
            'students.edit',
            'students.delete',
            'courses.view',
            'courses.create',
            'courses.edit',
            'courses.delete',
            'dashboard.view',
            'reports.view',
            'reports.export',
            'settings.view',
        ];
        $admin->givePermissionTo($adminPermissions);
        $this->command->info('✅ Created Admin role with ' . count($adminPermissions) . ' permissions');

        // Create Teacher Role
        $teacher = Role::firstOrCreate(['name' => 'Teacher']);
        $teacherPermissions = [
            'students.view',
            'students.create',
            'students.edit',
            'courses.view',
            'courses.edit',
            'dashboard.view',
            'reports.view',
        ];
        $teacher->givePermissionTo($teacherPermissions);
        $this->command->info('✅ Created Teacher role with ' . count($teacherPermissions) . ' permissions');

        // Create Staff Role
        $staff = Role::firstOrCreate(['name' => 'Staff']);
        $staffPermissions = [
            'students.view',
            'courses.view',
            'dashboard.view',
        ];
        $staff->givePermissionTo($staffPermissions);
        $this->command->info('✅ Created Staff role with ' . count($staffPermissions) . ' permissions');

        // Create Student Role (untuk siswa)
        $student = Role::firstOrCreate(['name' => 'Student']);
        $studentPermissions = [
            'dashboard.view',
        ];
        $student->givePermissionTo($studentPermissions);
        $this->command->info('✅ Created Student role with ' . count($studentPermissions) . ' permissions');

        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('✅ Role and Permission seeding completed!');
        $this->command->info('📊 Total Roles: ' . Role::count());
        $this->command->info('📊 Total Permissions: ' . Permission::count());
    }
}
