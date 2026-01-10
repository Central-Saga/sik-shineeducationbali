<?php

namespace App\Services\PembayaranGaji;

use App\Models\PembayaranGaji;
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
        if (!$this->hasPermission('mengelola pembayaran gaji') && !$this->hasPermission('mengelola gaji') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view pembayaran gaji records.');
        }

        return $this->getRepository()->findByGajiId($gajiId);
    }

    /**
     * Get a record by ID.
     *
     * @param  int|string  $id
     * @return \App\Models\PembayaranGaji
     * @throws \App\Exceptions\NotFoundException
     */
    public function getById($id): PembayaranGaji
    {
        // Check permission
        if (!$this->hasPermission('mengelola pembayaran gaji') && !$this->hasPermission('mengelola gaji') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view pembayaran gaji records.');
        }

        return parent::getById($id);
    }

    /**
     * Create a new pembayaran gaji record.
     *
     * @param  array<string, mixed>  $data
     * @return \App\Models\PembayaranGaji
     */
    public function create(array $data): PembayaranGaji
    {
        // Check permission
        if (!$this->hasPermission('mengelola pembayaran gaji')) {
            abort(403, 'You do not have permission to create pembayaran gaji.');
        }

        $pembayaranGaji = parent::create($data);

        // Clear cache for this gaji_id
        if (isset($data['gaji_id'])) {
            $this->getRepository()->clearCacheForGajiId($data['gaji_id']);
        }

        return $pembayaranGaji;
    }

    /**
     * Update a pembayaran gaji record.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \App\Models\PembayaranGaji
     */
    public function update($id, array $data): PembayaranGaji
    {
        // Check permission
        if (!$this->hasPermission('mengelola pembayaran gaji')) {
            abort(403, 'You do not have permission to update pembayaran gaji.');
        }

        $pembayaranGaji = parent::update($id, $data);

        // Clear cache for this gaji_id
        $this->getRepository()->clearCacheForGajiId($pembayaranGaji->gaji_id);

        return $pembayaranGaji;
    }

    /**
     * Delete a pembayaran gaji record.
     *
     * @param  int|string  $id
     * @return bool
     */
    public function delete($id): bool
    {
        // Check permission
        if (!$this->hasPermission('mengelola pembayaran gaji')) {
            abort(403, 'You do not have permission to delete pembayaran gaji.');
        }

        // Get gaji_id before delete
        $pembayaranGaji = $this->getRepository()->findOrFail($id);
        $gajiId = $pembayaranGaji->gaji_id;

        $deleted = parent::delete($id);

        // Clear cache for this gaji_id
        $this->getRepository()->clearCacheForGajiId($gajiId);

        return $deleted;
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

        $pembayaranGaji = $this->getRepository()->update($id, $updateData);

        // Clear cache for this gaji_id to ensure fresh data
        $gajiId = $pembayaranGaji->gaji_id;
        $this->getRepository()->clearCacheForGajiId($gajiId);

        return $pembayaranGaji->fresh();
    }
}
