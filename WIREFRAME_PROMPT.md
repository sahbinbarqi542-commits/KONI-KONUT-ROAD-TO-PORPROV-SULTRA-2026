Create detailed wireframes for KONI KONAWE UTARA - ROAD TO PORPROV SULTRA 2026 WEB APP.
Use grayscale/black-and-white wireframe style only — no colors, no images,
just layout structure, placeholder boxes, labels, and navigation flow.

## Application Context
A centralized sports contingent and athlete management single-page web application for KONI Konawe Utara (Southeast Sulawesi, Indonesia) gearing up for the 2026 Provincial Games (Porprov Sultra 2026).
The application manages athlete registration, digital credential/identity verification (KTP, photo, documents), sports branch (Cabor) targets, live medal tally tracking, and administrative governance with dual-tier Role-Based Access Control (Central KONI Admin and Cabor Admin).
Has 5 main sections: Authentication, Central KONI Admin Panel, Cabor Admin Portal, Verification & Document Review, and Export/Print Roster.

## Wireframe Pages Required

--- PAGE W-01: UNIFIED LOGIN SCREEN ---
Layout: Centered single-card modal on clean neutral background.
- Header: Dual logo placeholder box [icon: KONI Logo] [icon: Pemkab Konut Logo], Title: "KONI KONAWE UTARA", Subtitle: "Sistem Informasi Atlet & Kontingen - Road to Porprov Sultra 2026"
- Card Container: Bordered card with light drop-shadow
  - Input Field 1: Label "Username", placeholder "Masukkan username cabor / admin induk", [icon: user]
  - Input Field 2: Label "Password", placeholder "••••••••", [icon: lock], [icon: eye-toggle]
  - Checkbox & Link: Checkbox "Ingat sesi saya", right-aligned text "Butuh Bantuan? Hubungi Tim IT KONI"
  - Primary Action Button: Wide dark-filled button "[ Masuk ke Sistem ]"
  - Footer note: "© 2026 KONI Kabupaten Konawe Utara. Google Workspace Integrated."

--- PAGE W-02: CENTRAL ADMIN EXECUTIVE DASHBOARD ---
Layout: Top fixed app header + Left sticky collapsible sidebar + Main multi-card dashboard grid.
- Top Header: Left hamburger toggle, App title, right side: [icon: sun/moon toggle], [icon: bell with count badge (5)], Profile chip "Admin Induk KONI" [icon: chevron-down]
- Left Sidebar Menu:
  - Nav Item 1: [icon: grid] Dashboard (Active)
  - Nav Item 2: [icon: trophy] Master Cabor & Akun
  - Nav Item 3: [icon: users] Data Atlet & Kontingen
  - Nav Item 4: [icon: check-circle] Verifikasi Keabsahan [Badge: 14 Pending]
  - Nav Item 5: [icon: medal] Target & Perolehan Medali
  - Nav Item 6: [icon: file-text] Rekapitulasi & Cetak PDF
  - Nav Item 7: [icon: settings] Pengaturan Aplikasi
  - Bottom Sidebar: [icon: log-out] Keluar
- Main Dashboard Content:
  - Welcome Banner: Title "Dashboard Eksekutif KONI Konut", Subtitle "Monitoring Kesiapan Kontingen Porprov Sultra 2026"
  - KPI Stat Cards Row (4 cards):
    - Card 1: [icon: flag] Total Cabang Olahraga: "32 Cabor Terdaftar"
    - Card 2: [icon: user-check] Total Atlet: "418 Atlet" (Subtext: "312 Lolos, 76 Pending, 30 Ditolak")
    - Card 3: [icon: target] Target Medali: "45 Emas, 35 Perak, 50 Perunggu"
    - Card 4: [icon: award] Realisasi Medali: "12 Emas, 8 Perak, 14 Perunggu"
  - Analytics Charts Grid (2 columns):
    - Left Chart Box: Empty chart frame labeled "[Bar Chart: Target vs Realisasi Medali per Top 8 Cabor]" with X/Y axes labels
    - Right Chart Box: Empty chart frame labeled "[Donut Chart: Status Verifikasi Berkas (Approved 75%, Pending 18%, Rejected 7%)]"
  - Recent Submissions Mini Table:
    - Table columns: Waktu, Nama Cabor, Nama Atlet, Berkas, Status Badge, Aksi [Review]

--- PAGE W-03: MASTER CABOR & ACCOUNT MANAGEMENT ---
Layout: Left sidebar + Main content area with top action bar and responsive data table.
- Breadcrumb: Beranda > Master Cabor & Akun
- Header Action Bar:
  - Title: "Manajemen Cabang Olahraga & Akun Cabor"
  - Search bar: Placeholder "Cari nama cabor atau nama pengurus..." [icon: search]
  - Primary Action Button: Filled button "[ + Tambah Cabor & Akun ]"
