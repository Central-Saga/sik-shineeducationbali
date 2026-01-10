<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing data: change 'cuti' to 'izin'
        DB::table('cuti')
            ->where('jenis', 'cuti')
            ->update(['jenis' => 'izin']);

        // Modify enum column to remove 'cuti' option
        // MySQL doesn't support direct enum modification, so we need to use raw SQL
        DB::statement("ALTER TABLE cuti MODIFY COLUMN jenis ENUM('izin', 'sakit') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert enum column to include 'cuti' option
        DB::statement("ALTER TABLE cuti MODIFY COLUMN jenis ENUM('cuti', 'izin', 'sakit') NOT NULL");
        
        // Note: We don't revert the data changes as we can't determine which 'izin' records were originally 'cuti'
    }
};
