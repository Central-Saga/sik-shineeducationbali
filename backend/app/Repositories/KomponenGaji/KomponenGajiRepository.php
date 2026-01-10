<?php

namespace App\Repositories\KomponenGaji;

use App\Models\KomponenGaji;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\KomponenGajiRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class KomponenGajiRepository extends BaseRepository implements KomponenGajiRepositoryInterface
{
    /**
     * Create a new komponen gaji repository instance.
     *
     * @param  \App\Models\KomponenGaji  $model
     */
    public function __construct(KomponenGaji $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk komponen gaji repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'komponen_gaji';
    }

    /**
     * Get cache TTL untuk komponen gaji data (1 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 3600; // 1 jam
    }

    /**
     * Find komponen gaji records by gaji_id.
     *
     * @param  int|string  $gajiId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByGajiId($gajiId): Collection
    {
        $cacheKey = "findByGajiId:{$gajiId}";

        return $this->remember($cacheKey, function () use ($gajiId) {
            return $this->model->byGaji($gajiId)->get();
        });
    }
}

