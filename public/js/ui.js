// HuntIn — shared UI helpers, constants, icons
const TYPES = ['Single Room', 'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4+ Bedroom', 'Apartment', 'House', 'Villa'];
// The world gazetteer (every country + major cities + currencies + languages) lives
// in world.js — loaded before this file. Compatibility shims keep the rest of the
// app reading the same names it always has.
const COUNTRIES = Object.values(CCBYN); // { n, cc, f, code, sym, lg, feat }
const CFLAG = Object.fromEntries(COUNTRIES.map(c => [c.n, c.f]));
const flagOf = n => CFLAG[n] || '';
// Real flag IMAGES — emoji flags don't render on Windows (Chrome/Edge show bare
// 'KE' letters instead of 🇰🇪), so every visible flag is a self-hosted SVG from
// /flags/{cc}.svg (192 files, MIT flag-icons, served same-origin so CSP img-src
// stays 'self'). The emoji stays only as the fallback for non-country strings.
const flagImg = (n, cls) => {
  const r = CCBYN[n];
  if (!r) return CFLAG[n] ? `<span class="femoji">${CFLAG[n]}</span>` : '';
  return `<img class="fimg${cls ? ' ' + cls : ''}" src="/flags/${r.cc.toLowerCase()}.svg" alt="${r.cc}" loading="lazy" width="21" height="15">`;
};
// tv(value) — translate a STORED enum value ('Per Month', 'Own meter', 'Guard'…)
// into the current language. The DB always keeps the English value; only the
// LABEL is translated. Slug = v_<words>, e.g. 'Singles / couples' -> v_singles_couples.
// Values with no dictionary entry (legacy free text) pass through unchanged.
const tv = v => {
  if (v == null) return '';
  const s = String(v);
  const slug = 'v_' + s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const tr = t(slug);
  return tr === slug ? s : tr; // t() echoes unknown keys back — detect and fall through
};
// long period word for the detail price line: 'Per Month' -> "month" (localized)
const perLong = p => !p ? t('per_mo') : p.startsWith('Per Month') ? t('per_mo') : p.startsWith('Per Semester') ? t('per_sem') : t('per_yr');
// Searchable country picker with real flags — replaces the old emoji <select>
// (emoji flags render as bare 'KE' letters on Windows, and 192 options need a
// search box anyway). Used by the create/edit wizard; onPick(countryName).
function openCountryPicker(current, onPick) {
  let q = '';
  const rows = () => {
    const hits = COUNTRIES.filter(c => !q || c.n.toLowerCase().includes(q) || c.cc.toLowerCase().startsWith(q));
    if (!hits.length) return `<p class="hint-t" style="padding:16px;text-align:center">${esc(t('no_country').replace('{q}', q))}</p>`;
    return hits.map(c => `<button type="button" class="cprow${current === c.n ? ' on' : ''}" data-n="${esc(c.n)}">
      ${flagImg(c.n)}<b style="flex:1">${esc(c.n)}</b><small>${esc(c.sym || '')}${c.sym ? ' · ' : ''}${esc(c.code || '')}</small>${current === c.n ? ic('check') : ''}</button>`).join('');
  };
  const paint = m => {
    m.querySelector('#cp-list').innerHTML = rows();
    m.querySelectorAll('.cprow').forEach(b => b.onclick = () => { closeModal(); if (onPick) onPick(b.dataset.n); });
  };
  modal(`<h3>${esc(t('cp_t'))}</h3>
    <input class="inp" id="cp-q" placeholder="${esc(t('cp_q'))}" style="margin:10px 0 12px" autocomplete="off">
    <div id="cp-list" style="max-height:52vh;overflow:auto;border:1px solid var(--line);border-radius:12px;background:var(--card)"></div>`,
    m => {
      paint(m);
      const qi = m.querySelector('#cp-q');
      qi.oninput = () => { q = qi.value.trim().toLowerCase(); paint(m); };
      qi.focus();
    });
}
// (CITIES is defined in world.js — loaded before this file)
// One planet, one site: the renter's own position (GPS) and the city they are
// browsing replace the old campus/county concepts.
const WORLD_CENTER = { lat: 20, lng: 5 }; // centres the whole planet in view
const FURN = ['Furnished', 'Semi-furnished', 'Unfurnished'];
const PERIODS = ['Per Month', 'Per Year'];
const WATER = ['Included in rent', 'Pay separately', 'Rationed'];
const ELEC = ['Included in rent', 'Own meter', 'Shared meter', 'Prepaid'];
const WIFI = ['Included in rent', 'Available but paid separately', 'Not available'];
const GARBAGE = ['Included', 'Not included', 'Paid separately'];
const BACKUP = ['None', 'Solar', 'Generator'];
const BATHS = ['1', '2', '3', '4+']; // bathroom COUNT — no more "shared/communal" hostel wording
const TENANTS = ['Anyone', 'Family', 'Singles / couples', 'Working professionals'];
const ROADS = ['Paved / tarmac', 'Gravel / dirt', 'Footpath only'];
const SECURITY = ['Guard', 'Gate lock', 'CCTV'];
// floors: free numeric input worldwide (Mumbai towers have 40+ floors) — see
// floorLabel() in world.js and the wizard's floor field. No more 1–10 dropdown.
const AVAIL_OPTIONS = ['Available now', 'Within a week', 'Within a month', 'Next month', 'Pick a date…'];
const REPORT_REASONS = ['Fake or scam listing', 'Unit is already taken', 'Wrong price or info', 'Poster is not the landlord', 'Misleading photos', 'Other'];
const BOOST = { days: 7 }; // free during launch — one tap, no payment

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const usd = n => '$' + Number(n || 0).toLocaleString('en-US');
// rent/deposit ALWAYS render in the listing's own local currency — a house in
// India shows ₹, in Kenya KSh, in the UK £. cur() is defined in world.js.
const shortK = n => '$' + (n >= 1000 ? ((n / 1000) >= 10 ? Math.round(n / 1000) : (n / 1000).toFixed(1).replace('.0', '')) + 'k' : String(n || 0));
const perShort = p => !p ? 'mo' : p.startsWith('Per Month') ? 'mo' : p.startsWith('Per Semester') ? 'sem' : 'yr';

