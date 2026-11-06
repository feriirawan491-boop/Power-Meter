# Hasil Perbaikan Audit — 6 November 2026

Dokumen ini melengkapi audit awal; hasil gagal di evidence awal tetap merupakan rekaman sebelum perbaikan.

## Perubahan yang selesai

| Temuan | Perbaikan | Bukti regresi |
|---|---|---|
| F-01 | Journal kejadian disimpan di localStorage; disconnect menandai data UNKNOWN, tidak menghapus alarm atau menganggapnya pulih. Pemulihan harus diamati pada sampel normal yang berurutan. | A-01, A-04, alarm-regression |
| F-02 | ID kejadian aktif dipertahankan dari journal saat jendela pencarian bergeser. | A-02 |
| F-03 | Rule baru berlaku mulai sampel berikutnya; kejadian aktif menyimpan batas dan durasi pemulihan versi asal, ack dan catatan tetap tersimpan. | A-03, store, alarm-regression |
| F-04 | Replay menambahkan sampel dengan timestamp baru. Sampel yang sudah diamati tidak ditimpa. | A-08, unified-data |
| F-05 | Tombol cetak membuat salinan laporan terpilih di target cetak tersendiri. CSS cetak menyembunyikan konten selain target. CSV/Excel tetap memakai report yang sama. | A-11 |
| A-10 | Under Voltage, Overload dan Low PF tersedia di evaluator dan dropdown replay, bersama Over Voltage. | A-10, alarm-regression |
| Snapshot bulanan | Penerbitan Oktober menyimpan nilai report, metadata, source meter IDs, batas tick, versi generator, rule dan nilai tarif. Salinan terbit dapat ditampilkan, dicetak dan diekspor. | publication regression |

## Perilaku UI

- Alarm: pilih jenis simulasi, tekan Replay pelanggaran, buka Detail. Akui penerimaan terpisah dari Replay data pulih.
- Tidak ada data: alarm tetap aktif dengan label data terputus. Waktu offline tidak dipakai sebagai bukti durasi pulih.
- Pengaturan > Aturan alarm: batas atas/bawah tegangan, arus maksimum, PF minimum, durasi pemicu/pulih dan hysteresis dapat ditinjau. Input divalidasi; perubahan membutuhkan alasan.
- Rekap akhir bulan: penerbitan hanya untuk Oktober lengkap, seluruh meter dan peran yang sesuai. Catatan terbit lama tanpa snapshot ditandai demikian; nilai historis tidak dibuat-buat.
- Susunan tampilan dashboard dipertahankan; tidak menambah Peak Demand yang berada di luar cakupan aktif.

## Validasi

- 97 test lulus pada 19 file, mencakup 11 diagnostik audit yang kini masuk `npm run test`.
- `npm run lint`, `npm run typecheck`, `npm run build` diverifikasi kembali setelah perubahan.
- Browser lokal: pilihan Low PF, pembentukan kejadian aktif dan pemulihan teramati berhasil. Pemulihan tidak mengakui penerimaan secara otomatis.
- Pengujian cetak memverifikasi pemilihan report dan target DOM. Hasil fisik printer serta pemenggalan semua halaman belum diuji.
- jsdom memberi pesan canvas tidak tersedia pada pengujian aksesibilitas; ini bukan pengujian visual chart di browser.

## Batas hasil dan pekerjaan tersisa

Perbaikan ini menutup cacat F-01 sampai F-05 pada sandbox, bukan persetujuan go-live pabrik.

1. Alarm dummy mencakup tegangan L1–L2, arus L1 dan PF total; belum semua fasa. Ambang masih contoh, belum disahkan engineer. Tidak ada pengiriman notifikasi email/WhatsApp.
2. History live tetap 36 sampel; counter periode adalah model dummy, bukan arsip time-series aktual. Journal disimpan di browser, dapat diubah pemilik browser dan belum memiliki retensi server.
3. Pemilihan tarif tetap manual; pembagian WBP/LWBP tetap asumsi 20/80 yang ditandai pada UI. Perpindahan tarif efektif otomatis, jadwal aktual dan skenario rollover perangkat harus dikerjakan saat kebijakan dan mapping tersedia.
4. Snapshot terbit disimpan lokal dan manual, belum penutupan terjadwal server. Snapshot tidak mengubah status mutu model dummy menjadi bukti pengukuran pabrik.
5. Integrasi 18 panel, PM5330/RUT955/ThingsBoard, CT/PT, akun individual dan RBAC server, backup, audit terlindungi serta pilot/UAT aktual masih diperlukan.
6. Temuan dependency tooling moderate pada audit awal belum diselesaikan oleh perubahan fungsi ini; jangan mengartikan build lulus sebagai audit keamanan produksi.
