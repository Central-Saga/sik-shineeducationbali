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
        Schema::create('pembayaran_gaji', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gaji_id')->constrained('gaji')->onDelete('cascade');
            $table->date('tanggal_transfer');
            $table->string('bukti_transfer', 255)->nullable();
            $table->enum('status_pembayaran', ['menunggu', 'berhasil', 'gagal'])->default('menunggu');
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->text('catatan')->nullable();
            $table->timestamps();

            // Indexes untuk performa query
            $table->index('gaji_id');
            $table->index('status_pembayaran');
            $table->index('tanggal_transfer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran_gaji');
    }
};

