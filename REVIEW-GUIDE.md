# Panduan review sandbox Sakuratex

Buka http://127.0.0.1:5173/. Seluruh data simulasi; perubahan disimpan hanya pada browser ini.

1. **PH-03:** Panel & Meter → Detail Kompresor 01. Ubah skenario keterkinian. Coba tab Kualitas Daya/Histori dan replay 10 detik. Perhatikan MISSING tidak menjadi nol.
2. **PH-04:** Energi & Biaya → bandingkan Akunting dan PLN. Pilih Oktober lengkap lalu November parsial. November tidak boleh menghasilkan biaya final atau rekap terbit.
3. **Rekap:** pada tab Rekap akhir bulan, pilih Oktober dan semua meter. Terbitkan melalui konfirmasi. Pengulangan tidak membuat penerbitan ganda. Hasil hanya fixture.
4. **PH-05:** Alarm & Gangguan → Detail EVT-001. Akui melalui konfirmasi; status fisik tetap Aktif. Tambahkan catatan, lalu Replay data pulih. Jika EVT-001 sudah diakui, itu hasil smoke test yang sengaja tersimpan. Gunakan Replay pelanggaran untuk kejadian baru.
5. **PH-06:** Laporan → pilih jenis/periode/meter → Terapkan filter laporan. Unduh CSV/Excel atau cetak. Jika mengubah form tanpa Terapkan, preview dan unduhan tetap memakai filter lama.
6. **Settings:** ubah Simulasi peran menjadi Admin. Buka Pengaturan → Tarif atau Aturan alarm. Alasan wajib diisi. Simpan menciptakan versi baru; buka Audit lokal untuk jejaknya. Inventaris fixture sengaja read-only.
7. **Peran:** coba Operator dan Akunting; menu berubah. Ini hanya simulasi UX, tidak melindungi data atau membuat akun nyata. Kembalikan Supervisor setelah review.
8. **PH-07:** baca IMPLEMENTATION-STATUS.md. Hasil test/build bukan sign-off produksi. Gunakan PRD untuk mengonfirmasi keputusan bisnis/teknis sebelum integrasi nyata.

Saran review: catat halaman, langkah, hasil yang diharapkan, hasil aktual dan screenshot. Form Catatan review menyimpan masukan lokal; tidak mengirim ke tim.

## Review parameter lengkap dengan dummy

1. Dashboard → pilih mesin → Mode tampilan “Dummy realtime”. Alternatif: Panel & Meter → Detail.
2. Tab Kelistrikan: periksa VLL/VLN, arus fasa/netral, tiga jenis daya, PF, Hz dan E-Total. Pembaruan berjalan otomatis 10 detik.
3. Klik “Jeda data dummy”, lalu “Sampel berikutnya (+10 detik)” untuk membandingkan angka tanpa menunggu timer.
4. Tab Sinkronisasi E-Total: nilai display simulasi dan aplikasi harus sama pada timestamp yang sama; selisih 0.
5. Ubah Skenario koneksi dummy menjadi Terlambat atau Terputus. Nilai terakhir ditahan atau diganti “—”; tidak dianggap listrik normal atau padam.
6. Tab Histori: lihat jendela sampel yang sama dan unduh CSV/Excel dummy. Snapshot referensi tersedia sebagai mode statis terpisah.
