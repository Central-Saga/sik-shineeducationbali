<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PembayaranGaji extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'pembayaran_gaji';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'gaji_id',
        'tanggal_transfer',
        'bukti_transfer',
        'status_pembayaran',
        'disetujui_oleh',
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
            'tanggal_transfer' => 'date',
        ];
    }

    /**
     * Get the gaji that owns the pembayaran gaji.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function gaji(): BelongsTo
    {
        return $this->belongsTo(Gaji::class, 'gaji_id');
    }

    /**
     * Get the user who approved the pembayaran gaji.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function disetujuiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
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

    /**
     * Scope a query to filter by status_pembayaran.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status_pembayaran', $status);
    }

    /**
     * Scope a query to only include menunggu pembayaran.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeMenunggu($query)
    {
        return $query->where('status_pembayaran', 'menunggu');
    }

    /**
     * Scope a query to only include berhasil pembayaran.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeBerhasil($query)
    {
        return $query->where('status_pembayaran', 'berhasil');
    }

    /**
     * Scope a query to only include gagal pembayaran.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeGagal($query)
    {
        return $query->where('status_pembayaran', 'gagal');
    }
}

