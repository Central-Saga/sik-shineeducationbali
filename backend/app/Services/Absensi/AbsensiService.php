<?php

namespace App\Services\Absensi;

use App\Models\Absensi;
use App\Repositories\Contracts\AbsensiRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\AbsensiServiceInterface;
use Illuminate\Database\Eloquent\Collection;

class AbsensiService extends BaseService implements AbsensiServiceInterface
{
    /**
     * Create a new absensi service instance.
     *
     * @param  \App\Repositories\Contracts\AbsensiRepositoryInterface  $repository
     */
    public function __construct(AbsensiRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\AbsensiRepositoryInterface
     */
    protected function getRepository(): AbsensiRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Get all attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getAll(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance records.');
        }

        return parent::getAll();
    }

    /**
     * Get an attendance record by ID.
     *
     * @param  int|string  $id
     * @return \App\Models\Absensi
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getById($id): Absensi
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance records.');
        }

        return parent::getById($id);
    }

    /**
     * Create a new attendance record.
     *
     * @param  array<string, mixed>  $data
     * @return \App\Models\Absensi
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(array $data): Absensi
    {
        // Check permission - bisa melakukan absensi atau mengelola absensi
        if (!$this->hasPermission('melakukan absensi') && !$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to create attendance records.');
        }

        // Check if attendance already exists for this employee and date
        $existingAbsensi = $this->getRepository()->findByKaryawanIdAndTanggal(
            $data['karyawan_id'],
            $data['tanggal']
        );

        if ($existingAbsensi) {
            abort(422, 'Attendance record already exists for this employee on this date.');
        }

        return parent::create($data);
    }

    /**
     * Update an attendance record by ID.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \App\Models\Absensi
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update($id, array $data): Absensi
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to edit attendance records.');
        }

        // If tanggal or karyawan_id is being updated, check for duplicate
        $absensi = $this->getById($id);
        $checkKaryawanId = $data['karyawan_id'] ?? $absensi->karyawan_id;
        $checkTanggal = $data['tanggal'] ?? $absensi->tanggal;

        $existingAbsensi = $this->getRepository()->findByKaryawanIdAndTanggal(
            $checkKaryawanId,
            $checkTanggal
        );

        if ($existingAbsensi && $existingAbsensi->id != $id) {
            abort(422, 'Attendance record already exists for this employee on this date.');
        }

        return parent::update($id, $data);
    }

    /**
     * Delete an attendance record by ID.
     *
     * @param  int|string  $id
     * @return bool
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function delete($id): bool
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to delete attendance records.');
        }

        return parent::delete($id);
    }

    /**
     * Find attendance records by employee ID.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view attendance records.');
        }

        return $this->getRepository()->findByKaryawanId($karyawanId);
    }

    /**
     * Find attendance record by employee ID and date.
     *
     * @param  int|string  $karyawanId
     * @param  string  $tanggal
     * @return \App\Models\Absensi|null
     */
    public function findByKaryawanIdAndTanggal($karyawanId, string $tanggal): ?Absensi
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi') && !$this->hasPermission('melakukan absensi')) {
            abort(403, 'You do not have permission to view attendance records.');
        }

        return $this->getRepository()->findByKaryawanIdAndTanggal($karyawanId, $tanggal);
    }

    /**
     * Find attendance records by date.
     *
     * @param  string  $tanggal
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTanggal(string $tanggal): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance records.');
        }

        return $this->getRepository()->findByTanggal($tanggal);
    }

    /**
     * Find attendance records by date range.
     *
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByDateRange(string $startDate, string $endDate): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance records.');
        }

        return $this->getRepository()->findByDateRange($startDate, $endDate);
    }

    /**
     * Find attendance records by employee ID and date range.
     *
     * @param  int|string  $karyawanId
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndDateRange($karyawanId, string $startDate, string $endDate): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view attendance records.');
        }

        return $this->getRepository()->findByKaryawanIdAndDateRange($karyawanId, $startDate, $endDate);
    }

    /**
     * Find attendance records by status.
     *
     * @param  string  $statusKehadiran
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatusKehadiran(string $statusKehadiran): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance records.');
        }

        return $this->getRepository()->findByStatusKehadiran($statusKehadiran);
    }

    /**
     * Find present attendance records (hadir).
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findHadir(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance records.');
        }

        return $this->getRepository()->findHadir();
    }

    /**
     * Find attendance records by employee ID and status.
     *
     * @param  int|string  $karyawanId
     * @param  string  $statusKehadiran
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndStatus($karyawanId, string $statusKehadiran): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view attendance records.');
        }

        return $this->getRepository()->findByKaryawanIdAndStatus($karyawanId, $statusKehadiran);
    }
}


