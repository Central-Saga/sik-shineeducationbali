<?php

namespace App\Http\Resources\Api\V1\RekapBulanan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RekapBulananResource extends JsonResource
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
            'jumlah_hadir' => $this->jumlah_hadir,
            'jumlah_izin' => $this->jumlah_izin,
            'jumlah_sakit' => $this->jumlah_sakit,
            'jumlah_cuti' => $this->jumlah_cuti,
            'jumlah_alfa' => $this->jumlah_alfa,
            'jumlah_sesi_coding' => $this->jumlah_sesi_coding,
            'jumlah_sesi_non_coding' => $this->jumlah_sesi_non_coding,
            'nilai_sesi_coding' => $this->nilai_sesi_coding ? (float) $this->nilai_sesi_coding : 0,
            'nilai_sesi_non_coding' => $this->nilai_sesi_non_coding ? (float) $this->nilai_sesi_non_coding : 0,
            'total_pendapatan_sesi' => $this->total_pendapatan_sesi ? (float) $this->total_pendapatan_sesi : 0,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}

