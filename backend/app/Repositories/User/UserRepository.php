<?php

namespace App\Repositories\User;

use App\Models\User;
use App\Repositories\Base\BaseRepository;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    /**
     * Create a new user repository instance.
     *
     * @param  \App\Models\User  $model
     */
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    /**
     * Get cache prefix untuk user repository.
     *
     * @return string
     */
    protected function getCachePrefix(): string
    {
        return 'user';
    }

    /**
     * Get cache TTL untuk user data (2 jam).
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 7200; // 2 jam
    }

    /**
     * Find a user by email.
     *
     * @param  string  $email
     * @return \App\Models\User|null
     */
    public function findByEmail(string $email): ?User
    {
        $cacheKey = "findByEmail:{$email}";

        return $this->remember($cacheKey, function () use ($email) {
            return $this->model->where('email', $email)->first();
        });
    }
}