function distMeters(a, b) {
  const R = 6371000, dLa = (b.lat - a.lat) * Math.PI / 180, dLo = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
// formatted distance from the renter to a point — "350 m", "2.3 km", "14 km"
const fmtDist = m => m == null ? '' : m < 950 ? Math.round(m / 50) * 50 + ' m' : (m / 1000).toFixed(m < 9500 ? 1 : 0).replace(/\.0$/, '') + ' km';

// ---- the renter's position & town (the heart of "houses near me") ----------
// pos: GPS position when the renter shares location. myTown: the town they are
// browsing — detected from GPS, or chosen by hand. Both persist on this device.
function getMyPos() { try { const v = JSON.parse(localStorage.getItem('hl_pos') || 'null'); return v && typeof v.lat === 'number' ? v : null; } catch (e) { return null; } }
function setMyPos(lat, lng) { try { localStorage.setItem('hl_pos', JSON.stringify({ lat: +lat, lng: +lng, at: Date.now() })); } catch (e) {} }
function getMyTown() { try { return localStorage.getItem('hl_town') || ''; } catch (e) { return ''; } }
function setMyTown(t) { try { t ? localStorage.setItem('hl_town', t) : localStorage.removeItem('hl_town'); } catch (e) {} }
function nearestTown(lat, lng) {
  let best = null, bd = Infinity;
  for (const t of CITIES) { const d = distMeters({ lat, lng }, t); if (d < bd) { bd = d; best = t; } }
  return { town: best.n, dist: bd };
}
function askLocation(cb) {
  if (!navigator.geolocation) { toast(t('geo_no_browser'), true); return; }
  toast(t('getting_loc'));
  navigator.geolocation.getCurrentPosition(
    p => {
      setMyPos(p.coords.latitude, p.coords.longitude);
      const near = nearestTown(p.coords.latitude, p.coords.longitude);
      if (near.dist < 60000) setMyTown(near.town); // GPS says which town you are in
      if (cb) cb(true);
    },
    () => { toast(t('loc_denied'), true); if (cb) cb(false); },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 }
  );
}
// distance line for a listing card, e.g. "· 2.3 km away" (empty when no GPS)
function distLabel(l) {
  const p = getMyPos();
  if (!p || l.lat == null || l.lng == null) return '';
  return t('ta_away').replace('{d}', fmtDist(distMeters(p, l)));
}

