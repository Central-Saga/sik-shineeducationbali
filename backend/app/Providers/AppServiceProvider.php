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
        //
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
