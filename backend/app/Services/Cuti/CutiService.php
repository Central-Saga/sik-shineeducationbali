<?php

namespace App\Services\Cuti;

use App\Models\Cuti;
use App\Models\Employee;
use App\Repositories\Contracts\CutiRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\CutiServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;

class CutiService extends BaseService implements CutiServiceInterface
{
    /**
     * Create a new cuti service instance.
     *
     * @param  \App\Repositories\Contracts\CutiRepositoryInterface  $repository
     */
    public function __construct(CutiRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\CutiRepositoryInterface
     */
    protected function getRepository(): CutiRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Get all leave requests.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getAll(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to view leave requests.');
        }

        return parent::getAll();
    }

    /**
     * Get a leave request by ID.
     *
     * @param  int|string  $id
     * @return \App\Models\Cuti
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getById($id): Cuti
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti') && !$this->hasPermission('melakukan cuti')) {
            abort(403, 'You do not have permission to view leave requests.');
        }

        return parent::getById($id);
    }

    /**
     * Create a new leave request.
     *
     * @param  array<string, mixed>  $data
     * @return \App\Models\Cuti
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(array $data): Cuti
    {
        // Check permission - bisa melakukan cuti atau mengelola cuti
        if (!$this->hasPermission('melakukan cuti') && !$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to create leave requests.');
        }

        // Set default status jika tidak ada
        if (!isset($data['status'])) {
            $data['status'] = 'diajukan';
        }

        // Jika status diajukan, pastikan disetujui_oleh null
        if ($data['status'] === 'diajukan') {
            $data['disetujui_oleh'] = null;
        }

        // Check if leave request already exists for this employee and date
        $existingCuti = $this->getRepository()->findByKaryawanIdAndTanggal(
            $data['karyawan_id'],
            $data['tanggal']
        );

        if ($existingCuti) {
            abort(422, 'Pengajuan cuti untuk karyawan ini pada tanggal tersebut sudah ada.');
        }

        // Validate employee category and leave type restrictions
        $this->validateEmployeeCategoryAndLeaveType($data['karyawan_id'], $data['jenis']);

        // Validate leave quota based on employee category
        $this->validateLeaveQuota($data['karyawan_id'], $data['jenis'], $data['tanggal']);

        return parent::create($data);
    }

    /**
     * Update a leave request by ID.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \App\Models\Cuti
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update($id, array $data): Cuti
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to edit leave requests.');
        }

        // Jika status diajukan, pastikan disetujui_oleh null
        if (isset($data['status']) && $data['status'] === 'diajukan') {
            $data['disetujui_oleh'] = null;
        }

        // Jika status disetujui atau ditolak, pastikan disetujui_oleh diisi
        if (isset($data['status']) && in_array($data['status'], ['disetujui', 'ditolak'])) {
            if (!isset($data['disetujui_oleh'])) {
                // Ambil user yang sedang login sebagai admin yang menyetujui
                $data['disetujui_oleh'] = auth()->id();
            }

            // Jika status diubah menjadi disetujui, validasi quota
            if ($data['status'] === 'disetujui') {
                $cuti = $this->getById($id);
                // Exclude cuti ini dari perhitungan karena statusnya akan diubah menjadi disetujui
                $this->validateLeaveQuota($cuti->karyawan_id, $cuti->jenis, $cuti->tanggal, $id);
            }
        }

        // If tanggal or karyawan_id is being updated, check for duplicate
        $cuti = $this->getById($id);
        $checkKaryawanId = $data['karyawan_id'] ?? $cuti->karyawan_id;
        $checkTanggal = $data['tanggal'] ?? $cuti->tanggal;
        $checkJenis = $data['jenis'] ?? $cuti->jenis;

        // Validate employee category and leave type restrictions if jenis or karyawan_id is being updated
        if (isset($data['jenis']) || isset($data['karyawan_id'])) {
            $this->validateEmployeeCategoryAndLeaveType($checkKaryawanId, $checkJenis);
        }

        $existingCuti = $this->getRepository()->findByKaryawanIdAndTanggal(
            $checkKaryawanId,
            $checkTanggal
        );

        if ($existingCuti && $existingCuti->id != $id) {
            abort(422, 'Pengajuan cuti untuk karyawan ini pada tanggal tersebut sudah ada.');
        }

        return parent::update($id, $data);
    }

    /**
     * Delete a leave request by ID.
     *
     * @param  int|string  $id
     * @return bool
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function delete($id): bool
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to delete leave requests.');
        }

        return parent::delete($id);
    }

    /**
     * Find leave requests by employee ID.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti') && !$this->hasPermission('melakukan cuti')) {
            abort(403, 'You do not have permission to view leave requests.');
        }

        return $this->getRepository()->findByKaryawanId($karyawanId);
    }

    /**
     * Find leave request by employee ID and date.
     *
     * @param  int|string  $karyawanId
     * @param  string  $tanggal
     * @return \App\Models\Cuti|null
     */
    public function findByKaryawanIdAndTanggal($karyawanId, string $tanggal): ?Cuti
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti') && !$this->hasPermission('melakukan cuti')) {
            abort(403, 'You do not have permission to view leave requests.');
        }

        return $this->getRepository()->findByKaryawanIdAndTanggal($karyawanId, $tanggal);
    }

    /**
     * Find leave requests by date.
     *
     * @param  string  $tanggal
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTanggal(string $tanggal): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to view leave requests.');
        }

        return $this->getRepository()->findByTanggal($tanggal);
    }

    /**
     * Find leave requests by date range.
     *
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByDateRange(string $startDate, string $endDate): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to view leave requests.');
        }

        return $this->getRepository()->findByDateRange($startDate, $endDate);
    }

    /**
     * Find leave requests by employee ID and date range.
     *
     * @param  int|string  $karyawanId
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndDateRange($karyawanId, string $startDate, string $endDate): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti') && !$this->hasPermission('melakukan cuti')) {
            abort(403, 'You do not have permission to view leave requests.');
        }

        return $this->getRepository()->findByKaryawanIdAndDateRange($karyawanId, $startDate, $endDate);
    }

    /**
     * Find leave requests by jenis.
     *
     * @param  string  $jenis
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByJenis(string $jenis): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to view leave requests.');
        }

        return $this->getRepository()->findByJenis($jenis);
    }

    /**
     * Find leave requests by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to view leave requests.');
        }

        return $this->getRepository()->findByStatus($status);
    }

    /**
     * Find leave requests by employee ID and jenis.
     *
     * @param  int|string  $karyawanId
     * @param  string  $jenis
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndJenis($karyawanId, string $jenis): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti') && !$this->hasPermission('melakukan cuti')) {
            abort(403, 'You do not have permission to view leave requests.');
        }

        return $this->getRepository()->findByKaryawanIdAndJenis($karyawanId, $jenis);
    }

    /**
     * Find leave requests by employee ID and status.
     *
     * @param  int|string  $karyawanId
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanIdAndStatus($karyawanId, string $status): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola cuti') && !$this->hasPermission('melakukan cuti')) {
            abort(403, 'You do not have permission to view leave requests.');
        }

        return $this->getRepository()->findByKaryawanIdAndStatus($karyawanId, $status);
    }

    /**
     * Validate employee category and leave type restrictions.
     *
     * @param  int|string  $karyawanId
     * @param  string  $jenis
     * @return void
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function validateEmployeeCategoryAndLeaveType($karyawanId, string $jenis): void
    {
        $employee = Employee::find($karyawanId);
        
        if (!$employee) {
            abort(404, 'Employee not found.');
        }

        // Tidak ada validasi khusus untuk kategori karyawan dan jenis
        // Semua karyawan bisa mengajukan izin dan sakit
    }

    /**
     * Validate leave quota based on employee category.
     *
     * @param  int|string  $karyawanId
     * @param  string  $jenis
     * @param  string  $tanggal
     * @param  int|string|null  $excludeCutiId  ID cuti yang akan di-exclude dari perhitungan (untuk update)
     * @return void
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function validateLeaveQuota($karyawanId, string $jenis, string $tanggal, $excludeCutiId = null): void
    {
        $employee = Employee::find($karyawanId);
        
        if (!$employee) {
            abort(404, 'Employee not found.');
        }

        $tanggalCarbon = Carbon::parse($tanggal);

        // Validasi untuk pegawai kontrak: maksimal 2x izin per bulan
        if ($employee->kategori_karyawan === 'kontrak' && $jenis === 'izin') {
            $startOfMonth = $tanggalCarbon->copy()->startOfMonth()->format('Y-m-d');
            $endOfMonth = $tanggalCarbon->copy()->endOfMonth()->format('Y-m-d');
            
            $count = $this->getRepository()->countApprovedByKaryawanIdAndJenisAndDateRange(
                $karyawanId,
                'izin',
                $startOfMonth,
                $endOfMonth
            );

            // Jika ada excludeCutiId, kurangi count jika cuti tersebut sudah disetujui
            if ($excludeCutiId) {
                $excludeCuti = $this->getRepository()->find($excludeCutiId);
                if ($excludeCuti && $excludeCuti->status === 'disetujui' && $excludeCuti->jenis === 'izin') {
                    $excludeDate = Carbon::parse($excludeCuti->tanggal);
                    if ($excludeDate->format('Y-m') === $tanggalCarbon->format('Y-m')) {
                        $count--;
                    }
                }
            }

            if ($count >= 2) {
                abort(422, 'Pegawai kontrak hanya dapat mengajukan maksimal 2x izin per bulan. Anda sudah menggunakan ' . $count . 'x izin di bulan ini.');
            }
        }

        // Validasi untuk karyawan tetap: maksimal 12x izin per tahun
        if ($employee->kategori_karyawan === 'tetap' && $jenis === 'izin') {
            $startOfYear = $tanggalCarbon->copy()->startOfYear()->format('Y-m-d');
            $endOfYear = $tanggalCarbon->copy()->endOfYear()->format('Y-m-d');
            
            $count = $this->getRepository()->countApprovedByKaryawanIdAndJenisAndDateRange(
                $karyawanId,
                'izin',
                $startOfYear,
                $endOfYear
            );

            // Jika ada excludeCutiId, kurangi count jika cuti tersebut sudah disetujui
            if ($excludeCutiId) {
                $excludeCuti = $this->getRepository()->find($excludeCutiId);
                if ($excludeCuti && $excludeCuti->status === 'disetujui' && $excludeCuti->jenis === 'izin') {
                    $excludeDate = Carbon::parse($excludeCuti->tanggal);
                    if ($excludeDate->format('Y') === $tanggalCarbon->format('Y')) {
                        $count--;
                    }
                }
            }

            if ($count >= 12) {
                abort(422, 'Karyawan tetap hanya dapat mengajukan maksimal 12x izin per tahun. Anda sudah menggunakan ' . $count . 'x izin di tahun ini.');
            }
        }

        // Sakit tidak ada batasan quota untuk semua kategori karyawan
    }

    /**
     * Cancel a leave request (Kondisi A: status "diajukan" → "dibatalkan").
     * Only the employee who owns the leave request can cancel it.
     *
     * @param  int|string  $id
     * @return \App\Models\Cuti
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function cancelCuti($id): Cuti
    {
        $cuti = $this->getById($id);
        $user = auth()->user();

        // Check if user has permission to cancel
        if (!$this->hasPermission('melakukan cuti') && !$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to cancel leave requests.');
        }

        // For karyawan role, check if they own this cuti
        if ($user && $user->hasRole('Karyawan')) {
            $employee = $user->employee;
            if (!$employee || $cuti->karyawan_id !== $employee->id) {
                abort(403, 'You can only cancel your own leave requests.');
            }
        }

        // Validate status must be "diajukan"
        if ($cuti->status !== 'diajukan') {
            abort(422, 'Hanya cuti dengan status "Diajukan" yang dapat dibatalkan langsung.');
        }

        // Update status to "dibatalkan"
        return $this->getRepository()->update($id, [
            'status' => 'dibatalkan',
            'disetujui_oleh' => null, // Reset disetujui_oleh karena dibatalkan
        ]);
    }

    /**
     * Request cancellation of an approved leave request (Kondisi B: status "disetujui" → "pembatalan_diajukan").
     * Only the employee who owns the leave request can request cancellation.
     *
     * @param  int|string  $id
     * @return \App\Models\Cuti
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function requestCancellation($id): Cuti
    {
        $cuti = $this->getById($id);
        $user = auth()->user();

        // Check if user has permission to request cancellation
        if (!$this->hasPermission('melakukan cuti') && !$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to request cancellation.');
        }

        // For karyawan role, check if they own this cuti
        if ($user && $user->hasRole('Karyawan')) {
            $employee = $user->employee;
            if (!$employee || $cuti->karyawan_id !== $employee->id) {
                abort(403, 'You can only request cancellation for your own leave requests.');
            }
        }

        // Validate status must be "disetujui"
        if ($cuti->status !== 'disetujui') {
            abort(422, 'Hanya cuti dengan status "Disetujui" yang dapat diajukan pembatalannya.');
        }

        // Update status to "pembatalan_diajukan"
        return $this->getRepository()->update($id, [
            'status' => 'pembatalan_diajukan',
            // Keep disetujui_oleh as is, will be updated when admin approves/rejects
        ]);
    }

    /**
     * Approve cancellation request (Admin only).
     * Changes status from "pembatalan_diajukan" to "dibatalkan".
     *
     * @param  int|string  $id
     * @return \App\Models\Cuti
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function approveCancellation($id): Cuti
    {
        // Check permission - only admin can approve cancellation
        if (!$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to approve cancellation requests.');
        }

        $cuti = $this->getById($id);

        // Validate status must be "pembatalan_diajukan"
        if ($cuti->status !== 'pembatalan_diajukan') {
            abort(422, 'Hanya cuti dengan status "Pembatalan Diajukan" yang dapat disetujui pembatalannya.');
        }

        // Update status to "dibatalkan"
        return $this->getRepository()->update($id, [
            'status' => 'dibatalkan',
            'disetujui_oleh' => auth()->id(), // Admin who approved the cancellation
        ]);
    }

    /**
     * Reject cancellation request (Admin only).
     * Changes status from "pembatalan_diajukan" back to "disetujui".
     *
     * @param  int|string  $id
     * @return \App\Models\Cuti
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function rejectCancellation($id): Cuti
    {
        // Check permission - only admin can reject cancellation
        if (!$this->hasPermission('mengelola cuti')) {
            abort(403, 'You do not have permission to reject cancellation requests.');
        }

        $cuti = $this->getById($id);

        // Validate status must be "pembatalan_diajukan"
        if ($cuti->status !== 'pembatalan_diajukan') {
            abort(422, 'Hanya cuti dengan status "Pembatalan Diajukan" yang dapat ditolak pembatalannya.');
        }

        // Update status back to "disetujui"
        return $this->getRepository()->update($id, [
            'status' => 'disetujui',
            'disetujui_oleh' => $cuti->disetujui_oleh, // Keep original approver
        ]);
    }
}