- Data Table:
  - Header: No, Nama Cabor, Penanggung Jawab, Kontak WA, Username Akun, Kuota/Jml Atlet, Target Emas, Status Akun, Aksi
  - Rows:
    - Row 1: 1 | Atletik | Ruslan, S.Pd | 0812xxxx | cabor_atletik | 28 Atlet | 6 Emas | [Badge: Aktif] | [icon: edit] [icon: key-reset] [icon: trash]
    - Row 2: 2 | Dayung (PODSI) | Hendra K. | 0852xxxx | cabor_dayung | 22 Atlet | 8 Emas | [Badge: Aktif] | [icon: edit] [icon: key-reset] [icon: trash]
    - Row 3: 3 | Taekwondo | Fitriani | 0821xxxx | cabor_taekwondo | 15 Atlet | 4 Emas | [Badge: Aktif] | [icon: edit] [icon: key-reset] [icon: trash]
  - Pagination Bar: "Menampilkan 1-10 dari 32 Cabor", page selector buttons [1] [2] [3] [Next >]
- Modal Dialog (Add/Edit Cabor):
  - Form Fields: Nama Cabor (Dropdown/Text), Penanggung Jawab, No WA, Target Medali (Emas, Perak, Perunggu), Username Baru, Password Awal
  - Modal Actions: Outlined button "[ Batal ]", Filled button "[ Simpan Cabor & Akun ]"

--- PAGE W-04: ATHLETE CREDENTIAL & VERIFICATION PORTAL (SPLIT VIEW) ---
Layout: 2-Panel Split Review Layout for Fast Verification.
- Top Bar: Filter by Cabor [Dropdown: Semua Cabor], Filter Status [All / Pending / Diterima / Ditolak], Search by NIK/Nama
- Left Panel (40% width) - Athlete Queue List:
  - List item card (active selection):
    - Photo thumbnail box [X placeholder]
    - Text: "La Ode Muhammad Arfan" | NIK: "740801xxxxxxxxxx"
    - Cabor: "Dayung (Kayak 1 - 1000m)"
    - Status Badge: [Badge: Menunggu Verifikasi]
  - List item card 2: "Siti Rahmawati" | Taekwondo Under 49kg | [Badge: Diterima]
  - List item card 3: "Budi Santoso" | Atletik Lari 100m | [Badge: Ditolak]
- Right Panel (60% width) - Document Inspection & Approval:
  - Header: Athlete Name, Cabor, and Registered Date
  - Tab Bar: [Tab 1: Foto 3x4 (Active)] [Tab 2: Scan KTP / KIA] [Tab 3: Akta / Surat Rekomendasi]
  - Document Viewer Container:
    - Large preview box [Image/PDF viewer box with zoom controls]
    - Metadata box below: NIK, Tempat/Tgl Lahir, Jenis Kelamin, Nomor Tanding, Alamat
    - Download action: Outlined small button "[icon: download] Unduh Berkas Asli"
  - Verification Decision Box:
    - Text field: Label "Catatan Verifikasi (Wajib diisi jika ditolak)", placeholder "Contoh: Foto KTP buram, mohon unggah ulang dengan jelas..."
    - Action Buttons Row:
      - Danger Outlined Button: "[ ✕ Tolak Berkas ]" (opens confirmation modal)
      - Success Filled Dark Button: "[ ✓ Setujui & Nyatakan Lolos Keabsahan ]"

--- PAGE W-05: MEDAL TALLY STANDING & LIVE MATCH ENTRY ---
Layout: Full-width container with summary standings table and quick medal recording modal.
- Header: Title "Papan Perolehan Medali Porprov Sultra 2026", Subtitle "Kontingen Kabupaten Konawe Utara"
- Action Row:
  - Button 1: Filled button "[ + Catat Perolehan Medali Baru ]"
  - Button 2: Outlined button "[icon: file-excel] Ekspor Rekapitulasi Medali"
  - Live Counter Ribbon: Konawe Utara Total: 12 Emas [icon: medal-gold], 8 Perak [icon: medal-silver], 14 Perunggu [icon: medal-bronze]
- Medal Standings Table:
  - Columns: Peringkat, Cabang Olahraga, Target (E-P-P), Capaian (Emas, Perak, Perunggu), Total Medali, % Capaian Target, Aksi
  - Rows:
    - 1 | PODSI (Dayung) | 8-4-2 | 4 Emas | 2 Perak | 1 Perunggu | 7 Medali | 65% | [icon: list]
    - 2 | Atletik | 6-5-4 | 3 Emas | 1 Perak | 3 Perunggu | 7 Medali | 50% | [icon: list]
    - 3 | Taekwondo | 4-3-3 | 2 Emas | 1 Perak | 2 Perunggu | 5 Medali | 55% | [icon: list]
