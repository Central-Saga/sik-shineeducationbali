<?php

namespace App\Services\Contracts;

use App\Models\RekapBulanan;
use App\Services\Base\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;

interface RekapBulananServiceInterface extends BaseServiceInterface
{
    /**
     * Generate rekap bulanan for all active employees for a given periode.
     *
     * @param  string  $periode
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function generateRekapBulanan(string $periode): Collection;

    /**
     * Calculate and create/update rekap bulanan for a specific employee.
     *
     * @param  \App\Models\Employee  $employee
     * @param  string  $periode
     * @return \App\Models\RekapBulanan
     */
    public function calculateRekapForEmployee($employee, string $periode): RekapBulanan;

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

