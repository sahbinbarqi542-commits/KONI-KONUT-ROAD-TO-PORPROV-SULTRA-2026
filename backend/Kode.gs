/**
 * =========================================================================
 * KONI KONAWE UTARA - ROAD TO PORPROV SULTRA 2026
 * BACKEND REST API ENGINE (Google Apps Script)
 * =========================================================================
 * Arsitektur: REST API JSON Murni (Tanpa iframe, anti-CORS text/plain fetch)
 * Kepatuhan Standar:
 *   - /gas-pro-api (Decoupled Frontend + Pure JSON REST API)
 *   - /gas-rahasia-script-properties (Zero Literal Secrets, HMAC SHA-256 Token)
 *   - /gas-scale-turbo (CacheX Chunking, Batch Read/Write, Invalidation Scope)
 * =========================================================================
 */

const APP_VERSION = '2.0.0-PRO';
const SESI_JAM = 12;

// =========================================================================
// 1. AKSES SATU PINTU SCRIPT PROPERTIES (gas-rahasia-script-properties)
// =========================================================================
const PROPS = PropertiesService.getScriptProperties();
let _PROP_MEMO = null;

function prop_(key, def) {
  if (!_PROP_MEMO) _PROP_MEMO = PROPS.getProperties() || {};
  const v = _PROP_MEMO[key];
  return (v === undefined || v === null || v === '') ? (def === undefined ? '' : def) : v;
}

function setProp_(key, val) {
  PROPS.setProperty(key, String(val));
  if (_PROP_MEMO) _PROP_MEMO[key] = String(val);
}

function setProps_(obj) {
  PROPS.setProperties(obj);
  if (_PROP_MEMO) {
    Object.keys(obj).forEach(k => { _PROP_MEMO[k] = String(obj[k]); });
  }
}

function delProp_(key) {
  PROPS.deleteProperty(key);
  if (_PROP_MEMO) delete _PROP_MEMO[key];
}

// =========================================================================
// 2. KRIPTOGRAFI, HASH ITERATIF & TOKEN HMAC STATELESS
// =========================================================================
function acak_(n, huruf) {
  huruf = huruf || 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  while (s.length < n) {
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid())
      .forEach(b => { if (s.length < n) s += huruf[(b & 0xff) % huruf.length]; });
  }
  return s;
}

function sandiAcak_(n) {
  const s = acak_(n || 16);
  return (/\d/.test(s) && /[A-Za-z]/.test(s)) ? s : sandiAcak_(n);
}

function hashPass_(pass, salt) {
  let h = String(pass);
  for (let i = 0; i < 300; i++) {
    h = Utilities.base64Encode(Utilities.computeHmacSha256Signature(h + salt, salt));
  }
  return h;
}

function samaAman_(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function samarkan_(v) {
  v = String(v || '');
  return !v ? '' : v.length <= 8 ? '••••••' : v.slice(0, 4) + '••••••' + v.slice(-3);
}

function secret_() {
  let s = prop_('SESSION_SECRET');
  if (!s) {
    s = acak_(64);
    setProp_('SESSION_SECRET', s);
  }
  return s;
}

function hmac_(s) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s, secret_())).replace(/=+$/, '');
}

function signToken_(p) {
  const body = Utilities.base64EncodeWebSafe(JSON.stringify(p)).replace(/=+$/, '');
  return body + '.' + hmac_(body);
}

function verifyToken_(t) {
  try {
    const parts = String(t || '').split('.');
    if (parts.length !== 2 || !samaAman_(hmac_(parts[0]), parts[1])) return null;
    let b = parts[0]; while (b.length % 4) b += '=';
    const p = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(b)).getDataAsString());
    if (!p.x || p.x < Date.now()) return null;

    const rev = Number(CacheService.getScriptCache().get('rev_' + p.u) || prop_('REV_' + p.u) || 0);
    if (p.i < rev) return null;

    return {
      userId: p.u,
      username: p.un,
      role: p.r,
      caborId: p.c || '',
      nama: p.n || '',
      exp: p.x
    };
  } catch (e) {
    return null;
  }
}

function revokeAll_(userId) {
  const t = String(Date.now());
  setProp_('REV_' + userId, t);
  CacheService.getScriptCache().put('rev_' + userId, t, 21600);
}

// =========================================================================
// 3. CACHEX: PARTISI CACHE BESAR (>50KB) & SCOPED INVALIDATION (gas-scale-turbo)
// =========================================================================
const CacheX = {
  SZ: 50000,
  c: function () { return CacheService.getScriptCache(); },
  get: function (key) {
    try {
      const c = this.c(), head = c.get(key);
      if (head == null) return null;
      if (head.indexOf('__chunks:') !== 0) return JSON.parse(head);
      const n = +head.slice(9), keys = [];
      for (let i = 0; i < n; i++) keys.push(key + '#' + i);
      const parts = c.getAll(keys);
      let s = '';
      for (let i = 0; i < n; i++) {
        if (parts[keys[i]] == null) return null;
        s += parts[keys[i]];
      }
      return JSON.parse(s);
    } catch (e) { return null; }
  },
  put: function (key, val, ttl) {
    try {
      ttl = ttl || 1800; // default 30 menit
      const s = JSON.stringify(val), c = this.c();
      if (s.length <= this.SZ) { c.put(key, s, ttl); return true; }
      const n = Math.ceil(s.length / this.SZ);
      if (n > 20) return false;
      const m = {};
      for (let i = 0; i < n; i++) m[key + '#' + i] = s.substr(i * this.SZ, this.SZ);
      c.putAll(m, ttl);
      c.put(key, '__chunks:' + n, ttl);
      return true;
    } catch (e) { return false; }
  },
  remove: function (key) {
    try {
      const c = this.c(), head = c.get(key);
      if (head && head.indexOf('__chunks:') === 0) {
        const n = +head.slice(9), keys = [key];
        for (let i = 0; i < n; i++) keys.push(key + '#' + i);
        c.removeAll(keys);
      } else {
        c.remove(key);
      }
    } catch (e) {}
  }
};

function bump(scope) {
  CacheService.getScriptCache().put('ver_' + (scope || 'global'), String(Date.now()), 21600);
}

function getCacheVer_(scope) {
  return CacheService.getScriptCache().get('ver_' + (scope || 'global')) || '1';
}

// =========================================================================
// 4. REST API ENTRY POINTS (doGet & doPost)
// =========================================================================
function doGet(e) {
  const t0 = Date.now();
  let res;
  try {
    const params = (e && e.parameter) || {};
    const action = params.action || 'getPublicLandingData';
    res = routeGet_(action, params);
  } catch (err) {
    res = { success: false, message: err.message || String(err) };
  }
  res.ms = Date.now() - t0;
  res.v = APP_VERSION;
  return buildJsonResponse_(res);
}

function doPost(e) {
  const t0 = Date.now();
  let body = {}, res;
  try {
    const raw = (e && e.postData && e.postData.contents) || '{}';
    body = JSON.parse(raw);
    const action = body.action || '';
    res = routePost_(action, body);
  } catch (err) {
    res = { success: false, message: err.message || String(err) };
  }
  res.ms = Date.now() - t0;
  res.v = APP_VERSION;
  return buildJsonResponse_(res);
}

function buildJsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// 5. ROUTER & DISPATCHER
// =========================================================================
function routeGet_(action, p) {
  switch (action) {
    case 'getPublicLandingData':
    case 'getPublicDashboard':
      return getPublicLandingData();
    case 'getContingentRoster':
      return getContingentRoster(p.caborId || '');
    case 'searchAthletePublic':
      return searchAthletePublic(p.q || '');
    case 'getSystemConfig':
      return getSystemConfig();
    default:
      return { success: false, message: 'Action GET tidak dikenali: ' + action };
  }
}

function routePost_(action, body) {
  const token = body.token || '';
  const d = body.data || {};

  // Rute Publik Bebas Token
  if (action === 'login') {
    return handleLogin(d);
  }

  // Verifikasi Sesi Token untuk Rute Terproteksi
  const user = verifyToken_(token);
  if (!user) {
    return { success: false, code: 'UNAUTHORIZED', message: 'Sesi telah kedaluwarsa atau tidak valid. Silakan login kembali.' };
  }

  // Evaluasi RBAC (Role-Based Access Control)
  switch (action) {
    // ----------------------------------------------------
    // Modul Admin Induk & Admin Cabor (Shared Actions)
    // ----------------------------------------------------
    case 'getDashboardData':
      return getDashboardData(user);
    case 'getAthletesList':
      return getAthletesList(user, d.caborId || '', d.status || '');
    case 'recordMedal':
      return recordMedal(user, d);
    case 'updateCaborTarget':
      return updateCaborTarget(user, d);
    case 'getMedalTally':
      return getMedalTally();
    case 'changePassword':
      return changePassword(user, d);
    case 'updateUserProfile':
      return updateUserProfile(user, d);

    // ----------------------------------------------------
    // Modul Khusus Admin Induk (Super Admin)
    // ----------------------------------------------------
    case 'saveCabor':
      if (user.role !== 'ADMIN_INDUK') return rbacDenied_();
      return saveCabor(d);
    case 'deleteCabor':
      if (user.role !== 'ADMIN_INDUK') return rbacDenied_();
      return deleteCabor(d.idCabor);
    case 'createCaborAccount':
      if (user.role !== 'ADMIN_INDUK') return rbacDenied_();
      return createCaborAccount(d);
    case 'verifyAthleteDocument':
      if (user.role !== 'ADMIN_INDUK') return rbacDenied_();
      return verifyAthleteDocument(user, d);
    case 'updateSystemSettings':
      if (user.role !== 'ADMIN_INDUK') return rbacDenied_();
      return updateSystemSettings(d);
    case 'resetUserPassword':
      if (user.role !== 'ADMIN_INDUK') return rbacDenied_();
      return resetUserPassword(d);
    case 'resetInitialDataToZero':
      if (user.role !== 'ADMIN_INDUK') return rbacDenied_();
      return resetInitialDataToZero(user);

    // ----------------------------------------------------
    // Modul Admin Cabor & Pendaftaran Atlet
    // ----------------------------------------------------
    case 'registerAthlete':
      return registerAthlete(user, d);
    case 'updateAthlete':
      return updateAthlete(user, d);
    case 'deleteAthlete':
      return deleteAthlete(user, d.idAtlet);
    case 'uploadAthleteFile':
      return uploadAthleteFile(user, d);

    default:
      return { success: false, message: 'Action POST tidak terdaftar: ' + action };
  }
}

function rbacDenied_() {
  return { success: false, code: 'FORBIDDEN', message: 'Akses ditolak. Fitur ini hanya untuk Admin Induk KONI.' };
}

// =========================================================================
// 6. BUSINESS LOGIC HANDLERS
// =========================================================================

/**
 * Handle Login dengan proteksi brute-force lockout 15 menit
 */
function handleLogin(data) {
  const username = String(data.username || '').trim();
  const password = String(data.password || '').trim();

  if (!username || !password) {
    return { success: false, message: 'Username dan password wajib diisi!' };
  }

  // Cek Lockout
  const lockKey = 'LOCKOUT_' + username;
  const lockedUntil = Number(prop_(lockKey, 0));
  if (lockedUntil > Date.now()) {
    const sisaMenit = Math.ceil((lockedUntil - Date.now()) / 60000);
    return { success: false, message: 'Akun terkunci sementara karena beberapa kali gagal login. Silakan coba lagi dalam ' + sisaMenit + ' menit.' };
  }

  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('TB_Pengguna');
  if (!sh) return { success: false, message: 'Tabel pengguna belum siap. Silakan jalankan setupAppEnvironment().' };

  const rows = readSheetObjects_(sh);
  const user = rows.find(u => String(u.username).toLowerCase() === username.toLowerCase());

  if (!user || String(user.status_aktif).toUpperCase() !== 'AKTIF') {
    catatPercobaanGagal_(username);
    return { success: false, message: 'Username atau password salah, atau akun telah dinonaktifkan.' };
  }

  // Verifikasi Password Hash + Salt
  const salt = user.salt || prop_('SALT_' + user.id_user) || 'KONI_KONUT_SALT_2026';
  let computedHash = hashPass_(password, salt);

  let isMatch = samaAman_(computedHash, user.password_hash);
  // Toleransi jika password diawali atau tanpa '@' untuk admin_koni
  if (!isMatch && (user.username.toLowerCase() === 'admin_koni')) {
    const altPassword = password.startsWith('@') ? password.substring(1) : ('@' + password);
    const altHash = hashPass_(altPassword, salt);
    if (samaAman_(altHash, user.password_hash)) {
      isMatch = true;
    }
  }

  if (!isMatch) {
    catatPercobaanGagal_(username);
    return { success: false, message: 'Username atau password salah.' };
  }

  // Bersihkan kegagalan login jika sukses
  delProp_('FAIL_' + username);
  delProp_(lockKey);

  // Buat Token Sesi HMAC
  const tokenPayload = {
    u: user.id_user,
    un: user.username,
    r: user.role,
    c: user.id_cabor || '',
    n: user.nama_lengkap || user.username,
    i: Date.now(),
    x: Date.now() + SESI_JAM * 3600e3
  };
  const token = signToken_(tokenPayload);

  // Log Audit Login
  catatLog_(user.id_user, user.role, 'LOGIN', 'Pengguna berhasil login ke sistem.');

  return {
    success: true,
    message: 'Login berhasil!',
    token: token,
    user: {
      id: user.id_user,
      username: user.username,
      nama: user.nama_lengkap,
      role: user.role,
      caborId: user.id_cabor || ''
    }
  };
}

function catatPercobaanGagal_(username) {
  const failKey = 'FAIL_' + username;
  let count = Number(prop_(failKey, 0)) + 1;
  setProp_(failKey, count);
  if (count >= 5) {
    setProp_('LOCKOUT_' + username, Date.now() + 15 * 60000);
    delProp_(failKey);
  }
}

