<?php

namespace App\Services\Contracts;

use App\Models\Gaji;
use App\Services\Base\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;

interface GajiServiceInterface extends BaseServiceInterface
{
    /**
     * Generate gaji from rekap bulanan.
     *
     * @param  int|string  $rekapBulananId
     * @return \App\Models\Gaji
     */
    public function generateGajiFromRekap($rekapBulananId): Gaji;

    /**
     * Calculate gaji for employee based on rekap bulanan.
     *
     * @param  \App\Models\Employee  $employee
     * @param  \App\Models\RekapBulanan  $rekap
     * @return \App\Models\Gaji
     */
    public function calculateGaji($employee, $rekap): Gaji;

    /**
     * Update gaji status.
     *
     * @param  int|string  $gajiId
     * @param  string  $status
     * @return \App\Models\Gaji
     */
    public function updateStatus($gajiId, string $status): Gaji;

    /**
     * Find gaji records by periode.
     *
     * @param  string  $periode
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByPeriode(string $periode): Collection;

    /**
     * Find gaji records by karyawan_id.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection;

    /**
     * Find gaji records by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection;
}

