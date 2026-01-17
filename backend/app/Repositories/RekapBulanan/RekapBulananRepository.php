<?php

namespace App\Repositories\RekapBulanan;

use App\Models\RekapBulanan;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\RekapBulananRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class RekapBulananRepository extends BaseRepository implements RekapBulananRepositoryInterface
{
    /**
     * Create a new rekap bulanan repository instance.
     *
     * @param  \App\Models\RekapBulanan  $model
     */
    public function __construct(RekapBulanan $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk rekap bulanan repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'rekap_bulanan';
    }

    /**
     * Get cache TTL untuk rekap bulanan data (1 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 3600; // 1 jam
    }

    /**
     * Find rekap bulanan records by periode.
     *
     * @param  string  $periode
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByPeriode(string $periode): Collection
    {
        $cacheKey = "findByPeriode:{$periode}";

        return $this->remember($cacheKey, function () use ($periode) {
            return $this->model->byPeriode($periode)
                ->whereHas('employee', function ($query) {
                    $query->where('status', 'aktif');
                })
                ->with('employee.user')
                ->get();
        });
    }

    /**
     * Find rekap bulanan records by karyawan_id.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection
    {
        $cacheKey = "findByKaryawanId:{$karyawanId}";

        return $this->remember($cacheKey, function () use ($karyawanId) {
            return $this->model->byKaryawan($karyawanId)
                ->whereHas('employee', function ($query) {
                    $query->where('status', 'aktif');
                })
                ->with('employee.user')
                ->get();
        });
    }

    /**
     * Find rekap bulanan record by periode and karyawan_id.
     *
     * @param  string  $periode
     * @param  int|string  $karyawanId
     * @return \App\Models\RekapBulanan|null
     */
    public function findByPeriodeAndKaryawanId(string $periode, $karyawanId): ?RekapBulanan
    {
        $cacheKey = "findByPeriodeAndKaryawanId:{$periode}:{$karyawanId}";

        return $this->remember($cacheKey, function () use ($periode, $karyawanId) {
            return $this->model->byPeriodeAndKaryawan($periode, $karyawanId)->first();
        });
    }
}