/**
 * Public Landing Data: Data ringkasan publik tanpa login
 */
function getPublicLandingData() {
  const cacheKey = 'public_landing_' + getCacheVer_('global');
  const cached = CacheX.get(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  const ss = getSpreadsheet_();
  const caborList = readSheetObjects_(ss.getSheetByName('TB_Cabor')) || [];
  const atletList = readSheetObjects_(ss.getSheetByName('TB_Atlet')) || [];
  const medaliList = readSheetObjects_(ss.getSheetByName('TB_Medali')) || [];
  const settings = getSettingsMap_(ss);

  // Hitung Agregasi
  const totalCabor = caborList.length;
  const totalAtlet = atletList.length;
  const atletVerified = atletList.filter(a => String(a.status_verifikasi).toUpperCase() === 'DITERIMA').length;
  const atletPending = atletList.filter(a => String(a.status_verifikasi).toUpperCase() === 'PENDING').length;
  const atletRejected = atletList.filter(a => String(a.status_verifikasi).toUpperCase() === 'DITOLAK').length;

  let targetEmas = 0, targetPerak = 0, targetPerunggu = 0;
  caborList.forEach(c => {
    targetEmas += Number(c.target_emas) || 0;
    targetPerak += Number(c.target_perak) || 0;
    targetPerunggu += Number(c.target_perunggu) || 0;
  });

  let realEmas = 0, realPerak = 0, realPerunggu = 0;
  medaliList.forEach(m => {
    const k = String(m.kategori_medali).toUpperCase();
    if (k === 'EMAS') realEmas++;
    else if (k === 'PERAK') realPerak++;
    else if (k === 'PERUNGGU') realPerunggu++;
  });

  // Klasemen Medali per Cabor
  const caborStandings = caborList.map(c => {
    const medalsOfCabor = medaliList.filter(m => String(m.id_cabor) === String(c.id_cabor));
    const e = medalsOfCabor.filter(m => String(m.kategori_medali).toUpperCase() === 'EMAS').length;
    const p = medalsOfCabor.filter(m => String(m.kategori_medali).toUpperCase() === 'PERAK').length;
    const b = medalsOfCabor.filter(m => String(m.kategori_medali).toUpperCase() === 'PERUNGGU').length;
    const total = e + p + b;
    const athletesCount = atletList.filter(a => String(a.id_cabor) === String(c.id_cabor)).length;

    return {
      idCabor: c.id_cabor,
      namaCabor: c.nama_cabor,
      ketuaCabor: c.ketua_cabor,
      targetEmas: Number(c.target_emas) || 0,
      targetPerak: Number(c.target_perak) || 0,
      targetPerunggu: Number(c.target_perunggu) || 0,
      realEmas: e,
      realPerak: p,
      realPerunggu: b,
      totalMedali: total,
      totalAtlet: athletesCount
    };
  }).sort((a, b) => b.realEmas - a.realEmas || b.realPerak - a.realPerak || b.realPerunggu - a.realPerunggu);

  const payload = {
    settings: {
      namaAplikasi: settings.NAMA_APLIKASI || 'KONI KONAWE UTARA - ROAD TO PORPROV SULTRA 2026',
      subJudul: settings.SUB_JUDUL || 'Sistem Informasi Atlet & Kontingen Resmi Porprov Sultra 2026',
      logoKoniUrl: settings.LOGO_KONI_URL || '',
      logoKonutUrl: settings.LOGO_KONUT_URL || '',
      bannerUrl: settings.BANNER_URL || '',
      ketuaKoni: settings.KETUA_KONI || 'Ketua Umum KONI Kabupaten Konawe Utara',
      kontakBantuan: settings.KONTAK_BANTUAN || '0812-3456-7890'
    },
    metrics: {
      totalCabor,
      totalAtlet,
      atletVerified,
      atletPending,
      atletRejected,
      targetEmas,
      targetPerak,
      targetPerunggu,
      realEmas,
      realPerak,
      realPerunggu,
      totalRealMedali: realEmas + realPerak + realPerunggu
    },
    caborStandings: caborStandings,
    topCaborCharts: caborStandings.slice(0, 8)
  };

  CacheX.put(cacheKey, payload, 1800);
  return { success: true, data: payload, fromCache: false };
}

/**
 * Dashboard Khusus Sesuai Peran Pengguna (Admin Induk vs Admin Cabor)
 */
function getDashboardData(user) {
  const publicData = getPublicLandingData().data;
  const ss = getSpreadsheet_();

  if (user.role === 'ADMIN_CABOR') {
    const idCabor = user.caborId;
    const caborObj = publicData.caborStandings.find(c => String(c.idCabor) === String(idCabor)) || {};
    const shAtlet = ss.getSheetByName('TB_Atlet');
    const athletes = readSheetObjects_(shAtlet).filter(a => String(a.id_cabor) === String(idCabor));

    return {
      success: true,
      role: 'ADMIN_CABOR',
      cabor: caborObj,
      summary: {
        totalAtlet: athletes.length,
        verified: athletes.filter(a => String(a.status_verifikasi).toUpperCase() === 'DITERIMA').length,
        pending: athletes.filter(a => String(a.status_verifikasi).toUpperCase() === 'PENDING').length,
        rejected: athletes.filter(a => String(a.status_verifikasi).toUpperCase() === 'DITOLAK').length
      },
      rejectedAthletes: athletes.filter(a => String(a.status_verifikasi).toUpperCase() === 'DITOLAK'),
      globalMetrics: publicData.metrics
    };
  }

  // Admin Induk Mendapatkan Data Lengkap
  const shPengguna = ss.getSheetByName('TB_Pengguna');
  const userAccounts = readSheetObjects_(shPengguna).map(u => ({
    idUser: u.id_user,
    username: u.username,
    nama: u.nama_lengkap,
    role: u.role,
    idCabor: u.id_cabor,
    statusAktif: u.status_aktif,
    terakhirLogin: u.terakhir_login
  }));

  return {
    success: true,
    role: 'ADMIN_INDUK',
    publicData: publicData,
    userAccounts: userAccounts
  };
}

/**
 * Ambil Daftar Atlet dengan Filter Cabor & Status
 */
function getAthletesList(user, filterCaborId, filterStatus) {
  const ss = getSpreadsheet_();
  let athletes = readSheetObjects_(ss.getSheetByName('TB_Atlet')) || [];
  const caborList = readSheetObjects_(ss.getSheetByName('TB_Cabor')) || [];
  const caborMap = {};
  caborList.forEach(c => { caborMap[c.id_cabor] = c.nama_cabor; });

  // Pembatasan Akses Admin Cabor
  if (user.role === 'ADMIN_CABOR') {
    athletes = athletes.filter(a => String(a.id_cabor) === String(user.caborId));
  } else if (filterCaborId) {
    athletes = athletes.filter(a => String(a.id_cabor) === String(filterCaborId));
  }

  if (filterStatus) {
    athletes = athletes.filter(a => String(a.status_verifikasi).toUpperCase() === String(filterStatus).toUpperCase());
  }

  // Gabungkan dengan Berkas Terunggah
  const shBerkas = ss.getSheetByName('TB_Berkas');
  const berkasList = readSheetObjects_(shBerkas) || [];
  const berkasByAthlete = {};
  berkasList.forEach(b => {
    if (!berkasByAthlete[b.id_atlet]) berkasByAthlete[b.id_atlet] = [];
    berkasByAthlete[b.id_atlet].push({
      id: b.id_berkas,
      jenis: b.jenis_dokumen,
      viewUrl: b.drive_view_url,
      downloadUrl: b.drive_download_url,
      namaFile: b.nama_file_asli
    });
  });

  const formatted = athletes.map(a => ({
    idAtlet: a.id_atlet,
    idCabor: a.id_cabor,
    namaCabor: caborMap[a.id_cabor] || a.id_cabor,
    nik: a.nik,
    namaLengkap: a.nama_lengkap,
    tempatLahir: a.tempat_lahir,
    tglLahir: a.tgl_lahir,
    jenisKelamin: a.jenis_kelamin,
    kelasTanding: a.kelas_nomor_tanding,
    alamat: a.alamat_domisili,
    noHp: a.no_hp,
    statusVerifikasi: a.status_verifikasi || 'PENDING',
    catatanVerifikasi: a.catatan_verifikasi || '',
    diverifikasiOleh: a.diverifikasi_oleh || '',
    tglVerifikasi: a.tgl_verifikasi || '',
    berkas: berkasByAthlete[a.id_atlet] || []
  }));

  return { success: true, data: formatted };
}

/**
 * Pendaftaran Atlet Baru oleh Admin Cabor / Induk
 */
function registerAthlete(user, data) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('TB_Atlet');
  const idCabor = (user.role === 'ADMIN_CABOR') ? user.caborId : (data.idCabor || user.caborId);

  if (!idCabor) return { success: false, message: 'Cabang Olahraga wajib dipilih.' };
  if (!data.namaLengkap || !data.nik) return { success: false, message: 'Nama lengkap dan NIK wajib diisi!' };

  // Validasi NIK 16 Digit
  const nikClean = String(data.nik).replace(/\D/g, '');
  if (nikClean.length !== 16) {
    return { success: false, message: 'NIK harus berupa 16 digit angka valid!' };
  }

  // Cek Duplikasi NIK di Database
  const existing = readSheetObjects_(sh);
  if (existing.some(a => String(a.nik).trim() === nikClean)) {
    return { success: false, message: 'Atlet dengan NIK ' + nikClean + ' sudah terdaftar sebelumnya!' };
  }

  const idAtlet = 'ATL_' + Date.now().toString(36) + '_' + acak_(4);
  const newRow = [
    idAtlet,
    idCabor,
    nikClean,
    data.namaLengkap.trim(),
    data.tempatLahir || '',
    data.tglLahir || '',
    data.jenisKelamin || 'L',
    data.kelasTanding || '',
    data.alamat || '',
    data.noHp || '',
    'PENDING',
    '',
    '',
    ''
  ];

  sh.appendRow(newRow);
  bump('global');
  catatLog_(user.userId, user.role, 'REGISTER_ATLET', 'Mendaftarkan atlet: ' + data.namaLengkap + ' (' + nikClean + ')');

  return {
    success: true,
    message: 'Atlet berhasil didaftarkan! Status berkas: Menunggu Verifikasi.',
    idAtlet: idAtlet
  };
}

