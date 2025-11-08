#!/bin/bash
set -e

echo "Starting Laravel application setup..."

# Change to working directory
cd /var/www/html || exit

# Wait for database and redis to be ready
echo "Waiting for services to be ready..."
sleep 5

# Install composer dependencies if vendor doesn't exist or is empty
if [ ! -d "vendor" ] || [ -z "$(ls -A vendor 2>/dev/null)" ]; then
    echo "Installing composer dependencies..."
    composer install --optimize-autoloader --no-interaction --prefer-dist --no-scripts
    echo "Composer dependencies installed successfully"
else
    echo "Vendor directory exists, checking if dependencies are complete..."
    # Check if key packages exist
    if [ ! -d "vendor/laravel" ] || [ ! -d "vendor/predis" ]; then
        echo "Key packages missing, reinstalling dependencies..."
        composer install --optimize-autoloader --no-interaction --prefer-dist --no-scripts
    fi
fi

# Run composer scripts after dependencies are installed
echo "Running composer scripts..."
composer dump-autoload --optimize --no-interaction || true

# Clear all caches before generating key (to avoid bootstrap errors)
echo "Clearing Laravel caches..."
php artisan config:clear 2>/dev/null || true
php artisan cache:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true

# Generate APP_KEY if not set (check .env file)
if [ ! -f ".env" ] || ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
    echo "Generating application key..."
    php artisan key:generate --force 2>/dev/null || true
fi

# Clear caches again after key generation
echo "Final cache clear..."
php artisan config:clear 2>/dev/null || true
php artisan cache:clear 2>/dev/null || true

# Start the server
echo "Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=8000

