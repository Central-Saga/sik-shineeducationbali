<?php

namespace App\Repositories\Base;

use Illuminate\Support\Facades\Cache;

trait CacheableRepository
{
    /**
     * Cache prefix untuk repository ini.
     * Harus di-override di class yang menggunakan trait ini.
     *
     * @return string
     */
    abstract protected function getCachePrefix(): string;

    /**
     * Cache TTL dalam detik (default 1 jam).
     * Bisa di-override di class yang menggunakan trait ini.
     *
     * @return int
     */
    protected function getCacheTTL(): int
    {
        return 3600; // 1 jam default
    }

    /**
     * Generate cache key dengan prefix.
     *
     * @param  string  $suffix
     * @return string
     */
    protected function getCacheKey(string $suffix): string
    {
        $prefix = $this->getCachePrefix();
        return "{$prefix}:{$suffix}";
    }

    /**
     * Clear all cache untuk repository ini.
     * Menggunakan cache tags jika tersedia (Redis/Memcached).
     * Fallback ke pattern matching jika tidak support tags.
     */
    public function clearCache(): void
    {
        $prefix = $this->getCachePrefix();

        // Jika menggunakan cache driver yang support tags (Redis, Memcached)
        try {
            if (method_exists(Cache::getStore(), 'tags')) {
                // Clear cache dengan tag prefix
                Cache::tags([$prefix])->flush();
                return;
            }
        } catch (\Exception $e) {
            // Fallback jika tags tidak tersedia atau error
        }

        // Fallback: clear semua cache jika tags tidak tersedia
        // Note: Ini akan clear semua cache, gunakan dengan hati-hati
        Cache::flush();
    }

    /**
     * Clear cache berdasarkan pattern.
     * Hanya untuk fallback jika tags tidak tersedia.
     *
     * @param  string  $pattern
     * @return void
     */
    protected function clearCacheByPattern(string $pattern): void
    {
        // Untuk database/file cache, kita perlu manual clear
        // Cara terbaik: gunakan Redis/Memcached dengan tags
        // Atau implementasikan cache key tracking di database

        // Untuk sementara, kita akan handle di method forget() per key
        // Production: gunakan Redis dengan tags untuk performa optimal
    }

    /**
     * Remember value dengan cache.
     *
     * @param  string  $key
     * @param  callable  $callback
     * @param  int|null  $ttl
     * @return mixed
     */
    protected function remember(string $key, callable $callback, ?int $ttl = null)
    {
        $cacheKey = $this->getCacheKey($key);
        $ttl = $ttl ?? $this->getCacheTTL();

        // Gunakan tags jika tersedia
        try {
            if (method_exists(Cache::getStore(), 'tags')) {
                $prefix = $this->getCachePrefix();
                return Cache::tags([$prefix])->remember($cacheKey, $ttl, $callback);
            }
        } catch (\Exception $e) {
            // Fallback ke remember biasa jika tags tidak tersedia
        }

        return Cache::remember($cacheKey, $ttl, $callback);
    }

    /**
     * Forget cache by key.
     *
     * @param  string  $key
     * @return void
     */
    protected function forget(string $key): void
    {
        $cacheKey = $this->getCacheKey($key);
        Cache::forget($cacheKey);
    }

    /**
     * Forget multiple cache keys.
     *
     * @param  array<string>  $keys
     * @return void
     */
    protected function forgetMultiple(array $keys): void
    {
        foreach ($keys as $key) {
            $this->forget($key);
        }
    }

    /**
     * Check if cache key exists.
     *
     * @param  string  $key
     * @return bool
     */
    protected function hasCache(string $key): bool
    {
        $cacheKey = $this->getCacheKey($key);
        return Cache::has($cacheKey);
    }
}