function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.max(1, (Date.now() - ts) / 1000);
  if (s < 60) return t('ta_now');
  if (s < 3600) return t('ta_m').replace('{n}', Math.floor(s / 60));
  if (s < 86400) return t('ta_h').replace('{n}', Math.floor(s / 3600));
  if (s < 86400 * 7) return t('ta_d').replace('{n}', Math.floor(s / 86400));
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
function fmtDate(ts) { return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
function fmtAvail(v) { if (!v) return t('now_b'); return /^\d{4}-\d{2}-\d{2}/.test(v) ? fmtDate(v) : tv(v); }
const parseSecurity = s => { try { const v = JSON.parse(s || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };

function amenityTags(l) {
  const a = [];
  if (l.water === 'Included in rent') a.push(t('am_water'));
  if (l.wifi === 'Included in rent') a.push('WiFi');
  if (l.elec === 'Included in rent') a.push(t('am_power'));
  if (l.ensuite === 'Yes' || l.bath === 'Ensuite (own)') a.push(t('am_ensuite'));
  if (l.kitchen === 'Yes' || l.kitchen === 'Own') a.push(t('am_kitchen'));
  if (l.parking === 'Yes') a.push(t('am_parking'));
  if (l.backup && l.backup !== 'None') a.push(t('am_backup').replace('{x}', tv(l.backup)));
  if (parseSecurity(l.security).includes('Guard')) a.push(t('am_guard'));
  return a.slice(0, 3).map(x => `<span class="mini-tag">${esc(x)}</span>`).join('');
}

// Search a place: the built-in world cities first (instant + always works),
// then worldwide Nominatim — any address, estate or landmark on Earth.
async function searchPlaces(q) {
  const raw = String(q || '').trim();
  if (!raw) return null;
  const low = raw.toLowerCase();
  const hit = CITIES.find(p => p.n.toLowerCase() === low)
    || CITIES.find(p => p.n.toLowerCase().startsWith(low))
    || CITIES.find(p => p.n.toLowerCase().includes(low));
  if (hit) return { lat: hit.lat, lng: hit.lng, local: true };
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=en&q=' + encodeURIComponent(raw), { headers: { Accept: 'application/json' } });
    const j = await r.json();
    if (j && j[0]) return { lat: +j[0].lat, lng: +j[0].lon, local: false };
  } catch (e) { /* offline — fall through */ }
  return null;
}

// Numbers are stored digits-only in international form (e.g. 254712345678, 447700900123)
function waLink(num, text) {
  const n = String(num || '').replace(/\D/g, '');
  return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
}

// ---------- icons (stroke) ----------
function ic(name, cls) {
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    pin: '<path d="M12 21s-7-5.9-7-11a7 7 0 1 1 14 0c0 5.1-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    chat: '<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.6 0-3-.4-4.3-1L3 21l1.6-4.2A8.5 8.5 0 1 1 21 12z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6"/>',
    heart: '<path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    bolt: '<path d="M13 2 4.5 13.5H11L9.5 22 18 10.5h-6.5L13 2z"/>',
    shield: '<path d="M12 2.5 20 6v6c0 5-3.4 8.2-8 9.5C7.4 20.2 4 17 4 12V6l8-3.5z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
    back: '<path d="M15 19 8 12l7-7"/>',
    phone: '<path d="M5 3h4l1.5 5L8 9.7a13 13 0 0 0 6.3 6.3l1.7-2.5 5 1.5v4a2 2 0 0 1-2.2 2A17.9 17.9 0 0 1 3 5.2 2 2 0 0 1 5 3z"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/>',
    check: '<path d="m4.5 12.5 5 5L19.5 7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1"/>',
    out: '<path d="M9 4H5v16h4"/><path d="M14 8l4 4-4 4M18 12H8"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    photo: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m4.5 17.5 5-5 3.5 3.5 3-3 3.5 3.5"/>',
    doc: '<path d="M6 2.5h8L19 8v13.5H6z"/><path d="M13.5 2.5V8H19"/>',
    wa: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z"/><path d="M8.8 9.2c.6 2.7 3.3 5.3 6 6l1.3-1.5-2-1.2-1 .7a6.4 6.4 0 0 1-2.3-2.3l.7-1-1.2-2-1.5 1.3z"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
    edit: '<path d="M4 20h4L20 8l-4-4L4 16v4z"/>',
    send: '<path d="M21 3 10.5 13.5M21 3l-7 18-3.5-7.5L3 10l18-7z"/>',
    star: '<path d="m12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.2-5.6-3.1L6.4 20l1.2-6.2L3 9.6l6.3-.8L12 3z"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7"/>',
    moon: '<path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 1 0 10.7 10.7z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.7 2.6 4 5.7 4 9s-1.3 6.4-4 9c-2.7-2.6-4-5.7-4-9s1.3-6.4 4-9z"/>',
  };
  // width/height attrs = safe intrinsic default (18px); CSS rules override per context.
  // Without these, an SVG with only a viewBox blows up to fill flex/grid containers.
  return `<svg class="${cls || ''}" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}

// ---------- toast / modal / lightbox ----------
// (theme keys live on this device under hl_* — see api.js token key)
let toastTimer;
function toast(msg, isErr) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (isErr ? ' err' : '');
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
}
function modal(html, onOpen) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-ov"><div class="modal">${html}</div></div>`;
  const ov = root.firstElementChild;
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  if (onOpen) onOpen(root.querySelector('.modal'));
  return () => closeModal();
}
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }
function confirmDlg(title, text, okLabel, cb, danger) {
  modal(`<h3>${esc(title)}</h3><p class="auth-sub">${esc(text)}</p>
    <div style="display:flex;gap:9px;margin-top:18px">
      <button class="btn btn-outline" style="flex:1" data-close>Cancel</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" style="flex:1" id="cf-ok">${esc(okLabel || 'Yes')}</button>
    </div>`, m => m.querySelector('#cf-ok').addEventListener('click', () => { closeModal(); cb(); }));
}
// report modal shared by listing page + chat thread
function openReport(listingId) {
  if (!state.user) { location.hash = '#/login'; return; }
  modal(`<h3>${esc(t('report_t'))}</h3>
    <label class="lbl">${esc(t('reason_l'))}</label>
    <select class="inp" id="rp-reason">${REPORT_REASONS.map(x => `<option>${esc(x)}</option>`).join('')}</select>
    <label class="lbl">${esc(t('report_details'))}</label>
    <textarea class="inp" id="rp-note" placeholder="${esc(t('report_ph'))}"></textarea>
    <button class="btn btn-primary btn-block" style="margin-top:14px" id="rp-send">${esc(t('report_send'))}</button>`,
    m => m.querySelector('#rp-send').onclick = async () => {
      const res = await api('/listings/' + listingId + '/report', { body: { reason: m.querySelector('#rp-reason').value, note: m.querySelector('#rp-note').value } });
      closeModal();
      toast(res.ok ? t('report_sent') : res.error, !res.ok);
    });
}

