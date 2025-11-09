<?php

namespace App\Services\Contracts;

use App\Models\LogAbsensi;
use App\Services\Base\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;

interface LogAbsensiServiceInterface extends BaseServiceInterface
{
    /**
     * Find log attendance records by absensi ID.
     *
     * @param  int|string  $absensiId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByAbsensiId($absensiId): Collection;

    /**
     * Find log attendance records by absensi ID and type.
     *
     * @param  int|string  $absensiId
     * @param  string  $jenis
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByAbsensiIdAndJenis($absensiId, string $jenis): Collection;

    /**
     * Find check-in log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findCheckIn(): Collection;

    /**
     * Find check-out log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findCheckOut(): Collection;

    /**
     * Find log attendance records by date range.
     *
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByDateRange(string $startDate, string $endDate): Collection;

    /**
     * Find log attendance records by absensi ID and date range.
     *
     * @param  int|string  $absensiId
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByAbsensiIdAndDateRange($absensiId, string $startDate, string $endDate): Collection;

    /**
     * Find validated GPS log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findValidated(): Collection;

    /**
     * Find unvalidated GPS log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findUnvalidated(): Collection;

    /**
     * Find log attendance records by source.
     *
     * @param  string  $sumber
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findBySumber(string $sumber): Collection;

    /**
     * Find check-in log for specific absensi.
     *
     * @param  int|string  $absensiId
     * @return \App\Models\LogAbsensi|null
     */
    public function findCheckInByAbsensiId($absensiId): ?LogAbsensi;

    /**
     * Find check-out log for specific absensi.
     *
     * @param  int|string  $absensiId
     * @return \App\Models\LogAbsensi|null
     */
    public function findCheckOutByAbsensiId($absensiId): ?LogAbsensi;
}





