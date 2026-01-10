<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Opcodes\LogViewer\Facades\LogViewer;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Repository bindings
        $this->app->bind(
            \App\Repositories\Contracts\UserRepositoryInterface::class,
            \App\Repositories\User\UserRepository::class
        );

        $this->app->bind(
            \App\Repositories\Contracts\RoleRepositoryInterface::class,
            \App\Repositories\Role\RoleRepository::class
        );

        $this->app->bind(
            \App\Repositories\Contracts\EmployeeRepositoryInterface::class,
            \App\Repositories\Employee\EmployeeRepository::class
        );

        $this->app->bind(
            \App\Repositories\Contracts\AbsensiRepositoryInterface::class,
            \App\Repositories\Absensi\AbsensiRepository::class
        );

        $this->app->bind(
            \App\Repositories\Contracts\LogAbsensiRepositoryInterface::class,
            \App\Repositories\LogAbsensi\LogAbsensiRepository::class
        );

        $this->app->bind(
            \App\Repositories\Contracts\CutiRepositoryInterface::class,
            \App\Repositories\Cuti\CutiRepository::class
        );

        $this->app->bind(
            \App\Repositories\Contracts\SesiKerjaRepositoryInterface::class,
            \App\Repositories\SesiKerja\SesiKerjaRepository::class
        );

        $this->app->bind(
            \App\Repositories\Contracts\RealisasiSesiRepositoryInterface::class,
            \App\Repositories\RealisasiSesi\RealisasiSesiRepository::class
        );

        $this->app->bind(
            \App\Repositories\Contracts\RekapBulananRepositoryInterface::class,
            \App\Repositories\RekapBulanan\RekapBulananRepository::class
        );

        $this->app->bind(
            \App\Repositories\Contracts\GajiRepositoryInterface::class,
            \App\Repositories\Gaji\GajiRepository::class
        );

        $this->app->bind(
            \App\Repositories\Contracts\KomponenGajiRepositoryInterface::class,
            \App\Repositories\KomponenGaji\KomponenGajiRepository::class
        );

        $this->app->bind(
            \App\Repositories\Contracts\PembayaranGajiRepositoryInterface::class,
            \App\Repositories\PembayaranGaji\PembayaranGajiRepository::class
        );

        // Service bindings
        $this->app->bind(
            \App\Services\Contracts\UserServiceInterface::class,
            \App\Services\User\UserService::class
        );

        $this->app->bind(
            \App\Services\Contracts\RoleServiceInterface::class,
            \App\Services\Role\RoleService::class
        );

        $this->app->bind(
            \App\Services\Contracts\EmployeeServiceInterface::class,
            \App\Services\Employee\EmployeeService::class
        );

        $this->app->bind(
            \App\Services\Contracts\AbsensiServiceInterface::class,
            \App\Services\Absensi\AbsensiService::class
        );

        $this->app->bind(
            \App\Services\Contracts\LogAbsensiServiceInterface::class,
            \App\Services\LogAbsensi\LogAbsensiService::class
        );

        $this->app->bind(
            \App\Services\Contracts\CutiServiceInterface::class,
            \App\Services\Cuti\CutiService::class
        );

        $this->app->bind(
            \App\Services\Contracts\SesiKerjaServiceInterface::class,
            \App\Services\SesiKerja\SesiKerjaService::class
        );

        $this->app->bind(
            \App\Services\Contracts\RealisasiSesiServiceInterface::class,
            \App\Services\RealisasiSesi\RealisasiSesiService::class
        );

        $this->app->bind(
            \App\Services\Contracts\RekapBulananServiceInterface::class,
            \App\Services\RekapBulanan\RekapBulananService::class
        );

        $this->app->bind(
            \App\Services\Contracts\GajiServiceInterface::class,
            \App\Services\Gaji\GajiService::class
        );

        $this->app->bind(
            \App\Services\Contracts\KomponenGajiServiceInterface::class,
            \App\Services\KomponenGaji\KomponenGajiService::class
        );

        $this->app->bind(
            \App\Services\Contracts\PembayaranGajiServiceInterface::class,
            \App\Services\PembayaranGaji\PembayaranGajiService::class
        );

        $this->app->bind(
            \App\Services\Contracts\DashboardServiceInterface::class,
            \App\Services\Dashboard\DashboardService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force URL generator untuk menggunakan APP_URL bukan request URL
        // Ini penting untuk Log Viewer agar asset URLs menggunakan APP_URL
        URL::forceRootUrl(config('app.url'));
        URL::forceScheme('https');
        
        // Setup authorization untuk Log Viewer
        // Di development (local), izinkan akses
        // Di production, sesuaikan dengan kebutuhan (misalnya hanya untuk admin)
        LogViewer::auth(function ($request) {
            // Untuk development, izinkan semua akses
            if (app()->environment('local')) {
                return true;
            }

            // Untuk production, sesuaikan dengan authorization logic Anda
            // Contoh: hanya untuk user yang sudah login dan memiliki role admin
            // return $request->user() && $request->user()->hasRole('admin');
            
            // Atau gunakan gate
            // return Gate::allows('viewLogViewer');
            
            // Untuk sementara, return false untuk production (akan memblokir akses)
            return false;
        });
    }
}
