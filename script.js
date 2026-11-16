/* =================================================
   LOGIKA APLIKASI UMC-SEMESTER 5 (VERSI BERSIH)
   ================================================= */

let progressChart = null;
let countdownInterval = null;

/* ============ STORAGE ============ */
function getData(k) { return JSON.parse(localStorage.getItem('baghiz_' + k) || '[]'); }
function setData(k, v) { localStorage.setItem('baghiz_' + k, JSON.stringify(v)); }
function getMatkul() { return getData('matkul'); }
function setMatkul(d) { setData('matkul', d); }
function getTugas() { return getData('tugas'); }
function setTugas(d) { setData('tugas', d); }
function getMateri() { return getData('materi'); }
function setMateri(d) { setData('materi', d); }

function initStorage() {
  if (!localStorage.getItem('baghiz_matkul')) {
    setMatkul([
      { id: 1, nama: 'Pemrograman Web', dosen: 'Dr. Budi Santoso' },
      { id: 2, nama: 'Basis Data', dosen: 'Prof. Ani' }
    ]);
  }
  if (!localStorage.getItem('baghiz_tugas')) {
    const besok = new Date(); besok.setDate(besok.getDate() + 1);
    const kemarin = new Date(); kemarin.setDate(kemarin.getDate() - 1);
    setTugas([
      { id: 101, matkulId: 1, nama: 'Membuat Portofolio', deadline: besok.toISOString().slice(0, 16), pdfData: 'data:application/pdf;base64,dummy', link: '' },
      { id: 102, matkulId: 2, nama: 'Laporan Normalisasi', deadline: kemarin.toISOString().slice(0, 16), pdfData: null, link: '' }
    ]);
  }
  if (!localStorage.getItem('baghiz_materi')) {
    setMateri([
      { id: 201, matkulId: 1, judul: 'HTML & CSS Dasar', deskripsi: 'Pengenalan struktur HTML dan styling CSS untuk pemula.', pdfData: null, link: 'https://developer.mozilla.org' }
    ]);
  }
}

function formatTanggal(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if(!t) return;
  t.innerHTML = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = 'toast'; }, 4000);
}

/* ============ TEMA ============ */
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    if (document.body.classList.contains('dark-mode')) {
      icon.className = 'fas fa-sun';
      localStorage.setItem('theme', 'dark');
    } else {
      icon.className = 'fas fa-moon';
      localStorage.setItem('theme', 'light');
    }
  }
}

/* ============ MODE (Karena tombol dihapus, fungsi ini dibiarkan aman) ============ */
function setMode(m) {
  const label = document.getElementById('roleLabel');
  if (label) label.textContent = m === 'dosen' ? 'Dosen Pengampu' : 'Mahasiswa TI24D';
}

/* ============ COUNTDOWN ============ */
function hitungMundur(deadline) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { teks: 'Waktu Habis', class: 'lewat' };
  const hari = Math.floor(diff / 86400000);
  const jam = Math.floor((diff % 86400000) / 3600000);
  const menit = Math.floor((diff % 3600000) / 60000);
  const detik = Math.floor((diff % 60000) / 1000);
  let teks = '';
  if (hari > 0) teks += `${hari}hr `;
  if (jam > 0 || hari > 0) teks += `${jam}jm `;
  teks += `${menit}mnt ${detik}dtk`;
  let cls = 'aman';
  if (diff < 86400000) cls = 'mepet';
  if (diff < 10800000) cls = 'lewat';
  return { teks, class: cls };
}

function startCountdowns() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    document.querySelectorAll('.live-countdown').forEach(el => {
      if (el.getAttribute('data-selesai') === 'true') return;
      const sisa = hitungMundur(el.getAttribute('data-deadline'));
      el.innerHTML = `<i class="fas fa-hourglass-half"></i> <span>${sisa.teks}</span>`;
      el.className = `countdown-text live-countdown ${sisa.class}`;
    });
  }, 1000);
}

/* ============ STATUS ============ */
function isSelesai(t) { return t.pdfData && t.pdfData !== '' && t.pdfData !== null; }
function isTerlambat(t) { return !isSelesai(t) && new Date(t.deadline).getTime() < Date.now(); }

