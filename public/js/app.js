// HuntIn — router, navigation shell, boot
let cleanups = [];
function onLeave(fn) { cleanups.push(fn); }

// Route generation token — the #view element lives for the whole session, only its
// innerHTML changes. Any view that awaits a fetch then writes innerHTML could land
// AFTER the user has already navigated elsewhere (the classic "opened Chats, tapped
// Map, and the chat list painted over the map" bug). Every async view captures
// routeGen at entry and bails if it has gone stale by the time the fetch returns.
let routeGen = 0;
const stale = gen => gen !== routeGen;

const NAV = [
  ['#/', 'home', 'Home'],
  ['#/search', 'search', 'Search'],
  ['#/map', 'pin', 'Map'],
  ['#/chats', 'chats', 'Chats'],
  ['#/profile', 'user', 'Profile'],
];
const navLabel = key => t('nav_' + ({ pin: 'map', user: 'profile' }[key] || key)); // 首页/搜索/خريطة… per the chosen language

const ROUTES = [
  [/^(|home|privacy)$/i, m => m[1].toLowerCase() === 'privacy' ? viewPrivacy() : viewHome()],
  [/^search$/i, () => viewSearch()],
  [/^map$/i, () => viewMap()],
  [/^listing\/(\d+)$/i, m => viewListing(+m[1])],
  [/^new$/i, () => viewCreate(null)],
  [/^edit\/(\d+)$/i, m => viewCreate(+m[1])],
  [/^(login|register)$/i, m => viewAuth(m[1].toLowerCase())],
  [/^setup$/i, () => viewSetup()],
  [/^welcome$/i, () => viewWelcome()],
  [/^profile$/i, () => viewProfile()],
  [/^favorites$/i, () => viewFavorites()],
  [/^mylistings$/i, () => viewMyListings()],
  [/^boost\/(\d+)$/i, m => viewBoost(+m[1])],
  [/^chats$/i, () => viewChats()],
  [/^chat\/(\d+)$/i, m => viewThread(+m[1])],
  [/^admin(?:\/(\w+))?$/i, m => viewAdmin(m[1])],
];

