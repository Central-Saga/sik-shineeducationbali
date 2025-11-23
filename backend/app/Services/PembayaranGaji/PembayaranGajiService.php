<?php

namespace App\Services\PembayaranGaji;

use App\Repositories\Contracts\PembayaranGajiRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\PembayaranGajiServiceInterface;
use Illuminate\Database\Eloquent\Collection;

class PembayaranGajiService extends BaseService implements PembayaranGajiServiceInterface
{
    /**
     * Create a new pembayaran gaji service instance.
     *
     * @param  \App\Repositories\Contracts\PembayaranGajiRepositoryInterface  $repository
     */
    public function __construct(PembayaranGajiRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\PembayaranGajiRepositoryInterface
     */
    protected function getRepository(): PembayaranGajiRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Find pembayaran gaji records by gaji_id.
     *
     * @param  int|string  $gajiId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByGajiId($gajiId): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola pembayaran gaji') && !$this->hasPermission('mengelola gaji')) {
            abort(403, 'You do not have permission to view pembayaran gaji records.');
        }

        return $this->getRepository()->findByGajiId($gajiId);
    }

    /**
     * Update pembayaran gaji status.
     *
     * @param  int|string  $id
     * @param  string  $status
     * @return \App\Models\PembayaranGaji
     */
    public function updateStatusPembayaran($id, string $status): PembayaranGaji
    {
        // Check permission
        if (!$this->hasPermission('mengelola pembayaran gaji')) {
            abort(403, 'You do not have permission to update pembayaran gaji status.');
        }

        // Validate status
        if (!in_array($status, ['menunggu', 'berhasil', 'gagal'])) {
            abort(422, 'Invalid status. Must be one of: menunggu, berhasil, gagal');
        }

        $updateData = ['status_pembayaran' => $status];

        // If status is berhasil, set disetujui_oleh
        if ($status === 'berhasil') {
            $updateData['disetujui_oleh'] = auth()->id();
        }

        return $this->getRepository()->update($id, $updateData);
    }
}

