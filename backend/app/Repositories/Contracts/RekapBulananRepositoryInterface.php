<?php

namespace App\Repositories\Contracts;

use App\Models\RekapBulanan;
use App\Repositories\Base\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

interface RekapBulananRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find rekap bulanan records by periode.
     *
     * @param  string  $periode
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByPeriode(string $periode): Collection;

    /**
     * Find rekap bulanan records by karyawan_id.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection;

    /**
     * Find rekap bulanan record by periode and karyawan_id.
     *
     * @param  string  $periode
     * @param  int|string  $karyawanId
     * @return \App\Models\RekapBulanan|null
     */
    public function findByPeriodeAndKaryawanId(string $periode, $karyawanId): ?RekapBulanan;
}

