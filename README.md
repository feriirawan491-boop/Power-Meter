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

Data/persistence memakai localStorage, bukan backend pabrik. Login demo memakai sesi cookie bertanda tangan di server; belum ada RBAC produksi, PM5330/ThingsBoard, tarif atau alarm produksi. Jangan memasukkan data sensitif. Label Supervisor/Operator/Akunting/Admin adalah simulasi persona, bukan akun terotorisasi.

Tarif uji bukan tarif Sakuratex/PLN. Semua fungsi cloud publication, actual billing dan klaim gangguan berada di luar kemampuan sandbox ini. Gate produksi, UAT pengguna dan integrasi yang belum selesai dicatat eksplisit dalam status implementasi.

## Data dummy bersama

Semua tampilan memakai ID meter dan jam simulasi bersama (interval 10 detik, WIB). Ringkasan mesin, Panel & Meter, detail, Power Triangle, histori dan ekspor berasal dari generator yang sama. Jeda/lanjut, langkah sampel, dan skenario koneksi berlaku lintas menu selama sesi browser. Power Triangle dihitung dari P/Q/S, bukan angka screenshot.

Konsumsi dan biaya memakai selisih counter dari model yang sama pada batas bulan. November menampilkan subtotal sampai sampel terakhir; meter terputus tidak dianggap nol. Oktober adalah histori simulasi dengan batas bulan lengkap. Tarif tetap dipilih per laporan; bandingkan periode, cakupan meter dan versi tarif yang sama. LWBP/WBP masih asumsi 80/20. Alarm otomatis memakai pembacaan VLL L1–L2 dan aturan aktif; replay memengaruhi sumber tegangan bersama. Belum ada koneksi PM5330/RUT955 atau backend.

Perbandingan biaya mesin–PLN tersedia di Ringkasan Perhitungan dan Laporan. Gap = tagihan PLN − biaya internal seluruh titik ukur; persentase menggunakan tagihan PLN sebagai pembagi. Cakupan tetap seluruh pabrik meskipun filter satu mesin dipilih. Perhitungan ditahan bila mesin terputus atau terlambat. Tagihan otomatis adalah skenario dummy (model energi +4%, WBP/LWBP 20/80, biaya tetap Rp2.500.000, tambahan 3%), bukan aturan PLN. Input nominal tagihan disimpan lokal per periode dan membekukan cutoff pembanding agar rentang perhitungan tidak bergeser.

Skenario awal menyediakan data dummy online untuk seluruh 5 mesin, termasuk Dyeing & Finishing (beban nominal 125 kW), sehingga perbandingan biaya mesin–PLN langsung dapat dihitung. Skenario terlambat/terputus tetap dapat dipilih melalui detail meter dan berlaku serentak lintas menu.

## Login demo

Buka `/login`. Akun: `demo@sakuratex.id`, kata sandi: `demo123`. Kredensial diverifikasi pada route server; halaman dashboard memerlukan cookie sesi HttpOnly yang berlaku 8 jam. Tombol keluar menghapus sesi. Pemilih peran tetap simulasi persona.

Login demo otomatis menyiapkan kunci sesi acak di sisi server saat `npm ci`/build. Tidak perlu mengisi environment untuk menjalankan demo. File `.generated/` diabaikan Git dan tidak masuk aset browser. `DEMO_SESSION_SECRET` tetap dapat diisi untuk memakai kunci yang stabil antar deployment; jangan commit nilai secret ke Git. Ilustrasi hero memakai gambar pabrik tekstil yang diberikan pengguna.
