<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RealisasiSesi extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'realisasi_sesi';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'karyawan_id',
        'tanggal',
        'sesi_kerja_id',
        'status',
        'disetujui_oleh',
        'sumber',
        'catatan',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    /**
     * Get the employee that owns the realisasi sesi.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'karyawan_id');
    }

    /**
     * Get the sesi kerja that owns the realisasi sesi.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function sesiKerja(): BelongsTo
    {
        return $this->belongsTo(SesiKerja::class, 'sesi_kerja_id');
    }

    /**
     * Get the user who approved the realisasi sesi.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    /**
     * Scope a query to only include realisasi sesi with status 'diajukan'.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDiajukan($query)
    {
        return $query->where('status', 'diajukan');
    }

    /**
     * Scope a query to only include realisasi sesi with status 'disetujui'.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDisetujui($query)
    {
        return $query->where('status', 'disetujui');
    }

    /**
     * Scope a query to only include realisasi sesi with status 'ditolak'.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDitolak($query)
    {
        return $query->where('status', 'ditolak');
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
     * Scope a query to filter by sesi_kerja_id.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int|string  $sesiKerjaId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeBySesiKerja($query, $sesiKerjaId)
    {
        return $query->where('sesi_kerja_id', $sesiKerjaId);
    }

    /**
     * Scope a query to filter by tanggal.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $tanggal
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByTanggal($query, string $tanggal)
    {
        return $query->where('tanggal', $tanggal);
    }

    /**
     * Scope a query to filter by status.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter by sumber.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $sumber
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeBySumber($query, string $sumber)
    {
        return $query->where('sumber', $sumber);
    }

    /**
     * Scope a query to filter by date range.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('tanggal', [$startDate, $endDate]);
    }
}
