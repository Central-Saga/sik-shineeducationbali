#!/bin/bash

# Script untuk clear browser cache dan HSTS untuk shine.local.test

cat << 'EOF'

═══════════════════════════════════════════════════════════
  FIX BROWSER CACHE & HSTS
═══════════════════════════════════════════════════════════

Untuk Chrome/Edge:
1. Buka: chrome://net-internals/#hsts
2. Di bagian "Delete domain security policies", ketik: shine.local.test
3. Klik "Delete"
4. Di bagian "Query HSTS/PKP domain", ketik: shine.local.test
5. Klik "Query" untuk verifikasi sudah terhapus

Untuk Chrome:
1. Settings > Privacy and security > Clear browsing data
2. Pilih "Advanced" tab
3. Time range: "All time"
4. Centang: "Cached images and files", "Cookies and other site data"
5. Klik "Clear data"

Untuk Safari:
1. Develop > Empty Caches (Cmd+Option+E)
2</parameter> atau
2. Safari > Settings > Privacy > Manage Website Data
3. Cari "shine.local.test" dan hapus

Setelah itu:
1. RESTART BROWSER SEPENUHNYA (tutup semua window)
2. Buka: https://shine.local.test
3. Jika muncul security prompt, klik "Show Details" > "visit this website"

EOF

echo ""
echo "Certificate info:"
echo "Certificate: $(openssl s_client -connect shine.local.test:443 -servername shine.local.test </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer 2>/dev/null | head -2)"
echo ""
echo "Test dengan: curl -k https://shine.local.test"

