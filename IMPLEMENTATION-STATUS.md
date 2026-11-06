# Status implementasi Sakuratex — Sandbox Phase 0–7

Versi: 0.7.0 · 6 November 2026 · Target: review lokal frontend, bukan go-live pabrik.

## Login demo

Halaman `/login` menggunakan akun `demo@sakuratex.id` / `demo123`, pemeriksaan server dan sesi cookie HttpOnly 8 jam. Dashboard dilindungi Proxy; logout menghapus sesi. Ini akses demo bersama, bukan otorisasi per pengguna/area produksi.

## URL review

- Ringkasan: http://127.0.0.1:5173/
- Panel dan histori: http://127.0.0.1:5173/meters
- Alarm: http://127.0.0.1:5173/alarms
- Biaya Akunting: http://127.0.0.1:5173/energy/accounting
- Biaya PLN: http://127.0.0.1:5173/energy/pln
- Rekap bulanan: http://127.0.0.1:5173/energy/monthly
- Laporan: http://127.0.0.1:5173/reports
- Pengaturan: http://127.0.0.1:5173/settings

## Capaian per fase

| Fase | Tersedia untuk review | Batas / pekerjaan yang belum selesai |
|---|---|---|
| 0 | Next.js, TS strict, Tailwind, Radix, Lucide, modular UI dan scripts | Hosting eksternal tidak diaktifkan |
| 1 | IA, istilah, fixture, route per modul dan alur utama | Wawancara, inventaris nyata, kontrak integrator dan D-01–D-09 belum disahkan |
| 2 | Brand tokens, typography operasional, komponen reusable, responsive, dialog/form | Uji lima pengguna aktual dan sign-off visual client belum dilakukan |
| 3 | Detail kelistrikan/THD, age scenarios, replay 10 detik, histori 36 sampel, grafik bergap, pagination/parameter filter | Belum ada transport/API PM5330/ThingsBoard, dukungan register/CT/PT atau commissioning |
| 4 | Dua route biaya, counter/delta, fixture lengkap/parsial, subtotal energi, versi tarif, penerbitan rekap idempotent | Tarif dan WBP/LWBP contoh, bukan PLN; engine bisnis server/effective-time allocation belum terintegrasi |
| 5 | Daftar/detail alarm, replay pelanggaran, ack independen dari pulih, catatan append-only, timeline dan audit lokal | Kejadian tidak bersumber perangkat; belum ada kanal eksternal atau rule engine platform |
| 6 | Filter laporan terapkan/pratinjau, CSV/XLSX/cetak, settings tarif/rule berversi, inventaris read-only, matriks peran | Role switch bukan auth/RBAC; belum ada job ekspor besar, konfigurasi inventaris produksi atau audit server |
| 7 | Lint, typecheck, test, build, scan semantik axe, browser smoke, validasi XLSX dan workflow CI tertulis | Workflow belum dijalankan di remote, belum ada load/CWV/coverage 80%/pilot 7 hari/UAT pengguna/backup server |

Semua fase telah mendapat implementasi **alur sandbox frontend**, tetapi seluruh gate penerimaan produksi PRD belum terpenuhi. Perbedaan ini tidak boleh disampaikan ke client sebagai seluruh proyek sudah selesai.

## Hasil verifikasi

