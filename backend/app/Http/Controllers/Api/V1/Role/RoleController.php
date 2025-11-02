<?php

namespace App\Http\Controllers\Api\V1\Role;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Requests\Api\V1\Role\StoreRoleRequest;
use App\Http\Requests\Api\V1\Role\UpdateRoleRequest;
use App\Http\Resources\Api\V1\Role\RoleResource;
use App\Services\Contracts\RoleServiceInterface;
use Illuminate\Http\JsonResponse;

class RoleController extends BaseApiController
{
    /**
     * The role service instance.
     *
     * @var \App\Services\Contracts\RoleServiceInterface
     */
    protected RoleServiceInterface $roleService;

    /**
     * Create a new role controller instance.
     *
     * @param  \App\Services\Contracts\RoleServiceInterface  $roleService
     */
    public function __construct(RoleServiceInterface $roleService)
    {
        $this->roleService = $roleService;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $roles = $this->roleService->getAllWithPermissions();
        return $this->success(
            RoleResource::collection($roles),
            'Roles retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\Role\StoreRoleRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        // Set default guard_name if not provided
        if (!isset($validated['guard_name'])) {
            $validated['guard_name'] = 'web';
        }

        $role = $this->roleService->create($validated);
        $role->load('permissions');
        
        return $this->created(
            new RoleResource($role),
            'Role created successfully'
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
        $role = $this->roleService->getByIdWithPermissions($id);
        return $this->success(
            new RoleResource($role),
            'Role retrieved successfully'
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\Role\UpdateRoleRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateRoleRequest $request, $id): JsonResponse
    {
        $validated = $request->validated();
        $role = $this->roleService->update($id, $validated);
        $role->load('permissions');
        
        return $this->success(
            new RoleResource($role),
            'Role updated successfully'
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
        $this->roleService->delete($id);
        return $this->success(
            null,
            'Role deleted successfully'
        );
    }
}

