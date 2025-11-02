# Fix Sonner Module Not Found Error

Jika masih mendapat error "Module not found: Can't resolve 'sonner'", ikuti langkah berikut:

## Solusi 1: Restart Dev Server
```bash
# Stop dev server (Ctrl+C), lalu:
cd frontend
npm run dev
```

## Solusi 2: Clear Cache dan Reinstall
```bash
cd frontend
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

## Solusi 3: Manual Install Sonner
```bash
cd frontend
npm install sonner@^2.0.7 --save
npm run dev
```

## Verifikasi
Pastikan sonner terinstall:
```bash
ls node_modules/sonner
cat package.json | grep sonner
```

Jika masih error setelah semua langkah di atas, coba:
- Restart VS Code / Editor
- Restart terminal
- Check apakah ada konflik dengan package lain