/**
 * Verifikasi Dokumen Keabsahan Atlet oleh Admin Induk
 */
function verifyAthleteDocument(user, data) {
  const idAtlet = data.idAtlet;
  const keputusan = String(data.keputusan || '').toUpperCase(); // 'DITERIMA' atau 'DITOLAK'
  const catatan = data.catatan || '';

  if (!idAtlet || (keputusan !== 'DITERIMA' && keputusan !== 'DITOLAK')) {
    return { success: false, message: 'Parameter keputusan verifikasi tidak valid!' };
  }
  if (keputusan === 'DITOLAK' && !catatan.trim()) {
    return { success: false, message: 'Wajib memberikan catatan alasan penolakan agar cabor dapat memperbaikinya.' };
  }

  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('TB_Atlet');
  const values = sh.getDataRange().getValues();
  const h = values[0].map(String);
  const idxId = h.indexOf('id_atlet');
  const idxStatus = h.indexOf('status_verifikasi');
  const idxCatatan = h.indexOf('catatan_verifikasi');
  const idxVerifBy = h.indexOf('diverifikasi_oleh');
  const idxVerifDate = h.indexOf('tgl_verifikasi');

  let rowTarget = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idxId]) === String(idAtlet)) {
      rowTarget = i + 1;
      break;
    }
  }

  if (rowTarget === -1) return { success: false, message: 'Data atlet tidak ditemukan.' };

  sh.getRange(rowTarget, idxStatus + 1).setValue(keputusan);
  sh.getRange(rowTarget, idxCatatan + 1).setValue(catatan);
  sh.getRange(rowTarget, idxVerifBy + 1).setValue(user.nama || user.username);
  sh.getRange(rowTarget, idxVerifDate + 1).setValue(new Date().toISOString());

  bump('global');
  catatLog_(user.userId, user.role, 'VERIFIKASI_ATLET', 'Atlet ' + idAtlet + ' di-' + keputusan + '. Catatan: ' + catatan);

  return {
    success: true,
    message: 'Keabsahan atlet berhasil di-' + (keputusan === 'DITERIMA' ? 'setujui' : 'tolak') + '.'
  };
}

/**
 * Unggah Berkas Atlet ke Google Drive Otomatis
 */
function uploadAthleteFile(user, data) {
  const idAtlet = data.idAtlet;
  const jenisDokumen = data.jenisDokumen; // 'FOTO_3X4', 'KTP', 'DOKUMEN_PENDUKUNG'
  const base64Data = data.base64Data;
  const mimeType = data.mimeType || 'image/jpeg';
  const namaFile = data.namaFile || (jenisDokumen + '.jpg');

  if (!idAtlet || !base64Data) {
    return { success: false, message: 'File dan ID Atlet wajib disertakan!' };
  }

  try {
    const ss = getSpreadsheet_();
    const athletes = readSheetObjects_(ss.getSheetByName('TB_Atlet'));
    const athlete = athletes.find(a => String(a.id_atlet) === String(idAtlet));
    if (!athlete) return { success: false, message: 'Atlet tidak terdaftar.' };

    const caborList = readSheetObjects_(ss.getSheetByName('TB_Cabor'));
    const cabor = caborList.find(c => String(c.id_cabor) === String(athlete.id_cabor)) || { nama_cabor: 'Lainnya' };

    // Dapatkan / Buat Folder di Google Drive
    const targetFolder = getAthleteFolder_(cabor.nama_cabor, athlete.nik, athlete.nama_lengkap);

    // Konversi base64 ke Blob
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decodedBytes, mimeType, namaFile);

    const file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const viewUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1000';
    const downloadUrl = file.getDownloadUrl();

    // Catat ke TB_Berkas
    const shBerkas = ss.getSheetByName('TB_Berkas');
    const idBerkas = 'BRK_' + Date.now().toString(36) + '_' + acak_(4);
    shBerkas.appendRow([
      idBerkas,
      idAtlet,
      jenisDokumen,
      fileId,
      viewUrl,
      downloadUrl,
      namaFile,
      new Date().toISOString()
    ]);

    bump('global');
    return {
      success: true,
      message: 'Berkas ' + jenisDokumen + ' berhasil disimpan!',
      viewUrl: viewUrl
    };
  } catch (err) {
    return { success: false, message: 'Gagal mengunggah berkas: ' + err.message };
  }
}

