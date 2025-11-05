<?php

namespace App\Services\Role;

use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\RoleServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Role;

class RoleService extends BaseService implements RoleServiceInterface
{
    /**
     * Create a new role service instance.
     *
     * @param  \App\Repositories\Contracts\RoleRepositoryInterface  $repository
     */
    public function __construct(RoleRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\RoleRepositoryInterface
     */
    protected function getRepository(): RoleRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Get all roles.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getAll(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola roles')) {
            abort(403, 'You do not have permission to view roles.');
        }

        return parent::getAll();
    }

    /**
     * Get a role by ID.
     *
     * @param  int|string  $id
     * @return \Spatie\Permission\Models\Role
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getById($id): Role
    {
        // Check permission
        if (!$this->hasPermission('mengelola roles')) {
            abort(403, 'You do not have permission to view roles.');
        }

        return parent::getById($id);
    }

    /**
     * Get a role by name.
     *
     * @param  string  $name
     * @return \Spatie\Permission\Models\Role|null
     */
    public function getByName(string $name): ?Role
    {
        return $this->getRepository()->findByName($name);
    }

    /**
     * Get role with permissions.
     *
     * @param  int|string  $id
     * @return \Spatie\Permission\Models\Role
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getByIdWithPermissions($id): Role
    {
        // Check permission
        if (!$this->hasPermission('mengelola roles')) {
            abort(403, 'You do not have permission to view roles.');
        }

        $role = $this->getRepository()->findWithPermissions($id);
        
        if (!$role) {
            throw new \App\Exceptions\NotFoundException("Role with ID {$id} not found");
        }

        return $role;
    }

    /**
     * Get all roles with permissions.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getAllWithPermissions(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola roles')) {
            abort(403, 'You do not have permission to view roles.');
        }

        return $this->getRepository()->findAllWithPermissions();
    }

    /**
     * Create a new role.
     *
     * @param  array<string, mixed>  $data
     * @return \Spatie\Permission\Models\Role
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(array $data): Role
    {
        // Check permission
        if (!$this->hasPermission('mengelola roles')) {
            abort(403, 'You do not have permission to create roles.');
        }

        // Clear permission cache after creating role
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        /** @var \Spatie\Permission\Models\Role $role */
        $role = $this->getRepository()->create($data);
        return $role;
    }

    /**
     * Update a role by ID.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \Spatie\Permission\Models\Role
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update($id, array $data): Role
    {
        // Check permission
        if (!$this->hasPermission('mengelola roles')) {
            abort(403, 'You do not have permission to edit roles.');
        }

        // Clear permission cache after updating role
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        /** @var \Spatie\Permission\Models\Role $role */
        $role = $this->getRepository()->update($id, $data);
        return $role;
    }

    /**
     * Delete a role by ID.
     *
     * @param  int|string  $id
     * @return bool
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function delete($id): bool
    {
        // Check permission
        if (!$this->hasPermission('mengelola roles')) {
            abort(403, 'You do not have permission to delete roles.');
        }

        $deleted = parent::delete($id);

        // Clear permission cache after deleting role
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return $deleted;
    }
}

