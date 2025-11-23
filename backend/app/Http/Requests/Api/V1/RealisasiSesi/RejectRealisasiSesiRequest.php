<?php

namespace App\Http\Requests\Api\V1\RealisasiSesi;

use Illuminate\Foundation\Http\FormRequest;

class RejectRealisasiSesiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('mengelola realisasi sesi');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'catatan' => ['required', 'string', 'min:3'],
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
            'catatan.required' => 'Catatan wajib diisi untuk penolakan.',
            'catatan.string' => 'Catatan harus berupa teks.',
            'catatan.min' => 'Catatan minimal 3 karakter.',
        ];
    }
}
