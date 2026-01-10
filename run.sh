#!/bin/bash

# Script untuk menjalankan project SIK - Shine Education Bali
# Script ini akan melakukan setup lengkap dan menjalankan aplikasi
# Compatible dengan macOS dan Linux
# Usage: ./run.sh

# Get script directory dan navigate ke project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR" || exit 1

# Exit on error (tetapi akan dinonaktifkan untuk beberapa bagian non-critical)
set -e

# Colors untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Domain yang digunakan
DOMAIN="shine.local.test"
CERT_DIR="$HOME/.local/share/mkcert"
CERT_FILE="$CERT_DIR/$DOMAIN.pem"
CERT_KEY="$CERT_DIR/$DOMAIN-key.pem"

# Function untuk print messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function untuk check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function untuk check jika running di macOS atau Linux
check_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "linux-musl"* ]]; then
        OS="linux"
    else
        print_error "OS tidak didukung. Script ini hanya untuk macOS dan Linux."
        exit 1
    fi
    print_info "OS terdeteksi: $OS"
    print_info "Project directory: $SCRIPT_DIR"
}

# Function untuk memastikan script dijalankan dari project root
check_project_structure() {
    if [ ! -f "docker-compose.yml" ]; then
        print_error "File docker-compose.yml tidak ditemukan!"
        print_error "Pastikan script ini dijalankan dari root directory project."
        exit 1
    fi
    
    if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        print_error "Directory backend atau frontend tidak ditemukan!"
        print_error "Pastikan struktur project sudah lengkap."
        exit 1
    fi
    
    print_success "Struktur project valid"
}

# Step 1: Check Prerequisites
check_prerequisites() {
    print_step "1. Memeriksa Prerequisites"
    
    local all_ok=true
    
    # Check Docker
    if command_exists docker; then
        print_success "Docker terinstall: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
    else
        print_error "Docker belum terinstall. Silakan install Docker terlebih dahulu."
        all_ok=false
    fi
    
    # Check Docker Compose
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        if docker compose version >/dev/null 2>&1; then
            print_success "Docker Compose terinstall (plugin)"
        else
            print_success "Docker Compose terinstall: $(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1)"
        fi
    else
        print_error "Docker Compose belum terinstall."
        all_ok=false
    fi
    
    # Check Docker daemon
    if docker info >/dev/null 2>&1; then
        print_success "Docker daemon sedang berjalan"
    else
        print_error "Docker daemon tidak berjalan. Silakan start Docker Desktop atau Docker service."
        all_ok=false
    fi
    
    if [ "$all_ok" = false ]; then
        print_error "Beberapa prerequisites belum terpenuhi. Silakan install terlebih dahulu."
        exit 1
    fi
}

# Step 2: Install mkcert jika belum ada
install_mkcert() {
    print_step "2. Memeriksa dan Install mkcert"
    
    if command_exists mkcert; then
        print_success "mkcert sudah terinstall: $(mkcert -version 2>/dev/null || echo 'installed')"
    else
        print_warning "mkcert belum terinstall. Mencoba install..."
        
        if [ "$OS" = "macos" ]; then
            if command_exists brew; then
                print_info "Menginstall mkcert via Homebrew..."
                brew install mkcert
                print_success "mkcert berhasil diinstall"
            else
                print_error "Homebrew belum terinstall. Silakan install mkcert manual:"
                print_info "  brew install mkcert"
                exit 1
            fi
        elif [ "$OS" = "linux" ]; then
            print_info "Menginstall mkcert untuk Linux..."
            print_warning "Silakan install mkcert manual:"
            print_info "  sudo apt install libnss3-tools  # Ubuntu/Debian"
            print_info "  # atau"
            print_info "  sudo yum install nss-tools        # RHEL/CentOS"
            print_info ""
            print_info "  wget -O mkcert https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v1.4.4-linux-amd64"
            print_info "  chmod +x mkcert"
            print_info "  sudo mv mkcert /usr/local/bin/"
            print_info ""
            
            # Check if running in interactive mode
            if [ -t 0 ]; then
                read -p "Apakah mkcert sudah terinstall? (y/n) " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    print_error "Silakan install mkcert terlebih dahulu."
                    exit 1
                fi
            else
                print_warning "Running in non-interactive mode. Skipping mkcert check."
                print_warning "Pastikan mkcert sudah terinstall sebelum melanjutkan."
            fi
        fi
    fi
}