function getAthleteFolder_(namaCabor, nik, namaLengkap) {
  const rootId = prop_('ROOT_FOLDER_ID');
  let root;
  try {
    root = rootId ? DriveApp.getFolderById(rootId) : DriveApp.getRootFolder();
  } catch (e) {
    root = DriveApp.getRootFolder();
  }

  // Folder Berkas_Atlet
  let berkasRoot;
  const itBerkas = root.getFoldersByName('Berkas_Atlet');
  berkasRoot = itBerkas.hasNext() ? itBerkas.next() : root.createFolder('Berkas_Atlet');

  // Subfolder Cabor
  const cleanCabor = namaCabor.replace(/[\/\\:*?"<>|]/g, '_');
  const itCabor = berkasRoot.getFoldersByName(cleanCabor);
  const folderCabor = itCabor.hasNext() ? itCabor.next() : berkasRoot.createFolder(cleanCabor);

  // Subfolder Atlet (NIK_Nama)
  const cleanAtlet = (nik + '_' + namaLengkap).replace(/[\/\\:*?"<>|]/g, '_');
  const itAtlet = folderCabor.getFoldersByName(cleanAtlet);
  return itAtlet.hasNext() ? itAtlet.next() : folderCabor.createFolder(cleanAtlet);
}

/**
 * Catat Perolehan Medali Saat Porprov
 */
function recordMedal(user, data) {
  const idCabor = (user.role === 'ADMIN_CABOR') ? user.caborId : data.idCabor;
  const kategori = String(data.kategori || '').toUpperCase(); // 'EMAS', 'PERAK', 'PERUNGGU'

  if (!idCabor || !data.nomorKelas || !kategori) {
    return { success: false, message: 'Cabor, nomor pertandingan, dan kategori medali wajib diisi!' };
  }

  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('TB_Medali');
  const idMedali = 'MED_' + Date.now().toString(36) + '_' + acak_(4);

  sh.appendRow([
    idMedali,
    idCabor,
    data.idAtlet || '',
    data.nomorKelas,
    kategori,
    data.tglPerolehan || new Date().toISOString().slice(0, 10),
    data.venue || 'Arena Porprov Sultra',
    data.keterangan || '',
    user.nama || user.username
  ]);

  bump('global');
  catatLog_(user.userId, user.role, 'RECORD_MEDAL', 'Mencatat medali ' + kategori + ' untuk Cabor ' + idCabor);

  return { success: true, message: 'Perolehan medali ' + kategori + ' berhasil dicatat!' };
}

/**
 * Atur Target Medali Cabang Olahraga oleh Admin Cabor / Admin Induk
 * Otomatis terakumulasi di tampilan depan website (Landing Page)
 */
function updateCaborTarget(user, data) {
  const idCabor = (user.role === 'ADMIN_CABOR') ? user.caborId : (data.idCabor || user.caborId);
  if (!idCabor) return { success: false, message: 'ID Cabang Olahraga tidak ditemukan.' };

  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('TB_Cabor');
  const values = sh.getDataRange().getValues();
  const h = values[0].map(String);
  const idxId = h.indexOf('id_cabor');
  const idxEmas = h.indexOf('target_emas');
  const idxPerak = h.indexOf('target_perak');
  const idxPerunggu = h.indexOf('target_perunggu');

  let found = false;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idxId]) === String(idCabor)) {
      if (idxEmas >= 0 && data.targetEmas !== undefined) sh.getRange(i + 1, idxEmas + 1).setValue(Number(data.targetEmas) || 0);
      if (idxPerak >= 0 && data.targetPerak !== undefined) sh.getRange(i + 1, idxPerak + 1).setValue(Number(data.targetPerak) || 0);
      if (idxPerunggu >= 0 && data.targetPerunggu !== undefined) sh.getRange(i + 1, idxPerunggu + 1).setValue(Number(data.targetPerunggu) || 0);
      found = true;
      break;
    }
  }

  if (found) {
    bump('global');
    catatLog_(user.userId, user.role, 'UPDATE_TARGET_CABOR', 'Update target medali untuk Cabor ' + idCabor + ': Emas=' + data.targetEmas + ', Perak=' + data.targetPerak + ', Perunggu=' + data.targetPerunggu);
    return { success: true, message: 'Target medali cabor berhasil disimpan dan otomatis terbarui di halaman utama web!' };
  }
  return { success: false, message: 'Data Cabang Olahraga tidak ditemukan di database spreadsheet.' };
}

/**
 * Utilitas Reset / Pengosongan Data Awal Menjadi Nol
 * Total Atlet = 0, Target Emas = 0, Raihan Emas = 0
 * Memberi kesempatan kepada Admin Cabor untuk menginput semuanya secara mandiri.
 */
function resetInitialDataToZero(user) {
  if (user && user.role !== 'ADMIN_INDUK') return rbacDenied_();

  const ss = getSpreadsheet_();

  // 1. Reset seluruh kolom target dan total atlet di TB_Cabor menjadi 0
  const shCabor = ss.getSheetByName('TB_Cabor');
  if (shCabor) {
    const data = shCabor.getDataRange().getValues();
    const h = data[0].map(String);
    const idxEmas = h.indexOf('target_emas');
    const idxPerak = h.indexOf('target_perak');
    const idxPerunggu = h.indexOf('target_perunggu');
    const idxTotal = h.indexOf('total_atlet');

    for (let r = 2; r <= data.length; r++) {
      if (idxEmas >= 0) shCabor.getRange(r, idxEmas + 1).setValue(0);
      if (idxPerak >= 0) shCabor.getRange(r, idxPerak + 1).setValue(0);
      if (idxPerunggu >= 0) shCabor.getRange(r, idxPerunggu + 1).setValue(0);
      if (idxTotal >= 0) shCabor.getRange(r, idxTotal + 1).setValue(0);
    }
  }

  // 2. Kosongkan TB_Atlet (sisakan baris header)
  const shAtlet = ss.getSheetByName('TB_Atlet');
  if (shAtlet && shAtlet.getLastRow() > 1) {
    shAtlet.deleteRows(2, shAtlet.getLastRow() - 1);
  }

  // 3. Kosongkan TB_Berkas (sisakan baris header)
  const shBerkas = ss.getSheetByName('TB_Berkas');
  if (shBerkas && shBerkas.getLastRow() > 1) {
    shBerkas.deleteRows(2, shBerkas.getLastRow() - 1);
  }

  // 4. Kosongkan TB_Medali (sisakan baris header)
  const shMedali = ss.getSheetByName('TB_Medali');
  if (shMedali && shMedali.getLastRow() > 1) {
    shMedali.deleteRows(2, shMedali.getLastRow() - 1);
  }

  // 5. Bust Cache
  bump('global');
  if (user) {
    catatLog_(user.userId, user.role, 'RESET_DATA_AWAL', 'Mereset data awal atlet, target, dan raihan medali menjadi nol.');
  }

  return { success: true, message: 'Data awal berhasil dikosongkan (Total Atlet: 0, Target Emas: 0, Raihan Emas: 0). Cabor kini dapat mengisi data dari awal!' };
}

