# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# APLIKASI KONI KONAWE UTARA - ROAD TO PORPROV SULTRA 2026

---

## 1. Judul & Ringkasan Eksekutif

* **Nama Produk:** Sistem Informasi Manajemen Atlet & Kontingen KONI Konawe Utara (KONI KONUT - Road to Porprov Sultra 2026)
* **Status Dokumen:** Final Draft (Disetujui)
* **Target Rilis:** Siklus Persiapan & Pelaksanaan Porprov Sulawesi Tenggara 2026
* **Platform:** Google Apps Script (GAS) Web Application (SPA - Single Page Application)
* **Database & Penyimpanan:** Google Sheets & Google Drive (Google Workspace Terintegrasi)

### Ringkasan Eksekutif
Aplikasi Web KONI Konawe Utara dirancang khusus untuk memfasilitasi pendataan atlet terpusat, pengunggahan serta verifikasi berkas keabsahan (KTP, Foto 3x4, Dokumen Pendukung), manajemen target medali cabang olahraga, hingga pencatatan *real-time* perolehan medali selama gelaran Pekan Olahraga Provinsi (Porprov) Sultra 2026. Aplikasi ini memisahkan peran antara **Admin Induk (Pengurus KONI)** dan **Admin Cabor (Pengurus Cabang Olahraga)** dengan portal mandiri yang cepat, ramah ponsel, dan memiliki identitas visual modern perpaduan warna kebesaran KONI dan Pemkab Konawe Utara.

---

## 2. Tujuan Produk & Nilai Bisnis

1. **Digitalisasi & Sentralisasi Data Atlet:** Menghilangkan risiko tercecer atau hilangnya berkas keabsahan fisik para atlet se-Kabupaten Konawe Utara.
2. **Akurasi & Transparansi Verifikasi:** Mempercepat proses screening keabsahan atlet oleh tim verifikator KONI dengan sistem status terbuka (Diterima / Ditolak disertai alasan perbaikan).
3. **Penyelarasan Target Prestasi:** Menyediakan monitoring terpadu antara target medali yang dipatok masing-masing cabor dengan realisasi capaian di arena Porprov.
4. **Efisiensi Anggaran & Nol Biaya Server:** Memanfaatkan infrastruktur Google Workspace (Sheets & Drive) tanpa biaya sewa server bulanan/tahunan (*zero infrastructure cost*).
5. **Kemudahan Akses di Lapangan:** Akses responsif dari ponsel pintar oleh para manajer/pelatih cabor tanpa instalasi aplikasi rumit.

---

## 3. Pengguna Target & Matriks Hak Akses (RBAC)

Aplikasi memiliki 2 tingkat hak akses pengguna:

| Modul / Fitur | Admin Induk (KONI KONUT) | Admin Cabor (Per Cabor) |
| :--- | :---: | :---: |
| **Login Sistem (Username & Password)** | Ya (Super Admin) | Ya (Dibuatkan Admin Induk) |
| **Pengaturan Logo & Profil Aplikasi** | Penuh (Ubah Logo & Info) | Hanya Lihat |
| **Kelola Master Cabor & Akun Admin Cabor** | Penuh (Tambah/Edit/Nonaktifkan) | Tidak Ada Akses |
| **Entri & Edit Data Atlet** | Penuh (Semua Cabor) | Hanya Cabor Sendiri |
| **Unggah Berkas Atlet (Foto, KTP, dll.)** | Penuh | Hanya Cabor Sendiri |
| **Verifikasi Keabsahan Berkas (Terima/Tolak)** | Penuh (Approval & Catatan) | Hanya Lihat Status & Catatan |
| **Unduh Berkas Keabsahan Atlet** | Penuh (Preview & Download) | Unduh Berkas Cabor Sendiri |
| **Input Target Medali (Emas, Perak, Perunggu)**| Monitoring & Approval | Input & Update Cabor Sendiri |
| **Input Realisasi Perolehan Medali** | Penuh (Validasi Hasil Akhir) | Input Laporan Hasil Tanding |
| **Ekspor Data (Excel & PDF)** | Penuh (Semua / Filter Cabor) | Terbatas (Data Cabor Sendiri) |

---

## 4. Arsitektur Data & Integrasi Google Workspace

### A. Struktur Spreadsheet Database (Google Sheets)

1. **`TB_Pengaturan`**
   - Kolom: `kunci`, `nilai`, `keterangan`
   - Data konfigurasi: `NAMA_APLIKASI`, `SUB_JUDUL`, `LOGO_KONI_URL`, `LOGO_KONUT_URL`, `PERIODE_PORPROV`, `BANNER_URL`.

