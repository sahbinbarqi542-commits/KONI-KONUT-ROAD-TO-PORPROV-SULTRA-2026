/**
 * =========================================================================
 * KONI KONAWE UTARA - ROAD TO PORPROV SULTRA 2026
 * FULL-STACK SPA FRONTEND ENGINE (js/app.js)
 * =========================================================================
 * Fitur:
 *   - SPA Router & Multi-Role Navigation (Publik, Admin Induk, Admin Cabor)
 *   - Anti-CORS Fetch Engine (text/plain POST) & In-Flight Deduplication
 *   - SWR Caching & LocalStorage Persistence
 *   - Split-Panel Document Verification Inspector (Zoom, Rotate, Approve/Reject)
 *   - Slide-Over Registration Drawer & Client-Side Image Compression
 *   - Chart.js Analytics (Target vs Realisasi Medali & Status Keabsahan)
 *   - SheetJS Excel Exporter & Official A4 Printable Roster
 *   - Seamless Demo / Offline Fallback Mode
 * =========================================================================
 */

// =========================================================================
// 1. STATE MANAGEMENT & STORE
// =========================================================================
const AppState = {
  currentUser: null, // { id, username, nama, role, caborId, token }
  currentView: 'public-landing',
  theme: localStorage.getItem('koni_theme') || 'light',
  
  // Cache Data Lokal
  publicData: null,
  athletes: [],
  caborList: [],
  selectedAthleteForReview: null,
  selectedCaborFilter: '',
  selectedStatusFilter: '',
  selectedDocTab: 'foto', // 'foto', 'ktp', 'dokumen'
  docZoom: 1,
  
  // Charts Instances
  chartTarget: null,
  chartStatus: null,
  
  // In-Flight Request Deduplication (gas-scale-turbo)
  _inflight: {},
  _writeEpoch: 0
};