# Step 3: Install mkcert root CA
install_root_ca() {
    print_step "3. Memeriksa mkcert Root CA"
    
    if mkcert -CAROOT >/dev/null 2>&1; then
        print_success "mkcert Root CA sudah terinstall"
        print_info "CA Root location: $(mkcert -CAROOT)"
    else
        print_warning "mkcert Root CA belum terinstall. Menginstall..."
        mkcert -install
        print_success "mkcert Root CA berhasil diinstall"
        print_info "Jika browser masih menampilkan warning, restart browser Anda."
    fi
}

# Step 4: Generate SSL Certificate
generate_certificate() {
    print_step "4. Memeriksa SSL Certificate untuk $DOMAIN"
    
    if [ -f "$CERT_FILE" ] && [ -f "$CERT_KEY" ]; then
        print_success "SSL Certificate sudah ada"
        print_info "Certificate: $CERT_FILE"
        print_info "Key: $CERT_KEY"
    else
        print_warning "SSL Certificate belum ada. Membuat certificate..."
        mkdir -p "$CERT_DIR"
        cd "$CERT_DIR"
        mkcert "$DOMAIN"
        cd - >/dev/null
        print_success "SSL Certificate berhasil dibuat"
        print_info "Certificate: $CERT_FILE"
        print_info "Key: $CERT_KEY"
    fi
}

# Step 5: Setup /etc/hosts
setup_hosts() {
    print_step "5. Memeriksa /etc/hosts"
    
    if grep -q "$DOMAIN" /etc/hosts 2>/dev/null; then
        print_success "$DOMAIN sudah ada di /etc/hosts"
    else
        print_warning "$DOMAIN belum ada di /etc/hosts. Menambahkan..."
        HOST_ENTRY="127.0.0.1    $DOMAIN"
        echo "$HOST_ENTRY" | sudo tee -a /etc/hosts >/dev/null
        
        if grep -q "$DOMAIN" /etc/hosts 2>/dev/null; then
            print_success "$DOMAIN berhasil ditambahkan ke /etc/hosts"
        else
            print_error "Gagal menambahkan ke /etc/hosts. Silakan tambahkan manual:"
            print_info "  sudo nano /etc/hosts"
            print_info "  Tambahkan: $HOST_ENTRY"
            exit 1
        fi
    fi
}

# Step 6: Setup Environment Files
setup_env_files() {
    print_step "6. Memeriksa Environment Files"
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        print_warning "backend/.env tidak ditemukan"
        
        if [ -f "backend/.env.example" ]; then
            print_info "Membuat backend/.env dari .env.example..."
            cp backend/.env.example backend/.env
            print_success "backend/.env berhasil dibuat"
            
            # Update APP_URL
            if [ "$OS" = "macos" ]; then
                sed -i '' "s|APP_URL=.*|APP_URL=https://$DOMAIN|g" backend/.env
            else
                sed -i "s|APP_URL=.*|APP_URL=https://$DOMAIN|g" backend/.env
            fi
            print_success "APP_URL diupdate ke https://$DOMAIN"

            # Pastikan APP_NAME yang mengandung spasi diberi kutip
            if grep -q '^APP_NAME=' backend/.env; then
                if grep -q '^APP_NAME=.* ' backend/.env && ! grep -q '^APP_NAME="' backend/.env; then
                    if [ "$OS" = "macos" ]; then
                        sed -i '' 's/^APP_NAME=.*/APP_NAME="Shine Education"/' backend/.env
                    else
                        sed -i 's/^APP_NAME=.*/APP_NAME="Shine Education"/' backend/.env
                    fi
                    print_success "APP_NAME dikutip agar valid"
                fi
            else
                echo 'APP_NAME="Shine Education"' >> backend/.env
            fi
        else
            print_warning "backend/.env.example tidak ditemukan. Membuat backend/.env dasar..."
            cat > backend/.env <<EOF
APP_NAME="Shine Education"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=Asia/Jakarta
APP_URL=https://$DOMAIN
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US
APP_MAINTENANCE_DRIVER=file

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=shine_db
DB_USERNAME=shine_user
DB_PASSWORD=shine_password
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

CACHE_STORE=redis
CACHE_PREFIX=
REDIS_CLIENT=predis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="\${APP_NAME}"

VITE_APP_NAME="\${APP_NAME}"
EOF
            print_success "backend/.env dasar berhasil dibuat"
        fi
    else
        print_success "backend/.env sudah ada"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env.local" ] && [ ! -f "frontend/.env" ]; then
        print_warning "frontend development .env tidak ditemukan. Membuat..."
        
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env.local
            print_success "frontend/.env.local berhasil dibuat dari .env.example"
        else
            cat > frontend/.env.local <<EOF
NEXT_PUBLIC_API_BASE=https://$DOMAIN/api
EOF
            print_success "frontend/.env.local dasar berhasil dibuat"
        fi
    else
        print_success "frontend environment file sudah ada"
    fi
}

