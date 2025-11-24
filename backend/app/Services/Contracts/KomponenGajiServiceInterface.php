<?php

namespace App\Services\Contracts;

use App\Models\KomponenGaji;
use App\Services\Base\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;

interface KomponenGajiServiceInterface extends BaseServiceInterface
{
    /**
     * Find komponen gaji records by gaji_id.
     *
     * @param  int|string  $gajiId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByGajiId($gajiId): Collection;
}

