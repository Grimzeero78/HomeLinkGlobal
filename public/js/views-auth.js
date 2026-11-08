// HuntIn — Login / Register / Setup / Profile
function authRedirect() { location.hash = state.user && state.user.role === 'ADMIN' ? '#/admin' : '#/home'; }

// target: optional hash to go to after auth — registration sends new users to the welcome guide
async function afterAuth(res, target) {
  if (!res.ok) { toast(res.error, true); return; }
  token.set(res.token);
  state.user = res.user;
  buildNav();
  toast(t('welcome_w') + ', ' + (res.user.name || res.user.username) + '!');
  if (target) location.hash = target; else authRedirect();
  maybeStudentCaution();
}

function viewAuth(tab) {
  const v = document.getElementById('view');
  const isReg = tab === 'register';
  v.innerHTML = `<div class="auth-wrap"><div class="auth-card">
    <div class="auth-brand">
      <img class="auth-logo" src="/icons/icon-192.png" alt="HuntIn logo" width="60" height="60">
      <div class="auth-name">Hunt<b>In</b><span class="cc" data-cc></span></div>
      <p class="auth-tag">${isReg
        ? esc(t('auth_reg_tag'))
        : esc(t('auth_login_tag'))}</p>
    </div>
    <div class="seg" style="margin:16px 0">
      <button id="t-login" class="${isReg ? '' : 'on'}">${esc(t('signin'))}</button>
      <button id="t-reg" class="${isReg ? 'on' : ''}">${esc(t('create_account'))}</button>
    </div>
    <div id="auth-body">${isReg ? regForm() : loginForm()}</div>
    <div class="auth-alt">${isReg
      ? esc(t('have_acct')) + ' <a href="#/login">' + esc(t('signin')) + '</a>'
      : esc(t('no_acct')) + ' <a href="#/register">' + esc(t('create_an_account')) + '</a>'}</div>
  </div></div>`;

  v.querySelector('#t-login').onclick = () => viewAuth('login');
  v.querySelector('#t-reg').onclick = () => viewAuth('register');
  wireLogin(v); wireReg(v);
}

function loginForm() {
  return `
    <label class="lbl">${esc(t('username'))}</label><input class="inp" id="li-u" autocomplete="username" placeholder="${esc(t('username'))}">
    <label class="lbl">${esc(t('password_l'))}</label><input class="inp" id="li-p" type="password" autocomplete="current-password" placeholder="••••••••">
    <button class="btn btn-green btn-block" id="li-go" style="margin-top:16px">${esc(t('signin'))}</button>
    <button class="btn btn-ghost btn-block" id="li-forgot" style="margin-top:6px;font-size:13px">${esc(t('forgot'))}</button>`;
}

function wireLogin(v) {
  const go = v.querySelector('#li-go'); if (!go) return;
  const submit = async () => {
    go.disabled = true;
    const res = await api('/login', { body: { username: v.querySelector('#li-u').value, password: v.querySelector('#li-p').value } });
    go.disabled = false;
    afterAuth(res);
  };
  go.onclick = submit;
  v.querySelector('#li-p').addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  v.querySelector('#li-forgot').onclick = () => {
    modal(`<h3>${esc(t('forgot_t'))}</h3>
      <p class="hint-t">${esc(t('forgot_d'))}</p>
      <input class="inp" id="fg-u" placeholder="${esc(t('username'))}" style="margin-top:10px">
      <div id="fg-out"></div>
      <button class="btn btn-green btn-block" style="margin-top:14px" id="fg-go">${esc(t('show_hint'))}</button>`,
      m => m.querySelector('#fg-go').onclick = async () => {
        const r = await api('/hint/' + encodeURIComponent(m.querySelector('#fg-u').value.trim().toLowerCase()));
        m.querySelector('#fg-out').innerHTML = r.ok
          ? `<div class="notice notice-g" style="margin-top:12px">${ic('shield')}<span>${r.hint ? esc(t('your_hint')) + ' <b>' + esc(r.hint) + '</b>' : esc(t('no_acct_found'))}</span></div>`
          : `<div class="notice notice-o" style="margin-top:12px">${ic('flag')}<span>${esc(r.error)}</span></div>`;
      });
  };
}

