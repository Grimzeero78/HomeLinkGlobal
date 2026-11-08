// HuntIn — Listing detail, Favourites, Privacy
let VIEWED = JSON.parse(localStorage.getItem('hl_viewed') || '[]');

async function viewListing(id) {
  const v = document.getElementById('view');
  const gen = routeGen;
  v.innerHTML = `<div class="skel" style="aspect-ratio:4/3;border-radius:16px"></div>
    <div class="skel" style="height:26px;margin-top:14px;width:70%"></div>
    <div class="skel" style="height:120px;margin-top:12px"></div>`;

  const r = await api('/listings/' + id);
  if (stale(gen)) return; // navigated away while loading
  if (!r.ok) { v.innerHTML = emptyBox(t('listing_nf'), r.error || t('may_removed')); return; }
  const l = r.listing, photos = r.photos || [];

  if (!VIEWED.includes(id)) { VIEWED.push(id); localStorage.setItem('hl_viewed', JSON.stringify(VIEWED)); api('/listings/' + id + '/view', { method: 'POST' }); }

  const isFav = await (async () => {
    if (!state.user) return false;
    const f = await api('/my/favorites');
    return f.ok && f.items.some(x => x.id === l.id);
  })();
  if (stale(gen)) return; // still fresh? the favorites fetch can also race a navigation
  const canContact = !!state.user;
  const verified = l.ownerVerify === 'APPROVED';
  const boosted = l.boostedUntil && l.boostedUntil > Date.now();
  const coords = l.lat != null && l.lng != null;
  const dl = distLabel(l);
  const vac = vacInfo(l); // vacancy — shown big and clear, never as a tiny tag
  const gmapsLink = coords ? `https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}` : null;
  const dirLink = coords ? `https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}` : null;
  const contactNum = l.contactPhone || l.ownerPhone || '';
  const kv = (k, val) => val ? `<div class="kv"><span class="k">${k}</span><span class="v">${val}</span></div>` : '';
  const y = v2 => v2 === 'Yes' ? v2 : esc(v2);

  v.innerHTML = `
  <div class="detail-cols">
    <div class="detail-main">
      ${r.isOwner && !boosted ? `<div class="notice notice-o" style="margin-bottom:10px">${ic('bolt')}<span><b>${esc(t('your_listing'))}</b> ${esc(t('boost_top_c').replace('{c}', l.country || t('your_country')))} — <a href="#/boost/${l.id}" style="text-decoration:underline">${esc(t('boost_free_n').replace('{n}', BOOST.days))}</a></span></div>` : ''}
      ${r.isOwner && !verified ? `<div class="notice notice-g" style="margin-bottom:10px">${ic('shield')}<span>${esc(t('earn_badge'))} — <a href="#/profile" style="text-decoration:underline">${esc(t('verify_profile'))}</a></span></div>` : ''}
      ${photos.length ? `
      <div class="gallery">
        <span class="wm" style="z-index:2"></span>
        <img id="gal-img" src="${photos[0].url}" alt="${esc(l.title)}">
        ${photos.length > 1 ? `
          <button class="gal-nav prev" id="gal-prev" aria-label="${esc(t('back'))}">${ic('back')}</button>
          <button class="gal-nav next" id="gal-next" aria-label="${esc(t('next'))}" style="transform:translateY(-50%) scaleX(-1)">${ic('back')}</button>
          <div class="gal-count" id="gal-count">1/${photos.length}</div>` : ''}
      </div>
      <div class="gal-thumbs">${photos.map((p, i) => `<img src="${p.url}" data-i="${i}" class="${i === 0 ? 'on' : ''}" alt="">`).join('')}</div>` : ''}
      <div class="dhead">
        <div class="dprice">${cur(l.rent, l.country)}<span> /${esc(perLong(l.period))}</span></div>
        <div class="dtitle">${esc(l.title)}</div>
        <div class="dmeta">${ic('pin')} ${esc(l.town || t('worldwide'))}${l.country ? ', ' + flagImg(l.country) + ' ' + esc(l.country) : ''}${l.area ? ' · ' + esc(l.area) : ''}${l.landmark ? ' · ' + esc(l.landmark) : ''}${dl ? ` · <b style="color:var(--pine-accent)">${esc(dl)}</b>` : ''}</div>
        <div style="display:flex;gap:7px;margin-top:9px;flex-wrap:wrap">
          ${boosted ? `<span class="pill pill-o">${ic('bolt')}${esc(t('boosted_p'))}</span>` : ''}
          ${verified ? `<span class="pill pill-g">${ic('shield')}${esc(t('verified_ll'))}</span>` : ''}
          <span class="pill ${vac.full ? 'pill-full' : 'pill-vac'}">${vac.full ? ic('x') : ic('check')}${esc(vac.label)}</span>
          <span class="pill pill-x">${ic('eye')}${l.views} ${esc(t('views'))}</span>
        </div>
        <div class="dacts">
          <button class="btn btn-outline btn-sm" id="btn-fav">${ic('heart')} ${isFav ? esc(t('saved_b')) : esc(t('save_b'))}</button>
          <button class="btn btn-outline btn-sm" id="btn-share">${ic('send')} ${esc(t('share_b'))}</button>
          <button class="btn btn-outline btn-sm" id="btn-report">${ic('flag')} ${esc(t('report_l'))}</button>
        </div>
        ${!r.isOwner ? `<div class="notice notice-r" style="margin-top:12px">${ic('shield')}<span><b>${esc(t('never_pay'))}</b> ${esc(t('never_pay_d'))}</span></div>` : ''}
        ${vac.full && !r.isOwner ? `<div class="notice notice-o" style="margin-top:10px">${ic('x')}<span><b>${esc(t('all_occ_t'))}</b> ${esc(t('all_occ_d'))}</span></div>` : ''}
      </div>

      <div class="sec-block"><h3>${esc(t('key_facts'))}</h3><div class="dgrid">
        <div class="dcell"><div class="k">${esc(t('type_l'))}</div><div class="v">${esc(tv(l.ptype))}</div></div>
        <div class="dcell"><div class="k">${esc(t('units_l'))}</div><div class="v">${l.units}</div></div>
        <div class="dcell"><div class="k">${esc(t('vacant_now'))}</div><div class="v">${vac.full ? t('vac_zero') : (vac.u > 1 ? vac.v + ' / ' + vac.u : t('vac_this'))}</div></div>
        <div class="dcell"><div class="k">${esc(t('furnishing_l'))}</div><div class="v">${esc(tv(l.furnishing))}</div></div>
        <div class="dcell"><div class="k">${esc(t('floor_n'))}</div><div class="v">${esc(floorLabel(l.floor))}</div></div>
        <div class="dcell"><div class="k">${esc(t('road_l'))}</div><div class="v">${esc(tv(l.road))}</div></div>
        <div class="dcell"><div class="k">${esc(t('avail_from'))}</div><div class="v">${fmtAvail(l.availableFrom)}</div></div>
      </div></div>

      <div class="sec-block"><h3>${esc(t('location_t'))}</h3>
        ${coords ? `
        <div id="lmap" style="height:300px"></div>
        <p class="hint-t" style="margin-top:7px">${esc(t('location_hint'))}</p>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="${gmapsLink}">${ic('pin')} ${esc(t('open_gmaps'))}</a>
          <a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="${dirLink}">${ic('send')} ${esc(t('directions'))}</a>
        </div>` : `<p class="hint-t">${esc(t('no_pin_yet'))}</p>`}
      </div>

      <div class="sec-block"><h3>${esc(t('utilities_t'))}</h3>
        ${kv(t('water_l'), esc(tv(l.water)) + (l.waterCost && l.water !== 'Included in rent' ? ' · ' + esc(l.waterCost) : ''))}
        ${l.water === 'Rationed' && l.waterSched ? kv(t('water_sched'), esc(l.waterSched)) : ''}
        ${kv(t('tank_l'), y(l.waterTank))}
        ${kv(t('electricity_l'), esc(tv(l.elec)) + (l.elecCost && !['Included in rent', 'Own meter', 'Prepaid'].includes(l.elec) ? ' · ' + esc(l.elecCost) : ''))}
        ${kv(t('wifi_l'), esc(tv(l.wifi)) + (l.wifiCost && l.wifi === 'Available but paid separately' ? ' · ' + esc(l.wifiCost) : '') + (l.wifiProvider ? ' (' + esc(l.wifiProvider) + ')' : ''))}
        ${kv(t('garbage_l'), esc(tv(l.garbage)))}
        ${kv(t('backup_l'), esc(tv(l.backup)))}
      </div>

      <div class="sec-block"><h3>${esc(t('inside_t'))}</h3>
        ${/^\d/.test(l.bath || '') ? kv(t('bath_l'), esc(l.bath)) : ''}
        ${(l.ensuite === 'Yes' || l.bath === 'Ensuite (own)') ? kv(t('own_bath'), esc(t('yes_ensuite'))) : ''}
        ${(l.kitchen === 'Yes' || l.kitchen === 'Own') ? kv(t('own_kitchen'), esc(t('yes_inside_unit'))) : ''}
        ${l.parking === 'Yes' ? kv(t('parking_l'), esc(t('available_b'))) : ''}
        ${kv(t('balcony_l'), y(l.balcony))}
        ${kv(t('floor_finish'), y(l.tile))}
        ${kv(t('ceiling_l'), y(l.ceiling))}
        ${l.wardrobe === 'Yes' ? kv(t('wardrobes'), esc(t('built_in'))) : ''}
        ${kv(t('hot_shower'), y(l.hotShower))}
      </div>

      <div class="sec-block"><h3>${esc(t('sec_t'))}</h3>
        <div class="chips" style="margin-bottom:10px">
          ${(parseSecurity(l.security).length ? parseSecurity(l.security) : [t('not_specified')]).map(s => `<span class="chip" style="pointer-events:none">${esc(tv(s))}</span>`).join('')}
        </div>
        ${kv(t('pref_tenants'), esc(l.tenantPref ? tv(l.tenantPref) : t('anyone')))}
        ${kv(t('pets_l'), y(l.pets))}
      </div>

      <div class="sec-block"><h3>${esc(t('pricing_t'))}</h3>
        ${kv(t('rent_l'), cur(l.rent, l.country) + ' / ' + esc(perLong(l.period)))}
        ${l.deposit ? kv(t('deposit_l'), cur(l.deposit, l.country)) : ''}
        ${kv(t('move_in_fees'), esc(l.fees || t('none_b')))}
        ${kv(t('negotiable'), l.negotiable ? t('yes_b') : t('no_b'))}
        ${l.terms ? `<p style="font-size:13.5px;color:var(--ink2);margin-top:8px">${esc(l.terms)}</p>` : ''}
      </div>

      <div id="similar-box"></div>
    </div>

    <div class="detail-side">
      <div class="owner-card">
        <div class="owner-row">
          <div class="avatar ${verified ? '' : 'lv'}">${esc((l.ownerName || l.ownerUsername || '?')[0].toUpperCase())}</div>
          <div>
            <div class="nm">${esc(l.ownerName || l.ownerUsername)} ${verified ? ic('shield') : ''}</div>
            <div class="sb">${esc(t('role_landlord'))} · ${esc(t('joined'))} ${fmtDate(l.ownerSince)}</div>
          </div>
        </div>
        ${verified ? '' : `<div class="notice notice-o" style="margin-top:11px;font-size:12.5px">${ic('flag')}<span>${esc(t('not_verified_note'))}</span></div>`}
        <div class="contact-btns">
          <a class="btn btn-green ${canContact ? '' : 'need-auth'}" ${canContact ? `href="tel:${esc(contactNum)}"` : 'href="#/login"'}>
            ${ic('phone')} ${esc(t('call_b'))}</a>
          <a class="btn btn-primary ${canContact ? '' : 'need-auth'}" ${canContact ? `target="_blank" rel="noopener" href="${waLink(contactNum, 'Hi! I saw your listing “' + l.title + '” on HuntIn. Is it still available?')}"` : 'href="#/login"'}>
            ${ic('wa')} WhatsApp</a>
        </div>
        <button class="btn btn-outline btn-block" id="btn-msg" style="margin-top:8px">${ic('chat')} ${esc(t('msg_app'))}</button>
        <p class="hint-t" style="margin-top:10px">${ic('shield')} ${esc(t('never_pay_side'))}</p>
      </div>
    </div>
  </div>`;

  // gallery
  if (photos.length > 1) {
    let gi = 0;
    const show = i => {
      gi = (i + photos.length) % photos.length;
      v.querySelector('#gal-img').src = photos[gi].url;
      v.querySelector('#gal-count').textContent = (gi + 1) + '/' + photos.length;
      v.querySelectorAll('.gal-thumbs img').forEach((t, ti) => t.classList.toggle('on', ti === gi));
    };
    v.querySelector('#gal-prev').onclick = () => show(gi - 1);
    v.querySelector('#gal-next').onclick = () => show(gi + 1);
    v.querySelectorAll('.gal-thumbs img').forEach(t => t.onclick = () => show(+t.dataset.i));
    v.querySelector('#gal-img').onclick = () => lightbox(photos[gi].url);
  } else if (photos.length === 1) {
    v.querySelector('#gal-img').onclick = () => lightbox(photos[0].url);
  }

  v.querySelectorAll('.gallery img, .gal-thumbs img').forEach(el => { el.style.cursor = 'zoom-in'; });

  // location map — the SAME Google map the landlord pinned the spot on in the
  // create/edit wizard, so what students see is exactly what was pinned.
  if (coords) {
    const el = document.getElementById('lmap');
    if (el) {
      loadLeaflet().then(() => {
        const m = makeMap(el, { lat: l.lat, lng: l.lng, zoom: 17, zoomMin: 10, mode: 'page' });
        L.marker([l.lat, l.lng], { icon: redPinIcon(false), keyboard: false }).addTo(m.map)
          .bindPopup(`<b>${esc(l.title)}</b><br><span style="color:var(--ink2)">${esc(l.area)}${l.landmark ? ' · ' + esc(l.landmark) : ''}</span>`);
        setTimeout(() => m.map.invalidateSize(), 60);
        onLeave(() => { try { m.destroy(); } catch (e) {} });
      }).catch(() => {
        el.innerHTML = `<div class="gm-err"><div><b>${esc(t('map_fail_t'))}</b><br><span style="margin-top:6px;display:inline-block">${esc(t('map_fail_d'))}</span></div></div>`;
      });
    }
  }

  // actions
  v.querySelector('#btn-fav').onclick = async () => {
    if (!state.user) { location.hash = '#/login'; return; }
    const res = await api('/favorites/' + l.id, { method: 'POST' });
    if (res.ok) { v.querySelector('#btn-fav').innerHTML = `${ic('heart')} ${res.on ? esc(t('saved_b')) : esc(t('save_b'))}`; toast(res.on ? t('saved_fav') : t('removed_fav')); }
    else toast(res.error, true);
  };
  v.querySelector('#btn-share').onclick = async () => {
    const url = location.href;
    if (navigator.share) { try { await navigator.share({ title: l.title, url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); toast(t('link_copied')); } catch {} }
  };
  v.querySelector('#btn-report').onclick = () => openReport(l.id);
  v.querySelector('#btn-msg').onclick = async () => {
    if (!state.user) { location.hash = '#/login'; return; }
    const res = await api('/convs', { body: { listingId: l.id } });
    if (res.ok) location.hash = '#/chat/' + res.id;
    else toast(res.error, true);
  };

  // similar
  if (r.similar && r.similar.length) {
    document.getElementById('similar-box').innerHTML = `<div class="sec"><div class="sec-h"><h2>${esc(t('similar_h'))}</h2></div>
      <div class="grid">${r.similar.map(listingCard).join('')}</div></div>`;
  }
}

async function viewFavorites() {
  const v = document.getElementById('view');
  const gen = routeGen;
  v.innerHTML = `<div class="sec-h"><h2>${esc(t('fav_t'))}</h2></div>${skeletonGrid(3)}`;
  const r = await api('/my/favorites');
  if (stale(gen)) return;
  if (!r.ok) { v.innerHTML = emptyBox(t('signin_req'), t('signin_req_d')); return; }
  v.innerHTML = r.items.length
    ? `<div class="sec-h"><h2>${esc(t('fav_t'))}</h2></div><div class="grid">${r.items.map(listingCard).join('')}</div>`
    : emptyBox(t('no_favs_t'), t('no_favs_d'));
}

function viewPrivacy() {
  document.getElementById('view').innerHTML = `
  <div class="sec-h"><h2>${esc(t('privacy_safety'))}</h2></div>
  <div class="sec-block">
    <h3>${esc(t('pv_store_t'))}</h3>
    <p style="font-size:13.5px;color:var(--ink2);margin-bottom:10px">${esc(t('pv_store_d'))}</p>
    <h3>${esc(t('pv_seen_t'))}</h3>
    <p style="font-size:13.5px;color:var(--ink2);margin-bottom:10px">${esc(t('pv_seen_d'))}</p>
    <h3>${esc(t('pv_rule_t'))}</h3>
    <p style="font-size:13.5px;color:var(--ink2);margin-bottom:10px">${esc(t('pv_rule_d'))}</p>
    <h3>${esc(t('pv_data_t'))}</h3>
    <p style="font-size:13.5px;color:var(--ink2)">${esc(t('pv_data_d'))}</p>
  </div>`;
}
