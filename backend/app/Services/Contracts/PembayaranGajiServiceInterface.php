<?php

namespace App\Services\Contracts;

use App\Models\PembayaranGaji;
use App\Services\Base\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;

interface PembayaranGajiServiceInterface extends BaseServiceInterface
{
    /**
     * Find pembayaran gaji records by gaji_id.
     *
     * @param  int|string  $gajiId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByGajiId($gajiId): Collection;

    /**
     * Update pembayaran gaji status.
     *
     * @param  int|string  $id
     * @param  string  $status
     * @return \App\Models\PembayaranGaji
     */
    public function updateStatusPembayaran($id, string $status): PembayaranGaji;
}

