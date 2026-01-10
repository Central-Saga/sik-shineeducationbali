<?php

namespace App\Services\Contracts;

use App\Services\Base\BaseServiceInterface;
use Spatie\Permission\Models\Role;

interface RoleServiceInterface extends BaseServiceInterface
{
    /**
     * Get a role by name.
     *
     * @param  string  $name
     * @return \Spatie\Permission\Models\Role|null
     */
    public function getByName(string $name): ?Role;

    /**
     * Get role with permissions.
     *
     * @param  int|string  $id
     * @return \Spatie\Permission\Models\Role
     */
    public function getByIdWithPermissions($id): Role;

    /**
     * Get all roles with permissions.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllWithPermissions(): \Illuminate\Database\Eloquent\Collection;
}

