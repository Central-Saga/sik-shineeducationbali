<?php

namespace App\Repositories\Contracts;

use App\Models\SesiKerja;
use App\Repositories\Base\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

interface SesiKerjaRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find sesi kerja records by kategori.
     *
     * @param  string  $kategori
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKategori(string $kategori): Collection;

    /**
     * Find sesi kerja records by hari.
     *
     * @param  string  $hari
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByHari(string $hari): Collection;

    /**
     * Find sesi kerja records by kategori and hari.
     *
     * @param  string  $kategori
     * @param  string  $hari
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKategoriHari(string $kategori, string $hari): Collection;

    /**
     * Find active sesi kerja records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findAktif(): Collection;

    /**
     * Find sesi kerja records by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection;
}