# Step 7: Build and Start Docker Containers
start_containers() {
    print_step "7. Membuat dan Menjalankan Docker Containers"
    
    print_info "Membangun dan memulai semua services..."
    
    # Stop containers jika sudah running
    if docker compose ps 2>/dev/null | grep -q "Up"; then
        print_warning "Beberapa containers sedang berjalan. Menghentikan..."
        docker compose down 2>/dev/null || true
    fi
    
    # Build dan start (disable exit on error untuk bagian ini)
    set +e
    docker compose up -d --build
    local compose_exit=$?
    set -e
    
    if [ $compose_exit -ne 0 ]; then
        print_error "Gagal membangun atau menjalankan containers."
        print_info "Cek logs dengan: docker compose logs"
        exit 1
    fi
    
    print_success "Docker containers berhasil dimulai"
    print_info "Menunggu services siap..."
    
    # Wait for database
    print_info "Menunggu database ready..."
    sleep 5
    local retry=0
    while [ $retry -lt 30 ]; do
        if docker compose exec -T db mysqladmin ping -h localhost --silent 2>/dev/null; then
            print_success "Database siap"
            break
        fi
        sleep 2
        retry=$((retry + 1))
    done
    
    if [ $retry -eq 30 ]; then
        print_error "Database tidak ready setelah 60 detik. Cek logs dengan: docker compose logs db"
    fi
    
    # Wait for Redis
    print_info "Menunggu Redis ready..."
    sleep 2
    retry=0
    while [ $retry -lt 15 ]; do
        if docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
            print_success "Redis siap"
            break
        fi
        sleep 2
        retry=$((retry + 1))
    done
    
    if [ $retry -eq 15 ]; then
        print_warning "Redis tidak ready setelah 30 detik (akan dicoba lagi nanti jika diperlukan)"
    fi
}

