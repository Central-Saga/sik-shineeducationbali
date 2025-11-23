<?php

namespace App\Http\Resources\Api\V1\Gaji;

use App\Http\Resources\Api\V1\KomponenGaji\KomponenGajiResource;
use App\Http\Resources\Api\V1\PembayaranGaji\PembayaranGajiResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GajiResource extends JsonResource
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
            'karyawan_id' => $this->karyawan_id,
            'employee' => $this->whenLoaded('employee', function () {
                return [
                    'id' => $this->employee->id,
                    'kode_karyawan' => $this->employee->kode_karyawan,
                    'user' => $this->when(
                        $this->employee->relationLoaded('user'),
                        function () {
                            return [
                                'id' => $this->employee->user->id,
                                'name' => $this->employee->user->name,
                                'email' => $this->employee->user->email,
                            ];
                        }
                    ),
                ];
            }),
            'periode' => $this->periode,
            'hari_cuti' => $this->hari_cuti,
            'potongan_cuti' => $this->potongan_cuti ? (float) $this->potongan_cuti : 0,
            'total_gaji' => $this->total_gaji ? (float) $this->total_gaji : 0,
            'status' => $this->status,
            'dibuat_oleh' => $this->dibuat_oleh,
            'dibuatOleh' => $this->whenLoaded('dibuatOleh', function () {
                return [
                    'id' => $this->dibuatOleh->id,
                    'name' => $this->dibuatOleh->name,
                    'email' => $this->dibuatOleh->email,
                ];
            }),
            'komponen_gaji' => $this->whenLoaded('komponenGaji', function () {
                return KomponenGajiResource::collection($this->komponenGaji);
            }),
            'pembayaran_gaji' => $this->whenLoaded('pembayaranGaji', function () {
                return PembayaranGajiResource::collection($this->pembayaranGaji);
            }),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}

