<?php

namespace App\Http\Resources\Api\V1\LogAbsensi;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LogAbsensiResource extends JsonResource
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
            'absensi_id' => $this->absensi_id,
            'absensi' => $this->whenLoaded('absensi', function () {
                return [
                    'id' => $this->absensi->id,
                    'tanggal' => $this->absensi->tanggal?->format('Y-m-d'),
                    'status_kehadiran' => $this->absensi->status_kehadiran,
                    'jam_masuk' => $this->absensi->jam_masuk,
                    'jam_pulang' => $this->absensi->jam_pulang,
                    'employee' => $this->when(
                        $this->absensi->relationLoaded('employee'),
                        function () {
                            return [
                                'id' => $this->absensi->employee->id,
                                'kode_karyawan' => $this->absensi->employee->kode_karyawan,
                                'user' => $this->when(
                                    $this->absensi->employee->relationLoaded('user'),
                                    function () {
                                        return [
                                            'id' => $this->absensi->employee->user->id,
                                            'name' => $this->absensi->employee->user->name,
                                            'email' => $this->absensi->employee->user->email,
                                        ];
                                    }
                                ),
                            ];
                        }
                    ),
                ];
            }),
            'jenis' => $this->jenis,
            'jenis_label' => $this->jenis === 'check_in' ? 'Check In' : 'Check Out',
            'waktu' => $this->when(
                $this->waktu !== null,
                fn() => $this->waktu->format('Y-m-d H:i:s'),
                null
            ),
            'latitude' => $this->when(
                $this->latitude !== null,
                fn() => (float) $this->latitude,
                null
            ),
            'longitude' => $this->when(
                $this->longitude !== null,
                fn() => (float) $this->longitude,
                null
            ),
            'akurasi' => $this->when(
                $this->akurasi !== null,
                fn() => (int) $this->akurasi,
                null
            ),
            'akurasi_formatted' => $this->when(
                $this->akurasi !== null,
                fn() => $this->akurasi . ' meter',
                null
            ),
            'foto_selfie' => $this->when(
                $this->foto_selfie !== null,
                function () {
                    // Jika foto_selfie ada, return full URL jika menggunakan storage public
                    if (str_starts_with($this->foto_selfie, 'selfies/')) {
                        return asset('storage/' . $this->foto_selfie);
                    }
                    return $this->foto_selfie;
                },
                null
            ),
            'foto_selfie_path' => $this->when(
                $this->foto_selfie !== null,
                fn() => $this->foto_selfie,
                null
            ),
            'sumber' => $this->sumber,
            'sumber_label' => $this->sumber === 'mobile' ? 'Mobile' : 'Web',
            'validasi_gps' => $this->validasi_gps ?? false,
            'validasi_gps_label' => ($this->validasi_gps ?? false) ? 'Valid' : 'Tidak Valid',
            'latitude_referensi' => $this->when(
                $this->latitude_referensi !== null,
                fn() => (float) $this->latitude_referensi,
                null
            ),
            'longitude_referensi' => $this->when(
                $this->longitude_referensi !== null,
                fn() => (float) $this->longitude_referensi,
                null
            ),
            'radius_min' => $this->when(
                $this->radius_min !== null,
                fn() => (int) $this->radius_min,
                null
            ),
            'radius_max' => $this->when(
                $this->radius_max !== null,
                fn() => (int) $this->radius_max,
                null
            ),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'deleted_at' => $this->when(
                $this->deleted_at !== null,
                fn() => $this->deleted_at->toDateTimeString(),
                null
            ),
        ];
    }
}

