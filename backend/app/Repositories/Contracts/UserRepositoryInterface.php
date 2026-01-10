<?php

namespace App\Repositories\Contracts;

use App\Repositories\Base\BaseRepositoryInterface;
use App\Models\User;

interface UserRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find a user by email.
     *
     * @param  string  $email
     * @return \App\Models\User|null
     */
    public function findByEmail(string $email): ?User;
}

