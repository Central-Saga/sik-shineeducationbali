<?php

namespace App\Http\Requests\Api\V1\SesiKerja;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSesiKerjaRequest extends FormRequest
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
            'kategori' => ['required', 'string', Rule::in(['coding', 'non_coding'])],
            'mata_pelajaran' => ['nullable', 'string', 'max:255'],
            'hari' => ['required', 'string', Rule::in(['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'])],
            'nomor_sesi' => ['required', 'integer', 'min:1', 'max:255'],
            'jam_mulai' => ['required', 'date_format:H:i:s'],
            'jam_selesai' => ['required', 'date_format:H:i:s', 'after:jam_mulai'],
            'tarif' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
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
            'kategori.required' => 'Kategori wajib diisi.',
            'kategori.in' => 'Kategori harus salah satu dari: coding, non_coding.',
            'mata_pelajaran.string' => 'Mata pelajaran harus berupa teks.',
            'mata_pelajaran.max' => 'Mata pelajaran maksimal 255 karakter.',
            'hari.required' => 'Hari wajib diisi.',
            'hari.in' => 'Hari harus salah satu dari: senin, selasa, rabu, kamis, jumat, sabtu.',
            'nomor_sesi.required' => 'Nomor sesi wajib diisi.',
            'nomor_sesi.integer' => 'Nomor sesi harus berupa angka.',
            'nomor_sesi.min' => 'Nomor sesi minimal 1.',
            'nomor_sesi.max' => 'Nomor sesi maksimal 255.',
            'jam_mulai.required' => 'Jam mulai wajib diisi.',
            'jam_mulai.date_format' => 'Format jam mulai harus HH:ii:ss (contoh: 08:00:00).',
            'jam_selesai.required' => 'Jam selesai wajib diisi.',
            'jam_selesai.date_format' => 'Format jam selesai harus HH:ii:ss (contoh: 09:00:00).',
            'jam_selesai.after' => 'Jam selesai harus lebih besar dari jam mulai.',
            'tarif.required' => 'Tarif wajib diisi.',
            'tarif.numeric' => 'Tarif harus berupa angka.',
            'tarif.min' => 'Tarif minimal 0.',
            'tarif.max' => 'Tarif maksimal 9999999999.99.',
            'status.in' => 'Status harus salah satu dari: aktif, non aktif.',
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
                'status' => 'aktif',
            ]);
        }
    }
}
