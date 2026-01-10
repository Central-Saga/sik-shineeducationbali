<?php

namespace App\Repositories\Absensi;

use App\Models\Absensi;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\AbsensiRepositoryInterface;

class AbsensiRepository extends BaseRepository implements AbsensiRepositoryInterface
{
    /**
     * Create a new absensi repository instance.
     *
     * @param  \App\Models\Absensi  $model
     */
    public function __construct(Absensi $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk absensi repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'absensi';
    }

    /**
     * Get cache TTL untuk absensi data (1 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 3600; // 1 jam
    }

    /**
     * Find attendance records by employee ID.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByKaryawanId:{$karyawanId}";

        return $this->remember($cacheKey, function () use ($karyawanId) {
            return $this->model->where('karyawan_id', $karyawanId)->get();
        });
    }

    /**
     * Find attendance record by employee ID and date.
     *
     * @param  int|string  $karyawanId
     * @param  string  $tanggal
     * @return \App\Models\Absensi|null
     */
    public function findByKaryawanIdAndTanggal($karyawanId, string $tanggal): ?Absensi
    {
        $cacheKey = "findByKaryawanIdAndTanggal:{$karyawanId}:{$tanggal}";

        return $this->remember($cacheKey, function () use ($karyawanId, $tanggal) {
            return $this->model
                ->where('karyawan_id', $karyawanId)
                ->where('tanggal', $tanggal)
                ->first();
        });
    }

    /**
     * Find attendance records by date.
     *
     * @param  string  $tanggal
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTanggal(string $tanggal): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByTanggal:{$tanggal}";

        return $this->remember($cacheKey, function () use ($tanggal) {
            return $this->model->where('tanggal', $tanggal)->get();
        });
    }

    /**
     * Find attendance records by date range.
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
     * Find attendance records by employee ID and date range.
     *
     * @param  int|string  $karyawanId
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndDateRange($karyawanId, string $startDate, string $endDate): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByKaryawanIdAndDateRange:{$karyawanId}:{$startDate}:{$endDate}";

        return $this->remember($cacheKey, function () use ($karyawanId, $startDate, $endDate) {
            return $this->model
                ->where('karyawan_id', $karyawanId)
                ->dateRange($startDate, $endDate)
                ->get();
        });
    }

    /**
     * Find attendance records by status.
     *
     * @param  string  $statusKehadiran
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatusKehadiran(string $statusKehadiran): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByStatusKehadiran:{$statusKehadiran}";

        return $this->remember($cacheKey, function () use ($statusKehadiran) {
            return $this->model->where('status_kehadiran', $statusKehadiran)->get();
        });
    }

    /**
     * Find present attendance records (hadir).
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findHadir(): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = 'findHadir';

        return $this->remember($cacheKey, function () {
            return $this->model->hadir()->get();
        });
    }

    /**
     * Find attendance records by employee ID and status.
     *
     * @param  int|string  $karyawanId
     * @param  string  $statusKehadiran
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndStatus($karyawanId, string $statusKehadiran): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByKaryawanIdAndStatus:{$karyawanId}:{$statusKehadiran}";

        return $this->remember($cacheKey, function () use ($karyawanId, $statusKehadiran) {
            return $this->model
                ->where('karyawan_id', $karyawanId)
                ->where('status_kehadiran', $statusKehadiran)
                ->get();
        });
    }
}


