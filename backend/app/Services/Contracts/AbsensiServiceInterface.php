<?php

namespace App\Services\Contracts;

use App\Models\Absensi;
use App\Services\Base\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;

interface AbsensiServiceInterface extends BaseServiceInterface
{
    /**
     * Find attendance records by employee ID.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection;

    /**
     * Find attendance record by employee ID and date.
     *
     * @param  int|string  $karyawanId
     * @param  string  $tanggal
     * @return \App\Models\Absensi|null
     */
    public function findByKaryawanIdAndTanggal($karyawanId, string $tanggal): ?Absensi;

    /**
     * Find attendance records by date.
     *
     * @param  string  $tanggal
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTanggal(string $tanggal): Collection;

    /**
     * Find attendance records by date range.
     *
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByDateRange(string $startDate, string $endDate): Collection;

    /**
     * Find attendance records by employee ID and date range.
     *
     * @param  int|string  $karyawanId
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndDateRange($karyawanId, string $startDate, string $endDate): Collection;

    /**
     * Find attendance records by status.
     *
     * @param  string  $statusKehadiran
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatusKehadiran(string $statusKehadiran): Collection;

    /**
     * Find present attendance records (hadir).
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findHadir(): Collection;

    /**
     * Find attendance records by employee ID and status.
     *
     * @param  int|string  $karyawanId
     * @param  string  $statusKehadiran
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndStatus($karyawanId, string $statusKehadiran): Collection;
}


