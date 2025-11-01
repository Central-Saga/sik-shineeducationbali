<?php

namespace App\Exceptions;

use Illuminate\Contracts\Validation\Validator;
use Symfony\Component\HttpFoundation\Response;

class ValidationException extends ApiException
{
    /**
     * The validator instance.
     *
     * @var \Illuminate\Contracts\Validation\Validator
     */
    protected $validator;

    /**
     * Create a new validation exception instance.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @param  string  $message
     */
    public function __construct(Validator $validator, string $message = 'Validation failed')
    {
        parent::__construct($message, Response::HTTP_UNPROCESSABLE_ENTITY, $validator->errors()->toArray());
        $this->validator = $validator;
    }

    /**
     * Get the validator instance.
     *
     * @return \Illuminate\Contracts\Validation\Validator
     */
    public function getValidator(): Validator
    {
        return $this->validator;
    }
}