/* ============ NAVIGASI ============ */
function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  if (page === 'dashboard') renderDashboard();
  if (page === 'matakuliah') renderMatkul();
  if (page === 'materi') renderMateri();
}

/* ============ POPUP & MODAL ============ */
function toggleProfile() { document.getElementById('profilePopup').classList.toggle('hidden'); }
function bukaModal(id) { document.getElementById(id).classList.remove('hidden'); }
function tutupModal(id) { document.getElementById(id).classList.add('hidden'); }

document.addEventListener('click', function (event) {
  const popup = document.getElementById('profilePopup');
  const profileBtn = document.querySelector('.topbar-profile');
  if (popup && !popup.classList.contains('hidden') && profileBtn) {
    if (!popup.contains(event.target) && !profileBtn.contains(event.target)) popup.classList.add('hidden');
  }
});

/* ============ DASHBOARD ============ */
function renderDashboard() {
  const tugas = getTugas(), matkul = getMatkul(), materi = getMateri();
  const total = tugas.length;
  const selesai = tugas.filter(isSelesai).length;
  const belum = total - selesai;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('statTotalTugas', total);
  setTxt('statSelesai', selesai);
  setTxt('statBelum', belum);
  setTxt('statMatkul', matkul.length);
  setTxt('statMateri', materi.length);

  renderAlert(tugas);
  renderDonutChart(selesai, belum);
  renderDeadlineList(tugas);
  renderProgressPerMatkul(tugas, matkul);
}

function renderAlert(tugas) {
  const panel = document.getElementById('alertPanel');
  const list = document.getElementById('alertList');
  if (!panel || !list) return;
  const belum = tugas.filter(t => !isSelesai(t));
  if (belum.length === 0) { panel.classList.add('hidden'); return; }
  panel.classList.remove('hidden');
  list.innerHTML = belum.map(t => {
    const m = getMatkul().find(x => x.id === t.matkulId);
    const s = hitungMundur(t.deadline);
    return `<li><span><strong>${t.nama}</strong> — ${m ? m.nama : '?'}</span>
      <span class="countdown-text live-countdown ${s.class}" data-deadline="${t.deadline}"><i class="fas fa-hourglass-half"></i> <span>${s.teks}</span></span></li>`;
  }).join('');
}

function renderDonutChart(selesai, belum) {
  const ctx = document.getElementById('chartProgress');
  if (!ctx) return;
  if (progressChart) progressChart.destroy();
  if (selesai === 0 && belum === 0) { ctx.style.display = 'none'; return; }
  ctx.style.display = 'block';
  const isDark = document.body.classList.contains('dark-mode');
  progressChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['Terkumpul', 'Belum Terkumpul'], datasets: [{ data: [selesai, belum], backgroundColor: ['#10b981', '#f59e0b'], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: isDark ? '#f8fafc' : '#111827', usePointStyle: true } } } }
  });
}

function renderDeadlineList(tugas) {
  const list = document.getElementById('deadlineList');
  if (!list) return;
  
  // Filter: Hanya tampilkan yang BELUM LEWAT deadlinenya DAN BELUM SELESAI (Belum ada PDF)
  const mendatang = tugas
    .filter(t => new Date(t.deadline).getTime() > Date.now() && !isSelesai(t))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  if (mendatang.length === 0) { 
    list.innerHTML = `<li class="empty-deadline">
      <i class="fas fa-check-circle" style="color:var(--success); font-size:24px; margin-bottom:8px; display:block;"></i>
      Tidak ada deadline terdekat.
    </li>`; 
    return; 
  }

  list.innerHTML = mendatang.map(t => {
    const m = getMatkul().find(x => x.id === t.matkulId);
    return `<li class="deadline-item">
      <div class="deadline-info">
        <h4>${t.nama}</h4>
        <p>${m ? m.nama : 'Matkul dihapus'}</p>
      </div>
      <div class="deadline-time">
        <i class="fas fa-clock"></i> ${formatTanggal(t.deadline).split(',')[1] || ''}
      </div>
    </li>`;
  }).join('');
}

