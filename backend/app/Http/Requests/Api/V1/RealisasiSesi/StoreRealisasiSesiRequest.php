<?php

namespace App\Http\Requests\Api\V1\RealisasiSesi;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRealisasiSesiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && (
            $this->user()->can('mengajukan realisasi sesi') || 
            $this->user()->can('mengelola realisasi sesi')
        );
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'karyawan_id' => ['required', 'integer', 'exists:karyawan,id'],
            'tanggal' => ['required', 'date', 'date_format:Y-m-d'],
            'sesi_kerja_id' => ['required', 'integer', 'exists:sesi_kerja,id'],
            'status' => [
                'sometimes',
                'string',
                Rule::in(['diajukan', 'disetujui', 'ditolak']),
            ],
            'disetujui_oleh' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],
            'sumber' => ['required', 'string', Rule::in(['jadwal', 'manual'])],
            'catatan' => ['nullable', 'string'],
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
            'tanggal.required' => 'Tanggal wajib diisi.',
            'tanggal.date' => 'Tanggal harus berupa tanggal yang valid.',
            'tanggal.date_format' => 'Format tanggal harus YYYY-MM-DD (contoh: 2025-11-06).',
            'sesi_kerja_id.required' => 'ID sesi kerja wajib diisi.',
            'sesi_kerja_id.integer' => 'ID sesi kerja harus berupa angka.',
            'sesi_kerja_id.exists' => 'Sesi kerja tidak ditemukan.',
            'status.in' => 'Status harus salah satu dari: diajukan, disetujui, ditolak.',
            'disetujui_oleh.integer' => 'ID user yang menyetujui harus berupa angka.',
            'disetujui_oleh.exists' => 'User yang menyetujui tidak ditemukan.',
            'sumber.required' => 'Sumber wajib diisi.',
            'sumber.in' => 'Sumber harus salah satu dari: jadwal, manual.',
            'catatan.string' => 'Catatan harus berupa teks.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default status jika tidak ada
        if (!$this->has('status')) {
            $this->merge([
                'status' => 'diajukan',
            ]);
        }

        // Jika status diajukan, pastikan disetujui_oleh null
        if ($this->input('status') === 'diajukan') {
            $this->merge([
                'disetujui_oleh' => null,
            ]);
        }
    }
}
