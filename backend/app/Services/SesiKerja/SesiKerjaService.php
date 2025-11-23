<?php

namespace App\Services\SesiKerja;

use App\Models\SesiKerja;
use App\Repositories\Contracts\SesiKerjaRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\SesiKerjaServiceInterface;
use Illuminate\Database\Eloquent\Collection;

class SesiKerjaService extends BaseService implements SesiKerjaServiceInterface
{
    /**
     * Create a new sesi kerja service instance.
     *
     * @param  \App\Repositories\Contracts\SesiKerjaRepositoryInterface  $repository
     */
    public function __construct(SesiKerjaRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\SesiKerjaRepositoryInterface
     */
    protected function getRepository(): SesiKerjaRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Get all sesi kerja records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getAll(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola sesi kerja')) {
            abort(403, 'You do not have permission to view sesi kerja records.');
        }

        return parent::getAll();
    }

    /**
     * Get a sesi kerja record by ID.
     *
     * @param  int|string  $id
     * @return \App\Models\SesiKerja
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getById($id): SesiKerja
    {
        // Check permission
        if (!$this->hasPermission('mengelola sesi kerja')) {
            abort(403, 'You do not have permission to view sesi kerja records.');
        }

        return parent::getById($id);
    }

    /**
     * Create a new sesi kerja record.
     *
     * @param  array<string, mixed>  $data
     * @return \App\Models\SesiKerja
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(array $data): SesiKerja
    {
        // Check permission
        if (!$this->hasPermission('mengelola sesi kerja')) {
            abort(403, 'You do not have permission to create sesi kerja records.');
        }

        // Auto-generate nomor_sesi if not provided
        if (!isset($data['nomor_sesi']) || empty($data['nomor_sesi'])) {
            $data['nomor_sesi'] = $this->getRepository()->getNextNomorSesi(
                $data['kategori'],
                $data['hari']
            );
        }

        // Check if sesi kerja already exists for this kategori, hari, and nomor_sesi
        $existingSesi = $this->getRepository()->findOneBy([
            'kategori' => $data['kategori'],
            'hari' => $data['hari'],
            'nomor_sesi' => $data['nomor_sesi'],
        ]);

        if ($existingSesi) {
            abort(422, 'Sesi kerja already exists for this kategori, hari, and nomor_sesi.');
        }

        return parent::create($data);
    }

    /**
     * Update a sesi kerja record by ID.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \App\Models\SesiKerja
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update($id, array $data): SesiKerja
    {
        // Check permission
        if (!$this->hasPermission('mengelola sesi kerja')) {
            abort(403, 'You do not have permission to edit sesi kerja records.');
        }

        // If kategori, hari, or nomor_sesi is being updated, check for duplicate
        $sesiKerja = $this->getById($id);
        $checkKategori = $data['kategori'] ?? $sesiKerja->kategori;
        $checkHari = $data['hari'] ?? $sesiKerja->hari;
        $checkNomorSesi = $data['nomor_sesi'] ?? $sesiKerja->nomor_sesi;

        $existingSesi = $this->getRepository()->findOneBy([
            'kategori' => $checkKategori,
            'hari' => $checkHari,
            'nomor_sesi' => $checkNomorSesi,
        ]);

        if ($existingSesi && $existingSesi->id != $id) {
            abort(422, 'Sesi kerja already exists for this kategori, hari, and nomor_sesi.');
        }

        return parent::update($id, $data);
    }

    /**
     * Delete a sesi kerja record by ID.
     *
     * @param  int|string  $id
     * @return bool
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function delete($id): bool
    {
        // Check permission
        if (!$this->hasPermission('mengelola sesi kerja')) {
            abort(403, 'You do not have permission to delete sesi kerja records.');
        }

        return parent::delete($id);
    }

    /**
     * Find sesi kerja records by kategori.
     *
     * @param  string  $kategori
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKategori(string $kategori): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola sesi kerja')) {
            abort(403, 'You do not have permission to view sesi kerja records.');
        }

        return $this->getRepository()->findByKategori($kategori);
    }

    /**
     * Find sesi kerja records by hari.
     *
     * @param  string  $hari
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByHari(string $hari): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola sesi kerja')) {
            abort(403, 'You do not have permission to view sesi kerja records.');
        }

        return $this->getRepository()->findByHari($hari);
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
        // Check permission
        if (!$this->hasPermission('mengelola sesi kerja')) {
            abort(403, 'You do not have permission to view sesi kerja records.');
        }

        return $this->getRepository()->findByKategoriHari($kategori, $hari);
    }

    /**
     * Find active sesi kerja records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findAktif(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola sesi kerja')) {
            abort(403, 'You do not have permission to view sesi kerja records.');
        }

        return $this->getRepository()->findAktif();
    }

    /**
     * Find sesi kerja records by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola sesi kerja')) {
            abort(403, 'You do not have permission to view sesi kerja records.');
        }

        return $this->getRepository()->findByStatus($status);
    }

    /**
     * Update status of sesi kerja.
     *
     * @param  int|string  $id
     * @param  string  $status
     * @return \App\Models\SesiKerja
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function updateStatus(int|string $id, string $status): SesiKerja
    {
        // Check permission
        if (!$this->hasPermission('mengelola sesi kerja')) {
            abort(403, 'You do not have permission to update sesi kerja status.');
        }

        // Validate status
        if (!in_array($status, ['aktif', 'non aktif'])) {
            abort(422, 'Status must be either "aktif" or "non aktif".');
        }

        $sesiKerja = $this->getById($id);
        return $this->getRepository()->update($id, ['status' => $status]);
    }
}

