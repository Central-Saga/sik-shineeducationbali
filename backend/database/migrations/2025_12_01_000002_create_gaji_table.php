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
        Schema::create('gaji', function (Blueprint $table) {
            $table->id();
            $table->foreignId('karyawan_id')->constrained('karyawan')->onDelete('cascade');
            $table->char('periode', 7)->comment('Format: YYYY-MM');
            $table->smallInteger('hari_cuti')->default(0);
            $table->decimal('potongan_cuti', 12, 2)->default(0);
            $table->decimal('total_gaji', 12, 2)->default(0);
            $table->enum('status', ['draft', 'disetujui', 'dibayar'])->default('draft');
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes untuk performa query
            $table->index('karyawan_id');
            $table->index('periode');
            $table->index('status');
            $table->index(['karyawan_id', 'periode']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gaji');
    }
};

