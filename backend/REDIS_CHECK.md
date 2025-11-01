# 🔍 Cara Check Redis Status

## ✅ Status Saat Ini

Redis **sudah dikonfigurasi dan berjalan** di Docker!

### Konfigurasi:

-   ✅ Redis container: `sik_redis` (Redis 7 Alpine)
-   ✅ Port: `6379`
-   ✅ Cache driver: `redis` (default di config)
-   ✅ Environment variables: sudah di-set di docker-compose.yml
-   ✅ PHP Redis extension: sudah di-install di Dockerfile

---

## 🔧 Cara Check Redis Status

### 1. Check Redis Container Status

```bash
docker compose ps redis
```

**Expected Output:**

```
NAME        STATUS
sik_redis   Up (healthy)
```

### 2. Test Redis Connection

```bash
docker compose exec redis redis-cli ping
```

**Expected Output:**

```
PONG
```

### 3. Check Laravel Cache Configuration

```bash
docker compose exec backend php artisan tinker --execute="
echo 'Cache Driver: ' . config('cache.default');
echo 'Cache Store: ' . config('cache.stores.' . config('cache.default') . '.driver');
"
```

**Expected Output:**

```
Cache Driver: redis
Cache Store: redis
```

### 4. Test Cache dengan Redis

```bash
docker compose exec backend php artisan tinker --execute="
\Illuminate\Support\Facades\Cache::put('test', 'redis_working', 60);
echo \Illuminate\Support\Facades\Cache::get('test');
"
```

**Expected Output:**

```
redis_working
```

### 5. Check Redis Keys

```bash
docker compose exec redis redis-cli KEYS "*"
```

Akan menampilkan semua cache keys yang ada di Redis.

### 6. Check Redis Info

```bash
docker compose exec redis redis-cli INFO stats
```

Akan menampilkan statistik Redis (total commands, hits, misses, dll).

### 7. Check Redis Memory

```bash
docker compose exec redis redis-cli INFO memory
```

---

## 🐛 Troubleshooting

### Problem: Cache Driver masih "database"

**Solusi:**

1. Pastikan Redis container running:

    ```bash
    docker compose up -d redis
    ```

2. Restart backend container:

    ```bash
    docker compose restart backend
    ```

3. Check environment variables di backend:
    ```bash
    docker compose exec backend env | grep -E "CACHE|REDIS"
    ```

### Problem: Redis connection failed

**Check:**

1. Redis container status:

    ```bash
    docker compose ps redis
    docker compose logs redis
    ```

2. Network connectivity:

    ```bash
    docker compose exec backend ping redis
    ```

3. Redis configuration:
    ```bash
    docker compose exec backend php artisan config:cache
    ```

### Problem: PHP Redis extension not found

**Solusi:**
Rebuild backend container:

```bash
docker compose build --no-cache backend
docker compose up -d backend
```

---

## ✅ Verifikasi Lengkap

Jalankan command berikut untuk verifikasi lengkap:

```bash
# 1. Check containers
docker compose ps

# 2. Test Redis
docker compose exec redis redis-cli ping

# 3. Check cache config
docker compose exec backend php artisan tinker --execute="echo config('cache.default');"

# 4. Test cache
docker compose exec backend php artisan tinker --execute="
\Illuminate\Support\Facades\Cache::put('verify', 'ok', 60);
echo \Illuminate\Support\Facades\Cache::get('verify');
"

# 5. Check Redis keys
docker compose exec redis redis-cli KEYS "*"

# 6. Monitor Redis
docker compose logs -f redis
```

---

## 📊 Redis Monitoring Commands

```bash
# Live monitor Redis commands
docker compose exec redis redis-cli MONITOR

# Check Redis stats
docker compose exec redis redis-cli INFO

# Check specific database
docker compose exec redis redis-cli -n 1 KEYS "*"

# Clear all cache
docker compose exec redis redis-cli FLUSHALL

# Clear specific database (cache DB = 1)
docker compose exec redis redis-cli -n 1 FLUSHDB
```

---

## 🎯 Quick Check Script

Simpan script berikut untuk quick check:

```bash
#!/bin/bash
echo "=== Redis Status Check ==="
echo ""
echo "1. Container Status:"
docker compose ps redis | grep redis
echo ""
echo "2. Redis Ping:"
docker compose exec redis redis-cli ping
echo ""
echo "3. Cache Driver:"
docker compose exec backend php artisan tinker --execute="echo config('cache.default');"
echo ""
echo "4. Cache Test:"
docker compose exec backend php artisan tinker --execute="
\Illuminate\Support\Facades\Cache::put('check', 'ok', 60);
echo \Illuminate\Support\Facades\Cache::get('check');
"
echo ""
echo "5. Redis Keys Count:"
docker compose exec redis redis-cli DBSIZE
```

---

**Note:** Redis **WAJIB** menggunakan Docker karena:

1. Redis adalah service terpisah (bukan library)
2. Laravel perlu koneksi ke Redis server
3. Docker memudahkan deployment dan management
4. Redis container sudah dikonfigurasi dengan persistence dan memory management
