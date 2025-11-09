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
        Schema::create('sesi_kerja', function (Blueprint $table) {
            $table->id();
            $table->enum('kategori', ['coding', 'non_coding']);
            $table->enum('hari', ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']);
            $table->smallInteger('nomor_sesi');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->decimal('tarif', 12, 2);
            $table->enum('status', ['aktif', 'non aktif'])->default('aktif');
            $table->timestamps();

            // Unique constraint: nomor_sesi harus unik per hari dan kategori
            $table->unique(['kategori', 'hari', 'nomor_sesi']);
            
            // Index untuk performa query
            $table->index(['kategori', 'hari']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sesi_kerja');
    }
};

