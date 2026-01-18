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

        // Set created_by
        $data['created_by'] = auth()->id();

        // Validasi: Admin tidak bisa create jika sudah ada pembayaran
        if (isset($data['gaji_id'])) {
            $this->validateAdminCanModify($data['gaji_id'], 'create');
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

        // Get existing pembayaran to check gaji_id
        $existingPembayaran = $this->getRepository()->findOrFail($id);
        
        // Validasi: Admin tidak bisa update jika sudah ada pembayaran
        $this->validateAdminCanModify($existingPembayaran->gaji_id, 'update');

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

        // Validasi: Admin tidak bisa delete jika sudah ada pembayaran
        $this->validateAdminCanModify($gajiId, 'delete');

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

        // Get existing pembayaran to check gaji_id
        $existingPembayaran = $this->getRepository()->findOrFail($id);
        
        // Validasi: Admin tidak bisa update status jika sudah ada pembayaran
        $this->validateAdminCanModify($existingPembayaran->gaji_id, 'update status');

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

    /**
     * Validate if Admin can modify pembayaran gaji.
     * Admin tidak bisa modify jika sudah ada pembayaran untuk gaji_id tersebut.
     * Owner tetap bisa melakukan semua operasi.
     *
     * @param  int|string  $gajiId
     * @param  string  $action
     * @return void
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function validateAdminCanModify($gajiId, string $action): void
    {
        $user = auth()->user();
        
        if (!$user) {
            abort(401, 'User not authenticated.');
        }

        // Load roles untuk validasi
        $user->load('roles');

        // Owner bisa melakukan semua operasi
        if ($user->hasRole('Owner')) {
            return;
        }

        // Jika user adalah Admin, cek apakah sudah ada pembayaran
        if ($user->hasRole('Admin')) {
            $existingPembayaran = $this->getRepository()->findByGajiId($gajiId);
            
            // Jika sudah ada pembayaran, Admin tidak bisa modify
            if ($existingPembayaran->count() > 0) {
                $actionMessages = [
                    'create' => 'menambahkan',
                    'update' => 'mengubah',
                    'update status' => 'mengubah status',
                    'delete' => 'menghapus',
                ];
                
                $actionMessage = $actionMessages[$action] ?? 'mengubah';
                
                abort(422, "Admin tidak dapat {$actionMessage} pembayaran gaji yang sudah ada. Hanya Owner yang dapat melakukan perubahan.");
            }
        }
    }
}