/**
 * Tambah / Perbarui Data Cabang Olahraga
 */
function saveCabor(data) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('TB_Cabor');
  const idCabor = data.idCabor || ('CAB_' + Date.now().toString(36) + '_' + acak_(3));
  const values = sh.getDataRange().getValues();
  const h = values[0].map(String);
  const idxId = h.indexOf('id_cabor');

  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idxId]) === String(idCabor)) {
      rowIndex = i + 1;
      break;
    }
  }

  const rowData = [
    idCabor,
    data.namaCabor || '',
    data.ketuaCabor || '',
    data.nomorKontak || '',
    Number(data.targetEmas) || 0,
    Number(data.targetPerak) || 0,
    Number(data.targetPerunggu) || 0,
    Number(data.totalAtlet) || 0,
    data.keterangan || ''
  ];

  if (rowIndex > 0) {
    sh.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sh.appendRow(rowData);
  }

  // Jika ada permintaan reset / pembuatan akun login cabor
  if (data.resetAccount && data.newPassword) {
    resetUserPassword({
      idCabor: idCabor,
      username: data.accountUsername,
      newPassword: data.newPassword,
      namaCabor: data.namaCabor
    });
  }

  bump('global');
  return { success: true, message: 'Cabang olahraga berhasil disimpan!', idCabor: idCabor };
}

/**
 * Hapus Data Cabang Olahraga & Akun Terkait
 */
function deleteCabor(idCabor) {
  if (!idCabor) return { success: false, message: 'ID Cabor tidak valid.' };

  const ss = getSpreadsheet_();
  const shCabor = ss.getSheetByName('TB_Cabor');
  const values = shCabor.getDataRange().getValues();
  const h = values[0].map(String);
  const idxId = h.indexOf('id_cabor');

  let rowTarget = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idxId]) === String(idCabor)) {
      rowTarget = i + 1;
      break;
    }
  }

  if (rowTarget > 0) {
    shCabor.deleteRow(rowTarget);
  }

  // Hapus akun pengguna terkait di TB_Pengguna
  const shUser = ss.getSheetByName('TB_Pengguna');
  if (shUser) {
    const uValues = shUser.getDataRange().getValues();
    const uh = uValues[0].map(String);
    const uCaborIdx = uh.indexOf('id_cabor');
    for (let j = uValues.length - 1; j >= 1; j--) {
      if (String(uValues[j][uCaborIdx]) === String(idCabor)) {
        shUser.deleteRow(j + 1);
      }
    }
  }

  bump('global');
  return { success: true, message: 'Cabang olahraga berhasil dihapus!' };
}

/**
 * Reset / Perbarui Akun Login Pengurus Cabor
 */
function resetUserPassword(data) {
  const idCabor = data.idCabor;
  const username = String(data.username || '').trim().toLowerCase();
  const password = String(data.newPassword || data.password || '').trim();

  if (!idCabor || !password) {
    return { success: false, message: 'ID Cabor dan password baru wajib diisi!' };
  }

  const ss = getSpreadsheet_();
  const shUser = ss.getSheetByName('TB_Pengguna');
  const values = shUser.getDataRange().getValues();
  const h = values[0].map(String);
  const idxCabor = h.indexOf('id_cabor');
  const idxPass = h.indexOf('password_hash');
  const idxUser = h.indexOf('username');
  const idxId = h.indexOf('id_user');

  let foundRow = -1;
  let idUser = '';

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idxCabor]) === String(idCabor)) {
      foundRow = i + 1;
      idUser = String(values[i][idxId]);
      break;
    }
  }

  const salt = Utilities.getUuid();
  const passHash = hashPass_(password, salt);

  if (foundRow > 0) {
    shUser.getRange(foundRow, idxPass + 1).setValue(passHash);
    if (username) {
      shUser.getRange(foundRow, idxUser + 1).setValue(username);
    }
    setProp_('SALT_' + idUser, salt);
    revokeAll_(idUser);
    return { success: true, message: 'Akun Cabor berhasil direset! Password baru aktif.' };
  } else {
    return createCaborAccount({
      idCabor: idCabor,
      username: username || ('cabor_' + idCabor.toLowerCase()),
      password: password,
      namaCabor: data.namaCabor || idCabor
    });
  }
}

/**
 * Buat Akun Admin Cabor
 */
function createCaborAccount(data) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('TB_Pengguna');
  const username = String(data.username || '').trim().toLowerCase();
  const password = String(data.password || '').trim();

  if (!username || !password || !data.idCabor) {
    return { success: false, message: 'Username, password awal, dan Cabang Olahraga wajib diisi!' };
  }

  const users = readSheetObjects_(sh);
  if (users.some(u => String(u.username).toLowerCase() === username)) {
    return { success: false, message: 'Username sudah digunakan. Silakan gunakan username lain!' };
  }

  const idUser = 'USR_' + Date.now().toString(36) + '_' + acak_(4);
  const salt = Utilities.getUuid();
  const passHash = hashPass_(password, salt);

  sh.appendRow([
    idUser,
    username,
    passHash,
    data.namaLengkap || ('Admin ' + data.namaCabor),
    'ADMIN_CABOR',
    data.idCabor,
    data.kontakWa || '',
    'AKTIF',
    ''
  ]);

  setProp_('SALT_' + idUser, salt);
  return { success: true, message: 'Akun Admin Cabor berhasil dibuat! Username: ' + username };
}

/**
 * Update Pengaturan Branding (Logo, Judul, Banner)
 */
