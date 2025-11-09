<?php

namespace App\Repositories\Cuti;

use App\Models\Cuti;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\CutiRepositoryInterface;

class CutiRepository extends BaseRepository implements CutiRepositoryInterface
{
    /**
     * Create a new cuti repository instance.
     *
     * @param  \App\Models\Cuti  $model
     */
    public function __construct(Cuti $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk cuti repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'cuti';
    }

    /**
     * Get cache TTL untuk cuti data (1 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 3600; // 1 jam
    }

    /**
     * Find leave requests by employee ID.
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
     * Find leave request by employee ID and date.
     *
     * @param  int|string  $karyawanId
     * @param  string  $tanggal
     * @return \App\Models\Cuti|null
     */
    public function findByKaryawanIdAndTanggal($karyawanId, string $tanggal): ?Cuti
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
     * Find leave requests by date.
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
     * Find leave requests by date range.
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
     * Find leave requests by employee ID and date range.
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
     * Find leave requests by jenis.
     *
     * @param  string  $jenis
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByJenis(string $jenis): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByJenis:{$jenis}";

        return $this->remember($cacheKey, function () use ($jenis) {
            return $this->model->where('jenis', $jenis)->get();
        });
    }

    /**
     * Find leave requests by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByStatus:{$status}";

        return $this->remember($cacheKey, function () use ($status) {
            return $this->model->where('status', $status)->get();
        });
    }

    /**
     * Find leave requests by employee ID and jenis.
     *
     * @param  int|string  $karyawanId
     * @param  string  $jenis
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndJenis($karyawanId, string $jenis): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByKaryawanIdAndJenis:{$karyawanId}:{$jenis}";

        return $this->remember($cacheKey, function () use ($karyawanId, $jenis) {
            return $this->model
                ->where('karyawan_id', $karyawanId)
                ->where('jenis', $jenis)
                ->get();
        });
    }

    /**
     * Find leave requests by employee ID and status.
     *
     * @param  int|string  $karyawanId
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndStatus($karyawanId, string $status): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByKaryawanIdAndStatus:{$karyawanId}:{$status}";

        return $this->remember($cacheKey, function () use ($karyawanId, $status) {
            return $this->model
                ->where('karyawan_id', $karyawanId)
                ->where('status', $status)
                ->get();
        });
    }
}

