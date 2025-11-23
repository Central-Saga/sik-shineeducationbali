<?php

namespace App\Services\Contracts;

use App\Models\RealisasiSesi;
use App\Services\Base\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;

interface RealisasiSesiServiceInterface extends BaseServiceInterface
{
    /**
     * Find realisasi sesi records by karyawan_id.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection;

    /**
     * Find realisasi sesi records by sesi_kerja_id.
     *
     * @param  int|string  $sesiKerjaId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findBySesiKerjaId($sesiKerjaId): Collection;

    /**
     * Find realisasi sesi records by tanggal.
     *
     * @param  string  $tanggal
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTanggal(string $tanggal): Collection;

    /**
     * Find realisasi sesi records by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection;

    /**
     * Find realisasi sesi records by sumber.
     *
     * @param  string  $sumber
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findBySumber(string $sumber): Collection;

    /**
     * Find realisasi sesi record by karyawan_id and tanggal.
     *
     * @param  int|string  $karyawanId
     * @param  string  $tanggal
     * @return \App\Models\RealisasiSesi|null
     */
    public function findByKaryawanIdAndTanggal($karyawanId, string $tanggal): ?RealisasiSesi;

    /**
     * Find realisasi sesi records by karyawan_id and date range.
     *
     * @param  int|string  $karyawanId
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndDateRange($karyawanId, string $startDate, string $endDate): Collection;

    /**
     * Approve a realisasi sesi record.
     *
     * @param  int|string  $id
     * @param  string|null  $catatan
     * @return \App\Models\RealisasiSesi
     */
    public function approve($id, ?string $catatan = null): RealisasiSesi;

    /**
     * Reject a realisasi sesi record.
     *
     * @param  int|string  $id
     * @param  string  $catatan
     * @return \App\Models\RealisasiSesi
     */
    public function reject($id, string $catatan): RealisasiSesi;
}