function regForm() {
  return `
    <label class="lbl">${esc(t('i_am'))}</label>
    <div class="seg" id="rg-role"><button type="button" class="on" data-v="SEEKER">${esc(t('renter'))}</button><button type="button" data-v="LANDLORD">${esc(t('landlord_l'))}</button></div>
    <label class="lbl">${esc(t('full_name'))}</label><input class="inp" id="rg-name" placeholder="${esc(t('name_ph'))}">
    <label class="lbl">${esc(t('whatsapp_l'))} <span style="font-weight:500">(${esc(t('phone_cc'))})</span></label>
    <input class="inp" id="rg-phone" inputmode="tel" placeholder="${esc(t('phone_ph'))}">
    <label class="lbl">${esc(t('username_l'))}</label><input class="inp" id="rg-u" autocomplete="username" placeholder="${esc(t('username_ph'))}">
    <label class="lbl">${esc(t('password_l'))}</label><input class="inp" id="rg-p" type="password" autocomplete="new-password" placeholder="${esc(t('pw_ph'))}">
    ${pwMeterHtml()}
    <label class="lbl">${esc(t('confirm_l'))}</label><input class="inp" id="rg-p2" type="password" autocomplete="new-password" placeholder="${esc(t('confirm_ph'))}">
    <label class="lbl">${esc(t('hint_l'))}</label>
    <input class="inp" id="rg-hint" placeholder="${esc(t('hint_ph'))}">
    <p class="hint-t">${esc(t('hint_help'))}</p>
    <button class="btn btn-green btn-block" id="rg-go" style="margin-top:18px">${esc(t('create_account'))}</button>`;
}

function wireReg(v) {
  const seg = v.querySelector('#rg-role'); if (!seg) return;
  let role = 'SEEKER';
  seg.querySelectorAll('button').forEach(b => b.onclick = () => {
    seg.querySelectorAll('button').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); role = b.dataset.v;
  });
  v.querySelector('#rg-go').onclick = async () => {
    const btn = v.querySelector('#rg-go'); btn.disabled = true;
    const pw = v.querySelector('#rg-p').value;
    const s = pwScore(pw);
    if (pw.length < 8) { toast(t('pw_len') + ' — ' + t('pw_ph'), true); btn.disabled = false; return; }
    if (!s.case) { toast(t('pw_case'), true); btn.disabled = false; return; }
    if (!s.digit) { toast(t('pw_digit'), true); btn.disabled = false; return; }
    if (s.common) { toast(t('pw_common'), true); btn.disabled = false; return; }
    if (pw !== v.querySelector('#rg-p2').value) { toast(t('pw_mismatch'), true); btn.disabled = false; return; }
    const res = await api('/register', {
      body: {
        role, name: v.querySelector('#rg-name').value, phone: v.querySelector('#rg-phone').value,
        username: v.querySelector('#rg-u').value, password: pw,
        confirm: v.querySelector('#rg-p2').value, hint: v.querySelector('#rg-hint').value,
      }
    });
    btn.disabled = false;
    afterAuth(res, '#/welcome');
  };
  const pin = v.querySelector('#rg-p'); if (pin) wirePwMeter(pin);
}