- `npm run lint`: berhasil, tanpa error/warning pada source aplikasi yang diperiksa.
- `npm run typecheck`: berhasil (hasil final sesi).
- `npm run test`: 44 test lulus dalam 7 file.
- `npm run build`: production Next.js webpack build berhasil, 12 route termasuk metadata/not-found.
- Lima halaman diperiksa melalui axe untuk temuan semantik serious/critical; test lulus. Color contrast dinonaktifkan pada jsdom karena tidak memiliki renderer/canvas; hasil bukan sertifikasi WCAG. Kontras token primary diverifikasi terpisah.
- Browser smoke: route biaya Akunting/PLN, daftar/detail alarm, konfirmasi pengakuan yang mempertahankan status Aktif, laporan dan unduhan Excel.
- File XLSX hasil unduhan dibuka ulang dengan openpyxl: satu worksheet, 14 baris, 6 kolom; struktur workbook diterima. Unit test ZIP/XML memeriksa sel numerik dan teks mirip formula sebagai inline text.
- Audit setelah penambahan dependency: 0 critical, 0 high, 8 moderate pada rantai tooling lint yang telah dicatat sebelumnya. Tidak menggunakan force downgrade otomatis.
- Next menampilkan warning lockfile induk di luar repo dan Node deprecation; build tetap exit 0. Test axe menampilkan peringatan canvas jsdom; tidak dipakai mengklaim audit visual.

## Aturan data dan keterbatasan

- Semua data sintetis; tidak ada rahasia pabrik atau credential upstream.
- Histori 6 November 2026, 11.10–11.15.50 WIB, 36 slot @10 detik. Dua slot sengaja hilang. Meter PM-004 seluruh sampelnya hilang.
- Snapshot Oktober dan data hari berjalan adalah dua fixture terpisah. Counter bulanan tidak dipakai untuk mengklaim rekonsiliasi meter nyata.
- Tarif uji awal: Akunting 1.000; LWBP 1.000; WBP 1.500 rupiah/kWh. Pembagian kategori 80/20 disediakan fixture, bukan jadwal atau hasil alokasi PLN.
- Hasil biaya hanya komponen energi, bukan seluruh tagihan. Angka rupiah dihitung dengan scaled BigInt dan half-up; tarif bukan rekomendasi tarif aktual.
- Helper batas periode menerapkan toleransi 30 detik usulan PRD dan memiliki unit test; belum terhubung ke scheduler tutup bulan atau sumber live.
- Replay rule mendukung contoh over-threshold dengan durasi/gap. Aturan under-voltage, low PF, overload, hysteresis/recovery lengkap serta lifecycle platform belum diklaim sebagai engine produksi.
- Replay 10 detik bekerja saat detail meter terbuka; tidak dianggap monitoring background pabrik. Pengamatan timestamp fixture dan waktu aksi lokal dibedakan.
- Peran hanya mengatur UI dan aksi demo. Kode/data tetap dapat diperiksa di browser. Jangan memasukkan data operasional atau informasi sensitif.
- Tarif/event/catatan/audit/terbit disimpan pada localStorage. Tidak dibagikan lintas perangkat; bukan penyimpanan yang tahan manipulasi/backup. Jangan menggunakan untuk bukti resmi.
- Filter intra-halaman diterapkan konsisten ke preview/download. Perpindahan route/reload dapat mengembalikan filter ke default; URL query persistence lanjutan belum diimplementasikan.
- CSV/Excel memuat fixture kecil (maksimum 180 baris pada histori). Belum ada pagination/export async 100.000 baris backend.
- CSS cetak tersedia; paginasi printer/browser aktual masih perlu UAT client.

## Penghalang go-live

1. Backend dan auth/RBAC server dengan scope area, log audit terlindungi, backup/restore.
2. Akses integrator/perangkat: register, unit, definisi parameter, arah counter, CT/PT, timestamp, toleransi dan bukti rekonsiliasi per meter.
3. Topologi meter eksklusif; titik ukur kompresor; evaluasi kemampuan event recording/resolusi.
4. Pengesahan rumus/tarif/kalender biaya, snapshot dan SOP rekonsiliasi.
5. Threshold/durasi/hysteresis, PIC/shift, notifikasi dan escalation.
6. UAT seluruh baseline, usability pengguna aktual, performa, pilot dan sign-off.

## Publikasi

Tidak ada upload atau deployment pada kelanjutan fase ini. Pengajuan publikasi pada pekerjaan sebelumnya ditolak auto-review karena otorisasi egress source belum dianggap eksplisit. Site terdaftar bukan bukti live deployment. Gunakan URL lokal di atas.

