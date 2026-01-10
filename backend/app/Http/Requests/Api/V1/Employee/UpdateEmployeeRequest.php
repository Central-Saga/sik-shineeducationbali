<?php

namespace App\Http\Requests\Api\V1\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('mengelola karyawan');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $employeeId = $this->route('id');

        return [
            'user_id' => [
                'sometimes',
                'integer',
                'exists:users,id',
                Rule::unique('karyawan', 'user_id')->ignore($employeeId),
            ],
            'kategori_karyawan' => ['sometimes', 'string', Rule::in(['tetap', 'kontrak', 'freelance'])],
            'subtipe_kontrak' => [
                'nullable',
                'string',
                Rule::in(['full_time', 'part_time']),
            ],
            'tipe_gaji' => ['sometimes', 'string', Rule::in(['bulanan', 'per_sesi'])],
            'gaji_pokok' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999999999.99',
            ],
            'bank_nama' => ['nullable', 'string', 'max:60'],
            'bank_no_rekening' => ['nullable', 'string', 'max:50', 'regex:/^[0-9]+$/'],
            'nomor_hp' => ['nullable', 'string', 'max:20', 'regex:/^(\+62|62|0)[0-9]{9,13}$/'],
            'alamat' => ['nullable', 'string'],
            'tanggal_lahir' => ['nullable', 'date', 'before:today', 'date_format:Y-m-d'],
            'status' => ['sometimes', 'string', Rule::in(['aktif', 'nonaktif'])],
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
            'user_id.exists' => 'User tidak ditemukan.',
            'user_id.unique' => 'User ini sudah memiliki data karyawan.',
            'kategori_karyawan.in' => 'Kategori karyawan harus salah satu dari: tetap, kontrak, freelance.',
            'subtipe_kontrak.in' => 'Subtipe kontrak harus salah satu dari: full_time, part_time.',
            'tipe_gaji.in' => 'Tipe gaji harus salah satu dari: bulanan, per_sesi.',
            'gaji_pokok.numeric' => 'Gaji pokok harus berupa angka.',
            'gaji_pokok.min' => 'Gaji pokok tidak boleh negatif.',
            'gaji_pokok.max' => 'Gaji pokok maksimal 999,999,999,999.99.',
            'bank_nama.max' => 'Nama bank maksimal 60 karakter.',
            'bank_no_rekening.max' => 'Nomor rekening maksimal 50 karakter.',
            'bank_no_rekening.regex' => 'Nomor rekening hanya boleh berisi angka.',
            'nomor_hp.max' => 'Nomor HP maksimal 20 karakter.',
            'nomor_hp.regex' => 'Format nomor HP tidak valid. Gunakan format Indonesia (contoh: 081234567890).',
            'tanggal_lahir.date' => 'Tanggal lahir harus berupa tanggal yang valid.',
            'tanggal_lahir.date_format' => 'Format tanggal lahir harus YYYY-MM-DD (contoh: 1990-01-15).',
            'tanggal_lahir.before' => 'Tanggal lahir harus sebelum hari ini.',
            'status.in' => 'Status harus salah satu dari: aktif, nonaktif.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Jika kategori_karyawan bukan kontrak, set subtipe_kontrak ke null
        if ($this->has('kategori_karyawan') && $this->input('kategori_karyawan') !== 'kontrak') {
            $this->merge([
                'subtipe_kontrak' => null,
            ]);
        }

        // Jika tipe_gaji adalah per_sesi, set gaji_pokok ke null
        if ($this->has('tipe_gaji') && $this->input('tipe_gaji') === 'per_sesi') {
            $this->merge([
                'gaji_pokok' => null,
            ]);
        }
    }
}


