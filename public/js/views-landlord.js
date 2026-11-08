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
      return `
      <div class="row-card">
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
                ${boosted(l) ? `<span class="pill pill-o">${ic('bolt')}${esc(t('boosted_till').replace('{d}', fmtDate(l.boostedUntil)))}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
        <div class="row-acts">
          <a class="btn btn-outline btn-sm" href="#/listing/${l.id}">${ic('eye')} ${esc(t('view_b'))}</a>
          <a class="btn btn-outline btn-sm" href="#/edit/${l.id}">${ic('edit')} ${esc(t('edit'))}</a>
          <a class="btn btn-primary btn-sm" href="#/boost/${l.id}">${ic('bolt')} ${boosted(l) ? esc(t('boost_again')) : esc(t('boost_b'))}</a>
          <button class="btn btn-danger btn-sm" data-act="del" data-id="${l.id}">${ic('trash')}</button>
        </div>
        <div class="vac-row" style="margin-top:9px;padding-top:9px;border-top:1px dashed var(--line)">
          <span style="font-size:12px;font-weight:700;color:var(--ink3)">${esc(t('vacancy'))}</span>
          <button class="btn btn-outline btn-sm" data-vac="${l.id}:${Math.max(0, vac.v - 1)}" ${vac.v <= 0 ? 'disabled' : ''} aria-label="-1">−1</button>
          <span class="vac-lab">${vac.full ? `<b>${esc(t('full_w'))}</b> — ${esc(t('all_occ_n').replace('{u}', vac.u))}` : `<b>${vac.v}</b> ${esc(t('of_vacant').replace('{u}', vac.u))}`}</span>
          <button class="btn btn-outline btn-sm" data-vac="${l.id}:${Math.min(vac.u, vac.v + 1)}" ${vac.v >= vac.u ? 'disabled' : ''} aria-label="+1">+1</button>
          ${vac.full
            ? `<button class="btn btn-outline btn-sm" data-vac="${l.id}:${vac.u}">${esc(t('reopen_all'))}</button>`
            : `<button class="btn btn-outline btn-sm" data-vac="${l.id}:0">${esc(t('all_taken'))}</button>`}
        </div>
      </div>`;
    }).join('')
    : emptyBox(t('no_list_y'), t('no_list_d'))}
    <a class="btn btn-green btn-block" href="#/new" style="margin-top:14px">${ic('plus')} ${esc(t('post_new_l'))}</a>`;

  // vacancy stepper — every tap saves instantly so the count renters see is always true
  v.querySelectorAll('[data-vac]').forEach(b => b.onclick = async () => {
    const i = b.dataset.vac.indexOf(':');
    const id = b.dataset.vac.slice(0, i), nv = parseInt(b.dataset.vac.slice(i + 1), 10);
    const res = await api('/listings/' + id + '/status', { body: { vacant: nv } });
    if (res.ok) { toast(res.unitsVacant > 0 ? t('saved_vac').replace('{n}', res.unitsVacant) : t('saved_full')); viewMyListings(); } else toast(res.error, true);
  });
  v.querySelectorAll('[data-act="del"]').forEach(b => b.onclick = () =>
    confirmDlg(t('del_listing_q'), t('del_listing_d'), t('del'), async () => {
      const res = await api('/listings/' + b.dataset.id, { method: 'DELETE' });
      if (res.ok) { toast(t('listing_deleted')); viewMyListings(); } else toast(res.error, true);
    }, true));
}

async function viewBoost(id) {
  if (!state.user) { location.hash = '#/login'; return; }
  const v = document.getElementById('view');
  const gen = routeGen;
  v.innerHTML = skeletonGrid(1);
  const r = await api('/listings/' + id);
  if (stale(gen)) return;
  if (!r.ok || !r.isOwner) { v.innerHTML = emptyBox('Listing not found', 'Only the owner can boost this listing.'); return; }
  const l = r.listing;
  const boosted = l.boostedUntil && l.boostedUntil > Date.now();

  v.innerHTML = `
    <div class="sec-h"><h2>${ic('bolt')} Boost "${esc(l.title)}"</h2></div>
    ${boosted ? `<div class="notice notice-g">${ic('check')}<span>This listing is boosted until <b>${fmtDate(l.boostedUntil)}</b> — renters browsing <b>${esc(l.country || 'its country')}</b> see it at the top.</span></div>` : ''}
    ${!boosted ? `
    <div class="sec-block">
      <h3>What a boost does</h3>
      <p class="hint-t" style="margin-bottom:12px">Your listing jumps to the <b>top of results in ${esc(l.country || 'its country')}</b> with an orange BOOSTED badge for ${BOOST.days} days — on the home page, search results and the map for everyone browsing ${esc(l.country || 'that country')}. Renters in other countries are not affected unless they search ${esc(l.country || 'your country')} themselves. Boosted listings get the most views and chats.</p>
      <h3>Free during launch</h3>
      <p class="hint-t" style="margin-bottom:14px">No payment, no code — boosts are free while HuntIn is new. One tap and it is live.</p>
      <button class="btn btn-primary btn-block" id="bs-go">${ic('bolt')} Boost free for ${BOOST.days} days</button>
      <p class="hint-t" style="margin-top:10px">Rent and deposits are NEVER paid through this platform — always view the house first.</p>
    </div>` : ''}
    <div style="margin-top:14px"><a class="btn btn-outline" href="#/listing/${l.id}">${ic('back')} Back to listing</a></div>`;

  const go = v.querySelector('#bs-go');
  if (go) go.onclick = async () => {
    go.disabled = true;
    const res = await api('/listings/' + id + '/boost', { body: {} });
    if (res.ok) { toast('Boost active for ' + BOOST.days + ' days!'); viewBoost(id); }
    else { toast(res.error, true); go.disabled = false; }
  };
}
