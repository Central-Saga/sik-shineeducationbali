<?php

namespace App\Http\Resources\Api\V1\Cuti;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CutiResource extends JsonResource
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
            'tanggal' => $this->when(
                $this->tanggal !== null,
                fn() => $this->tanggal->format('Y-m-d'),
                null
            ),
            'jenis' => $this->jenis,
            'status' => $this->status,
            'disetujui_oleh' => $this->disetujui_oleh,
            'approved_by' => $this->whenLoaded('approvedBy', function () {
                return [
                    'id' => $this->approvedBy->id,
                    'name' => $this->approvedBy->name,
                    'email' => $this->approvedBy->email,
                ];
            }),
            'catatan' => $this->catatan,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}

