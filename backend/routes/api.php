<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Permission\PermissionController;
use App\Http\Controllers\Api\V1\Role\RoleController;
use App\Http\Controllers\Api\V1\User\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// API Version 1
Route::prefix('v1')->group(function () {
    // Test API connection (public, no auth needed)
    Route::get('/test', [UserController::class, 'test']);

    // Authentication routes (public)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Users API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/users', [UserController::class, 'index'])->middleware('permission:users.view');
        Route::post('/users', [UserController::class, 'store'])->middleware('permission:users.create');
        Route::get('/users/{id}', [UserController::class, 'show'])->middleware('permission:users.view');
        Route::put('/users/{id}', [UserController::class, 'update'])->middleware('permission:users.edit');
        Route::patch('/users/{id}', [UserController::class, 'update'])->middleware('permission:users.edit');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('permission:users.delete');
    });

    // Roles API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:roles.view');
        Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:roles.create');
        Route::get('/roles/{id}', [RoleController::class, 'show'])->middleware('permission:roles.view');
        Route::put('/roles/{id}', [RoleController::class, 'update'])->middleware('permission:roles.edit');
        Route::patch('/roles/{id}', [RoleController::class, 'update'])->middleware('permission:roles.edit');
        Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
    });

    // Permissions API - Read only with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:permissions.view');
    });

    // Auth routes (protected - requires authentication)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    });
});

