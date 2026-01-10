<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ApiException extends Exception
{
    /**
     * HTTP status code for the exception.
     *
     * @var int
     */
    protected $statusCode;

    /**
     * Additional errors data.
     *
     * @var array
     */
    protected $errors;

    /**
     * Create a new API exception instance.
     *
     * @param  string  $message
     * @param  int  $statusCode
     * @param  array  $errors
     * @param  \Throwable|null  $previous
     */
    public function __construct(string $message = 'An error occurred', int $statusCode = Response::HTTP_BAD_REQUEST, array $errors = [], ?\Throwable $previous = null)
    {
        parent::__construct($message, 0, $previous);
        $this->statusCode = $statusCode;
        $this->errors = $errors;
    }

    /**
     * Get the HTTP status code.
     *
     * @return int
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    /**
     * Get the additional errors.
     *
     * @return array
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * Render the exception as an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return JsonResponse
     */
    public function render($request): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $this->getMessage(),
        ];

        if (!empty($this->errors)) {
            $response['errors'] = $this->errors;
        }

        if (config('app.debug')) {
            $response['trace'] = $this->getTrace();
        }

        return response()->json($response, $this->statusCode);
    }
}

