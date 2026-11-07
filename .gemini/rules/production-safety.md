---
description: Aturan Mutlak Keamanan Data Production, Audit Skema, dan Regression Testing BREAKOUT ID
globs: **/*
alwaysApply: true
---

# ATURAN MUTLAK KEAMANAN DATA PRODUCTION & STABILITAS BREAKOUT ID

Prioritas Utama: **STABILITAS, KEAMANAN DATA, DAN BACKWARD COMPATIBILITY**.

## 1. Audit Awal (Sebelum Pengerjaan)
- **WAJIB** melakukan inspeksi kondisi database production, skema tabel fisik, kueri API, dan media storage yang terkait dengan fitur/bug yang akan disentuh.
- Catat snapshot/baseline metrik dan jumlah data (Users, Artists, Releases, Tracks, Withdrawals, Catalogs).
- Jangan berasumsi nama kolom atau skema Prisma identik dengan kolom fisik di PostgreSQL — selalu verifikasi skema fisik terlebih dahulu.

## 2. Larangan Perubahan Data & DDL
- **JANGAN PERNAH** menghapus, mereset, atau menimpa data database production.
- **JANGAN MENGGANTI** `DATABASE_URL` atau konfigurasi koneksi database production di `.env`.
- **DILARANG KERAS** menjalankan `prisma migrate reset`, `prisma db push`, `prisma db seed`, atau migrasi DDL apa pun tanpa izin tertulis eksplisit dari user.
- **JANGAN MENGUBAH** struktur tabel fisik di PostgreSQL, relasi, atau query yang sudah berjalan normal jika tidak benar-benar diperlukan.
- **DILARANG MENGGANGGU** data artis, rilisan, track, streaming, katalog, royalti, saldo musisi, dan transaksi withdraw.
- **JANGAN MENGUBAH ATAU MENGHAPUS** file audio dan cover artwork yang sudah di-upload di Cloudflare R2 / local storage.

## 3. Kompatibilitas & Verifikasi Menyeluruh (Jangan Percaya Build Saja)
- Semua fitur baru dan perbaikan bug **WAJIB 100% kompatibel (backward-compatible)** dengan skema dan data yang sudah ada di database production.
- **JANGAN MENGANGGAP BUILD BERHASIL BERARTI SISTEM AMAN.** Kompilasi TypeScript/Next.js hanya memeriksa tipe sintaks kode, bukan kecocokan runtime dengan kolom database production.
- **Bandingkan kondisi SEBELUM dan SESUDAH perubahan:**
  - Pastikan tidak ada data yang hilang.
  - Pastikan tidak ada data yang terubah tanpa sengaja.
  - Pastikan tidak ada data yang terduplikasi.

## 4. Regression Testing Sebelum Deployment
- Lakukan pengujian regresi terhadap fitur-fitur lama yang sudah berjalan:
  1. **Autentikasi:** Login user, login admin, persistensi session token.
  2. **Dashboard Musisi:** Tampilan rilis, streaming, saldo, upload & submit lagu.
  3. **Dashboard Admin:** Saldo endap, overview metrics, pemutar audio, unduhan master, status tab moderasi (Review, ACC, Reject), payout withdrawals.
- **JANGAN MEMPERBAIKI SATU FITUR DENGAN MERUSAK FITUR LAIN.** Pertahankan semua fungsi yang sudah berjalan normal.
- Jika ada perubahan yang berisiko memengaruhi data production, **STOP SEGERA** dan minta persetujuan user terlebih dahulu.
