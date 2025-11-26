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

        // Get current authenticated user
        $currentUser = auth()->user();
        if (!$currentUser) {
            abort(401, 'User not authenticated.');
        }
        $currentUser->load('roles');

        // Get user yang akan dihapus
        $user = $this->getById($id);
        $user->load('roles');

        // Validasi 1: User tidak bisa menghapus akun mereka sendiri
        if ($currentUser->id == $user->id) {
            abort(422, 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        // Cek apakah user yang akan dihapus memiliki role Admin atau Owner
        $targetIsAdminOrOwner = $user->hasRole(['Admin', 'Owner']);
        
        // Cek apakah current user adalah Admin atau Owner
        $currentIsAdmin = $currentUser->hasRole('Admin');
        $currentIsOwner = $currentUser->hasRole('Owner');
        
        // Validasi 2: Admin tidak bisa menghapus Admin atau Owner
        if ($currentIsAdmin && $targetIsAdminOrOwner) {
            abort(422, 'Admin tidak dapat menghapus akun Admin atau Owner.');
        }
        // Owner bisa menghapus Admin (tidak ada restriksi khusus)

        // Validasi 3: Cek apakah user yang akan dihapus adalah Admin/Owner terakhir
        if ($targetIsAdminOrOwner) {
            // Hitung jumlah user lain yang memiliki role Admin atau Owner
            $adminOwnerCount = User::role(['Admin', 'Owner'])->count();

            // Jika hanya ada 1 Admin/Owner, tidak boleh dihapus
            if ($adminOwnerCount <= 1) {
                abort(422, 'Tidak dapat menghapus Admin/Owner terakhir. Sistem memerlukan setidaknya satu akun Admin atau Owner. Silakan buat akun Admin/Owner baru terlebih dahulu.');
            }
        }

        return parent::delete($id);
    }
}

