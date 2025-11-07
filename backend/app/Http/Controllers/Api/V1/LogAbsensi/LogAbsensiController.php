<?php

namespace App\Http\Controllers\Api\V1\LogAbsensi;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Requests\Api\V1\LogAbsensi\StoreLogAbsensiRequest;
use App\Http\Requests\Api\V1\LogAbsensi\UpdateLogAbsensiRequest;
use App\Http\Resources\Api\V1\LogAbsensi\LogAbsensiResource;
use App\Services\Contracts\LogAbsensiServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogAbsensiController extends BaseApiController
{
    /**
     * The log absensi service instance.
     *
     * @var \App\Services\Contracts\LogAbsensiServiceInterface
     */
    protected LogAbsensiServiceInterface $logAbsensiService;

    /**
     * Create a new log absensi controller instance.
     *
     * @param  \App\Services\Contracts\LogAbsensiServiceInterface  $logAbsensiService
     */
    public function __construct(LogAbsensiServiceInterface $logAbsensiService)
    {
        $this->logAbsensiService = $logAbsensiService;
    }

    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Priority: date range > absensi_id + jenis > absensi_id > jenis > sumber > all
        
        // Filter by date range if provided (highest priority)
        if ($request->has('start_date') && $request->has('end_date')) {
            if ($request->has('absensi_id')) {
                $query = $this->logAbsensiService->findByAbsensiIdAndDateRange(
                    $request->absensi_id,
                    $request->start_date,
                    $request->end_date
                );
            } else {
                $query = $this->logAbsensiService->findByDateRange(
                    $request->start_date,
                    $request->end_date
                );
            }
        }
        // Filter by absensi_id and jenis if both provided
        elseif ($request->has('absensi_id') && $request->has('jenis')) {
            $query = $this->logAbsensiService->findByAbsensiIdAndJenis(
                $request->absensi_id,
                $request->jenis
            );
        }
        // Filter by absensi_id if provided
        elseif ($request->has('absensi_id')) {
            $query = $this->logAbsensiService->findByAbsensiId($request->absensi_id);
        }
        // Filter by jenis if provided
        elseif ($request->has('jenis')) {
            if ($request->jenis === 'check_in') {
                $query = $this->logAbsensiService->findCheckIn();
            } elseif ($request->jenis === 'check_out') {
                $query = $this->logAbsensiService->findCheckOut();
            } else {
                $query = $this->logAbsensiService->getAll();
            }
        }
        // Filter by sumber if provided
        elseif ($request->has('sumber')) {
            $query = $this->logAbsensiService->findBySumber($request->sumber);
        }
        // Get all if no filters
        else {
            $query = $this->logAbsensiService->getAll();
        }

        // Load relationship
        $query = $query->load('absensi.employee.user');

        return $this->success(
            LogAbsensiResource::collection($query),
            'Attendance log records retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\LogAbsensi\StoreLogAbsensiRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreLogAbsensiRequest $request): JsonResponse
    {
        // Request sudah handle validation dan prepareForValidation
        $validated = $request->validated();

        $logAbsensi = $this->logAbsensiService->create($validated);
        $logAbsensi->load('absensi.employee.user');

        return $this->created(
            new LogAbsensiResource($logAbsensi),
            'Attendance log record created successfully'
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
        $logAbsensi = $this->logAbsensiService->getById($id);
        $logAbsensi->load('absensi.employee.user');

        return $this->success(
            new LogAbsensiResource($logAbsensi),
            'Attendance log record retrieved successfully'
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\LogAbsensi\UpdateLogAbsensiRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateLogAbsensiRequest $request, $id): JsonResponse
    {
        // Request sudah handle validation dan prepareForValidation
        $validated = $request->validated();

        $logAbsensi = $this->logAbsensiService->update($id, $validated);
        $logAbsensi->load('absensi.employee.user');

        return $this->success(
            new LogAbsensiResource($logAbsensi),
            'Attendance log record updated successfully'
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
        $this->logAbsensiService->delete($id);

        return $this->success(
            null,
            'Attendance log record deleted successfully'
        );
    }

    /**
     * Get log attendance records by absensi ID.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|int  $absensiId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byAbsensi(Request $request, $absensiId): JsonResponse
    {
        $query = $this->logAbsensiService->findByAbsensiId($absensiId);

        // Filter by jenis if provided
        if ($request->has('jenis')) {
            $query = $this->logAbsensiService->findByAbsensiIdAndJenis(
                $absensiId,
                $request->jenis
            );
        }

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query = $this->logAbsensiService->findByAbsensiIdAndDateRange(
                $absensiId,
                $request->start_date,
                $request->end_date
            );
        }

        $query = $query->load('absensi.employee.user');

        return $this->success(
            LogAbsensiResource::collection($query),
            'Attendance log records retrieved successfully'
        );
    }

    /**
     * Get check-in log for specific absensi.
     *
     * @param  string|int  $absensiId
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkInByAbsensi($absensiId): JsonResponse
    {
        $logAbsensi = $this->logAbsensiService->findCheckInByAbsensiId($absensiId);

        if (!$logAbsensi) {
            return $this->notFound('Check-in log not found for this attendance');
        }

        $logAbsensi->load('absensi.employee.user');

        return $this->success(
            new LogAbsensiResource($logAbsensi),
            'Check-in log retrieved successfully'
        );
    }

    /**
     * Get check-out log for specific absensi.
     *
     * @param  string|int  $absensiId
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkOutByAbsensi($absensiId): JsonResponse
    {
        $logAbsensi = $this->logAbsensiService->findCheckOutByAbsensiId($absensiId);

        if (!$logAbsensi) {
            return $this->notFound('Check-out log not found for this attendance');
        }

        $logAbsensi->load('absensi.employee.user');

        return $this->success(
            new LogAbsensiResource($logAbsensi),
            'Check-out log retrieved successfully'
        );
    }

    /**
     * Get check-in log attendance records.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkIn(Request $request): JsonResponse
    {
        $query = $this->logAbsensiService->findCheckIn();

        // Load relationship
        $query = $query->load('absensi.employee.user');

        return $this->success(
            LogAbsensiResource::collection($query),
            'Check-in log records retrieved successfully'
        );
    }

    /**
     * Get check-out log attendance records.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkOut(Request $request): JsonResponse
    {
        $query = $this->logAbsensiService->findCheckOut();

        // Load relationship
        $query = $query->load('absensi.employee.user');

        return $this->success(
            LogAbsensiResource::collection($query),
            'Check-out log records retrieved successfully'
        );
    }

    /**
     * Get validated GPS log attendance records.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validated(Request $request): JsonResponse
    {
        $query = $this->logAbsensiService->findValidated();

        // Load relationship
        $query = $query->load('absensi.employee.user');

        return $this->success(
            LogAbsensiResource::collection($query),
            'Validated GPS log records retrieved successfully'
        );
    }

    /**
     * Get unvalidated GPS log attendance records.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function unvalidated(Request $request): JsonResponse
    {
        $query = $this->logAbsensiService->findUnvalidated();

        // Load relationship
        $query = $query->load('absensi.employee.user');

        return $this->success(
            LogAbsensiResource::collection($query),
            'Unvalidated GPS log records retrieved successfully'
        );
    }
}