- Modal Form: Record New Medal
  - Dropdown Cabor, Dropdown Atlet Pemenang, Input Nomor/Kelas Pertandingan, Radio selector: [○ Emas] [○ Perak] [○ Perunggu], Tanggal & Waktu, Catatan/Venue

--- PAGE W-06: APPLICATION BRANDING & SYSTEM CONFIGURATION ---
Layout: Settings panel with form sections and live preview side-box.
- Header: Title "Pengaturan Sistem & Personalisasi Branding"
- Left Column (Form Settings):
  - Section 1 - Identitas Instansi:
    - Input: Nama Aplikasi (default: KONI KONAWE UTARA - ROAD TO PORPROV SULTRA 2026)
    - Input: Sub-Judul / Slogan
    - Input: Nama Ketua Umum KONI Konut
    - Input: Kontak Helpdesk / Call Center WA
  - Section 2 - Pengaturan Logo & Banner:
    - File upload field 1: "Unggah Logo KONI" [Tombol Pilih File]
    - File upload field 2: "Unggah Logo Pemkab Konawe Utara" [Tombol Pilih File]
    - File upload field 3: "Unggah Maskot / Banner Porprov" [Tombol Pilih File]
  - Section 3 - Konfigurasi Google Drive & Backup:
    - Display ID Folder Root Drive terhubung
    - Button: "[ Uji Koneksi Folder Google Drive ]"
  - Sticky bottom save bar: Filled button "[ Simpan Semua Perubahan ]"
- Right Column (Live Preview Card):
  - Preview frame showing how the login screen & header navbar will look with the newly uploaded logos and titles.

--- PAGE W-07: CABOR ADMIN DASHBOARD ---
Layout: Restricted Cabor Portal layout with personalized branch header.
- Top Header: Logo KONI & Konut, Branch Name Badge: "Cabor: Persatuan Olahraga Dayung Seluruh Indonesia (PODSI)", User profile: "Admin PODSI"
- Branch Summary Metrics (3 cards):
  - Card 1: Total Atlet Terdaftar: "22 Atlet" (Kuota Maks: 25)
  - Card 2: Status Berkas: "18 Disetujui, 3 Menunggu, 1 Ditolak"
  - Card 3: Target Medali Cabor: "8 Emas, 4 Perak, 2 Perunggu"
- Alert Box (Conditional Rejection Notification):
  - Box labeled "[Alert: 1 Berkas Atlet Perlu Perbaikan]" - Text: "Atlet La Ode Rudi (KTP Buram) - Silakan perbaiki segera." [Button: Perbaiki Sekarang]
- Quick Actions Row:
  - Primary button: "[ + Daftarkan Atlet Baru ]"
  - Secondary button: "[ Lapor Hasil Pertandingan ]"
  - Outlined button: "[ Unduh Rekap Atlet PODSI ]"

--- PAGE W-08: CABOR ATHLETE REGISTRATION & DIRECTORY ---
Layout: Table directory with search & filter, plus slide-over drawer for registration.
- Header: Title "Daftar Atlet Kontingen Cabor Dayung", Search field, Filter by Gender, Filter by Verification Status
- Athlete Table:
  - Columns: Foto, NIK, Nama Lengkap, L/P, Tempat/Tgl Lahir, Kelas Tanding, Berkas (Foto, KTP, Dok), Status Keabsahan, Aksi
  - Row example:
    - [Thumbnail X] | 740801xxxx | Herman Syah | L | Lasolo, 12-04-2002 | K-1 500m | [3 Berkas Terunggah] | [Badge: DITERIMA] | [icon: eye] [icon: edit]
    - [Thumbnail X] | 740802xxxx | La Ode Rudi | L | Wanggudu, 15-08-2003 | C-2 1000m | [Berkas Ditolak] | [Badge: DITOLAK: KTP Buram] | [Button: Edit & Re-upload]
- Slide-over Registration Form:
  - Form Step 1 - Biodata: NIK (16 digit), Nama Sesuai KTP, Tempat Lahir, Tgl Lahir (date picker), Jenis Kelamin (Radio L/P), No HP/WA, Alamat Domisili
  - Form Step 2 - Olahraga: Nomor / Kelas Tanding, Pelatih Penanggung Jawab
  - Form Step 3 - Unggah Berkas:
    - Box 1: Dropzone "Pas Foto 3x4 (Latar Merah/Biru, maks 2MB)" [icon: upload]
    - Box 2: Dropzone "Scan KTP / Kartu Identitas Anak (Jelas & Terbaca)" [icon: upload]
    - Box 3: Dropzone "Dokumen Pendukung (Akta Lahir / Surat Mandat Cabor)" [icon: upload]
  - Actions: Outlined button "[ Batal ]", Filled button "[ Simpan & Ajukan Verifikasi ]"

