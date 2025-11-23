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
        // Step 1: Add new enum values first (temporary: keep old values)
        DB::statement("ALTER TABLE realisasi_sesi MODIFY COLUMN sumber ENUM('jadwal', 'manual', 'wajib', 'lembur') NOT NULL");
        
        // Step 2: Update existing data: 'jadwal' -> 'wajib', 'manual' -> 'lembur'
        DB::table('realisasi_sesi')
            ->where('sumber', 'jadwal')
            ->update(['sumber' => 'wajib']);

        DB::table('realisasi_sesi')
            ->where('sumber', 'manual')
            ->update(['sumber' => 'lembur']);

        // Step 3: Remove old enum values, keep only 'wajib' and 'lembur'
        DB::statement("ALTER TABLE realisasi_sesi MODIFY COLUMN sumber ENUM('wajib', 'lembur') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert enum column to use 'jadwal' and 'manual'
        DB::statement("ALTER TABLE realisasi_sesi MODIFY COLUMN sumber ENUM('jadwal', 'manual') NOT NULL");

        // Revert data: 'wajib' -> 'jadwal', 'lembur' -> 'manual'
        DB::table('realisasi_sesi')
            ->where('sumber', 'wajib')
            ->update(['sumber' => 'jadwal']);

        DB::table('realisasi_sesi')
            ->where('sumber', 'lembur')
            ->update(['sumber' => 'manual']);
    }
};
