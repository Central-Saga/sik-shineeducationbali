# Fix Turbopack Runtime Error

## 🔍 Masalah yang Ditemukan

Error terjadi karena:
1. **Tailwind arbitrary variant syntax** `group/item` dan `group-hover/item:` tidak kompatibel dengan Turbopack di Next.js 16
2. **Arbitrary color values** seperti `text-[#DAA625]` mungkin menyebabkan masalah parsing

## ✅ Perbaikan yang Sudah Dilakukan

1. ✅ Menghapus `@layer utilities` dari `globals.css` (sudah diubah ke CSS biasa)
2. ✅ Mengganti `group/item` dengan `group` standard di sidebar
3. ✅ Mengganti arbitrary color `text-[#DAA625]` dengan `text-secondary` (menggunakan CSS variable)

## 🔧 Langkah Troubleshooting

### Langkah 1: Clear Cache dan Restart

```bash
cd frontend
rm -rf .next
npm run dev
```

### Langkah 2: Jika Masih Error - Nonaktifkan Turbopack

Edit `package.json`:
```json
"dev": "next dev --no-turbopack"
```

Lalu:
```bash
npm run dev
```

### Langkah 3: Jika Masih Error - Check Dependencies

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Langkah 4: Verify CSS Syntax

Pastikan `globals.css` tidak ada syntax error. File sudah diperbaiki dengan:
- CSS gradient classes tanpa `@layer utilities`
- OKLCH color format yang valid

## 📝 Catatan

- Tailwind v4 dengan Turbopack masih dalam tahap stabilisasi
- Jika error terus terjadi, gunakan `--no-turbopack` flag untuk development
- Semua styling dan warna tetap berfungsi dengan atau tanpa Turbopack










