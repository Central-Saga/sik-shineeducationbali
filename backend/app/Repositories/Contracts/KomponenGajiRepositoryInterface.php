<?php

namespace App\Repositories\Contracts;

use App\Repositories\Base\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

interface KomponenGajiRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find komponen gaji records by gaji_id.
     *
     * @param  int|string  $gajiId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByGajiId($gajiId): Collection;
}

