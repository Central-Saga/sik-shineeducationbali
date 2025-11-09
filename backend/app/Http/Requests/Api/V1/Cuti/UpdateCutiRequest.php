<?php

namespace App\Http\Requests\Api\V1\Cuti;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCutiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Hanya yang bisa mengelola cuti
        return $this->user() && $this->user()->can('mengelola cuti');
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
            'jenis' => [
                'sometimes',
                'string',
                Rule::in(['cuti', 'izin', 'sakit']),
            ],
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
            'karyawan_id.integer' => 'ID karyawan harus berupa angka.',
            'karyawan_id.exists' => 'Karyawan tidak ditemukan.',
            'tanggal.date' => 'Tanggal cuti harus berupa tanggal yang valid.',
            'tanggal.date_format' => 'Format tanggal cuti harus YYYY-MM-DD (contoh: 2025-11-06).',
            'jenis.in' => 'Jenis cuti harus salah satu dari: cuti, izin, sakit.',
            'status.in' => 'Status cuti harus salah satu dari: diajukan, disetujui, ditolak.',
            'disetujui_oleh.integer' => 'ID user yang menyetujui harus berupa angka.',
            'disetujui_oleh.exists' => 'User yang menyetujui tidak ditemukan.',
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
            $status = $this->input('status');
            $disetujuiOleh = $this->input('disetujui_oleh');

            // Jika status diubah menjadi diajukan, disetujui_oleh harus null
            if ($status === 'diajukan' && $disetujuiOleh !== null) {
                $validator->errors()->add('disetujui_oleh', 'Status diajukan tidak boleh memiliki disetujui_oleh.');
            }

            // Jika status diubah menjadi disetujui atau ditolak, disetujui_oleh akan di-set otomatis di service
            // Jika sudah ada disetujui_oleh, pastikan valid
            if (in_array($status, ['disetujui', 'ditolak']) && $disetujuiOleh !== null) {
                // Validasi sudah dilakukan di rules (exists:users,id)
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Jika status diubah menjadi diajukan, pastikan disetujui_oleh null
        if ($this->has('status') && $this->input('status') === 'diajukan') {
            $this->merge([
                'disetujui_oleh' => null,
            ]);
        }

        // Jika status diubah menjadi disetujui atau ditolak tapi tidak ada disetujui_oleh, akan di-set di service layer
    }
}

