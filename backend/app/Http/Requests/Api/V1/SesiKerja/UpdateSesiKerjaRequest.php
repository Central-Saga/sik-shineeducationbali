<?php

namespace App\Http\Requests\Api\V1\SesiKerja;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSesiKerjaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('mengelola sesi kerja');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'kategori' => ['sometimes', 'string', Rule::in(['coding', 'non_coding'])],
            'mata_pelajaran' => ['nullable', 'string', 'max:255'],
            'hari' => ['sometimes', 'string', Rule::in(['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'])],
            'nomor_sesi' => ['sometimes', 'integer', 'min:1', 'max:255'],
            'jam_mulai' => ['sometimes', 'date_format:H:i:s'],
            'jam_selesai' => ['sometimes', 'date_format:H:i:s', 'after:jam_mulai'],
            'tarif' => ['sometimes', 'numeric', 'min:0', 'max:9999999999.99'],
            'status' => ['sometimes', 'string', Rule::in(['aktif', 'non aktif'])],
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
            'kategori.in' => 'Kategori harus salah satu dari: coding, non_coding.',
            'mata_pelajaran.string' => 'Mata pelajaran harus berupa teks.',
            'mata_pelajaran.max' => 'Mata pelajaran maksimal 255 karakter.',
            'hari.in' => 'Hari harus salah satu dari: senin, selasa, rabu, kamis, jumat, sabtu.',
            'nomor_sesi.integer' => 'Nomor sesi harus berupa angka.',
            'nomor_sesi.min' => 'Nomor sesi minimal 1.',
            'nomor_sesi.max' => 'Nomor sesi maksimal 255.',
            'jam_mulai.date_format' => 'Format jam mulai harus HH:ii:ss (contoh: 08:00:00).',
            'jam_selesai.date_format' => 'Format jam selesai harus HH:ii:ss (contoh: 09:00:00).',
            'jam_selesai.after' => 'Jam selesai harus lebih besar dari jam mulai.',
            'tarif.numeric' => 'Tarif harus berupa angka.',
            'tarif.min' => 'Tarif minimal 0.',
            'tarif.max' => 'Tarif maksimal 9999999999.99.',
            'status.in' => 'Status harus salah satu dari: aktif, non aktif.',
        ];
    }
}
