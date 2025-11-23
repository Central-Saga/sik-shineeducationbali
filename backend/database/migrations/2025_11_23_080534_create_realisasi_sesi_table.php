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
        Schema::create('realisasi_sesi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('karyawan_id')->constrained('karyawan')->onDelete('cascade');
            $table->date('tanggal');
            $table->foreignId('sesi_kerja_id')->constrained('sesi_kerja')->onDelete('cascade');
            $table->enum('status', ['diajukan', 'disetujui', 'ditolak'])->default('diajukan');
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('sumber', ['jadwal', 'manual']);
            $table->text('catatan')->nullable();
            $table->timestamps();

            // Unique constraint: satu karyawan hanya bisa satu realisasi per sesi per hari
            $table->unique(['karyawan_id', 'tanggal', 'sesi_kerja_id']);
            
            // Indexes untuk performa query
            $table->index('karyawan_id');
            $table->index('sesi_kerja_id');
            $table->index('tanggal');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('realisasi_sesi');
    }
};
