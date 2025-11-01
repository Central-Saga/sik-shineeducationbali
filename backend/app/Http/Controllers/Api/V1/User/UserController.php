<?php

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Requests\Api\V1\User\StoreUserRequest;
use App\Http\Requests\Api\V1\User\UpdateUserRequest;
use App\Http\Resources\Api\V1\User\UserResource;
use App\Services\Contracts\UserServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends BaseApiController
{
    /**
     * The user service instance.
     *
     * @var \App\Services\Contracts\UserServiceInterface
     */
    protected UserServiceInterface $userService;

    /**
     * Create a new user controller instance.
     *
     * @param  \App\Services\Contracts\UserServiceInterface  $userService
     */
    public function __construct(UserServiceInterface $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $users = $this->userService->getAll()->load('roles');
        return $this->success(
            UserResource::collection($users),
            'Users retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\User\StoreUserRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());
        return $this->created(
            new UserResource($user),
            'User created successfully'
        );
    }

    /**
     * Display the specified resource.
     *
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {
        $user = $this->userService->getById($id);
        $user->load('roles');
        return $this->success(
            new UserResource($user),
            'User retrieved successfully'
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\User\UpdateUserRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateUserRequest $request, $id): JsonResponse
    {
        $user = $this->userService->update($id, $request->validated());
        return $this->success(
            new UserResource($user),
            'User updated successfully'
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $this->userService->delete($id);
        return $this->success(
            null,
            'User deleted successfully'
        );
    }

    /**
     * Test endpoint untuk check API connection.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function test(): JsonResponse
    {
        return $this->success(
            null,
            'API is working! Backend connected successfully.',
            200
        )->header('X-Backend-Version', app()->version());
    }
}

