<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SesiKerja extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sesi_kerja';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'kategori',
        'hari',
        'nomor_sesi',
        'jam_mulai',
        'jam_selesai',
        'tarif',
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
            'jam_mulai' => 'datetime:H:i:s',
            'jam_selesai' => 'datetime:H:i:s',
            'tarif' => 'decimal:2',
        ];
    }

    /**
     * Scope a query to only include sessions with kategori 'coding'.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCoding($query)
    {
        return $query->where('kategori', 'coding');
    }

    /**
     * Scope a query to only include sessions with kategori 'non_coding'.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeNonCoding($query)
    {
        return $query->where('kategori', 'non_coding');
    }

    /**
     * Scope a query to only include sessions with status 'aktif'.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Scope a query to only include sessions with status 'non aktif'.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeNonAktif($query)
    {
        return $query->where('status', 'non aktif');
    }

    /**
     * Scope a query to filter by hari.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $hari
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeHari($query, string $hari)
    {
        return $query->where('hari', $hari);
    }

    /**
     * Scope a query to filter by kategori and hari.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $kategori
     * @param  string  $hari
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeKategoriHari($query, string $kategori, string $hari)
    {
        return $query->where('kategori', $kategori)->where('hari', $hari);
    }
}

