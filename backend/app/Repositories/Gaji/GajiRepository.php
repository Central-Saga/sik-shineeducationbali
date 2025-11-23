<?php

namespace App\Repositories\Gaji;

use App\Models\Gaji;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\GajiRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class GajiRepository extends BaseRepository implements GajiRepositoryInterface
{
    /**
     * Create a new gaji repository instance.
     *
     * @param  \App\Models\Gaji  $model
     */
    public function __construct(Gaji $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk gaji repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'gaji';
    }

    /**
     * Get cache TTL untuk gaji data (1 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 3600; // 1 jam
    }

    /**
     * Find gaji records by periode.
     *
     * @param  string  $periode
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByPeriode(string $periode): Collection
    {
        $cacheKey = "findByPeriode:{$periode}";

        return $this->remember($cacheKey, function () use ($periode) {
            return $this->model->byPeriode($periode)->get();
        });
    }

    /**
     * Find gaji records by karyawan_id.
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
     * Find gaji records by status.
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
}

