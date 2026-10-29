/**
 * =========================================================================
 * KONI KONAWE UTARA - ROAD TO PORPROV SULTRA 2026
 * MODUL MIGRASI & SINKRONISASI DATABASE (gas-migrasi-database)
 * =========================================================================
 * Prinsip:
 * 1. Spreadsheet lama TIDAK DISENTUH (Read-only).
 * 2. Pencocokan berbasis nama header (bukan indeks kolom).
 * 3. Operasi Upsert Idempoten (aman diulang berkali-kali).
 * 4. Mode Dry-Run (Simulasi pindai sebelum tulis data nyata).
 * 5. Manipulasi batch di memori (getValues & setValues sekali jalan).
 * =========================================================================
 */

function openSourceSpreadsheet_(idOrUrl) {
  const m = String(idOrUrl).match(/\/d\/([A-Za-z0-9_-]{20,})/);
  const id = m ? m[1] : String(idOrUrl).trim();
  const currentId = prop_('SPREADSHEET_ID');
  if (currentId && id === currentId) {
    throw new Error('Spreadsheet yang dimasukkan adalah spreadsheet aplikasi baru saat ini. Masukkan ID/URL spreadsheet LAMA.');
  }
  try {
    return SpreadsheetApp.openById(id);
  } catch (e) {
    throw new Error('Spreadsheet lama tidak dapat dibuka. Pastikan ID/URL benar dan akun memiliki akses baca.');
  }
}

function readSourceSheet_(ss, sheetName) {
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return null;
  const v = sh.getDataRange().getValues();
  if (v.length <= 1) return [];
  const headers = v[0].map(h => String(h).trim());
  return v.slice(1).filter(r => r.join('') !== '').map(r => {
    const o = {};
    headers.forEach((k, i) => { if (k) o[k] = r[i]; });
    return o;
  });
}

/**
 * Eksekusi upsert batch idempoten
 * @param {Object} plan - { target, rows, key, updatable, sortBy }
 * @param {boolean} dryRun - Jika true, hanya kalkulasi simulasi
 */
function upsertPlan_(plan, dryRun) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(plan.target);
  if (!sh) throw new Error('Sheet target ' + plan.target + ' tidak ditemukan di database.');

  const values = sh.getDataRange().getValues();
  const h = values[0].map(String);
  const index = {};

  for (let r = 1; r < values.length; r++) {
    const o = {};
    h.forEach((k, i) => o[k] = values[r][i]);
    const k = plan.key(o);
    if (k) index[k] = r;
  }

  const res = { inserted: 0, updated: 0, skipped: 0, sampleNew: [] };
  const newRows = [];
  const seen = {};

  plan.rows.forEach(src => {
    const k = plan.key(src);
    if (!k || seen[k]) { res.skipped++; return; }
    seen[k] = true;

    if (index[k] !== undefined) {
      const row = values[index[k]];
      let changed = false;
      (plan.updatable || []).forEach(f => {
        const i = h.indexOf(f);
        if (i === -1 || src[f] === undefined || src[f] === '') return;
        const v = src[f];
        if (String(row[i]) !== String(v)) {
          row[i] = v;
          changed = true;
        }
      });
      changed ? res.updated++ : res.skipped++;
    } else {
      const rowData = h.map(f => src[f] !== undefined ? src[f] : '');
      newRows.push(rowData);
      res.inserted++;
      if (res.sampleNew.length < 3) res.sampleNew.push(src);
    }
  });

  if (!dryRun && (res.updated || newRows.length)) {
    let all = values.concat(newRows);
    if (plan.sortBy && newRows.length) {
      const si = h.indexOf(plan.sortBy);
      if (si > -1) {
        all = [values[0]].concat(all.slice(1).sort((a, b) => new Date(a[si]) - new Date(b[si])));
      }
    }
    sh.getRange(1, 1, all.length, h.length).setValues(all);
    bump('global');
  }

  return res;
}

/**
 * FUNGSI UTAMA: Migrasi Data Atlet dari Spreadsheet Versi Sebelumnya
 * @param {string} sourceIdOrUrl - ID atau URL spreadsheet sumber
 * @param {boolean} dryRun - true untuk simulasi, false untuk eksekusi nyata
 */
function migrasiDataAtlet(sourceIdOrUrl, dryRun) {
  const ssSource = openSourceSpreadsheet_(sourceIdOrUrl);
  // Coba cari nama sheet atlet di spreadsheet lama
  const sheetNames = ['TB_Atlet', 'Data_Atlet', 'Atlet', 'Peserta'];
  let sourceRows = null;
  let detectedSheet = '';

  for (let i = 0; i < sheetNames.length; i++) {
    sourceRows = readSourceSheet_(ssSource, sheetNames[i]);
    if (sourceRows && sourceRows.length > 0) {
      detectedSheet = sheetNames[i];
      break;
    }
  }

  if (!sourceRows || sourceRows.length === 0) {
    throw new Error('Tidak ditemukan sheet atlet yang valid di spreadsheet sumber.');
  }

  // Normalisasi kolom
  const normalized = sourceRows.map(row => {
    const nik = String(row.nik || row.NIK || row['No KTP'] || '').replace(/\D/g, '');
    const nama = String(row.nama_lengkap || row.nama || row.Nama || '').trim();
    const cabor = String(row.id_cabor || row.cabor || row.Cabor || '').trim();
    return {
      id_atlet: row.id_atlet || ('ATL_MIG_' + nik),
      id_cabor: cabor,
      nik: nik,
      nama_lengkap: nama,
      tempat_lahir: row.tempat_lahir || row.Tempat_Lahir || '',
      tgl_lahir: row.tgl_lahir || row.Tgl_Lahir || '',
      jenis_kelamin: (row.jenis_kelamin || row.jk || 'L').toUpperCase().slice(0, 1),
      kelas_nomor_tanding: row.kelas_nomor_tanding || row.kelas || row.Nomor_Tanding || '',
      alamat_domisili: row.alamat_domisili || row.alamat || '',
      no_hp: row.no_hp || row.telepon || '',
      status_verifikasi: row.status_verifikasi || 'PENDING',
      catatan_verifikasi: row.catatan_verifikasi || '',
      diverifikasi_oleh: row.diverifikasi_oleh || '',
      tgl_verifikasi: row.tgl_verifikasi || ''
    };
  }).filter(a => a.nik.length === 16 && a.nama_lengkap);

  const plan = {
    target: 'TB_Atlet',
    rows: normalized,
    key: o => String(o.nik).trim(),
    updatable: ['nama_lengkap', 'kelas_nomor_tanding', 'alamat_domisili', 'no_hp']
  };

  const hasil = upsertPlan_(plan, dryRun);
  Logger.log('================ MIGRASI ATLET ================');
  Logger.log('Status Dry-Run: ' + (dryRun ? 'YA (Hanya Simulasi)' : 'TIDAK (Data Tersimpan)'));
  Logger.log('Sheet Sumber  : ' + detectedSheet + ' (' + normalized.length + ' baris valid)');
  Logger.log('Ditambahkan   : ' + hasil.inserted);
  Logger.log('Diperbarui    : ' + hasil.updated);
  Logger.log('Dilewati      : ' + hasil.skipped);
  return hasil;
}
