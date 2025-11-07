<?php

namespace App\Repositories\LogAbsensi;

use App\Models\LogAbsensi;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\LogAbsensiRepositoryInterface;

class LogAbsensiRepository extends BaseRepository implements LogAbsensiRepositoryInterface
{
    /**
     * Create a new log absensi repository instance.
     *
     * @param  \App\Models\LogAbsensi  $model
     */
    public function __construct(LogAbsensi $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk log absensi repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'log_absensi';
    }

    /**
     * Get cache TTL untuk log absensi data (1 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 3600; // 1 jam
    }

    /**
     * Find log attendance records by absensi ID.
     *
     * @param  int|string  $absensiId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByAbsensiId($absensiId): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByAbsensiId:{$absensiId}";

        return $this->remember($cacheKey, function () use ($absensiId) {
            return $this->model->where('absensi_id', $absensiId)->get();
        });
    }

    /**
     * Find log attendance records by absensi ID and type.
     *
     * @param  int|string  $absensiId
     * @param  string  $jenis
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByAbsensiIdAndJenis($absensiId, string $jenis): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByAbsensiIdAndJenis:{$absensiId}:{$jenis}";

        return $this->remember($cacheKey, function () use ($absensiId, $jenis) {
            return $this->model
                ->where('absensi_id', $absensiId)
                ->where('jenis', $jenis)
                ->get();
        });
    }

    /**
     * Find check-in log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findCheckIn(): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = 'findCheckIn';

        return $this->remember($cacheKey, function () {
            return $this->model->checkIn()->get();
        });
    }

    /**
     * Find check-out log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findCheckOut(): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = 'findCheckOut';

        return $this->remember($cacheKey, function () {
            return $this->model->checkOut()->get();
        });
    }

    /**
     * Find log attendance records by date range.
     *
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByDateRange(string $startDate, string $endDate): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByDateRange:{$startDate}:{$endDate}";

        return $this->remember($cacheKey, function () use ($startDate, $endDate) {
            return $this->model->dateRange($startDate, $endDate)->get();
        });
    }

    /**
     * Find log attendance records by absensi ID and date range.
     *
     * @param  int|string  $absensiId
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByAbsensiIdAndDateRange($absensiId, string $startDate, string $endDate): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByAbsensiIdAndDateRange:{$absensiId}:{$startDate}:{$endDate}";

        return $this->remember($cacheKey, function () use ($absensiId, $startDate, $endDate) {
            return $this->model
                ->where('absensi_id', $absensiId)
                ->dateRange($startDate, $endDate)
                ->get();
        });
    }

    /**
     * Find validated GPS log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findValidated(): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = 'findValidated';

        return $this->remember($cacheKey, function () {
            return $this->model->validated()->get();
        });
    }

    /**
     * Find unvalidated GPS log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findUnvalidated(): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = 'findUnvalidated';

        return $this->remember($cacheKey, function () {
            return $this->model->unvalidated()->get();
        });
    }

    /**
     * Find log attendance records by source.
     *
     * @param  string  $sumber
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findBySumber(string $sumber): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findBySumber:{$sumber}";

        return $this->remember($cacheKey, function () use ($sumber) {
            return $this->model->sumber($sumber)->get();
        });
    }

    /**
     * Find check-in log for specific absensi.
     *
     * @param  int|string  $absensiId
     * @return \App\Models\LogAbsensi|null
     */
    public function findCheckInByAbsensiId($absensiId): ?LogAbsensi
    {
        $cacheKey = "findCheckInByAbsensiId:{$absensiId}";

        return $this->remember($cacheKey, function () use ($absensiId) {
            return $this->model
                ->where('absensi_id', $absensiId)
                ->checkIn()
                ->first();
        });
    }

    /**
     * Find check-out log for specific absensi.
     *
     * @param  int|string  $absensiId
     * @return \App\Models\LogAbsensi|null
     */
    public function findCheckOutByAbsensiId($absensiId): ?LogAbsensi
    {
        $cacheKey = "findCheckOutByAbsensiId:{$absensiId}";

        return $this->remember($cacheKey, function () use ($absensiId) {
            return $this->model
                ->where('absensi_id', $absensiId)
                ->checkOut()
                ->first();
        });
    }
}



