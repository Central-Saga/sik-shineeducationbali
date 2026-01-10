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
        Schema::create('komponen_gaji', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gaji_id')->constrained('gaji')->onDelete('cascade');
            $table->enum('jenis', ['gaji_pokok', 'pendapatan_sesi', 'lembur_sesi', 'potongan', 'bonus']);
            $table->string('nama_komponen', 100);
            $table->decimal('nominal', 12, 2);
            $table->timestamps();

            // Indexes untuk performa query
            $table->index('gaji_id');
            $table->index('jenis');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('komponen_gaji');
    }
};

