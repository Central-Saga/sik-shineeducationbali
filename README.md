# SIK - Shine Education Bali

Monorepo aplikasi web untuk Shine Education Bali dengan Laravel backend dan Next.js frontend, menggunakan Docker dan Caddy sebagai reverse proxy.

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (React 19, TypeScript, Tailwind CSS)
- **Backend**: Laravel 12 (PHP 8.3)
- **Database**: MySQL 8.0
- **Reverse Proxy**: Caddy 2
- **Containerization**: Docker & Docker Compose
- **SSL**: mkcert untuk local development

## 📁 Struktur Project

```
sik-shineeducationbali/
├── frontend/          # Next.js application
├── backend/           # Laravel application
├── docker-compose.yml # Docker services configuration
├── Caddyfile          # Caddy reverse proxy configuration
└── README-DOCKER.md   # Detailed Docker setup guide
```

## ✨ Features

- ✅ Monorepo structure (Frontend + Backend)
- ✅ Docker containerization dengan hot-reload untuk development
- ✅ HTTPS dengan mkcert (trusted SSL di browser lokal)
- ✅ Reverse proxy dengan Caddy (routing otomatis `/api/*` ke backend)
- ✅ Database persistence dengan Docker volumes
- ✅ Development-ready setup (Next.js dev mode, Laravel dengan hot reload)

## 📋 Prerequisites

- **Docker** & **Docker Compose** terinstall
- **mkcert** untuk SSL certificate lokal (opsional untuk trusted SSL)
- **Git** untuk clone repository

## 🛠️ Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Central-Saga/sik-shineeducationbali.git
cd sik-shineeducationbali
```

### 2. Install mkcert (untuk trusted SSL lokal)

**macOS:**
```bash
brew install mkcert
mkcert -install
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install libnss3-tools
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v1.4.4-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/
args mkcert -install
```

### 3. Generate SSL Certificate

```bash
mkdir -p ~/.local/share/mkcert
cd ~/.local/share/mkcert
mkcert shine.local.test
```

### 4. Setup `/etc/hosts`

Tambahkan domain lokal ke `/etc/hosts`:

**macOS/Linux:**
```bash
sudo sh -c 'echo "127.0.0.1    shine.local.test" >> /etc/hosts'
```

**Windows:**
Edit `C:\Windows\System32\drivers\etc\hosts` (dengan Administrator) dan tambahkan:
```
127.0.0.1    shine.local.test
```

### 5. Setup Environment Files

**Backend:**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` dan sesuaikan:
- `APP_URL=https://shine.local.test`
- Database credentials (default sudah sesuai dengan docker-compose.yml)

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` dan pastikan:
- `NEXT_PUBLIC_API_BASE=https://shine.local.test/api`

### 6. Start Docker Containers

```bash
docker compose up -d --build
```

### 7. Setup Laravel

```bash
# Generate application key
docker compose exec backend php artisan key:generate

# Run database migrations
docker compose exec backend php artisan migrate

# (Optional) Run seeders
docker compose exec backend php artisan db:seed
```

### 8. Akses Aplikasi

- **Frontend**: https://shine.local.test
- **API**: https://shine.local.test/api/...

## 📚 Development

### Menjalankan Development Server

Semua containers sudah running dengan hot-reload:

- **Frontend**: Next.js dev server otomatis reload saat ada perubahan
- **Backend**: Laravel dengan volume mount untuk live changes
- **Database**: MySQL dengan persistent volume

### Useful Commands

```bash
# View logs
docker compose logs -f [service-name]
# Contoh: docker compose logs -f frontend

# Execute command in container
docker compose exec backend php artisan [command]
docker compose exec frontend npm [command]

# Restart specific service
docker compose restart [service-name]

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: hapus data database)
docker compose down -v rů
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
- `APP_URL=https://shine.local.test`
- `DB_HOST=db`
- `DB_DATABASE=shine_db`
- `DB_USERNAME=shine_user`
- `DB_PASSWORD=shine_password`
- `CACHE_STORE=redis` (default menggunakan Redis)
- `REDIS_HOST=redis` (nama service Docker)
- `REDIS_PORT=6379`
- `REDIS_DB=0` (default database)
- `REDIS_CACHE_DB=1` (cache database)

**Frontend (.env):**
- `NEXT_PUBLIC_API_BASE=https://shine.local.test/api`

### Ports

- **80/443**: Caddy reverse proxy (HTTP/HTTPS)
- **3306**: MySQL database
- **6379**: Redis cache
- **3000**: Next.js frontend (internal)
- **9000**: PHP-FPM backend (internal)

### Network

Semua services berkomunikasi melalui Docker network internal `app-network`.

## 🐛 Troubleshooting

### Certificate Error / "Not Secure" Warning

1. Pastikan mkcert root CA sudah diinstall: `mkcert -install`
2. Pastikan certificate sudah dibuat untuk `shine.local.test`
3. Clear browser cache dan HSTS:
   - Brave/Chrome: Buka `brave://net-internals/#hsts` → Delete `shine.local著有` → Clear browsing data
   - Lihat `BRAVE-FIX-GUIDE.txt` untuk panduan lengkap

### CORS Error

Pastikan di `backend/.env`:
- `SESSION_DOMAIN=.shine.local.test`
- `SANCTUM_STATEFUL_DOMAINS=shine.local.test`

### Database Connection Error

1. Check status: `docker compose ps db`
2. Check logs: `docker compose logs db`
3. Pastikan `DB_HOST=db` (nama service, bukan localhost)

### Redis Connection Error

1. Check status: `docker compose ps redis`
2. Check logs: `docker compose logs redis`
3. Pastikan `REDIS_HOST=redis` (nama service, bukan localhost)
4. Test Redis connection:
   ```bash
   docker compose exec redis redis-cli ping
   # Harus return: PONG
   ```
5. Test dari Laravel:
   ```bash
   docker compose exec backend php artisan tinker
   # Kemudian jalankan: Cache::get('test')
   ```

### Port Already in Use

Edit `docker-compose.yml` dan ubah port mapping:
```yaml
ports:
  - "8080:80"   # HTTP
  - "8443:443"  # HTTPS
```

## 📖 Documentation

- **Docker Setup Detail**: Lihat [README-DOCKER.md](./README-DOCKER.md)
- **Browser Cache Fix**: Lihat [BRAVE-FIX-GUIDE.txt](./BRAVE-FIX-GUIDE.txt)

## 🔒 Security

- Environment files (`.env`) tidak di-commit ke repository
- Certificate files (`.pem`, `.key`) di-ignore
- Database passwords didefinisikan di `.env` (contoh di `.env.example`)

## 🌐 Production Deployment

Untuk production, sesuaikan:
1. Update `Caddyfile` dengan domain production
2. Update environment variables dengan production values
3. Caddy akan otomatis generate Let's Encrypt certificate
4. Remove mkcert volume mount dari docker-compose.yml

## 📝 License

[اهی License yang digunakan]

## 👥 Contributors

- [Tim kok Development](https://github.com/Central-Saga/sik-shineeducationbali/graphs/contributors)

## 📞 Support

Jika ada pertanyaan atau masalah, buka [Issue](https://github.com/Central-Saga/sik-shineeducationbali/issues).

---

**Happy Coding! 🚀**

