#!/bin/bash

# Script untuk menambahkan shine.local.test ke /etc/hosts

HOST_ENTRY="127.0.0.1    shine.local.test"

if grep -q "shine.local.test" /etc/hosts; then
    echo "✓ shine.local.test sudah ada di /etc/hosts"
    grep "shine.local.test" /etc/hosts
else
    echo "Menambahkan shine.local.test ke /etc/hosts..."
    echo "$HOST_ENTRY" | sudo tee -a /etc/hosts > /dev/null
    
    if grep -q "shine.local.test" /etc/hosts; then
        echo "✓ Berhasil ditambahkan!"
        echo ""
        echo "Entry yang ditambahkan:"
        grep "shine.local.test" /etc/hosts
    else
        echo "✗ Gagal menambahkan. Silakan tambahkan manual:"
        echo "sudo nano /etc/hosts"
        echo "Tambahkan: $HOST_ENTRY"
    fi
fi

echo ""
echo "Test dengan:"
echo "  ping -c 1 shine.local.test"
echo "  curl -k https://shine.local.test"