async function route() {
  routeGen++;
  cleanups.forEach(f => { try { f(); } catch {} });
  cleanups = [];
  window.scrollTo({ top: 0 });
  const hash = (location.hash || '#/').replace(/^#\/?/, '');
  const name = hash.split('/')[0] || 'home';
  for (const [re, fn] of ROUTES) {
    const m = hash.match(re);
    if (m) { buildNav(name); try { await fn(m); } catch (e) { console.error(e); } return; }
  }
  document.getElementById('view').innerHTML = emptyBox('Page not found', 'The link may be wrong. Use the navigation below.');
  buildNav('');
}

function buildNav(active) {
  const name = active !== undefined ? active : (location.hash.replace(/^#\/?/, '').split('/')[0] || 'home');
  // route-name → bottom-nav key (map → pin: without this the Map tab never highlighted)
  const map = { '': 'home', listing: 'home', new: 'home', edit: 'home', boost: 'home', favorites: 'home', mylistings: 'profile', login: 'profile', register: 'profile', setup: 'profile', admin: 'profile', chat: 'chats', thread: 'chats', map: 'pin' };
  const cur = map[name] !== undefined ? map[name] : name;

  const bn = document.getElementById('bottomnav');
  bn.innerHTML = NAV.map(([href, key, label]) => {
    const path = href === '#/' ? '#/' : href;
    return `<a class="bn-item ${cur === key ? 'on' : ''}" href="${path}" data-nav="${key}">
      ${ic(key === 'home' ? 'home' : key === 'search' ? 'search' : key === 'map' ? 'pin' : key === 'chats' ? 'chat' : 'user')}
      <span>${esc(navLabel(key))}</span>${key === 'chats' ? '<span class="bn-badge" id="nav-dot" hidden></span>' : ''}</a>`;
  }).join('');

  const sn = document.getElementById('sidenav-links');
  const links = [...NAV.map(([href, key]) => [href, key, navLabel(key)]),
    ...(state.user && state.user.role === 'ADMIN' ? [['#/admin', 'gear', navLabel('admin'), 'adm']] : []),
    ...(state.user && state.user.role === 'LANDLORD' ? [['#/mylistings', 'doc', 'My listings'], ['#/new', 'plus', 'Post a listing']] : []),
    ...(state.user ? [['#/favorites', 'heart', 'Favourites']] : [])];
  sn.innerHTML = links.map(([href, key, label, badge]) =>
    `<a class="sl ${cur === key ? 'on' : ''}" href="${href}" data-nav="${key}">${ic(key === 'chats' ? 'chat' : key)}<span>${esc(label)}</span>${key === 'chats' ? '<span class="bn-badge" id="snav-dot" hidden></span>' : ''}${badge === 'adm' ? '<span class="bn-badge" data-adm-badge="total" hidden></span>' : ''}</a>`).join('');

  const ta = document.getElementById('top-actions');
  const foot = document.getElementById('sidenav-foot');
  if (state.user) {
    ta.innerHTML = `<button class="btn btn-outline btn-sm" id="lang-btn" title="${esc(t('pick_lang'))}">${ic('globe')}</button><a class="btn btn-outline btn-sm" href="#/profile">${esc((state.user.name || state.user.username).split(' ')[0])}</a>`;
    foot.innerHTML = `Signed in as <b>${esc(state.user.username)}</b><br><button class="btn btn-ghost btn-sm" id="sn-out" style="margin-top:6px">${ic('out')} ${esc(t('signout'))}</button>`;
  } else {
    ta.innerHTML = `<button class="btn btn-outline btn-sm" id="lang-btn" title="${esc(t('pick_lang'))}">${ic('globe')}</button><a class="btn btn-outline btn-sm" href="#/login">${esc(t('signin'))}</a><a class="btn btn-primary btn-sm" href="#/register">${esc(t('create_account'))}</a>`;
    foot.innerHTML = `<button class="btn btn-outline btn-sm btn-block" id="sn-lang" style="margin-bottom:6px">${ic('globe')} ${esc(t('pick_lang'))}</button><a class="btn btn-green btn-sm btn-block" href="#/register">${esc(t('create_account'))}</a>`;
  }
  const lb = document.getElementById('lang-btn'); if (lb) lb.onclick = openLangPicker;
  const slb = document.getElementById('sn-lang'); if (slb) slb.onclick = openLangPicker;
  const sout = document.getElementById('sn-out');
  if (sout) sout.onclick = async () => {
    await api('/logout', { method: 'POST' });
    token.set(null); state.user = null; buildNav();
    location.hash = '#/home'; toast('Signed out');
  };
  refreshUnread();
}

async function refreshUnread() {
  if (!state.user) return;
  const r = await api('/unread');
  if (!r.ok) return;
  const n = Number(r.n || 0);
  document.querySelectorAll('#nav-dot, #snav-dot').forEach(d => {
    if (!d) return;
    if (n > 0) { d.textContent = n > 9 ? '9+' : n; d.hidden = false; }
    else d.hidden = true;
  });
  // admins also get told about new verifications / boosts / reports (badge lights up
  // on the Admin links and on the admin section tabs) — one tiny 1-row query
  if (state.user.role === 'ADMIN') refreshAdminCounts();
}

// ---------- boot ----------
(async function boot() {
  applyI18n(); // html lang + rtl direction before first paint
  applyTheme(currentTheme()); // before first paint of the shell — respects the saved light/dark/system choice
  // cached country suffix paints instantly (last visit's country); /api/geo below corrects it
  try { const saved = localStorage.getItem('hl_cc'); if (saved) { state.cc = saved; applyCC(); } } catch (e) {}
  // every view render re-applies the suffix (login/setup cards carry [data-cc] spans too)
  try { new MutationObserver(() => applyCC()).observe(document.getElementById('view'), { childList: true }); } catch (e) {}
  // in "system" mode, follow the device's own light/dark setting live (no reload needed)
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (currentTheme() === 'system') applyTheme('system');
    });
  } catch (e) { /* old browser — the choice simply applies on next load */ }
  // one delegated handler runs every theme button on any page (topbar, side nav, profile)
  document.addEventListener('click', e => {
    if (e.target.closest('[data-theme-toggle]')) { e.preventDefault(); toggleTheme(); }
  });
  try {
    const [s, m, g] = await Promise.all([api('/settings'), token.get() ? api('/me') : Promise.resolve(null), api('/geo')]);
    if (s && s.ok && s.settings) state.settings = { ...state.settings, ...s.settings };
    if (m && m.ok && m.user) { state.user = m.user; if (m.token) token.set(m.token); }
    // visitor country → HUNTIN <CC> wordmark suffix (HuntIn KE / UG / US …)
    const cc = g && g.ok && g.country ? String(g.country).toUpperCase().slice(0, 2) : '';
    if (cc !== state.cc) {
      state.cc = cc;
      try { if (cc) localStorage.setItem('hl_cc', cc); else localStorage.removeItem('hl_cc'); } catch (e) {}
      applyCC();
    }
    // first visit in a country whose main language isn't English → open the app in
    // that language (India → हिन्दी, Brazil → Português, Egypt → العربية…). A saved
    // choice always wins; the globe button switches anytime.
    autoLang(cc); // stored before buildNav()/route() below → first paint already translated
  } catch (e) { console.error('boot', e); }
  buildNav();
  window.addEventListener('hashchange', route);
  route();
  // unread badge poll — paused entirely while the tab is hidden (visibilitychange re-checks
  // the moment you come back). One of several changes that cut background server load ~75%.
  setInterval(() => { if (!document.hidden) refreshUnread(); }, 8000);
  window.addEventListener('focus', refreshUnread);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshUnread(); });
  maybeStudentCaution();
  const sp = document.getElementById('splash');
  if (sp) setTimeout(() => { sp.classList.add('off'); setTimeout(() => sp.remove(), 600); }, 750);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
})();