# Step 8: Setup Laravel
setup_laravel() {
    print_step "8. Setup Laravel Application"
    
    # Wait for backend container
    print_info "Menunggu backend container ready..."
    sleep 3
    
    # Install PHP dependencies (dev) di dalam container
    print_info "Menginstall PHP dependencies (termasuk dev) di container backend..."
    set +e
    # Tunggu container ready dulu
    sleep 3
    if docker compose exec -T backend composer install --no-interaction 2>/dev/null; then
        print_success "Composer install selesai"
    else
        print_warning "Composer install gagal (mungkin sudah terinstall atau container belum ready). Melanjutkan..."
    fi
    
    # Regenerate autoload untuk memastikan semua class ter-load dengan benar
    print_info "Meregenerate autoload files..."
    docker compose exec -T backend composer dump-autoload -o 2>/dev/null || print_warning "Autoload regeneration skipped"
    
    # Install Predis (Redis client) jika belum ada
    # Note: Predis seharusnya sudah ada di composer.json, jadi tidak perlu install manual
    print_info "Memeriksa Predis (Redis client)..."
    if docker compose exec -T backend composer show predis/predis --no-interaction 2>/dev/null >/dev/null; then
        print_success "Predis sudah terinstall"
    else
        print_warning "Predis tidak ditemukan di vendor (seharusnya sudah ada di composer.json). Regenerating autoload..."
        docker compose exec -T backend composer dump-autoload -o 2>/dev/null || true
    fi
    set -e

    # Generate APP_KEY jika belum ada
    print_info "Memeriksa APP_KEY..."
    if docker compose exec -T backend php artisan key:generate --show 2>/dev/null | grep -q "APP_KEY="; then
        CURRENT_KEY=$(docker compose exec -T backend php artisan key:generate --show 2>/dev/null | grep "APP_KEY=")
        if [[ "$CURRENT_KEY" == *"base64:AAAAAAAAAAAAAAAAAAAA"* ]] || [[ -z "$CURRENT_KEY" ]]; then
            print_warning "APP_KEY belum di-generate. Mengenerate..."
            docker compose exec -T backend php artisan key:generate --force
            print_success "APP_KEY berhasil di-generate"
        else
            print_success "APP_KEY sudah ada"
        fi
    else
        print_warning "Mengenerate APP_KEY..."
        docker compose exec -T backend php artisan key:generate --force
        print_success "APP_KEY berhasil di-generate"
    fi
    
    # Clear dan cache config agar membaca .env terbaru
    print_info "Membersihkan cache konfigurasi..."
    docker compose exec -T backend php artisan optimize:clear || true
    
    # Clear config cache untuk memastikan Redis config ter-load
    print_info "Memastikan konfigurasi Redis ter-load..."
    docker compose exec -T backend php artisan config:clear || true
    docker compose exec -T backend php artisan config:cache || true
    
    # Run migrations (non-critical, continue even if fails)
    print_info "Menjalankan database migrations..."
    set +e
    if docker compose exec -T backend php artisan migrate --force 2>/dev/null; then
        print_success "Database migrations berhasil dijalankan"
    else
        print_warning "Migration gagal atau sudah up-to-date (ini normal jika sudah dijalankan sebelumnya)"
    fi
    set -e
    
    # Jalankan seeder (non-critical saat sudah ter-seed)
    print_info "Menjalankan database seeder..."
    set +e
    if docker compose exec -T backend php artisan db:seed --force 2>/dev/null; then
        print_success "Database seeding berhasil"
    else
        print_warning "Seeding gagal atau data sudah ada (aman untuk diabaikan jika sudah terisi)"
    fi
    set -e
    
    # Setup storage link
    print_info "Memeriksa storage link..."
    if docker compose exec -T backend php artisan storage:link 2>/dev/null; then
        print_success "Storage link berhasil dibuat"
    else
        print_info "Storage link sudah ada atau tidak diperlukan"
    fi
}

# Step 9: Show Status
show_status() {
    print_step "9. Status Aplikasi"
    
    echo ""
    print_success "Setup selesai! Aplikasi siap digunakan."
    echo ""
    print_info "Services Status:"
    docker compose ps
    echo ""
    print_info "Akses Aplikasi:"
    echo -e "  ${GREEN}Frontend:${NC} https://$DOMAIN"
    echo -e "  ${GREEN}API:${NC}      https://$DOMAIN/api"
    echo ""
    print_info "Useful Commands:"
    echo "  View logs:           docker compose logs -f [service-name]"
    echo "  Stop services:       docker compose down"
    echo "  Restart service:     docker compose restart [service-name]"
    echo "  Artisan commands:    docker compose exec backend php artisan [command]"
    echo "  Frontend commands:   docker compose exec frontend npm [command]"
    echo ""
    print_warning "Catatan:"
    echo "  - Jika browser menampilkan 'Not Secure', pastikan mkcert root CA sudah diinstall"
    echo "  - Restart browser setelah install root CA untuk pertama kali"
    echo "  - Lihat BRAVE-FIX-GUIDE.txt untuk troubleshooting browser cache"
    echo ""
}

# Main execution
main() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║      SIK - Shine Education Bali Setup Script              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    check_os
    check_project_structure
    check_prerequisites
    install_mkcert
    install_root_ca
    generate_certificate
    setup_hosts
    setup_env_files
    start_containers
    setup_laravel
    show_status
    
    print_success "Semua setup berhasil! 🚀"
    echo ""
}

# Run main function
main

