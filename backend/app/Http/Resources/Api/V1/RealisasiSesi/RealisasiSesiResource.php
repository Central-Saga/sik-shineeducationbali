<?php

namespace App\Http\Resources\Api\V1\RealisasiSesi;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RealisasiSesiResource extends JsonResource
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
            'sesi_kerja_id' => $this->sesi_kerja_id,
            'sesi_kerja' => $this->whenLoaded('sesiKerja', function () {
                return [
                    'id' => $this->sesiKerja->id,
                    'kategori' => $this->sesiKerja->kategori,
                    'mata_pelajaran' => $this->sesiKerja->mata_pelajaran,
                    'hari' => $this->sesiKerja->hari,
                    'nomor_sesi' => $this->sesiKerja->nomor_sesi,
                    'jam_mulai' => $this->sesiKerja->jam_mulai?->format('H:i:s'),
                    'jam_selesai' => $this->sesiKerja->jam_selesai?->format('H:i:s'),
                    'tarif' => $this->sesiKerja->tarif ? (float) $this->sesiKerja->tarif : null,
                    'status' => $this->sesiKerja->status,
                ];
            }),
            'status' => $this->status,
            'disetujui_oleh' => $this->disetujui_oleh,
            'approved_by' => $this->whenLoaded('approvedBy', function () {
                return [
                    'id' => $this->approvedBy->id,
                    'name' => $this->approvedBy->name,
                    'email' => $this->approvedBy->email,
                ];
            }),
            'sumber' => $this->sumber,
            'catatan' => $this->catatan,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