2. **`TB_Pengguna`**
   - Kolom: `id_user`, `username`, `password_hash`, `nama_lengkap`, `role` (`ADMIN_INDUK` / `ADMIN_CABOR`), `id_cabor`, `kontak_wa`, `status_aktif`, `terakhir_login`.

3. **`TB_Cabor`**
   - Kolom: `id_cabor`, `nama_cabor`, `ketua_cabor`, `nomor_kontak`, `target_emas`, `target_perak`, `target_perunggu`, `total_atlet`, `keterangan`.

4. **`TB_Atlet`**
   - Kolom: `id_atlet`, `id_cabor`, `nik`, `nama_lengkap`, `tempat_lahir`, `tgl_lahir`, `jenis_kelamin`, `kelas_nomor_tanding`, `alamat_domisili`, `no_hp`, `status_verifikasi` (`PENDING`, `DITERIMA`, `DITOLAK`), `catatan_verifikasi`, `diverifikasi_oleh`, `tgl_verifikasi`.

5. **`TB_Berkas`**
   - Kolom: `id_berkas`, `id_atlet`, `jenis_dokumen` (`FOTO_3X4`, `KTP`, `AKTA_IJAZAH`, `REKOMENDASI`), `drive_file_id`, `drive_view_url`, `drive_download_url`, `nama_file_asli`, `tgl_unggah`.

6. **`TB_Medali`**
   - Kolom: `id_medali`, `id_cabor`, `id_atlet`, `kelas_tanding`, `kategori_medali` (`EMAS`, `PERAK`, `PERUNGGU`), `tgl_perolehan`, `lokasi_venue`, `keterangan`, `dicatat_oleh`.

### B. Struktur Direktori Google Drive (Otomatis Dibuat Sistem)
```text
Root Folder: [KONI KONUT - PORPROV SULTRA 2026]
│
├── Assets/ (Logo Aplikasi, Maskot, Template Dokumen)
│
└── Berkas_Atlet/
    ├── [CABOR_01] Atletik/
    │   └── [NIK_NamaAtlet]/
    │       ├── Foto_3x4.jpg
    │       ├── KTP.pdf / .jpg
    │       └── Dokumen_Pendukung.pdf
    └── [CABOR_02] Dayung/
        └── ...
```

---

## 5. Persyaratan Fungsional

### 5.1. Modul Otentikasi & Akun
* Sistem login berbasis token sesi lokal (Session Storage / Local Storage) terenkripsi.
* Admin Induk dapat mendaftarkan akun Admin Cabor dengan menentukan username dan password awal.
* Proteksi rute halaman: Pengguna diarahkan otomatis ke dashboard sesuai perannya.

### 5.2. Modul Master Cabor & Pengaturan Branding
* Admin Induk dapat menambah cabang olahraga baru (contoh: Dayung, Atletik, Taekwondo, Sepak Bola, dll.).
* Admin Induk dapat mengubah Logo KONI / Logo Pemkab Konawe Utara langsung melalui antarmuka aplikasi (pratinjau langsung).
* Modul pengaturan target perolehan medali kontingen.

### 5.3. Modul Manajemen Atlet & Keabsahan
* Admin Cabor mengisi formulir profil atlet: NIK (validasi 16 digit), Nama, TTL, Jenis Kelamin, Nomor/Kelas Tanding.
* Pengunggahan berkas digital:
  * Foto Resmi 3x4 (ekstensi .jpg, .jpeg, .png, auto-kompresi).
  * KTP / KIA (ekstensi .jpg, .png, .pdf).
  * Dokumen Pendukung tambahan (Akta/Ijazah/Surat Rekomendasi).
* Admin Induk memiliki portal "Pusat Verifikasi":
  * Tabel per cabor dengan filter status (Pending, Diterima, Ditolak).
  * Tombol modal *quick-preview* berkas dan tombol *Download*.
  * Aksi 1-klik: **Setujui (Diterima)** atau **Tolak** (wajib mengisi catatan alasan penolakan untuk revisi cabor).

### 5.4. Modul Target & Realisasi Medali (Live Porprov)
* Dashboard Klasemen Medali Kontingen Konawe Utara:
  * Total Emas, Perak, Perunggu.
  * Komparasi grafik: Target Medali vs Realisasi Medali.
  * Rincian medali per cabang olahraga.
* Form entri cepat perolehan medali untuk Admin Cabor / Admin Induk saat pertandingan selesai.

### 5.5. Modul Pelaporan & Ekspor Data
* **Ekspor Excel (.xlsx / .csv):**
  * Rekapitulasi Data Atlet per Cabor / Keseluruhan lengkap dengan status keabsahan.
  * Rekapitulasi Perolehan Medali Porprov 2026.
