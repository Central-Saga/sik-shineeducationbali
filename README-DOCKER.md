# Docker Setup dengan Caddy untuk Shine Education

Panduan lengkap untuk menjalankan aplikasi monorepo (Laravel + Next.js) menggunakan Docker dengan Caddy sebagai reverse proxy.

## Prerequisites

1. **Docker & Docker Compose** terinstall di sistem Anda
2. **mkcert** terinstall untuk SSL certificate lokal
3. **Git** (untuk clone repository, jika perlu)

## Setup Awal

### 1. Install mkcert

mkcert diperlukan untuk membuat SSL certificate yang trusted oleh browser.

**macOS:**

```bash
brew install mkcert
```

**Linux:**

```bash
# Ubuntu/Debian
sudo apt install libnss3-tools
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v1.4.4-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/

# Atau gunakan package manager lainnya
```

**Windows:**

```bash
# Menggunakan Chocolatey
choco install mkcert

# Atau download dari https://github.com/FiloSottile/mkcert/releases
```

### 2. Install Root CA Certificate

Setelah mkcert terinstall, jalankan perintah berikut untuk install root CA certificate:

```bash
mkcert -install
```

Ini akan membuat root CA certificate yang akan ditrust oleh browser Anda.

### 3. Generate Certificate untuk Domain Lokal

Jalankan perintah berikut untuk generate certificate:

```bash
mkdir -p ~/.local/share/mkcert
cd ~/.local/share/mkcert
mkcert shine.local.test
```

Ini akan membuat dua file:

-   `shine.local.test.pem` (certificate)
-   `shine.local.test-key.pem` (private key)

**Catatan:**

-   Certificate akan tersimpan di `~/.local/share/mkcert/`
-   Path ini sudah di-mount di docker-compose.yml sebagai read-only
-   Jika path berbeda di sistem Anda (misalnya Windows), sesuaikan volume mount di docker-compose.yml
-   **Alternatif:** Jika ingin menggunakan Caddy internal certificate (lebih mudah), comment/uncomment bagian TLS di Caddyfile

### 4. Konfigurasi /etc/hosts

Tambahkan domain lokal ke `/etc/hosts`:

**macOS/Linux:**

```bash
sudo nano /etc/hosts
```

Tambahkan baris:

```
127.0.0.1    shine.local.test
```

**Windows:**
Edit `C:\Windows\System32\drivers\etc\hosts` (dengan Administrator) dan tambahkan:

```
127.0.0.1    shine.local.test
```

### 5. Setup Environment Files

**Backend (Laravel):**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` dan pastikan:

-   `APP_URL=https://shine.local.test`
-   Database configuration sesuai dengan docker-compose.yml

**Frontend (Next.js):**

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` dan pastikan:

-   `NEXT_PUBLIC_API_BASE=https://shine.local.test/api`

## Menjalankan Aplikasi

### 1. Build dan Start Containers

```bash
docker compose up -d --build
```

Perintah ini akan:

-   Build images untuk backend dan frontend
-   Start semua services (caddy, frontend, backend, db)
-   Setup network internal
-   Mount volumes untuk persistence

### 2. Setup Laravel Application

Setelah containers running, setup Laravel:

```bash
# Generate application key
docker compose exec backend php artisan key:generate

# Run migrations
docker compose exec backend php artisan migrate

# (Optional) Run seeders
docker compose exec backend php artisan db:seed

# (Optional) Setup storage link
docker compose exec backend php artisan storage:link
```

### 3. Akses Aplikasi

Setelah semua setup selesai, akses aplikasi di browser:

-   **Frontend:** https://shine.local.test
-   **API:** https://shine.local.test/api/...

Browser tidak akan menampilkan "Not Secure" karena menggunakan mkcert certificate yang sudah di-trust.

## Troubleshooting

### Certificate Error

Jika browser masih menampilkan "Not Secure":

1. Pastikan mkcert root CA sudah diinstall: `mkcert -install`
2. Pastikan certificate sudah dibuat untuk domain `shine.local.test`
3. Restart browser setelah install root CA
4. Clear browser cache dan cookies

### CORS Error

Jika ada CORS error saat frontend memanggil API:

1. Pastikan `SESSION_DOMAIN=.shine.local.test` di backend/.env
2. Pastikan `SANCTUM_STATEFUL_DOMAINS=shine.local.test` di backend/.env
3. Jika menggunakan Laravel Sanctum, enable middleware di `bootstrap/app.php`:
    ```php
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
    })
    ```

### Database Connection Error

Jika backend tidak bisa connect ke database:

1. Check status database: `docker compose ps db`
2. Check logs: `docker compose logs db`
3. Pastikan environment variables di backend/.env sesuai dengan docker-compose.yml
4. Pastikan `DB_HOST=db` (nama service, bukan localhost)

### Port Already in Use

Jika port 80, 443, atau 3306 sudah digunakan:

Edit `docker-compose.yml` dan ubah port mapping, contoh:

```yaml
ports:
    - '8080:80' # HTTP
    - '8443:443' # HTTPS
```

Kemudian update Caddyfile untuk menggunakan port baru atau akses langsung ke port tersebut.

### Container Tidak Start

Check logs untuk detail error:

```bash
docker compose logs [service-name]
# Contoh:
docker compose logs backend
docker compose logs frontend
docker compose logs caddy
```

### Rebuild Containers

Jika ada perubahan di Dockerfile atau dependencies, rebuild:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Service URLs

Setelah containers running, service dapat diakses via:

-   **Frontend:** http://localhost:3000 (internal) → https://shine.local.test (via Caddy)
-   **Backend:** http://localhost:9000 (internal, PHP-FPM) → https://shine.local.test/api/* (via Caddy)
-   **Database:** localhost:3306 (MySQL)
-   **Caddy Admin:** http://localhost:2019 (opsional, bisa di-disable)

## Production Deployment

Untuk deploy ke production server dengan Let's Encrypt:

1. **Update Caddyfile:**

    ```caddyfile
    shine.yourdomain.com {
        # Caddy akan otomatis generate Let's Encrypt certificate
        reverse_proxy backend:9000 {
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-Host {host}
        }

        handle /api/* {
            reverse_proxy backend:9000 {
                # ... same config
            }
        }
    }
    ```

2. **Update environment files:**

    - `APP_URL=https://shine.yourdomain.com`
    - `NEXT_PUBLIC_API_BASE=https://shine.yourdomain.com/api`

3. **Pastikan DNS mengarah ke server IP**

4. **Remove mkcert volume mount** dari docker-compose.yml

## Useful Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f [service-name]

# Execute command in container
docker compose exec backend php artisan [command]
docker compose exec frontend npm [command]

# Restart specific service
docker compose restart [service-name]

# Remove all volumes (WARNING: menghapus data database)
docker compose down -v
```

## Volume Persistence

Data yang persist di volumes:

-   `mysql_data`: Database MySQL data
-   `backend_vendor`: Composer dependencies
-   `backend_storage`: Laravel storage files
-   `frontend_node_modules`: NPM dependencies
-   `frontend_next`: Next.js build cache
-   `caddy_data` & `caddy_config`: Caddy configuration & certificates

## Support

Jika ada masalah, check:

1. Docker logs untuk setiap service
2. Konfigurasi environment files
3. Network connectivity antar services
4. Certificate dan SSL configuration
