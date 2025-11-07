<?php

namespace App\Http\Requests\Api\V1\Absensi;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAbsensiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Bisa melakukan absensi atau mengelola absensi
        return $this->user() && (
            $this->user()->can('melakukan absensi') || 
            $this->user()->can('mengelola absensi')
        );
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'karyawan_id' => ['required', 'integer', 'exists:karyawan,id'],
            'tanggal' => ['required', 'date', 'date_format:Y-m-d'],
            'status_kehadiran' => ['required', 'string', Rule::in(['hadir', 'izin'])],
            'jam_masuk' => [
                'nullable',
                'date_format:H:i:s',
                Rule::requiredIf(function () {
                    return $this->input('status_kehadiran') === 'hadir';
                }),
            ],
            'jam_pulang' => [
                'nullable',
                'date_format:H:i:s',
                Rule::requiredIf(function () {
                    return $this->input('status_kehadiran') === 'hadir';
                }),
            ],
            'sumber_absen' => ['nullable', 'string', Rule::in(['mobile', 'kiosk', 'web'])],
            'catatan' => [
                'nullable',
                'string',
                Rule::requiredIf(function () {
                    return $this->input('status_kehadiran') === 'izin';
                }),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'karyawan_id.required' => 'ID karyawan wajib diisi.',
            'karyawan_id.integer' => 'ID karyawan harus berupa angka.',
            'karyawan_id.exists' => 'Karyawan tidak ditemukan.',
            'tanggal.required' => 'Tanggal absensi wajib diisi.',
            'tanggal.date' => 'Tanggal absensi harus berupa tanggal yang valid.',
            'tanggal.date_format' => 'Format tanggal absensi harus YYYY-MM-DD (contoh: 2025-11-04).',
            'status_kehadiran.required' => 'Status kehadiran wajib diisi.',
            'status_kehadiran.in' => 'Status kehadiran harus salah satu dari: hadir, izin.',
            'jam_masuk.required_if' => 'Jam masuk wajib diisi untuk status hadir.',
            'jam_masuk.date_format' => 'Format jam masuk harus HH:MM:SS (contoh: 08:00:00).',
            'jam_pulang.required_if' => 'Jam pulang wajib diisi untuk status hadir.',
            'jam_pulang.date_format' => 'Format jam pulang harus HH:MM:SS (contoh: 17:00:00).',
            'jam_pulang.after' => 'Jam pulang harus lebih besar dari jam masuk.',
            'sumber_absen.in' => 'Sumber absen harus salah satu dari: mobile, kiosk, web.',
            'catatan.required_if' => 'Catatan wajib diisi untuk status izin.',
            'catatan.string' => 'Catatan harus berupa teks.',
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

            // Jika status hadir, pastikan jam_pulang lebih besar dari jam_masuk
            if ($statusKehadiran === 'hadir' && !empty($jamMasuk) && !empty($jamPulang)) {
                $jamMasukCarbon = \Carbon\Carbon::createFromTimeString($jamMasuk);
                $jamPulangCarbon = \Carbon\Carbon::createFromTimeString($jamPulang);
                
                // Jika jam_pulang lebih kecil atau sama dengan jam_masuk, berarti invalid
                // (kecuali jika melewati tengah malam, tapi untuk absensi harian tidak perlu)
                if ($jamPulangCarbon->lessThanOrEqualTo($jamMasukCarbon)) {
                    $validator->errors()->add('jam_pulang', 'Jam pulang harus lebih besar dari jam masuk.');
                }
            }

            // Jika status izin, pastikan catatan diisi
            $catatan = $this->input('catatan');
            if ($statusKehadiran === 'izin' && empty($catatan)) {
                $validator->errors()->add('catatan', 'Catatan wajib diisi untuk status izin. Silakan sertakan alasan izin.');
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Jika status bukan hadir, set jam_masuk dan jam_pulang ke null
        if ($this->has('status_kehadiran') && $this->input('status_kehadiran') !== 'hadir') {
            $this->merge([
                'jam_masuk' => null,
                'jam_pulang' => null,
            ]);
        }
    }
}
