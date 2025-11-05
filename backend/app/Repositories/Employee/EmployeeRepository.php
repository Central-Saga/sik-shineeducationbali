<?php

namespace App\Repositories\Employee;

use App\Models\Employee;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\EmployeeRepositoryInterface;

class EmployeeRepository extends BaseRepository implements EmployeeRepositoryInterface
{
    /**
     * Create a new employee repository instance.
     *
     * @param  \App\Models\Employee  $model
     */
    public function __construct(Employee $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk employee repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'employee';
    }

    /**
     * Get cache TTL untuk employee data (2 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 7200; // 2 jam
    }

    /**
     * Find employees by user ID.
     *
     * @param  int|string  $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByUserId($userId): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByUserId:{$userId}";

        return $this->remember($cacheKey, function () use ($userId) {
            return $this->model->where('user_id', $userId)->get();
        });
    }

    /**
     * Find employee by user ID.
     *
     * @param  int|string  $userId
     * @return \App\Models\Employee|null
     */
    public function findOneByUserId($userId): ?Employee
    {
        $cacheKey = "findOneByUserId:{$userId}";

        return $this->remember($cacheKey, function () use ($userId) {
            return $this->model->where('user_id', $userId)->first();
        });
    }

    /**
     * Find employees by category.
     *
     * @param  string  $kategori
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKategori(string $kategori): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByKategori:{$kategori}";

        return $this->remember($cacheKey, function () use ($kategori) {
            return $this->model->where('kategori_karyawan', $kategori)->get();
        });
    }

    /**
     * Find employees by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByStatus:{$status}";

        return $this->remember($cacheKey, function () use ($status) {
            return $this->model->where('status', $status)->get();
        });
    }

    /**
     * Find active employees.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findActive(): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = 'findActive';

        return $this->remember($cacheKey, function () {
            return $this->model->active()->get();
        });
    }

    /**
     * Find employees by salary type.
     *
     * @param  string  $tipeGaji
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTipeGaji(string $tipeGaji): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findByTipeGaji:{$tipeGaji}";

        return $this->remember($cacheKey, function () use ($tipeGaji) {
            return $this->model->where('tipe_gaji', $tipeGaji)->get();
        });
    }
}

