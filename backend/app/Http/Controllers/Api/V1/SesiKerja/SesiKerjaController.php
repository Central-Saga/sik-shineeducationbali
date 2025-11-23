<?php

namespace App\Http\Controllers\Api\V1\SesiKerja;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Requests\Api\V1\SesiKerja\StoreSesiKerjaRequest;
use App\Http\Requests\Api\V1\SesiKerja\UpdateSesiKerjaRequest;
use App\Http\Requests\Api\V1\SesiKerja\UpdateStatusSesiKerjaRequest;
use App\Http\Resources\Api\V1\SesiKerja\SesiKerjaResource;
use App\Services\Contracts\SesiKerjaServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SesiKerjaController extends BaseApiController
{
    /**
     * The sesi kerja service instance.
     *
     * @var \App\Services\Contracts\SesiKerjaServiceInterface
     */
    protected SesiKerjaServiceInterface $sesiKerjaService;

    /**
     * Create a new sesi kerja controller instance.
     *
     * @param  \App\Services\Contracts\SesiKerjaServiceInterface  $sesiKerjaService
     */
    public function __construct(SesiKerjaServiceInterface $sesiKerjaService)
    {
        $this->sesiKerjaService = $sesiKerjaService;
    }

    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Priority: kategori + hari > kategori > hari > status > all
        if ($request->has('kategori') && $request->has('hari')) {
            $query = $this->sesiKerjaService->findByKategoriHari(
                $request->kategori,
                $request->hari
            );
        } elseif ($request->has('kategori')) {
            $query = $this->sesiKerjaService->findByKategori($request->kategori);
        } elseif ($request->has('hari')) {
            $query = $this->sesiKerjaService->findByHari($request->hari);
        } elseif ($request->has('status')) {
            $query = $this->sesiKerjaService->findByStatus($request->status);
        } else {
            $query = $this->sesiKerjaService->getAll();
        }

        // Ensure $query is a collection
        if (!($query instanceof \Illuminate\Support\Collection)) {
            $query = collect([$query])->filter();
        }

        // Load relationship - include realisasi_sesi if requested
        $loadRelations = [];
        if ($request->has('include') && str_contains($request->include, 'realisasi_sesi')) {
            $loadRelations[] = 'realisasiSesi';
        }
        if (!empty($loadRelations)) {
            $query = $query->load($loadRelations);
        }

        return $this->success(
            SesiKerjaResource::collection($query),
            'Sesi kerja records retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\SesiKerja\StoreSesiKerjaRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreSesiKerjaRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $sesiKerja = $this->sesiKerjaService->create($validated);

        return $this->created(
            new SesiKerjaResource($sesiKerja),
            'Sesi kerja record created successfully'
        );
    }

    /**
     * Display the specified resource.
     *
     * @param  string|int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id): JsonResponse
    {
        $sesiKerja = $this->sesiKerjaService->getById($id);

        // Load relationship - include realisasi_sesi if requested
        if ($request->has('include') && str_contains($request->include, 'realisasi_sesi')) {
            $sesiKerja->load('realisasiSesi');
        }

        return $this->success(
            new SesiKerjaResource($sesiKerja),
            'Sesi kerja record retrieved successfully'
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\SesiKerja\UpdateSesiKerjaRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateSesiKerjaRequest $request, $id): JsonResponse
    {
        $validated = $request->validated();

        $sesiKerja = $this->sesiKerjaService->update($id, $validated);

        return $this->success(
            new SesiKerjaResource($sesiKerja),
            'Sesi kerja record updated successfully'
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
        $this->sesiKerjaService->delete($id);

        return $this->success(
            null,
            'Sesi kerja record deleted successfully'
        );
    }

    /**
     * Get sesi kerja records by kategori.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $kategori
     * @return \Illuminate\Http\JsonResponse
     */
    public function byKategori(Request $request, string $kategori): JsonResponse
    {
        $query = $this->sesiKerjaService->findByKategori($kategori);

        // Filter by hari if provided
        if ($request->has('hari')) {
            $query = $query->filter(function ($sesi) use ($request) {
                return $sesi->hari === $request->hari;
            });
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query = $query->filter(function ($sesi) use ($request) {
                return $sesi->status === $request->status;
            });
        }

        return $this->success(
            SesiKerjaResource::collection($query),
            'Sesi kerja records retrieved successfully'
        );
    }

    /**
     * Get sesi kerja records by hari.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $hari
     * @return \Illuminate\Http\JsonResponse
     */
    public function byHari(Request $request, string $hari): JsonResponse
    {
        $query = $this->sesiKerjaService->findByHari($hari);

        // Filter by kategori if provided
        if ($request->has('kategori')) {
            $query = $query->filter(function ($sesi) use ($request) {
                return $sesi->kategori === $request->kategori;
            });
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query = $query->filter(function ($sesi) use ($request) {
                return $sesi->status === $request->status;
            });
        }

        return $this->success(
            SesiKerjaResource::collection($query),
            'Sesi kerja records retrieved successfully'
        );
    }

    /**
     * Get sesi kerja records by kategori and hari.
     *
     * @param  string  $kategori
     * @param  string  $hari
     * @return \Illuminate\Http\JsonResponse
     */
    public function byKategoriHari(string $kategori, string $hari): JsonResponse
    {
        $query = $this->sesiKerjaService->findByKategoriHari($kategori, $hari);

        return $this->success(
            SesiKerjaResource::collection($query),
            'Sesi kerja records retrieved successfully'
        );
    }

    /**
     * Get active sesi kerja records.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function aktif(Request $request): JsonResponse
    {
        $query = $this->sesiKerjaService->findAktif();

        // Filter by kategori if provided
        if ($request->has('kategori')) {
            $query = $query->filter(function ($sesi) use ($request) {
                return $sesi->kategori === $request->kategori;
            });
        }

        // Filter by hari if provided
        if ($request->has('hari')) {
            $query = $query->filter(function ($sesi) use ($request) {
                return $sesi->hari === $request->hari;
            });
        }

        return $this->success(
            SesiKerjaResource::collection($query),
            'Active sesi kerja records retrieved successfully'
        );
    }

    /**
     * Update status of sesi kerja.
     *
     * @param  \App\Http\Requests\Api\V1\SesiKerja\UpdateStatusSesiKerjaRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(UpdateStatusSesiKerjaRequest $request, string|int $id): JsonResponse
    {
        $sesiKerja = $this->sesiKerjaService->updateStatus($id, $request->status);

        return $this->success(
            new SesiKerjaResource($sesiKerja),
            'Sesi kerja status updated successfully'
        );
    }
}
