<?php

namespace App\Http\Resources\Api\V1\Absensi;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbsensiResource extends JsonResource
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
            'status_kehadiran' => $this->status_kehadiran,
            'jam_masuk' => $this->when(
                $this->jam_masuk !== null,
                function () {
                    // Format time string to H:i:s
                    if (is_string($this->jam_masuk)) {
                        return $this->jam_masuk;
                    }
                    // Jika sudah berupa Carbon/DateTime, format ke H:i:s
                    try {
                        return \Carbon\Carbon::parse($this->jam_masuk)->format('H:i:s');
                    } catch (\Exception $e) {
                        return $this->jam_masuk;
                    }
                },
                null
            ),
            'jam_pulang' => $this->when(
                $this->jam_pulang !== null,
                function () {
                    // Format time string to H:i:s
                    if (is_string($this->jam_pulang)) {
                        return $this->jam_pulang;
                    }
                    // Jika sudah berupa Carbon/DateTime, format ke H:i:s
                    try {
                        return \Carbon\Carbon::parse($this->jam_pulang)->format('H:i:s');
                    } catch (\Exception $e) {
                        return $this->jam_pulang;
                    }
                },
                null
            ),
            'durasi_kerja' => $this->when(
                $this->durasi_kerja !== null,
                fn() => (int) $this->durasi_kerja,
                null
            ),
            'durasi_kerja_formatted' => $this->when(
                $this->durasi_kerja !== null,
                function () {
                    $hours = floor($this->durasi_kerja / 60);
                    $minutes = $this->durasi_kerja % 60;
                    return sprintf('%d jam %d menit', $hours, $minutes);
                },
                null
            ),
            'catatan' => $this->catatan,
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