// ---------- first-run admin setup ----------
async function viewSetup() {
  const v = document.getElementById('view');
  const gen = routeGen;
  const r = await api('/setup');
  if (stale(gen)) return;
  if (!r.ok || !r.available) { location.hash = '#/login'; return; }
  v.innerHTML = `<div class="auth-wrap"><div class="auth-card">
    <div class="auth-brand">
      <img class="auth-logo" src="/icons/icon-192.png" alt="HuntIn logo" width="60" height="60">
      <div class="auth-name">Hunt<b>In</b><span class="cc" data-cc></span></div>
      <p class="auth-tag">${esc(t('setup_tag'))}</p>
    </div>
    <span class="pill pill-o" style="margin-bottom:10px">${ic('shield')} ${esc(t('setup_pill'))}</span>
    <h1>${esc(t('setup_h1'))}</h1>
    <p class="auth-sub">${esc(t('setup_sub'))}</p>
    <label class="lbl">${esc(t('setup_name'))}</label><input class="inp" id="su-name" placeholder="${esc(t('setup_name_ph'))}">
    <label class="lbl">${esc(t('whatsapp_l'))}</label><input class="inp" id="su-phone" inputmode="tel" placeholder="${esc(t('setup_phone_ph'))}">
    <label class="lbl">${esc(t('username'))}</label><input class="inp" id="su-u" placeholder="${esc(t('setup_user_ph'))}">
    <label class="lbl">${esc(t('password_l'))}</label><input class="inp" id="su-p" type="password" autocomplete="new-password" placeholder="${esc(t('pw_ph'))}">
    ${pwMeterHtml()}
    <label class="lbl">${esc(t('confirm_l'))}</label><input class="inp" id="su-p2" type="password" autocomplete="new-password">
    <label class="lbl">${esc(t('hint_l'))}</label><input class="inp" id="su-hint">
    <button class="btn btn-green btn-block" id="su-go" style="margin-top:18px">${esc(t('setup_go'))}</button>
  </div></div>`;
  v.querySelector('#su-go').onclick = async () => {
    const btn = v.querySelector('#su-go'); btn.disabled = true;
    const pw = v.querySelector('#su-p').value;
    const s = pwScore(pw);
    if (pw.length < 8) { toast(t('pw_len') + ' — ' + t('pw_ph'), true); btn.disabled = false; return; }
    if (!s.case) { toast(t('pw_case'), true); btn.disabled = false; return; }
    if (!s.digit) { toast(t('pw_digit'), true); btn.disabled = false; return; }
    if (s.common) { toast(t('pw_common'), true); btn.disabled = false; return; }
    if (pw !== v.querySelector('#su-p2').value) { toast(t('pw_mismatch'), true); btn.disabled = false; return; }
    const res = await api('/setup', {
      body: {
        name: v.querySelector('#su-name').value, phone: v.querySelector('#su-phone').value,
        username: v.querySelector('#su-u').value, password: pw,
        confirm: v.querySelector('#su-p2').value, hint: v.querySelector('#su-hint').value,
      }
    });
    btn.disabled = false;
    afterAuth(res);
  };
  const spin = v.querySelector('#su-p'); if (spin) wirePwMeter(spin);
}

// settings-style row (port of the prototype prow)
function prow(icon, title, sub, href) {
  return `<a class="prow" href="${href}">${ic(icon)}<span class="mid"><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span>${ic('chev', 'chev')}</a>`;
}

