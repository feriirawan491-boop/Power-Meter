# Audit integrasi data — 10 November 2026

Audit kode dan pengujian lokal mencakup inventaris, pengukuran, histori, alarm,
tarif, energi, perbandingan PLN, penerbitan rekap, serta CSV/Excel/cetak.
Hasil berlaku untuk aplikasi simulasi yang tersedia di repository ini.

## Temuan dan perbaikan

| Bagian | Temuan sebelum perbaikan | Perilaku setelah perbaikan |
| --- | --- | --- |
| Kualitas pembacaan | Dashboard, histori, energi, dan alarm menghitung status koneksi masing-masing. Umur pembacaan terlambat tidak bertambah. | `meterReading` menjadi sumber bersama untuk umur data, timestamp yang ditahan, serta status terkini/tersedia. Data yang ditahan melewati 120 detik menjadi tidak tersedia di semua konsumen. |
| Pembanding PLN tersimpan | Timestamp dibekukan, tetapi perhitungan memakai status koneksi terbaru. Mesin putus atau pulih bisa mengubah hasil perbandingan lama. | Tagihan menyimpan snapshot status pembacaan dan sampel yang ditahan. Perhitungan dan ekspor memakai snapshot tersebut; perubahan koneksi sesudah penyimpanan tidak mengubah hasil sebelumnya. |
| Tagihan lama | Tagihan sebelum perubahan ini tidak menyimpan snapshot status pembacaan. | Perbandingan periode berjalan diblokir untuk tagihan lama tersebut. Pengguna dapat menyimpan ulang untuk memakai batas data saat ini. Tagihan periode simulasi yang sudah ditutup tetap dapat dibandingkan. |
| Versi tarif | Halaman energi dan laporan menyimpan versi default saat komponen pertama dibuka, termasuk saat data lokal belum selesai dimuat. | Pilihan default mengikuti versi terbaru selama belum dipilih secara eksplisit. Versi yang dipilih pengguna tetap dipertahankan. |
| Laporan Akunting | Halaman energi mengubah kolom menjadi tarif tunggal, sedangkan halaman laporan masih menampilkan kategori LWBP/WBP internal. | `energyReportView` digunakan bersama oleh halaman energi dan laporan; pratinjau, CSV, Excel, dan cetak mengikuti kontrak yang sama. Perhitungan Akunting tetap konsumsi × tarif internal. |
| Pengaturan tarif | Form menawarkan LWBP/WBP internal yang tidak dipakai oleh rumus Akunting bertarif tunggal. | Form menampilkan tiga tarif yang dipakai: Akunting internal, PLN LWBP, dan PLN WBP. Field lama dipertahankan pada data untuk kompatibilitas. Tarif PLN pada data lama yang belum memiliki field PLN mengikuti fallback versi tersebut, bukan angka default tetap. |
| Snapshot rekap | Snapshot konfigurasi tidak menyimpan kedua tarif PLN. Penerbitan tanpa versi eksplisit memakai v1. | Snapshot baru menyimpan tarif internal dan PLN. Penerbitan tanpa versi eksplisit memakai versi terbaru; perubahan tarif berikutnya tidak menulis ulang snapshot terbit. |
| Periode laporan | Histori membatasi bulan dengan pengecekan literal November; alarm memeriksa awalan bulan UTC. | Histori dan alarm difilter melalui batas awal/akhir bulan WIB. Energi dan perbandingan PLN memakai helper batas bulan yang sama. |
| Identitas tampilan | Tanggal dan jumlah meter di halaman panel ditulis tetap. Nomor sampel tetap maju meskipun nilai pembacaan ditahan. | Tanggal dan jumlah meter mengikuti data bersama. Nomor sampel detail mengikuti sampel yang benar-benar ditampilkan. Dashboard referensi menjelaskan pembacaan terlambat. |
| Kelengkapan energi | Warna status menganggap adanya satu pembacaan sudah berarti seluruh titik tersedia; contoh rumus selalu mengambil baris pertama, termasuk baris kosong. | Status membedakan subtotal dari seluruh titik yang tersedia. Contoh rumus mengambil baris yang dapat dihitung. |

## Alur yang diverifikasi

- Pengukuran pada kartu mesin, detail meter, grafik, histori, dan counter energi berasal dari generator dan jam simulasi bersama.
- Perubahan tiga nominal tarif melalui form Pengaturan diteruskan ke perhitungan Internal, PLN, serta laporan. Memilih versi lama mempertahankan angka versi tersebut.
- Mesin terlambat memakai counter dan timestamp terakhir yang sama pada histori dan energi. Mesin terputus tidak diisi nol.
- Perbandingan PLN tersimpan mempertahankan hasil saat mesin kemudian terputus. Sebaliknya, menghubungkan kembali mesin tidak mengisi kekurangan snapshot lama.
- Total Internal sama dengan jumlah biaya per meter pada laporan Akunting untuk periode, versi tarif, dan batas pembacaan yang sama.
- Alarm, pengakuan, pemulihan, dan aturan berversi tetap memakai alur yang sama; pengujian regresinya tetap lulus.

Biaya energi versi PLN dan total tagihan PLN adalah dua cakupan berbeda yang
disengaja: biaya energi menggunakan konsumsi titik terpilih, sedangkan pembanding
tagihan menggunakan seluruh titik, beban contoh tambahan 4%, biaya tetap, dan
tambahan 3%. Panel PLN kini menampilkan konsumsi simulasi dan asumsi ini agar
perbedaannya bisa ditelusuri. Semua menggunakan tarif PLN dari versi yang dipilih.

## Validasi

- Seluruh 109 tes dalam 20 file lulus, termasuk delapan tes integrasi baru.
- TypeScript dan ESLint lulus.
- Build produksi Next.js diverifikasi dalam sesi audit ini.
- `git diff --check` lulus.
- Pengujian antarmuka menggunakan jsdom; audit ini tidak mencakup UAT browser/perangkat fisik. Peringatan canvas dari axe/jsdom tidak dipakai sebagai bukti pemeriksaan kontras visual.

## Batas integrasi yang masih berlaku

- Belum ada koneksi PM5330/RUT955/ThingsBoard atau API data meter fisik. Telemetry dan counter adalah data sintetis.
- Penyimpanan tarif, tagihan, alarm, dan rekap memakai localStorage browser. Belum ada database pusat, sinkronisasi lintas perangkat, atau sinkronisasi perubahan antar-tab. Clock dan replay koneksi adalah state sesi aplikasi.
- Tarif dipilih sebagai versi skenario secara eksplisit; tanggal efektif belum mengalokasikan pemakaian secara otomatis ke beberapa tarif dalam satu periode. LWBP/WBP masih pembagian asumsi 80/20.
- Pilihan periode UI masih Oktober/November 2026 dan penerbitan contoh masih Oktober. Snapshot yang telah terbit tidak dimigrasi dengan mengarang informasi yang dahulu belum disimpan.
- Semua titik dianggap eksklusif dalam simulasi. Topologi induk/anak dan rekonsiliasi tagihan nyata belum diverifikasi.

Dengan demikian, alur simulasi yang diperiksa saling menggunakan sumber data
bersama setelah perbaikan di atas. Hasil ini tidak menyatakan integrasi produksi
atau rekonsiliasi perangkat fisik sudah selesai.
