<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'karyawan';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'kode_karyawan',
        'user_id',
        'kategori_karyawan',
        'subtipe_kontrak',
        'tipe_gaji',
        'gaji_pokok',
        'bank_nama',
        'bank_no_rekening',
        'nomor_hp',
        'alamat',
        'tanggal_lahir',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'gaji_pokok' => 'decimal:2',
        ];
    }

    /**
     * Get the user that owns the employee.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include active employees.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Scope a query to only include inactive employees.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'nonaktif');
    }

    /**
     * Get the attendance records for the employee.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function absensi(): HasMany
    {
        return $this->hasMany(Absensi::class, 'karyawan_id');
    }

    /**
     * Get the rekap bulanan records for the employee.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function rekapBulanan(): HasMany
    {
        return $this->hasMany(RekapBulanan::class, 'karyawan_id');
    }

    /**
     * Get the gaji records for the employee.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function gaji(): HasMany
    {
        return $this->hasMany(Gaji::class, 'karyawan_id');
    }

    /**
     * Get the cuti records for the employee.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function cuti(): HasMany
    {
        return $this->hasMany(Cuti::class, 'karyawan_id');
    }

    /**
     * Get the realisasi sesi records for the employee.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function realisasiSesi(): HasMany
    {
        return $this->hasMany(RealisasiSesi::class, 'karyawan_id');
    }
}