## Pembaruan dashboard kelistrikan dummy — 6 November 2026

- VLN L1–N/L2–N/L3–N ditambahkan, bersama VLL, arus fasa/netral, kW/kvar/kVA, PF, Hz dan E-Total.
- Generator `lib/telemetry.ts` menyediakan satu snapshot/timestamp bagi seluruh field; pembaruan otomatis 10 detik saat dummy online. Bisa dijeda atau dimajukan manual satu sampel.
- P/Q/S/PF dan arus dihitung saling terkait untuk contoh beban tiga fasa; pendekatan ini bukan model pengukuran jaringan pabrik.
- Counter energi terintegrasi dari daya per interval, tidak looping kembali ke awal ketika melewati 36 sampel. Histori live adalah jendela 36 sampel terakhir.
- Tab Sinkronisasi E-Total membandingkan display PM5330 dummy dan nilai aplikasi dari sumber snapshot sama. Selisih nol merupakan demonstrasi UI/data, bukan bukti sinkronisasi perangkat nyata.
- Histori statis, chart, serta ekspor histori memakai generator yang sama pada timestamp fixture. Gap fixture tetap tersedia untuk pengujian; histori harian/bulanan adalah periode berbeda.
- Mode Snapshot referensi tetap tersedia; angka screenshot lama tidak diubah atau dilabeli sebagai pembacaan live.
- Supervisor: pilih mesin terhubung untuk membuka dashboard dummy. Panel & Meter: Detail membuka dashboard yang sama; untuk meter offline pilih skenario Online untuk mencoba data dummy.
- Terlambat menahan nilai sampel terakhir. Terputus menampilkan “—”, bukan nol. Kembali online menjalankan generator dummy, tidak menghubungkan perangkat fisik.
- Seluruh dukungan PM5330/RUT955 pada UI adalah simulasi di browser. Mapping register, transfer jaringan, buffering, event perangkat dan commissioning tetap menunggu integrasi nyata.

Verifikasi setelah pembaruan dummy: lint, typecheck dan production build berhasil; 55 test lulus dalam 11 file. Browser memverifikasi VLN, pemajuan sampel 10 detik, perubahan parameter bersama, serta E-Total display/aplikasi identik pada timestamp sama.

## Pembaruan UX Energi & Biaya — 6 November 2026

- Ringkasan konsumsi kWh, subtotal biaya rupiah dan kelengkapan titik ukur ditampilkan sebelum rincian tabel.
- Penjelasan tujuan Akunting/PLN/rekap, formula dan kategori WBP/LWBP memakai bahasa Indonesia yang jelas. Asumsi dummy 80/20 tetap eksplisit.
- Tabel Akunting pada halaman energi dan unduhannya hanya memuat konsumsi, tarif internal, biaya dan titik ukur; kategori waktu tidak dicampur ke rumus internal.
- Periode tidak lengkap menjelaskan counter yang hilang; tidak menampilkan biaya nol dan menawarkan contoh bulan lengkap.
- Filter periode/titik ukur/versi tarif dicantumkan di URL; berpindah dashboard membawa pilihan yang sama. Query divalidasi pada server page.
- Informasi asal data/asumsi dapat dibuka sesuai kebutuhan, export/cetak dipisahkan setelah rincian. Format unduhan mengikuti report yang sedang ditampilkan.
- Tab mobile tersusun dua baris tanpa menyembunyikan pilihan Rekap; pemeriksaan browser tidak menemukan overflow body pada 375 px.
- Mode statis dashboard kelistrikan sebelumnya tidak diubah oleh perbaikan ini.
- 59 test lulus, termasuk empat skenario UX energi baru; lint/build berhasil. Test axe tetap tidak memvalidasi kontras visual jsdom. Uji pengguna client belum dilakukan.
