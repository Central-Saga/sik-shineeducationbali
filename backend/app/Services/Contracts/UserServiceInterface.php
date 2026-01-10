<?php

namespace App\Services\Contracts;

use App\Models\User;
use App\Services\Base\BaseServiceInterface;

interface UserServiceInterface extends BaseServiceInterface
{
    /**
     * Get a user by email.
     *
     * @param  string  $email
     * @return \App\Models\User|null
     */
    public function getByEmail(string $email): ?User;
}

