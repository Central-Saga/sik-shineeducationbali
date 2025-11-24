<?php

namespace App\Services\KomponenGaji;

use App\Repositories\Contracts\KomponenGajiRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\KomponenGajiServiceInterface;
use Illuminate\Database\Eloquent\Collection;

class KomponenGajiService extends BaseService implements KomponenGajiServiceInterface
{
    /**
     * Create a new komponen gaji service instance.
     *
     * @param  \App\Repositories\Contracts\KomponenGajiRepositoryInterface  $repository
     */
    public function __construct(KomponenGajiRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\KomponenGajiRepositoryInterface
     */
    protected function getRepository(): KomponenGajiRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Find komponen gaji records by gaji_id.
     *
     * @param  int|string  $gajiId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByGajiId($gajiId): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola gaji') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view komponen gaji records.');
        }

        return $this->getRepository()->findByGajiId($gajiId);
    }
}