// ---------- profile ----------
// Details are shown READ-ONLY; the Edit button opens the edit form (Save / Cancel).
async function viewProfile(edit) {
  if (!state.user) { location.hash = '#/login'; return; }
  const v = document.getElementById('view');
  const u = state.user;
  const isLandlord = u.role === 'LANDLORD';
  const roleTxt = u.role === 'ADMIN' ? t('role_admin') : isLandlord ? t('role_landlord') : t('role_renter');

  // ---- read-only view ----
  if (!edit) {
    v.innerHTML = `<div class="sec-h"><h2>${esc(t('my_profile'))}</h2></div>
    <div class="auth-card">
      <div class="owner-row">
        <div class="avatar">${esc((u.name || u.username)[0].toUpperCase())}</div>
        <div><div class="nm" style="font-weight:800;font-size:16px">${esc(u.name || u.username)}</div>
        <div class="sb">@${esc(u.username)} · ${esc(roleTxt)} · ${esc(t('joined'))} ${fmtDate(u.createdAt)}</div></div>
      </div>
      <div style="margin-top:14px">
        <div class="kv"><span class="k">${esc(t('full_name'))}</span><span class="v">${esc(u.name || '—')}</span></div>
        <div class="kv"><span class="k">${esc(t('whatsapp_l'))}</span><span class="v">${esc(u.phone || '—')}</span></div>
        <div class="kv"><span class="k">${esc(t('account_l'))}</span><span class="v">${esc(roleTxt)}</span></div>
      </div>
      <button class="btn btn-green" id="pf-edit" style="margin-top:16px">${ic('edit')} ${esc(t('edit_profile'))}</button>
    </div>`;
    v.querySelector('#pf-edit').onclick = () => viewProfile(true);
  }

  // ---- edit form ----
  if (edit) {
    v.innerHTML = `<div class="sec-h"><h2>${esc(t('edit_profile'))}</h2></div>
    <div class="auth-card">
      <label class="lbl">${esc(t('full_name'))}</label><input class="inp" id="pf-name" value="${esc(u.name)}">
      <label class="lbl">${esc(t('whatsapp_l'))} <span style="font-weight:500">(${esc(t('shown_other'))})</span></label>
      <input class="inp" id="pf-phone" inputmode="tel" value="${esc(u.phone)}">
      <div style="display:flex;gap:9px;margin-top:16px">
        <button class="btn btn-outline" id="pf-cancel" style="flex:1">${esc(t('cancel'))}</button>
        <button class="btn btn-green" id="pf-save" style="flex:1">${esc(t('save_changes'))}</button>
      </div>
    </div>`;
    v.querySelector('#pf-cancel').onclick = () => viewProfile(false);
    v.querySelector('#pf-save').onclick = async () => {
      const body = { name: v.querySelector('#pf-name').value, phone: v.querySelector('#pf-phone').value };
      const res = await api('/me', { method: 'PUT', body });
      if (res.ok) { state.user = res.user; buildNav(); toast(t('profile_saved')); viewProfile(false); }
      else toast(res.error, true);
    };
  }

  const admRow = u.role === 'ADMIN'
    ? `<a class="prow" href="#/admin">${ic('gear')}<span class="mid"><b>${esc(t('admin_panel'))}</b><small>${esc(t('admin_panel_d'))}</small></span><span class="bn-badge" data-adm-badge="total" hidden></span>${ic('chev', 'chev')}</a>` : '';

  const tools = document.createElement('div');
  tools.innerHTML = `
    ${isLandlord ? landlordVerifyCard(u) : ''}

    <div class="plabel">${esc(isLandlord ? t('landlord_tools') : t('quick_actions'))}</div>
    <div class="prowbox">
      ${isLandlord ? prow('doc', t('my_listings'), t('my_listings_d'), '#/mylistings')
        + prow('plus', t('post_new_l'), t('post_new_d'), '#/new') : ''}
      ${admRow}
      ${prow('heart', t('favourites'), t('favourites_d'), '#/favorites')}
      ${prow('doc', t('guide'), t('guide_d'), '#/welcome')}
      ${prow('shield', t('privacy_safety'), t('privacy_d'), '#/privacy')}
    </div>
    <div class="plabel">${esc(t('settings'))}</div>
    <div class="prowbox">
      <button class="prow" data-theme-toggle type="button">${ic('gear')}<span class="mid"><b>${esc(t('theme'))} <span class="theme-state">${esc(t('theme_sys_s'))}</span></b><small>${esc(t('theme_sub'))}</small></span></button>
      <button class="prow danger" id="pf-out">${ic('out')}<span class="mid"><b>${esc(t('signout'))}</b><small>${esc(t('signout_d'))}</small></span></button>
    </div>`;
  v.appendChild(tools);
  applyTheme(currentTheme()); // sync the toggle labels/state (light / dark / system)

  tools.querySelector('#pf-out').onclick = async () => {
    await api('/logout', { method: 'POST' });
    token.set(null); state.user = null; buildNav();
    location.hash = '#/home'; toast(t('signed_out'));
  };

  if (state.user && state.user.role === 'ADMIN') refreshAdminCounts();
  wireVerifyCard(v);
}

function landlordVerifyCard(u) {
  const st = u.verifyStatus;
  const pill = st === 'APPROVED' ? `<span class="pill pill-g">${esc(t('v_approved'))}</span>`
    : st === 'PENDING' ? `<span class="pill pill-o">${esc(t('v_pending'))}</span>`
    : st === 'REJECTED' ? `<span class="pill pill-r">${esc(t('v_rejected'))}${u.verifyNote ? ': ' + esc(u.verifyNote) : ''}</span>`
    : `<span class="pill pill-x">${esc(t('v_none'))}</span>`;
  const needDocs = st === 'NONE' || st === 'REJECTED';
  return `<div class="auth-card" style="margin-top:14px" id="verify-card">
    <h3 class="font-disp" style="font-size:16px">${esc(t('verify_t'))}</h3>
    <div style="margin:8px 0 4px">${pill}</div>
    <p class="hint-t" style="margin-bottom:8px">${esc(t('verify_docs'))}</p>
    ${needDocs ? `
      <div class="photo-grid" style="margin-top:10px">
        <div class="photo-cell" id="doc-id">${docCell(t('id_photo'))}</div>
        <div class="photo-cell" id="doc-own">${docCell(t('own_doc'))}</div>
      </div>
      <button class="btn btn-green btn-block" id="vf-send" style="margin-top:14px">${esc(t('submit_verify'))}</button>` : ''}
  </div>`;
}

