<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gaji extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'gaji';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'karyawan_id',
        'periode',
        'hari_cuti',
        'potongan_cuti',
        'total_gaji',
        'status',
        'dibuat_oleh',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hari_cuti' => 'integer',
            'potongan_cuti' => 'decimal:2',
            'total_gaji' => 'decimal:2',
        ];
    }

    /**
     * Get the employee that owns the gaji.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'karyawan_id');
    }

    /**
     * Get the user who created the gaji.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    /**
     * Get the komponen gaji records for the gaji.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function komponenGaji(): HasMany
    {
        return $this->hasMany(KomponenGaji::class, 'gaji_id');
    }

    /**
     * Get the pembayaran gaji records for the gaji.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function pembayaranGaji(): HasMany
    {
        return $this->hasMany(PembayaranGaji::class, 'gaji_id');
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
     * Scope a query to only include draft gaji.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope a query to only include disetujui gaji.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDisetujui($query)
    {
        return $query->where('status', 'disetujui');
    }

    /**
     * Scope a query to only include dibayar gaji.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDibayar($query)
    {
        return $query->where('status', 'dibayar');
    }
}

