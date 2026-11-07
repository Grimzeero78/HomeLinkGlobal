// HuntIn — My listings + free launch boosts (country-targeted)
async function viewMyListings() {
  if (!state.user) { location.hash = '#/login'; return; }
  const v = document.getElementById('view');
  const gen = routeGen;
  v.innerHTML = `<div class="sec-h"><h2>My listings</h2></div>${skeletonGrid(2)}
    <a class="btn btn-green btn-block" href="#/new" style="margin-top:14px">${ic('plus')} Post a new listing</a>`;
  const r = await api('/my/listings');
  if (stale(gen)) return; // navigated away while loading
  if (!r.ok) { v.innerHTML = emptyBox('Sign in required', r.error); return; }
  const items = r.items;
  const boosted = l => l.boostedUntil && l.boostedUntil > Date.now();

  v.innerHTML = `<div class="sec-h"><h2>My listings</h2><a href="#/new">${ic('plus')} New</a></div>
    <div class="notice notice-g" style="margin-bottom:10px">${ic('shield')}<span>${state.user.verifyStatus === 'APPROVED'
      ? 'Verified account: up to 5 listings.'
      : 'Free plan: 2 listings. Get verified in your Profile to post up to 5.'}</span></div>
    <div class="notice notice-o" style="margin-bottom:14px">${ic('bolt')}<span><b>Boost gets you seen:</b> free during launch — one tap pins a listing at the top of results <b>in its country</b> for ${BOOST.days} days — renters browsing that country see it first. Tap <b>Boost</b> on any listing below.</span></div>
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
              <div class="row-sub">${cur(l.rent, l.country)}/${perShort(l.period)} · ${esc(l.town || '')}${l.country ? ' · ' + flagOf(l.country) : ''}${l.area ? ' · ' + esc(l.area) : ''} · ${l.views} views</div>
              <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
                <span class="pill ${vac.full ? 'pill-full' : 'pill-vac'}">${vac.full ? ic('x') : ic('check')}${esc(vac.label)}</span>
                ${boosted(l) ? `<span class="pill pill-o">${ic('bolt')}Boosted till ${fmtDate(l.boostedUntil)}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
        <div class="row-acts">
          <a class="btn btn-outline btn-sm" href="#/listing/${l.id}">${ic('eye')} View</a>
          <a class="btn btn-outline btn-sm" href="#/edit/${l.id}">${ic('edit')} Edit</a>
          <a class="btn btn-primary btn-sm" href="#/boost/${l.id}">${ic('bolt')} ${boosted(l) ? 'Boost again' : 'Boost'}</a>
          <button class="btn btn-danger btn-sm" data-act="del" data-id="${l.id}">${ic('trash')}</button>
        </div>
        <div class="vac-row" style="margin-top:9px;padding-top:9px;border-top:1px dashed var(--line)">
          <span style="font-size:12px;font-weight:700;color:var(--ink3)">VACANCY</span>
          <button class="btn btn-outline btn-sm" data-vac="${l.id}:${Math.max(0, vac.v - 1)}" ${vac.v <= 0 ? 'disabled' : ''} aria-label="Mark one unit taken">−1</button>
          <span class="vac-lab">${vac.full ? `<b>Full</b> — all ${vac.u} occupied` : `<b>${vac.v}</b> of ${vac.u} vacant`}</span>
          <button class="btn btn-outline btn-sm" data-vac="${l.id}:${Math.min(vac.u, vac.v + 1)}" ${vac.v >= vac.u ? 'disabled' : ''} aria-label="Mark one unit vacant">+1</button>
          ${vac.full
            ? `<button class="btn btn-outline btn-sm" data-vac="${l.id}:${vac.u}">Reopen all</button>`
            : `<button class="btn btn-outline btn-sm" data-vac="${l.id}:0">All taken</button>`}
        </div>
      </div>`;
    }).join('')
    : emptyBox('No listings yet', 'Post your first vacant room — it takes about 2 minutes.')}
    <a class="btn btn-green btn-block" href="#/new" style="margin-top:14px">${ic('plus')} Post a new listing</a>`;

  // vacancy stepper — every tap saves instantly so the count renters see is always true
  v.querySelectorAll('[data-vac]').forEach(b => b.onclick = async () => {
    const i = b.dataset.vac.indexOf(':');
    const id = b.dataset.vac.slice(0, i), nv = parseInt(b.dataset.vac.slice(i + 1), 10);
    const res = await api('/listings/' + id + '/status', { body: { vacant: nv } });
    if (res.ok) { toast(res.unitsVacant > 0 ? 'Saved — ' + res.unitsVacant + ' vacant' : 'Saved — all occupied'); viewMyListings(); } else toast(res.error, true);
  });
  v.querySelectorAll('[data-act="del"]').forEach(b => b.onclick = () =>
    confirmDlg('Delete this listing?', 'It will be removed from HuntIn. You cannot undo this.', 'Delete', async () => {
      const res = await api('/listings/' + b.dataset.id, { method: 'DELETE' });
      if (res.ok) { toast('Listing deleted'); viewMyListings(); } else toast(res.error, true);
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
