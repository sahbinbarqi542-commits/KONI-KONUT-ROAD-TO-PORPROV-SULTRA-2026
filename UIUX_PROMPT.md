Design a complete, high-fidelity UI/UX design system and application interface for KONI KONAWE UTARA - ROAD TO PORPROV SULTRA 2026.
A modern, energetic sports contingent and athlete qualification management web application for the National Sports Committee of Indonesia (KONI) Konawe Utara Regency preparing for the 2026 Southeast Sulawesi Provincial Games (Porprov Sultra 2026).
The application handles centralized athlete registration, digital identity verification (KTP, 3x4 photos, eligibility files), sports branch (Cabor) targets, live match medal tallies, and official reporting with dual-tier Role-Based Access Control (Central KONI Admin and Cabor Admin).

## Design Identity
- Style: Modern Sportive & Elegant Corporate (Combining athletic dynamism with regional government prestige)
- Aesthetic: Clean elevated cards, crisp micro-borders, smooth gradient metric headers, dual-mode theme support (Light & Dark Mode)
- Color Palette:
  Primary Brand (KONI Crimson Red): #C8102E
  Primary Dark Shade: #9E0D24
  Secondary Accent (Champion Gold): #FFB81C
  Secondary Gold Dark: #D48806
  Regional Konawe Utara Deep Blue: #0F4C81
  Regional Emerald / Teal Green: #0D9488
  Light Canvas Background: #F8FAFC
  Light Surface / Cards: #FFFFFF
  Light Border / Divider: #E2E8F0
  Dark Canvas Background: #0B1120
  Dark Surface / Cards: #1E293B
  Dark Border / Divider: #334155
  Text Primary (Light Mode): #0F172A
  Text Muted (Light Mode): #64748B
  Text Primary (Dark Mode): #F8FAFC
  Text Muted (Dark Mode): #94A3B8
- Status & Semantic Colors:
  Verified / Approved / Success: Background #DCFCE7, Text #166534, Border #86EFAC
  Pending / Under Review: Background #FEF9C3, Text #854D0E, Border #FDE047
  Rejected / Needs Correction: Background #FEE2E2, Text #991B1B, Border #FCA5A5
  Draft / Neutral: Background #F1F5F9, Text #475569, Border #CBD5E1
- Typography:
  Font Family: 'Plus Jakarta Sans', sans-serif (Athletic, modern, and highly legible across screens)
  Scale:
    - Display H1: 28px / 700 bold
    - Section H2: 20px / 600 semi-bold
    - Card Header H3: 16px / 600 semi-bold
    - Body Text: 14px / 400 regular
    - Small / Caption / Badges: 11px-12px / 600 medium uppercase tracking-wider
- Icons: Heroicons / Lucide icons (stroke width: 1.75px)
- Visual Language & Inspiration: Modern sports dashboard aesthetics inspired by Olympic.org, FIFA Match Center, and sleek SaaS platforms like Linear and Stripe
- Corner Radius: 14px for container cards, 10px for modal dialogs, 8px for form inputs & buttons, 9999px (full pill) for status badges
- Shadow & Elevation:
  Card Default: 0 2px 8px rgba(15, 23, 42, 0.05)
  Card Hover Elevation: 0 8px 24px rgba(200, 16, 46, 0.08) with translateY(-2px)
  Modal Overlay: 0 20px 40px rgba(0, 0, 0, 0.25)
- Spacing: 8px baseline grid system (padding: 16px mobile, 24px-32px desktop)

## Application Overview
The web application encompasses 5 functional sections across 11 key interfaces:
1. Unified Authentication (Dual-role login with institutional branding)
2. Central KONI Executive Administration (Executive Dashboard, Cabor Directory, System Branding)
3. Athlete Credential Verification Center (Split-panel document inspector with real-time approvals)
4. Sports Branch (Cabor) Portal (Branch Dashboard, Athlete Roster & File Dropzone, Medal Entry)
5. Official Reporting & Mobile Coordination (Printable Roster PDF, Excel Export, and 375px Smartphone Viewport)

## Detailed High-Fidelity Interfaces

