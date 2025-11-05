<?php

namespace App\Http\Requests\Api\V1\Absensi;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAbsensiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Hanya yang bisa mengelola absensi
        return $this->user() && $this->user()->can('mengelola absensi');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'karyawan_id' => [
                'sometimes',
                'integer',
                'exists:karyawan,id',
            ],
            'tanggal' => [
                'sometimes',
                'date',
                'date_format:Y-m-d',
            ],
            'status_kehadiran' => [
                'sometimes',
                'string',
                Rule::in(['hadir', 'izin']),
            ],
            'jam_masuk' => [
                'nullable',
                'date_format:H:i:s',
            ],
            'jam_pulang' => [
                'nullable',
                'date_format:H:i:s',
            ],
            'sumber_absen' => ['nullable', 'string', Rule::in(['mobile', 'kiosk', 'web'])],
            'catatan' => ['nullable', 'string'],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $statusKehadiran = $this->input('status_kehadiran');
            $jamMasuk = $this->input('jam_masuk');
            $jamPulang = $this->input('jam_pulang');

            // Jika status_kehadiran diubah menjadi hadir, pastikan jam_masuk dan jam_pulang ada
            if ($statusKehadiran === 'hadir') {
                if (empty($jamMasuk)) {
                    $validator->errors()->add('jam_masuk', 'Jam masuk wajib diisi untuk status hadir.');
                }
                if (empty($jamPulang)) {
                    $validator->errors()->add('jam_pulang', 'Jam pulang wajib diisi untuk status hadir.');
                }
                
                // Jika kedua jam ada, pastikan jam_pulang lebih besar dari jam_masuk
                if (!empty($jamMasuk) && !empty($jamPulang)) {
                    $jamMasukCarbon = \Carbon\Carbon::createFromTimeString($jamMasuk);
                    $jamPulangCarbon = \Carbon\Carbon::createFromTimeString($jamPulang);
                    
                    // Jika jam_pulang lebih kecil atau sama dengan jam_masuk, berarti melewati tengah malam
                    // Atau memang invalid, kita akan anggap invalid untuk sekarang
                    // (kecuali jika melewati tengah malam, kita perlu handle khusus)
                    if ($jamPulangCarbon->lessThanOrEqualTo($jamMasukCarbon) && 
                        !$this->isOvernightShift($jamMasukCarbon, $jamPulangCarbon)) {
                        $validator->errors()->add('jam_pulang', 'Jam pulang harus lebih besar dari jam masuk.');
                    }
                }
            }

            // Jika status_kehadiran diubah dan bukan hadir, pastikan jam_masuk dan jam_pulang tidak ada
            if ($statusKehadiran && $statusKehadiran !== 'hadir') {
                if (!empty($jamMasuk)) {
                    $validator->errors()->add('jam_masuk', 'Jam masuk hanya untuk status hadir.');
                }
                if (!empty($jamPulang)) {
                    $validator->errors()->add('jam_pulang', 'Jam pulang hanya untuk status hadir.');
                }
            }
        });
    }

    /**
     * Check if shift is overnight (melewati tengah malam).
     *
     * @param  \Carbon\Carbon  $jamMasuk
     * @param  \Carbon\Carbon  $jamPulang
     * @return bool
     */
    protected function isOvernightShift($jamMasuk, $jamPulang): bool
    {
        // Jika jam pulang lebih kecil dari jam masuk, berarti melewati tengah malam
        // Untuk sekarang, kita anggap tidak valid (bisa disesuaikan jika perlu)
        return false;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'karyawan_id.integer' => 'ID karyawan harus berupa angka.',
            'karyawan_id.exists' => 'Karyawan tidak ditemukan.',
            'tanggal.date' => 'Tanggal absensi harus berupa tanggal yang valid.',
            'tanggal.date_format' => 'Format tanggal absensi harus YYYY-MM-DD (contoh: 2025-11-04).',
            'status_kehadiran.in' => 'Status kehadiran harus salah satu dari: hadir, izin.',
            'jam_masuk.date_format' => 'Format jam masuk harus HH:MM:SS (contoh: 08:00:00).',
            'jam_pulang.date_format' => 'Format jam pulang harus HH:MM:SS (contoh: 17:00:00).',
            'jam_pulang.after' => 'Jam pulang harus lebih besar dari jam masuk.',
            'sumber_absen.in' => 'Sumber absen harus salah satu dari: mobile, kiosk, web.',
            'catatan.string' => 'Catatan harus berupa teks.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Jika status_kehadiran diubah dan bukan hadir, set jam_masuk dan jam_pulang ke null
        if ($this->has('status_kehadiran') && $this->input('status_kehadiran') !== 'hadir') {
            $this->merge([
                'jam_masuk' => null,
                'jam_pulang' => null,
            ]);
        }

        // Jika status_kehadiran adalah hadir tapi tidak diubah, check apakah sudah ada jam_masuk dan jam_pulang
        // Logic ini akan di-handle oleh model boot method yang sudah menghitung durasi_kerja
    }
}
