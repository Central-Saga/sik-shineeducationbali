<?php

namespace App\Services\Base;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface BaseServiceInterface
{
    /**
     * Get all records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAll(): Collection;

    /**
     * Get a record by ID.
     *
     * @param  int|string  $id
     * @return \Illuminate\Database\Eloquent\Model
     * @throws \App\Exceptions\NotFoundException
     */
    public function getById($id): Model;

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
     * @param  string  $pageName
     * @param  int|null  $page
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15, string $pageName = 'page', ?int $page = null): LengthAwarePaginator;
}

