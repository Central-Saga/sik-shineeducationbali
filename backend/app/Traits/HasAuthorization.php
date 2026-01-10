<?php

namespace App\Traits;

use Illuminate\Support\Facades\Gate;

trait HasAuthorization
{
    /**
     * Check if the current user has a specific permission.
     *
     * @param  string  $permission
     * @return bool
     */
    protected function hasPermission(string $permission): bool
    {
        $user = auth()->user();
        
        if (!$user) {
            return false;
        }

        return $user->can($permission);
    }

    /**
     * Check if the current user has any of the given permissions.
     *
     * @param  array<string>  $permissions
     * @return bool
     */
    protected function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the current user has all of the given permissions.
     *
     * @param  array<string>  $permissions
     * @return bool
     */
    protected function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if the current user has a specific role.
     *
     * @param  string  $role
     * @return bool
     */
    protected function hasRole(string $role): bool
    {
        $user = auth()->user();
        
        if (!$user) {
            return false;
        }

        return $user->hasRole($role);
    }

    /**
     * Check if the current user has any of the given roles.
     *
     * @param  array<string>  $roles
     * @return bool
     */
    protected function hasAnyRole(array $roles): bool
    {
        $user = auth()->user();
        
        if (!$user) {
            return false;
        }

        return $user->hasAnyRole($roles);
    }

    /**
     * Authorize an action using Gate or permission.
     *
     * @param  string  $ability
     * @param  mixed  $arguments
     * @return void
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    protected function authorizeAction(string $ability, ...$arguments): void
    {
        Gate::authorize($ability, $arguments);
    }
}