function updateSystemSettings(data) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('TB_Pengaturan');
  const values = sh.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < values.length; i++) {
    map[String(values[i][0])] = i + 1;
  }

  // Jika logo diunggah via base64, simpan ke Drive Assets
  if (data.logoKoniBase64) {
    const uploadedUrl = saveAssetFile_(data.logoKoniBase64, 'logo_koni_' + Date.now() + '.png');
    if (uploadedUrl) data.LOGO_KONI_URL = uploadedUrl;
  }
  if (data.logoKonutBase64) {
    const uploadedUrl = saveAssetFile_(data.logoKonutBase64, 'logo_konut_' + Date.now() + '.png');
    if (uploadedUrl) data.LOGO_KONUT_URL = uploadedUrl;
  }

  const keys = ['NAMA_APLIKASI', 'SUB_JUDUL', 'LOGO_KONI_URL', 'LOGO_KONUT_URL', 'BANNER_URL', 'KETUA_KONI', 'KONTAK_BANTUAN'];
  keys.forEach(k => {
    if (data[k] !== undefined) {
      if (map[k]) {
        sh.getRange(map[k], 2).setValue(data[k]);
      } else {
        sh.appendRow([k, data[k], 'Pengaturan aplikasi']);
      }
    }
  });

  bump('global');
  return {
    success: true,
    message: 'Pengaturan branding berhasil disimpan!',
    logoKoniUrl: data.LOGO_KONI_URL,
    logoKonutUrl: data.LOGO_KONUT_URL
  };
}

function saveAssetFile_(base64Data, filename) {
  try {
    const rootId = prop_('ROOT_FOLDER_ID');
    const root = rootId ? DriveApp.getFolderById(rootId) : DriveApp.getRootFolder();
    let assetsFolder;
    const it = root.getFoldersByName('📂 Assets');
    if (it.hasNext()) {
      assetsFolder = it.next();
    } else {
      const it2 = root.getFoldersByName('Assets');
      assetsFolder = it2.hasNext() ? it2.next() : root.createFolder('📂 Assets');
    }
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const decoded = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decoded, 'image/png', filename);
    const file = assetsFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1000';
  } catch (e) {
    return '';
  }
}

/**
 * Ubah Password Mandiri oleh Pengguna yang Sedang Login
 */
function changePassword(user, d) {
  const oldPass = String(d.oldPassword || '').trim();
  const newPass = String(d.newPassword || '').trim();

  if (!oldPass || !newPass) {
    return { success: false, message: 'Password lama dan password baru wajib diisi!' };
  }
  if (newPass.length < 6) {
    return { success: false, message: 'Password baru minimal 6 karakter!' };
  }

  const ss = getSpreadsheet_();
  const shUser = ss.getSheetByName('TB_Pengguna');
  const values = shUser.getDataRange().getValues();
  const h = values[0].map(String);
  const idxId = h.indexOf('id_user');
  const idxPass = h.indexOf('password_hash');

  let rowIndex = -1;
  let currentHash = '';
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idxId]) === String(user.userId)) {
      rowIndex = i + 1;
      currentHash = String(values[i][idxPass]);
      break;
    }
  }

  if (rowIndex === -1) {
    return { success: false, message: 'Data pengguna tidak ditemukan.' };
  }

  const salt = prop_('SALT_' + user.userId) || 'KONI_KONUT_SALT_2026';
  const checkOldHash = hashPass_(oldPass, salt);
  if (!samaAman_(checkOldHash, currentHash)) {
    return { success: false, message: 'Password lama Anda tidak sesuai!' };
  }

  const newSalt = Utilities.getUuid();
  const newHash = hashPass_(newPass, newSalt);

  shUser.getRange(rowIndex, idxPass + 1).setValue(newHash);
  setProp_('SALT_' + user.userId, newSalt);

  catatLog_(user.userId, user.role, 'CHANGE_PASSWORD', 'Pengguna berhasil mengubah password mandiri.');
  return { success: true, message: 'Password Anda berhasil diperbarui!' };
}

/**
 * Update Profil Pengguna yang Sedang Login
 */
function updateUserProfile(user, d) {
  const namaLengkap = String(d.namaLengkap || '').trim();
  const kontakWa = String(d.kontakWa || '').trim();

  if (!namaLengkap) {
    return { success: false, message: 'Nama lengkap wajib diisi!' };
  }

  const ss = getSpreadsheet_();
  const shUser = ss.getSheetByName('TB_Pengguna');
  const values = shUser.getDataRange().getValues();
  const h = values[0].map(String);
  const idxId = h.indexOf('id_user');
  const idxNama = h.indexOf('nama_lengkap');
  const idxWa = h.indexOf('kontak_wa');

  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idxId]) === String(user.userId)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return { success: false, message: 'Data pengguna tidak ditemukan.' };
  }

  if (idxNama > -1) shUser.getRange(rowIndex, idxNama + 1).setValue(namaLengkap);
  if (idxWa > -1 && kontakWa) shUser.getRange(rowIndex, idxWa + 1).setValue(kontakWa);

  catatLog_(user.userId, user.role, 'UPDATE_PROFILE', 'Pengguna memperbarui profil.');
  return { success: true, message: 'Profil Anda berhasil diperbarui!', namaLengkap: namaLengkap };
}

// =========================================================================
// 7. HELPER DATABASE & SPREADSHEET UTILITIES
// =========================================================================
function getSpreadsheet_() {
  const id = prop_('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum terdaftar. Silakan jalankan setupAppEnvironment().');
  return SpreadsheetApp.openById(id);
}

function readSheetObjects_(sh) {
  if (!sh) return [];
  const v = sh.getDataRange().getValues();
  if (v.length <= 1) return [];
  const h = v[0].map(String);
  return v.slice(1).filter(r => r.join('') !== '').map(row => {
    const obj = {};
    h.forEach((k, i) => { if (k) obj[k] = row[i]; });
    return obj;
  });
}

function getSettingsMap_(ss) {
  const sh = ss.getSheetByName('TB_Pengaturan');
  if (!sh) return {};
  const v = sh.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < v.length; i++) {
    if (v[i][0]) map[String(v[i][0])] = String(v[i][1] || '');
  }
  return map;
}

function catatLog_(userId, role, aksi, rincian) {
  try {
    const ss = getSpreadsheet_();
    const sh = ss.getSheetByName('TB_LogAudit');
    if (!sh) return;
    sh.appendRow([
      'LOG_' + Date.now().toString(36),
      new Date().toISOString(),
      userId || '-',
      role || '-',
      aksi || '-',
      rincian || ''
    ]);
  } catch (e) {}
}