--- PAGE W-09: CABOR MEDAL REPORTING MODAL / VIEW ---
Layout: Dedicated interface for Cabor Admin to track match fixtures and log earned medals.
- Fixture & Medal Table:
  - Columns: Tanggal, Nomor Pertandingan, Nama Atlet / Tim, Babak (Penyisihan/Final), Target, Hasil Medali, Status Konfirmasi KONI
  - Row example: 24 Nov 2026 | Kayak Tunggal Putra 1000m | Herman Syah | FINAL | Target: Emas | [Badge Gold: MEDALI EMAS] | [Badge: Terverifikasi KONI]
- Quick Entry Button: "[ + Laporkan Perolehan Medali Cabor ]"

--- PAGE W-10: OFFICIAL ATHLETE ROSTER & ID CARD EXPORT (PRINT VIEW) ---
Layout: Print preview container formatted for standard A4 landscape report and athlete ID badge format.
- Top Action Bar:
  - Dropdown filter: [Pilih Cabor], Status: [Hanya Lolos Verifikasi]
  - Button Group: Filled button "[icon: printer] Cetak Lembar Rekap Resmi", button "[icon: file-excel] Download Excel", button "[icon: file-pdf] Export PDF"
- Report Preview Layout:
  - Official Letterhead Header: Logo KONI Konut, Logo Pemkab Konut, Text "KOMITE OLAHRAGA NASIONAL INDONESIA (KONI) KABUPATEN KONAWE UTARA", "DAFTAR NOMINATIF ATLET KONTINGEN PORPROV SULTRA 2026"
  - Summary metadata: Cabang Olahraga, Nama Manajer, Tanggal Terbit
  - Formal Table with signature block at bottom right (Mengetahui: Ketua Umum KONI Kab. Konawe Utara, Tanda Tangan & Cap stempel placeholder box)

--- PAGE W-11: RESPONSIVE MOBILE BREAKPOINT (SMARTPHONE VIEW) ---
Layout: Single column, 375px mobile viewport view for field coordinators.
- Mobile Top App Bar: Logo KONI Konut, Title "KONI KONUT 2026", [icon: search], [icon: menu drawer]
- Quick Metric Carousel: Horizontally swipeable cards (Total Atlet, Terverifikasi, Target Emas)
- Bottom Sticky Navigation Bar:
  - [icon: home] Beranda | [icon: check] Verifikasi | [icon: award] Medali | [icon: user] Akun
- Mobile Athlete Verification Card:
  - Card with athlete photo on left, details on right
  - Pill badge status: [Menunggu Review]
  - One-tap quick actions: [Preview Berkas] [Terima] [Tolak]

## Navigation & Flow Arrows
- [W-01 Login Screen] ──(Valid Admin Induk)──> [W-02 Central Admin Dashboard]
- [W-01 Login Screen] ──(Valid Admin Cabor)──> [W-07 Cabor Admin Dashboard]
- [W-02 Dashboard] ──(Click Cabor Menu)──> [W-03 Master Cabor & Accounts]
- [W-02 Dashboard] ──(Click Verification Badge)──> [W-04 Verification Split Portal]
- [W-02 Dashboard] ──(Click Medal Menu)──> [W-05 Medal Standing & Entry]
- [W-02 Dashboard] ──(Click Settings)──> [W-06 System Branding & Logo]
- [W-07 Cabor Portal] ──(Click + Atlet)──> [W-08 Athlete Registration Drawer]
- [W-08 Submit Berkas] ──(Real-time push)──> [W-04 Pending Queue in Admin Review]
- [W-04 Admin Decision: Tolak] ──(Alert notification)──> [W-07 Cabor Rejection Alert & Edit]
- [W-05 & W-08 Data Lists] ──(Click Export)──> [W-10 Official Print & Excel Export]

## Wireframe Style Notes
- Use only grayscale: white, light gray (#EEEEEE), medium gray (#AAAAAA), dark gray (#333333), black
- Text placeholders: Use actual representative labels, not "Lorem Ipsum"
- Buttons: Show shape and label clearly — primary buttons filled dark, secondary outlined
- Images/covers: Show as plain box with X through it (standard wireframe placeholder)
- Charts: Show as empty chart frames with axis labels and chart type label inside
- Icons: Show as simple labeled squares [icon: name]
- Number badges: Show on nav items where relevant (pending counts, notifications)
- Show mobile breakpoint for at least the HOME page as additional frame
- Add flow arrows between key pages (Login → Dashboard, Upload → Pending → Admin Review → Published)