// Worldwide scam warning for renters (first visit per device)
function maybeStudentCaution() {
  let acked = false;
  try { acked = !!localStorage.getItem('hl_caution'); } catch (e) { return; }
  if (acked || !state.user || state.user.role === 'LANDLORD') return;
  modal(`<div style="text-align:center;padding:4px 2px">
    <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:18px;background:var(--ember-mist);color:var(--ember-deep);display:grid;place-items:center">${ic('shield')}</div>
    <h3 style="font-family:var(--disp);font-size:19px">${esc(t('caution_t'))}</h3>
    <p style="font-size:13.5px;color:var(--ink2);line-height:1.55;margin:8px 0 12px">${esc(t('caution_p'))}</p>
    <div class="notice notice-r" style="text-align:left;margin-bottom:14px">${ic('flag')}<span><b>${esc(t('caution_signs_t'))}</b> ${esc(t('caution_signs_d'))}</span></div>
    <button class="btn btn-green btn-block" id="ca-ok">${esc(t('caution_ok'))}</button>
  </div>`, m => m.querySelector('#ca-ok').onclick = () => {
    try { localStorage.setItem('hl_caution', '1'); } catch (e) {}
    closeModal();
  });
}

function lightbox(src) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = src;
  lb.hidden = false;
  lb.onclick = () => { lb.hidden = true; };
}

