#!/usr/bin/env node
/* ============================================================
   HuntIn (global) white-hat test suite — runs against a local
   `wrangler pages dev` instance at http://localhost:8794
   Covers: auth, XSS, SQLi, IDOR, role guards, rate limits,
   payload caps, upload validation, FREE boost country
   targeting, chat, admin hard delete, geo endpoint.
   ============================================================ */
const BASE = 'http://localhost:8794/api';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
};
// assert any-of helper for status checks
const okSt = (name, r, statuses) => ok(name, statuses.includes(r.status), 'got ' + r.status + ' ' + JSON.stringify(r.data).slice(0, 120));

async function req(path, { method, body, token, raw } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(BASE + path, {
    method: method || (body !== undefined ? 'POST' : 'GET'),
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const data = raw ? await res.text() : await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// tiny 3-photo set (valid 1x1 webp/png data URLs)
const PHOTOS = [
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
];
const listingBody = over => ({ title: 'Test House 01', ptype: 'Bedsitter', country: 'Kenya', town: 'Nanyuki', rent: 8000, area: 'Section 9', landmark: 'near the stage', photos: PHOTOS, thumbs: PHOTOS, ...over });

(async () => {
  const PART = process.env.PART || 'both';
  console.log('\n== 0. GEO ENDPOINT (public, no auth) ==');
  let r = await req('/geo');
  ok('geo returns ok with country key', r.data.ok && ('country' in r.data), JSON.stringify(r.data));
  ok('country is string or null', r.data.ok && (r.data.country === null || typeof r.data.country === 'string'));

  console.log('\n== 1. SETUP CLAIM (one-time admin) ==');
  r = await req('/setup');
  ok('setup available before claim', r.data.ok && r.data.available === true);
  r = await req('/setup', { body: { name: 'Owner', username: 'owneradmin', password: 'secret123', confirm: 'secret123', hint: 'the usual', phone: '+254712000001' } });
  ok('admin claimed', r.data.ok && r.data.user && r.data.user.role === 'ADMIN', JSON.stringify(r.data));
  const ADM = r.data.token;
  r = await req('/setup');
  ok('setup locked after claim', r.data.ok && r.data.available === false);
  r = await req('/setup', { body: { name: 'Evil', username: 'eviladmin', password: 'secret123', confirm: 'secret123', hint: 'x', phone: '+254712000002' } });
  ok('second setup attempt rejected', !r.data.ok && r.status === 403);

  console.log('\n== 2. AUTH & INTERNATIONAL PHONE VALIDATION ==');
  r = await req('/register', { body: { role: 'LANDLORD', name: 'Kamau Njoroge', phone: '+254712345678', username: 'kamau', password: 'pass123', confirm: 'pass123', hint: 'nick' } });
  ok('register landlord with +254… phone', r.data.ok, JSON.stringify(r.data));
  ok('phone normalised to 254712345678', r.data.ok && r.data.user.phone === '254712345678');
  const LL = r.data.token;
  r = await req('/register', { body: { role: 'SEEKER', name: 'Ada Okafor', phone: '+447700900123', username: 'ada', password: 'pass123', confirm: 'pass123', hint: 'nick2' } });
  ok('register seeker with +44… phone', r.data.ok && r.data.user.phone === '447700900123', JSON.stringify(r.data));
  const SK = r.data.token;
  r = await req('/register', { body: { role: 'SEEKER', name: 'Local Format', phone: '0712345678', username: 'localfmt', password: 'pass123', confirm: 'pass123', hint: 'n' } });
  ok('local 07… phone REJECTED (global platform needs international)', !r.data.ok);
  r = await req('/register', { body: { role: 'SEEKER', name: 'Bad Phone', phone: '12345', username: 'badphone', password: 'pass123', confirm: 'pass123', hint: 'n' } });
  ok('invalid phone rejected', !r.data.ok);
  r = await req('/register', { body: { role: 'SEEKER', name: 'Dup', phone: '+254711111111', username: 'KAMAU', password: 'pass123', confirm: 'pass123', hint: 'n' } });
  ok('duplicate username (case-insensitive) rejected', !r.data.ok);
  r = await req('/register', { body: { role: 'SEEKER', name: 'Sneaky Hint', phone: '+254722222222', username: 'sneakyhint', password: 'pass123', confirm: 'pass123', hint: 'PASS123' } });
  ok('hint equal to password rejected', !r.data.ok);
  r = await req('/login', { body: { username: 'kamau', password: 'WRONG' } });
  ok('wrong password → 401 generic message', r.status === 401 && r.data.error === 'Wrong username or password');
  r = await req('/login', { body: { username: 'kamau', password: 'pass123' } });
  ok('login works', r.data.ok);

  console.log('\n== 3. ROLE GUARDS ==');
  r = await req('/listings', { body: listingBody({}), token: SK });
  ok('seeker cannot post listings', r.status === 403);
  r = await req('/admin/stats', { token: SK });
  ok('seeker blocked from admin', r.status === 403);
  r = await req('/admin/stats', {});
  ok('anonymous blocked from admin', r.status === 401);
  r = await req('/verify', { body: { docId: PHOTOS[0], docOwn: PHOTOS[0] }, token: SK });
  ok('seeker cannot submit landlord verification', r.status === 403);

  console.log('\n== 4. LISTING VALIDATION ==');
  r = await req('/listings', { body: listingBody({ country: '' }), token: LL });
  ok('missing country rejected', !r.data.ok);
  r = await req('/listings', { body: listingBody({ town: '' }), token: LL });
  ok('missing town rejected', !r.data.ok);
  r = await req('/listings', { body: listingBody({ rent: 0 }), token: LL });
  ok('rent 0 rejected', !r.data.ok);
  r = await req('/listings', { body: listingBody({ title: 'abc' }), token: LL });
  ok('3-char title rejected', !r.data.ok);
  r = await req('/listings', { body: listingBody({ photos: PHOTOS.slice(0, 2) }), token: LL });
  ok('2 photos rejected', !r.data.ok);
  r = await req('/listings', { body: listingBody({ photos: [...PHOTOS, ...PHOTOS, ...PHOTOS] }), token: LL });
  ok('9 photos rejected', !r.data.ok);

  console.log('\n== 5. UPLOAD VALIDATION (strict image MIME) ==');
  r = await req('/listings', { body: listingBody({ photos: ['data:image/svg+xml;base64,PHN2Zy8+', ...PHOTOS.slice(0, 2)] }), token: LL });
  ok('SVG upload rejected (script-capable format)', !r.data.ok, JSON.stringify(r.data));
  r = await req('/listings', { body: listingBody({ photos: ['data:text/html;base64,PGg1Pg==', ...PHOTOS.slice(0, 2)] }), token: LL });
  ok('HTML upload rejected', !r.data.ok);

  console.log('\n== 6. XSS PAYLOADS (stored, must arrive as data only) ==');
  const XSS = '<img src=x onerror=alert(1)>\'";<script>alert(2)</script>';
  r = await req('/listings', { body: listingBody({ title: 'XSS ' + XSS, landmark: XSS }), token: LL });
  ok('XSS listing accepted as DATA (API is JSON)', r.data.ok && r.data.id, JSON.stringify(r.data));
  const xssId = r.data.id;
  r = await req('/listings/' + xssId, {});
  ok('XSS payload stored verbatim (escaped at render time)', r.data.ok && r.data.listing.landmark.includes('<img'));
  const ct = await fetch(BASE + '/listings/' + xssId);
  ok('API sends nosniff + JSON content-type', ct.headers.get('x-content-type-options') === 'nosniff' && (ct.headers.get('content-type') || '').includes('application/json'));

  console.log('\n== 7. SQL INJECTION ==');
  r = await req('/listings?q=' + encodeURIComponent("' OR 1=1--"));
  ok("SQLi in q harmless (' OR 1=1--)", r.data.ok);
  r = await req('/listings?town=' + encodeURIComponent("Nanyuki'; DROP TABLE listings;--"));
  ok('SQLi in town harmless (DROP TABLE)', r.data.ok);
  r = await req('/listings?q=' + encodeURIComponent("%' UNION SELECT 1,2,3--"));
  ok('UNION injection harmless', r.data.ok);
  r = await req('/listings?country=' + encodeURIComponent("Kenya'; DELETE FROM users;--"));
  ok('SQLi in country filter harmless', r.data.ok);
  r = await req('/listings', {});
  ok('listings table still alive after injection attempts', r.data.ok);

  console.log('\n== 8. FREE BOOST — COUNTRY TARGETING (the core feature) ==');
  // raise kamau's listing cap: admin approves his verification (2 → 5 listings)
  r = await req('/verify', { body: { docId: PHOTOS[0], docOwn: PHOTOS[0] }, token: LL });
  ok('kamau submitted verification docs', r.data.ok, JSON.stringify(r.data));
  r = await req('/admin/verifications', { token: ADM });
  const k2 = (r.data.items || []).find(u => u.username === 'kamau');
  r = await req('/admin/verify/' + k2.id, { body: { decision: 'approve' }, token: ADM });
  ok('admin verified kamau (listing cap now 5)', r.data.ok, JSON.stringify(r.data));
  // ORDER MATTERS: Nanyuki is OLDER, Nairobi is NEWER — so any “boost jumps to top”
  // leak would visibly flip the Nairobi feed. Date order alone can't fake the result.
  r = await req('/listings', { body: listingBody({ title: 'Nanyuki Cabin 01', town: 'Nanyuki', country: 'Kenya' }), token: LL });
  const nykId = r.data.id;
  ok('Nanyuki (Kenya) listing posted (older)', !!nykId);
  r = await req('/listings', { body: listingBody({ title: 'Nairobi Flat 01', town: 'Nairobi', country: 'Kenya' }), token: LL });
  const nboId = r.data.id;
  ok('Nairobi (Kenya) listing posted (newer)', !!nboId);
  // FREE boost: one tap by the OWNER, instant 7-day activation, no payment data
  r = await req('/listings/' + nykId + '/boost', { body: {}, token: LL });
  ok('free boost activates instantly', r.data.ok && r.data.until > Date.now(), JSON.stringify(r.data));
  r = await req('/listings/' + nykId + '/boost', { body: {}, token: LL });
  ok('double boost rejected (already boosted)', !r.data.ok);
  // ranking: browsing Nanyuki → boosted older listing JUMPS over the newer Nairobi one;
  // browsing Nairobi → the newer Nairobi listing stays on top (boost did NOT leak).
  r = await req('/listings?bt=' + encodeURIComponent('Nanyuki'));
  ok('Nanyuki browser: boosted listing JUMPS to top (town match)', r.data.items[0] && r.data.items[0].id === nykId, r.data.items.map(i => i.id + ':' + i.title).join(' | '));
  r = await req('/listings?bt=' + encodeURIComponent('Nairobi'));
  ok('Nairobi browser: boost did NOT leak (newer Nairobi listing still on top)', r.data.items[0] && r.data.items[0].id === nboId, r.data.items.map(i => i.id + ':' + i.title).join(' | '));
  r = await req('/listings?bt=' + encodeURIComponent('Kenya'));
  ok('Kenya browser: boosted listing on top (country match)', r.data.items[0] && r.data.items[0].id === nykId);
  r = await req('/listings?bt=' + encodeURIComponent('United Kingdom'));
  ok('UK browser: boost never leaks across countries (newest first)', r.data.items[0] && r.data.items[0].id === nboId);
  r = await req('/listings?bt=');
  ok('no country context → boosts stay normal', r.data.ok);
  // boost abuse guards
  r = await req('/listings/' + nykId + '/boost', { body: {}, token: SK });
  okSt('seeker cannot boost', r, [403]);
  r = await req('/listings/' + xssId + '/boost', { body: {}, token: ADM });
  okSt('admin boosting someone else’s listing blocked', r, [403, 404]);

  console.log('\n== 9. SEARCH ==');
  r = await req('/listings?q=nanyuki');
  ok('q search matches town name', r.data.ok && r.data.items.some(i => i.id === nykId));
  r = await req('/listings?town=Nowhere');
  ok('unknown town → empty result (no error)', r.data.ok && r.data.items.length === 0);

  console.log('\n== 10. IDOR (insecure direct object references) ==');
  r = await req('/register', { body: { role: 'LANDLORD', name: 'Other Landlord', phone: '+254733444555', username: 'otherll', password: 'pass123', confirm: 'pass123', hint: 'n3' } });
  const LL2 = r.data.token;
  r = await req('/listings/' + xssId, { method: 'PUT', body: { title: 'Hijacked Title 01' }, token: LL2 });
  ok('cannot edit someone else\'s listing', r.status === 404);
  r = await req('/listings/' + xssId + '/status', { body: { status: 'TAKEN' }, token: LL2 });
  ok('cannot toggle someone else\'s listing', r.status === 404);
  r = await req('/listings/' + xssId + '/boost', { body: {}, token: LL2 });
  ok('cannot boost someone else\'s listing', r.status === 404);
  r = await req('/listings/' + xssId, { method: 'DELETE', token: LL2 });
  okSt('cannot delete someone else\'s listing', r, [403, 404]);
  r = await req('/listings/' + xssId, { method: 'PUT', body: { title: 'Hijacked Title 01' }, token: SK });
  ok('seeker cannot edit any listing', r.status === 404 || r.status === 403);

  console.log('\n== 11. CHAT (privacy + moderation safety) ==');
  r = await req('/convs', { body: { listingId: nykId }, token: SK });
  ok('seeker opens chat on listing', r.data.ok, JSON.stringify(r.data));
  const convId = r.data.id;
  r = await req('/convs', { body: { listingId: nykId }, token: SK });
  ok('re-opening returns the SAME conversation (no dupes)', r.data.id === convId);
  r = await req('/convs', { body: { listingId: nboId }, token: LL });
  ok('landlord cannot chat on own listing', !r.data.ok);
  r = await req('/convs/' + convId + '/messages', { body: { text: 'Is it still available? <script>x</script>' }, token: SK });
  const mid = r.data.id;
  ok('message sent', !!mid);
  r = await req('/convs/' + convId + '/messages/' + mid, { method: 'PATCH', body: { text: 'edited text here' }, token: SK });
  ok('sender can edit own message', r.data.ok, JSON.stringify(r.data));
  r = await req('/convs/' + convId + '/messages/' + mid, { method: 'PATCH', body: { text: 'hacked' }, token: LL2 });
  okSt('stranger cannot edit the message', r, [403, 404]);
  r = await req('/convs/' + convId, { token: LL2 });
  ok('stranger cannot open the conversation', r.status === 404);
  r = await req('/convs/' + convId + '/messages/' + mid + '?scope=all', { method: 'DELETE', token: LL2 });
  ok('stranger cannot delete-for-everyone', r.status === 404 || r.status === 403);
  r = await req('/convs/' + convId + '/messages/' + mid + '?scope=all', { method: 'DELETE', token: SK });
  ok('sender can delete for everyone', r.data.ok, JSON.stringify(r.data));
  r = await req('/convs/' + convId + '/messages?after=0', { token: LL });
  const tomb = (r.data.items || []).find(m => m.id === mid);
  ok('deleted message is a text-less tombstone', tomb && tomb.deleted === 1 && tomb.text === '');

  console.log('\n== 12. RATE LIMITS ==');
  if (PART === '1') { console.log('  (skipped — heavy part, run with PART=2)'); }
  else {
  let last = null;
  for (let i = 0; i < 10; i++) last = await req('/register', { body: { role: 'SEEKER', name: 'Spam ' + i, phone: '+25471200' + i, username: 'spam' + Date.now() + '_' + i, password: 'pass123', confirm: 'pass123', hint: 'n' } });
  ok('registration flood blocked (8/hour)', last.status === 429, 'last status ' + last.status);
  let lastLogin = null;
  for (let i = 0; i < 10; i++) lastLogin = await req('/login', { body: { username: 'bruteforceme', password: 'wrong' + i } });
  ok('login brute force blocked', lastLogin.status === 429, 'last status ' + lastLogin.status);
  let lastSetup = null;
  for (let i = 0; i < 7; i++) lastSetup = await req('/setup', { body: { name: 'x', username: 'sx' + i, password: 'pass123', confirm: 'pass123', hint: 'h', phone: '+25471234560' } });
  ok('setup hammering rate limited', lastSetup.status === 429 || lastSetup.status === 403, 'last status ' + lastSetup.status);
  }

  console.log('\n== 13. PAYLOAD SIZE CAP ==');
  if (PART === '1') { console.log('  (skipped — heavy part, run with PART=2)'); }
  else {
  const big = 'A'.repeat(17_000_000);
  const bigRes = await fetch(BASE + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'x', password: big }), signal: AbortSignal.timeout(25000) }).catch(e => ({ status: 0 }));
  ok('17 MB body rejected (413 or dropped)', bigRes.status === 413 || bigRes.status === 0, 'got ' + bigRes.status);
  }

  console.log('\n== 14. ADMIN HARD DELETE ==');
  if (PART === '1') { console.log('  (skipped — heavy part, run with PART=2)'); }
  else {
  r = await req('/listings', { body: listingBody({ title: 'Doomed House 01', town: 'Nakuru' }), token: LL2 });
  const doomedId = r.data.id;
  r = await req('/convs', { body: { listingId: doomedId }, token: SK });
  const doomedConv = r.data.id;
  await req('/convs/' + doomedConv + '/messages', { body: { text: 'chat to be wiped' }, token: SK });
  r = await req('/admin/listings/' + doomedId + '/delete', { method: 'POST', body: {}, token: ADM });
  ok('admin hard-deleted the listing', r.data.ok, JSON.stringify(r.data));
  r = await req('/listings/' + doomedId, {});
  ok('deleted listing is GONE (404, not hidden)', r.status === 404);
  r = await req('/convs/' + doomedConv, { token: SK });
  ok('its chats are gone too', r.status === 404);
  r = await req('/admin/users/' + 99999 + '/delete', { method: 'POST', body: {}, token: ADM });
  ok('deleting unknown user does not crash', r.data.ok);
  }

  console.log('\n== 15. SESSION SECURITY ==');
  if (PART === '1') { console.log('  (skipped — heavy part, run with PART=2)'); }
  else {
  r = await req('/me', { token: SK });
  ok('valid token works', r.data.ok && r.data.user.username === 'ada');
  r = await req('/logout', { method: 'POST', token: SK });
  ok('logout ok', r.data.ok);
  r = await req('/me', { token: SK });
  ok('token dead after logout', r.status === 401);
  r = await req('/me', { token: 'forged_token_123' });
  ok('forged token rejected', r.status === 401);
  }

  console.log('\n== 16. SUSPENSION ENFORCEMENT ==');
  if (PART === '1') { console.log('  (skipped — heavy part, run with PART=2)'); }
  else {
  r = await req('/admin/users', { token: ADM });
  const ll2row = (r.data.items || []).find(u => u.username === 'otherll');
  r = await req('/admin/users/' + ll2row.id + '/suspend', { body: { on: true }, token: ADM });
  ok('admin suspended otherll', r.data.ok);
  r = await req('/me', { token: LL2 });
  ok('suspended user blocked everywhere (403)', r.status === 403);
  r = await req('/admin/users/' + ll2row.id + '/delete', { method: 'POST', body: {}, token: ADM });
  ok('admin hard-deleted suspended user', r.data.ok);
  r = await req('/admin/users', { token: ADM });
  ok('deleted user is gone from the list', r.data.ok && !(r.data.items || []).some(u => u.username === 'otherll'));
  r = await req('/login', { body: { username: 'otherll', password: 'pass123' } });
  ok('deleted user cannot log in', !r.data.ok);
  }

  console.log(`\n========================\n  ${pass} passed, ${fail} failed\n========================`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(2); });
