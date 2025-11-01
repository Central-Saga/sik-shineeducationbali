<?php

namespace App\Http\Controllers\Api\Base;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

abstract class BaseApiController extends Controller
{
    use ApiResponse;

    /**
     * Return a success JSON response.
     *
     * @param  mixed  $data
     * @param  string  $message
     * @param  int  $statusCode
     * @return \Illuminate\Http\JsonResponse
     */
    protected function success($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        return $this->successResponse($data, $message, $statusCode);
    }

    /**
     * Return an error JSON response.
     *
     * @param  string  $message
     * @param  int  $statusCode
     * @param  array  $errors
     * @return \Illuminate\Http\JsonResponse
     */
    protected function error(string $message = 'Error', int $statusCode = 400, array $errors = []): JsonResponse
    {
        return $this->errorResponse($message, $statusCode, $errors);
    }

    /**
     * Return a created JSON response.
     *
     * @param  mixed  $data
     * @param  string  $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function created($data = null, string $message = 'Resource created successfully'): JsonResponse
    {
        return $this->createdResponse($data, $message);
    }

    /**
     * Return a not found JSON response.
     *
     * @param  string  $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return $this->notFoundResponse($message);
    }

    /**
     * Return a validation error JSON response.
     *
     * @param  array  $errors
     * @param  string  $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function validationError(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return $this->validationErrorResponse($errors, $message);
    }
}