function renderProgressPerMatkul(tugas, matkul) {
  const grid = document.getElementById('progressPerMatkul');
  if (!grid) return;
  if (matkul.length === 0) { grid.innerHTML = '<p style="color:var(--text-muted);">Belum ada matkul.</p>'; return; }
  grid.innerHTML = matkul.map(m => {
    const t = tugas.filter(x => x.matkulId === m.id);
    const s = t.filter(isSelesai).length;
    const pct = t.length ? Math.round((s / t.length) * 100) : 0;
    return `<div class="progress-matkul-item"><h4>${m.nama}</h4><p>${s}/${t.length} tugas terkumpul (${pct}%)</p>
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');
}

/* ============ MATKUL & TUGAS ============ */
function renderMatkul() {
  const matkul = getMatkul(), tugas = getTugas();
  const grid = document.getElementById('gridMatkul');
  if (!grid) return;
  const keyword = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const filter = document.getElementById('filterStatus')?.value || 'all';

  if (matkul.length === 0) { grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;">Belum ada matkul.</p>`; return; }
  let htmlResult = '';

  matkul.forEach(m => {
    let tugasMatkul = tugas.filter(t => t.matkulId === m.id);
    tugasMatkul = tugasMatkul.filter(t => {
      const selesai = isSelesai(t), terlambat = isTerlambat(t);
      if (!t.nama.toLowerCase().includes(keyword) && !m.nama.toLowerCase().includes(keyword)) return false;
      if (filter === 'selesai' && !selesai) return false;
      if (filter === 'belum' && selesai) return false;
      if (filter === 'terlambat' && !terlambat) return false;
      return true;
    });
    if (!m.nama.toLowerCase().includes(keyword) && tugasMatkul.length === 0 && keyword !== '') return;

    let tugasHTML = tugasMatkul.length ? tugasMatkul.map(t => {
      const selesai = isSelesai(t), terlambat = isTerlambat(t), s = hitungMundur(t.deadline);
      const badge = selesai ? `<span class="badge badge-success">Terkumpul</span>` : terlambat ? `<span class="badge badge-danger">Terlambat</span>` : `<span class="badge badge-warning">Belum</span>`;
      const cd = !selesai ? `<span class="countdown-text live-countdown ${s.class}" data-deadline="${t.deadline}"><i class="fas fa-hourglass-half"></i> <span>${s.teks}</span></span>` : '';
      return `<li class="tugas-item" style="border-left-color:${selesai?'var(--success)':terlambat?'var(--danger)':'var(--warning)'};flex-direction:column;align-items:flex-start;">
        <div style="width:100%;display:flex;justify-content:space-between;gap:8px;">
          <div><h4>${t.nama}</h4><p><i class="fas fa-calendar"></i> ${formatTanggal(t.deadline)}</p>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">${badge}${cd}</div></div>
          <div style="display:flex;gap:4px;">
            <button class="btn-icon" onclick="lihatDetail(${t.id})"><i class="fas fa-eye"></i></button>
            <button class="btn-edit" onclick="editTugas(${t.id})"><i class="fas fa-pen"></i></button>
            <button class="btn-danger" onclick="hapusTugas(${t.id})"><i class="fas fa-trash"></i></button>
          </div>
        </div></li>`;
    }).join('') : `<p style="font-size:13px;color:var(--text-muted);text-align:center;padding:16px 0;">Tidak ada tugas.</p>`;

    htmlResult += `<div class="matkul-card">
      <div class="matkul-header"><div><h3>${m.nama}</h3><p><i class="fas fa-user-tie"></i> ${m.dosen || '-'}</p></div>
      <div style="display:flex;gap:4px;">
        <button class="btn-edit" onclick="editMatkul(${m.id})"><i class="fas fa-pen"></i></button>
        <button class="btn-danger" onclick="hapusMatkul(${m.id})"><i class="fas fa-trash"></i></button>
      </div></div>
      <ul class="tugas-list">${tugasHTML}</ul>
      <div class="matkul-actions"><button class="btn-primary btn-sm" style="flex:1;justify-content:center;" onclick="bukaModalTugas(${m.id})"><i class="fas fa-plus"></i> Tambah Tugas</button></div>
    </div>`;
  });
  grid.innerHTML = htmlResult || `<p style="text-align:center;grid-column:1/-1;">Tidak ditemukan.</p>`;
  startCountdowns();
}

/* ============ MATERI ============ */
function renderMateri() {
  const materi = getMateri(), matkul = getMatkul();
  const grid = document.getElementById('gridMateri');
  if (!grid) return;
  const kw = (document.getElementById('searchMateri')?.value || '').toLowerCase();
  const fm = document.getElementById('filterMatkulMateri')?.value || 'all';

  const sel = document.getElementById('filterMatkulMateri');
  if (sel) {
    const cur = sel.value || 'all';
    sel.innerHTML = '<option value="all">Semua Matkul</option>' + matkul.map(m => `<option value="${m.id}">${m.nama}</option>`).join('');
    sel.value = cur;
  }

  let list = materi.filter(m => {
    if (fm !== 'all' && m.matkulId !== parseInt(fm)) return false;
    if (kw && !m.judul.toLowerCase().includes(kw)) return false;
    return true;
  });

  if (list.length === 0) { grid.innerHTML = `<p style="text-align:center;grid-column:1/-1;color:var(--text-muted);padding:40px;">Belum ada materi.</p>`; return; }

  grid.innerHTML = list.map(m => {
    const mk = matkul.find(x => x.id === m.matkulId);
    return `<div class="materi-card"><span class="materi-badge">${mk ? mk.nama : '?'}</span>
      <h3>${m.judul}</h3><p>${m.deskripsi || '-'}</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:12px;">
        ${m.pdfData ? `<button class="btn-primary btn-sm" onclick="bukaPdf('${m.pdfData}')"><i class="fas fa-file-pdf"></i> PDF</button>` : ''}
        ${m.link ? `<a href="${m.link}" target="_blank" class="btn-secondary btn-sm"><i class="fas fa-link"></i> Link</a>` : ''}
        <button class="btn-edit" onclick="editMateri(${m.id})"><i class="fas fa-pen"></i></button>
        <button class="btn-danger" onclick="hapusMateri(${m.id})"><i class="fas fa-trash"></i></button>
      </div></div>`;
  }).join('');
}

/* ============ CRUD MATKUL ============ */
function bukaModalMatkul() {
  document.getElementById('formMatkul').reset();
  document.getElementById('matkulId').value = '';
  document.getElementById('modalMatkulTitle').textContent = 'Tambah Mata Kuliah';
  bukaModal('modalMatkul');
}
function editMatkul(id) {
  const m = getMatkul().find(x => x.id === id); if (!m) return;
  document.getElementById('matkulId').value = m.id;
  document.getElementById('matkulNama').value = m.nama;
  document.getElementById('matkulDosen').value = m.dosen || '';
  document.getElementById('modalMatkulTitle').textContent = 'Edit Mata Kuliah';
  bukaModal('modalMatkul');
}
document.getElementById('formMatkul').addEventListener('submit', function (e) {
  e.preventDefault();
  const id = document.getElementById('matkulId').value;
  const nama = document.getElementById('matkulNama').value.trim();
  const dosen = document.getElementById('matkulDosen').value.trim();
  let data = getMatkul();
  if (id) { const i = data.findIndex(m => m.id === parseInt(id)); data[i] = { ...data[i], nama, dosen }; showToast('Matkul diupdate!'); }
  else { data.push({ id: Date.now(), nama, dosen }); showToast('Matkul ditambahkan!'); }
  setMatkul(data); tutupModal('modalMatkul'); renderMatkul(); renderDashboard();
});
function hapusMatkul(id) {
  if (!confirm('Hapus matkul ini? Semua tugas & materi terkait akan terhapus!')) return;
  setMatkul(getMatkul().filter(m => m.id !== id));
  setTugas(getTugas().filter(t => t.matkulId !== id));
  setMateri(getMateri().filter(m => m.matkulId !== id));
  showToast('Matkul dihapus!'); renderMatkul(); renderMateri(); renderDashboard();
}

/* ============ CRUD TUGAS ============ */
function bukaModalTugas(matkulId) {
  document.getElementById('formTugas').reset();
  document.getElementById('tugasId').value = '';
  document.getElementById('tugasMatkul').value = matkulId;
  document.getElementById('tugasPdfData').value = '';
  document.getElementById('pdfInfo').style.display = 'none';
  document.getElementById('modalTugasTitle').textContent = 'Tambah Tugas';
  bukaModal('modalTugas');
}
function editTugas(id) {
  const t = getTugas().find(x => x.id === id); if (!t) return;
  document.getElementById('tugasId').value = t.id;
  document.getElementById('tugasMatkul').value = t.matkulId;
  document.getElementById('tugasNama').value = t.nama;
  document.getElementById('tugasDeadline').value = t.deadline;
  document.getElementById('tugasLink').value = t.link || '';
  document.getElementById('tugasPdfData').value = t.pdfData || '';
  const info = document.getElementById('pdfInfo');
  if (t.pdfData) { info.textContent = '📎 PDF sudah ada'; info.style.display = 'block'; } else { info.style.display = 'none'; }
  document.getElementById('modalTugasTitle').textContent = 'Edit Tugas';
  bukaModal('modalTugas');
}
document.getElementById('tugasFilePdf').addEventListener('change', function (e) {
  const file = e.target.files[0]; if (!file) return;
  const info = document.getElementById('pdfInfo'), hidden = document.getElementById('tugasPdfData');
  if (file.size > 2 * 1024 * 1024) { showToast('PDF maks 2MB!', 'error'); e.target.value = ''; return; }
  const r = new FileReader();
  r.onload = ev => { hidden.value = ev.target.result; info.textContent = '✅ ' + file.name; info.style.display = 'block'; };
  r.readAsDataURL(file);
});
document.getElementById('formTugas').addEventListener('submit', function (e) {
  e.preventDefault();
  const id = document.getElementById('tugasId').value;
  const matkulId = parseInt(document.getElementById('tugasMatkul').value);
  const nama = document.getElementById('tugasNama').value.trim();
  const deadline = document.getElementById('tugasDeadline').value;
  const link = document.getElementById('tugasLink').value.trim();
  const pdfData = document.getElementById('tugasPdfData').value || null;
  let data = getTugas();
  if (id) { const i = data.findIndex(t => t.id === parseInt(id)); data[i] = { ...data[i], nama, deadline, link, pdfData }; showToast('Tugas diupdate!'); }
  else { data.push({ id: Date.now(), matkulId, nama, deadline, link, pdfData }); showToast('Tugas disimpan!'); }
  setTugas(data); tutupModal('modalTugas'); renderMatkul(); renderDashboard();
});
function hapusTugas(id) {
  if (!confirm('Hapus tugas ini?')) return;
  setTugas(getTugas().filter(t => t.id !== id));
  showToast('Tugas dihapus!'); renderMatkul(); renderDashboard();
}

/* ============ CRUD MATERI ============ */
function bukaModalMateri() {
  const matkul = getMatkul();
  if (matkul.length === 0) { showToast('Buat matkul dulu!', 'warning'); return; }
  document.getElementById('formMateri').reset();
  document.getElementById('materiId').value = '';
  document.getElementById('materiFileData').value = '';
  document.getElementById('materiPdfInfo').style.display = 'none';
  document.getElementById('materiMatkul').innerHTML = matkul.map(m => `<option value="${m.id}">${m.nama}</option>`).join('');
  document.getElementById('modalMateriTitle').textContent = 'Tambah Materi';
  bukaModal('modalMateri');
}
function editMateri(id) {
  const m = getMateri().find(x => x.id === id); if (!m) return;
  const matkul = getMatkul();
  document.getElementById('materiId').value = m.id;
  document.getElementById('materiMatkul').innerHTML = matkul.map(mk => `<option value="${mk.id}" ${mk.id === m.matkulId ? 'selected' : ''}>${mk.nama}</option>`).join('');
  document.getElementById('materiJudul').value = m.judul;
  document.getElementById('materiDeskripsi').value = m.deskripsi || '';
  document.getElementById('materiLink').value = m.link || '';
  document.getElementById('materiFileData').value = m.pdfData || '';
  const info = document.getElementById('materiPdfInfo');
  if (m.pdfData) { info.textContent = '📎 PDF sudah ada'; info.style.display = 'block'; } else { info.style.display = 'none'; }
  document.getElementById('modalMateriTitle').textContent = 'Edit Materi';
  bukaModal('modalMateri');
}
document.getElementById('materiFilePdf').addEventListener('change', function (e) {
  const file = e.target.files[0]; if (!file) return;
  const info = document.getElementById('materiPdfInfo'), hidden = document.getElementById('materiFileData');
  if (file.size > 2 * 1024 * 1024) { showToast('PDF maks 2MB!', 'error'); e.target.value = ''; return; }
  const r = new FileReader();
  r.onload = ev => { hidden.value = ev.target.result; info.textContent = '✅ ' + file.name; info.style.display = 'block'; };
  r.readAsDataURL(file);
});
document.getElementById('formMateri').addEventListener('submit', function (e) {
  e.preventDefault();
  const id = document.getElementById('materiId').value;
  const matkulId = parseInt(document.getElementById('materiMatkul').value);
  const judul = document.getElementById('materiJudul').value.trim();
  const deskripsi = document.getElementById('materiDeskripsi').value.trim();
  const link = document.getElementById('materiLink').value.trim();
  const pdfData = document.getElementById('materiFileData').value || null;
  let data = getMateri();
  if (id) { const i = data.findIndex(m => m.id === parseInt(id)); data[i] = { ...data[i], matkulId, judul, deskripsi, link, pdfData }; showToast('Materi diupdate!'); }
  else { data.push({ id: Date.now(), matkulId, judul, deskripsi, link, pdfData }); showToast('Materi ditambahkan!'); }
  setMateri(data); tutupModal('modalMateri'); renderMateri(); renderDashboard();
});
function hapusMateri(id) {
  if (!confirm('Hapus materi ini?')) return;
  setMateri(getMateri().filter(m => m.id !== id));
  showToast('Materi dihapus!'); renderMateri(); renderDashboard();
}

/* ============ DETAIL & PDF ============ */
function lihatDetail(id) {
  const t = getTugas().find(x => x.id === id); if (!t) return;
  const selesai = isSelesai(t), terlambat = isTerlambat(t), s = hitungMundur(t.deadline);
  let html = `<p><strong>Nama:</strong><br>${t.nama}</p>
    <p style="margin-top:12px;"><strong>Deadline:</strong><br>${formatTanggal(t.deadline)}</p>
    <p style="margin-top:12px;"><strong>Status:</strong><br>
      ${selesai ? '<span class="badge badge-success">Terkumpul</span>' : terlambat ? '<span class="badge badge-danger">Terlambat</span>' : `<span class="badge badge-warning">Belum</span><br><span class="countdown-text ${s.class}" style="margin-top:6px;">${s.teks}</span>`}
    </p>`;
  if (t.link) html += `<p style="margin-top:12px;"><strong>Link:</strong><br><a href="${t.link}" target="_blank" style="color:var(--primary);">${t.link}</a></p>`;
  if (selesai) html += `<button class="btn-primary btn-sm" style="margin-top:16px;" onclick="bukaPdf('${t.pdfData}')">📄 Buka PDF</button>`;
  document.getElementById('detailContent').innerHTML = html;
  bukaModal('modalDetail');
}

function bukaPdf(base64) {
  const win = window.open();
  win.document.write(`<iframe src="${base64}" frameborder="0" style="position:fixed;top:0;left:0;width:100%;height:100%;"></iframe>`);
}

function exportPDF() { window.print(); }

/* ============ INIT ============ */
window.addEventListener('DOMContentLoaded', function () {
  initStorage();
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = 'fas fa-sun';
  }
  renderDashboard();
  setTimeout(() => {
    const belum = getTugas().filter(t => !isSelesai(t));
    if (belum.length) showToast(`⚠️ Ada ${belum.length} tugas belum terkumpul!`, 'warning');
  }, 1500);
});