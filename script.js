/* ============================================================
   script.js — Undangan Digital MAROON 3D 🌹
   ============================================================ */
const WEDDING_DATE = new Date('2026-09-12T08:00:00+07:00'); // ← ganti tanggal acara
const WISH_KEY = 'weddingWishes';

const $ = (id) => document.getElementById(id);
const escapeHtml = (s) => s.replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function showToast(msg){
  const t = $('toast'); if(!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- nama tamu (?to=Nama) ---------- */
const guest = new URLSearchParams(location.search).get('to');
if (guest){
  const g = $('guestName'); if (g) g.textContent = guest;
  const w = $('w-name');    if (w && !w.value) w.value = guest;
}

/* ---------- countdown ---------- */
function tick(){
  const d = $('cd-d'); if(!d) return;
  const diff = Math.max(0, WEDDING_DATE - new Date());
  $('cd-d').textContent = Math.floor(diff / 864e5);
  $('cd-h').textContent = String(Math.floor(diff / 36e5) % 24).padStart(2,'0');
  $('cd-m').textContent = String(Math.floor(diff / 6e4)  % 60).padStart(2,'0');
  $('cd-s').textContent = String(Math.floor(diff / 1e3)  % 60).padStart(2,'0');
}
tick(); setInterval(tick, 1000);

/* ---------- BUKA AMPLOP 3D ---------- */
if ($('openBtn')){
  $('openBtn').addEventListener('click', () => {
    const cover = $('cover');
    $('openBtn').disabled = true;
    cover.classList.add('opening');                 // amplop terbuka
    setTimeout(() => {
      cover.classList.add('opened');                // cover menghilang
      document.body.classList.remove('locked');
      const bgm = $('bgm');
      if (bgm) bgm.play().then(() => $('musicBtn').classList.add('playing')).catch(() => {});
    }, 1500);
  });
}

/* ---------- musik ---------- */
if ($('musicBtn') && $('bgm')){
  $('musicBtn').addEventListener('click', () => {
    const bgm = $('bgm');
    if (bgm.paused){ bgm.play();  $('musicBtn').classList.add('playing'); }
    else           { bgm.pause(); $('musicBtn').classList.remove('playing'); }
  });
}

/* ---------- partikel emas ---------- */
(function makePetals(){
  const box = $('petals'); if(!box) return;
  const icons = ['✦','✨','🌹','✦'];
  for (let i = 0; i < 16; i++){
    const s = document.createElement('span');
    s.textContent = icons[Math.floor(Math.random() * icons.length)];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.fontSize = (9 + Math.random() * 13) + 'px';
    s.style.animationDuration = (8 + Math.random() * 9) + 's';
    s.style.animationDelay = (-Math.random() * 12) + 's';
    box.appendChild(s);
  }
})();

/* ---------- reveal 3D saat scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- efek TILT 3D (kursor/sentuhan) ---------- */
if (matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top ) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  });
}

/* ---------- salin rekening ---------- */
document.querySelectorAll('.copy').forEach(btn => {
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); showToast('Nomor rekening tersalin ✅'); }
    catch { showToast('Gagal menyalin ❌'); }
  });
});

/* ---------- ucapan & doa ---------- */
function renderWishes(){
  const list = $('wishList'); if(!list) return;
  const data = JSON.parse(localStorage.getItem(WISH_KEY) || '[]');
  list.innerHTML = data.length ? '' : '<p class="empty">Jadilah yang pertama mengirim doa 🌹</p>';
  data.forEach(w => {
    const div = document.createElement('div'); div.className = 'wish';
    div.innerHTML =
      `<div class="wish-head"><b>${escapeHtml(w.name)}</b>` +
      `<span class="badge ${w.attend === 'Hadir' ? 'yes' : 'no'}">${w.attend}</span></div>` +
      `<p>${escapeHtml(w.msg)}</p><small>${w.time}</small>`;
    list.appendChild(div);
  });
}
renderWishes();

if ($('wishForm')){
  $('wishForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('w-name').value.trim(), msg = $('w-msg').value.trim();
    if (!name || !msg) return;
    const data = JSON.parse(localStorage.getItem(WISH_KEY) || '[]');
    data.unshift({ name, msg, attend: $('w-attend').value,
      time: new Date().toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' }) });
    localStorage.setItem(WISH_KEY, JSON.stringify(data));
    renderWishes(); $('wishForm').reset();
    showToast('Terima kasih! Doa terkirim 🤲');
  });
}
/* ---- load config dari admin ---- */
(function(){
  const cfg = JSON.parse(localStorage.getItem('weddingConfig') || '{}');
  const set = (s,t) => document.querySelectorAll(s).forEach(el => el.textContent = t);
  if (cfg.couple){
    set('.cover-names', cfg.couple);
    set('.env-names', cfg.couple);
    set('.hero-names', cfg.couple);
    set('.foot-names', cfg.couple);
    document.title = 'The Wedding of ' + cfg.couple;
  }
  if (cfg.dateLabel){
    set('.cover-date', cfg.dateLabel);
    set('.hero-date', cfg.dateLabel);
    set('.env-date', cfg.dateLabel.split('•').map(s => s.trim().substring(0,2)).join(' • '));
  }
  if (cfg.dateISO){
    window.WEDDING_DATE = new Date(cfg.dateISO);
    // jalankan tick ulang
    if (typeof tick === 'function') tick();
  }
})();