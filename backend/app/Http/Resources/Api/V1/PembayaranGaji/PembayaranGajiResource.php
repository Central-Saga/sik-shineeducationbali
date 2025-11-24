<?php

namespace App\Http\Resources\Api\V1\PembayaranGaji;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PembayaranGajiResource extends JsonResource
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
            'gaji_id' => $this->gaji_id,
            'gaji' => $this->whenLoaded('gaji', function () {
                return [
                    'id' => $this->gaji->id,
                    'periode' => $this->gaji->periode,
                    'total_gaji' => $this->gaji->total_gaji ? (float) $this->gaji->total_gaji : 0,
                    'status' => $this->gaji->status,
                ];
            }),
            'tanggal_transfer' => $this->tanggal_transfer?->format('Y-m-d'),
            'bukti_transfer' => $this->bukti_transfer,
            'status_pembayaran' => $this->status_pembayaran,
            'disetujui_oleh' => $this->disetujui_oleh,
            'disetujuiOleh' => $this->whenLoaded('disetujuiOleh', function () {
                return [
                    'id' => $this->disetujuiOleh->id,
                    'name' => $this->disetujuiOleh->name,
                    'email' => $this->disetujuiOleh->email,
                ];
            }),
            'catatan' => $this->catatan,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}

