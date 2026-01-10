<?php

namespace App\Services\RealisasiSesi;

use App\Models\RealisasiSesi;
use App\Repositories\Contracts\RealisasiSesiRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\RealisasiSesiServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class RealisasiSesiService extends BaseService implements RealisasiSesiServiceInterface
{
    /**
     * Create a new realisasi sesi service instance.
     *
     * @param  \App\Repositories\Contracts\RealisasiSesiRepositoryInterface  $repository
     */
    public function __construct(RealisasiSesiRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\RealisasiSesiRepositoryInterface
     */
    protected function getRepository(): RealisasiSesiRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Get all realisasi sesi records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getAll(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi')) {
            abort(403, 'You do not have permission to view realisasi sesi records.');
        }

        return parent::getAll();
    }

    /**
     * Get a realisasi sesi record by ID.
     *
     * @param  int|string  $id
     * @return \App\Models\RealisasiSesi
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getById($id): RealisasiSesi
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi') && !$this->hasPermission('mengajukan realisasi sesi')) {
            abort(403, 'You do not have permission to view realisasi sesi records.');
        }

        return parent::getById($id);
    }

    /**
     * Create a new realisasi sesi record.
     *
     * @param  array<string, mixed>  $data
     * @return \App\Models\RealisasiSesi
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(array $data): RealisasiSesi
    {
        // Check permission - bisa mengajukan atau mengelola
        if (!$this->hasPermission('mengajukan realisasi sesi') && !$this->hasPermission('mengelola realisasi sesi')) {
            abort(403, 'You do not have permission to create realisasi sesi records.');
        }

        // If admin creates (has permission mengelola realisasi sesi), auto-approve
        // If karyawan creates (only has permission mengajukan realisasi sesi), set to diajukan
        if (!isset($data['status'])) {
            if ($this->hasPermission('mengelola realisasi sesi')) {
                // Admin creates - auto approve
                $data['status'] = 'disetujui';
                $data['disetujui_oleh'] = Auth::id();
            } else {
                // Karyawan creates - needs approval
                $data['status'] = 'diajukan';
                $data['disetujui_oleh'] = null;
            }
        } else {
            // Status is provided, validate it
            if ($data['status'] === 'diajukan') {
                $data['disetujui_oleh'] = null;
            } elseif ($data['status'] === 'disetujui') {
                // If setting to disetujui, ensure user has permission
                if (!$this->hasPermission('mengelola realisasi sesi')) {
                    abort(403, 'You do not have permission to create approved realisasi sesi records.');
                }
                $data['disetujui_oleh'] = Auth::id();
            }
        }

        // Check if realisasi sesi already exists for this tanggal and sesi_kerja_id
        // 1 sesi kerja per tanggal hanya bisa diisi oleh 1 karyawan
        $existingRealisasi = $this->getRepository()->findOneBy([
            'tanggal' => $data['tanggal'],
            'sesi_kerja_id' => $data['sesi_kerja_id'],
        ]);

        if ($existingRealisasi) {
            abort(422, 'Sesi kerja ini sudah diisi oleh karyawan lain pada tanggal yang sama. Satu sesi kerja per tanggal hanya bisa diisi oleh satu karyawan.');
        }

        return parent::create($data);
    }

    /**
     * Update a realisasi sesi record by ID.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \App\Models\RealisasiSesi
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update($id, array $data): RealisasiSesi
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi')) {
            abort(403, 'You do not have permission to edit realisasi sesi records.');
        }

        // If tanggal or sesi_kerja_id is being updated, check for duplicate
        // 1 sesi kerja per tanggal hanya bisa diisi oleh 1 karyawan
        $realisasiSesi = $this->getById($id);
        $checkTanggal = $data['tanggal'] ?? $realisasiSesi->tanggal;
        $checkSesiKerjaId = $data['sesi_kerja_id'] ?? $realisasiSesi->sesi_kerja_id;

        $existingRealisasi = $this->getRepository()->findOneBy([
            'tanggal' => $checkTanggal,
            'sesi_kerja_id' => $checkSesiKerjaId,
        ]);

        if ($existingRealisasi && $existingRealisasi->id != $id) {
            abort(422, 'Sesi kerja ini sudah diisi oleh karyawan lain pada tanggal yang sama. Satu sesi kerja per tanggal hanya bisa diisi oleh satu karyawan.');
        }

        return parent::update($id, $data);
    }

    /**
     * Delete a realisasi sesi record by ID.
     *
     * @param  int|string  $id
     * @return bool
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function delete($id): bool
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi')) {
            abort(403, 'You do not have permission to delete realisasi sesi records.');
        }

        return parent::delete($id);
    }

    /**
     * Find realisasi sesi records by karyawan_id.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi') && !$this->hasPermission('mengajukan realisasi sesi')) {
            abort(403, 'You do not have permission to view realisasi sesi records.');
        }

        return $this->getRepository()->findByKaryawanId($karyawanId);
    }

    /**
     * Find realisasi sesi records by sesi_kerja_id.
     *
     * @param  int|string  $sesiKerjaId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findBySesiKerjaId($sesiKerjaId): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi')) {
            abort(403, 'You do not have permission to view realisasi sesi records.');
        }

        return $this->getRepository()->findBySesiKerjaId($sesiKerjaId);
    }

    /**
     * Find realisasi sesi records by tanggal.
     *
     * @param  string  $tanggal
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTanggal(string $tanggal): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi')) {
            abort(403, 'You do not have permission to view realisasi sesi records.');
        }

        return $this->getRepository()->findByTanggal($tanggal);
    }

    /**
     * Find realisasi sesi records by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi')) {
            abort(403, 'You do not have permission to view realisasi sesi records.');
        }

        return $this->getRepository()->findByStatus($status);
    }

    /**
     * Find realisasi sesi records by sumber.
     *
     * @param  string  $sumber
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findBySumber(string $sumber): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi')) {
            abort(403, 'You do not have permission to view realisasi sesi records.');
        }

        return $this->getRepository()->findBySumber($sumber);
    }

    /**
     * Find realisasi sesi record by karyawan_id and tanggal.
     *
     * @param  int|string  $karyawanId
     * @param  string  $tanggal
     * @return \App\Models\RealisasiSesi|null
     */
    public function findByKaryawanIdAndTanggal($karyawanId, string $tanggal): ?RealisasiSesi
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi') && !$this->hasPermission('mengajukan realisasi sesi')) {
            abort(403, 'You do not have permission to view realisasi sesi records.');
        }

        return $this->getRepository()->findByKaryawanIdAndTanggal($karyawanId, $tanggal);
    }

    /**
     * Find realisasi sesi records by karyawan_id and date range.
     *
     * @param  int|string  $karyawanId
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndDateRange($karyawanId, string $startDate, string $endDate): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi') && !$this->hasPermission('mengajukan realisasi sesi')) {
            abort(403, 'You do not have permission to view realisasi sesi records.');
        }

        return $this->getRepository()->findByKaryawanIdAndDateRange($karyawanId, $startDate, $endDate);
    }

    /**
     * Approve a realisasi sesi record.
     *
     * @param  int|string  $id
     * @param  string|null  $catatan
     * @return \App\Models\RealisasiSesi
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function approve($id, ?string $catatan = null): RealisasiSesi
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi')) {
            abort(403, 'You do not have permission to approve realisasi sesi records.');
        }

        $realisasiSesi = $this->getById($id);

        // Check if already approved or rejected
        if ($realisasiSesi->status === 'disetujui') {
            abort(422, 'Realisasi sesi has already been approved.');
        }

        if ($realisasiSesi->status === 'ditolak') {
            abort(422, 'Realisasi sesi has been rejected and cannot be approved.');
        }

        // Update status to disetujui
        $updateData = [
            'status' => 'disetujui',
            'disetujui_oleh' => Auth::id(),
        ];

        // Update catatan if provided
        if ($catatan !== null) {
            $updateData['catatan'] = $catatan;
        }

        return $this->getRepository()->update($id, $updateData);
    }

    /**
     * Reject a realisasi sesi record.
     *
     * @param  int|string  $id
     * @param  string  $catatan
     * @return \App\Models\RealisasiSesi
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function reject($id, string $catatan): RealisasiSesi
    {
        // Check permission
        if (!$this->hasPermission('mengelola realisasi sesi')) {
            abort(403, 'You do not have permission to reject realisasi sesi records.');
        }

        $realisasiSesi = $this->getById($id);

        // Check if already approved or rejected
        if ($realisasiSesi->status === 'disetujui') {
            abort(422, 'Realisasi sesi has already been approved and cannot be rejected.');
        }

        if ($realisasiSesi->status === 'ditolak') {
            abort(422, 'Realisasi sesi has already been rejected.');
        }

        // Update status to ditolak
        $updateData = [
            'status' => 'ditolak',
            'disetujui_oleh' => Auth::id(),
            'catatan' => $catatan, // Wajib ada catatan untuk ditolak
        ];

        return $this->getRepository()->update($id, $updateData);
    }
}

