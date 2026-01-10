<?php

namespace App\Services\Base;

use App\Repositories\Base\BaseRepositoryInterface;
use App\Traits\HasAuthorization;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

abstract class BaseService implements BaseServiceInterface
{
    use HasAuthorization;
    /**
     * The repository instance.
     *
     * @var \App\Repositories\Base\BaseRepositoryInterface
     */
    protected BaseRepositoryInterface $repository;

    /**
     * Create a new service instance.
     *
     * @param  \App\Repositories\Base\BaseRepositoryInterface  $repository
     */
    public function __construct(BaseRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get all records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAll(): Collection
    {
        return $this->repository->findAll();
    }

    /**
     * Get a record by ID.
     *
     * @param  int|string  $id
     * @return \Illuminate\Database\Eloquent\Model
     * @throws \App\Exceptions\NotFoundException
     */
    public function getById($id): Model
    {
        return $this->repository->findOrFail($id);
    }

    /**
     * Create a new record.
     *
     * @param  array<string, mixed>  $data
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function create(array $data): Model
    {
        return DB::transaction(function () use ($data) {
            return $this->repository->create($data);
        });
    }

    /**
     * Update a record by ID.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \Illuminate\Database\Eloquent\Model
     * @throws \App\Exceptions\NotFoundException
     */
    public function update($id, array $data): Model
    {
        return DB::transaction(function () use ($id, $data) {
            return $this->repository->update($id, $data);
        });
    }

    /**
     * Delete a record by ID.
     *
     * @param  int|string  $id
     * @return bool
     * @throws \App\Exceptions\NotFoundException
     */
    public function delete($id): bool
    {
        return DB::transaction(function () use ($id) {
            return $this->repository->delete($id);
        });
    }

    /**
     * Paginate records.
     *
     * @param  int  $perPage
     * @param  string  $pageName
     * @param  int|null  $page
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15, string $pageName = 'page', ?int $page = null): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage, ['*'], $pageName, $page);
    }
}

