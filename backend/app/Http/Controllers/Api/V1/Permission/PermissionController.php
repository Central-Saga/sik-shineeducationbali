<?php

namespace App\Http\Controllers\Api\V1\Permission;

use App\Http\Controllers\Api\Base\BaseApiController;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;

class PermissionController extends BaseApiController
{
    /**
     * Display a listing of permissions.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        // Check permission
        if (!auth()->user() || !auth()->user()->can('mengelola permissions')) {
            return $this->forbidden('You do not have permission to view permissions.');
        }

        $permissions = Permission::orderBy('name')->get();

        return $this->success(
            $permissions->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'guard_name' => $permission->guard_name,
                    'created_at' => $permission->created_at?->toDateTimeString(),
                ];
            }),
            'Permissions retrieved successfully'
        );
    }
}

