<?php

namespace App\Http\Requests\Api\V1\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreEmployeeRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::defaults()],
            'kategori_karyawan' => ['required', 'string', Rule::in(['tetap', 'kontrak', 'freelance'])],
            'subtipe_kontrak' => [
                'nullable',
                'string',
                Rule::in(['full_time', 'part_time']),
                Rule::requiredIf(function () {
                    return $this->input('kategori_karyawan') === 'kontrak';
                }),
            ],
            'tipe_gaji' => ['required', 'string', Rule::in(['bulanan', 'per_sesi'])],
            'gaji_pokok' => [
                'required',
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
            'name.required' => 'Nama wajib diisi.',
            'name.string' => 'Nama harus berupa teks.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Email harus berupa format email yang valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.required' => 'Password wajib diisi.',
            'password.string' => 'Password harus berupa teks.',
            'kategori_karyawan.required' => 'Kategori karyawan wajib diisi.',
            'kategori_karyawan.in' => 'Kategori karyawan harus salah satu dari: tetap, kontrak, freelance.',
            'subtipe_kontrak.in' => 'Subtipe kontrak harus salah satu dari: full_time, part_time.',
            'subtipe_kontrak.required_if' => 'Subtipe kontrak wajib diisi untuk kategori kontrak.',
            'tipe_gaji.required' => 'Tipe gaji wajib diisi.',
            'tipe_gaji.in' => 'Tipe gaji harus salah satu dari: bulanan, per_sesi.',
            'gaji_pokok.required' => 'Gaji wajib diisi.',
            'gaji_pokok.numeric' => 'Gaji harus berupa angka.',
            'gaji_pokok.min' => 'Gaji tidak boleh negatif.',
            'gaji_pokok.max' => 'Gaji maksimal 999,999,999,999.99.',
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

        // gaji_pokok tetap digunakan untuk kedua tipe gaji (bulanan dan per_sesi)

        // Set default status jika tidak disediakan
        if (!$this->has('status')) {
            $this->merge([
                'status' => 'aktif',
            ]);
        }
    }
}