// ---------- light / dark / system theme ----------
// Three modes, like every other website: LIGHT, DARK, or SYSTEM (follows the
// phone/computer setting and switches automatically). The choice is saved per device.
// First-ever visitors get SYSTEM default — no saved choice means "match my device".
const THEME_META = { light: '#0e5a33', dark: '#141713' };
const THEME_NAMES = { light: 'Light mode', dark: 'Dark mode', system: 'System default' };
const sysDark = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); } catch (e) { return false; } };
function resolveTheme(mode) { return (mode === 'dark' || (mode !== 'light' && sysDark())) ? 'dark' : 'light'; }
function themeName(mode) { return mode === 'system' ? t('theme_sys') : mode === 'dark' ? t('theme_dark') : t('theme_light'); }
function applyTheme(mode, save) {
  if (save) { try { localStorage.setItem('hl_theme', mode); } catch (e) {} }
  const th = resolveTheme(mode);
  document.documentElement.dataset.theme = th;
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', THEME_META[th]);
  // keep every toggle button on the page in sync (topbar, side nav, profile row).
  // Rich rows (profile) keep their own markup — we only swap the icon + state text.
  document.querySelectorAll('[data-theme-toggle]').forEach(b => {
    const ico = ic(mode === 'system' ? 'gear' : (th === 'dark' ? 'sun' : 'moon'));
    const st = b.querySelector('.theme-state');
    if (st) {
      st.textContent = mode === 'system' ? t('theme_sys_s') : (th === 'dark' ? t('theme_dark_s') : t('theme_light_s'));
      const sv = b.querySelector('svg');
      if (sv) sv.outerHTML = ico;
    } else {
      b.innerHTML = `${ico}<span class="theme-lbl">${themeName(mode)}</span>`;
      b.title = t('theme') + ': ' + themeName(mode);
    }
  });
}
function currentTheme() {
  try {
    const saved = localStorage.getItem('hl_theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
  } catch (e) {}
  return 'system'; // no choice made yet → follow the device's own setting
}
function toggleTheme() {
  const order = ['light', 'dark', 'system'];
  const next = order[(order.indexOf(currentTheme()) + 1) % order.length];
  applyTheme(next, true);
  toast(t('theme') + ': ' + themeName(next));
}

// ---------- admin notification badges ----------
// The API returns one tiny row: how many verifications / boosts / reports are waiting.
// renderAdminBadges() lights up every badge on the page — admin tabs, side-nav Admin
// link, profile row — so Isaac sees "something new" the moment it arrives.
function renderAdminBadges(c) {
  if (!c) return;
  const set = (key, n) => {
    document.querySelectorAll(`[data-adm-badge="${key}"]`).forEach(el => {
      if (n > 0) { el.textContent = n > 9 ? '9+' : n; el.hidden = false; }
      else el.hidden = true;
    });
  };
  const total = (c.verifications || 0) + (c.boosts || 0) + (c.reports || 0);
  set('verifications', c.verifications || 0);
  set('boosts', c.boosts || 0);
  set('reports', c.reports || 0);
  set('total', total);
}
async function refreshAdminCounts() {
  if (!state.user || state.user.role !== 'ADMIN') return;
  const r = await api('/admin/counts');
  if (r.ok) renderAdminBadges(r.counts || r);
}

// ---------- listing card ----------
// vacancy — the #1 thing renters scan for. Never hide it, never make it tiny:
//   0 vacant -> red ALL OCCUPIED badge + card photo dimmed
//   some vacant -> green badge with the exact count ("3 VACANT of 6" / "VACANT")
function vacInfo(l) {
  const u = Math.max(1, l.units || 1);
  const v = l.unitsVacant == null ? (l.status === 'TAKEN' ? 0 : u)
    : Math.max(0, Math.min(l.unitsVacant, u));
  const full = v <= 0 || l.status === 'TAKEN';
  return {
    u, v, full,
    label: full ? (u > 1 ? t('card_all_occ').replace('{u}', u) : t('card_occupied'))
      : (u <= 1 ? t('vacant_now') : t('card_vac_of').replace('{v}', v).replace('{u}', u)),
    badge: full
      ? `<span class="badge-vac full">${ic('x')} ${esc(t('badge_all_occ'))}</span>`
      : (u <= 1
        ? `<span class="badge-vac open">${ic('check')} ${esc(t('badge_vacant'))}</span>`
        : `<span class="badge-vac open">${ic('check')} ${v} ${esc(t('badge_vacant'))}<span class="bv-of">${esc(t('badge_of').replace('{u}', u))}</span></span>`),
  };
}
function listingCard(l) {
  const boosted = l.boostedUntil && l.boostedUntil > Date.now();
  const verified = l.ownerVerified === 'APPROVED';
  const fl = flagImg(l.country);
  const locTxt = [esc(l.town), l.area ? esc(l.area) : '', l.country ? fl + ' ' + esc(l.country) : l.landmark ? esc(l.landmark) : ''].filter(Boolean).join(' · ');
  const dl = distLabel(l);
  const vac = vacInfo(l);
  return `<a class="card${vac.full ? ' occupied' : ''}" href="#/listing/${l.id}">
    <div class="cph">${l.thumb ? `<img loading="lazy" src="${l.thumb}" alt="${esc(l.title)}">` : `<div class="cph-empty">${ic('photo')}</div>`}
      <span class="wm"></span>
      ${boosted ? `<span class="badge-boost">${ic('bolt')}BOOSTED</span>` : ''}
      ${vac.badge}
    </div>
    <div class="cbody">
      <div class="cprice">${cur(l.rent, l.country)}<span>/${perShort(l.period)}</span></div>
      <div class="ctitle">${esc(l.title)}</div>
      <div class="cmeta">${ic('pin')}<span>${locTxt}</span></div>
      <div class="ctags">${amenityTags(l)}${dl ? `<span class="mini-tag" style="color:var(--pine-accent)">${ic('pin')} ${esc(dl)}</span>` : ''}</div>
      <div class="cfoot"><span>${verified ? `<span class="vbadge">${ic('shield')}Verified</span>` : ''}</span><span>${l.views || 0} views · ${timeAgo(l.createdAt)}</span></div>
    </div></a>`;
}
const skeletonGrid = n => `<div class="grid">${Array(n).fill('<div><div class="skel" style="aspect-ratio:4/3;border-radius:16px 16px 0 0"></div><div class="skel" style="height:110px;border-radius:0 0 16px 16px;margin-top:-1px"></div></div>').join('')}</div>`;
const emptyBox = (title, text) => `<div class="empty">${ic('pin')}<h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;

// ---------- password strength (register + setup forms) ----------
// The server enforces the same rules — this is the live feedback so nobody
// guesses: 8+ chars, UPPER + lower, a digit. 30 common passwords are rejected
// outright (leetspeak-normalised: p4ssw0rd counts as "password").
const PW_COMMON = ['password','12345678','123456789','1234567890','qwerty123','qwerty12345','password1','password123','iloveyou','admin123','welcome1','welcome123','letmein1','monkey123','dragon123','abc12345','abc123456','11111111','00000000','12341234','1234123412','sunshine1','princess1','football1','baseball1','superman1','trustno1','hunter2','passw0rd','p@ssw0rd'];
const pwNorm = p => String(p || '').toLowerCase().replace(/[04513@$!]/g, m => ({ '0': 'o', '4': 'a', '5': 's', '1': 'i', '3': 'e', '@': 'a', '$': 's', '!': 'i' }[m] || m));
function pwChecks(p) {
  p = String(p || '');
  return {
    len: p.length >= 8,
    case: /[a-z]/.test(p) && /[A-Z]/.test(p),
    digit: /[0-9]/.test(p),
    common: PW_COMMON.some(c => pwNorm(p).includes(c)),
  };
}
function pwScore(p) {
  const c = pwChecks(p);
  const good = [c.len, c.case, c.digit].filter(Boolean).length;
  return { ...c, strength: good === 3 && !c.common && p.length >= 12 ? 'strong' : (good === 3 && !c.common ? 'ok' : 'weak') };
}
function pwMeterHtml() {
  return `<div class="pw-meter" hidden>
    <div class="pw-bar"><i></i></div>
    <div class="pw-reqs">
      <span data-r="len">${ic('check')} ${esc(t('pw_len'))}</span>
      <span data-r="case">${ic('check')} ${esc(t('pw_case'))}</span>
      <span data-r="digit">${ic('check')} ${esc(t('pw_digit'))}</span>
    </div></div>`;
}
function wirePwMeter(input) {
  const meter = input.parentElement.querySelector('.pw-meter') || input.closest('form,div')?.querySelector('.pw-meter');
  if (!meter) return;
  meter.hidden = false;
  input.addEventListener('input', () => {
    const s = pwScore(input.value);
    meter.className = 'pw-meter ' + s.strength;
    meter.querySelectorAll('[data-r]').forEach(el => {
      const on = s[el.dataset.r === 'case' ? 'case' : el.dataset.r];
      el.classList.toggle('ok', on && el.dataset.r !== 'common');
      el.classList.toggle('bad', !on && el.dataset.r !== 'common');
    });
  });
}

function applyCC() {
  const cc = state.cc || '';
  document.querySelectorAll('[data-cc]').forEach(el => { el.textContent = cc; });
  const title = (typeof t === 'function' ? t('hero_title') : '') || 'Houses, Apartments & Rentals worldwide';
  document.title = cc ? 'HuntIn ' + cc + ' — ' + title : 'HuntIn — ' + title;
}