function docCell(label) {
  return `<div class="ph-doc" style="width:100%;height:100%;display:grid;place-items:center;background:var(--card2);color:var(--ink2);font-size:11.5px;font-weight:700;text-align:center;cursor:pointer;padding:6px">
    ${ic('camera')}<span style="margin-top:4px">${esc(label)}</span></div>`;
}

function wireVerifyCard(v) {
  const card = v.querySelector('#verify-card'); if (!card) return;
  const docs = { docId: '', docOwn: '' };
  ['doc-id', 'doc-own'].forEach(key => {
    const cell = card.querySelector('#' + key);
    cell.onclick = async () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = async () => {
        if (!inp.files[0]) return;
        toast(t('processing'));
        try {
          docs[key === 'doc-id' ? 'docId' : 'docOwn'] = await compressTo(inp.files[0], 260, 1400, 0.78);
          cell.innerHTML = `<img src="${docs[key === 'doc-id' ? 'docId' : 'docOwn']}" style="width:100%;height:100%;object-fit:cover">`;
        } catch (e) { toast(e.message, true); }
      };
      inp.click();
    };
  });
  card.querySelector('#vf-send').onclick = async () => {
    if (!docs.docId || !docs.docOwn) { toast(t('upload_both'), true); return; }
    const btn = card.querySelector('#vf-send'); btn.disabled = true;
    const res = await api('/verify', { body: docs });
    btn.disabled = false;
    if (res.ok) { toast(t('verify_sent')); state.user.verifyStatus = 'PENDING'; viewProfile(); }
    else toast(res.error, true);
  };
}

// ---------- first-time welcome & guide (shown right after creating an account) ----------
// Role-aware: seekers get the anti-scam warning + how it works; landlords get the
// verify → post → boost guide. Reachable any time from Profile → Getting started.
function viewWelcome() {
  const v = document.getElementById('view');
  const isLL = state.user && state.user.role === 'LANDLORD';
  const hi = state.user && state.user.name ? ', ' + esc(state.user.name.split(' ')[0]) : '';
  const seeker = `
    <div class="notice notice-o" style="margin-top:14px">
      ${ic('shield')}<span><b>${esc(t('welc_scam_t'))}</b>
      ${esc(t('welc_scam_d'))}</span>
    </div>
    <div class="sec-block"><h3>${esc(t('how_t'))}</h3>
      <ol class="guide-list">
        <li>${t('welc_g1')}</li>
        <li>${t('welc_g2')}</li>
        <li>${t('welc_g3')}</li>
        <li>${t('welc_g4')}</li>
        <li>${t('welc_g5')}</li>
      </ol>
    </div>
    <div class="sec-block"><h3>${esc(t('welc_flags_t'))}</h3>
      <ul class="guide-list">
        <li>${esc(t('welc_f1'))}</li>
        <li>${esc(t('welc_f2'))}</li>
        <li>${esc(t('welc_f3'))}</li>
      </ul>
      <p class="hint-t">${t('welc_report')}</p>
    </div>
    <a class="btn btn-green btn-block" href="#/home">${ic('pin')} ${esc(t('welc_find_btn'))}</a>`;
  const landlord = `
    <div class="sec-block"><h3>${esc(t('welc_ll_t'))}</h3>
      <ol class="guide-list">
        <li>${t('welc_l1')}</li>
        <li>${t('welc_l2')}</li>
        <li>${t('welc_l3').replace('{n}', BOOST.days)}</li>
        <li>${t('welc_l4')}</li>
      </ol>
    </div>
    <div class="notice notice-g" style="margin-top:14px">
      ${ic('shield')}<span>${t('welc_ll_note')}</span>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px">
      <a class="btn btn-green" style="flex:1" href="#/new">${ic('plus')} ${esc(t('welc_post_btn'))}</a>
      <a class="btn btn-outline" style="flex:1" href="#/profile">${ic('shield')} ${esc(t('welc_verify_btn'))}</a>
    </div>`;
  v.innerHTML = `
    <div class="auth-wrap" style="max-width:640px"><div class="auth-card">
      <div class="auth-brand">
        <img class="auth-logo" src="/icons/icon-192.png" alt="HuntIn" width="54" height="54">
        <div class="auth-name">${esc(t('welc_to'))} Hunt<b>In</b>${hi}!</div>
        <p class="auth-tag">${isLL ? esc(t('welc_ll_sub')) : esc(t('welc_sk_sub'))}</p>
      </div>
      ${isLL ? landlord : seeker}
    </div></div>`;
}