### 1. PAGE UI-01: UNIFIED LOGIN SCREEN
Visual Layout: High-impact split background with diagonal athletic red and deep blue gradient accent. Centered card on clean backdrop.
- Branding Header:
  - Top logos container: High-res KONI Emblem (#C8102E) side-by-side with Konawe Utara Regency Crest (#0F4C81), separated by subtle vertical gold divider (#FFB81C).
  - Main Heading: "KONI KONAWE UTARA" (22px, 700 bold, #0F172A).
  - Badge pill below: "ROAD TO PORPROV SULTRA 2026" (Gold background #FEF3C7, Text #92400E, 11px font-bold).
- Card Element:
  - Background #FFFFFF, border 1px solid #E2E8F0, rounded-2xl, shadow-xl.
  - Tab Switcher: Discrete role indicator tab ("Admin Induk KONI" vs "Pengurus Cabang Olahraga").
  - Username Input: 44px height, light gray background #F8FAFC, border #D1D5DB, active focus ring 2px #C8102E, leading user icon.
  - Password Input: 44px height, eye toggle icon for show/hide, leading lock icon.
  - Submit Button: Full-width 44px height, bold solid gradient from Crimson Red (#C8102E) to Deep Burgundy (#9E0D24), white text, rounded-lg, hover: shadow-lg shadow-red-200.
  - Help text at footer: "Mengalami kendala akun? Hubungi Tim IT Sekretariat KONI Konut" with green WhatsApp link icon (#0D9488).

### 2. PAGE UI-02: CENTRAL ADMIN EXECUTIVE DASHBOARD
Visual Layout: Sticky top navigation bar, collapsible deep navy sidebar (#0F172A), multi-metric widget grid.
- Top Navigation Bar (Height 64px, border-bottom 1px #E2E8F0):
  - Left: Hamburger toggle, KONI Konut brand mark.
  - Center: Breadcrumb "Dashboard Eksekutif".
  - Right: Quick stats badge (Gold Medals count), Dark/Light mode switch button, Notification bell with pulse badge, Profile chip with avatar and role label.
- Left Sidebar (Width 250px, background #0B1120, text #94A3B8):
  - Nav links with active state: background linear gradient (rgba(200,16,46,0.15)), border-left 4px solid #C8102E, text #FFFFFF.
  - Badge counters: Red pill badge for "14 Berkas Pending" on Verification item.
- Top KPI Metric Cards (4 Grid Columns):
  - Card 1: Cabang Olahraga: Deep Blue gradient accent (#0F4C81), icon in circle badge, number "32 Cabor Aktif".
  - Card 2: Kontingen Atlet: Emerald Green gradient (#0D9488), number "418 Atlet", small micro-bar showing 75% verified.
  - Card 3: Target Medali: Gold gradient (#FFB81C), bold number "45 Emas", subtext: "35 Perak | 50 Perunggu".
  - Card 4: Capaian Sementara: Crimson Red (#C8102E), bold number "12 Emas" with Porprov live ticker.
- Analytics Visualizations (Two Columns):
  - Left Column (60%): "Target vs Realisasi Medali per Top 8 Cabor" - Multi-bar Chart with Gold (#FFB81C) for Target and Crimson Red (#C8102E) for Realized medals.
  - Right Column (40%): "Status Keabsahan Berkas Kontingen" - Doughnut Chart with green slice (75% Verified), yellow slice (18% Pending), red slice (7% Rejected).
- Quick Action Table: Recent pending athlete verifications with direct "Review Berkas" action button.

### 3. PAGE UI-03: MASTER CABOR & CREDENTIAL MANAGEMENT
Visual Layout: High-density administrative table with instant search and filter bar.
- Action Bar:
  - Search input with clear button, dropdown filter for Status Akun (Aktif/Nonaktif).
  - Primary Button: Solid Gold/Crimson gradient "[ + Tambah Cabor & Buat Akun ]" (rounded-lg, icon: user-plus).
- Data Table Card:
  - Table Header: Uppercase 11px font-weight 600, background #F8FAFC, border-bottom 2px #E2E8F0.
  - Table Rows: Alternating hover highlight #F1F5F9, smooth row transition.
  - Cabor Name column: Displayed with sports category emblem and coach name below.
  - Account Credentials column: Displays username badge and masked password with "Reset Sandi" key icon.
  - Target Medali badge: Inline mini badges (Gold: 8, Silver: 4, Bronze: 2).
  - Action column: Edit button (blue outline), Reset Password (amber outline), Deactivate (gray outline).
- Modal Dialog: "Tambah Cabang Olahraga & Akun Admin Baru"
  - Two-section modal: Section A (Detail Cabor & Kontak), Section B (Username & Password Awal).

### 4. PAGE UI-04: ATHLETE CREDENTIAL & VERIFICATION PORTAL (SPLIT VIEW)
Visual Layout: 2-Panel Split Workspace layout for rapid document auditing.
- Top Control Filter: Filter by Cabor selector, status filter tabs (Semua, Menunggu [14], Disetujui [312], Ditolak [30]).
- Left Panel (38% width) - Athlete Queue:
  - Vertical scrollable card list. Active card highlighted with Crimson border (#C8102E) and subtle red tint.
  - Card item: 48px square athlete photo thumbnail, Full Name (bold 14px), NIK (mono font 12px), Sports class/number, Timestamp of upload, Status pill badge.
- Right Panel (62% width) - Interactive Document Inspector:
  - Header: Athlete Name, Age, Cabor, and direct "Download All Files (.zip)" button.
  - Tab Navigation: [Foto 3x4 Resmi] | [KTP / KIA] | [Akta / Dokumen Pendukung].
  - Document Preview Canvas: Light slate container with zoom in/out, full screen, and rotate controls. High-clarity rendering of the uploaded KTP/Photo.
  - Verification Decision Box:
    - Textarea for Notes: Border #D1D5DB, placeholder "Tuliskan alasan penolakan jika berkas tidak sesuai / buram...".
    - Decision Buttons:
      - Reject Button: White background, red border 2px solid #EF4444, red text #DC2626, hover: background #FEE2E2.
      - Approve Button: Solid Emerald Green (#059669), white text, bold checkmark icon, hover: background #047857.

### 5. PAGE UI-05: MEDAL TALLY STANDING & LIVE MATCH ENTRY
Visual Layout: Tournament leaderboard view with festive sporting atmosphere.
- Tally Trophy Ribbon: Top panoramic banner in Konawe Utara Deep Blue (#0F4C81) with Gold medal accents. Displays live medal counter: Total 12 Emas, 8 Perak, 14 Perunggu (Rank #1 Regional).
- Action Buttons:
  - Button "[ + Catat Medali Atlet ]" in solid Crimson Red.
  - Button "[ Unduh Rekap Medali (.xlsx) ]" in outlined Emerald Green with Excel icon.
- Leaderboard Table:
  - Gold, Silver, Bronze column headers styled with metallic gradient shimmer badges.
  - Highlighted progress bar for each cabor showing % Target Achieved.

### 6. PAGE UI-06: APPLICATION BRANDING & SYSTEM CONFIGURATION
Visual Layout: Side-by-side configuration panel and interactive live mockup preview.
- Settings Form (Left):
  - Section A: App Identity (Title, Slogan, Chairman Name, Contact).
  - Section B: Logo Uploader with Drag-and-drop dropzones:
    - Logo KONI uploader (with auto-crop).
    - Logo Pemkab Konut uploader.
    - Mascot / Porprov Event Banner uploader.
  - Section C: Connected Google Drive Folder ID with green "Connected" status light.
  - Primary Button: "[ Simpan Perubahan Branding ]" (Deep Blue #0F4C81).
- Live Mockup Card (Right):
  - A real-time preview card that dynamically renders how the login screen and header navbar appear with the newly uploaded logos.

### 7. PAGE UI-07: CABOR ADMIN DASHBOARD
Visual Layout: Personalized sports branch hub tailored for field coaches and managers.
- Header Banner: Branded header displaying "Persatuan Olahraga Dayung Seluruh Indonesia (PODSI) - Kab. Konawe Utara".
- Priority Notification Card (Conditional Rejection Alert):
  - Border left 4px solid #EF4444, background #FEF2F2, red warning icon. Text: "Perhatian: Berkas Atlet 'La Ode Rudi' Ditolak oleh Tim Verifikator (KTP Buram). Harap perbaiki sebelum batas akhir!" with action button "[ Perbaiki Berkas Sekarang ]".
- Summary Metrics (3 Cards): Total Atlet (22/25 Kuota), Berkas Lolos (18), Target Medali (8 Emas).
- Quick Action Button Grid: Big touch-friendly buttons for Mobile & Desktop.

### 8. PAGE UI-08: CABOR ATHLETE REGISTRATION & DIRECTORY
Visual Layout: Directory table with responsive slide-over drawer form.
- Action Bar: Search by NIK / Name, Filter by Verification status, Primary Button "[ + Daftarkan Atlet Baru ]".
- Directory Table:
  - Columns: Foto, NIK, Nama Atlet, L/P, Tempat/Tgl Lahir, Nomor Tanding, Berkas Status, Status Keabsahan, Aksi.
  - Status Pills:
    - "Diterima" (Green badge)
    - "Menunggu" (Amber badge)
    - "Ditolak: KTP Buram" (Red badge with tooltip)
- Slide-over Registration Drawer:
  - Step Progress Indicator: Step 1 (Biodata) -> Step 2 (Nomor Tanding) -> Step 3 (Unggah Berkas).
  - Dropzone File Uploaders:
    - Dropzone 1: Pas Foto 3x4 (aspect ratio 3:4 preview frame, client-side auto-compress).
    - Dropzone 2: KTP / Kartu Pelajar (aspect ratio 16:9 preview frame).
    - Dropzone 3: Dokumen Pendukung (PDF preview chip).
  - Sticky Footer: Cancel button (outline) and Submit button (Crimson gradient).

### 9. PAGE UI-09: CABOR MEDAL REPORTING VIEW
Visual Layout: Clean match event logging feed.
- Event Log Table: Date, Match Class, Athlete Name, Round, Target Medal, Acquired Medal (Gold badge), Verification Status by KONI.
- Modal: Fast Result Submission for Cabor Admin to report match victory from venue.

### 10. PAGE UI-10: OFFICIAL ATHLETE ROSTER & ID CARD EXPORT (PRINT VIEW)
Visual Layout: Standard formal A4 print layout ready for PDF generation.
- Official Letterhead (Kop Surat):
  - Official Seal: KONI Kabupaten Konawe Utara & Pemerintah Daerah Kab. Konawe Utara.
  - Title: "SURAT KEPUTUSAN & DAFTAR NOMINATIF KONTINGEN RESMI KABUPATEN KONAWE UTARA - PORPROV SULTRA 2026".
- Structured Formal Table: Clean monochrome print borders, athlete bio, verified NIK, and photo.
- Legal Signature Block: Bottom right signature lines for Ketua Umum KONI Konawe Utara, complete with stamp and QR verification code placeholder box.
- Export Bar: Float bar with "[ Cetak Dokumen Resmi (PDF) ]" and "[ Ekspor Tabel (Excel) ]".

### 11. PAGE UI-11: RESPONSIVE MOBILE BREAKPOINT (SMARTPHONE 375px)
Visual Layout: Mobile-first native app feel designed for Android / iOS mobile browsers.
- Mobile Top App Bar: Compact 56px height, KONI red badge, notification bell, user profile avatar.
- Horizontal Metric Pill Swiper: Swipeable cards for Quick Stats (Total Atlet, Terverifikasi, Target Emas).
- Mobile Athlete Card Component:
  - Clean card container with rounded-xl, 1px border.
  - Left: 56px rounded-lg photo.
  - Center: Full Name, Cabor, Class.
  - Right: Colored status pill.
  - Bottom card action: Two quick-tap buttons: "[ Lihat Berkas ]" and "[ Verifikasi ]".
- Bottom Navigation Bar (Fixed 64px, background #FFFFFF / Dark #1E293B with active red indicator):
  - 4 Navigation tabs: [Home] [Verifikasi] [Medali] [Profil].

## Global Design Requirements
- Fully responsive design: Seamless desktop 1440px wide layout down to 375px mobile viewport.
- Full Light & Dark Mode support with smooth CSS transition (background, cards, borders, text).
- Skeleton loading states for all data tables, metric cards, and document preview frames.
- Toast notifications:
  - Success (Emerald #059669): "Berkas atlet berhasil disetujui."
  - Error (Red #DC2626): "Format berkas tidak valid / ukuran melebihi 2MB."
  - Warning (Amber #D97706): "1 Berkas atlet memerlukan perbaikan."
  - Info (Blue #2563EB): "Target medali berhasil diperbarui."
- Empty states: Illustrated sports graphic + informative message ("Belum ada atlet terdaftar di cabor ini") + CTA button "[ + Tambah Atlet Pertama ]".
- Hover states: Subtle elevation translateY(-2px) and shadow enhancement on all interactive cards and table rows.
- Focus states: Visible 2px outline focus ring with primary accent color for accessibility.
- Form validation: Real-time inline helper text and error message in red (#DC2626) below inputs.
- The overall feel: A high-performance, official, and inspiring sports management system that instills pride and excellence in the athletes and contingent of Konawe Utara for Porprov Sultra 2026.
