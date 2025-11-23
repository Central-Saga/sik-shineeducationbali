<?php

namespace App\Http\Resources\Api\V1\KomponenGaji;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KomponenGajiResource extends JsonResource
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
            'jenis' => $this->jenis,
            'nama_komponen' => $this->nama_komponen,
            'nominal' => $this->nominal ? (float) $this->nominal : 0,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}

