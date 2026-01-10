<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class LogAbsensi extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'log_absensi';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'absensi_id',
        'jenis',
        'waktu',
        'latitude',
        'longitude',
        'akurasi',
        'foto_selfie',
        'sumber',
        'validasi_gps',
        'latitude_referensi',
        'longitude_referensi',
        'radius_min',
        'radius_max',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'waktu' => 'datetime',
            'latitude' => 'decimal:6',
            'longitude' => 'decimal:6',
            'latitude_referensi' => 'decimal:6',
            'longitude_referensi' => 'decimal:6',
            'validasi_gps' => 'boolean',
        ];
    }

    /**
     * Get the attendance that owns the log.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function absensi(): BelongsTo
    {
        return $this->belongsTo(Absensi::class);
    }

    /**
     * Scope a query to only include check-in logs.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCheckIn($query)
    {
        return $query->where('jenis', 'check_in');
    }

    /**
     * Scope a query to only include check-out logs.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCheckOut($query)
    {
        return $query->where('jenis', 'check_out');
    }

    /**
     * Scope a query to only include validated GPS logs.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeValidated($query)
    {
        return $query->where('validasi_gps', true);
    }

    /**
     * Scope a query to only include unvalidated GPS logs.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeUnvalidated($query)
    {
        return $query->where('validasi_gps', false);
    }

    /**
     * Scope a query to filter by source (mobile or web).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $sumber
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSumber($query, string $sumber)
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
        return $query->whereBetween('waktu', [$startDate, $endDate]);
    }
}

