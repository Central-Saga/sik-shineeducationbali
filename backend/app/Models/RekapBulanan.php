<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RekapBulanan extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'rekap_bulanan';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'karyawan_id',
        'periode',
        'jumlah_hadir',
        'jumlah_izin',
        'jumlah_sakit',
        'jumlah_cuti',
        'jumlah_alfa',
        'jumlah_sesi_coding',
        'jumlah_sesi_non_coding',
        'nilai_sesi_coding',
        'nilai_sesi_non_coding',
        'total_pendapatan_sesi',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jumlah_hadir' => 'integer',
            'jumlah_izin' => 'integer',
            'jumlah_sakit' => 'integer',
            'jumlah_cuti' => 'integer',
            'jumlah_alfa' => 'integer',
            'jumlah_sesi_coding' => 'integer',
            'jumlah_sesi_non_coding' => 'integer',
            'nilai_sesi_coding' => 'decimal:2',
            'nilai_sesi_non_coding' => 'decimal:2',
            'total_pendapatan_sesi' => 'decimal:2',
        ];
    }

    /**
     * Get the employee that owns the rekap bulanan.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'karyawan_id');
    }

    /**
     * Get the gaji record for this rekap.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function gaji(): HasOne
    {
        return $this->hasOne(Gaji::class, 'karyawan_id', 'karyawan_id')
            ->where('periode', $this->periode);
    }

    /**
     * Scope a query to filter by periode.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $periode
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByPeriode($query, string $periode)
    {
        return $query->where('periode', $periode);
    }

    /**
     * Scope a query to filter by karyawan_id.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByKaryawan($query, $karyawanId)
    {
        return $query->where('karyawan_id', $karyawanId);
    }

    /**
     * Scope a query to filter by periode and karyawan_id.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $periode
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByPeriodeAndKaryawan($query, string $periode, $karyawanId)
    {
        return $query->where('periode', $periode)->where('karyawan_id', $karyawanId);
    }
}

