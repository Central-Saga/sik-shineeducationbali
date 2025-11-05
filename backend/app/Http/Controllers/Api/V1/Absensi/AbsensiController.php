<?php

namespace App\Http\Controllers\Api\V1\Absensi;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Requests\Api\V1\Absensi\StoreAbsensiRequest;
use App\Http\Requests\Api\V1\Absensi\UpdateAbsensiRequest;
use App\Http\Resources\Api\V1\Absensi\AbsensiResource;
use App\Services\Contracts\AbsensiServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbsensiController extends BaseApiController
{
    /**
     * The absensi service instance.
     *
     * @var \App\Services\Contracts\AbsensiServiceInterface
     */
    protected AbsensiServiceInterface $absensiService;

    /**
     * Create a new absensi controller instance.
     *
     * @param  \App\Services\Contracts\AbsensiServiceInterface  $absensiService
     */
    public function __construct(AbsensiServiceInterface $absensiService)
    {
        $this->absensiService = $absensiService;
    }

    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Priority: date range > tanggal > karyawan_id + status > status > karyawan_id > all
        
        // Filter by date range if provided (highest priority)
        if ($request->has('start_date') && $request->has('end_date')) {
            if ($request->has('karyawan_id')) {
                $query = $this->absensiService->findByKaryawanIdAndDateRange(
                    $request->karyawan_id,
                    $request->start_date,
                    $request->end_date
                );
            } else {
                $query = $this->absensiService->findByDateRange(
                    $request->start_date,
                    $request->end_date
                );
            }
        }
        // Filter by tanggal if provided
        elseif ($request->has('tanggal')) {
            $query = $this->absensiService->findByTanggal($request->tanggal);
        }
        // Filter by karyawan_id and status if both provided
        elseif ($request->has('karyawan_id') && $request->has('status_kehadiran')) {
            $query = $this->absensiService->findByKaryawanIdAndStatus(
                $request->karyawan_id,
                $request->status_kehadiran
            );
        }
        // Filter by status_kehadiran if provided
        elseif ($request->has('status_kehadiran')) {
            $query = $this->absensiService->findByStatusKehadiran($request->status_kehadiran);
        }
        // Filter by karyawan_id if provided
        elseif ($request->has('karyawan_id')) {
            $query = $this->absensiService->findByKaryawanId($request->karyawan_id);
        }
        // Get all if no filters
        else {
            $query = $this->absensiService->getAll();
        }

        // Load relationship
        $query = $query->load('employee.user');

        return $this->success(
            AbsensiResource::collection($query),
            'Attendance records retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\Absensi\StoreAbsensiRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreAbsensiRequest $request): JsonResponse
    {
        // Request sudah handle validation dan prepareForValidation
        $validated = $request->validated();

        $absensi = $this->absensiService->create($validated);
        $absensi->load('employee.user');

        return $this->created(
            new AbsensiResource($absensi),
            'Attendance record created successfully'
        );
    }

    /**
     * Display the specified resource.
     *
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {
        $absensi = $this->absensiService->getById($id);
        $absensi->load('employee.user');

        return $this->success(
            new AbsensiResource($absensi),
            'Attendance record retrieved successfully'
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\Absensi\UpdateAbsensiRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateAbsensiRequest $request, $id): JsonResponse
    {
        // Request sudah handle validation dan prepareForValidation
        $validated = $request->validated();

        $absensi = $this->absensiService->update($id, $validated);
        $absensi->load('employee.user');

        return $this->success(
            new AbsensiResource($absensi),
            'Attendance record updated successfully'
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $this->absensiService->delete($id);

        return $this->success(
            null,
            'Attendance record deleted successfully'
        );
    }

    /**
     * Get attendance records by employee ID.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|int  $karyawanId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byKaryawan(Request $request, $karyawanId): JsonResponse
    {
        $query = $this->absensiService->findByKaryawanId($karyawanId);

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query = $this->absensiService->findByKaryawanIdAndDateRange(
                $karyawanId,
                $request->start_date,
                $request->end_date
            );
        }

        // Filter by status if provided
        if ($request->has('status_kehadiran')) {
            $query = $this->absensiService->findByKaryawanIdAndStatus(
                $karyawanId,
                $request->status_kehadiran
            );
        }

        $query = $query->load('employee.user');

        return $this->success(
            AbsensiResource::collection($query),
            'Attendance records retrieved successfully'
        );
    }

    /**
     * Get attendance record by employee ID and date.
     *
     * @param  string|int  $karyawanId
     * @param  string  $tanggal
     * @return \Illuminate\Http\JsonResponse
     */
    public function byKaryawanAndTanggal($karyawanId, $tanggal): JsonResponse
    {
        $absensi = $this->absensiService->findByKaryawanIdAndTanggal($karyawanId, $tanggal);

        if (!$absensi) {
            return $this->notFound('Attendance record not found for this employee on this date');
        }

        $absensi->load('employee.user');

        return $this->success(
            new AbsensiResource($absensi),
            'Attendance record retrieved successfully'
        );
    }

    /**
     * Get present attendance records (hadir).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function hadir(Request $request): JsonResponse
    {
        $query = $this->absensiService->findHadir();

        // Filter by date if provided
        if ($request->has('tanggal')) {
            $query = $query->filter(function ($absensi) use ($request) {
                return $absensi->tanggal->format('Y-m-d') === $request->tanggal;
            });
        }

        // Load relationship
        $query = $query->load('employee.user');

        return $this->success(
            AbsensiResource::collection($query),
            'Present attendance records retrieved successfully'
        );
    }
}