* **Cetak PDF:**
  * Formulir Kartu Kontingen / Lembar Verifikasi Keabsahan Atlet resmi berlogo KONI Konut.
  * Lembar Rekapitulasi Perolehan Medali Kontingen siap cetak laporan untuk Ketua KONI / Bupati Konawe Utara.

---

## 6. Batasan Teknis & Mitigasi Kuota Google Apps Script

1. **Batas Eksekusi 6 Menit:**
   - Semua operasi baca/tulis data ke Google Sheets menggunakan teknik *batch read/write* (`getValues()` & `setValues()` satu tarikan).
2. **Payload Size File Upload:**
   - File gambar dikompresi di sisi browser (*client-side canvas compression*) sebelum diunggah ke Google Apps Script (maks. 2 MB per berkas), mencegah kegagalan POST payload.
3. **Model Single Page Application (SPA):**
   - Transisi antar halaman (Dashboard, Cabor, Atlet, Verifikasi, Medali, Pengaturan) dieksekusi secara instan menggunakan JavaScript dinamis tanpa *page refresh*.
4. **Caching Data:**
   - Data referensi statis (daftar cabor dan info aplikasi) disimpan dalam *CacheService / LocalStorage* untuk memangkas latensi respon server.

---

## 7. Spesifikasi Tampilan & Antarmuka (UI/UX)

* **Konsep Gaya:** *Modern Sportive & Elegant Corporate* (Memadukan gairah olahraga berprestasi dan citra resmi pemerintah daerah).
* **Palet Warna:**
  * **Primary (Merah KONI):** `#C8102E` / `#9E0D24` (Melambangkan semangat, keberanian, dan prestasi olahraga).
  * **Secondary / Accent (Emas Juara):** `#FFB81C` / `#D48806` (Melambangkan medali emas, kejayaan, dan target Porprov).
  * **Regional Accent (Biru-Hijau Konawe Utara):**
    * Deep Blue Laut Konut: `#0F4C81` / `#1E3A8A`
    * Emerald/Teal Hijau Alam Konut: `#0D9488` / `#059669`
  * **Neutral Background:**
    * Mode Terang (Light): `#F8FAFC` (Canvas bersih) & `#FFFFFF` (Card kontainer).
    * Mode Gelap (Dark): `#0F172A` (Slate gelap) & `#1E293B` (Surface card).
* **Fitur Tampilan:**
  * **Dukungan Dark Mode & Light Mode** dengan tombol *toggle* instan di bilah navigasi atas.
  * **Mobile-First Layout:** Tata letak grid responsif, tabel dilengkapi gulir horizontal halus, tombol sentuh ergonomis untuk smartphone.
  * **Komponen Visual:**
    * *Badge Pill* status verifikasi warna-warni (Kuning: Pending, Hijau: Diterima, Merah: Ditolak).
    * *Metric Cards* dengan efek gradien elegan menampilkan total atlet, total cabor, dan medali emas.
    * *Interactive Chart:* Grafik batang dan donat (menggunakan Chart.js) untuk statistik medali dan verifikasi berkas.

---

## 8. Rencana Deployment & Tahapan Pengujian

1. **Tahap 1 - Skema Database & Drive:** Pembuatan Google Sheets template berserta generator folder otomatis di Google Drive.
2. **Tahap 2 - Backend Engine (Google Apps Script):** Penyusunan endpoint REST/Web App (`doGet`, `doPost`), modul otentikasi, enkripsi password, dan uploader file.
3. **Tahap 3 - Frontend SPA Interaktif:** Penyusunan antarmuka HTML/Tailwind/CSS, integrasi Chart.js, ekspor SheetJS (Excel) & print PDF CSS.
4. **Tahap 4 - Validasi & Pengujian:**
   - Uji coba login Admin Induk dan Admin Cabor.
   - Uji coba unggah berkas dari HP Android/iOS.
   - Uji verifikasi terima/tolak dan pembaharuan status real-time.
   - Uji coba ekspor Excel dan cetak berkas PDF.
5. **Tahap 5 - Deployment Produksi:** Deploy Google Apps Script Web App dengan parameter `Execute as: Me` dan `Who has access: Anyone`.

---

🎨 **Tahapan Khusus: Penentuan Visual UI/UX**
1. Unggah Referensi: Silakan unggah referensi tangkapan layar, warna, dan gaya antarmuka yang diinginkan.
2. Jika Belum Ada Referensi Visual:
   - Salin seluruh teks dokumen PRD Final di atas.
   - Buka Google Stitch, lalu tempelkan teks PRD ke dalamnya.
   - Unduh hasil pratinjau desain visual yang dihasilkan oleh Google Stitch.
   - Unggah gambar hasil desain tersebut ke percakapan ini untuk diimplementasikan ke dalam kode HTML/CSS.
