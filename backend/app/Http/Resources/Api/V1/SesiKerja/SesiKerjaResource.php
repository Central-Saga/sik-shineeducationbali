<?php

namespace App\Http\Resources\Api\V1\SesiKerja;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SesiKerjaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kategori' => $this->kategori,
            'mata_pelajaran' => $this->mata_pelajaran,
            'hari' => $this->hari,
            'nomor_sesi' => $this->nomor_sesi,
            'jam_mulai' => $this->when(
                $this->jam_mulai !== null,
                fn() => $this->jam_mulai->format('H:i:s'),
                null
            ),
            'jam_selesai' => $this->when(
                $this->jam_selesai !== null,
                fn() => $this->jam_selesai->format('H:i:s'),
                null
            ),
            'tarif' => $this->tarif ? (float) $this->tarif : null,
            'status' => $this->status,
            'realisasi_sesi' => $this->whenLoaded('realisasiSesi', function () {
                return $this->realisasiSesi->map(function ($realisasi) {
                    return [
                        'id' => $realisasi->id,
                        'karyawan_id' => $realisasi->karyawan_id,
                        'tanggal' => $realisasi->tanggal?->format('Y-m-d'),
                        'status' => $realisasi->status,
                        'sumber' => $realisasi->sumber,
                    ];
                });
            }),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
