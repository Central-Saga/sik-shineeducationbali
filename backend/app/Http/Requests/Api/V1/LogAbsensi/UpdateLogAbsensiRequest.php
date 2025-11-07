<?php

namespace App\Http\Requests\Api\V1\LogAbsensi;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLogAbsensiRequest extends FormRequest
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
            'absensi_id' => [
                'sometimes',
                'integer',
                'exists:absensi,id',
            ],
            'jenis' => [
                'sometimes',
                'string',
                Rule::in(['check_in', 'check_out']),
            ],
            'waktu' => [
                'sometimes',
                'date',
                'date_format:Y-m-d H:i:s',
            ],
            'latitude' => [
                'sometimes',
                'numeric',
                'between:-90,90',
                'regex:/^-?\d{1,2}\.\d{1,6}$/',
            ],
            'longitude' => [
                'sometimes',
                'numeric',
                'between:-180,180',
                'regex:/^-?\d{1,3}\.\d{1,6}$/',
            ],
            'akurasi' => [
                'sometimes',
                'integer',
                'min:0',
                'max:32767',
            ],
            'foto_selfie' => ['nullable', 'string', 'max:255'],
            'sumber' => [
                'sometimes',
                'string',
                Rule::in(['mobile', 'web']),
            ],
            'validasi_gps' => ['nullable', 'boolean'],
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
            'absensi_id.integer' => 'ID absensi harus berupa angka.',
            'absensi_id.exists' => 'Absensi tidak ditemukan.',
            'jenis.in' => 'Jenis log absensi harus salah satu dari: check_in, check_out.',
            'waktu.date' => 'Waktu absensi harus berupa tanggal dan waktu yang valid.',
            'waktu.date_format' => 'Format waktu absensi harus YYYY-MM-DD HH:MM:SS (contoh: 2025-11-05 08:00:00).',
            'latitude.numeric' => 'Latitude harus berupa angka.',
            'latitude.between' => 'Latitude harus berada di antara -90 dan 90.',
            'latitude.regex' => 'Format latitude tidak valid. Contoh format: -8.670500',
            'longitude.numeric' => 'Longitude harus berupa angka.',
            'longitude.between' => 'Longitude harus berada di antara -180 dan 180.',
            'longitude.regex' => 'Format longitude tidak valid. Contoh format: 115.212600',
            'akurasi.integer' => 'Akurasi GPS harus berupa angka bulat.',
            'akurasi.min' => 'Akurasi GPS harus lebih besar atau sama dengan 0.',
            'akurasi.max' => 'Akurasi GPS tidak boleh melebihi 32767 meter.',
            'foto_selfie.string' => 'Foto selfie harus berupa string.',
            'foto_selfie.max' => 'Path foto selfie tidak boleh melebihi 255 karakter.',
            'sumber.in' => 'Sumber absensi harus salah satu dari: mobile, web.',
            'validasi_gps.boolean' => 'Validasi GPS harus berupa true atau false.',
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
            $absensiId = $this->input('absensi_id');
            $jenis = $this->input('jenis');
            $waktu = $this->input('waktu');

            // Get the current log absensi being updated
            $logAbsensiId = $this->route('logAbsensi') ?? $this->route('id');
            $logAbsensi = null;
            
            if ($logAbsensiId) {
                $logAbsensi = \App\Models\LogAbsensi::find($logAbsensiId);
            }

            // Use existing absensi_id if not provided
            $checkAbsensiId = $absensiId ?? ($logAbsensi ? $logAbsensi->absensi_id : null);
            $checkJenis = $jenis ?? ($logAbsensi ? $logAbsensi->jenis : null);

            // Validasi bahwa check_in dan check_out harus sesuai dengan absensi
            if ($checkAbsensiId && $checkJenis) {
                $absensi = \App\Models\Absensi::find($checkAbsensiId);
                
                if ($absensi) {
                    // Validasi waktu harus sesuai dengan tanggal absensi
                    if ($waktu) {
                        $waktuCarbon = \Carbon\Carbon::parse($waktu);
                        $tanggalAbsensi = \Carbon\Carbon::parse($absensi->tanggal);
                        
                        if ($waktuCarbon->format('Y-m-d') !== $tanggalAbsensi->format('Y-m-d')) {
                            $validator->errors()->add('waktu', 'Waktu absensi harus sesuai dengan tanggal absensi.');
                        }
                        
                        // Validasi check_in harus sebelum atau sama dengan jam_masuk absensi
                        if ($checkJenis === 'check_in' && $absensi->jam_masuk) {
                            $jamMasuk = \Carbon\Carbon::parse($absensi->tanggal . ' ' . $absensi->jam_masuk);
                            if ($waktuCarbon->gt($jamMasuk)) {
                                $validator->errors()->add('waktu', 'Waktu check-in tidak boleh lebih besar dari jam masuk absensi.');
                            }
                        }
                        
                        // Validasi check_out harus setelah atau sama dengan jam_pulang absensi
                        if ($checkJenis === 'check_out' && $absensi->jam_pulang) {
                            $jamPulang = \Carbon\Carbon::parse($absensi->tanggal . ' ' . $absensi->jam_pulang);
                            if ($waktuCarbon->lt($jamPulang)) {
                                $validator->errors()->add('waktu', 'Waktu check-out tidak boleh lebih kecil dari jam pulang absensi.');
                            }
                        }
                    }
                }
            }

            // Validasi akurasi GPS (harus positif jika diisi)
            $akurasi = $this->input('akurasi');
            if ($akurasi !== null && $akurasi < 0) {
                $validator->errors()->add('akurasi', 'Akurasi GPS harus lebih besar atau sama dengan 0.');
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Format foto_selfie jika diisi
        if ($this->has('foto_selfie') && !empty($this->input('foto_selfie'))) {
            $fotoPath = $this->input('foto_selfie');
            // Pastikan path menggunakan format yang benar (selfies/YYYY/MM/filename.jpg)
            if (!str_starts_with($fotoPath, 'selfies/')) {
                $year = date('Y');
                $month = date('m');
                $filename = basename($fotoPath);
                $this->merge([
                    'foto_selfie' => "selfies/{$year}/{$month}/{$filename}",
                ]);
            }
        }
    }
}



