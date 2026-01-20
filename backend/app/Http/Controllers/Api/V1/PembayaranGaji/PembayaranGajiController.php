<?php

namespace App\Http\Controllers\Api\V1\PembayaranGaji;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Resources\Api\V1\PembayaranGaji\PembayaranGajiResource;
use App\Services\Contracts\PembayaranGajiServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PembayaranGajiController extends BaseApiController
{
    /**
     * The pembayaran gaji service instance.
     *
     * @var \App\Services\Contracts\PembayaranGajiServiceInterface
     */
    protected PembayaranGajiServiceInterface $pembayaranGajiService;

    /**
     * Create a new pembayaran gaji controller instance.
     *
     * @param  \App\Services\Contracts\PembayaranGajiServiceInterface  $pembayaranGajiService
     */
    public function __construct(PembayaranGajiServiceInterface $pembayaranGajiService)
    {
        $this->pembayaranGajiService = $pembayaranGajiService;
    }

    /**
     * Display a listing of pembayaran gaji for a specific gaji.
     *
     * @param  int|string  $gajiId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($gajiId): JsonResponse
    {
        $pembayaranGajiList = $this->pembayaranGajiService->findByGajiId($gajiId);

        return $this->success(
            PembayaranGajiResource::collection($pembayaranGajiList),
            'Pembayaran gaji records retrieved successfully'
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
            'tanggal_transfer' => 'required|date',
            'bukti_transfer' => 'nullable|string|max:255',
            'status_pembayaran' => 'nullable|string|in:menunggu,berhasil,gagal',
            'catatan' => 'nullable|string',
        ]);

        // Check if gaji exists and has status 'disetujui'
        $gaji = \App\Models\Gaji::findOrFail($gajiId);
        if ($gaji->status !== 'disetujui') {
            return $this->error(
                'Pembayaran gaji hanya dapat ditambahkan jika status gaji sudah disetujui.',
                422
            );
        }

        $data = $request->only([
            'tanggal_transfer',
            'bukti_transfer',
            'status_pembayaran',
            'catatan',
        ]);
        $data['gaji_id'] = $gajiId;
        $data['status_pembayaran'] = $data['status_pembayaran'] ?? 'menunggu';

        // If status is berhasil, set disetujui_oleh
        if ($data['status_pembayaran'] === 'berhasil') {
            $data['disetujui_oleh'] = auth()->id();
        }

        $pembayaranGaji = $this->pembayaranGajiService->create($data);

        return $this->success(
            new PembayaranGajiResource($pembayaranGaji),
            'Pembayaran gaji created successfully',
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
        $pembayaranGaji = $this->pembayaranGajiService->getById($id);

        return $this->success(
            new PembayaranGajiResource($pembayaranGaji),
            'Pembayaran gaji retrieved successfully'
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
            'tanggal_transfer' => 'nullable|date',
            'bukti_transfer' => 'nullable|string|max:255',
            'status_pembayaran' => 'nullable|string|in:menunggu,berhasil,gagal',
            'catatan' => 'nullable|string',
        ]);

        $data = $request->only([
            'tanggal_transfer',
            'bukti_transfer',
            'status_pembayaran',
            'catatan',
        ]);

        // If status is being updated to berhasil, set disetujui_oleh
        if (isset($data['status_pembayaran']) && $data['status_pembayaran'] === 'berhasil') {
            $data['disetujui_oleh'] = auth()->id();
        }

        $pembayaranGaji = $this->pembayaranGajiService->update($id, $data);

        return $this->success(
            new PembayaranGajiResource($pembayaranGaji),
            'Pembayaran gaji updated successfully'
        );
    }

    /**
     * Update pembayaran gaji status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int|string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:menunggu,berhasil,gagal',
        ]);

        $pembayaranGaji = $this->pembayaranGajiService->updateStatusPembayaran($id, $request->status);

        return $this->success(
            new PembayaranGajiResource($pembayaranGaji),
            'Pembayaran gaji status updated successfully'
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
        $this->pembayaranGajiService->delete($id);

        return $this->success(
            null,
            'Pembayaran gaji deleted successfully'
        );
    }
}

