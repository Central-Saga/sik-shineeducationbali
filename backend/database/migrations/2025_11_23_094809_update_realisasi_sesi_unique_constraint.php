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
        // Check and drop old unique constraint if exists
        $indexes = DB::select("SHOW INDEX FROM realisasi_sesi WHERE Key_name != 'PRIMARY' AND Non_unique = 0");
        foreach ($indexes as $index) {
            if (str_contains($index->Key_name, 'karyawan_id') && 
                str_contains($index->Key_name, 'tanggal') && 
                str_contains($index->Key_name, 'sesi_kerja_id')) {
                DB::statement("ALTER TABLE realisasi_sesi DROP INDEX {$index->Key_name}");
                break;
            }
        }
        
        Schema::table('realisasi_sesi', function (Blueprint $table) {
            // Add new unique constraint: 1 sesi kerja per tanggal hanya untuk 1 karyawan
            $table->unique(['tanggal', 'sesi_kerja_id'], 'realisasi_sesi_tanggal_sesi_kerja_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('realisasi_sesi', function (Blueprint $table) {
            // Drop new unique constraint
            $table->dropUnique('realisasi_sesi_tanggal_sesi_kerja_unique');
            
            // Restore old unique constraint
            $table->unique(['karyawan_id', 'tanggal', 'sesi_kerja_id']);
        });
    }
};
