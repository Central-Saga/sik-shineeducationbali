<?php

namespace App\Http\Resources\Api\V1\Employee;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
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
            'kode_karyawan' => $this->kode_karyawan,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'roles' => $this->whenLoaded('user.roles', function () {
                        return $this->user->roles->pluck('name')->toArray();
                    }, []),
                ];
            }),
            'kategori_karyawan' => $this->kategori_karyawan,
            'subtipe_kontrak' => $this->subtipe_kontrak,
            'tipe_gaji' => $this->tipe_gaji,
            'gaji_pokok' => $this->when(
                $this->gaji_pokok !== null,
                fn() => (float) $this->gaji_pokok,
                null
            ),
            'bank_nama' => $this->bank_nama,
            'bank_no_rekening' => $this->bank_no_rekening,
            'nomor_hp' => $this->nomor_hp,
            'alamat' => $this->alamat,
            'tanggal_lahir' => $this->when(
                $this->tanggal_lahir !== null,
                fn() => $this->tanggal_lahir->format('Y-m-d'),
                null
            ),
            'status' => $this->status,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}


