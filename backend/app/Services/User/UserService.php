<?php

namespace App\Services\User;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\UserServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;

class UserService extends BaseService implements UserServiceInterface
{
    /**
     * Create a new user service instance.
     *
     * @param  \App\Repositories\Contracts\UserRepositoryInterface  $repository
     */
    public function __construct(UserRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\UserRepositoryInterface
     */
    protected function getRepository(): UserRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Get all users.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getAll(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola users')) {
            abort(403, 'You do not have permission to view users.');
        }

        return parent::getAll();
    }

    /**
     * Get a user by ID.
     *
     * @param  int|string  $id
     * @return \App\Models\User
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getById($id): User
    {
        // Check permission
        if (!$this->hasPermission('mengelola users')) {
            abort(403, 'You do not have permission to view users.');
        }

        return parent::getById($id);
    }

    /**
     * Get a user by email.
     *
     * @param  string  $email
     * @return \App\Models\User|null
     */
    public function getByEmail(string $email): ?User
    {
        return $this->getRepository()->findByEmail($email);
    }

    /**
     * Create a new user.
     *
     * @param  array<string, mixed>  $data
     * @return \App\Models\User
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(array $data): User
    {
        // Check permission
        if (!$this->hasPermission('mengelola users')) {
            abort(403, 'You do not have permission to create users.');
        }

        // Hash password if provided
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        return parent::create($data);
    }

    /**
     * Update a user by ID.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \App\Models\User
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update($id, array $data): User
    {
        // Check permission
        if (!$this->hasPermission('mengelola users')) {
            abort(403, 'You do not have permission to edit users.');
        }

        // Hash password if provided
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        return parent::update($id, $data);
    }

    /**
     * Delete a user by ID.
     *
     * @param  int|string  $id
     * @return bool
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function delete($id): bool
    {
        // Check permission
        if (!$this->hasPermission('mengelola users')) {
            abort(403, 'You do not have permission to delete users.');
        }

        return parent::delete($id);
    }
}

