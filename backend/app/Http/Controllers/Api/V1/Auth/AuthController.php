<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\Api\V1\User\UserResource;
use App\Services\Contracts\UserServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends BaseApiController
{
    /**
     * The user service instance.
     *
     * @var \App\Services\Contracts\UserServiceInterface
     */
    protected UserServiceInterface $userService;

    /**
     * Create a new auth controller instance.
     *
     * @param  \App\Services\Contracts\UserServiceInterface  $userService
     */
    public function __construct(UserServiceInterface $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Register a new user.
     *
     * @param  \App\Http\Requests\Api\V1\Auth\RegisterRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        // Create token for the newly registered user
        $token = $user->createToken('auth-token')->plainTextToken;
        $user->load('roles');

        return $this->created(
            [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'User registered successfully'
        );
    }

    /**
     * Authenticate user and return token.
     *
     * @param  \App\Http\Requests\Api\V1\Auth\LoginRequest  $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->userService->getByEmail($request->email);

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Revoke all existing tokens (optional, untuk security)
        // $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;
        $user->load('roles');

        return $this->success(
            [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            'Login successful'
        );
    }

    /**
     * Get authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(): JsonResponse
    {
        $user = auth()->user();
        $user->load('roles.permissions');

        // Load employee relationship if exists
        if ($user->employee) {
            $user->load('employee');
        }

        return $this->success(
            new UserResource($user),
            'User retrieved successfully'
        );
    }

    /**
     * Logout user (revoke current token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(): JsonResponse
    {
        // Revoke current token
        auth()->user()->currentAccessToken()->delete();

        return $this->success(
            null,
            'Logged out successfully'
        );
    }

    /**
     * Logout from all devices (revoke all tokens).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logoutAll(): JsonResponse
    {
        // Revoke all tokens
        auth()->user()->tokens()->delete();

        return $this->success(
            null,
            'Logged out from all devices successfully'
        );
    }
}
