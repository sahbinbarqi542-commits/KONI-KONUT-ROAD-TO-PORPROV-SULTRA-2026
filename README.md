# KONI KONAWE UTARA - ROAD TO PORPROV SULTRA 2026
### Sistem Informasi Manajemen Atlet, Keabsahan Berkas, Target & Perolehan Medali Kontingen

Aplikasi Web Full-Stack modern dengan arsitektur decoupled (frontend statis di GitHub Pages + backend JSON REST API di Google Apps Script), dirancang khusus untuk Komite Olahraga Nasional Indonesia (KONI) Kabupaten Konawe Utara dalam menghadapi Pekan Olahraga Provinsi (Porprov) Sulawesi Tenggara 2026.

---

## 🏗️ Struktur Arsitektur Sistem

```text
├── index.html            <- SPA Landing Page & Multi-Role Portal
├── css/
│   └── style.css         <- Style kustom, tema warna KONI-Konut, & cetak A4
├── js/
│   ├── config.js         <- Konfigurasi GAS_URL (Anti-kebocoran rahasia)
│   └── app.js            <- Engine SPA, Anti-CORS fetch, Chart.js, SWR CacheX
├── backend/
│   ├── Kode.gs           <- REST API JSON, HMAC SHA-256 Auth, Google Drive Uploader
│   ├── Migrasi.gs        <- Utilitas migrasi & upsert idempoten antar-spreadsheet
│   └── appsscript.json   <- Manifest Web App Google Apps Script
├── DESAIN UI UX/         <- Aset & token desain Sportive Civic Prestige
├── PRD.md                <- Dokumen Product Requirements Document
├── WIREFRAME_PROMPT.md   <- Prompt wireframe grayscale untuk Google Stitch
└── UIUX_PROMPT.md        <- Prompt UI/UX visual penuh
```

---

## 🚀 Panduan Setup & Deployment Cepat (3 Langkah)

### Langkah 1: Setup Backend Google Apps Script (GAS)

1. Buka [Google Apps Script](https://script.google.com/) dan buat proyek baru dengan nama `KONI KONUT REST API`.
2. Salin isi file `backend/Kode.gs` ke editor Google Apps Script.
3. Buat file script kedua dengan nama `Migrasi.gs`, lalu salin isi file `backend/Migrasi.gs` ke dalamnya.
4. Buka dropdown fungsi di toolbar atas editor, pilih fungsi:
   ```text
   setupAppEnvironment
   ```
   Lalu klik **Run (Jalankan)**.
   *(Google akan meminta otorisasi akses Google Sheets & Drive untuk pertama kali. Klik Review Permissions → Lanjutkan)*.
5. Periksa **Execution log**:
   - Sistem akan otomatis membuat Folder Google Drive `📁 KONI KONUT - ROAD TO PORPROV SULTRA 2026`, spreadsheet database dengan 7 tabel lengkap, akun Admin Induk awal (`admin_koni` / `KoniKonut2026!`), serta sample akun Cabor Dayung (`cabor_dayung` / `dayung123`).

---

### Langkah 2: Deploy Web App Google Apps Script

1. Di editor Google Apps Script, klik tombol biru **Deploy** (di pojok kanan atas) → **New deployment**.
2. Pilih jenis deployment: **Web app** (ikon roda gigi).
3. Isi parameter wajib berikut:
   - **Description**: `Versi 2.0.0 PRO REST API`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone (Siapa saja)` *(Krusial agar frontend GitHub Pages bisa mengakses API)*.
4. Klik **Deploy**, lalu salin **Web app URL** yang berakhiran `/exec`.
5. Buka file `js/config.js` di proyek lokal Anda, lalu tempelkan URL tersebut ke:
   ```javascript
   const CONFIG = {
     GAS_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
     DEMO_MODE: false,
     ...
   };
   ```

---

### Langkah 3: Deploy Frontend ke GitHub Pages

Panduan ramah pemula via Terminal Git (sesuai skill `/github-pages-deploy-guide`):

1. **Buka Terminal (PowerShell atau Git Bash)** di folder proyek:
   ```bash
   cd "C:\Users\Digitalisasi\Documents\APLIKASI WEB SAHBIN\ANTI GRAVITY\APK KONI KONUT ROAD TO PORPROV SULTRA 2026"
   ```

2. **Inisialisasi Git lokal & commit**:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi aplikasi web koni konut porprov 2026"
   git branch -M main
   ```

3. **Hubungkan ke Repositori GitHub**:
   - Buat repositori baru di `https://github.com/new` dengan nama misal `koni-konut-porprov2026` (Pilih **Public**).
   - Hubungkan remote origin:
     ```bash
     git remote add origin https://github.com/USERNAME-ANDA/koni-konut-porprov2026.git
     git push -u origin main
     ```
   *(Gunakan Personal Access Token / PAT jika diminta password).*

4. **Aktifkan GitHub Pages**:
   - Buka tab **Settings** di repo GitHub Anda → menu **Pages**.
   - Pada bagian **Build and deployment**, pilih Source: **Deploy from a branch**, Branch: `main` / `root`.
   - Klik **Save** dan centang **Enforce HTTPS**.
   - Dalam 1-2 menit, web app Anda akan aktif di:  
     `https://USERNAME-ANDA.github.io/koni-konut-porprov2026/`

---

## 🛡️ Standar Kepatuhan Keamanan & Performa

* **Zero Literal Secrets (`gas-rahasia-script-properties`)**: Tidak ada password, API key, atau token rahasia yang disimpan di kode frontend maupun file `.gs`. Semua rahasia dikelola secara aman via `Script Properties`.
* **HMAC SHA-256 Stateless Session**: Sesi login aman dengan tanda tangan kriptografi server, proteksi brute-force lockout 15 menit setelah 5x gagal login.
* **Anti-CORS POST Fetch (`gas-pro-api`)**: Seluruh request POST dikirim menggunakan header `text/plain;charset=utf-8` untuk mencegah penolakan preflight OPTIONS oleh Google Apps Script.
* **CacheX Chunking & SWR (`gas-scale-turbo`)**: Nilai cache di atas 50KB dipecah secara otomatis, mencegah batas kuota 100KB CacheService. Operasi baca diproses secara batch di memori.
* **Client-Side Image Compression**: Pas foto dan scan KTP otomatis dikompresi di browser via HTML5 Canvas sebelum diunggah ke Google Drive, menghemat kuota transmisi POST dan mempercepat proses di smartphone.
* **Migrasi Idempoten (`gas-migrasi-database`)**: Fungsi `migrasiDataAtlet()` di `backend/Migrasi.gs` siap digunakan untuk menarik data dari spreadsheet lama tanpa risiko duplikasi (upsert berbasis NIK) dan mendukung mode simulasi (*dry-run*).

---

## 👥 Akun Akses Awal untuk Pengujian

| Peran | Username | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin Induk KONI** | `admin_koni` | `KoniKonut2026!` | Kelola Cabor, Verifikasi Berkas (Terima/Tolak), Rekap Medali, Branding |
| **Admin Cabor Dayung** | `cabor_dayung` | `dayung123` | Registrasi Atlet Cabor, Unggah Berkas, Lapor Hasil Pertandingan |

*(Catatan: Anda juga dapat menggunakan tombol klik satu-sentuh **Admin Induk** atau **Admin Cabor** pada jendela login untuk autofill instan saat demonstrasi).*
