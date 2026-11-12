# Sakuratex Power Meter — Sandbox Phase 0–7

Aplikasi frontend review dengan Next.js App Router, React, TypeScript strict, Tailwind CSS, Radix UI, Lucide, RHF + Zod. Semua angka adalah fixture sintetis.

## Jalankan

```sh
npm ci
npm run dev
```

Buka http://127.0.0.1:5173/. Server tetap berjalan untuk review lokal. Menggunakan webpack karena batasan Turbopack pada lingkungan lokal ini.

## Pemeriksaan

```sh
npm run lint
npm run typecheck
npm run test
npm run build
```

Jalankan typecheck setelah build selesai, bukan bersamaan saat Next mengubah generated types. Tests: unit/component/integration + pemeriksaan semantik axe. CI template tersedia dalam .github/workflows/ci.yml; belum dijalankan di hosting remote.

Baca [panduan review](REVIEW-GUIDE.md) dan [status implementasi / penghalang go-live](IMPLEMENTATION-STATUS.md).

Untuk serah terima pengembangan, gunakan [dokumen handoff](HANDOFF.md), yang
merangkum arsitektur, alur data, validasi terakhir, checklist penerimaan, dan
prioritas integrasi produksi setelah audit 10 November 2026.

## Modul

Monitoring/detail/histori, dua dashboard biaya, rekap bulanan, alarm/ack/catatan/replay, export CSV/XLSX/cetak, settings versi tarif/rule, peran UI dan audit lokal.

Data simulasi operasional tetap memakai localStorage. Akun login dan role disimpan di database SQLite lokal; halaman dan API user membaca role dari sesi server. Pembacaan pabrik, PM5330/ThingsBoard, tarif atau alarm produksi belum terhubung. Jangan memasukkan data sensitif produksi.

Tarif uji bukan tarif Sakuratex/PLN. Semua fungsi cloud publication, actual billing dan klaim gangguan berada di luar kemampuan sandbox ini. Gate produksi, UAT pengguna dan integrasi yang belum selesai dicatat eksplisit dalam status implementasi.

## Data dummy bersama

Semua tampilan memakai ID meter dan jam simulasi bersama (interval 10 detik, WIB). Ringkasan mesin, Panel & Meter, detail, Power Triangle, histori dan ekspor berasal dari generator yang sama. Jeda/lanjut, langkah sampel, dan skenario koneksi berlaku lintas menu selama sesi browser. Power Triangle dihitung dari P/Q/S, bukan angka screenshot.

Konsumsi dan biaya memakai selisih counter dari model yang sama pada batas bulan. November menampilkan subtotal sampai sampel terakhir; meter terputus tidak dianggap nol. Oktober adalah histori simulasi dengan batas bulan lengkap. Tarif tetap dipilih per laporan; bandingkan periode, cakupan meter dan versi tarif yang sama. LWBP/WBP masih asumsi 80/20. Alarm otomatis memakai pembacaan VLL L1–L2 dan aturan aktif; replay memengaruhi sumber tegangan bersama. Belum ada koneksi PM5330/RUT955 atau backend.

Perbandingan biaya mesin–PLN tersedia di Ringkasan Perhitungan dan Laporan. Gap = tagihan PLN − biaya internal seluruh titik ukur; persentase menggunakan tagihan PLN sebagai pembagi. Cakupan tetap seluruh pabrik meskipun filter satu mesin dipilih. Perhitungan ditahan bila mesin terputus atau terlambat. Tagihan otomatis adalah skenario dummy (model energi +4%, WBP/LWBP 20/80, biaya tetap Rp2.500.000, tambahan 3%), bukan aturan PLN. Input nominal tagihan disimpan lokal per periode dan membekukan cutoff pembanding agar rentang perhitungan tidak bergeser.

Skenario awal menyediakan data dummy online untuk seluruh 5 mesin, termasuk Dyeing & Finishing (beban nominal 125 kW), sehingga perbandingan biaya mesin–PLN langsung dapat dihitung. Skenario terlambat/terputus tetap dapat dipilih melalui detail meter dan berlaku serentak lintas menu.

## User accounts

`npm run dev` and `npm run build` initialize a local SQLite database at `.data/users.sqlite` and create one account for each role if it does not exist. The four initial accounts use password `Demo123`. Their email, role, and password are listed in `.generated/initial-user-credentials.json` with owner-only file permissions. Keep that file private; both local directories are excluded from Git.

Initial email addresses are `admin@sakuratex.id`, `supervisor@sakuratex.id`, `operator@sakuratex.id`, and `accounting@sakuratex.id`. The Admin account can create users, change roles, disable accounts, and reset passwords from Settings → User access. Passwords are salted scrypt hashes. Accounts can sign in at `/login`; their role is read from the database and cannot be changed from the browser UI.

SQLite uses Node's built-in `node:sqlite`; use Node.js 22.13 or newer. Set `AUTH_DATABASE_PATH` to place the database on a persistent volume. The included SQLite setup is for a single persistent Node host and is not suitable for ephemeral serverless filesystems or multi-instance deployments without shared database storage. `DEMO_SESSION_SECRET` can be set to a stable, private session signing secret; do not commit secrets.
