<?php

use App\Http\Controllers\Api\V1\Absensi\AbsensiController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Cuti\CutiController;
use App\Http\Controllers\Api\V1\Employee\EmployeeController;
use App\Http\Controllers\Api\V1\LogAbsensi\LogAbsensiController;
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
        Route::get('/users', [UserController::class, 'index'])->middleware('permission:mengelola users');
        Route::post('/users', [UserController::class, 'store'])->middleware('permission:mengelola users');
        Route::get('/users/{id}', [UserController::class, 'show'])->middleware('permission:mengelola users');
        Route::put('/users/{id}', [UserController::class, 'update'])->middleware('permission:mengelola users');
        Route::patch('/users/{id}', [UserController::class, 'update'])->middleware('permission:mengelola users');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('permission:mengelola users');
    });

    // Roles API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:mengelola roles');
        Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:mengelola roles');
        Route::get('/roles/{id}', [RoleController::class, 'show'])->middleware('permission:mengelola roles');
        Route::put('/roles/{id}', [RoleController::class, 'update'])->middleware('permission:mengelola roles');
        Route::patch('/roles/{id}', [RoleController::class, 'update'])->middleware('permission:mengelola roles');
        Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->middleware('permission:mengelola roles');
    });

    // Permissions API - Read only with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:mengelola permissions');
    });

    // Employees API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/employees', [EmployeeController::class, 'index'])->middleware('permission:mengelola karyawan');
        Route::post('/employees', [EmployeeController::class, 'store'])->middleware('permission:mengelola karyawan');
        Route::get('/employees/{id}', [EmployeeController::class, 'show'])->middleware('permission:mengelola karyawan');
        Route::put('/employees/{id}', [EmployeeController::class, 'update'])->middleware('permission:mengelola karyawan');
        Route::patch('/employees/{id}', [EmployeeController::class, 'update'])->middleware('permission:mengelola karyawan');
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])->middleware('permission:mengelola karyawan');
    });

    // Absensi API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        // Additional routes for absensi (must be before standard CRUD routes to avoid route conflicts)
        // Get attendance by employee ID
        Route::get('/absensi/karyawan/{karyawanId}', [AbsensiController::class, 'byKaryawan'])->middleware('permission:mengelola absensi|melihat gaji');
        
        // Get attendance by employee ID and date
        Route::get('/absensi/karyawan/{karyawanId}/tanggal/{tanggal}', [AbsensiController::class, 'byKaryawanAndTanggal'])->middleware('permission:melakukan absensi|mengelola absensi');
        
        // Get present attendance records (hadir)
        Route::get('/absensi/hadir', [AbsensiController::class, 'hadir'])->middleware('permission:mengelola absensi');

        // Standard CRUD routes - requires 'mengelola absensi' permission
        Route::get('/absensi', [AbsensiController::class, 'index'])->middleware('permission:mengelola absensi');
        Route::post('/absensi', [AbsensiController::class, 'store'])->middleware('permission:melakukan absensi|mengelola absensi');
        Route::get('/absensi/{id}', [AbsensiController::class, 'show'])->middleware('permission:mengelola absensi');
        Route::put('/absensi/{id}', [AbsensiController::class, 'update'])->middleware('permission:mengelola absensi');
        Route::patch('/absensi/{id}', [AbsensiController::class, 'update'])->middleware('permission:mengelola absensi');
        Route::delete('/absensi/{id}', [AbsensiController::class, 'destroy'])->middleware('permission:mengelola absensi');
    });

    // Log Absensi API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        // Additional routes for log absensi (must be before standard CRUD routes to avoid route conflicts)
        // Get log by absensi ID
        Route::get('/log-absensi/absensi/{absensiId}', [LogAbsensiController::class, 'byAbsensi'])->middleware('permission:melakukan absensi|mengelola absensi');
        
        // Get check-in log for specific absensi
        Route::get('/log-absensi/absensi/{absensiId}/check-in', [LogAbsensiController::class, 'checkInByAbsensi'])->middleware('permission:melakukan absensi|mengelola absensi');
        
        // Get check-out log for specific absensi
        Route::get('/log-absensi/absensi/{absensiId}/check-out', [LogAbsensiController::class, 'checkOutByAbsensi'])->middleware('permission:melakukan absensi|mengelola absensi');
        
        // Get check-in log records
        Route::get('/log-absensi/check-in', [LogAbsensiController::class, 'checkIn'])->middleware('permission:mengelola absensi');
        
        // Get check-out log records
        Route::get('/log-absensi/check-out', [LogAbsensiController::class, 'checkOut'])->middleware('permission:mengelola absensi');
        
        // Get validated GPS log records
        Route::get('/log-absensi/validated', [LogAbsensiController::class, 'validated'])->middleware('permission:mengelola absensi');
        
        // Get unvalidated GPS log records
        Route::get('/log-absensi/unvalidated', [LogAbsensiController::class, 'unvalidated'])->middleware('permission:mengelola absensi');

        // Standard CRUD routes
        Route::get('/log-absensi', [LogAbsensiController::class, 'index'])->middleware('permission:mengelola absensi|melakukan absensi');
        Route::post('/log-absensi', [LogAbsensiController::class, 'store'])->middleware('permission:melakukan absensi|mengelola absensi');
        Route::get('/log-absensi/{id}', [LogAbsensiController::class, 'show'])->middleware('permission:mengelola absensi|melakukan absensi');
        Route::put('/log-absensi/{id}', [LogAbsensiController::class, 'update'])->middleware('permission:mengelola absensi');
        Route::patch('/log-absensi/{id}', [LogAbsensiController::class, 'update'])->middleware('permission:mengelola absensi');
        Route::delete('/log-absensi/{id}', [LogAbsensiController::class, 'destroy'])->middleware('permission:mengelola absensi');
    });

    // Cuti API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        // Additional routes for cuti (must be before standard CRUD routes to avoid route conflicts)
        // Get leave requests by employee ID
        Route::get('/cuti/karyawan/{karyawanId}', [CutiController::class, 'byKaryawan'])->middleware('permission:mengelola cuti|melakukan cuti');
        
        // Get leave request by employee ID and date
        Route::get('/cuti/karyawan/{karyawanId}/tanggal/{tanggal}', [CutiController::class, 'byKaryawanAndTanggal'])->middleware('permission:melakukan cuti|mengelola cuti');
        
        // Get leave requests by jenis
        Route::get('/cuti/jenis/{jenis}', [CutiController::class, 'byJenis'])->middleware('permission:mengelola cuti');
        
        // Get leave requests by status
        Route::get('/cuti/status/{status}', [CutiController::class, 'byStatus'])->middleware('permission:mengelola cuti');

        // Standard CRUD routes
        Route::get('/cuti', [CutiController::class, 'index'])->middleware('permission:mengelola cuti|melakukan cuti');
        Route::post('/cuti', [CutiController::class, 'store'])->middleware('permission:melakukan cuti|mengelola cuti');
        Route::get('/cuti/{id}', [CutiController::class, 'show'])->middleware('permission:mengelola cuti|melakukan cuti');
        Route::put('/cuti/{id}', [CutiController::class, 'update'])->middleware('permission:mengelola cuti');
        Route::patch('/cuti/{id}', [CutiController::class, 'update'])->middleware('permission:mengelola cuti');
        Route::delete('/cuti/{id}', [CutiController::class, 'destroy'])->middleware('permission:mengelola cuti');
    });

    // Auth routes (protected - requires authentication)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    });
});

