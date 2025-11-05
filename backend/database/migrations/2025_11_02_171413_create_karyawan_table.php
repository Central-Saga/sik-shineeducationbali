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
        Schema::create('karyawan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('kategori_karyawan', ['tetap', 'kontrak', 'freelance']);
            $table->enum('subtipe_kontrak', ['full_time', 'part_time'])->nullable();
            $table->enum('tipe_gaji', ['bulanan', 'per_sesi']);
            $table->decimal('gaji_pokok', 12, 2)->nullable();
            $table->string('bank_nama', 60)->nullable();
            $table->string('bank_no_rekening', 50)->nullable();
            $table->string('nomor_hp', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('karyawan');
    }
};

