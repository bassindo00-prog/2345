---
description: Aturan Mutlak Keamanan Data Production dan Stabilitas BREAKOUT ID
globs: **/*
alwaysApply: true
---

# ATURAN MUTLAK KEAMANAN DATA PRODUCTION & STABILITAS BREAKOUT ID

Prioritas Utama: **STABILITAS, KEAMANAN DATA, DAN BACKWARD COMPATIBILITY**.

1. **JANGAN PERNAH** menghapus, mereset, atau menimpa data database production.
2. **JANGAN MENGGANTI** `DATABASE_URL` atau konfigurasi koneksi database production di `.env`.
3. **DILARANG KERAS** menjalankan `prisma migrate reset`, `prisma db push`, `prisma db seed`, atau migrasi DDL apa pun tanpa izin tertulis eksplisit dari user.
4. **JANGAN MENGUBAH** struktur tabel fisik di PostgreSQL, relasi, atau query yang sudah berjalan normal jika tidak benar-benar diperlukan.
5. Semua fitur baru dan perbaikan bug **WAJIB 100% kompatibel (backward-compatible)** dengan skema dan data yang sudah ada di database production.
6. **DILARANG MENGGANGGU** data artis (261 artis), rilisan (1.153 rilisan), track, streaming, katalog (39.000+), royalti, saldo musisi, dan transaksi withdraw (150 payouts).
7. **JANGAN MENGUBAH ATAU MENGHAPUS** file audio dan cover artwork yang sudah di-upload di Cloudflare R2 / local storage.
8. Sebelum melakukan update atau commit, periksa kode secara menyeluruh dan lakukan `npm run build` lokal terlebih dahulu untuk verifikasi kelulusan kompilasi tanpa error.
9. **JANGAN MEMPERBAIKI SATU FITUR DENGAN MERUSAK FITUR LAIN.** Pertahankan semua fungsi yang sudah berjalan normal.
10. Jika ada perubahan yang berisiko memengaruhi data production, **STOP SEGERA** dan minta persetujuan user terlebih dahulu.
