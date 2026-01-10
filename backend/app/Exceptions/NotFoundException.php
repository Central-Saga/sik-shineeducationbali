<?php

namespace App\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class NotFoundException extends ApiException
{
    /**
     * Create a new not found exception instance.
     *
     * @param  string  $message
     * @param  array  $errors
     */
    public function __construct(string $message = 'Resource not found', array $errors = [])
    {
        parent::__construct($message, Response::HTTP_NOT_FOUND, $errors);
    }
}

