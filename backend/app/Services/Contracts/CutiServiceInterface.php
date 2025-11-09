<?php

namespace App\Services\Contracts;

use App\Models\Cuti;
use App\Services\Base\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;

interface CutiServiceInterface extends BaseServiceInterface
{
    /**
     * Find leave requests by employee ID.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection;

    /**
     * Find leave request by employee ID and date.
     *
     * @param  int|string  $karyawanId
     * @param  string  $tanggal
     * @return \App\Models\Cuti|null
     */
    public function findByKaryawanIdAndTanggal($karyawanId, string $tanggal): ?Cuti;

    /**
     * Find leave requests by date.
     *
     * @param  string  $tanggal
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTanggal(string $tanggal): Collection;

    /**
     * Find leave requests by date range.
     *
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByDateRange(string $startDate, string $endDate): Collection;

    /**
     * Find leave requests by employee ID and date range.
     *
     * @param  int|string  $karyawanId
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndDateRange($karyawanId, string $startDate, string $endDate): Collection;

    /**
     * Find leave requests by jenis.
     *
     * @param  string  $jenis
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByJenis(string $jenis): Collection;

    /**
     * Find leave requests by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection;

    /**
     * Find leave requests by employee ID and jenis.
     *
     * @param  int|string  $karyawanId
     * @param  string  $jenis
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndJenis($karyawanId, string $jenis): Collection;

    /**
     * Find leave requests by employee ID and status.
     *
     * @param  int|string  $karyawanId
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndStatus($karyawanId, string $status): Collection;
}

