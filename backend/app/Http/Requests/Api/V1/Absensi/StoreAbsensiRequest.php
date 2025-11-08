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
        $user = $this->user();
        
        // Hanya karyawan yang bisa membuat absensi
        // Admin hanya bisa melihat/memverifikasi, tidak bisa membuat
        if (!$user) {
            return false;
        }

        // Load employee relationship
        if (!$user->relationLoaded('employee')) {
            $user->load('employee');
        }

        // Cek apakah user memiliki role "Karyawan"
        if (!$user->hasRole('Karyawan')) {
            return false;
        }

        // Pastikan user memiliki permission "melakukan absensi"
        return $user->can('melakukan absensi');
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
            // Geo location fields (optional, but required if foto_selfie is provided)
            'latitude' => [
                'nullable',
                'numeric',
                'between:-90,90',
                Rule::requiredIf(function () {
                    return $this->hasFile('foto_selfie');
                }),
            ],
            'longitude' => [
                'nullable',
                'numeric',
                'between:-180,180',
                Rule::requiredIf(function () {
                    return $this->hasFile('foto_selfie');
                }),
            ],
            'akurasi' => [
                'nullable',
                'integer',
                'min:0',
                'max:32767',
                Rule::requiredIf(function () {
                    return $this->hasFile('foto_selfie');
                }),
            ],
            // Foto selfie (file upload)
            'foto_selfie' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png',
                'max:5120', // 5MB
            ],
            // Jenis check-in/check-out (optional, used when foto_selfie is provided)
            'jenis' => [
                'nullable',
                'string',
                Rule::in(['check_in', 'check_out']),
                Rule::requiredIf(function () {
                    return $this->hasFile('foto_selfie');
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
            'latitude.required_if' => 'Latitude wajib diisi jika foto selfie diupload.',
            'latitude.numeric' => 'Latitude harus berupa angka.',
            'latitude.between' => 'Latitude harus berada di antara -90 dan 90.',
            'longitude.required_if' => 'Longitude wajib diisi jika foto selfie diupload.',
            'longitude.numeric' => 'Longitude harus berupa angka.',
            'longitude.between' => 'Longitude harus berada di antara -180 dan 180.',
            'akurasi.required_if' => 'Akurasi GPS wajib diisi jika foto selfie diupload.',
            'akurasi.integer' => 'Akurasi GPS harus berupa angka bulat.',
            'akurasi.min' => 'Akurasi GPS harus lebih besar atau sama dengan 0.',
            'akurasi.max' => 'Akurasi GPS tidak boleh melebihi 32767 meter.',
            'foto_selfie.image' => 'File foto selfie harus berupa gambar.',
            'foto_selfie.mimes' => 'File foto selfie harus berformat JPEG, JPG, atau PNG.',
            'foto_selfie.max' => 'Ukuran file foto selfie maksimal 5MB.',
            'jenis.required_if' => 'Jenis check-in/check-out wajib diisi jika foto selfie diupload.',
            'jenis.in' => 'Jenis harus salah satu dari: check_in, check_out.',
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
            $user = $this->user();
            
            // Validasi bahwa karyawan_id harus sesuai dengan employee user yang login
            if ($user && $user->hasRole('Karyawan') && $user->employee) {
                $karyawanId = $this->input('karyawan_id');
                if ($karyawanId != $user->employee->id) {
                    $validator->errors()->add('karyawan_id', 'Anda hanya dapat membuat absensi untuk diri sendiri.');
                }
            }

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
        $user = $this->user();
        
        // Load employee relationship jika belum dimuat
        if ($user && !$user->relationLoaded('employee')) {
            $user->load('employee');
        }
        
        // Auto-fill karyawan_id dari user.employee jika user adalah karyawan
        if ($user && $user->hasRole('Karyawan') && $user->employee) {
            $this->merge([
                'karyawan_id' => $user->employee->id,
            ]);
        }

        // Jika status bukan hadir, set jam_masuk dan jam_pulang ke null
        if ($this->has('status_kehadiran') && $this->input('status_kehadiran') !== 'hadir') {
            $this->merge([
                'jam_masuk' => null,
                'jam_pulang' => null,
            ]);
        }
    }
}
