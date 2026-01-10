<?php

namespace App\Http\Controllers\Api\V1\Cuti;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Requests\Api\V1\Cuti\StoreCutiRequest;
use App\Http\Requests\Api\V1\Cuti\UpdateCutiRequest;
use App\Http\Resources\Api\V1\Cuti\CutiResource;
use App\Services\Contracts\CutiServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CutiController extends BaseApiController
{
    /**
     * The cuti service instance.
     *
     * @var \App\Services\Contracts\CutiServiceInterface
     */
    protected CutiServiceInterface $cutiService;

    /**
     * Create a new cuti controller instance.
     *
     * @param  \App\Services\Contracts\CutiServiceInterface  $cutiService
     */
    public function __construct(CutiServiceInterface $cutiService)
    {
        $this->cutiService = $cutiService;
    }

    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // For karyawan role, filter by their employee_id
        if ($user && $user->hasRole('Karyawan')) {
            $employee = $user->employee;
            if (!$employee) {
                return $this->success(
                    CutiResource::collection(collect([])),
                    'Leave requests retrieved successfully'
                );
            }
            
            // Force filter by karyawan_id for karyawan
            $karyawanId = $employee->id;
            
            // Priority: date range > tanggal > jenis > status > all (for karyawan)
            if ($request->has('start_date') && $request->has('end_date')) {
                $query = $this->cutiService->findByKaryawanIdAndDateRange(
                    $karyawanId,
                    $request->start_date,
                    $request->end_date
                );
            }
            // Filter by tanggal if provided
            elseif ($request->has('tanggal')) {
                $query = $this->cutiService->findByKaryawanIdAndTanggal($karyawanId, $request->tanggal);
                $query = $query ? collect([$query]) : collect([]);
            }
            // Filter by jenis if provided
            elseif ($request->has('jenis')) {
                $query = $this->cutiService->findByKaryawanIdAndJenis(
                    $karyawanId,
                    $request->jenis
                );
            }
            // Filter by status if provided
            elseif ($request->has('status')) {
                $query = $this->cutiService->findByKaryawanIdAndStatus(
                    $karyawanId,
                    $request->status
                );
            }
            // Get all for this karyawan
            else {
                $query = $this->cutiService->findByKaryawanId($karyawanId);
            }
        }
        // For Owner and Admin, allow all filters
        else {
            // Priority: date range > tanggal > karyawan_id + jenis/status > jenis > status > karyawan_id > all
            
            // Filter by date range if provided (highest priority)
            if ($request->has('start_date') && $request->has('end_date')) {
                if ($request->has('karyawan_id')) {
                    $query = $this->cutiService->findByKaryawanIdAndDateRange(
                        $request->karyawan_id,
                        $request->start_date,
                        $request->end_date
                    );
                } else {
                    $query = $this->cutiService->findByDateRange(
                        $request->start_date,
                        $request->end_date
                    );
                }
            }
            // Filter by tanggal if provided
            elseif ($request->has('tanggal')) {
                $query = $this->cutiService->findByTanggal($request->tanggal);
            }
            // Filter by karyawan_id and jenis if both provided
            elseif ($request->has('karyawan_id') && $request->has('jenis')) {
                $query = $this->cutiService->findByKaryawanIdAndJenis(
                    $request->karyawan_id,
                    $request->jenis
                );
            }
            // Filter by karyawan_id and status if both provided
            elseif ($request->has('karyawan_id') && $request->has('status')) {
                $query = $this->cutiService->findByKaryawanIdAndStatus(
                    $request->karyawan_id,
                    $request->status
                );
            }
            // Filter by jenis if provided
            elseif ($request->has('jenis')) {
                $query = $this->cutiService->findByJenis($request->jenis);
            }
            // Filter by status if provided
            elseif ($request->has('status')) {
                $query = $this->cutiService->findByStatus($request->status);
            }
            // Filter by karyawan_id if provided
            elseif ($request->has('karyawan_id')) {
                $query = $this->cutiService->findByKaryawanId($request->karyawan_id);
            }
            // Get all if no filters
            else {
                $query = $this->cutiService->getAll();
            }
        }

        // Ensure $query is a collection
        if (!($query instanceof \Illuminate\Support\Collection)) {
            $query = collect([$query])->filter();
        }

        // Load relationships
        $loadRelations = ['employee.user'];
        if ($request->has('include') && str_contains($request->include, 'approved_by')) {
            $loadRelations[] = 'approvedBy';
        }
        $query = $query->load($loadRelations);

        return $this->success(
            CutiResource::collection($query),
            'Leave requests retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\Cuti\StoreCutiRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreCutiRequest $request): JsonResponse
    {
        // Request sudah handle validation dan prepareForValidation
        $validated = $request->validated();

        $cuti = $this->cutiService->create($validated);
        $cuti->load('employee.user');

        return $this->created(
            new CutiResource($cuti),
            'Leave request created successfully'
        );
    }

    /**
     * Display the specified resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id): JsonResponse
    {
        $cuti = $this->cutiService->getById($id);
        
        // For karyawan, check if they can access this cuti
        $user = $request->user();
        if ($user && $user->hasRole('Karyawan')) {
            $employee = $user->employee;
            if (!$employee || $cuti->karyawan_id !== $employee->id) {
                return $this->forbidden('You do not have permission to access this leave request.');
            }
        }
        
        $cuti->load(['employee.user', 'approvedBy']);

        return $this->success(
            new CutiResource($cuti),
            'Leave request retrieved successfully'
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\Cuti\UpdateCutiRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateCutiRequest $request, $id): JsonResponse
    {
        // Request sudah handle validation dan prepareForValidation
        $validated = $request->validated();

        $cuti = $this->cutiService->update($id, $validated);
        $cuti->load(['employee.user', 'approvedBy']);

        return $this->success(
            new CutiResource($cuti),
            'Leave request updated successfully'
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
        $this->cutiService->delete($id);

        return $this->success(
            null,
            'Leave request deleted successfully'
        );
    }

    /**
     * Get leave requests by employee ID.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|int  $karyawanId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byKaryawan(Request $request, $karyawanId): JsonResponse
    {
        $query = $this->cutiService->findByKaryawanId($karyawanId);

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query = $this->cutiService->findByKaryawanIdAndDateRange(
                $karyawanId,
                $request->start_date,
                $request->end_date
            );
        }

        // Filter by jenis if provided
        if ($request->has('jenis')) {
            $query = $this->cutiService->findByKaryawanIdAndJenis(
                $karyawanId,
                $request->jenis
            );
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query = $this->cutiService->findByKaryawanIdAndStatus(
                $karyawanId,
                $request->status
            );
        }

        $query = $query->load(['employee.user', 'approvedBy']);

        return $this->success(
            CutiResource::collection($query),
            'Leave requests retrieved successfully'
        );
    }

    /**
     * Get leave request by employee ID and date.
     *
     * @param  string|int  $karyawanId
     * @param  string  $tanggal
     * @return \Illuminate\Http\JsonResponse
     */
    public function byKaryawanAndTanggal($karyawanId, $tanggal): JsonResponse
    {
        $cuti = $this->cutiService->findByKaryawanIdAndTanggal($karyawanId, $tanggal);

        if (!$cuti) {
            return $this->notFound('Leave request not found for this employee on this date');
        }

        $cuti->load(['employee.user', 'approvedBy']);

        return $this->success(
            new CutiResource($cuti),
            'Leave request retrieved successfully'
        );
    }

    /**
     * Get leave requests by jenis.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $jenis
     * @return \Illuminate\Http\JsonResponse
     */
    public function byJenis(Request $request, $jenis): JsonResponse
    {
        $query = $this->cutiService->findByJenis($jenis);

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query = $query->filter(function ($cuti) use ($request) {
                return $cuti->tanggal >= $request->start_date && $cuti->tanggal <= $request->end_date;
            });
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query = $query->filter(function ($cuti) use ($request) {
                return $cuti->status === $request->status;
            });
        }

        $query = $query->load(['employee.user', 'approvedBy']);

        return $this->success(
            CutiResource::collection($query),
            'Leave requests retrieved successfully'
        );
    }

    /**
     * Get leave requests by status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $status
     * @return \Illuminate\Http\JsonResponse
     */
    public function byStatus(Request $request, $status): JsonResponse
    {
        $query = $this->cutiService->findByStatus($status);

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query = $query->filter(function ($cuti) use ($request) {
                return $cuti->tanggal >= $request->start_date && $cuti->tanggal <= $request->end_date;
            });
        }

        // Filter by jenis if provided
        if ($request->has('jenis')) {
            $query = $query->filter(function ($cuti) use ($request) {
                return $cuti->jenis === $request->jenis;
            });
        }

        $query = $query->load(['employee.user', 'approvedBy']);

        return $this->success(
            CutiResource::collection($query),
            'Leave requests retrieved successfully'
        );
    }
}

