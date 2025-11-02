<?php

namespace App\Repositories\Contracts;

use App\Repositories\Base\BaseRepositoryInterface;
use Spatie\Permission\Models\Role;

interface RoleRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find a role by name.
     *
     * @param  string  $name
     * @return \Spatie\Permission\Models\Role|null
     */
    public function findByName(string $name): ?Role;

    /**
     * Get role with permissions loaded.
     *
     * @param  int|string  $id
     * @return \Spatie\Permission\Models\Role|null
     */
    public function findWithPermissions($id): ?Role;

    /**
     * Get all roles with permissions loaded.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findAllWithPermissions(): \Illuminate\Database\Eloquent\Collection;
}

