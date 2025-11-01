<?php

namespace App\Repositories\Base;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface BaseRepositoryInterface
{
    /**
     * Get all records.
     *
     * @param  array<string>  $columns
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findAll(array $columns = ['*']): Collection;

    /**
     * Find a record by ID.
     *
     * @param  int|string  $id
     * @param  array<string>  $columns
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function find($id, array $columns = ['*']): ?Model;

    /**
     * Find a record by ID or throw exception.
     *
     * @param  int|string  $id
     * @param  array<string>  $columns
     * @return \Illuminate\Database\Eloquent\Model
     * @throws \App\Exceptions\NotFoundException
     */
    public function findOrFail($id, array $columns = ['*']): Model;

    /**
     * Find records by criteria.
     *
     * @param  array<string, mixed>  $criteria
     * @param  array<string>  $columns
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findBy(array $criteria, array $columns = ['*']): Collection;

    /**
     * Find a single record by criteria.
     *
     * @param  array<string, mixed>  $criteria
     * @param  array<string>  $columns
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function findOneBy(array $criteria, array $columns = ['*']): ?Model;

    /**
     * Create a new record.
     *
     * @param  array<string, mixed>  $data
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function create(array $data): Model;

    /**
     * Update a record by ID.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \Illuminate\Database\Eloquent\Model
     * @throws \App\Exceptions\NotFoundException
     */
    public function update($id, array $data): Model;

    /**
     * Delete a record by ID.
     *
     * @param  int|string  $id
     * @return bool
     * @throws \App\Exceptions\NotFoundException
     */
    public function delete($id): bool;

    /**
     * Paginate records.
     *
     * @param  int  $perPage
     * @param  array<string>  $columns
     * @param  string  $pageName
     * @param  int|null  $page
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15, array $columns = ['*'], string $pageName = 'page', ?int $page = null): LengthAwarePaginator;
}

