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
        Schema::create('log_absensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('absensi_id')->constrained('absensi')->onDelete('cascade');
            $table->enum('jenis', ['check_in', 'check_out']);
            $table->dateTime('waktu');
            $table->decimal('latitude', 9, 6);
            $table->decimal('longitude', 9, 6);
            $table->smallInteger('akurasi')->comment('GPS accuracy radius in meters');
            $table->string('foto_selfie', 255)->nullable();
            $table->enum('sumber', ['mobile', 'web']);
            $table->boolean('validasi_gps')->default(false);
            $table->decimal('latitude_referensi', 9, 6)->nullable()->comment('Koordinat referensi kantor');
            $table->decimal('longitude_referensi', 9, 6)->nullable()->comment('Koordinat referensi kantor');
            $table->smallInteger('radius_min')->nullable()->comment('Radius minimum validasi GPS dalam meter');
            $table->smallInteger('radius_max')->nullable()->comment('Radius maksimum validasi GPS dalam meter');
            $table->timestamps();
            $table->softDeletes();

            // Index untuk performa query
            $table->index(['absensi_id', 'jenis']);
            $table->index('waktu');
            $table->index('validasi_gps');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_absensi');
    }
};

