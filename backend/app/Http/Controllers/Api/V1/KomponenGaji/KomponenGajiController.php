<?php

namespace App\Http\Controllers\Api\V1\KomponenGaji;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Resources\Api\V1\KomponenGaji\KomponenGajiResource;
use App\Services\Contracts\KomponenGajiServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KomponenGajiController extends BaseApiController
{
    /**
     * The komponen gaji service instance.
     *
     * @var \App\Services\Contracts\KomponenGajiServiceInterface
     */
    protected KomponenGajiServiceInterface $komponenGajiService;

    /**
     * Create a new komponen gaji controller instance.
     *
     * @param  \App\Services\Contracts\KomponenGajiServiceInterface  $komponenGajiService
     */
    public function __construct(KomponenGajiServiceInterface $komponenGajiService)
    {
        $this->komponenGajiService = $komponenGajiService;
    }

    /**
     * Display a listing of komponen gaji for a specific gaji.
     *
     * @param  int|string  $gajiId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($gajiId): JsonResponse
    {
        $komponenGajiList = $this->komponenGajiService->findByGajiId($gajiId);

        return $this->success(
            KomponenGajiResource::collection($komponenGajiList),
            'Komponen gaji records retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int|string  $gajiId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $gajiId): JsonResponse
    {
        $request->validate([
            'jenis' => 'required|string|in:gaji_pokok,pendapatan_sesi,lembur_sesi,potongan,bonus',
            'nama_komponen' => 'required|string|max:100',
            'nominal' => 'required|numeric',
        ]);

        $data = $request->only(['jenis', 'nama_komponen', 'nominal']);
        $data['gaji_id'] = $gajiId;

        $komponenGaji = $this->komponenGajiService->create($data);

        return $this->success(
            new KomponenGajiResource($komponenGaji),
            'Komponen gaji created successfully',
            201
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
        $komponenGaji = $this->komponenGajiService->getById($id);

        return $this->success(
            new KomponenGajiResource($komponenGaji),
            'Komponen gaji retrieved successfully'
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
            'jenis' => 'nullable|string|in:gaji_pokok,pendapatan_sesi,lembur_sesi,potongan,bonus',
            'nama_komponen' => 'nullable|string|max:100',
            'nominal' => 'nullable|numeric',
        ]);

        $data = $request->only(['jenis', 'nama_komponen', 'nominal']);

        $komponenGaji = $this->komponenGajiService->update($id, $data);

        return $this->success(
            new KomponenGajiResource($komponenGaji),
            'Komponen gaji updated successfully'
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
        $this->komponenGajiService->delete($id);

        return $this->success(
            null,
            'Komponen gaji deleted successfully'
        );
    }
}

