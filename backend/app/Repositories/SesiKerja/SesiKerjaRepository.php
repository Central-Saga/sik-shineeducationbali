<?php

namespace App\Repositories\SesiKerja;

use App\Models\SesiKerja;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\SesiKerjaRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SesiKerjaRepository extends BaseRepository implements SesiKerjaRepositoryInterface
{
    /**
     * Create a new sesi kerja repository instance.
     *
     * @param  \App\Models\SesiKerja  $model
     */
    public function __construct(SesiKerja $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk sesi kerja repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'sesi_kerja';
    }

    /**
     * Get cache TTL untuk sesi kerja data (1 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 3600; // 1 jam
    }

    /**
     * Find sesi kerja records by kategori.
     *
     * @param  string  $kategori
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKategori(string $kategori): Collection
    {
        $cacheKey = "findByKategori:{$kategori}";

        return $this->remember($cacheKey, function () use ($kategori) {
            return $this->model->where('kategori', $kategori)->get();
        });
    }

    /**
     * Find sesi kerja records by hari.
     *
     * @param  string  $hari
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByHari(string $hari): Collection
    {
        $cacheKey = "findByHari:{$hari}";

        return $this->remember($cacheKey, function () use ($hari) {
            return $this->model->hari($hari)->get();
        });
    }

    /**
     * Find sesi kerja records by kategori and hari.
     *
     * @param  string  $kategori
     * @param  string  $hari
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKategoriHari(string $kategori, string $hari): Collection
    {
        $cacheKey = "findByKategoriHari:{$kategori}:{$hari}";

        return $this->remember($cacheKey, function () use ($kategori, $hari) {
            return $this->model->kategoriHari($kategori, $hari)->get();
        });
    }

    /**
     * Find active sesi kerja records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findAktif(): Collection
    {
        $cacheKey = 'findAktif';

        return $this->remember($cacheKey, function () {
            return $this->model->aktif()->get();
        });
    }

    /**
     * Find sesi kerja records by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection
    {
        $cacheKey = "findByStatus:{$status}";

        return $this->remember($cacheKey, function () use ($status) {
            return $this->model->where('status', $status)->get();
        });
    }
}

