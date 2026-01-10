<?php

namespace App\Repositories\Role;

use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\RoleRepositoryInterface;
use Spatie\Permission\Models\Role;

class RoleRepository extends BaseRepository implements RoleRepositoryInterface
{
    /**
     * Create a new role repository instance.
     *
     * @param  \Spatie\Permission\Models\Role  $model
     */
    public function __construct(Role $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk role repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'role';
    }

    /**
     * Get cache TTL untuk role data (2 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 7200; // 2 jam
    }

    /**
     * Find a role by name.
     *
     * @param  string  $name
     * @return \Spatie\Permission\Models\Role|null
     */
    public function findByName(string $name): ?Role
    {
        $cacheKey = "findByName:{$name}";
        
        return $this->remember($cacheKey, function () use ($name) {
            return $this->model->where('name', $name)->first();
        });
    }

    /**
     * Get role with permissions loaded.
     *
     * @param  int|string  $id
     * @return \Spatie\Permission\Models\Role|null
     */
    public function findWithPermissions($id): ?Role
    {
        $cacheKey = "findWithPermissions:{$id}";
        
        return $this->remember($cacheKey, function () use ($id) {
            return $this->model->with('permissions')->find($id);
        });
    }

    /**
     * Get all roles with permissions loaded.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findAllWithPermissions(): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "findAllWithPermissions";
        
        return $this->remember($cacheKey, function () {
            return $this->model->with('permissions')->get();
        }, 1800); // 30 menit
    }

    /**
     * Create a new role.
     *
     * @param  array<string, mixed>  $data
     * @return \Illuminate\Database\Eloquent\Model|\Spatie\Permission\Models\Role
     */
    public function create(array $data): \Illuminate\Database\Eloquent\Model
    {
        $permissions = $data['permissions'] ?? [];
        unset($data['permissions']);

        $role = $this->model->create($data);

        if (!empty($permissions)) {
            $role->syncPermissions($permissions);
        }

        // Clear cache setelah create
        $this->clearCache();

        return $role;
    }

    /**
     * Update a role by ID.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \Illuminate\Database\Eloquent\Model|\Spatie\Permission\Models\Role
     */
    public function update($id, array $data): \Illuminate\Database\Eloquent\Model
    {
        $permissions = $data['permissions'] ?? null;
        unset($data['permissions']);

        /** @var \Spatie\Permission\Models\Role $role */
        $role = parent::update($id, $data);

        if ($permissions !== null) {
            $role->syncPermissions($permissions);
        }

        // Clear specific cache
        $this->forget("find:{$id}");
        $this->forget("findWithPermissions:{$id}");
        $this->clearCache();

        return $role;
    }
}

