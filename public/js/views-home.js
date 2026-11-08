// HuntIn — Home + Search views
const SEARCH = { q: '', country: '', ptype: '', min: '', max: '', furnishing: '', amenities: [], sort: 'new' };

// the renter's own country (from the Cloudflare edge — /api/geo at boot).
// "Near you" is COUNTRY-first: a renter in Kenya sees Kenyan homes, never a
// random flat in India. GPS refines it to real distance when permission is given.
function myCountryName() { return countryOfCc(state.cc || ''); }

async function viewHome() {
  const v = document.getElementById('view');
  const gen = routeGen;
  const myTown = getMyTown();
  const hasPos = !!getMyPos();
  const myC = myCountryName();
  const myF = myC ? flagImg(myC) : '🌍';
  v.innerHTML = `
    <section class="hero">
      <div class="hero-leaf"></div>
      <h1>${esc(t('hero_title'))}</h1>
      <p>${esc(t('hero_sub'))}</p>
      <div class="hero-search">
        <input class="inp" id="hero-q" placeholder="${esc(t('hero_ph'))}">
        <button class="btn btn-primary" id="hero-go">${ic('search')}</button>
      </div>
      <div class="hero-chips">${COUNTRIES.filter(c => c.feat).map(c => `<button class="chip" data-area="${esc(c.n)}">${flagImg(c.n)} ${esc(c.n)}</button>`).join('')}</div>
    </section>
    <div class="sec" id="home-country"></div>
    <div class="sec" id="home-nearby"></div>
    <div class="sec" id="home-boosted"></div>
    <div class="sec" id="home-newest"></div>
    <div class="sec">
      <div class="sec-h"><h2>${esc(t('how_t'))}</h2></div>
      <div class="steps3">
        <div class="stepcard"><div class="step-n">1</div><div><h3>${esc(t('how1_t'))}</h3><p>${esc(t('how1_d'))}</p></div></div>
        <div class="stepcard"><div class="step-n">2</div><div><h3>${esc(t('how2_t'))}</h3><p>${esc(t('how2_d'))}</p></div></div>
        <div class="stepcard"><div class="step-n">3</div><div><h3>${esc(t('how3_t'))}</h3><p>${esc(t('how3_d'))}</p></div></div>
      </div>
    </div>
    <div class="sec"><div class="notice notice-g">${ic('shield')}<span>${esc(t('safety_home'))}</span></div></div>
    <div class="sec" id="home-cta"></div>`;

  const go = q => { SEARCH.q = q; SEARCH.country = ''; location.hash = '#/search'; };
  v.querySelector('#hero-go').onclick = () => go(v.querySelector('#hero-q').value);
  v.querySelector('#hero-q').addEventListener('keydown', e => { if (e.key === 'Enter') go(e.target.value); });
  v.querySelectorAll('.hero-chips .chip').forEach(c => c.onclick = () => { SEARCH.country = c.dataset.area; SEARCH.q = ''; location.hash = '#/search'; });

  const countryEl = v.querySelector('#home-country');
  const nearEl = v.querySelector('#home-nearby');

  // ---- section 1: the renter's OWN country — the real "near you" feed ----
  if (myC) {
    countryEl.innerHTML = `<div class="sec-h"><h2>${myF} ${esc(t('near_in', { c: myC }))}</h2><a href="#/search">${esc(t('see_all'))} →</a></div>${skeletonGrid(4)}`;
  } else {
    countryEl.innerHTML = '';
  }

  // ---- section 2: GPS distance refinement (optional, only if permission given) ----
  if (!hasPos && !myTown) {
    nearEl.innerHTML = `<div class="sec-block" style="text-align:center;padding:20px 16px">
      <h3 style="font-size:16px">${ic('pin')} ${esc(t('around_you_t'))}</h3>
      <p class="hint-t" style="margin:6px 0 12px">${esc(t('around_you_d'))}</p>
      <button class="btn btn-primary" id="nb-ask">${ic('pin')} ${esc(t('use_loc'))}</button>
    </div>`;
    nearEl.querySelector('#nb-ask').onclick = () => askLocation(ok => { if (ok) viewHome(); });
  }

  // boosted right now + newest (free launch boosts, visible worldwide)
  const [mine, all] = await Promise.all([
    myC ? api('/listings?' + new URLSearchParams({ country: myC, bt: myC, limit: '8', sort: 'new' })) : Promise.resolve(null),
    api('/listings?' + new URLSearchParams({ limit: '60', sort: 'new' })),
  ]);
  if (stale(gen)) return;
  const items = (all.ok && all.items) || [];
  const pos = getMyPos();
  const boostedItems = items.filter(l => l.boostedUntil && l.boostedUntil > Date.now());

  // paint the country section with real results
  if (myC) {
    const mineItems = (mine && mine.ok && mine.items) || [];
    countryEl.innerHTML = `<div class="sec-h"><h2>${myF} ${esc(t('near_in', { c: myC }))}</h2><a href="#/search">${esc(t('see_all'))} →</a></div>`
      + (mineItems.length
        ? `<div class="grid">${mineItems.slice(0, 8).map(listingCard).join('')}</div>`
        : `<div class="empty">${ic('pin')}<h3>${esc(t('empty_country_t', { c: myC }))}</h3><p>${esc(t('empty_country_d'))}</p></div>`);
  }

  const bEl = v.querySelector('#home-boosted');
  if (boostedItems.length) bEl.innerHTML = `<div class="sec-h"><h2>${ic('bolt')} ${esc(t('boosted_now'))}</h2></div>
    <div class="grid">${boostedItems.slice(0, 4).map(listingCard).join('')}</div>`;
  else bEl.innerHTML = '';

  if (pos) {
    const withD = items.filter(l => l.lat != null && l.lng != null)
      .map(l => ({ l, d: distMeters(pos, l) })).sort((a, b) => a.d - b.d).slice(0, 8);
    nearEl.innerHTML = `<div class="sec-h"><h2>${ic('pin')} ${esc(t('near_you'))}</h2><a href="#/map">${esc(t('open_map'))} →</a></div>`
      + (withD.length ? `<div class="grid">${withD.map(x => listingCard(x.l)).join('')}</div>`
        : `<div class="empty">${ic('pin')}<h3>${esc(t('nothing_m'))}</h3><p>${esc(t('around_you_d'))}</p></div>`);
  } else if (myTown) {
    const inTown = items.filter(l => l.town === myTown).slice(0, 8);
    nearEl.innerHTML = `<div class="sec-h"><h2>${esc(myTown)}</h2><a href="#/search">${esc(t('see_all'))} →</a></div>`
      + (inTown.length ? `<div class="grid">${inTown.map(listingCard).join('')}</div>`
        : `<div class="empty">${ic('pin')}<h3>${esc(t('empty_country_t', { c: myTown }))}</h3><p>${esc(t('empty_country_d'))}</p></div>`);
  }

  v.querySelector('#home-newest').innerHTML = items.length
    ? `<div class="sec-h"><h2>${esc(t('newest_ww'))}</h2><a href="#/search">${esc(t('see_all'))} →</a></div><div class="grid">${items.slice(0, 8).map(listingCard).join('')}</div>`
    : emptyBox(t('empty_country_t', { c: myC || '🌍' }), state.user && state.user.role === 'LANDLORD'
        ? t('empty_country_d')
        : t('post_free'));

  const cta = v.querySelector('#home-cta');
  if (!state.user) {
    cta.innerHTML = `<div class="sec-block" style="background:var(--pine);color:#fff;border:none">
      <h3 style="color:#fff">${esc(t('have_house'))}</h3>
      <p style="font-size:13.5px;color:#d8e8dd;margin-bottom:14px">${esc(t('post_free'))}</p>
      <a class="btn btn-primary" href="#/register">${esc(t('nav_post'))}</a></div>`;
  } else if (state.user.role === 'LANDLORD') {
    cta.innerHTML = `<div class="sec-block" style="background:var(--pine);color:#fff;border:none">
      <h3 style="color:#fff">${esc(t('have_house'))}</h3>
      <p style="font-size:13.5px;color:#d8e8dd;margin-top:8px"><b>1.</b> ${esc(t('verified'))} — ${esc(t('how2_d'))}</p>
      <p style="font-size:13.5px;color:#d8e8dd;margin-bottom:14px"><b>2. ${esc(t('boost_b'))}</b> — ${t('cta_boost_d').replace('{n}', BOOST.days)}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${state.user.verifyStatus !== 'APPROVED' ? `<a class="btn btn-primary" href="#/profile">${ic('shield')} ${esc(t('verified'))}</a>` : ''}
        <a class="btn btn-outline" href="#/mylistings">${ic('doc')} ${esc(t('nav_profile'))}</a>
      </div></div>`;
  }
}

