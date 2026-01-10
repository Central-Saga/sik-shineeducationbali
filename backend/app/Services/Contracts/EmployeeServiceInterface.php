<?php

namespace App\Services\Contracts;

use App\Models\Employee;
use App\Services\Base\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;

interface EmployeeServiceInterface extends BaseServiceInterface
{
    /**
     * Find employees by user ID.
     *
     * @param  int|string  $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByUserId($userId): Collection;

    /**
     * Find employee by user ID.
     *
     * @param  int|string  $userId
     * @return \App\Models\Employee|null
     */
    public function findOneByUserId($userId): ?Employee;

    /**
     * Find employees by category.
     *
     * @param  string  $kategori
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKategori(string $kategori): Collection;

    /**
     * Find employees by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection;

    /**
     * Find active employees.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findActive(): Collection;

    /**
     * Find employees by salary type.
     *
     * @param  string  $tipeGaji
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTipeGaji(string $tipeGaji): Collection;
}

