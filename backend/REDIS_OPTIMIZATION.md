# 🚀 Redis Optimization & Best Practices

## ✅ Current Status

Redis sudah dikonfigurasi dengan baik untuk:
- ✅ Laravel Cache System
- ✅ Repository Layer Cache
- ✅ Spatie Permission Cache
- ✅ Role & Permission Management

---

## 📊 Cache Strategy

### 1. Cache Layers

```
┌─────────────────────────────────────┐
│   Application Layer                 │
│   - Controllers, Services           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Repository Layer Cache            │
│   - BaseRepository                  │
│   - UserRepository                  │
│   - RoleRepository                  │
│   TTL: 1-2 hours                    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Laravel Cache (Redis)             │
│   - Cache::put/get/forget           │
│   - Auto invalidation               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Redis Server (DB 1)               │
│   - Cache data                      │
│   - TTL-based expiration            │
└─────────────────────────────────────┘
```

### 2. Spatie Permission Cache

```
┌─────────────────────────────────────┐
│   Permission Checks                 │
│   - $user->can('permission')        │
│   - $user->hasRole('role')          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Spatie Permission Cache           │
│   - Auto-cached for 24 hours        │
│   - Auto-invalidated on changes     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Laravel Cache → Redis             │
└─────────────────────────────────────┘
```

---

## ⚙️ Cache Configuration

### Repository Cache TTL

| Repository | TTL | Reason |
|------------|-----|--------|
| UserRepository | 1 hour (3600s) | User data changes moderately |
| RoleRepository | 2 hours (7200s) | Roles change less frequently |
| Role with Permissions | 30 minutes (1800s) | More complex query, shorter TTL |
| Permission Lists | 30 minutes (1800s) | Rarely changes |

### Auto Cache Invalidation

Cache otomatis di-clear ketika:
- ✅ Create operation → `clearCache()`
- ✅ Update operation → `clearCache()` + specific key `forget()`
- ✅ Delete operation → `clearCache()`
- ✅ Role/Permission changes → Spatie auto-invalidates

---

## 🔧 Optimization Recommendations

### 1. Session Storage (Optional)

Bisa pindahkan session ke Redis untuk performa lebih baik:

```env
SESSION_DRIVER=redis
SESSION_CONNECTION=default
```

**Benefits:**
- Faster session handling
- Shared sessions across multiple servers
- Auto expiration

**Current:** Using `database` (acceptable for single server)

### 2. Queue Connection (Future)

Jika menggunakan queues, bisa gunakan Redis:

```env
QUEUE_CONNECTION=redis
```

**Benefits:**
- Fast job processing
- Better than database queues

### 3. Cache Prefix

Untuk multi-tenant atau staging/production separation:

```env
CACHE_PREFIX=sik_prod_
```

Prevents cache collision between environments.

### 4. Redis Memory Management

Current configuration (docker-compose.yml):
```yaml
command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
```

**Settings:**
- `maxmemory 256mb` - Maximum memory limit
- `maxmemory-policy allkeys-lru` - Evict least recently used keys when memory full
- `appendonly yes` - Persist data to disk

**Monitoring:**
```bash
docker compose exec redis redis-cli INFO memory
```

---

## 📈 Performance Monitoring

### Check Cache Hit Rate

```bash
# Get stats
docker compose exec redis redis-cli INFO stats | grep keyspace

# Monitor in real-time
docker compose exec redis redis-cli MONITOR
```

### Monitor Memory Usage

```bash
# Memory info
docker compose exec redis redis-cli INFO memory

# Memory usage breakdown
docker compose exec redis redis-cli MEMORY STATS
```

### Check Active Keys

```bash
# Count keys in cache DB
docker compose exec redis redis-cli -n 1 DBSIZE

# List all keys (be careful with many keys)
docker compose exec redis redis-cli -n 1 KEYS "*"

# List keys with pattern
docker compose exec redis redis-cli -n 1 KEYS "user:*"
```

---

## 🧹 Cache Maintenance

### Clear Cache Commands

```bash
# Clear Laravel cache
docker compose exec backend php artisan cache:clear

# Clear config cache
docker compose exec backend php artisan config:clear

# Clear all Laravel caches
docker compose exec backend php artisan optimize:clear

# Clear Spatie permission cache
docker compose exec backend php artisan permission:cache-reset

# Clear specific Redis database
docker compose exec redis redis-cli -n 1 FLUSHDB

# Clear all Redis (careful!)
docker compose exec redis redis-cli FLUSHALL
```

### Auto Cache Clear on Deploy

Tambahkan ke deployment script:

```bash
php artisan optimize:clear
php artisan permission:cache-reset
php artisan config:cache
php artisan route:cache
```

---

## 🎯 Best Practices

### 1. Cache Keys

✅ **Good:**
```php
$cacheKey = "user:find:{$id}";
$cacheKey = "role:findWithPermissions:{$id}";
```

❌ **Bad:**
```php
$cacheKey = "data";
$cacheKey = "{$id}"; // Too generic
```

### 2. Cache TTL

- **Short-lived data (1-30 min):** User sessions, temporary data
- **Medium-lived data (1-2 hours):** User data, role data
- **Long-lived data (24 hours):** Permissions (auto-managed by Spatie)

### 3. Cache Invalidation

✅ **Always clear cache after:**
- Create/Update/Delete operations
- Role/Permission changes
- User role assignments

✅ **Use specific key clearing:**
```php
Cache::forget("user:find:{$id}"); // Specific
// Instead of
Cache::flush(); // Too aggressive
```

### 4. Cache Tags (Future Enhancement)

Untuk better cache management, bisa enable cache tags:

```php
// In CacheableRepository
Cache::tags([$this->getCachePrefix()])->remember(...);
```

**Note:** Requires Redis or Memcached with tags support.

---

## 🔍 Troubleshooting

### Cache Not Working

1. Check Redis connection:
```bash
docker compose exec redis redis-cli ping
```

2. Check cache driver:
```bash
docker compose exec backend php artisan tinker --execute="echo config('cache.default');"
```

3. Test cache:
```bash
docker compose exec backend php artisan tinker --execute="
\Illuminate\Support\Facades\Cache::put('test', 'ok', 60);
echo \Illuminate\Support\Facades\Cache::get('test');
"
```

### Permission Cache Issues

```bash
# Reset permission cache
docker compose exec backend php artisan permission:cache-reset

# Or programmatically
app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
```

### High Memory Usage

```bash
# Check memory
docker compose exec redis redis-cli INFO memory

# Check largest keys
docker compose exec redis redis-cli --bigkeys

# Clear old cache
docker compose exec redis redis-cli -n 1 FLUSHDB
```

---

## ✅ Verification Checklist

- [x] Redis container running
- [x] Predis installed
- [x] Cache driver set to `redis`
- [x] Redis connection working
- [x] Repository cache working
- [x] Permission cache working
- [x] Auto cache invalidation working
- [x] Cache TTL configured
- [x] Memory management configured

---

## 📝 Summary

**Redis Configuration:**
- ✅ Fully operational
- ✅ All layers using Redis
- ✅ Auto cache invalidation
- ✅ Optimal TTL settings
- ✅ Memory management configured

**Performance:**
- ⚡ Faster queries (cached)
- 📉 Reduced database load
- 🔄 Auto cache management
- 📊 Monitoring ready

**Next Steps (Optional):**
- Monitor cache hit rates
- Adjust TTL if needed
- Enable Redis for sessions (optional)
- Enable cache tags (if needed)
- Setup Redis for queues (future)

---

**Redis is optimized and ready for production! 🚀**

