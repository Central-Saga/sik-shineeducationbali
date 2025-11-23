<?php

namespace App\Http\Controllers\Api\V1\RealisasiSesi;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Requests\Api\V1\RealisasiSesi\ApproveRealisasiSesiRequest;
use App\Http\Requests\Api\V1\RealisasiSesi\RejectRealisasiSesiRequest;
use App\Http\Requests\Api\V1\RealisasiSesi\StoreRealisasiSesiRequest;
use App\Http\Requests\Api\V1\RealisasiSesi\UpdateRealisasiSesiRequest;
use App\Http\Resources\Api\V1\RealisasiSesi\RealisasiSesiResource;
use App\Services\Contracts\RealisasiSesiServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RealisasiSesiController extends BaseApiController
{
    /**
     * The realisasi sesi service instance.
     *
     * @var \App\Services\Contracts\RealisasiSesiServiceInterface
     */
    protected RealisasiSesiServiceInterface $realisasiSesiService;

    /**
     * Create a new realisasi sesi controller instance.
     *
     * @param  \App\Services\Contracts\RealisasiSesiServiceInterface  $realisasiSesiService
     */
    public function __construct(RealisasiSesiServiceInterface $realisasiSesiService)
    {
        $this->realisasiSesiService = $realisasiSesiService;
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
                    RealisasiSesiResource::collection(collect([])),
                    'Realisasi sesi records retrieved successfully'
                );
            }
            
            // Force filter by karyawan_id for karyawan
            $karyawanId = $employee->id;
            
            // Priority: date range > tanggal > status > sumber > all (for karyawan)
            if ($request->has('start_date') && $request->has('end_date')) {
                $query = $this->realisasiSesiService->findByKaryawanIdAndDateRange(
                    $karyawanId,
                    $request->start_date,
                    $request->end_date
                );
            } elseif ($request->has('tanggal')) {
                $query = $this->realisasiSesiService->findByKaryawanIdAndTanggal($karyawanId, $request->tanggal);
                $query = $query ? collect([$query]) : collect([]);
            } elseif ($request->has('status')) {
                $query = $this->realisasiSesiService->findByKaryawanId($karyawanId)
                    ->filter(function ($realisasi) use ($request) {
                        return $realisasi->status === $request->status;
                    });
            } elseif ($request->has('sumber')) {
                $query = $this->realisasiSesiService->findByKaryawanId($karyawanId)
                    ->filter(function ($realisasi) use ($request) {
                        return $realisasi->sumber === $request->sumber;
                    });
            } else {
                $query = $this->realisasiSesiService->findByKaryawanId($karyawanId);
            }
        } else {
            // For Owner and Admin, allow all filters
            // Priority: date range > tanggal > karyawan_id + status/sumber > status > sumber > karyawan_id > all
            
            if ($request->has('start_date') && $request->has('end_date')) {
                if ($request->has('karyawan_id')) {
                    $query = $this->realisasiSesiService->findByKaryawanIdAndDateRange(
                        $request->karyawan_id,
                        $request->start_date,
                        $request->end_date
                    );
                } else {
                    $query = $this->realisasiSesiService->getAll()
                        ->filter(function ($realisasi) use ($request) {
                            return $realisasi->tanggal >= $request->start_date && 
                                   $realisasi->tanggal <= $request->end_date;
                        });
                }
            } elseif ($request->has('tanggal')) {
                $query = $this->realisasiSesiService->findByTanggal($request->tanggal);
            } elseif ($request->has('karyawan_id') && $request->has('status')) {
                $query = $this->realisasiSesiService->findByKaryawanId($request->karyawan_id)
                    ->filter(function ($realisasi) use ($request) {
                        return $realisasi->status === $request->status;
                    });
            } elseif ($request->has('karyawan_id') && $request->has('sumber')) {
                $query = $this->realisasiSesiService->findByKaryawanId($request->karyawan_id)
                    ->filter(function ($realisasi) use ($request) {
                        return $realisasi->sumber === $request->sumber;
                    });
            } elseif ($request->has('status')) {
                $query = $this->realisasiSesiService->findByStatus($request->status);
            } elseif ($request->has('sumber')) {
                $query = $this->realisasiSesiService->findBySumber($request->sumber);
            } elseif ($request->has('karyawan_id')) {
                $query = $this->realisasiSesiService->findByKaryawanId($request->karyawan_id);
            } elseif ($request->has('sesi_kerja_id')) {
                $query = $this->realisasiSesiService->findBySesiKerjaId($request->sesi_kerja_id);
            } else {
                $query = $this->realisasiSesiService->getAll();
            }
        }

        // Ensure $query is a collection
        if (!($query instanceof \Illuminate\Support\Collection)) {
            $query = collect([$query])->filter();
        }

        // Load relationships
        $loadRelations = ['employee.user', 'sesiKerja'];
        if ($request->has('include') && str_contains($request->include, 'approved_by')) {
            $loadRelations[] = 'approvedBy';
        }
        $query = $query->load($loadRelations);

        return $this->success(
            RealisasiSesiResource::collection($query),
            'Realisasi sesi records retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\RealisasiSesi\StoreRealisasiSesiRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreRealisasiSesiRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $realisasiSesi = $this->realisasiSesiService->create($validated);
        $realisasiSesi->load(['employee.user', 'sesiKerja']);

        return $this->created(
            new RealisasiSesiResource($realisasiSesi),
            'Realisasi sesi record created successfully'
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
        $realisasiSesi = $this->realisasiSesiService->getById($id);
        
        // For karyawan, check if they can access this realisasi sesi
        $user = $request->user();
        if ($user && $user->hasRole('Karyawan')) {
            $employee = $user->employee;
            if (!$employee || $realisasiSesi->karyawan_id !== $employee->id) {
                return $this->forbidden('You do not have permission to access this realisasi sesi record.');
            }
        }
        
        $realisasiSesi->load(['employee.user', 'sesiKerja', 'approvedBy']);

        return $this->success(
            new RealisasiSesiResource($realisasiSesi),
            'Realisasi sesi record retrieved successfully'
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\RealisasiSesi\UpdateRealisasiSesiRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateRealisasiSesiRequest $request, $id): JsonResponse
    {
        $validated = $request->validated();

        $realisasiSesi = $this->realisasiSesiService->update($id, $validated);
        $realisasiSesi->load(['employee.user', 'sesiKerja', 'approvedBy']);

        return $this->success(
            new RealisasiSesiResource($realisasiSesi),
            'Realisasi sesi record updated successfully'
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
        $this->realisasiSesiService->delete($id);

        return $this->success(
            null,
            'Realisasi sesi record deleted successfully'
        );
    }

    /**
     * Get realisasi sesi records by karyawan ID.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|int  $karyawanId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byKaryawan(Request $request, $karyawanId): JsonResponse
    {
        $query = $this->realisasiSesiService->findByKaryawanId($karyawanId);

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query = $this->realisasiSesiService->findByKaryawanIdAndDateRange(
                $karyawanId,
                $request->start_date,
                $request->end_date
            );
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query = $query->filter(function ($realisasi) use ($request) {
                return $realisasi->status === $request->status;
            });
        }

        // Filter by sumber if provided
        if ($request->has('sumber')) {
            $query = $query->filter(function ($realisasi) use ($request) {
                return $realisasi->sumber === $request->sumber;
            });
        }

        $query = $query->load(['employee.user', 'sesiKerja', 'approvedBy']);

        return $this->success(
            RealisasiSesiResource::collection($query),
            'Realisasi sesi records retrieved successfully'
        );
    }

    /**
     * Get realisasi sesi records by sesi kerja ID.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|int  $sesiKerjaId
     * @return \Illuminate\Http\JsonResponse
     */
    public function bySesiKerja(Request $request, $sesiKerjaId): JsonResponse
    {
        $query = $this->realisasiSesiService->findBySesiKerjaId($sesiKerjaId);

        // Filter by status if provided
        if ($request->has('status')) {
            $query = $query->filter(function ($realisasi) use ($request) {
                return $realisasi->status === $request->status;
            });
        }

        $query = $query->load(['employee.user', 'sesiKerja', 'approvedBy']);

        return $this->success(
            RealisasiSesiResource::collection($query),
            'Realisasi sesi records retrieved successfully'
        );
    }

    /**
     * Get realisasi sesi records by tanggal.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $tanggal
     * @return \Illuminate\Http\JsonResponse
     */
    public function byTanggal(Request $request, string $tanggal): JsonResponse
    {
        $query = $this->realisasiSesiService->findByTanggal($tanggal);

        // Filter by status if provided
        if ($request->has('status')) {
            $query = $query->filter(function ($realisasi) use ($request) {
                return $realisasi->status === $request->status;
            });
        }

        $query = $query->load(['employee.user', 'sesiKerja', 'approvedBy']);

        return $this->success(
            RealisasiSesiResource::collection($query),
            'Realisasi sesi records retrieved successfully'
        );
    }

    /**
     * Get realisasi sesi records by status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $status
     * @return \Illuminate\Http\JsonResponse
     */
    public function byStatus(Request $request, string $status): JsonResponse
    {
        $query = $this->realisasiSesiService->findByStatus($status);

        // Filter by tanggal if provided
        if ($request->has('tanggal')) {
            $query = $query->filter(function ($realisasi) use ($request) {
                return $realisasi->tanggal->format('Y-m-d') === $request->tanggal;
            });
        }

        $query = $query->load(['employee.user', 'sesiKerja', 'approvedBy']);

        return $this->success(
            RealisasiSesiResource::collection($query),
            'Realisasi sesi records retrieved successfully'
        );
    }

    /**
     * Get realisasi sesi records by sumber.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $sumber
     * @return \Illuminate\Http\JsonResponse
     */
    public function bySumber(Request $request, string $sumber): JsonResponse
    {
        $query = $this->realisasiSesiService->findBySumber($sumber);

        // Filter by status if provided
        if ($request->has('status')) {
            $query = $query->filter(function ($realisasi) use ($request) {
                return $realisasi->status === $request->status;
            });
        }

        $query = $query->load(['employee.user', 'sesiKerja', 'approvedBy']);

        return $this->success(
            RealisasiSesiResource::collection($query),
            'Realisasi sesi records retrieved successfully'
        );
    }

    /**
     * Approve a realisasi sesi record.
     *
     * @param  \App\Http\Requests\Api\V1\RealisasiSesi\ApproveRealisasiSesiRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function approve(ApproveRealisasiSesiRequest $request, $id): JsonResponse
    {
        $validated = $request->validated();
        $catatan = $validated['catatan'] ?? null;

        $realisasiSesi = $this->realisasiSesiService->approve($id, $catatan);
        $realisasiSesi->load(['employee.user', 'sesiKerja', 'approvedBy']);

        return $this->success(
            new RealisasiSesiResource($realisasiSesi),
            'Realisasi sesi approved successfully'
        );
    }

    /**
     * Reject a realisasi sesi record.
     *
     * @param  \App\Http\Requests\Api\V1\RealisasiSesi\RejectRealisasiSesiRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function reject(RejectRealisasiSesiRequest $request, $id): JsonResponse
    {
        $validated = $request->validated();
        $catatan = $validated['catatan'];

        $realisasiSesi = $this->realisasiSesiService->reject($id, $catatan);
        $realisasiSesi->load(['employee.user', 'sesiKerja', 'approvedBy']);

        return $this->success(
            new RealisasiSesiResource($realisasiSesi),
            'Realisasi sesi rejected successfully'
        );
    }
}