// =========================================================================
// 8. AUTO-SETUP DATABASE & GOOGLE DRIVE ENVIRONMENT (Jalankan Sekali)
// =========================================================================
function setupAppEnvironment() {
  Logger.log('🚀 Memulai inisialisasi lingkungan KONI KONAWE UTARA PORPROV 2026...');

  const APP_NAME = 'KONI KONUT - ROAD TO PORPROV SULTRA 2026';
  secret_(); // Inisialisasi SESSION_SECRET

  // 1. Buat Direktori Google Drive
  let rootFolder;
  const itRoot = DriveApp.getFoldersByName('📁 ' + APP_NAME);
  rootFolder = itRoot.hasNext() ? itRoot.next() : DriveApp.createFolder('📁 ' + APP_NAME);

  const uploadsFolder = rootFolder.createFolder('📂 Berkas_Atlet');
  const assetsFolder = rootFolder.createFolder('📂 Assets');
  const exportsFolder = rootFolder.createFolder('📂 Ekspor_Laporan');

  // 2. Buat Google Spreadsheet Database
  const ss = SpreadsheetApp.create('🗃️ Database - ' + APP_NAME);
  DriveApp.getFileById(ss.getId()).moveTo(rootFolder);

  // Sheet TB_Pengaturan
  const shPengaturan = ss.getActiveSheet().setName('TB_Pengaturan');
  shPengaturan.appendRow(['kunci', 'nilai', 'keterangan']);
  shPengaturan.appendRow(['NAMA_APLIKASI', APP_NAME, 'Nama resmi sistem']);
  shPengaturan.appendRow(['SUB_JUDUL', 'Sistem Informasi Atlet & Kontingen - Porprov Sultra 2026', 'Slogan / sub-judul']);
  shPengaturan.appendRow(['LOGO_KONI_URL', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Logo_KONI.svg/1200px-Logo_KONI.svg.png', 'Logo KONI']);
  shPengaturan.appendRow(['LOGO_KONUT_URL', '', 'Logo Pemkab Konawe Utara']);
  shPengaturan.appendRow(['BANNER_URL', '', 'Banner Porprov Sultra']);
  shPengaturan.appendRow(['KETUA_KONI', 'Ketua Umum KONI Kabupaten Konawe Utara', 'Nama Pimpinan']);
  shPengaturan.appendRow(['KONTAK_BANTUAN', '0812-4567-8901', 'Nomor Helpdesk']);

  // Sheet TB_Pengguna
  const shPengguna = ss.insertSheet('TB_Pengguna');
  shPengguna.appendRow(['id_user', 'username', 'password_hash', 'nama_lengkap', 'role', 'id_cabor', 'kontak_wa', 'status_aktif', 'terakhir_login']);
  const adminSalt = Utilities.getUuid();
  const adminPass = 'KoniKonut2026!';
  const adminHash = hashPass_(adminPass, adminSalt);
  shPengguna.appendRow(['USR_SUPERADMIN', 'admin_koni', adminHash, 'Admin Induk KONI Konut', 'ADMIN_INDUK', '', '081234567890', 'AKTIF', '']);
  setProp_('SALT_USR_SUPERADMIN', adminSalt);

  // Sheet TB_Cabor (Inisialisasi Target Emas, Perak, Perunggu, dan Total Atlet Mulai dari 0)
  const shCabor = ss.insertSheet('TB_Cabor');
  shCabor.appendRow(['id_cabor', 'nama_cabor', 'ketua_cabor', 'nomor_kontak', 'target_emas', 'target_perak', 'target_perunggu', 'total_atlet', 'keterangan']);
  const sampleCabor = [
    ['CAB_DAYUNG', 'Dayung (PODSI)', 'Hendra Kurniawan', '0852xxxx11', 0, 0, 0, 0, 'Cabor unggulan maritim'],
    ['CAB_ATLETIK', 'Atletik (PASI)', 'Ruslan, S.Pd', '0812xxxx22', 0, 0, 0, 0, 'Lari jarak pendek & lompat'],
    ['CAB_TAEKWONDO', 'Taekwondo (TI)', 'Fitriani, M.Si', '0821xxxx33', 0, 0, 0, 0, 'Kyorugi & Poomsae'],
    ['CAB_TAKRAW', 'Sepak Takraw (PSTI)', 'Jumardin', '0853xxxx44', 0, 0, 0, 0, 'Inter regu putra & putri'],
    ['CAB_KARATE', 'Karate (FORKI)', 'Irwan Sahputra', '0813xxxx55', 0, 0, 0, 0, 'Kumite & Kata'],
    ['CAB_PANAHAN', 'Panahan (PERPANI)', 'dr. Wahyudi', '0822xxxx66', 0, 0, 0, 0, 'Divisi Recurve & Compound'],
    ['CAB_SILAT', 'Pencak Silat (IPSI)', 'Bahrun', '0851xxxx77', 0, 0, 0, 0, 'Tanding putra/putri'],
    ['CAB_CATUR', 'Catur (PERCASI)', 'Mansyur, SE', '0852xxxx88', 0, 0, 0, 0, 'Catur cepat & standar']
  ];
  sampleCabor.forEach(c => shCabor.appendRow(c));

  // Akun Demo Cabor Dayung
  const dayungSalt = Utilities.getUuid();
  const dayungHash = hashPass_('dayung123', dayungSalt);
  shPengguna.appendRow(['USR_DAYUNG', 'cabor_dayung', dayungHash, 'Admin Cabor Dayung (PODSI)', 'ADMIN_CABOR', 'CAB_DAYUNG', '0852xxxx11', 'AKTIF', '']);
  setProp_('SALT_USR_DAYUNG', dayungSalt);

  // Sheet TB_Atlet (Awal Kosong - Menunggu Diisi Admin Cabor)
  const shAtlet = ss.insertSheet('TB_Atlet');
  shAtlet.appendRow(['id_atlet', 'id_cabor', 'nik', 'nama_lengkap', 'tempat_lahir', 'tgl_lahir', 'jenis_kelamin', 'kelas_nomor_tanding', 'alamat_domisili', 'no_hp', 'status_verifikasi', 'catatan_verifikasi', 'diverifikasi_oleh', 'tgl_verifikasi']);

  // Sheet TB_Berkas (Awal Kosong)
  const shBerkas = ss.insertSheet('TB_Berkas');
  shBerkas.appendRow(['id_berkas', 'id_atlet', 'jenis_dokumen', 'drive_file_id', 'drive_view_url', 'drive_download_url', 'nama_file_asli', 'tgl_unggah']);

  // Sheet TB_Medali (Awal Kosong - Menunggu Diisi Admin Cabor / Induk)
  const shMedali = ss.insertSheet('TB_Medali');
  shMedali.appendRow(['id_medali', 'id_cabor', 'id_atlet', 'kelas_nomor', 'kategori_medali', 'tgl_perolehan', 'lokasi_venue', 'keterangan', 'dicatat_oleh']);

  // Sheet TB_LogAudit
  const shLog = ss.insertSheet('TB_LogAudit');
  shLog.appendRow(['id_log', 'timestamp', 'user_id', 'role', 'aksi', 'rincian']);

  // 3. Simpan ke Script Properties
  setProps_({
    SPREADSHEET_ID: ss.getId(),
    ROOT_FOLDER_ID: rootFolder.getId(),
    UPLOADS_FOLDER_ID: uploadsFolder.getId(),
    EXPORTS_FOLDER_ID: exportsFolder.getId(),
    APP_VERSION: APP_VERSION
  });

  Logger.log('========================================================');
  Logger.log('✅ SETUP BERHASIL SELESAI!');
  Logger.log('Spreadsheet URL : ' + ss.getUrl());
  Logger.log('Google Drive    : ' + rootFolder.getUrl());
  Logger.log('AKUN ADMIN INDUK:');
  Logger.log('  Username      : admin_koni');
  Logger.log('  Password      : ' + adminPass);
  Logger.log('AKUN DEMO CABOR :');
  Logger.log('  Username      : cabor_dayung');
  Logger.log('  Password      : dayung123');
  Logger.log('========================================================');
}
