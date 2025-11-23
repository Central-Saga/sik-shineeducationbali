<?php

namespace App\Http\Controllers\Api\V1\RekapBulanan;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Resources\Api\V1\RekapBulanan\RekapBulananResource;
use App\Services\Contracts\RekapBulananServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RekapBulananController extends BaseApiController
{
    /**
     * The rekap bulanan service instance.
     *
     * @var \App\Services\Contracts\RekapBulananServiceInterface
     */
    protected RekapBulananServiceInterface $rekapBulananService;

    /**
     * Create a new rekap bulanan controller instance.
     *
     * @param  \App\Services\Contracts\RekapBulananServiceInterface  $rekapBulananService
     */
    public function __construct(RekapBulananServiceInterface $rekapBulananService)
    {
        $this->rekapBulananService = $rekapBulananService;
    }

    /**
     * Generate rekap bulanan for a given periode.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        $rekapBulananList = $this->rekapBulananService->generateRekapBulanan($request->periode);

        return $this->success(
            RekapBulananResource::collection($rekapBulananList),
            'Rekap bulanan generated successfully'
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
            $query = $this->rekapBulananService->findByPeriode($request->periode);
        } elseif ($request->has('karyawan_id')) {
            $query = $this->rekapBulananService->findByKaryawanId($request->karyawan_id);
        } else {
            $query = $this->rekapBulananService->getAll();
        }

        return $this->success(
            RekapBulananResource::collection($query),
            'Rekap bulanan records retrieved successfully'
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
        $rekapBulanan = $this->rekapBulananService->getById($id);

        return $this->success(
            new RekapBulananResource($rekapBulanan),
            'Rekap bulanan retrieved successfully'
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
        $this->rekapBulananService->delete($id);

        return $this->success(
            null,
            'Rekap bulanan deleted successfully'
        );
    }
}

