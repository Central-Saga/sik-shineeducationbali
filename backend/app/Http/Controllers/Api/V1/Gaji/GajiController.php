<?php

namespace App\Http\Controllers\Api\V1\Gaji;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Resources\Api\V1\Gaji\GajiResource;
use App\Services\Contracts\GajiServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GajiController extends BaseApiController
{
    /**
     * The gaji service instance.
     *
     * @var \App\Services\Contracts\GajiServiceInterface
     */
    protected GajiServiceInterface $gajiService;

    /**
     * Create a new gaji controller instance.
     *
     * @param  \App\Services\Contracts\GajiServiceInterface  $gajiService
     */
    public function __construct(GajiServiceInterface $gajiService)
    {
        $this->gajiService = $gajiService;
    }

    /**
     * Generate gaji from rekap bulanan.
     *
     * @param  int|string  $rekapId
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateFromRekap($rekapId): JsonResponse
    {
        $gaji = $this->gajiService->generateGajiFromRekap($rekapId);

        return $this->success(
            new GajiResource($gaji),
            'Gaji generated successfully from rekap bulanan'
        );
    }

    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->has('periode')) {
            $query = $this->gajiService->findByPeriode($request->periode);
        } elseif ($request->has('karyawan_id')) {
            $query = $this->gajiService->findByKaryawanId($request->karyawan_id);
        } elseif ($request->has('status')) {
            $query = $this->gajiService->findByStatus($request->status);
        } else {
            $query = $this->gajiService->getAll();
        }

        // Eager load employee->user relationship
        $query->load('employee.user');

        return $this->success(
            GajiResource::collection($query),
            'Gaji records retrieved successfully'
        );
    }

    /**
     * Display the specified resource.
     *
     * @param  int|string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {
        $gaji = $this->gajiService->getById($id);
        $gaji->load(['employee.user', 'komponenGaji', 'pembayaranGaji']);

        // Get detail lembur if employee is tetap or kontrak
        $detailLembur = null;
        if ($gaji->employee && in_array($gaji->employee->kategori_karyawan, ['tetap', 'kontrak'])) {
            $detailLembur = $this->gajiService->getDetailLembur($id);
        }

        $resource = new GajiResource($gaji);
        $data = $resource->toArray(request());
        
        if ($detailLembur) {
            $data['detail_lembur'] = $detailLembur->map(function ($realisasiSesi) {
                return [
                    'id' => $realisasiSesi->id,
                    'tanggal' => $realisasiSesi->tanggal->format('Y-m-d'),
                    'sesi_kerja' => $realisasiSesi->sesiKerja ? [
                        'id' => $realisasiSesi->sesiKerja->id,
                        'mata_pelajaran' => $realisasiSesi->sesiKerja->mata_pelajaran,
                        'kategori' => $realisasiSesi->sesiKerja->kategori,
                        'tarif' => (float) $realisasiSesi->sesiKerja->tarif,
                    ] : null,
                ];
            });
        }

        return $this->success(
            $data,
            'Gaji retrieved successfully'
        );
    }

    /**
     * Update gaji status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int|string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:draft,disetujui,dibayar',
        ]);

        $gaji = $this->gajiService->updateStatus($id, $request->status);

        return $this->success(
            new GajiResource($gaji),
            'Gaji status updated successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'karyawan_id' => 'required|exists:karyawan,id',
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'hari_cuti' => 'nullable|integer|min:0',
            'potongan_cuti' => 'nullable|numeric|min:0',
            'total_gaji' => 'required|numeric|min:0',
            'status' => 'nullable|string|in:draft,disetujui,dibayar',
        ]);

        $data = $request->only([
            'karyawan_id',
            'periode',
            'hari_cuti',
            'potongan_cuti',
            'total_gaji',
            'status',
        ]);

        $data['status'] = $data['status'] ?? 'draft';
        $data['dibuat_oleh'] = auth()->id();

        $gaji = $this->gajiService->create($data);

        return $this->success(
            new GajiResource($gaji),
            'Gaji created successfully',
            201
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int|string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'hari_cuti' => 'nullable|integer|min:0',
            'potongan_cuti' => 'nullable|numeric|min:0',
            'total_gaji' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:draft,disetujui,dibayar',
        ]);

        $data = $request->only([
            'hari_cuti',
            'potongan_cuti',
            'total_gaji',
            'status',
        ]);

        $gaji = $this->gajiService->update($id, $data);

        return $this->success(
            new GajiResource($gaji),
            'Gaji updated successfully'
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int|string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $this->gajiService->delete($id);

        return $this->success(
            null,
            'Gaji deleted successfully'
        );
    }
}

