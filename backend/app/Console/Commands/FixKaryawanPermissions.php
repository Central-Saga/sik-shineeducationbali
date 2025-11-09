<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use App\Models\User;

class FixKaryawanPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:fix-karyawan';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix permissions for Karyawan role and ensure all karyawan users have correct permissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Fixing Karyawan permissions...');

        // Clear permission cache first
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $this->info('✅ Permission cache cleared');

        // Ensure permission exists
        $permission = Permission::firstOrCreate(['name' => 'melakukan absensi']);
        $this->info('✅ Permission "melakukan absensi" ensured');

        // Ensure role exists and has permission
        $karyawanRole = Role::firstOrCreate(['name' => 'Karyawan']);
        
        if (!$karyawanRole->hasPermissionTo('melakukan absensi')) {
            $karyawanRole->givePermissionTo('melakukan absensi');
            $this->info('✅ Permission "melakukan absensi" assigned to Karyawan role');
        } else {
            $this->info('ℹ️  Permission "melakukan absensi" already assigned to Karyawan role');
        }

        // Ensure all users with Karyawan role have the permission
        $karyawanUsers = User::role('Karyawan')->get();
        $fixedCount = 0;

        foreach ($karyawanUsers as $user) {
            // Refresh user to ensure fresh permission check
            $user->refresh();
            
            // Check if user has permission (directly or via role)
            if (!$user->hasPermissionTo('melakukan absensi')) {
                // This shouldn't happen if role has permission, but just in case
                $user->givePermissionTo('melakukan absensi');
                $fixedCount++;
                $this->line("   → Fixed permissions for user: {$user->name} ({$user->email})");
            }
        }

        if ($fixedCount > 0) {
            $this->info("✅ Fixed permissions for {$fixedCount} user(s)");
        } else {
            $this->info('ℹ️  All karyawan users already have correct permissions');
        }

        // Clear permission cache again
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $this->info('✅ Permission cache cleared again');

        $this->info('✅ Karyawan permissions fixed successfully!');
        $this->info("📊 Total Karyawan users: {$karyawanUsers->count()}");

        return 0;
    }
}
