// HuntIn — 8-step create/edit listing wizard
const LBLANK = () => ({
  title: '', ptype: 'Studio', units: 1, furnishing: 'Unfurnished', floor: 'Ground',
  country: '', town: '', area: '', landmark: '', lat: null, lng: null, road: 'Paved / tarmac',
  rent: '', period: 'Per Month', deposit: '', fees: 'None', negotiable: false, terms: '',
  water: 'Included in rent', waterCost: '', waterSched: '', waterTank: 'No',
  elec: 'Own meter', elecCost: '', wifi: 'Not available', wifiCost: '', wifiProvider: '',
  garbage: 'Included', backup: 'None',
  bath: '1', ensuite: 'No', kitchen: 'No', parking: 'No', balcony: 'No', tile: 'Tiled', ceiling: 'Yes',
  wardrobe: 'No', hotShower: 'No',
  security: [], tenantPref: 'Anyone', pets: 'No',
  availableFrom: 'Available now', contactPhone: '', photos: [], thumbs: [],
});

const WIZ_STEPS = ['w_basics', 'w_location', 'w_pricing', 'w_utilities', 'w_inside', 'w_tenants', 'w_avail', 'w_photos']; // i18n keys — translated at render time

async function viewCreate(id) {
  if (!state.user) { location.hash = '#/login'; return; }
  if (state.user.role !== 'LANDLORD') {
    document.getElementById('view').innerHTML = emptyBox(t('ll_only_t'), t('ll_only_d'));
    return;
  }
  const v = document.getElementById('view');
  const gen = routeGen; // if the user navigates away mid-fetch, don't paint over the new page
  let L = LBLANK();
  let editingId = null;

  if (id) {
    v.innerHTML = `<div class="pageload"><div class="skel" style="height:200px"></div><div class="skel" style="height:60px"></div></div>`;
    const r = await api('/listings/' + id);
    if (stale(gen)) return;
    if (!r.ok || !r.isOwner) { v.innerHTML = emptyBox(t('cant_edit'), r.error || t('not_yours')); return; }
    L = { ...L, ...r.listing, security: parseSecurity(r.listing.security),
      photos: (r.photos || []).map(p => p.url), thumbs: (r.photos || []).map(p => p.thumb || '') };
    // normalize pre-v3 wording into the new nationwide fields (bath = count, ensuite/kitchen = Yes/No)
    if (L.kitchen === 'Own') L.kitchen = 'Yes';
    if (L.bath === 'Ensuite (own)') { L.ensuite = 'Yes'; L.bath = '1'; }
    if (L.bed === 'Yes' && L.furnishing === 'Unfurnished') L.furnishing = 'Semi-furnished';
    editingId = id;
  }
  let step = 0;
  let pickMap = null; // leaflet instance is destroyed before the wizard re-renders the step

  const yesNo = (k, label) => `
    <label class="lbl">${label}</label>
    <div class="seg" data-k="${k}"><button type="button" data-v="No" class="${L[k] !== 'Yes' ? 'on' : ''}">${esc(t('no_b'))}</button><button type="button" data-v="Yes" class="${L[k] === 'Yes' ? 'on' : ''}">${esc(t('yes_b'))}</button></div>`;
  const sel = (k, label, opts, hint) => `
    <label class="lbl">${label}</label>
    <select class="inp" data-k="${k}">${opts.map(o => `<option value="${esc(o)}" ${L[k] === o ? 'selected' : ''}>${esc(tv(o))}</option>`).join('')}</select>
    ${hint ? `<p class="hint-t">${hint}</p>` : ''}`;
  const txt = (k, label, ph, type = 'text') => `
    <label class="lbl">${label}</label>
    <input class="inp" data-k="${k}" type="${type}" ${type === 'number' ? 'min="0"' : ''} placeholder="${esc(ph || '')}" value="${esc(L[k] == null ? '' : L[k])}">`;

  const STEPS = [
    { t: t('w_basics'), html: () => `
      ${txt('title', t('title_l'), t('title_ph'))}
      ${sel('ptype', t('f_type'), TYPES)}
      <label class="lbl">${esc(t('country_l'))} <span style="font-weight:500">${esc(t('country_note'))}</span></label>
      <button type="button" class="inp country-pick" id="cp-btn" style="display:flex;align-items:center;gap:10px;text-align:left">
        ${L.country ? flagImg(L.country) + '<b style="flex:1">' + esc(L.country) + '</b><span style="display:inline-flex;transform:rotate(90deg);color:var(--ink3)">' + ic('chev') + '</span>' : '<span style="flex:1;color:var(--ink3)">' + esc(t('choose_country_ph')) + '</span><span style="display:inline-flex;transform:rotate(90deg);color:var(--ink3)">' + ic('chev') + '</span>'}
      </button>
      <label class="lbl">${esc(t('city_l'))}</label>
      <input class="inp" data-k="town" list="city-list" placeholder="${esc(t('city_ph'))}" value="${esc(L.town == null ? '' : L.town)}">
      <datalist id="city-list">${CITIES.map(c => `<option value="${esc(c.n)}">${esc(c.c)}</option>`).join('')}</datalist>
      <p class="hint-t">${esc(t('boost_target_hint').replace('{c}', L.country || t('your_country')))}</p>
      ${txt('units', t('units_vac_l'), '6', 'number')}
      <p class="hint-t">${t('units_hint')}</p>
      ${sel('furnishing', t('furnishing_l'), FURN)}
      ${txt('floor', t('floor_l'), t('floor_ph'), 'number')}
      <p class="hint-t">${esc(t('floor_hint'))}</p>` },
    { t: t('w_location'), html: () => `
      ${txt('area', t('area_l'), t('area_ph'))}
      ${txt('landmark', t('landmark_l'), t('landmark_ph'))}
      ${sel('road', t('road_l'), ROADS)}
      <div class="sec-block" style="margin-top:14px;padding:13px">
        <h3 style="font-size:14.5px">${ic('pin')} ${esc(t('pin_exact_t'))}</h3>
        <p class="hint-t">${t('pin_exact_d')}</p>
        <div id="pick-map" style="margin-top:10px;height:300px"></div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <input class="inp" id="pick-q" placeholder="${esc(t('pick_q_ph').replace('{t}', L.town || 'Dubai'))}" autocomplete="off">
          <button class="btn btn-outline btn-sm" id="pick-go" type="button" style="flex:none">${ic('search')} ${esc(t('search_b'))}</button>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" id="pick-gps" type="button">${ic('pin')} ${esc(t('use_loc_cur'))}</button>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <input class="inp" id="pick-lat" placeholder="${esc(t('opt_lat'))}" value="${L.lat ?? ''}">
          <input class="inp" id="pick-lng" placeholder="${esc(t('opt_lng'))}" value="${L.lng ?? ''}">
        </div>
        <p class="hint-t" id="pick-walk" style="margin-top:8px"></p>
      </div>` },
    { t: t('w_pricing'), html: () => `
      ${txt('rent', t('rent_l') + (L.country ? ' (' + (curSym(L.country) || curCode(L.country)) + ' — ' + esc(L.country) + ')' : ''), '650', 'number')}
      ${sel('period', t('period_l'), PERIODS)}
      ${txt('deposit', t('deposit_l') + (L.country ? ' (' + (curSym(L.country) || curCode(L.country)) + ')' : '') + ' — optional', t('dep_ph'), 'number')}
      ${txt('fees', t('fees_l'), t('fees_ph').replace('{s}', curSym(L.country) || '$'))}
      <label class="check"><input type="checkbox" id="w-neg" ${L.negotiable ? 'checked' : ''}> ${esc(t('negotiable_check'))}</label>
      <label class="lbl">${esc(t('terms_l'))}</label>
      <textarea class="inp" data-k="terms" placeholder="${esc(t('terms_ph'))}"> ${esc(L.terms)}</textarea>` },
    { t: t('w_utilities'), html: () => `
      ${sel('water', t('water_l'), WATER)}
      <div id="w-wcost">${txt('waterCost', t('water_cost_l'), t('water_cost_ph').replace(/\{s\}/g, curSym(L.country) || '$'))}</div>
      <div id="w-sched-box">${txt('waterSched', t('wsched_l'), t('wsched_ph'))}</div>
      ${yesNo('waterTank', t('tank_q'))}
      ${sel('elec', t('electricity_l'), ELEC)}
      <div id="w-ecost">${txt('elecCost', t('elec_cost_l'), t('elec_cost_ph').replace(/\{s\}/g, curSym(L.country) || '$'))}</div>
      <p class="hint-t">${esc(t('prepaid_hint'))}</p>
      ${sel('wifi', t('wifi_l'), WIFI)}
      <div id="w-wificost">${txt('wifiCost', t('wifi_cost_l'), t('wifi_cost_ph').replace(/\{s\}/g, curSym(L.country) || '$'))}</div>
      ${txt('wifiProvider', t('wifi_prov_l'), t('wifi_prov_ph'))}
      ${sel('garbage', t('garbage_l'), GARBAGE)}
      ${sel('backup', t('backup_l'), BACKUP)}` },
    { t: t('w_inside'), html: () => `
      ${sel('bath', t('bath_l'), BATHS)}
      ${yesNo('ensuite', t('ens_q'))}
      ${yesNo('kitchen', t('kit_q'))}
      ${yesNo('parking', t('park_q'))}
      ${yesNo('balcony', t('balc_q'))}
      ${sel('tile', t('floor_finish'), ['Tiled', 'Not tiled'])}
      ${yesNo('ceiling', t('ceil_q'))}
      ${yesNo('wardrobe', t('ward_q'))}
      ${yesNo('hotShower', t('shower_q'))}` },
    { t: t('sec_t'), html: () => `
      <label class="lbl">${esc(t('sec_choose'))}</label>
      <div class="chips" id="w-sec">${SECURITY.map(s => `<button type="button" class="chip ${L.security.includes(s) ? 'on' : ''}" data-v="${esc(s)}">${esc(tv(s))}</button>`).join('')}</div>
      ${sel('tenantPref', t('pref_l'), TENANTS, esc(t('pref_hint')))}
      ${yesNo('pets', t('pets_q'))}` },
    { t: t('w_avail_contact'), html: () => `
      <label class="lbl">${esc(t('avail_from'))}</label>
      <select class="inp" id="w-avail">${AVAIL_OPTIONS.map(o => `<option value="${esc(o)}" ${L.availableFrom === o || (!AVAIL_OPTIONS.includes(L.availableFrom) && o === 'Available now' && !L.availableFrom) ? 'selected' : ''}>${esc(tv(o))}</option>`).join('')}</select>
      <div id="w-avail-date" style="display:none">
        <input class="inp" type="date" data-k="availableFrom" value="${/^\d{4}-\d{2}-\d{2}/.test(L.availableFrom || '') ? esc(L.availableFrom) : ''}">
      </div>
      <p class="hint-t">${esc(t('avail_hint'))}</p>
      ${txt('contactPhone', t('contact_l2'), t('contact_ph'))}
      <div class="notice notice-g" style="margin-top:14px">${ic('shield')}<span>${esc(t('phone_priv'))}</span></div>` },
    { t: t('w_photos_pub'), html: () => `
      <label class="lbl">${esc(t('photos_l'))}</label>
      <div class="photo-grid" id="w-photos"></div>
      <input type="file" id="w-file" accept="image/*" multiple hidden>
      <p class="hint-t" style="margin-top:8px">${esc(t('photos_hint'))}</p>
      <div class="sec-block" style="margin-top:14px"><h3>${esc(t('review_t'))}</h3><div id="w-review"></div></div>` },
  ];

  function render() {
    const st = STEPS[step];
    v.innerHTML = `
      <div class="wiz-progress">
        <span class="wiz-step">${esc(t('step_of').replace('{n}', step + 1))}</span>
        <div class="wiz-bar"><i style="width:${((step + 1) / 8) * 100}%"></i></div>
        <span class="wiz-step">${esc(st.t)}</span>
      </div>
      <div class="wiz-steps">${WIZ_STEPS.map((nm, i) =>
        `<button type="button" class="ws ${i === step ? 'on' : (i < step ? 'done' : '')}" data-step="${i}"><b>${i + 1}</b> ${esc(t(nm))}</button>`).join('')}</div>
      <div class="wiz-card"><h2>${esc(st.t)}</h2><div id="wiz-fields">${st.html()}</div>
        ${editingId && step < 7 ? `<button class="btn btn-outline btn-block" id="wz-save" style="margin-top:14px">${ic('check')} ${esc(t('save_now'))}</button>
        <p class="hint-t" style="margin-top:6px">${esc(t('editing_hint'))}</p>` : ''}
        <div class="wiz-nav">
          ${step > 0 ? `<button class="btn btn-outline" id="wz-back">${esc(t('back'))}</button>` : `<button class="btn btn-outline" id="wz-cancel">${esc(t('cancel'))}</button>`}
          <button class="btn btn-green" id="wz-next">${step === 7 ? (editingId ? esc(t('save_changes')) : esc(t('publish'))) : esc(t('next'))}</button>
        </div>
      </div>`;

    // tappable section chips — jump straight to the section you want (e.g. straight to
    // section 5 when editing). Moving BACK is always free; moving forward first checks
    // the fields on the section you are leaving so required data is never skipped.
    v.querySelectorAll('.ws').forEach(b => b.onclick = () => {
      const t = +b.dataset.step;
      if (t === step) return;
      if (t > step) {
        const err = validate(step);
        if (err) { toast(err, true); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      }
      step = t; render(); window.scrollTo({ top: 0 });
    });

    // bind generic inputs
    v.querySelectorAll('[data-k]').forEach(el => {
      const k = el.dataset.k;
      const ev = el.tagName === 'SELECT' || el.type === 'date' ? 'change' : 'input';
      // a select always LOOKS selected — adopt its visible value so validation matches what the user sees
      if (el.tagName === 'SELECT' && !L[k]) L[k] = el.value;
      el.addEventListener(ev, () => { L[k] = el.value; });
    });
    v.querySelectorAll('.seg[data-k]').forEach(seg => seg.querySelectorAll('button').forEach(b => b.onclick = () => {
      seg.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); L[seg.dataset.k] = b.dataset.v;
    }));
    // country flag picker — writes straight into the wizard state and re-draws
    // the step so the boost/currency hints pick the new country up instantly
    const cpBtn = v.querySelector('#cp-btn');
    if (cpBtn) cpBtn.onclick = () => openCountryPicker(L.country, n => { L.country = n; render(); });
    const neg = v.querySelector('#w-neg'); if (neg) neg.onchange = () => { L.negotiable = neg.checked; };
    // ---- utilities: conditional cost fields ----
    const wcostBox = v.querySelector('#w-wcost'), ecostBox = v.querySelector('#w-ecost'), wificostBox = v.querySelector('#w-wificost');
    const wsel = v.querySelector('[data-k="water"]'), esel = v.querySelector('[data-k="elec"]'), wifisel = v.querySelector('[data-k="wifi"]');
    const syncUtilBoxes = () => {
      if (wcostBox) wcostBox.style.display = L.water === 'Included in rent' ? 'none' : '';
      if (ecostBox) ecostBox.style.display = (L.elec === 'Included in rent' || L.elec === 'Own meter' || L.elec === 'Prepaid') ? 'none' : '';
      if (wificostBox) wificostBox.style.display = L.wifi === 'Available but paid separately' ? '' : 'none';
    };
    syncUtilBoxes();
    if (wsel) wsel.addEventListener('change', syncUtilBoxes);
    if (esel) esel.addEventListener('change', syncUtilBoxes);
    if (wifisel) wifisel.addEventListener('change', syncUtilBoxes);
    const schedBox = v.querySelector('#w-sched-box');
    if (schedBox) { schedBox.style.display = L.water === 'Rationed' ? '' : 'none'; if (wsel) wsel.addEventListener('change', () => schedBox.style.display = L.water === 'Rationed' ? '' : 'none'); }
    // ---- availability: preset options, date only when picked ----
    const availSel = v.querySelector('#w-avail'), availDate = v.querySelector('#w-avail-date');
    if (availSel && availDate) {
      if (/^\d{4}-\d{2}-\d{2}/.test(L.availableFrom || '')) availSel.value = 'Pick a date…';
      availDate.style.display = availSel.value === 'Pick a date…' ? '' : 'none';
      availSel.addEventListener('change', () => {
        availDate.style.display = availSel.value === 'Pick a date…' ? '' : 'none';
        if (availSel.value !== 'Pick a date…') L.availableFrom = availSel.value;
      });
    }
    const secBox = v.querySelector('#w-sec'); if (secBox) secBox.onclick = e => {
      const b = e.target.closest('.chip'); if (!b) return;
      b.classList.toggle('on');
      const val = b.dataset.v;
      if (b.classList.contains('on')) { if (!L.security.includes(val)) L.security.push(val); }
      else L.security = L.security.filter(x => x !== val);
    };

    if (step === 1) wireLocation();
    if (step === 7) wirePhotos();

    const back = v.querySelector('#wz-back') || v.querySelector('#wz-cancel');
    back.onclick = () => {
      if (back.id === 'wz-cancel' && step === 0) { location.hash = editingId ? '#/listing/' + editingId : '#/mylistings'; return; }
      step--; render();
    };
    const saveBtn = v.querySelector('#wz-save');
    if (saveBtn) saveBtn.onclick = () => publish(saveBtn);
    v.querySelector('#wz-next').onclick = () => {
      const err = validate(step);
      if (err) { toast(err, true); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (step === 7) publish(); else { step++; render(); window.scrollTo({ top: 0 }); }
    };
  }

  function validate(s) {
    if (s === 0) { if ((L.title || '').trim().length < 4) return t('v_title'); if (!L.ptype) return t('v_ptype'); if (!L.country) return t('v_country'); if (!(L.town || '').trim()) return t('v_city'); }
    if (s === 2) {
      if (!L.rent || Number(L.rent) < 1) return t('v_rent');
      if ((L.contactPhone || state.user.phone || '').replace(/[\s-]/g, '').length < 9) return t('v_phone');
    }
    if (s === 7 && L.photos.length < 3) return t('v_photos');
    return null;
  }

  // ----- location picker (Google Maps — same map students see) -----
  function wireLocation() {
    const box = v.querySelector('#pick-map');
    const latIn = v.querySelector('#pick-lat'), lngIn = v.querySelector('#pick-lng');
    const statusEl = v.querySelector('#pick-walk');
    if (pickMap) { try { pickMap.destroy(); } catch (e) {} pickMap = null; }
    let M = null, pin = null;
    const setPos = (lat, lng, move) => {
      L.lat = +(+lat).toFixed(6); L.lng = +(+lng).toFixed(6);
      latIn.value = L.lat; lngIn.value = L.lng;
      statusEl.innerHTML = `${ic('check')} ${esc(t('spot_pinned'))}${L.town ? '' : ' ' + t('spot_tip')}`;
      if (!M) return; // map still loading — the coordinates are saved, the pin appears once it loads
      // NOTE: inside the wizard `L` is the listing object, so Leaflet must be reached via window.L
      if (!pin) {
        pin = window.L.marker([L.lat, L.lng], { icon: redPinIcon(true), draggable: true, autoPan: true, autoPanPadding: [46, 46] }).addTo(M.map);
        pin.on('drag', () => {
          const p = pin.getLatLng();
          L.lat = +p.lat.toFixed(6); L.lng = +p.lng.toFixed(6);
          latIn.value = L.lat; lngIn.value = L.lng;
        });
        pin.on('dragend', () => {
          const p = pin.getLatLng();
          setPos(p.lat, p.lng, false);
          toast(t('pin_moved'));
        });
      } else {
        pin.setLatLng([L.lat, L.lng]);
      }
      if (move && M) M.setView(L.lat, L.lng, Math.max(M.zoom, 17), true);
    };
    latIn.addEventListener('change', () => { if (latIn.value && lngIn.value) setPos(latIn.value, lngIn.value, true); });
    lngIn.addEventListener('change', () => { if (latIn.value && lngIn.value) setPos(latIn.value, lngIn.value, true); });
    v.querySelector('#pick-gps').onclick = () => {
      if (!navigator.geolocation) { toast(t('geo_unsupported'), true); return; }
      toast(t('getting_loc'));
      navigator.geolocation.getCurrentPosition(
        p => setPos(p.coords.latitude, p.coords.longitude, true),
        () => toast(t('loc_fail'), true)
      );
    };
    // place search: local world-city gazetteer first (instant), worldwide Nominatim fallback
    const qIn = v.querySelector('#pick-q'), goBtn = v.querySelector('#pick-go');
    const doSearch = async () => {
      const raw = qIn.value.trim();
      if (!raw) return;
      goBtn.disabled = true; toast(t('searching'));
      const hit = await searchPlaces(raw);
      goBtn.disabled = false;
      if (!hit) { toast(t('place_nf2'), true); return; }
      setPos(hit.lat, hit.lng, true);
    };
    goBtn.onclick = doSearch;
    qIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });

    loadLeaflet().then(() => {
      const tc = CITIES.find(t => t.n === L.town) || CITIES.find(t => t.c === (L.country || '').replace(/[^A-Za-z ]/g, ''));
      const st = getMyPos();
      const c0 = L.lat != null ? { lat: L.lat, lng: L.lng } : st || tc || WORLD_CENTER;
      M = makeMap(box, {
        lat: c0.lat, lng: c0.lng, zoom: L.lat != null ? 17 : (st || tc ? 14 : 2),
        zoomMin: 2, mode: 'page',
      });
      pickMap = M;
      onLeave(() => { try { M.destroy(); } catch (e) {} });
      // tap anywhere = the pin jumps there (the camera stays put, no blank reload)
      M.map.on('click', e => setPos(e.latlng.lat, e.latlng.lng, false));
      if (L.lat != null) setPos(L.lat, L.lng, false);
      setTimeout(() => M.map.invalidateSize(), 60);
    }).catch(() => {
      box.innerHTML = `<div class="notice notice-o">${esc(t('map_load_fail'))}</div>`;
    });
  }

  // ----- photos -----
  function wirePhotos() {
    const grid = v.querySelector('#w-photos');
    const fileIn = v.querySelector('#w-file');
    const draw = () => {
      grid.innerHTML = L.photos.map((src, i) => `
        <div class="photo-cell"><img src="${src}"><button class="photo-x" data-i="${i}" type="button">✕</button>
          ${i === 0 ? `<span class="mini-tag" style="position:absolute;bottom:4px;left:4px">${esc(t('cover_b'))}</span>` : ''}</div>`).join('')
        + (L.photos.length < 8 ? `<button class="photo-add" id="ph-add" type="button">${ic('camera')}<span>${esc(t('add_photo'))}</span></button>` : '');
      grid.querySelectorAll('.photo-x').forEach(b => b.onclick = () => { const i = +b.dataset.i; L.photos.splice(i, 1); L.thumbs.splice(i, 1); draw(); });
      grid.querySelector('#ph-add').onclick = () => fileIn.click();
      drawReview();
    };
    fileIn.onchange = async () => {
      const files = [...fileIn.files].filter(f => f.type.startsWith('image/'));
      for (const f of files) {
        if (L.photos.length >= 8) { toast(t('max_photos'), true); break; }
        toast(t('processing'));
        try {
          const full = await compressTo(f, 150, 1150, 0.72);
          let th = '';
          try { th = await shrinkDataUrl(full, 340, 0.6); } catch (e2) { /* card falls back to full */ }
          L.photos.push(full); L.thumbs.push(th);
        } catch (e) { toast(e.message, true); }
      }
      fileIn.value = '';
      draw();
    };
    function drawReview() {
      const rv = v.querySelector('#w-review'); if (!rv) return;
      const rows = [
        [t('rev_title'), L.title], [t('type_l'), tv(L.ptype)], [t('location_t'), [L.town, L.country].filter(Boolean).join(', ')],
        [t('area_s'), L.area ? L.area + (L.landmark ? ' — ' + L.landmark : '') : ''],
        [t('rent_l'), L.rent ? cur(L.rent, L.country) + ' / ' + perLong(L.period) : ''],
        [t('deposit_l'), L.deposit ? cur(L.deposit, L.country) : t('none_b')],
        [t('water_l'), tv(L.water)], [t('electricity_l'), tv(L.elec)], ['WiFi', tv(L.wifi)], [t('bath_l'), L.bath],
        [t('own_bath'), L.ensuite === 'Yes' ? t('yes_b') : ''], [t('own_kitchen'), L.kitchen === 'Yes' ? t('yes_b') : ''],
        [t('parking_l'), L.parking === 'Yes' ? t('yes_b') : ''],
        [t('pref_tenants'), tv(L.tenantPref)], [t('pets_l'), tv(L.pets)], [t('avail_from'), L.availableFrom ? tv(L.availableFrom) : t('now_b')], [t('w_photos'), t('n_added').replace('{n}', L.photos.length)],
      ];
      rv.innerHTML = rows.filter(r2 => r2[1]).map(r2 => `<div class="rev-row"><span class="k">${r2[0]}</span><span class="v">${esc(r2[1])}</span></div>`).join('');
    }
    draw();
  }

  async function publish(btn) {
    const b = btn || v.querySelector('#wz-next');
    // quick required-field check before saving from the middle of the wizard
    for (const s of [0, 1, 2]) { const err = validate(s); if (err) { toast(err, true); return; } }
    const bHtml = b.innerHTML;
    b.disabled = true; b.textContent = editingId ? t('saving') : t('publishing');
    if (!L.contactPhone) L.contactPhone = state.user.phone || '';
    // clear costs that don't apply (keeps listings honest and tidy)
    if (L.water === 'Included in rent') L.waterCost = '';
    if (L.water !== 'Rationed') L.waterSched = '';
    if (L.elec === 'Included in rent' || L.elec === 'Own meter' || L.elec === 'Prepaid') L.elecCost = '';
    if (L.wifi !== 'Available but paid separately') L.wifiCost = '';
    if (L.availableFrom === 'Pick a date…' && !/^\d{4}-\d{2}-\d{2}/.test(L.availableFrom || '')) L.availableFrom = 'Available now';
    // make sure every photo has a small thumb (older edits load photos without one)
    for (let i = 0; i < L.photos.length; i++) {
      if (!L.thumbs[i] || L.thumbs[i].length >= L.photos[i].length) {
        try { L.thumbs[i] = await shrinkDataUrl(L.photos[i], 340, 0.6); } catch (e) { L.thumbs[i] = ''; }
      }
    }
    const body = { ...L, photos: L.photos, thumbs: L.thumbs };
    const res = editingId
      ? await api('/listings/' + editingId, { method: 'PUT', body })
      : await api('/listings', { body });
    if (res.ok) {
      toast(editingId ? t('listing_updated') : t('listing_published'));
      location.hash = '#/listing/' + (editingId || res.id);
    } else { toast(res.error, true); b.disabled = false; b.innerHTML = bHtml; }
  }

  render();
}
