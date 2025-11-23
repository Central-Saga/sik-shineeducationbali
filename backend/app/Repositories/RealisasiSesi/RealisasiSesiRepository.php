<?php

namespace App\Repositories\RealisasiSesi;

use App\Models\RealisasiSesi;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\RealisasiSesiRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class RealisasiSesiRepository extends BaseRepository implements RealisasiSesiRepositoryInterface
{
    /**
     * Create a new realisasi sesi repository instance.
     *
     * @param  \App\Models\RealisasiSesi  $model
     */
    public function __construct(RealisasiSesi $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk realisasi sesi repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'realisasi_sesi';
    }

    /**
     * Get cache TTL untuk realisasi sesi data (1 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 3600; // 1 jam
    }

    /**
     * Find realisasi sesi records by karyawan_id.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection
    {
        $cacheKey = "findByKaryawanId:{$karyawanId}";

        return $this->remember($cacheKey, function () use ($karyawanId) {
            return $this->model->byKaryawan($karyawanId)->get();
        });
    }

    /**
     * Find realisasi sesi records by sesi_kerja_id.
     *
     * @param  int|string  $sesiKerjaId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findBySesiKerjaId($sesiKerjaId): Collection
    {
        $cacheKey = "findBySesiKerjaId:{$sesiKerjaId}";

        return $this->remember($cacheKey, function () use ($sesiKerjaId) {
            return $this->model->bySesiKerja($sesiKerjaId)->get();
        });
    }

    /**
     * Find realisasi sesi records by tanggal.
     *
     * @param  string  $tanggal
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTanggal(string $tanggal): Collection
    {
        $cacheKey = "findByTanggal:{$tanggal}";

        return $this->remember($cacheKey, function () use ($tanggal) {
            return $this->model->byTanggal($tanggal)->get();
        });
    }

    /**
     * Find realisasi sesi records by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection
    {
        $cacheKey = "findByStatus:{$status}";

        return $this->remember($cacheKey, function () use ($status) {
            return $this->model->byStatus($status)->get();
        });
    }

    /**
     * Find realisasi sesi records by sumber.
     *
     * @param  string  $sumber
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findBySumber(string $sumber): Collection
    {
        $cacheKey = "findBySumber:{$sumber}";

        return $this->remember($cacheKey, function () use ($sumber) {
            return $this->model->bySumber($sumber)->get();
        });
    }

    /**
     * Find realisasi sesi record by karyawan_id and tanggal.
     *
     * @param  int|string  $karyawanId
     * @param  string  $tanggal
     * @return \App\Models\RealisasiSesi|null
     */
    public function findByKaryawanIdAndTanggal($karyawanId, string $tanggal): ?RealisasiSesi
    {
        $cacheKey = "findByKaryawanIdAndTanggal:{$karyawanId}:{$tanggal}";

        return $this->remember($cacheKey, function () use ($karyawanId, $tanggal) {
            return $this->model
                ->byKaryawan($karyawanId)
                ->byTanggal($tanggal)
                ->first();
        });
    }

    /**
     * Find realisasi sesi records by karyawan_id and date range.
     *
     * @param  int|string  $karyawanId
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndDateRange($karyawanId, string $startDate, string $endDate): Collection
    {
        $cacheKey = "findByKaryawanIdAndDateRange:{$karyawanId}:{$startDate}:{$endDate}";

        return $this->remember($cacheKey, function () use ($karyawanId, $startDate, $endDate) {
            return $this->model
                ->byKaryawan($karyawanId)
                ->dateRange($startDate, $endDate)
                ->get();
        });
    }

    /**
     * Find diajukan realisasi sesi records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findDiajukan(): Collection
    {
        $cacheKey = 'findDiajukan';

        return $this->remember($cacheKey, function () {
            return $this->model->diajukan()->get();
        });
    }

    /**
     * Find disetujui realisasi sesi records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findDisetujui(): Collection
    {
        $cacheKey = 'findDisetujui';

        return $this->remember($cacheKey, function () {
            return $this->model->disetujui()->get();
        });
    }

    /**
     * Find ditolak realisasi sesi records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findDitolak(): Collection
    {
        $cacheKey = 'findDitolak';

        return $this->remember($cacheKey, function () {
            return $this->model->ditolak()->get();
        });
    }
}

