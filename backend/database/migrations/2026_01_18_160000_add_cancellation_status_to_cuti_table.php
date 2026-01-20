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
        // Modify enum to add new status values
        DB::statement("ALTER TABLE cuti MODIFY COLUMN status ENUM('diajukan', 'disetujui', 'ditolak', 'dibatalkan', 'pembatalan_diajukan') DEFAULT 'diajukan'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original enum values
        DB::statement("ALTER TABLE cuti MODIFY COLUMN status ENUM('diajukan', 'disetujui', 'ditolak') DEFAULT 'diajukan'");
    }
};