async function viewSearch() {
  const v = document.getElementById('view');
  const gen = routeGen;
  // a brand-new visitor starts in their OWN country — India sees India, not the world
  if (!SEARCH.init) {
    SEARCH.init = true;
    const myC = myCountryName();
    if (myC) SEARCH.country = myC;
  }
  const priceOn = !!SEARCH.country; // mixed currencies make a worldwide price filter meaningless
  v.innerHTML = `
    <div class="filterbar">
      <input class="inp" id="s-q" placeholder="${esc(t('hero_ph'))}" value="${esc(SEARCH.q)}">
      <button class="btn btn-outline" id="s-toggle">${ic('gear')}<span class="hide-p">${esc(t('filters'))}</span></button>
      <button class="btn btn-green" id="s-go">${ic('search')}</button>
    </div>
    <div class="filters hide" id="s-filters">
      <h3>${esc(t('f_country'))}</h3><div class="chips" id="f-country">${['<button class="chip" data-v="">' + esc(t('anywhere')) + '</button>'].concat(COUNTRIES.map(c => `<button class="chip" data-v="${esc(c.n)}">${flagImg(c.n)} ${esc(c.n)}</button>`)).join('')}</div>
      <h3>${esc(t('f_type'))}</h3><div class="chips" id="f-type">${['<button class="chip" data-v="">' + esc(t('any_t')) + '</button>'].concat(TYPES.map(tp => `<button class="chip" data-v="${esc(tp)}">${esc(tv(tp))}</button>`)).join('')}</div>
      <h3>${esc(t('f_price'))}${SEARCH.country ? ' (' + esc(curSym(SEARCH.country) || curCode(SEARCH.country)) + ')' : ''}</h3>
      <div style="display:flex;gap:8px"><input class="inp" id="f-min" type="number" placeholder="${esc(t('f_min'))}" value="${esc(SEARCH.min)}" ${priceOn ? '' : 'disabled'}><input class="inp" id="f-max" type="number" placeholder="${esc(t('f_max'))}" value="${esc(SEARCH.max)}" ${priceOn ? '' : 'disabled'}></div>
      ${priceOn ? '' : `<p class="hint-t">${esc(t('f_country'))}: ${esc(t('anywhere'))}</p>`}
      <h3>${esc(t('f_amen'))}</h3>
      <label class="check"><input type="checkbox" data-a="water" ${SEARCH.amenities.includes('water') ? 'checked' : ''}> ${esc(t('water_incl'))}</label>
      <label class="check"><input type="checkbox" data-a="wifi" ${SEARCH.amenities.includes('wifi') ? 'checked' : ''}> ${esc(t('wifi_incl'))}</label>
      <label class="check"><input type="checkbox" data-a="ensuite" ${SEARCH.amenities.includes('ensuite') ? 'checked' : ''}> ${esc(t('ens_own'))}</label>
      <label class="check"><input type="checkbox" data-a="kitchen" ${SEARCH.amenities.includes('kitchen') ? 'checked' : ''}> ${esc(t('kit_own'))}</label>
      <label class="check"><input type="checkbox" data-a="parking" ${SEARCH.amenities.includes('parking') ? 'checked' : ''}> ${esc(t('parking_f'))}</label>
      <label class="check"><input type="checkbox" data-a="guard" ${SEARCH.amenities.includes('guard') ? 'checked' : ''}> ${esc(t('guard_f'))}</label>
      <label class="check"><input type="checkbox" data-a="backup" ${SEARCH.amenities.includes('backup') ? 'checked' : ''}> ${esc(t('backup_f'))}</label>
      <h3>${esc(t('f_sort'))}</h3>
      <select class="inp" id="f-sort">
        <option value="new">${esc(t('s_new'))}</option>
        <option value="near">${esc(t('s_near'))}</option>
        <option value="priceAsc">${esc(t('s_low'))}</option>
        <option value="priceDesc">${esc(t('s_high'))}</option>
      </select>
    </div>
    <div class="result-count" id="s-count"></div>
    <div id="s-results">${skeletonGrid(6)}</div>`;

  const sel = (id, key) => {
    const box = v.querySelector(id);
    [...box.children].forEach(c => { if (c.dataset.v === SEARCH[key]) c.classList.add('on'); });
    box.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      [...box.children].forEach(c => c.classList.remove('on'));
      b.classList.add('on'); SEARCH[key] = b.dataset.v;
      if (key === 'country') { SEARCH.min = ''; SEARCH.max = ''; viewSearch(); return; } // currency changed → re-render filter
      load();
    });
  };
  v.querySelector('#s-toggle').onclick = () => v.querySelector('#s-filters').classList.toggle('hide');
  v.querySelector('#s-go').onclick = () => { SEARCH.q = v.querySelector('#s-q').value; load(); };
  v.querySelector('#s-q').addEventListener('keydown', e => { if (e.key === 'Enter') { SEARCH.q = e.target.value; load(); } });
  ['#f-min', '#f-max'].forEach(s => v.querySelector(s).addEventListener('change', () => {
    SEARCH.min = v.querySelector('#f-min').value; SEARCH.max = v.querySelector('#f-max').value; load();
  }));
  v.querySelector('#f-sort').value = SEARCH.sort;
  v.querySelector('#f-sort').onchange = e => { SEARCH.sort = e.target.value; load(); };
  v.querySelectorAll('#s-filters input[data-a]').forEach(cb => cb.onchange = () => {
    const a = cb.dataset.a;
    if (cb.checked) { if (!SEARCH.amenities.includes(a)) SEARCH.amenities.push(a); }
    else SEARCH.amenities = SEARCH.amenities.filter(x => x !== a);
    load();
  });
  sel('#f-country', 'country'); sel('#f-type', 'ptype');

  async function load() {
    const params = new URLSearchParams();
    if (SEARCH.q) params.set('q', SEARCH.q);
    if (SEARCH.country) params.set('country', SEARCH.country);
    if (SEARCH.ptype) params.set('ptype', SEARCH.ptype);
    if (SEARCH.min && SEARCH.country) params.set('min', SEARCH.min);
    if (SEARCH.max && SEARCH.country) params.set('max', SEARCH.max);
    if (SEARCH.amenities.length) params.set('amenities', SEARCH.amenities.join(','));
    params.set('sort', SEARCH.sort === 'near' ? 'new' : SEARCH.sort);
    if (SEARCH.country) params.set('bt', SEARCH.country); // boosts target the country being browsed
    params.set('limit', 100);
    const r = await api('/listings?' + params.toString());
    if (stale(gen)) return;
    const box = v.querySelector('#s-results');
    if (!box) return; // view replaced while fetching
    if (!r.ok) { box.innerHTML = emptyBox(t('search_fail'), r.error || t('try_again')); return; }
    let items = r.items;
    if (SEARCH.sort === 'near') {
      const pos = getMyPos();
      if (!pos) { toast(t('allow_loc_first'), true); }
      else items = items.filter(l => l.lat != null && l.lng != null)
        .map(l => ({ l, d: distMeters(pos, l) })).sort((a, b) => a.d - b.d).map(x => x.l);
    }
    const cnt = v.querySelector('#s-count');
    if (cnt) cnt.textContent = items.length + ' ' + t('found');
    box.innerHTML = items.length ? `<div class="grid">${items.map(listingCard).join('')}</div>`
      : emptyBox(t('nothing_m'), t('empty_country_d'));
  }
  load();
}
