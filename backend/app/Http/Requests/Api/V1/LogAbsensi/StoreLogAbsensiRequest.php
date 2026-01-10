<?php

namespace App\Http\Requests\Api\V1\LogAbsensi;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLogAbsensiRequest extends FormRequest
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
            'absensi_id' => ['required', 'integer', 'exists:absensi,id'],
            'jenis' => ['required', 'string', Rule::in(['check_in', 'check_out'])],
            'waktu' => ['required', 'date', 'date_format:Y-m-d H:i:s'],
            'latitude' => ['required', 'numeric', 'between:-90,90', 'regex:/^-?\d{1,2}\.\d{1,6}$/'],
            'longitude' => ['required', 'numeric', 'between:-180,180', 'regex:/^-?\d{1,3}\.\d{1,6}$/'],
            'akurasi' => ['required', 'integer', 'min:0', 'max:32767'],
            'foto_selfie' => ['nullable', 'string', 'max:255'],
            'sumber' => ['required', 'string', Rule::in(['mobile', 'web'])],
            'validasi_gps' => ['nullable', 'boolean'],
            'latitude_referensi' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude_referensi' => ['nullable', 'numeric', 'between:-180,180'],
            'radius_min' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'radius_max' => ['nullable', 'integer', 'min:1', 'max:1000'],
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
            'absensi_id.required' => 'ID absensi wajib diisi.',
            'absensi_id.integer' => 'ID absensi harus berupa angka.',
            'absensi_id.exists' => 'Absensi tidak ditemukan.',
            'jenis.required' => 'Jenis log absensi wajib diisi.',
            'jenis.in' => 'Jenis log absensi harus salah satu dari: check_in, check_out.',
            'waktu.required' => 'Waktu absensi wajib diisi.',
            'waktu.date' => 'Waktu absensi harus berupa tanggal dan waktu yang valid.',
            'waktu.date_format' => 'Format waktu absensi harus YYYY-MM-DD HH:MM:SS (contoh: 2025-11-05 08:00:00).',
            'latitude.required' => 'Latitude wajib diisi.',
            'latitude.numeric' => 'Latitude harus berupa angka.',
            'latitude.between' => 'Latitude harus berada di antara -90 dan 90.',
            'latitude.regex' => 'Format latitude tidak valid. Contoh format: -8.670500',
            'longitude.required' => 'Longitude wajib diisi.',
            'longitude.numeric' => 'Longitude harus berupa angka.',
            'longitude.between' => 'Longitude harus berada di antara -180 dan 180.',
            'longitude.regex' => 'Format longitude tidak valid. Contoh format: 115.212600',
            'akurasi.required' => 'Akurasi GPS wajib diisi.',
            'akurasi.integer' => 'Akurasi GPS harus berupa angka bulat.',
            'akurasi.min' => 'Akurasi GPS harus lebih besar atau sama dengan 0.',
            'akurasi.max' => 'Akurasi GPS tidak boleh melebihi 32767 meter.',
            'foto_selfie.string' => 'Foto selfie harus berupa string.',
            'foto_selfie.max' => 'Path foto selfie tidak boleh melebihi 255 karakter.',
            'sumber.required' => 'Sumber absensi wajib diisi.',
            'sumber.in' => 'Sumber absensi harus salah satu dari: mobile, web.',
            'validasi_gps.boolean' => 'Validasi GPS harus berupa true atau false.',
            'latitude_referensi.numeric' => 'Latitude referensi harus berupa angka.',
            'latitude_referensi.between' => 'Latitude referensi harus berada di antara -90 dan 90.',
            'longitude_referensi.numeric' => 'Longitude referensi harus berupa angka.',
            'longitude_referensi.between' => 'Longitude referensi harus berada di antara -180 dan 180.',
            'radius_min.integer' => 'Radius minimum harus berupa angka bulat.',
            'radius_min.min' => 'Radius minimum harus lebih besar dari 0.',
            'radius_min.max' => 'Radius minimum tidak boleh melebihi 1000 meter.',
            'radius_max.integer' => 'Radius maksimum harus berupa angka bulat.',
            'radius_max.min' => 'Radius maksimum harus lebih besar dari 0.',
            'radius_max.max' => 'Radius maksimum tidak boleh melebihi 1000 meter.',
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

            // Validasi bahwa check_in dan check_out harus sesuai dengan absensi
            if ($absensiId && $jenis) {
                $absensi = \App\Models\Absensi::find($absensiId);
                
                if ($absensi) {
                    // Validasi waktu harus sesuai dengan tanggal absensi
                    if ($waktu) {
                        $waktuCarbon = \Carbon\Carbon::parse($waktu);
                        $tanggalAbsensi = \Carbon\Carbon::parse($absensi->tanggal);
                        
                        if ($waktuCarbon->format('Y-m-d') !== $tanggalAbsensi->format('Y-m-d')) {
                            $validator->errors()->add('waktu', 'Waktu absensi harus sesuai dengan tanggal absensi.');
                        }
                        
                        // Validasi check_in harus sebelum atau sama dengan jam_masuk absensi
                        if ($jenis === 'check_in' && $absensi->jam_masuk) {
                            $jamMasuk = \Carbon\Carbon::parse($absensi->tanggal . ' ' . $absensi->jam_masuk);
                            if ($waktuCarbon->gt($jamMasuk)) {
                                $validator->errors()->add('waktu', 'Waktu check-in tidak boleh lebih besar dari jam masuk absensi.');
                            }
                        }
                        
                        // Validasi check_out harus setelah atau sama dengan jam_pulang absensi
                        if ($jenis === 'check_out' && $absensi->jam_pulang) {
                            $jamPulang = \Carbon\Carbon::parse($absensi->tanggal . ' ' . $absensi->jam_pulang);
                            if ($waktuCarbon->lt($jamPulang)) {
                                $validator->errors()->add('waktu', 'Waktu check-out tidak boleh lebih kecil dari jam pulang absensi.');
                            }
                        }
                    }
                }
            }

            // Validasi akurasi GPS (harus positif)
            $akurasi = $this->input('akurasi');
            if ($akurasi !== null && $akurasi < 0) {
                $validator->errors()->add('akurasi', 'Akurasi GPS harus lebih besar atau sama dengan 0.');
            }

            // Validasi radius_min dan radius_max harus antara 20-50 meter
            $radiusMin = $this->input('radius_min');
            $radiusMax = $this->input('radius_max');
            
            if ($radiusMin !== null && ($radiusMin < 20 || $radiusMin > 50)) {
                $validator->errors()->add('radius_min', 'Radius minimum harus antara 20-50 meter.');
            }
            
            if ($radiusMax !== null && ($radiusMax < 20 || $radiusMax > 50)) {
                $validator->errors()->add('radius_max', 'Radius maksimum harus antara 20-50 meter.');
            }
            
            if ($radiusMin !== null && $radiusMax !== null && $radiusMin > $radiusMax) {
                $validator->errors()->add('radius_min', 'Radius minimum tidak boleh lebih besar dari radius maksimum.');
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default validasi_gps ke false jika tidak diisi
        if (!$this->has('validasi_gps')) {
            $this->merge([
                'validasi_gps' => false,
            ]);
        }

        // Set default koordinat referensi dan radius jika tidak diisi
        if (!$this->has('latitude_referensi')) {
            $this->merge([
                'latitude_referensi' => -8.5209686,
            ]);
        }
        if (!$this->has('longitude_referensi')) {
            $this->merge([
                'longitude_referensi' => 115.1378956,
            ]);
        }
        if (!$this->has('radius_min')) {
            $this->merge([
                'radius_min' => 20,
            ]);
        }
        if (!$this->has('radius_max')) {
            $this->merge([
                'radius_max' => 50,
            ]);
        }

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

