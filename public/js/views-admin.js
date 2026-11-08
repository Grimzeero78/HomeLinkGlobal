// HuntIn — Admin panel: verifications, boosts, reports, listings, users
// Sections with something waiting show an orange notification badge on their tab
// (live — the badge poll refreshes them, see refreshAdminCounts in ui.js).
const ADM_TABS = [['overview', 'Overview'], ['verifications', 'Verifications'], ['boosts', 'Boosts'], ['reports', 'Reports'], ['listings', 'Listings'], ['users', 'Users']];
const ADM_TAB_BADGE = { verifications: 'verifications', reports: 'reports' };

async function viewAdmin(tab) {
  if (!state.user || state.user.role !== 'ADMIN') { location.hash = '#/login'; return; }
  tab = ADM_TABS.some(t => t[0] === tab) ? tab : 'overview';
  const v = document.getElementById('view');
  v.innerHTML = `<div class="sec-h"><h2>Admin</h2></div>
    <div class="adm-tabs">${ADM_TABS.map(t => `<button class="chip ${t[0] === tab ? 'on' : ''}" data-t="${t[0]}">${t[1]}${ADM_TAB_BADGE[t[0]] ? `<span class="adm-dot" data-adm-badge="${ADM_TAB_BADGE[t[0]]}" hidden></span>` : ''}</button>`).join('')}</div>
    <div id="adm-body"><div class="skel" style="height:120px"></div></div>`;
  v.querySelectorAll('.adm-tabs .chip').forEach(c => c.onclick = () => { location.hash = '#/admin/' + c.dataset.t; });
  const body = v.querySelector('#adm-body');
  refreshAdminCounts(); // light up the tab badges right away

  if (tab === 'overview') {
    const r = await api('/admin/stats');
    if (!r.ok) { body.innerHTML = emptyBox(t('err_b'), r.error); return; }
    const s = r.stats;
    body.innerHTML = `<div class="stat-grid">
      <div class="stat"><div class="n">${s.users}</div><div class="k">${esc(t('st_users'))}</div></div>
      <div class="stat"><div class="n">${s.landlords}</div><div class="k">${esc(t('st_landlords'))}</div></div>
      <div class="stat"><div class="n">${s.listings}</div><div class="k">${esc(t('st_listings'))}</div></div>
      <div class="stat"><div class="n">${s.available}</div><div class="k">${esc(t('st_avail_now'))}</div></div>
      <div class="stat"><div class="n">${s.verifications}</div><div class="k">${esc(t('st_verif_wait'))}</div></div>
      <div class="stat"><div class="n">${s.boosts}</div><div class="k">${esc(t('st_boosts'))}</div></div>
      <div class="stat"><div class="n">${s.reports}</div><div class="k">${esc(t('st_reports'))}</div></div>
      <div class="stat"><div class="n">${s.views}</div><div class="k">${esc(t('st_views'))}</div></div>
    </div>
    <div class="notice notice-g" style="margin-top:14px">${ic('shield')}<span>${t('adm_notice')}</span></div>`;
  }

  if (tab === 'verifications') {
    const r = await api('/admin/verifications');
    if (!r.ok) { body.innerHTML = emptyBox(t('err_b'), r.error); return; }
    body.innerHTML = r.items.length ? r.items.map(u => `
      <div class="row-card" data-u="${u.id}">
        <div class="row-top"><div>
          <div class="row-title">${esc(u.name)} <span style="color:var(--ink3);font-weight:600">@${esc(u.username)}</span></div>
          <div class="row-sub">${esc(u.phone)} · ${esc(t('adm_requested'))} ${timeAgo(u.created_at)}</div></div></div>
        <div class="doc-thumbs">
          ${u.doc_id ? `<img src="${u.doc_id}" data-full="${u.doc_id}" alt="ID" title="${esc(t('tap_full'))}">` : ''}
          ${u.doc_own ? `<img src="${u.doc_own}" data-full="${u.doc_own}" alt="${esc(t('own_doc'))}" title="${esc(t('tap_full'))}">` : ''}
        </div>
        <p class="hint-t" style="margin-top:6px">${esc(t('adm_doc_hint'))}</p>
        <div class="row-acts">
          <button class="btn btn-green btn-sm" data-dec="approve">${esc(t('approve_b'))}</button>
          <button class="btn btn-danger btn-sm" data-dec="reject">${esc(t('reject_b'))}</button>
        </div>
      </div>`).join('') : emptyBox(t('adm_no_verif'), t('adm_no_verif_d'));
    body.querySelectorAll('.doc-thumbs img').forEach(im => im.onclick = () => lightbox(im.dataset.full));
    body.querySelectorAll('[data-dec]').forEach(b => b.onclick = async () => {
      const card = b.closest('[data-u]');
      if (b.dataset.dec === 'reject') {
        modal(`<h3>${esc(t('rej_verif_t'))}</h3><label class="lbl">${esc(t('reason_shown'))}</label>
          <input class="inp" id="rj-note" placeholder="${esc(t('rej_ph'))}">
          <button class="btn btn-primary btn-block" style="margin-top:14px" id="rj-go">${esc(t('reject_b'))}</button>`,
          m => m.querySelector('#rj-go').onclick = async () => {
            const res = await api('/admin/verify/' + card.dataset.u, { body: { decision: 'reject', note: m.querySelector('#rj-note').value } });
            closeModal(); if (res.ok) { toast(t('rejected_toast')); viewAdmin('verifications'); } else toast(res.error, true);
          });
      } else {
        const res = await api('/admin/verify/' + card.dataset.u, { body: { decision: 'approve' } });
        if (res.ok) { toast(t('approved_toast')); viewAdmin('verifications'); } else toast(res.error, true);
      }
    });
  }

  if (tab === 'boosts') {
    const r = await api('/admin/boosts');
    if (!r.ok) { body.innerHTML = emptyBox(t('err_b'), r.error); return; }
    body.innerHTML = r.items.length ? r.items.map(b => `
      <div class="row-card" data-b="${b.id}">
        <div class="row-title">${esc(b.ltitle)}</div>
        <div class="row-sub">by @${esc(b.uname)} · ${esc(b.town || '—')} · ${b.status === 'ACTIVE' ? esc(t('adm_active_until')) + ' ' + fmtDate(b.until) : esc(b.status)} · ${esc(t('adm_requested'))} ${timeAgo(b.createdAt)}</div>
      </div>`).join('') : emptyBox(t('adm_no_boosts'), t('adm_no_boosts_d'));
  }

  if (tab === 'reports') {
    const r = await api('/admin/reports');
    if (!r.ok) { body.innerHTML = emptyBox(t('err_b'), r.error); return; }
    body.innerHTML = r.items.length ? r.items.map(rep => `
      <div class="row-card" data-r="${rep.id}">
        <div class="row-top"><div>
          <div class="row-title">${esc(rep.reason)}</div>
          <div class="row-sub">${esc(t('adm_on'))} <a href="#/listing/${rep.listingId}" style="color:var(--ember);font-weight:700">${esc(rep.ltitle)}</a>
           ${rep.uname ? ' · by @' + esc(rep.uname) : ''} · ${timeAgo(rep.createdAt)}</div>
          ${rep.note ? `<div class="row-sub" style="margin-top:4px">"${esc(rep.note)}"</div>` : ''}
          <div class="row-sub" style="margin-top:4px">${esc(t('adm_lstatus'))} ${esc(rep.lstatus)}</div>
        </div></div>
        <div class="row-acts">
          <button class="btn btn-outline btn-sm" data-a="remove">${ic('eye')} ${esc(t('hide_listing'))}</button>
          <button class="btn btn-danger btn-sm" data-a="delete">${ic('trash')} ${esc(t('del_forever'))}</button>
          <button class="btn btn-outline btn-sm" data-a="dismiss">${esc(t('dismiss_report'))}</button>
        </div>
      </div>`).join('') : emptyBox(t('adm_no_reports'), t('adm_no_reports_d'));
    body.querySelectorAll('[data-a]').forEach(b => b.onclick = async () => {
      const act = b.dataset.a, rid = b.closest('[data-r]').dataset.r;
      if (act === 'delete') {
        confirmDlg(t('del_listing_forever_q'),
          t('adm_del_listing_d'),
          t('del_forever'), async () => {
            const res = await api('/admin/reports/' + rid, { body: { action: 'delete' } });
            if (res.ok) { toast(t('deleted_for_good')); viewAdmin('reports'); } else toast(res.error, true);
          }, true);
        return;
      }
      const res = await api('/admin/reports/' + rid, { body: { action: act } });
      if (res.ok) { toast(t('done_b')); viewAdmin('reports'); } else toast(res.error, true);
    });
  }

  if (tab === 'listings') {
    const r = await api('/admin/listings');
    if (!r.ok) { body.innerHTML = emptyBox(t('err_b'), r.error); return; }
    body.innerHTML = r.items.length ? r.items.map(l => `
      <div class="row-card" data-l="${l.id}">
        <div class="row-top"><div>
          <div class="row-title"><a href="#/listing/${l.id}">${esc(l.title)}</a></div>
          <div class="row-sub">${cur(l.rent, l.country)} · ${esc(l.town || '—')}${l.area ? ' · ' + esc(l.area) : ''} · @${esc(l.owner)} · ${l.views} ${esc(t('views'))} · ${timeAgo(l.createdAt)}</div></div>
          <span class="pill ${l.status === 'AVAILABLE' ? 'pill-g' : l.status === 'TAKEN' ? 'pill-x' : 'pill-r'}">${esc(l.status)}</span>
        </div>
        <div class="row-acts">
          ${l.status !== 'REMOVED'
            ? `<button class="btn btn-outline btn-sm" data-x="remove">${ic('eye')} ${esc(t('hide_b'))}</button>`
            : `<button class="btn btn-outline btn-sm" data-x="restore">${ic('check')} ${esc(t('restore_b'))}</button>`}
          <button class="btn btn-danger btn-sm" data-x="delete">${ic('trash')} ${esc(t('del_forever'))}</button>
        </div>
      </div>`).join('') : emptyBox(t('adm_no_listings'), t('adm_no_listings_d'));
    body.querySelectorAll('[data-x]').forEach(b => b.onclick = async () => {
      const id = b.closest('[data-l]').dataset.l;
      if (b.dataset.x === 'delete') {
        confirmDlg(t('del_listing_forever_q'),
          t('adm_del_listing_d'),
          t('del_forever'), async () => {
            const res = await api('/admin/listings/' + id + '/delete', { method: 'POST', body: {} });
            if (res.ok) { toast(t('deleted_for_good')); viewAdmin('listings'); } else toast(res.error, true);
          }, true);
        return;
      }
      const res = await api('/admin/listings/' + id + '/' + b.dataset.x, { method: 'POST', body: {} });
      if (res.ok) { toast(t('done_b')); viewAdmin('listings'); } else toast(res.error, true);
    });
  }

  if (tab === 'users') {
    const r = await api('/admin/users');
    if (!r.ok) { body.innerHTML = emptyBox(t('err_b'), r.error); return; }
    body.innerHTML = r.items.map(u => `
      <div class="row-card" data-u="${u.id}">
        <div class="row-top"><div>
          <div class="row-title">${esc(u.name)} <span style="color:var(--ink3);font-weight:600">@${esc(u.username)}</span></div>
          <div class="row-sub">${u.role === 'SEEKER' ? esc(t('role_renter')) : esc(u.role)} · ${esc(u.phone)} · ${esc(t('joined'))} ${fmtDate(u.created_at)}</div></div>
          <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
            ${u.verify_status === 'APPROVED' ? `<span class="pill pill-g">${esc(t('verified'))}</span>` : ''}
            ${u.suspended ? `<span class="pill pill-r">${esc(t('suspended_b'))}</span>` : ''}
          </div>
        </div>
        ${u.role !== 'ADMIN' ? `<div class="row-acts">
          <button class="btn btn-outline btn-sm" data-s="${u.suspended ? 0 : 1}">
            ${u.suspended ? esc(t('unsuspend_b')) : esc(t('suspend_b'))}</button>
          <button class="btn btn-danger btn-sm" data-udel="${u.id}">${ic('trash')} ${esc(t('del_account'))}</button>
        </div>` : ''}
      </div>`).join('');
    body.querySelectorAll('[data-s]').forEach(b => b.onclick = async () => {
      const res = await api('/admin/users/' + b.closest('[data-u]').dataset.u + '/suspend', { body: { on: b.dataset.s === '1' } });
      if (res.ok) { toast(t('done_b')); viewAdmin('users'); } else toast(res.error, true);
    });
    body.querySelectorAll('[data-udel]').forEach(b => b.onclick = () => {
      const card = b.closest('[data-u]');
      confirmDlg(t('del_acct_forever_q'),
        t('adm_del_user_d'),
        t('del_forever'), async () => {
          const res = await api('/admin/users/' + card.dataset.u + '/delete', { method: 'POST', body: {} });
          if (res.ok) { toast(t('acct_deleted_good')); viewAdmin('users'); } else toast(res.error, true);
        }, true);
    });
  }
}
