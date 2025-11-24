<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KomponenGaji extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'komponen_gaji';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'gaji_id',
        'jenis',
        'nama_komponen',
        'nominal',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nominal' => 'decimal:2',
        ];
    }

    /**
     * Get the gaji that owns the komponen gaji.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function gaji(): BelongsTo
    {
        return $this->belongsTo(Gaji::class, 'gaji_id');
    }

    /**
     * Scope a query to filter by jenis.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $jenis
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByJenis($query, string $jenis)
    {
        return $query->where('jenis', $jenis);
    }

    /**
     * Scope a query to filter by gaji_id.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int|string  $gajiId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByGaji($query, $gajiId)
    {
        return $query->where('gaji_id', $gajiId);
    }
}

