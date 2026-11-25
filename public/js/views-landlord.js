// HuntIn — My listings + free launch boosts (country-targeted)
async function viewMyListings() {
  if (!state.user) { location.hash = '#/login'; return; }
  const v = document.getElementById('view');
  const gen = routeGen;
  v.innerHTML = `<div class="sec-h"><h2>${esc(t('my_listings'))}</h2></div>${skeletonGrid(2)}
    <a class="btn btn-green btn-block" href="#/new" style="margin-top:14px">${ic('plus')} ${esc(t('post_new_l'))}</a>`;
  const r = await api('/my/listings');
  if (stale(gen)) return; // navigated away while loading
  if (!r.ok) { v.innerHTML = emptyBox(t('signin_req'), r.error); return; }
  const items = r.items;
  const boosted = l => l.boostedUntil && l.boostedUntil > Date.now();

  v.innerHTML = `<div class="sec-h"><h2>${esc(t('my_listings'))}</h2><a href="#/new">${ic('plus')} ${esc(t('new_b'))}</a></div>
    <div class="notice notice-g" style="margin-bottom:10px">${ic('shield')}<span>${state.user.verifyStatus === 'APPROVED'
      ? esc(t('ver_ok'))
      : esc(t('free_plan2'))}</span></div>
    <div class="notice notice-o" style="margin-bottom:14px">${ic('bolt')}<span><b>${esc(t('boost_seen'))}</b> ${esc(t('boost_seen_d').replace('{n}', BOOST.days))}</span></div>
    ${items.length ? items.map(l => {
      const vac = vacInfo(l);
      const hid = !!l.hidden;
      return `
      <div class="row-card" ${hid ? 'style="opacity:.66"' : ''}>
        <div class="row-top">
          <div style="display:flex;gap:11px;min-width:0">
            <div class="cph" style="width:64px;height:64px;border-radius:10px;overflow:hidden;flex:none;aspect-ratio:auto">
              ${l.thumb ? `<img src="${l.thumb}" style="width:100%;height:100%;object-fit:cover">` : `<div class="cph-empty">${ic('photo')}</div>`}
            </div>
            <div style="min-width:0">
              <div class="row-title">${esc(l.title)}</div>
              <div class="row-sub">${cur(l.rent, l.country)}/${perShort(l.period)} · ${esc(l.town || '')}${l.country ? ' · ' + flagImg(l.country) : ''}${l.area ? ' · ' + esc(l.area) : ''} · ${l.views} ${esc(t('views'))}</div>
              <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
                <span class="pill ${vac.full ? 'pill-full' : 'pill-vac'}">${vac.full ? ic('x') : ic('check')}${esc(vac.label)}</span>
                ${hid ? `<span class="pill pill-muted">${ic('eye-off')}${esc(t('hidden_pill'))}</span>` : ''}
                ${boosted(l) ? `<span class="pill pill-o">${ic('bolt')}${esc(t('boosted_till').replace('{d}', fmtDate(l.boostedUntil)))}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
        <div class="row-acts">
          <a class="btn btn-outline btn-sm" href="#/listing/${l.id}">${ic('eye')} ${esc(t('view_b'))}</a>
          <a class="btn btn-outline btn-sm" href="#/edit/${l.id}">${ic('edit')} ${esc(t('edit'))}</a>
          <button class="btn btn-outline btn-sm" data-act="hide" data-id="${l.id}" data-hid="${hid ? 1 : 0}" aria-label="${hid ? 'Show this listing to renters again' : 'Hide this listing from renters'}">${hid ? ic('eye') + ' ' + esc(t('show_b')) : ic('eye-off') + ' ' + esc(t('hide_b'))}</button>
          ${hid ? '' : `<a class="btn btn-primary btn-sm" href="#/boost/${l.id}">${ic('bolt')} ${boosted(l) ? esc(t('boost_again')) : esc(t('boost_b'))}</a>`}
          <button class="btn btn-danger btn-sm" data-act="del" data-id="${l.id}" aria-label="Delete this listing forever">${ic('trash')}</button>
        </div>
        <div class="vac-row" data-id="${l.id}" data-v="${vac.v}" data-u="${vac.u}" style="margin-top:9px;padding-top:9px;border-top:1px dashed var(--line)">
          <span style="font-size:12px;font-weight:700;color:var(--ink3)">${esc(t('vacancy'))}</span>
          <button class="btn btn-outline btn-sm" data-vac="${Math.max(0, vac.v - 1)}" ${vac.v <= 0 ? 'disabled' : ''} aria-label="-1">−1</button>
          <span class="vac-lab">${vac.full ? `<b>${esc(t('full_w'))}</b> — ${esc(t('all_occ_n').replace('{u}', vac.u))}` : `<b>${vac.v}</b> ${esc(t('of_vacant').replace('{u}', vac.u))}`}</span>
          <button class="btn btn-outline btn-sm" data-vac="${Math.min(vac.u, vac.v + 1)}" ${vac.v >= vac.u ? 'disabled' : ''} aria-label="+1">+1</button>
          ${vac.full
            ? `<button class="btn btn-outline btn-sm" data-vac="${vac.u}">${esc(t('reopen_all'))}</button>`
            : `<button class="btn btn-outline btn-sm" data-vac="0">${esc(t('all_taken'))}</button>`}
        </div>
      </div>`;
    }).join('')
    : emptyBox(t('no_list_y'), t('no_list_d'))}
    <a class="btn btn-green btn-block" href="#/new" style="margin-top:14px">${ic('plus')} ${esc(t('post_new_l'))}</a>`;

  // vacancy stepper — OPTIMISTIC: the count moves the moment you tap and the save
  // runs quietly behind a toast, so it feels instant even on a slow network.
  const vacLabel = (v, u) => v <= 0
    ? `<b>${esc(t('full_w'))}</b> — ${esc(t('all_occ_n').replace('{u}', u))}`
    : `<b>${v}</b> ${esc(t('of_vacant').replace('{u}', u))}`;
  const pillLabel = (v, u) => v <= 0
    ? (u > 1 ? t('card_all_occ').replace('{u}', u) : t('card_occupied'))
    : (u <= 1 ? t('vacant_now') : t('card_vac_of').replace('{v}', v).replace('{u}', u));
  const paintVac = (row, v, u) => {
    row.dataset.v = v; row.dataset.u = u;
    const full = v <= 0;
    row.innerHTML = `
      <span style="font-size:12px;font-weight:700;color:var(--ink3)">${esc(t('vacancy'))}</span>
      <button class="btn btn-outline btn-sm" data-vac="${Math.max(0, v - 1)}" ${v <= 0 ? 'disabled' : ''} aria-label="-1">−1</button>
      <span class="vac-lab">${vacLabel(v, u)}</span>
      <button class="btn btn-outline btn-sm" data-vac="${Math.min(u, v + 1)}" ${v >= u ? 'disabled' : ''} aria-label="+1">+1</button>
      ${full
        ? `<button class="btn btn-outline btn-sm" data-vac="${u}">${esc(t('reopen_all'))}</button>`
        : `<button class="btn btn-outline btn-sm" data-vac="0">${esc(t('all_taken'))}</button>`}`;
    // keep the green/red vacancy pill at the top of the card in sync with the count
    const pill = row.closest('.row-card').querySelector('.pill-vac, .pill-full');
    if (pill) {
      pill.className = 'pill ' + (full ? 'pill-full' : 'pill-vac');
      pill.innerHTML = (full ? ic('x') : ic('check')) + esc(pillLabel(v, u));
    }
  };
  v.querySelectorAll('.vac-row').forEach(row => {
    let chain = Promise.resolve(); // saves run in tap order — rapid taps never fight
    row.addEventListener('click', e => {
      const b = e.target.closest('[data-vac]');
      if (!b || b.disabled) return;
      const id = row.dataset.id, prev = +row.dataset.v, u = +row.dataset.u;
      const nv = Math.max(0, Math.min(u, +b.dataset.vac));
      if (nv === prev) return;
      paintVac(row, nv, u);           // instant — zero network before this
      toast(t('vac_updating'));       // popup while the save runs behind it
      chain = chain.then(() =>
        api('/listings/' + id + '/status', { body: { vacant: nv } }).then(res => {
          if (res.ok) { if (+row.dataset.v === nv) toast(res.unitsVacant > 0 ? t('saved_vac').replace('{n}', res.unitsVacant) : t('saved_full')); }
          else {
            if (+row.dataset.v === nv) paintVac(row, prev, u); // put the old number back
            toast(res.error, true);
          }
        }).catch(() => {
          if (+row.dataset.v === nv) paintVac(row, prev, u);
          toast(t('net_fail'), true);
        }));
    });
  });
  v.querySelectorAll('[data-act="hide"]').forEach(b => b.onclick = () => {
    const id = b.dataset.id, hid = b.dataset.hid === '1';
    if (hid) {
      // Show — reversible by design, no confirmation needed
      api('/listings/' + id + '/visibility', { body: { hidden: false } }).then(res => {
        if (res.ok) { toast(t('shown_toast')); viewMyListings(); }
        else toast(res.error, true);
      });
    } else {
      confirmDlg(t('hide_q'), t('hide_d'), t('hide_b'), async () => {
        const res = await api('/listings/' + id + '/visibility', { body: { hidden: true } });
        if (res.ok) { toast(t('hidden_toast')); viewMyListings(); }
        else toast(res.error, true);
      });
    }
  });
  v.querySelectorAll('[data-act="del"]').forEach(b => b.onclick = () =>
    confirmDlg(t('del_listing_q'), t('del_forever_d'), t('del_forever'), async () => {
      const res = await api('/listings/' + b.dataset.id, { method: 'DELETE' });
      if (res.ok) { toast(t('del_gone')); viewMyListings(); } else toast(res.error, true);
    }, true));
}

async function viewBoost(id) {
  if (!state.user) { location.hash = '#/login'; return; }
  const v = document.getElementById('view');
  const gen = routeGen;
  v.innerHTML = skeletonGrid(1);
  const r = await api('/listings/' + id);
  if (stale(gen)) return;
  if (!r.ok || !r.isOwner) { v.innerHTML = emptyBox(t('listing_nf'), t('boost_owner_only')); return; }
  const l = r.listing;
  const boosted = l.boostedUntil && l.boostedUntil > Date.now();

  v.innerHTML = `
    <div class="sec-h"><h2>${ic('bolt')} ${esc(t('boost_title').replace('{t}', l.title))}</h2></div>
    ${boosted ? `<div class="notice notice-g">${ic('check')}<span>${t('boosted_until_c').replace('{d}', fmtDate(l.boostedUntil)).replace('{c}', esc(l.country || t('your_country')))}</span></div>` : ''}
    ${!boosted ? `
    <div class="sec-block">
      <h3>${esc(t('boost_what_t'))}</h3>
      <p class="hint-t" style="margin-bottom:12px">${t('boost_what_d').replace(/\{c\}/g, esc(l.country || t('your_country'))).replace('{n}', BOOST.days)}</p>
      <h3>${esc(t('boost_free_t'))}</h3>
      <p class="hint-t" style="margin-bottom:14px">${esc(t('boost_free_d'))}</p>
      <button class="btn btn-primary btn-block" id="bs-go">${ic('bolt')} ${esc(t('boost_btn').replace('{n}', BOOST.days))}</button>
      <p class="hint-t" style="margin-top:10px">${esc(t('boost_safety'))}</p>
    </div>` : ''}
    <div style="margin-top:14px"><a class="btn btn-outline" href="#/listing/${l.id}">${ic('back')} ${esc(t('back_to_listing'))}</a></div>`;

  const go = v.querySelector('#bs-go');
  if (go) go.onclick = async () => {
    go.disabled = true;
    const res = await api('/listings/' + id + '/boost', { body: {} });
    if (res.ok) { toast(t('boost_active').replace('{n}', BOOST.days)); viewBoost(id); }
    else { toast(res.error, true); go.disabled = false; }
  };
}
