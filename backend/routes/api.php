<?php

use App\Http\Controllers\Api\V1\Absensi\AbsensiController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Cuti\CutiController;
use App\Http\Controllers\Api\V1\Employee\EmployeeController;
use App\Http\Controllers\Api\V1\Gaji\GajiController;
use App\Http\Controllers\Api\V1\KomponenGaji\KomponenGajiController;
use App\Http\Controllers\Api\V1\LogAbsensi\LogAbsensiController;
use App\Http\Controllers\Api\V1\PembayaranGaji\PembayaranGajiController;
use App\Http\Controllers\Api\V1\Permission\PermissionController;
use App\Http\Controllers\Api\V1\RekapBulanan\RekapBulananController;
use App\Http\Controllers\Api\V1\RealisasiSesi\RealisasiSesiController;
use App\Http\Controllers\Api\V1\Role\RoleController;
use App\Http\Controllers\Api\V1\SesiKerja\SesiKerjaController;
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
    // Get current user's employee data (accessible by karyawan) - must be outside group to avoid route conflicts
    Route::middleware(['auth:sanctum'])->get('/employees/me', [EmployeeController::class, 'me']);

    Route::middleware(['auth:sanctum'])->group(function () {
        // Standard CRUD routes - requires 'mengelola karyawan' permission
        Route::get('/employees', [EmployeeController::class, 'index'])->middleware('permission:mengelola karyawan');
        Route::post('/employees', [EmployeeController::class, 'store'])->middleware('permission:mengelola karyawan');
        // Use where constraint to ensure {id} is numeric, preventing 'me' from matching
        Route::get('/employees/{id}', [EmployeeController::class, 'show'])->where('id', '[0-9]+')->middleware('permission:mengelola karyawan');
        Route::put('/employees/{id}', [EmployeeController::class, 'update'])->where('id', '[0-9]+')->middleware('permission:mengelola karyawan');
        Route::patch('/employees/{id}', [EmployeeController::class, 'update'])->where('id', '[0-9]+')->middleware('permission:mengelola karyawan');
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])->where('id', '[0-9]+')->middleware('permission:mengelola karyawan');
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

        // Standard CRUD routes - allows karyawan to view their own attendance
        Route::get('/absensi', [AbsensiController::class, 'index'])->middleware('permission:melakukan absensi|mengelola absensi');
        Route::post('/absensi', [AbsensiController::class, 'store'])->middleware('permission:melakukan absensi|mengelola absensi');
        Route::get('/absensi/{id}', [AbsensiController::class, 'show'])->middleware('permission:melakukan absensi|mengelola absensi');
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

    // Sesi Kerja API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        // Additional routes for sesi kerja (must be before standard CRUD routes to avoid route conflicts)
        // Get sesi kerja by kategori
        Route::get('/sesi-kerja/kategori/{kategori}', [SesiKerjaController::class, 'byKategori'])->middleware('permission:mengelola sesi kerja');

        // Get sesi kerja by hari
        Route::get('/sesi-kerja/hari/{hari}', [SesiKerjaController::class, 'byHari'])->middleware('permission:mengelola sesi kerja');

        // Get sesi kerja by kategori and hari
        Route::get('/sesi-kerja/kategori/{kategori}/hari/{hari}', [SesiKerjaController::class, 'byKategoriHari'])->middleware('permission:mengelola sesi kerja');

        // Get active sesi kerja
        Route::get('/sesi-kerja/aktif', [SesiKerjaController::class, 'aktif'])->middleware('permission:mengelola sesi kerja');

        // Update status sesi kerja
        Route::patch('/sesi-kerja/{id}/status', [SesiKerjaController::class, 'updateStatus'])->middleware('permission:mengelola sesi kerja');

        // Standard CRUD routes
        Route::get('/sesi-kerja', [SesiKerjaController::class, 'index'])->middleware('permission:mengelola sesi kerja');
        Route::post('/sesi-kerja', [SesiKerjaController::class, 'store'])->middleware('permission:mengelola sesi kerja');
        Route::get('/sesi-kerja/{id}', [SesiKerjaController::class, 'show'])->middleware('permission:mengelola sesi kerja');
        Route::put('/sesi-kerja/{id}', [SesiKerjaController::class, 'update'])->middleware('permission:mengelola sesi kerja');
        Route::patch('/sesi-kerja/{id}', [SesiKerjaController::class, 'update'])->middleware('permission:mengelola sesi kerja');
        Route::delete('/sesi-kerja/{id}', [SesiKerjaController::class, 'destroy'])->middleware('permission:mengelola sesi kerja');
    });

    // Realisasi Sesi API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        // Additional routes for realisasi sesi (must be before standard CRUD routes to avoid route conflicts)
        // Get realisasi sesi by karyawan ID
        Route::get('/realisasi-sesi/karyawan/{karyawanId}', [RealisasiSesiController::class, 'byKaryawan'])->middleware('permission:mengelola realisasi sesi|mengajukan realisasi sesi');

        // Get realisasi sesi by sesi kerja ID
        Route::get('/realisasi-sesi/sesi-kerja/{sesiKerjaId}', [RealisasiSesiController::class, 'bySesiKerja'])->middleware('permission:mengelola realisasi sesi');

        // Get realisasi sesi by tanggal
        Route::get('/realisasi-sesi/tanggal/{tanggal}', [RealisasiSesiController::class, 'byTanggal'])->middleware('permission:mengelola realisasi sesi');

        // Get realisasi sesi by status
        Route::get('/realisasi-sesi/status/{status}', [RealisasiSesiController::class, 'byStatus'])->middleware('permission:mengelola realisasi sesi');

        // Get realisasi sesi by sumber
        Route::get('/realisasi-sesi/sumber/{sumber}', [RealisasiSesiController::class, 'bySumber'])->middleware('permission:mengelola realisasi sesi');

        // Approve realisasi sesi
        Route::post('/realisasi-sesi/{id}/approve', [RealisasiSesiController::class, 'approve'])->middleware('permission:mengelola realisasi sesi');

        // Reject realisasi sesi
        Route::post('/realisasi-sesi/{id}/reject', [RealisasiSesiController::class, 'reject'])->middleware('permission:mengelola realisasi sesi');

        // Standard CRUD routes
        Route::get('/realisasi-sesi', [RealisasiSesiController::class, 'index'])->middleware('permission:mengelola realisasi sesi|mengajukan realisasi sesi');
        Route::post('/realisasi-sesi', [RealisasiSesiController::class, 'store'])->middleware('permission:mengajukan realisasi sesi|mengelola realisasi sesi');
        Route::get('/realisasi-sesi/{id}', [RealisasiSesiController::class, 'show'])->middleware('permission:mengelola realisasi sesi|mengajukan realisasi sesi');
        Route::put('/realisasi-sesi/{id}', [RealisasiSesiController::class, 'update'])->middleware('permission:mengelola realisasi sesi');
        Route::patch('/realisasi-sesi/{id}', [RealisasiSesiController::class, 'update'])->middleware('permission:mengelola realisasi sesi');
        Route::delete('/realisasi-sesi/{id}', [RealisasiSesiController::class, 'destroy'])->middleware('permission:mengelola realisasi sesi');
    });

    // Rekap Bulanan API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        // Generate rekap bulanan (must be before standard CRUD routes)
        Route::post('/rekap-bulanan/generate', [RekapBulananController::class, 'generate'])->middleware('permission:mengelola rekap bulanan');

        // Standard CRUD routes
        Route::get('/rekap-bulanan', [RekapBulananController::class, 'index'])->middleware('permission:mengelola rekap bulanan|melihat gaji');
        Route::get('/rekap-bulanan/{id}', [RekapBulananController::class, 'show'])->middleware('permission:mengelola rekap bulanan|melihat gaji');
        Route::delete('/rekap-bulanan/{id}', [RekapBulananController::class, 'destroy'])->middleware('permission:mengelola rekap bulanan');
    });

    // Gaji API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        // Additional routes for gaji (must be before standard CRUD routes)
        // Generate gaji from rekap
        Route::post('/gaji/generate-from-rekap/{rekapId}', [GajiController::class, 'generateFromRekap'])->middleware('permission:mengelola gaji');

        // Update gaji status
        Route::patch('/gaji/{id}/status', [GajiController::class, 'updateStatus'])->middleware('permission:mengelola gaji');

        // Standard CRUD routes
        Route::get('/gaji', [GajiController::class, 'index'])->middleware('permission:mengelola gaji|melihat gaji');
        Route::post('/gaji', [GajiController::class, 'store'])->middleware('permission:mengelola gaji');
        Route::get('/gaji/{id}', [GajiController::class, 'show'])->middleware('permission:mengelola gaji|melihat gaji');
        Route::put('/gaji/{id}', [GajiController::class, 'update'])->middleware('permission:mengelola gaji');
        Route::patch('/gaji/{id}', [GajiController::class, 'update'])->middleware('permission:mengelola gaji');
        Route::delete('/gaji/{id}', [GajiController::class, 'destroy'])->middleware('permission:mengelola gaji');
    });

    // Komponen Gaji API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        // Get komponen gaji by gaji_id
        Route::get('/gaji/{gajiId}/komponen', [KomponenGajiController::class, 'index'])->middleware('permission:mengelola gaji|melihat gaji');

        // Create komponen gaji
        Route::post('/gaji/{gajiId}/komponen', [KomponenGajiController::class, 'store'])->middleware('permission:mengelola gaji');

        // Standard CRUD routes
        Route::get('/komponen-gaji/{id}', [KomponenGajiController::class, 'show'])->middleware('permission:mengelola gaji|melihat gaji');
        Route::put('/komponen-gaji/{id}', [KomponenGajiController::class, 'update'])->middleware('permission:mengelola gaji');
        Route::delete('/komponen-gaji/{id}', [KomponenGajiController::class, 'destroy'])->middleware('permission:mengelola gaji');
    });

    // Pembayaran Gaji API - Resource routes with permission middleware
    Route::middleware(['auth:sanctum'])->group(function () {
        // Get pembayaran gaji by gaji_id
        Route::get('/gaji/{gajiId}/pembayaran', [PembayaranGajiController::class, 'index'])->middleware('permission:mengelola pembayaran gaji|mengelola gaji');

        // Create pembayaran gaji
        Route::post('/gaji/{gajiId}/pembayaran', [PembayaranGajiController::class, 'store'])->middleware('permission:mengelola pembayaran gaji');

        // Update pembayaran gaji status
        Route::patch('/pembayaran-gaji/{id}/status', [PembayaranGajiController::class, 'updateStatus'])->middleware('permission:mengelola pembayaran gaji');

        // Standard CRUD routes
        Route::get('/pembayaran-gaji/{id}', [PembayaranGajiController::class, 'show'])->middleware('permission:mengelola pembayaran gaji|mengelola gaji');
        Route::put('/pembayaran-gaji/{id}', [PembayaranGajiController::class, 'update'])->middleware('permission:mengelola pembayaran gaji');
        Route::delete('/pembayaran-gaji/{id}', [PembayaranGajiController::class, 'destroy'])->middleware('permission:mengelola pembayaran gaji');
    });

    // Auth routes (protected - requires authentication)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    });
});
