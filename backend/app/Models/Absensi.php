<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Absensi extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'absensi';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'karyawan_id',
        'tanggal',
        'status_kehadiran',
        'jam_masuk',
        'jam_pulang',
        'durasi_kerja',
        'sumber_absen',
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
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Otomatis menghitung durasi_kerja ketika jam_masuk dan jam_pulang diisi
        static::saving(function ($absensi) {
            if ($absensi->status_kehadiran === 'hadir' && $absensi->jam_masuk && $absensi->jam_pulang) {
                $absensi->durasi_kerja = $absensi->calculateDurasiKerja();
            } elseif ($absensi->status_kehadiran !== 'hadir') {
                // Jika status bukan hadir, set jam_masuk, jam_pulang, dan durasi_kerja ke null
                $absensi->jam_masuk = null;
                $absensi->jam_pulang = null;
                $absensi->durasi_kerja = null;
            }
        });
    }

    /**
     * Calculate durasi kerja dalam menit dari jam_masuk dan jam_pulang.
     *
     * @return int|null
     */
    protected function calculateDurasiKerja(): ?int
    {
        if (!$this->jam_masuk || !$this->jam_pulang) {
            return null;
        }

        // Parse time string (format H:i:s) ke Carbon
        $jamMasuk = \Carbon\Carbon::createFromTimeString($this->jam_masuk);
        $jamPulang = \Carbon\Carbon::createFromTimeString($this->jam_pulang);

        // Jika jam_pulang lebih kecil dari jam_masuk, berarti melewati tengah malam
        if ($jamPulang->lessThan($jamMasuk)) {
            $jamPulang->addDay();
        }

        return $jamMasuk->diffInMinutes($jamPulang);
    }

    /**
     * Get the employee that owns the attendance.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'karyawan_id');
    }

    /**
     * Scope a query to only include present attendance (hadir).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeHadir($query)
    {
        return $query->where('status_kehadiran', 'hadir');
    }

    /**
     * Scope a query to only include leave attendance (izin).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeIzin($query)
    {
        return $query->where('status_kehadiran', 'izin');
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
