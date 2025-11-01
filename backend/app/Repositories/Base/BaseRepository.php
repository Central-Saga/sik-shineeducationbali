<?php

namespace App\Repositories\Base;

use App\Exceptions\NotFoundException;
use App\Repositories\Base\CacheableRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository implements BaseRepositoryInterface
{
    use CacheableRepository;

    /**
     * The model instance.
     *
     * @var \Illuminate\Database\Eloquent\Model
     */
    protected Model $model;

    /**
     * Create a new repository instance.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Get cache prefix untuk repository ini.
     * Default menggunakan nama model dalam lowercase.
     * Bisa di-override di child class untuk custom prefix.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return strtolower(class_basename($this->model));
    }

    /**
     * Get all records.
     *
     * @param  array<string>  $columns
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findAll(array $columns = ['*']): Collection
    {
        $columnsKey = implode(',', $columns);
        $cacheKey = "findAll:{$columnsKey}";

        // Cache untuk 30 menit untuk list data
        return $this->remember($cacheKey, function () use ($columns) {
            return $this->model->select($columns)->get();
        }, 1800);
    }

    /**
     * Find a record by ID.
     *
     * @param  int|string  $id
     * @param  array<string>  $columns
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function find($id, array $columns = ['*']): ?Model
    {
        $columnsKey = implode(',', $columns);
        $cacheKey = "find:{$id}:{$columnsKey}";

        return $this->remember($cacheKey, function () use ($id, $columns) {
            return $this->model->select($columns)->find($id);
        });
    }

    /**
     * Find a record by ID or throw exception.
     *
     * @param  int|string  $id
     * @param  array<string>  $columns
     * @return \Illuminate\Database\Eloquent\Model
     * @throws \App\Exceptions\NotFoundException
     */
    public function findOrFail($id, array $columns = ['*']): Model
    {
        $record = $this->find($id, $columns);

        if (!$record) {
            throw new NotFoundException($this->getNotFoundMessage($id));
        }

        return $record;
    }

    /**
     * Find records by criteria.
     *
     * @param  array<string, mixed>  $criteria
     * @param  array<string>  $columns
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findBy(array $criteria, array $columns = ['*']): Collection
    {
        $criteriaKey = md5(json_encode($criteria));
        $columnsKey = implode(',', $columns);
        $cacheKey = "findBy:{$criteriaKey}:{$columnsKey}";

        return $this->remember($cacheKey, function () use ($criteria, $columns) {
            $query = $this->model->select($columns);

            foreach ($criteria as $key => $value) {
                if (is_array($value)) {
                    $query->whereIn($key, $value);
                } else {
                    $query->where($key, $value);
                }
            }

            return $query->get();
        }, 1800); // 30 menit untuk query dengan criteria
    }

    /**
     * Find a single record by criteria.
     *
     * @param  array<string, mixed>  $criteria
     * @param  array<string>  $columns
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function findOneBy(array $criteria, array $columns = ['*']): ?Model
    {
        $criteriaKey = md5(json_encode($criteria));
        $columnsKey = implode(',', $columns);
        $cacheKey = "findOneBy:{$criteriaKey}:{$columnsKey}";

        return $this->remember($cacheKey, function () use ($criteria, $columns) {
            return $this->findBy($criteria, $columns)->first();
        });
    }

    /**
     * Create a new record.
     *
     * @param  array<string, mixed>  $data
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function create(array $data): Model
    {
        $model = $this->model->create($data);

        // Clear cache setelah create
        $this->clearCache();

        return $model;
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
        $record = $this->findOrFail($id);
        $record->update($data);
        $record->refresh();

        // Clear specific cache dan related caches
        $this->forget("find:{$id}");
        $this->clearCache();

        return $record;
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
        $record = $this->findOrFail($id);
        $deleted = $record->delete();

        // Clear cache setelah delete
        $this->forget("find:{$id}");
        $this->clearCache();

        return $deleted;
    }

    /**
     * Paginate records.
     *
     * @param  int  $perPage
     * @param  array<string>  $columns
     * @param  string  $pageName
     * @param  int|null  $page
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15, array $columns = ['*'], string $pageName = 'page', ?int $page = null): LengthAwarePaginator
    {
        $page = $page ?? request()->input($pageName, 1);
        $columnsKey = implode(',', $columns);
        $cacheKey = "paginate:{$perPage}:{$page}:{$columnsKey}";

        // Cache pagination untuk 15 menit
        return $this->remember($cacheKey, function () use ($perPage, $columns, $pageName, $page) {
            return $this->model->select($columns)->paginate($perPage, $columns, $pageName, $page);
        }, 900);
    }

    /**
     * Get the not found message for the model.
     *
     * @param  int|string  $id
     * @return string
     */
    protected function getNotFoundMessage($id): string
    {
        $modelName = class_basename($this->model);
        return sprintf('%s with ID %s not found', $modelName, $id);
    }
}
