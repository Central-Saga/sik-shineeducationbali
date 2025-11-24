<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rekap_bulanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('karyawan_id')->constrained('karyawan')->onDelete('cascade');
            $table->char('periode', 7)->comment('Format: YYYY-MM');
            $table->smallInteger('jumlah_hadir')->default(0);
            $table->smallInteger('jumlah_izin')->default(0);
            $table->smallInteger('jumlah_sakit')->default(0);
            $table->smallInteger('jumlah_cuti')->default(0);
            $table->smallInteger('jumlah_alfa')->default(0);
            $table->smallInteger('jumlah_sesi_coding')->default(0);
            $table->smallInteger('jumlah_sesi_non_coding')->default(0);
            $table->decimal('nilai_sesi_coding', 12, 2)->default(0);
            $table->decimal('nilai_sesi_non_coding', 12, 2)->default(0);
            $table->decimal('total_pendapatan_sesi', 12, 2)->default(0);
            $table->timestamps();

            // Unique constraint: satu rekap per karyawan per periode
            $table->unique(['karyawan_id', 'periode']);
            
            // Indexes untuk performa query
            $table->index('karyawan_id');
            $table->index('periode');
            $table->index(['karyawan_id', 'periode']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekap_bulanan');
    }
};

