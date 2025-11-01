<?php

use App\Http\Controllers\Api\V1\User\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// API Version 1
Route::prefix('v1')->group(function () {
    // Test API connection
    Route::get('/test', [UserController::class, 'test']);

    // Users API - Resource routes
    Route::apiResource('users', UserController::class);
});