// =========================================================================
// 2. SEED DATA UNTUK DEMO & OFFLINE FALLBACK
// =========================================================================
const SEED_DATA = {
  settings: {
    namaAplikasi: 'KONI KONAWE UTARA - ROAD TO PORPROV SULTRA 2026',
    subJudul: 'Sistem Informasi Atlet & Kontingen Menuju Porprov Sultra 2026',
    logoKoniUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Logo_KONI.svg/300px-Logo_KONI.svg.png',
    logoKonutUrl: '',
    bannerUrl: '',
    ketuaKoni: 'Ketua Umum KONI Kabupaten Konawe Utara',
    kontakBantuan: '0812-4567-8901'
  },
  cabor: [
    { idCabor: 'CAB_DAYUNG', namaCabor: 'Dayung (PODSI)', ketuaCabor: 'Hendra Kurniawan', nomorKontak: '0852-1111-2222', targetEmas: 8, targetPerak: 4, targetPerunggu: 2, totalAtlet: 22, realEmas: 4, realPerak: 2, realPerunggu: 1, totalMedali: 7 },
    { idCabor: 'CAB_ATLETIK', namaCabor: 'Atletik (PASI)', ketuaCabor: 'Ruslan, S.Pd', nomorKontak: '0812-2222-3333', targetEmas: 6, targetPerak: 5, targetPerunggu: 4, totalAtlet: 28, realEmas: 3, realPerak: 1, realPerunggu: 3, totalMedali: 7 },
    { idCabor: 'CAB_TAEKWONDO', namaCabor: 'Taekwondo (TI)', ketuaCabor: 'Fitriani, M.Si', nomorKontak: '0821-3333-4444', targetEmas: 4, targetPerak: 3, targetPerunggu: 3, totalAtlet: 15, realEmas: 2, realPerak: 1, realPerunggu: 2, totalMedali: 5 },
    { idCabor: 'CAB_TAKRAW', namaCabor: 'Sepak Takraw (PSTI)', ketuaCabor: 'Jumardin', nomorKontak: '0853-4444-5555', targetEmas: 3, targetPerak: 2, targetPerunggu: 2, totalAtlet: 12, realEmas: 1, realPerak: 1, realPerunggu: 2, totalMedali: 4 },
    { idCabor: 'CAB_KARATE', namaCabor: 'Karate (FORKI)', ketuaCabor: 'Irwan Sahputra', nomorKontak: '0813-5555-6666', targetEmas: 4, targetPerak: 3, targetPerunggu: 4, totalAtlet: 16, realEmas: 1, realPerak: 2, realPerunggu: 3, totalMedali: 6 },
    { idCabor: 'CAB_PANAHAN', namaCabor: 'Panahan (PERPANI)', ketuaCabor: 'dr. Wahyudi', nomorKontak: '0822-6666-7777', targetEmas: 3, targetPerak: 2, targetPerunggu: 3, totalAtlet: 10, realEmas: 1, realPerak: 1, realPerunggu: 1, totalMedali: 3 },
    { idCabor: 'CAB_SILAT', namaCabor: 'Pencak Silat (IPSI)', ketuaCabor: 'Bahrun', nomorKontak: '0851-7777-8888', targetEmas: 4, targetPerak: 3, targetPerunggu: 4, totalAtlet: 18, realEmas: 0, realPerak: 0, realPerunggu: 2, totalMedali: 2 },
    { idCabor: 'CAB_CATUR', namaCabor: 'Catur (PERCASI)', ketuaCabor: 'Mansyur, SE', nomorKontak: '0852-8888-9999', targetEmas: 2, targetPerak: 2, targetPerunggu: 2, totalAtlet: 8, realEmas: 0, realPerak: 0, realPerunggu: 0, totalMedali: 0 }
  ],
  athletes: [
    {
      idAtlet: 'ATL_001',
      idCabor: 'CAB_DAYUNG',
      namaCabor: 'Dayung (PODSI)',
      nik: '7408011204020001',
      namaLengkap: 'La Ode Muhammad Arfan',
      tempatLahir: 'Wanggudu',
      tglLahir: '2002-04-12',
      jenisKelamin: 'L',
      kelasTanding: 'Kayak 1 (K-1) 1000m Putra',
      alamat: 'Kec. Lasolo, Kab. Konawe Utara',
      noHp: '082199887766',
      statusVerifikasi: 'PENDING',
      catatanVerifikasi: '',
      diverifikasiOleh: '',
      tglVerifikasi: '',
      berkas: [
        { jenis: 'FOTO_3X4', viewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', namaFile: 'Pas_Foto_Arfan.jpg' },
        { jenis: 'KTP', viewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', namaFile: 'Scan_KTP_Arfan.jpg' }
      ]
    },
    {
      idAtlet: 'ATL_002',
      idCabor: 'CAB_DAYUNG',
      namaCabor: 'Dayung (PODSI)',
      nik: '7408021508030002',
      namaLengkap: 'Herman Syahputra',
      tempatLahir: 'Asera',
      tglLahir: '2003-08-15',
      jenisKelamin: 'L',
      kelasTanding: 'Canoe 1 (C-1) 500m Putra',
      alamat: 'Kec. Asera, Kab. Konawe Utara',
      noHp: '085288776655',
      statusVerifikasi: 'DITERIMA',
      catatanVerifikasi: 'Dokumen lengkap dan absah sesuai regulasi Porprov.',
      diverifikasiOleh: 'Admin Induk KONI',
      tglVerifikasi: '2026-03-10T10:00:00Z',
      berkas: [
        { jenis: 'FOTO_3X4', viewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', namaFile: 'Foto_Herman.jpg' },
        { jenis: 'KTP', viewUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80', namaFile: 'KTP_Herman.jpg' }
      ]
    },
    {
      idAtlet: 'ATL_003',
      idCabor: 'CAB_DAYUNG',
      namaCabor: 'Dayung (PODSI)',
      nik: '7408032009010003',
      namaLengkap: 'Rudi Haryanto',
      tempatLahir: 'Lembo',
      tglLahir: '2001-09-20',
      jenisKelamin: 'L',
      kelasTanding: 'Kayak 2 (K-2) 1000m Putra',
      alamat: 'Kec. Lembo, Kab. Konawe Utara',
      noHp: '081277665544',
      statusVerifikasi: 'DITOLAK',
      catatanVerifikasi: 'Foto KTP buram dan NIK tidak terbaca dengan jelas. Harap unggah ulang dokumen asli.',
      diverifikasiOleh: 'Admin Induk KONI',
      tglVerifikasi: '2026-03-10T11:00:00Z',
      berkas: [
        { jenis: 'FOTO_3X4', viewUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', namaFile: 'Foto_Rudi.jpg' },
        { jenis: 'KTP', viewUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80', namaFile: 'KTP_Buram.jpg' }
      ]
    },
    {
      idAtlet: 'ATL_004',
      idCabor: 'CAB_TAEKWONDO',
      namaCabor: 'Taekwondo (TI)',
      nik: '7408015502040004',
      namaLengkap: 'Siti Rahmawati',
      tempatLahir: 'Wanggudu',
      tglLahir: '2004-02-15',
      jenisKelamin: 'P',
      kelasTanding: 'Kyorugi Under 49kg Putri',
      alamat: 'Kec. Oheo, Kab. Konawe Utara',
      noHp: '085311223344',
      statusVerifikasi: 'DITERIMA',
      catatanVerifikasi: 'Berkas lolos verifikasi.',
      diverifikasiOleh: 'Admin Induk KONI',
      tglVerifikasi: '2026-03-11T09:00:00Z',
      berkas: [
        { jenis: 'FOTO_3X4', viewUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', namaFile: 'Foto_Siti.jpg' },
        { jenis: 'KTP', viewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', namaFile: 'KTP_Siti.jpg' }
      ]
    },
    {
      idAtlet: 'ATL_005',
      idCabor: 'CAB_ATLETIK',
      namaCabor: 'Atletik (PASI)',
      nik: '7408021010020005',
      namaLengkap: 'Budi Santoso',
      tempatLahir: 'Lasolo',
      tglLahir: '2002-10-10',
      jenisKelamin: 'L',
      kelasTanding: 'Lari 100m & 200m Putra',
      alamat: 'Kec. Lasolo, Kab. Konawe Utara',
      noHp: '081388776611',
      statusVerifikasi: 'PENDING',
      catatanVerifikasi: '',
      diverifikasiOleh: '',
      tglVerifikasi: '',
      berkas: [
        { jenis: 'FOTO_3X4', viewUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', namaFile: 'Foto_Budi.jpg' },
        { jenis: 'KTP', viewUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80', namaFile: 'KTP_Budi.jpg' }
      ]
    }
  ]
};

// Inisialisasi local database
function getLocalDb() {
  const stored = localStorage.getItem('koni_local_db');
  if (!stored) {
    localStorage.setItem('koni_local_db', JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return SEED_DATA;
  }
}

function saveLocalDb(data) {
  localStorage.setItem('koni_local_db', JSON.stringify(data));
}

// =========================================================================
// 3. API COMMUNICATION ENGINE (gas-pro-api & gas-scale-turbo)
// =========================================================================
async function apiCall(action, payload = {}, isWrite = false) {
  // Jika dalam Mode Demo atau GAS_URL belum diisi, gunakan Mock Data Handler
  if (!CONFIG.GAS_URL || CONFIG.DEMO_MODE) {
    return handleMockApi(action, payload);
  }

  const isPostAction = isWrite || /^(login|save|register|upload|verify|update|record|delete|create|reset)/i.test(action);

  // 1. Rute POST (Aksi Tulis, Login, Unggah Berkas, dll.)
  if (isPostAction) {
    AppState._writeEpoch++;
    try {
      const res = await fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // WAJIB text/plain agar bebas CORS
        body: JSON.stringify({
          action: action,
          token: AppState.currentUser ? AppState.currentUser.token : '',
          data: payload
        })
      });
      return await res.json();
    } catch (err) {
      console.warn('Network POST failed, falling back to local mock update:', err);
      return handleMockApi(action, payload);
    }
  }

  // 2. Rute GET: Deduplikasi Request In-Flight untuk operasi baca (gas-scale-turbo)
  const key = AppState._writeEpoch + '|' + action + '|' + JSON.stringify(payload);
  if (AppState._inflight[key]) return AppState._inflight[key];

  const promise = (async () => {
    try {
      const url = `${CONFIG.GAS_URL}?action=${encodeURIComponent(action)}&t=${Date.now()}`;
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Network GET failed, falling back to local mock data:', err);
      return handleMockApi(action, payload);
    }
  })();

  AppState._inflight[key] = promise;
  promise.then(() => delete AppState._inflight[key], () => delete AppState._inflight[key]);
  return promise;
}

// Handler Mock Data jika Backend Belum Dideploy
function handleMockApi(action, payload) {
  const db = getLocalDb();

  return new Promise(resolve => {
    setTimeout(() => {
      switch (action) {
        case 'getPublicLandingData': {
          let tE = 0, tP = 0, tB = 0, rE = 0, rP = 0, rB = 0;
          db.cabor.forEach(c => {
            tE += Number(c.targetEmas) || 0;
            tP += Number(c.targetPerak) || 0;
            tB += Number(c.targetPerunggu) || 0;
            rE += Number(c.realEmas) || 0;
            rP += Number(c.realPerak) || 0;
            rB += Number(c.realPerunggu) || 0;
          });

          const verified = db.athletes.filter(a => a.statusVerifikasi === 'DITERIMA').length;
          const pending = db.athletes.filter(a => a.statusVerifikasi === 'PENDING').length;
          const rejected = db.athletes.filter(a => a.statusVerifikasi === 'DITOLAK').length;

          resolve({
            success: true,
            data: {
              settings: db.settings,
              metrics: {
                totalCabor: db.cabor.length,
                totalAtlet: db.athletes.length,
                atletVerified: verified,
                atletPending: pending,
                atletRejected: rejected,
                targetEmas: tE,
                targetPerak: tP,
                targetPerunggu: tB,
                realEmas: rE,
                realPerak: rP,
                realPerunggu: rB,
                totalRealMedali: rE + rP + rB
              },
              caborStandings: db.cabor,
              topCaborCharts: db.cabor.slice(0, 8)
            }
          });
          break;
        }

        case 'login': {
          const u = String(payload.username || '').toLowerCase();
          const p = String(payload.password || '');
          if (u === 'admin_koni' && p === 'KoniKonut2026!') {
            resolve({
              success: true,
              message: 'Login Admin Induk Berhasil!',
              token: 'mock_token_admin_' + Date.now(),
              user: {
                id: 'USR_ADMIN',
                username: 'admin_koni',
                nama: 'Admin Induk KONI Konut',
                role: 'ADMIN_INDUK',
                caborId: ''
              }
            });
          } else if (u === 'cabor_dayung' && p === 'dayung123') {
            resolve({
              success: true,
              message: 'Login Admin Cabor Dayung Berhasil!',
              token: 'mock_token_dayung_' + Date.now(),
              user: {
                id: 'USR_DAYUNG',
                username: 'cabor_dayung',
                nama: 'Admin Dayung (PODSI)',
                role: 'ADMIN_CABOR',
                caborId: 'CAB_DAYUNG'
              }
            });
          } else if (u.startsWith('cabor_')) {
            resolve({
              success: true,
              message: 'Login Admin Cabor Berhasil!',
              token: 'mock_token_cabor_' + Date.now(),
              user: {
                id: 'USR_' + u,
                username: u,
                nama: 'Pengurus ' + u.replace('cabor_', '').toUpperCase(),
                role: 'ADMIN_CABOR',
                caborId: 'CAB_' + u.replace('cabor_', '').toUpperCase()
              }
            });
          } else {
            resolve({ success: false, message: 'Username atau password salah! (Cek info akun demo di bawah form)' });
          }
          break;
        }

        case 'getAthletesList': {
          let list = [...db.athletes];
          if (payload.caborId) list = list.filter(a => a.idCabor === payload.caborId);
          if (payload.status) list = list.filter(a => a.statusVerifikasi === payload.status);
          resolve({ success: true, data: list });
          break;
        }

        case 'registerAthlete': {
          const id = 'ATL_' + Date.now().toString(36);
          const caborObj = db.cabor.find(c => c.idCabor === payload.idCabor) || { namaCabor: 'Cabor Pilihan' };
          const newAthlete = {
            idAtlet: id,
            idCabor: payload.idCabor,
            namaCabor: caborObj.namaCabor,
            nik: payload.nik,
            namaLengkap: payload.namaLengkap,
            tempatLahir: payload.tempatLahir || '',
            tglLahir: payload.tglLahir || '',
            jenisKelamin: payload.jenisKelamin || 'L',
            kelasTanding: payload.kelasTanding || '',
            alamat: payload.alamat || '',
            noHp: payload.noHp || '',
            statusVerifikasi: 'PENDING',
            catatanVerifikasi: '',
            diverifikasiOleh: '',
            tglVerifikasi: '',
            berkas: payload.berkas || []
          };
          db.athletes.unshift(newAthlete);
          saveLocalDb(db);
          resolve({ success: true, message: 'Atlet berhasil didaftarkan!', idAtlet: id });
          break;
        }

        case 'verifyAthleteDocument': {
          const at = db.athletes.find(a => a.idAtlet === payload.idAtlet);
          if (at) {
            at.statusVerifikasi = payload.keputusan;
            at.catatanVerifikasi = payload.catatan || '';
            at.diverifikasiOleh = AppState.currentUser ? AppState.currentUser.nama : 'Admin Induk KONI';
            at.tglVerifikasi = new Date().toISOString();
            saveLocalDb(db);
            resolve({ success: true, message: 'Status keabsahan atlet berhasil diubah menjadi: ' + payload.keputusan });
          } else {
            resolve({ success: false, message: 'Atlet tidak ditemukan.' });
          }
          break;
        }

        case 'saveCabor': {
          const id = payload.idCabor || ('CAB_' + Date.now().toString(36));
          const idx = db.cabor.findIndex(c => c.idCabor === id);
          const caborItem = {
            idCabor: id,
            namaCabor: payload.namaCabor,
            ketuaCabor: payload.ketuaCabor,
            nomorKontak: payload.nomorKontak,
            targetEmas: Number(payload.targetEmas) || 0,
            targetPerak: Number(payload.targetPerak) || 0,
            targetPerunggu: Number(payload.targetPerunggu) || 0,
            totalAtlet: Number(payload.totalAtlet) || (idx >= 0 ? db.cabor[idx].totalAtlet : 0),
            realEmas: idx >= 0 ? db.cabor[idx].realEmas : 0,
            realPerak: idx >= 0 ? db.cabor[idx].realPerak : 0,
            realPerunggu: idx >= 0 ? db.cabor[idx].realPerunggu : 0,
            totalMedali: idx >= 0 ? db.cabor[idx].totalMedali : 0
          };
          if (idx >= 0) {
            db.cabor[idx] = Object.assign(db.cabor[idx], caborItem);
          } else {
            db.cabor.push(caborItem);
          }
          saveLocalDb(db);
          resolve({ success: true, message: 'Cabang Olahraga berhasil disimpan!' });
          break;
        }

        case 'deleteCabor': {
          const idx = db.cabor.findIndex(c => c.idCabor === payload.idCabor);
          if (idx >= 0) {
            db.cabor.splice(idx, 1);
            db.athletes = db.athletes.filter(a => a.idCabor !== payload.idCabor);
            saveLocalDb(db);
            resolve({ success: true, message: 'Cabang Olahraga berhasil dihapus!' });
          } else {
            resolve({ success: false, message: 'Cabang Olahraga tidak ditemukan.' });
          }
          break;
        }

        case 'recordMedal': {
          const cabor = db.cabor.find(c => c.idCabor === payload.idCabor);
          if (cabor) {
            const kat = String(payload.kategori).toUpperCase();
            if (kat === 'EMAS') cabor.realEmas = (cabor.realEmas || 0) + 1;
            else if (kat === 'PERAK') cabor.realPerak = (cabor.realPerak || 0) + 1;
            else if (kat === 'PERUNGGU') cabor.realPerunggu = (cabor.realPerunggu || 0) + 1;
            cabor.totalMedali = cabor.realEmas + cabor.realPerak + cabor.realPerunggu;
            saveLocalDb(db);
            resolve({ success: true, message: 'Medali ' + kat + ' berhasil dicatat untuk cabor ' + cabor.namaCabor + '!' });
          } else {
            resolve({ success: false, message: 'Cabor tidak ditemukan.' });
          }
          break;
        }

        case 'updateSystemSettings': {
          db.settings = Object.assign(db.settings, payload);
          saveLocalDb(db);
          resolve({ success: true, message: 'Pengaturan identitas & branding berhasil disimpan!' });
          break;
        }

        default:
          resolve({ success: true, message: 'Mock action executed: ' + action });
      }
    }, 250); // Simulasi delay jaringan realistis 250ms
  });
}

// =========================================================================
// 4. ROUTER & VIEW SWITCHER
// =========================================================================
function navigateTo(viewId) {
  AppState.currentView = viewId;

  // Tutup mobile drawer atau menu jika terbuka
  const mobileDrawer = document.getElementById('mobile-sidebar-drawer');
  if (mobileDrawer) mobileDrawer.classList.add('hidden');

  // Sembunyikan semua section view
  document.querySelectorAll('.app-view').forEach(el => {
    el.classList.add('hidden');
  });

  // Tampilkan view yang dituju
  const targetEl = document.getElementById('view-' + viewId);
  if (targetEl) {
    targetEl.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update indikator navigasi sidebar
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.getAttribute('data-view') === viewId) {
      el.classList.add('bg-primary-container/15', 'text-white', 'border-l-4', 'border-primary');
      el.classList.remove('text-slate-400');
    } else {
      el.classList.remove('bg-primary-container/15', 'text-white', 'border-l-4', 'border-primary');
      el.classList.add('text-slate-400');
    }
  });

  // Eksekusi logic loader spesifik per view
  switch (viewId) {
    case 'public-landing':
      loadPublicLanding();
      break;
    case 'dashboard-induk':
      loadExecutiveDashboard();
      break;
    case 'master-cabor':
      loadMasterCabor();
      break;
    case 'verifikasi-berkas':
      loadVerificationCenter();
      break;
    case 'klasemen-medali':
      loadMedalStandings();
      break;
    case 'pengaturan-branding':
      loadSystemSettings();
      break;
    case 'portal-cabor':
      loadCaborPortal();
      break;
    case 'dokumen-nominatif-print':
      renderPrintView();
      break;
  }
}

// =========================================================================
// 5. INISIALISASI & LOADERS VIEW
// =========================================================================
async function initApp() {
  // 1. Terapkan Tema (Dark / Light)
  applyTheme(AppState.theme);

  // 2. Periksa Token Sesi Tersimpan
  const savedUser = localStorage.getItem('koni_session_user');
  if (savedUser) {
    try {
      AppState.currentUser = JSON.parse(savedUser);
      updateAuthUI();
    } catch (e) {
      localStorage.removeItem('koni_session_user');
    }
  }

  // 3. Muat Data Publik Awal
  await loadPublicLanding();

  // 4. Setup Event Listeners
  setupEventListeners();
}

function applyTheme(theme) {
  AppState.theme = theme;
  localStorage.setItem('koni_theme', theme);
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function toggleTheme() {
  const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  showToast('Mode ' + (newTheme === 'dark' ? 'Gelap' : 'Terang') + ' aktif', 'info');
}

// =========================================================================
// 6. PUBLIC LANDING VIEW LOADER
// =========================================================================
async function loadPublicLanding() {
  const res = await apiCall('getPublicLandingData');
  if (!res.success) return;

  AppState.publicData = res.data;
  const d = res.data;

  // Render Metrik Publik
  const elTotalCabor = document.getElementById('pub-stat-cabor');
  const elTotalAtlet = document.getElementById('pub-stat-atlet');
  const elTargetEmas = document.getElementById('pub-stat-target-emas');
  const elRealEmas = document.getElementById('pub-stat-real-emas');
  const elVerifiedPercent = document.getElementById('pub-stat-verified-percent');

  if (elTotalCabor) elTotalCabor.innerText = d.metrics.totalCabor;
  if (elTotalAtlet) elTotalAtlet.innerText = d.metrics.totalAtlet;
  if (elTargetEmas) elTargetEmas.innerText = d.metrics.targetEmas;
  if (elRealEmas) elRealEmas.innerText = d.metrics.realEmas;
  if (elVerifiedPercent && d.metrics.totalAtlet > 0) {
    const p = Math.round((d.metrics.atletVerified / d.metrics.totalAtlet) * 100);
    elVerifiedPercent.innerText = p + '% Terverifikasi';
  }

  // Render Podium Medali Teratas
  renderPublicMedalPodium(d.caborStandings);

  // Render Grid Cabor
  renderPublicCaborCards(d.caborStandings);
}

function renderPublicMedalPodium(standings) {
  const container = document.getElementById('pub-medal-standings-body');
  if (!container) return;

  if (!standings || standings.length === 0) {
    container.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-slate-500">Belum ada data cabang olahraga.</td></tr>';
    return;
  }

  container.innerHTML = standings.map((c, idx) => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-border-light dark:border-border-dark transition">
      <td class="py-3 px-4 font-bold ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-500'}">
        #${idx + 1}
      </td>
      <td class="py-3 px-4">
        <span class="font-bold text-slate-900 dark:text-white block">${c.namaCabor}</span>
        <span class="text-xs text-slate-500 dark:text-slate-400">PJ: ${c.ketuaCabor || '-'}</span>
      </td>
      <td class="py-3 px-4 text-center font-bold text-amber-600 bg-amber-50/50 dark:bg-amber-950/20">${c.realEmas || 0}</td>
      <td class="py-3 px-4 text-center font-bold text-slate-500">${c.realPerak || 0}</td>
      <td class="py-3 px-4 text-center font-bold text-amber-800">${c.realPerunggu || 0}</td>
      <td class="py-3 px-4 text-center font-black text-primary">${c.totalMedali || 0}</td>
    </tr>
  `).join('');
}

function renderPublicCaborCards(caborList) {
  const container = document.getElementById('pub-cabor-grid');
  if (!container) return;

  container.innerHTML = (caborList || []).map(c => `
    <div class="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-4 card-hover-elevation shadow-xs flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/20 dark:text-red-400 text-[10px] font-bold rounded-full uppercase">
            Porprov 2026
          </span>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
            ${c.totalAtlet || 0} Atlet
          </span>
        </div>
        <h4 class="font-bold text-slate-900 dark:text-white text-base mb-1">${c.namaCabor}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">Ketua: ${c.ketuaCabor || '-'}</p>
      </div>
      <div class="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs">
        <div>
          <span class="text-slate-500 block text-[10px] uppercase font-bold">Target</span>
          <span class="font-extrabold text-amber-600">${c.targetEmas || 0} Emas</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[10px] uppercase font-bold text-right">Raihan</span>
          <span class="font-extrabold text-primary">${c.realEmas || 0} Emas</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Cek Status Keabsahan Atlet oleh Publik (Pencarian NIK/Nama)
async function searchAthletePublic() {
  const input = document.getElementById('pub-search-query');
  const resultContainer = document.getElementById('pub-search-result');
  if (!input || !resultContainer) return;

  const query = input.value.trim().toLowerCase();
  if (!query) {
    showToast('Masukkan NIK atau Nama Atlet yang dicari!', 'warning');
    return;
  }

  resultContainer.innerHTML = '<div class="py-4 text-center text-slate-500">Mencari data keabsahan...</div>';
  resultContainer.classList.remove('hidden');

  const res = await apiCall('getAthletesList', {});
  const athletes = res.data || [];
  const matches = athletes.filter(a =>
    a.nik.toLowerCase().includes(query) || a.namaLengkap.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    resultContainer.innerHTML = `
      <div class="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-sm">
        <p class="font-bold">Atlet tidak ditemukan</p>
        <p class="text-xs mt-1">Pastikan NIK atau nama lengkap telah didaftarkan oleh pengurus Cabor terkait.</p>
      </div>
    `;
    return;
  }

  resultContainer.innerHTML = matches.map(a => {
    let badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    let badgeText = 'Menunggu Verifikasi';
    if (a.statusVerifikasi === 'DITERIMA') {
      badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      badgeText = 'Lolos Verifikasi Keabsahan';
    } else if (a.statusVerifikasi === 'DITOLAK') {
      badgeClass = 'bg-red-100 text-red-800 border-red-300';
      badgeText = 'Perlu Perbaikan Berkas';
    }

    // Sensor NIK untuk privasi publik
    const maskedNik = a.nik.slice(0, 6) + '******' + a.nik.slice(-4);

    return `
      <div class="p-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <div class="flex items-center gap-2">
            <h5 class="font-bold text-slate-900 dark:text-white text-base">${a.namaLengkap}</h5>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full border ${badgeClass}">${badgeText}</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">NIK: <span class="font-mono">${maskedNik}</span> • Cabor: <strong>${a.namaCabor}</strong> (${a.kelasTanding})</p>
          ${a.catatanVerifikasi ? `<p class="text-xs text-red-600 dark:text-red-400 mt-1 italic">Catatan: "${a.catatanVerifikasi}"</p>` : ''}
        </div>
        <div class="text-xs text-slate-400">
          Kontingen Konawe Utara 2026
        </div>
      </div>
    `;
  }).join('');
}

// =========================================================================
// 7. EXECUTIVE DASHBOARD LOADER (ADMIN INDUK)
// =========================================================================
async function loadExecutiveDashboard() {
  if (!AppState.currentUser || AppState.currentUser.role !== 'ADMIN_INDUK') {
    navigateTo('public-landing');
    return;
  }

  const res = await apiCall('getPublicLandingData');
  if (!res.success) return;
  const d = res.data;

  // Render KPI Metrik Eksekutif
  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  setTxt('dash-stat-cabor', d.metrics.totalCabor + ' Cabor');
  setTxt('dash-stat-atlet', d.metrics.totalAtlet + ' Atlet');
  setTxt('dash-stat-atlet-sub', `${d.metrics.atletVerified} Lolos • ${d.metrics.atletPending} Pending • ${d.metrics.atletRejected} Ditolak`);
  setTxt('dash-stat-target-emas', d.metrics.targetEmas + ' Emas');
  setTxt('dash-stat-target-sub', `${d.metrics.targetPerak} Perak • ${d.metrics.targetPerunggu} Perunggu`);
  setTxt('dash-stat-real-emas', d.metrics.realEmas + ' Emas');

  // Render Chart.js Analytics
  renderAnalyticsCharts(d);

  // Render Antrean Verifikasi Cepat
  const resAthletes = await apiCall('getAthletesList', { status: 'PENDING' });
  renderQuickVerificationQueue(resAthletes.data || []);
}

function renderAnalyticsCharts(d) {
  // 1. Bar Chart: Target vs Realisasi Medali Top Cabor
  const ctxTarget = document.getElementById('chart-target-realisasi');
  if (ctxTarget) {
    if (AppState.chartTarget) AppState.chartTarget.destroy();

    const top8 = d.topCaborCharts || [];
    const labels = top8.map(c => c.namaCabor.replace(/\s*\(.*?\)/, ''));
    const targetEmas = top8.map(c => c.targetEmas || 0);
    const realEmas = top8.map(c => c.realEmas || 0);

    AppState.chartTarget = new Chart(ctxTarget, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Target Emas',
            data: targetEmas,
            backgroundColor: '#FFB81C',
            borderRadius: 6
          },
          {
            label: 'Realisasi Emas',
            data: realEmas,
            backgroundColor: '#C8102E',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11 } } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.5)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 2. Donut Chart: Status Keabsahan Berkas
  const ctxStatus = document.getElementById('chart-status-keabsahan');
  if (ctxStatus) {
    if (AppState.chartStatus) AppState.chartStatus.destroy();

    AppState.chartStatus = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['Disetujui', 'Menunggu', 'Ditolak'],
        datasets: [{
          data: [d.metrics.atletVerified, d.metrics.atletPending, d.metrics.atletRejected],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11 } } }
        },
        cutout: '68%'
      }
    });
  }
}

function renderQuickVerificationQueue(athletes) {
  const container = document.getElementById('dash-quick-queue-body');
  if (!container) return;

  if (athletes.length === 0) {
    container.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-slate-500">Tidak ada berkas pending saat ini. Semua berkas telah diverifikasi!</td></tr>';
    return;
  }

  container.innerHTML = athletes.slice(0, 5).map(a => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-border-light dark:border-border-dark transition">
      <td class="py-3 px-4">
        <span class="font-bold text-slate-900 dark:text-white block">${a.namaLengkap}</span>
        <span class="text-xs text-slate-500 font-mono">${a.nik}</span>
      </td>
      <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">${a.namaCabor}</td>
      <td class="py-3 px-4 text-xs text-slate-500">${a.kelasTanding}</td>
      <td class="py-3 px-4 text-center">
        <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Menunggu Review
        </span>
      </td>
      <td class="py-3 px-4 text-center">
        <button class="px-3 py-1 bg-primary hover:bg-crimson-dark text-white text-xs font-bold rounded-lg transition" onclick="openDirectReview('${a.idAtlet}')">
          Periksa
        </button>
      </td>
    </tr>
  `).join('');
}

// =========================================================================
// 8. MASTER CABOR & MANAJEMEN AKUN
// =========================================================================
async function loadMasterCabor() {
  const res = await apiCall('getPublicLandingData');
  const caborList = res.data.caborStandings || [];
  AppState.caborList = caborList;

  const container = document.getElementById('master-cabor-table-body');
  if (!container) return;

  container.innerHTML = caborList.map((c, i) => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-border-light dark:border-border-dark transition">
      <td class="py-3 px-4 text-center text-slate-500 font-bold">${i + 1}</td>
      <td class="py-3 px-4">
        <span class="font-bold text-slate-900 dark:text-white block">${c.namaCabor}</span>
        <span class="text-xs text-slate-400 font-mono">ID: ${c.idCabor}</span>
      </td>
      <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">${c.ketuaCabor || '-'}</td>
      <td class="py-3 px-4 text-xs font-mono text-slate-500">${c.nomorKontak || '-'}</td>
      <td class="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">${c.totalAtlet || 0}</td>
      <td class="py-3 px-4 text-center">
        <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
          ${c.targetEmas} E / ${c.targetPerak} P / ${c.targetPerunggu} B
        </span>
      </td>
      <td class="py-3 px-4 text-center">
        <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Aktif</span>
      </td>
      <td class="py-3 px-4 text-center">
        <div class="flex items-center justify-center gap-1.5">
          <button class="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition" onclick="editCaborModal('${c.idCabor}')">
            Edit
          </button>
          <button class="px-2 py-1 text-xs font-semibold hover:bg-red-50 text-red-600 dark:hover:bg-red-950/40 rounded-lg transition" onclick="deleteCaborAction('${c.idCabor}', '${c.namaCabor}')" title="Hapus Cabor">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddCaborModal() {
  document.getElementById('cabor-modal-id').value = '';
  document.getElementById('cabor-modal-nama').value = '';
  document.getElementById('cabor-modal-ketua').value = '';
  document.getElementById('cabor-modal-kontak').value = '';
  document.getElementById('cabor-modal-target-emas').value = '2';
  document.getElementById('cabor-modal-target-perak').value = '2';
  document.getElementById('cabor-modal-target-perunggu').value = '2';
  
  // Reset section akun
  const toggleAcc = document.getElementById('cabor-modal-toggle-account');
  if (toggleAcc) toggleAcc.checked = false;
  const accFields = document.getElementById('cabor-account-fields');
  if (accFields) accFields.classList.add('hidden');
  document.getElementById('cabor-modal-username').value = '';
  document.getElementById('cabor-modal-password').value = '';

  const titleEl = document.getElementById('cabor-modal-title');
  if (titleEl) titleEl.innerText = 'Tambah Cabang Olahraga Baru';

  const btnDel = document.getElementById('btn-delete-cabor-modal');
  if (btnDel) btnDel.classList.add('hidden');

  document.getElementById('modal-cabor').classList.remove('hidden');
}

function editCaborModal(idCabor) {
  const cabor = AppState.caborList.find(c => c.idCabor === idCabor);
  if (!cabor) {
    showToast('Data cabor tidak ditemukan.', 'error');
    return;
  }

  document.getElementById('cabor-modal-id').value = cabor.idCabor;
  document.getElementById('cabor-modal-nama').value = cabor.namaCabor;
  document.getElementById('cabor-modal-ketua').value = cabor.ketuaCabor || '';
  document.getElementById('cabor-modal-kontak').value = cabor.nomorKontak || '';
  document.getElementById('cabor-modal-target-emas').value = cabor.targetEmas || 0;
  document.getElementById('cabor-modal-target-perak').value = cabor.targetPerak || 0;
  document.getElementById('cabor-modal-target-perunggu').value = cabor.targetPerunggu || 0;

  // Reset section akun
  const toggleAcc = document.getElementById('cabor-modal-toggle-account');
  if (toggleAcc) toggleAcc.checked = false;
  const accFields = document.getElementById('cabor-account-fields');
  if (accFields) accFields.classList.add('hidden');
  document.getElementById('cabor-modal-username').value = 'cabor_' + cabor.namaCabor.toLowerCase().replace(/[^a-z0-9]/g, '');
  document.getElementById('cabor-modal-password').value = '';

  const titleEl = document.getElementById('cabor-modal-title');
  if (titleEl) titleEl.innerText = 'Edit Cabang Olahraga: ' + cabor.namaCabor;

  const btnDel = document.getElementById('btn-delete-cabor-modal');
  if (btnDel) btnDel.classList.remove('hidden');

  document.getElementById('modal-cabor').classList.remove('hidden');
}

function toggleAccountSection() {
  const toggleAcc = document.getElementById('cabor-modal-toggle-account');
  const accFields = document.getElementById('cabor-account-fields');
  if (toggleAcc && accFields) {
    if (toggleAcc.checked) {
      accFields.classList.remove('hidden');
    } else {
      accFields.classList.add('hidden');
    }
  }
}

function closeCaborModal() {
  document.getElementById('modal-cabor').classList.add('hidden');
}

async function deleteCurrentCaborFromModal() {
  const idCabor = document.getElementById('cabor-modal-id').value.trim();
  const nama = document.getElementById('cabor-modal-nama').value.trim();
  if (!idCabor) return;
  closeCaborModal();
  await deleteCaborAction(idCabor, nama);
}

async function deleteCaborAction(idCabor, namaCabor) {
  if (!confirm(`Apakah Anda yakin ingin menghapus Cabang Olahraga "${namaCabor}"?\n\nPerhatian: Data atlet, target medali, dan akun login cabor ini akan dihapus dari sistem.`)) {
    return;
  }

  showToast(`Menghapus cabor ${namaCabor}...`, 'info');
  const res = await apiCall('deleteCabor', { idCabor: idCabor }, true);

  if (res && res.success) {
    showToast(res.message || 'Cabang Olahraga berhasil dihapus!', 'success');
    await loadMasterCabor();
    await loadPublicLanding();
  } else {
    showToast((res && res.message) ? res.message : 'Gagal menghapus cabor.', 'error');
  }
}

async function submitCaborForm(e) {
  if (e) e.preventDefault();
  const idCabor = document.getElementById('cabor-modal-id').value.trim();
  const nama = document.getElementById('cabor-modal-nama').value.trim();
  const ketua = document.getElementById('cabor-modal-ketua').value.trim();
  const kontak = document.getElementById('cabor-modal-kontak').value.trim();
  const emas = Number(document.getElementById('cabor-modal-target-emas').value) || 0;
  const perak = Number(document.getElementById('cabor-modal-target-perak').value) || 0;
  const perunggu = Number(document.getElementById('cabor-modal-target-perunggu').value) || 0;

  if (!nama) {
    showToast('Nama cabang olahraga wajib diisi!', 'error');
    return;
  }
  if (!ketua) {
    showToast('Penanggung jawab / ketua cabor wajib diisi!', 'warning');
    return;
  }

  const toggleAcc = document.getElementById('cabor-modal-toggle-account');
  const isResetAccount = toggleAcc ? toggleAcc.checked : false;
  const username = document.getElementById('cabor-modal-username')?.value.trim();
  const password = document.getElementById('cabor-modal-password')?.value.trim();

  if (isResetAccount && !password) {
    showToast('Harap masukkan password baru untuk mereset akun cabor!', 'warning');
    return;
  }

  const btnSubmit = document.getElementById('btn-submit-cabor');
  const origText = btnSubmit ? btnSubmit.innerHTML : '';
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>Menyimpan...</span>';
  }

  const payload = {
    idCabor: idCabor || undefined,
    namaCabor: nama,
    ketuaCabor: ketua,
    nomorKontak: kontak,
    targetEmas: emas,
    targetPerak: perak,
    targetPerunggu: perunggu,
    resetAccount: isResetAccount,
    accountUsername: username,
    newPassword: password
  };

  try {
    const res = await apiCall('saveCabor', payload, true);
    if (res && res.success) {
      showToast(res.message, 'success');
      closeCaborModal();
      await loadMasterCabor();
      await loadPublicLanding();
    } else {
      showToast((res && res.message) ? res.message : 'Gagal menyimpan cabor.', 'error');
    }
  } catch (err) {
    showToast('Terjadi kendala: ' + err.message, 'error');
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = origText;
    }
  }
}

// =========================================================================
// 9. PUSAT KEABSAHAN & VERIFIKASI BERKAS (SPLIT-VIEW)
// =========================================================================
async function loadVerificationCenter() {
  // Muat opsi dropdown filter Cabor
  const resCabor = await apiCall('getPublicLandingData');
  const selCabor = document.getElementById('verif-filter-cabor');
  if (selCabor && resCabor.success) {
    const list = resCabor.data.caborStandings || [];
    selCabor.innerHTML = '<option value="">Semua Cabang Olahraga</option>' +
      list.map(c => `<option value="${c.idCabor}">${c.namaCabor}</option>`).join('');
  }

  await filterVerificationQueue();
}

async function filterVerificationQueue() {
  const caborId = document.getElementById('verif-filter-cabor')?.value || '';
  const status = document.getElementById('verif-filter-status')?.value || '';
  const search = document.getElementById('verif-search-input')?.value.toLowerCase().trim() || '';

  const res = await apiCall('getAthletesList', { caborId: caborId, status: status });
  let list = res.data || [];

  if (search) {
    list = list.filter(a => a.namaLengkap.toLowerCase().includes(search) || a.nik.includes(search));
  }

  AppState.athletes = list;
  renderVerificationQueueList(list);

  // Otomatis pilih item pertama jika ada
  if (list.length > 0) {
    selectAthleteForVerification(list[0]);
  } else {
    clearVerificationInspectionPanel();
  }
}

function renderVerificationQueueList(list) {
  const container = document.getElementById('verif-queue-list');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div class="p-8 text-center text-slate-500 text-sm">Tidak ada atlet yang cocok dengan filter.</div>';
    return;
  }

  container.innerHTML = list.map(a => {
    let badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    if (a.statusVerifikasi === 'DITERIMA') badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    if (a.statusVerifikasi === 'DITOLAK') badgeClass = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';

    const isSelected = AppState.selectedAthleteForReview && AppState.selectedAthleteForReview.idAtlet === a.idAtlet;

    return `
      <div onclick="selectAthleteForVerificationById('${a.idAtlet}')"
           class="p-3.5 border-b border-border-light dark:border-border-dark cursor-pointer transition ${isSelected ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h5 class="font-bold text-slate-900 dark:text-white text-sm">${a.namaLengkap}</h5>
            <p class="text-xs font-mono text-slate-500">${a.nik}</p>
          </div>
          <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${badgeClass}">
            ${a.statusVerifikasi}
          </span>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>${a.namaCabor}</span>
          <span class="text-slate-400 text-[11px]">${a.kelasTanding}</span>
        </div>
      </div>
    `;
  }).join('');
}

function selectAthleteForVerificationById(idAtlet) {
  const a = AppState.athletes.find(x => x.idAtlet === idAtlet);
  if (a) selectAthleteForVerification(a);
}

function selectAthleteForVerification(a) {
  AppState.selectedAthleteForReview = a;
  AppState.docZoom = 1;

  // Highlight di daftar antrean
  renderVerificationQueueList(AppState.athletes);

  // Render detail di Panel Kanan
  const elName = document.getElementById('verif-inspect-name');
  const elNik = document.getElementById('verif-inspect-nik');
  const elCabor = document.getElementById('verif-inspect-cabor');
  const elKelas = document.getElementById('verif-inspect-kelas');
  const elTtl = document.getElementById('verif-inspect-ttl');
  const elAlamat = document.getElementById('verif-inspect-alamat');
  const elCatatan = document.getElementById('verif-decision-notes');

  if (elName) elName.innerText = a.namaLengkap;
  if (elNik) elNik.innerText = a.nik;
  if (elCabor) elCabor.innerText = a.namaCabor;
  if (elKelas) elKelas.innerText = a.kelasTanding || '-';
  if (elTtl) elTtl.innerText = `${a.tempatLahir || '-'}, ${a.tglLahir || '-'}`;
  if (elAlamat) elAlamat.innerText = a.alamat || '-';
  if (elCatatan) elCatatan.value = a.catatanVerifikasi || '';

  // Render Pratinjau Dokumen
  renderActiveDocumentPreview();
}

function switchDocTab(tabName) {
  AppState.selectedDocTab = tabName;
  AppState.docZoom = 1;

  document.querySelectorAll('.doc-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('bg-white', 'dark:bg-slate-800', 'text-primary', 'shadow-xs', 'font-bold');
      btn.classList.remove('text-slate-600', 'dark:text-slate-400');
    } else {
      btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-primary', 'shadow-xs', 'font-bold');
      btn.classList.add('text-slate-600', 'dark:text-slate-400');
    }
  });

  renderActiveDocumentPreview();
}

function renderActiveDocumentPreview() {
  const a = AppState.selectedAthleteForReview;
  const container = document.getElementById('verif-document-canvas');
  if (!a || !container) return;

  const targetType = AppState.selectedDocTab === 'foto' ? 'FOTO_3X4' : AppState.selectedDocTab === 'ktp' ? 'KTP' : 'DOKUMEN_PENDUKUNG';
  const fileObj = (a.berkas || []).find(b => b.jenis === targetType);

  if (!fileObj || !fileObj.viewUrl) {
    container.innerHTML = `
      <div class="h-80 flex flex-col items-center justify-center text-slate-400">
        <span class="material-symbols-outlined text-5xl mb-2">image_not_supported</span>
        <p class="text-sm font-medium">Berkas ${AppState.selectedDocTab.toUpperCase()} belum diunggah oleh cabor.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="w-full h-96 flex items-center justify-center overflow-auto p-4">
      <img id="verif-preview-img" src="${fileObj.viewUrl}"
           alt="${fileObj.namaFile}"
           style="transform: scale(${AppState.docZoom});"
           class="max-h-full max-w-full object-contain rounded-lg shadow-md transition-transform duration-200" />
    </div>
  `;
}

function zoomDoc(delta) {
  AppState.docZoom = Math.max(0.5, Math.min(3, AppState.docZoom + delta));
  const img = document.getElementById('verif-preview-img');
  if (img) img.style.transform = `scale(${AppState.docZoom})`;
}

async function submitVerificationDecision(keputusan) {
  const a = AppState.selectedAthleteForReview;
  if (!a) return;

  const catatan = document.getElementById('verif-decision-notes')?.value.trim() || '';
  if (keputusan === 'DITOLAK' && !catatan) {
    showToast('Wajib memberikan catatan perbaikan jika berkas ditolak!', 'warning');
    return;
  }

  const payload = {
    idAtlet: a.idAtlet,
    keputusan: keputusan,
    catatan: catatan
  };

  const res = await apiCall('verifyAthleteDocument', payload, true);
  if (res.success) {
    showToast(res.message, keputusan === 'DITERIMA' ? 'success' : 'warning');
    a.statusVerifikasi = keputusan;
    a.catatanVerifikasi = catatan;
    renderVerificationQueueList(AppState.athletes);
  } else {
    showToast(res.message, 'error');
  }
}

function clearVerificationInspectionPanel() {
  const elName = document.getElementById('verif-inspect-name');
  if (elName) elName.innerText = 'Pilih Atlet';
  const canvas = document.getElementById('verif-document-canvas');
  if (canvas) canvas.innerHTML = '<div class="h-80 flex items-center justify-center text-slate-400">Pilih salah satu atlet dari antrean di sebelah kiri.</div>';
}

function openDirectReview(idAtlet) {
  navigateTo('verifikasi-berkas');
  setTimeout(() => {
    selectAthleteForVerificationById(idAtlet);
  }, 200);
}

// =========================================================================
// 10. KLASEMEN MEDALI & LIVE MATCH ENTRY
// =========================================================================
async function loadMedalStandings() {
  const res = await apiCall('getPublicLandingData');
  if (!res.success) return;
  const list = res.data.caborStandings || [];

  const container = document.getElementById('medal-standings-table-body');
  if (!container) return;

  container.innerHTML = list.map((c, i) => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-border-light dark:border-border-dark transition">
      <td class="py-3 px-4 text-center font-bold text-slate-500">#${i + 1}</td>
      <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${c.namaCabor}</td>
      <td class="py-3 px-4 text-center text-xs font-semibold text-slate-500">${c.targetEmas}E • ${c.targetPerak}P • ${c.targetPerunggu}B</td>
      <td class="py-3 px-4 text-center font-bold text-amber-600 bg-amber-50/50 dark:bg-amber-950/20">${c.realEmas}</td>
      <td class="py-3 px-4 text-center font-bold text-slate-400">${c.realPerak}</td>
      <td class="py-3 px-4 text-center font-bold text-amber-800">${c.realPerunggu}</td>
      <td class="py-3 px-4 text-center font-black text-primary text-base">${c.totalMedali}</td>
      <td class="py-3 px-4 text-center">
        <button class="px-2.5 py-1 text-xs font-bold bg-primary text-white hover:bg-crimson-dark rounded-lg transition" onclick="openRecordMedalModal('${c.idCabor}')">
          + Medali
        </button>
      </td>
    </tr>
  `).join('');
}

function openRecordMedalModal(caborId) {
  const selCabor = document.getElementById('medal-modal-cabor');
  if (selCabor) {
    selCabor.innerHTML = AppState.caborList.map(c => `
      <option value="${c.idCabor}" ${c.idCabor === caborId ? 'selected' : ''}>${c.namaCabor}</option>
    `).join('');
  }
  document.getElementById('modal-record-medal').classList.remove('hidden');
}

function closeRecordMedalModal() {
  document.getElementById('modal-record-medal').classList.add('hidden');
}

async function submitRecordMedal(e) {
  if (e) e.preventDefault();
  const caborId = document.getElementById('medal-modal-cabor').value;
  const nomorKelas = document.getElementById('medal-modal-kelas').value.trim();
  const kategori = document.querySelector('input[name="kategori_medali"]:checked')?.value || 'EMAS';

  if (!nomorKelas) {
    showToast('Nomor / kelas pertandingan wajib diisi!', 'warning');
    return;
  }

  const res = await apiCall('recordMedal', {
    idCabor: caborId,
    nomorKelas: nomorKelas,
    kategori: kategori
  }, true);

  if (res.success) {
    showToast(res.message, 'success');
    closeRecordMedalModal();
    loadMedalStandings();
  } else {
    showToast(res.message, 'error');
  }
}

// =========================================================================
// 11. CABOR PORTAL & PENDAFTARAN ATLET (ADMIN CABOR)
// =========================================================================
async function loadCaborPortal() {
  if (!AppState.currentUser) {
    navigateTo('public-landing');
    return;
  }

  const caborId = AppState.currentUser.caborId || 'CAB_DAYUNG';
  const res = await apiCall('getAthletesList', { caborId: caborId });
  const athletes = res.data || [];

  // Hitung Metrik Cabor
  const total = athletes.length;
  const verified = athletes.filter(a => a.statusVerifikasi === 'DITERIMA').length;
  const pending = athletes.filter(a => a.statusVerifikasi === 'PENDING').length;
  const rejected = athletes.filter(a => a.statusVerifikasi === 'DITOLAK').length;

  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
  setTxt('cabor-portal-total-atlet', total);
  setTxt('cabor-portal-verified', verified);
  setTxt('cabor-portal-pending', pending);
  setTxt('cabor-portal-rejected', rejected);

  // Tampilkan Kartu Peringatan Darurat jika ada berkas ditolak
  const alertCard = document.getElementById('cabor-urgent-rejected-card');
  if (alertCard) {
    if (rejected > 0) {
      alertCard.classList.remove('hidden');
      const rejectItem = athletes.find(a => a.statusVerifikasi === 'DITOLAK');
      document.getElementById('cabor-urgent-rejected-msg').innerText =
        `Perhatian: Berkas atlet "${rejectItem.namaLengkap}" ditolak: "${rejectItem.catatanVerifikasi}". Silakan unggah ulang berkas perbaikan!`;
    } else {
      alertCard.classList.add('hidden');
    }
  }

  // Render Tabel Atlet Cabor
  const tbody = document.getElementById('cabor-athletes-table-body');
  if (tbody) {
    tbody.innerHTML = athletes.map((a, i) => {
      let bClass = 'bg-amber-100 text-amber-800';
      if (a.statusVerifikasi === 'DITERIMA') bClass = 'bg-emerald-100 text-emerald-800';
      if (a.statusVerifikasi === 'DITOLAK') bClass = 'bg-red-100 text-red-800';

      return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-border-light dark:border-border-dark transition">
          <td class="py-3 px-4 text-center font-bold text-slate-500">${i + 1}</td>
          <td class="py-3 px-4">
            <span class="font-bold text-slate-900 dark:text-white block">${a.namaLengkap}</span>
            <span class="text-xs font-mono text-slate-500">${a.nik}</span>
          </td>
          <td class="py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">${a.kelasTanding}</td>
          <td class="py-3 px-4 text-center">
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${bClass}">
              ${a.statusVerifikasi}
            </span>
          </td>
          <td class="py-3 px-4 text-xs text-red-600 dark:text-red-400 italic">
            ${a.catatanVerifikasi || '-'}
          </td>
        </tr>
      `;
    }).join('');
  }
}

function openAthleteDrawer() {
  document.getElementById('reg-nik').value = '';
  document.getElementById('reg-nama').value = '';
  document.getElementById('reg-tempat-lahir').value = '';
  document.getElementById('reg-tgl-lahir').value = '';
  document.getElementById('reg-kelas-tanding').value = '';
  document.getElementById('reg-alamat').value = '';
  document.getElementById('reg-hp').value = '';
  document.getElementById('drawer-athlete-registration').classList.remove('hidden');
}

function closeAthleteDrawer() {
  document.getElementById('drawer-athlete-registration').classList.add('hidden');
}

// Client-Side Canvas Image Compression (gas-pro-api & gas-scale-turbo)
function compressImage(file, maxWidth = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(elem.toDataURL('image/jpeg', quality));
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
}

async function submitAthleteRegistration(e) {
  if (e) e.preventDefault();
  const nik = document.getElementById('reg-nik').value.replace(/\D/g, '');
  const nama = document.getElementById('reg-nama').value.trim();
  const tempat = document.getElementById('reg-tempat-lahir').value.trim();
  const tgl = document.getElementById('reg-tgl-lahir').value;
  const jk = document.querySelector('input[name="reg_jk"]:checked')?.value || 'L';
  const kelas = document.getElementById('reg-kelas-tanding').value.trim();
  const alamat = document.getElementById('reg-alamat').value.trim();
  const hp = document.getElementById('reg-hp').value.trim();

  if (nik.length !== 16) {
    showToast('NIK harus berupa 16 digit angka valid!', 'warning');
    return;
  }
  if (!nama || !kelas) {
    showToast('Nama dan kelas/nomor pertandingan wajib diisi!', 'warning');
    return;
  }

  // Proses Unggah Berkas Gambar jika dipilih
  const fileFoto = document.getElementById('reg-file-foto')?.files[0];
  const fileKtp = document.getElementById('reg-file-ktp')?.files[0];
  const berkasArray = [];

  showToast('Memproses pendaftaran & kompresi berkas...', 'info');

  try {
    if (fileFoto) {
      const b64Foto = await compressImage(fileFoto, 600, 0.8);
      berkasArray.push({
        jenis: 'FOTO_3X4',
        viewUrl: b64Foto,
        namaFile: fileFoto.name
      });
    }
    if (fileKtp) {
      const b64Ktp = await compressImage(fileKtp, 1000, 0.75);
      berkasArray.push({
        jenis: 'KTP',
        viewUrl: b64Ktp,
        namaFile: fileKtp.name
      });
    }
  } catch (err) {
    console.warn('Gagal kompresi gambar, melanjutkan tanpa berkas:', err);
  }

  const caborId = AppState.currentUser ? AppState.currentUser.caborId : 'CAB_DAYUNG';

  const res = await apiCall('registerAthlete', {
    idCabor: caborId,
    nik: nik,
    namaLengkap: nama,
    tempatLahir: tempat,
    tglLahir: tgl,
    jenisKelamin: jk,
    kelasTanding: kelas,
    alamat: alamat,
    noHp: hp,
    berkas: berkasArray
  }, true);

  if (res.success) {
    showToast(res.message, 'success');
    closeAthleteDrawer();
    loadCaborPortal();
  } else {
    showToast(res.message, 'error');
  }
}

// =========================================================================
// 12. DOKUMEN NOMINATIF RESMI & EXPORTER (PDF & EXCEL)
// =========================================================================
async function renderPrintView() {
  const res = await apiCall('getAthletesList', {});
  const athletes = res.data || [];
  const validAthletes = athletes.filter(a => a.statusVerifikasi === 'DITERIMA');

  const container = document.getElementById('print-roster-body');
  if (!container) return;

  container.innerHTML = validAthletes.map((a, i) => `
    <tr>
      <td class="text-center font-bold">${i + 1}</td>
      <td class="font-bold">${a.namaLengkap}</td>
      <td class="font-mono text-xs">${a.nik}</td>
      <td>${a.namaCabor}</td>
      <td>${a.kelasTanding}</td>
      <td class="text-center">${a.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</td>
      <td class="text-center font-bold text-emerald-700">LOLOS VERIFIKASI</td>
    </tr>
  `).join('');
}

function exportToExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('Pustaka SheetJS belum dimuat. Periksa koneksi internet.', 'error');
    return;
  }

  const athletes = AppState.athletes.length > 0 ? AppState.athletes : (SEED_DATA.athletes || []);
  const exportData = athletes.map((a, i) => ({
    'No': i + 1,
    'Nama Atlet': a.namaLengkap,
    'NIK': a.nik,
    'Cabang Olahraga': a.namaCabor,
    'Nomor/Kelas Tanding': a.kelasTanding,
    'Tempat Lahir': a.tempatLahir,
    'Tanggal Lahir': a.tglLahir,
    'Jenis Kelamin': a.jenisKelamin,
    'Status Keabsahan': a.statusVerifikasi,
    'Catatan Verifikasi': a.catatanVerifikasi || ''
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kontingen_KONI_Konut');
  XLSX.writeFile(wb, 'KONTINGEN_KONI_KONAWE_UTARA_PORPROV_2026.xlsx');
  showToast('File Excel berhasil diekspor!', 'success');
}

function printOfficialDocument() {
  window.print();
}

// =========================================================================
// 13. PENGATURAN SISTEM & PERSONALISASI BRANDING
// =========================================================================
async function loadSystemSettings() {
  const res = await apiCall('getPublicLandingData');
  if (!res.success) return;
  const s = res.data.settings;

  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  setVal('set-nama-aplikasi', s.namaAplikasi);
  setVal('set-sub-judul', s.subJudul);
  setVal('set-ketua-koni', s.ketuaKoni);
  setVal('set-kontak-bantuan', s.kontakBantuan);
  setVal('set-logo-koni', s.logoKoniUrl);
  setVal('set-logo-konut', s.logoKonutUrl);
}

async function submitSystemSettings(e) {
  if (e) e.preventDefault();
  const payload = {
    NAMA_APLIKASI: document.getElementById('set-nama-aplikasi')?.value.trim(),
    SUB_JUDUL: document.getElementById('set-sub-judul')?.value.trim(),
    KETUA_KONI: document.getElementById('set-ketua-koni')?.value.trim(),
    KONTAK_BANTUAN: document.getElementById('set-kontak-bantuan')?.value.trim(),
    LOGO_KONI_URL: document.getElementById('set-logo-koni')?.value.trim(),
    LOGO_KONUT_URL: document.getElementById('set-logo-konut')?.value.trim()
  };

  const res = await apiCall('updateSystemSettings', payload, true);
  if (res.success) {
    showToast('Pengaturan branding sistem berhasil disimpan!', 'success');
    loadPublicLanding();
  } else {
    showToast(res.message, 'error');
  }
}

// =========================================================================
// 14. AUTHENTICATION & LOGIN/LOGOUT
// =========================================================================
function openLoginModal() {
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('modal-login').classList.remove('hidden');
}

function closeLoginModal() {
  document.getElementById('modal-login').classList.add('hidden');
}

async function handleLoginSubmit(e) {
  if (e) e.preventDefault();
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value.trim();

  if (!u || !p) {
    showToast('Username dan password wajib diisi!', 'warning');
    return;
  }

  const btnSubmit = e && e.target ? e.target.querySelector('button[type="submit"]') : null;
  const originalText = btnSubmit ? btnSubmit.innerHTML : '';
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>Memverifikasi kredensial...</span>';
  }

  showToast('Memverifikasi kredensial...', 'info');

  try {
    const res = await apiCall('login', { username: u, password: p }, true);

    if (res && res.success) {
      AppState.currentUser = Object.assign(res.user, { token: res.token });
      localStorage.setItem('koni_session_user', JSON.stringify(AppState.currentUser));
      updateAuthUI();
      closeLoginModal();
      showToast('Selamat datang, ' + (res.user.nama || res.user.username) + '!', 'success');

      // Arahkan ke dashboard sesuai role
      if (res.user.role === 'ADMIN_INDUK') {
        navigateTo('dashboard-induk');
      } else {
        navigateTo('portal-cabor');
      }
    } else {
      showToast((res && res.message) ? res.message : 'Username atau password salah!', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Terjadi kendala saat login: ' + err.message, 'error');
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
  }
}

function handleLogout() {
  AppState.currentUser = null;
  localStorage.removeItem('koni_session_user');
  updateAuthUI();
  showToast('Anda telah keluar dari sistem.', 'info');
  navigateTo('public-landing');
}

function updateAuthUI() {
  const isLogged = !!AppState.currentUser;
  const user = AppState.currentUser;

  const btnLogin = document.getElementById('btn-open-login');
  const userProfileChip = document.getElementById('user-profile-chip');
  const userNameEl = document.getElementById('user-profile-name');
  const userRoleEl = document.getElementById('user-profile-role');

  if (isLogged) {
    if (btnLogin) btnLogin.classList.add('hidden');
    if (userProfileChip) userProfileChip.classList.remove('hidden');
    if (userNameEl) userNameEl.innerText = user.nama;
    if (userRoleEl) userRoleEl.innerText = user.role === 'ADMIN_INDUK' ? 'Admin Induk KONI' : 'Admin Cabor';

    // Tampilkan menu sidebar sesuai role
    document.querySelectorAll('.admin-induk-only').forEach(el => {
      if (user.role === 'ADMIN_INDUK') el.classList.remove('hidden');
      else el.classList.add('hidden');
    });
    document.querySelectorAll('.admin-cabor-only').forEach(el => {
      if (user.role === 'ADMIN_CABOR') el.classList.remove('hidden');
      else el.classList.add('hidden');
    });
  } else {
    if (btnLogin) btnLogin.classList.remove('hidden');
    if (userProfileChip) userProfileChip.classList.add('hidden');
    document.querySelectorAll('.admin-induk-only').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-cabor-only').forEach(el => el.classList.add('hidden'));
  }
}

// =========================================================================
// 15. TOAST NOTIFICATIONS & UTILITY
// =========================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  let bgClass = 'bg-slate-900 text-white';
  let icon = 'info';

  if (type === 'success') { bgClass = 'bg-emerald-600 text-white'; icon = 'check_circle'; }
  else if (type === 'error') { bgClass = 'bg-red-600 text-white'; icon = 'error'; }
  else if (type === 'warning') { bgClass = 'bg-amber-600 text-white'; icon = 'warning'; }

  toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg ${bgClass} text-sm font-semibold transition-all duration-300 transform translate-y-2 opacity-0`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-lg">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Quick Autofill Demo Credentials
function autofillDemo(role) {
  if (role === 'admin') {
    document.getElementById('login-username').value = 'admin_koni';
    document.getElementById('login-password').value = 'KoniKonut2026!';
  } else if (role === 'cabor') {
    document.getElementById('login-username').value = 'cabor_dayung';
    document.getElementById('login-password').value = 'dayung123';
  }
}

function setupEventListeners() {
  // Mobile drawer toggle
  const btnMenu = document.getElementById('btn-mobile-menu-toggle');
  const drawer = document.getElementById('mobile-sidebar-drawer');
  if (btnMenu && drawer) {
    btnMenu.addEventListener('click', () => {
      drawer.classList.toggle('hidden');
    });
  }
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', initApp);
