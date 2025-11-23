<?php

namespace App\Repositories\PembayaranGaji;

use App\Models\PembayaranGaji;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\PembayaranGajiRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class PembayaranGajiRepository extends BaseRepository implements PembayaranGajiRepositoryInterface
{
    /**
     * Create a new pembayaran gaji repository instance.
     *
     * @param  \App\Models\PembayaranGaji  $model
     */
    public function __construct(PembayaranGaji $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk pembayaran gaji repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'pembayaran_gaji';
    }

    /**
     * Get cache TTL untuk pembayaran gaji data (1 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 3600; // 1 jam
    }

    /**
     * Find pembayaran gaji records by gaji_id.
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

    /**
     * Clear cache for findByGajiId.
     *
     * @param  int|string  $gajiId
     * @return void
     */
    public function clearCacheForGajiId($gajiId): void
    {
        $this->forget("findByGajiId:{$gajiId}");
    }
}

