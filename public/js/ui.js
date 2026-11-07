// HuntIn — shared UI helpers, constants, icons
const TYPES = ['Single Room', 'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4+ Bedroom', 'Apartment', 'House', 'Villa'];
// World gazetteer — the countries and cities the app browses, targets boosts and
// searches first. Coordinates are city-centre approximations (the exact spot always
// comes from the landlord's map pin or the renter's GPS). feat:1 = hero chip.
const COUNTRIES = [
  { n: 'Kenya', f: '🇰🇪', feat: 1 }, { n: 'Uganda', f: '🇺🇬', feat: 1 }, { n: 'Tanzania', f: '🇹🇿' },
  { n: 'Rwanda', f: '🇷🇼' }, { n: 'Ethiopia', f: '🇪🇹' }, { n: 'Nigeria', f: '🇳🇬', feat: 1 },
  { n: 'Ghana', f: '🇬🇭', feat: 1 }, { n: 'South Africa', f: '🇿🇦', feat: 1 }, { n: 'Egypt', f: '🇪🇬' },
  { n: 'Morocco', f: '🇲🇦' }, { n: 'United Kingdom', f: '🇬🇧', feat: 1 }, { n: 'Ireland', f: '🇮🇪' },
  { n: 'France', f: '🇫🇷' }, { n: 'Germany', f: '🇩🇪', feat: 1 }, { n: 'Spain', f: '🇪🇸' },
  { n: 'Italy', f: '🇮🇹' }, { n: 'Netherlands', f: '🇳🇱' }, { n: 'Portugal', f: '🇵🇹' },
  { n: 'Poland', f: '🇵🇱' }, { n: 'Sweden', f: '🇸🇪' }, { n: 'Switzerland', f: '🇨🇭' },
  { n: 'Turkey', f: '🇹🇷' }, { n: 'United States', f: '🇺🇸', feat: 1 }, { n: 'Canada', f: '🇨🇦', feat: 1 },
  { n: 'Mexico', f: '🇲🇽' }, { n: 'Brazil', f: '🇧🇷' }, { n: 'Argentina', f: '🇦🇷' },
  { n: 'Colombia', f: '🇨🇴' }, { n: 'Chile', f: '🇨🇱' }, { n: 'United Arab Emirates', f: '🇦🇪', feat: 1 },
  { n: 'Saudi Arabia', f: '🇸🇦' }, { n: 'Qatar', f: '🇶🇦' }, { n: 'India', f: '🇮🇳', feat: 1 },
  { n: 'Pakistan', f: '🇵🇰' }, { n: 'Bangladesh', f: '🇧🇩' }, { n: 'Nepal', f: '🇳🇵' },
  { n: 'Sri Lanka', f: '🇱🇰' }, { n: 'China', f: '🇨🇳' }, { n: 'Japan', f: '🇯🇵' },
  { n: 'South Korea', f: '🇰🇷' }, { n: 'Vietnam', f: '🇻🇳' }, { n: 'Thailand', f: '🇹🇭' },
  { n: 'Malaysia', f: '🇲🇾' }, { n: 'Singapore', f: '🇸🇬' }, { n: 'Indonesia', f: '🇮🇩' },
  { n: 'Philippines', f: '🇵🇭' }, { n: 'Australia', f: '🇦🇺' }, { n: 'New Zealand', f: '🇳🇿' },
];
const CFLAG = Object.fromEntries(COUNTRIES.map(c => [c.n, c.f]));
const flagOf = n => CFLAG[n] || '';
// big:1 = major metro (map fallback). Coordinates are city-centre approximations.
const CITIES = [
  // Africa
  { n: 'Nairobi', c: 'Kenya', lat: -1.2864, lng: 36.8172, big: 1 },
  { n: 'Mombasa', c: 'Kenya', lat: -4.0435, lng: 39.6682 },
  { n: 'Kisumu', c: 'Kenya', lat: -0.0917, lng: 34.7680 },
  { n: 'Kampala', c: 'Uganda', lat: 0.3476, lng: 32.5825 },
  { n: 'Dar es Salaam', c: 'Tanzania', lat: -6.7924, lng: 39.2083 },
  { n: 'Kigali', c: 'Rwanda', lat: -1.9441, lng: 30.0619 },
  { n: 'Addis Ababa', c: 'Ethiopia', lat: 9.0192, lng: 38.7525 },
  { n: 'Lagos', c: 'Nigeria', lat: 6.5244, lng: 3.3792, big: 1 },
  { n: 'Abuja', c: 'Nigeria', lat: 9.0765, lng: 7.3986 },
  { n: 'Accra', c: 'Ghana', lat: 5.6037, lng: -0.1870 },
  { n: 'Johannesburg', c: 'South Africa', lat: -26.2041, lng: 28.0473 },
  { n: 'Cape Town', c: 'South Africa', lat: -33.9249, lng: 18.4241, big: 1 },
  { n: 'Durban', c: 'South Africa', lat: -29.8587, lng: 31.0218 },
  { n: 'Cairo', c: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { n: 'Casablanca', c: 'Morocco', lat: 33.5731, lng: -7.5898 },
  // Europe
  { n: 'London', c: 'United Kingdom', lat: 51.5074, lng: -0.1278, big: 1 },
  { n: 'Manchester', c: 'United Kingdom', lat: 53.4808, lng: -2.2426 },
  { n: 'Birmingham', c: 'United Kingdom', lat: 52.4862, lng: -1.8904 },
  { n: 'Dublin', c: 'Ireland', lat: 53.3498, lng: -6.2603 },
  { n: 'Paris', c: 'France', lat: 48.8566, lng: 2.3522, big: 1 },
  { n: 'Berlin', c: 'Germany', lat: 52.5200, lng: 13.4050 },
  { n: 'Munich', c: 'Germany', lat: 48.1351, lng: 11.5820 },
  { n: 'Madrid', c: 'Spain', lat: 40.4168, lng: -3.7038 },
  { n: 'Barcelona', c: 'Spain', lat: 41.3874, lng: 2.1686 },
  { n: 'Rome', c: 'Italy', lat: 41.9028, lng: 12.4964 },
  { n: 'Milan', c: 'Italy', lat: 45.4642, lng: 9.1900 },
  { n: 'Amsterdam', c: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { n: 'Brussels', c: 'Belgium', lat: 50.8503, lng: 4.3517 },
  { n: 'Lisbon', c: 'Portugal', lat: 38.7223, lng: -9.1393 },
  { n: 'Warsaw', c: 'Poland', lat: 52.2297, lng: 21.0122 },
  { n: 'Stockholm', c: 'Sweden', lat: 59.3293, lng: 18.0686 },
  { n: 'Zurich', c: 'Switzerland', lat: 47.3769, lng: 8.5417 },
  { n: 'Istanbul', c: 'Turkey', lat: 41.0082, lng: 28.9784 },
  // Americas
  { n: 'New York', c: 'United States', lat: 40.7128, lng: -74.0060, big: 1 },
  { n: 'Los Angeles', c: 'United States', lat: 34.0522, lng: -118.2437 },
  { n: 'Chicago', c: 'United States', lat: 41.8781, lng: -87.6298 },
  { n: 'Houston', c: 'United States', lat: 29.7604, lng: -95.3698 },
  { n: 'Miami', c: 'United States', lat: 25.7617, lng: -80.1918 },
  { n: 'Toronto', c: 'Canada', lat: 43.6532, lng: -79.3832, big: 1 },
  { n: 'Vancouver', c: 'Canada', lat: 49.2827, lng: -123.1207 },
  { n: 'Montreal', c: 'Canada', lat: 45.5019, lng: -73.5674 },
  { n: 'Mexico City', c: 'Mexico', lat: 19.4326, lng: -99.1332 },
  { n: 'Sao Paulo', c: 'Brazil', lat: -23.5505, lng: -46.6333 },
  { n: 'Rio de Janeiro', c: 'Brazil', lat: -22.9068, lng: -43.1729 },
  { n: 'Buenos Aires', c: 'Argentina', lat: -34.6037, lng: -58.3816 },
  { n: 'Bogota', c: 'Colombia', lat: 4.7110, lng: -74.0721 },
  { n: 'Santiago', c: 'Chile', lat: -33.4489, lng: -70.6693 },
  // Middle East
  { n: 'Dubai', c: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, big: 1 },
  { n: 'Abu Dhabi', c: 'United Arab Emirates', lat: 24.4539, lng: 54.3773 },
  { n: 'Doha', c: 'Qatar', lat: 25.2854, lng: 51.5310 },
  { n: 'Riyadh', c: 'Saudi Arabia', lat: 24.7136, lng: 46.6753 },
  // Asia
  { n: 'Mumbai', c: 'India', lat: 19.0760, lng: 72.8777, big: 1 },
  { n: 'Delhi', c: 'India', lat: 28.6139, lng: 77.2090 },
  { n: 'Bengaluru', c: 'India', lat: 12.9716, lng: 77.5946 },
  { n: 'Karachi', c: 'Pakistan', lat: 24.8607, lng: 67.0011 },
  { n: 'Dhaka', c: 'Bangladesh', lat: 23.8103, lng: 90.4125 },
  { n: 'Kathmandu', c: 'Nepal', lat: 27.7172, lng: 85.3240 },
  { n: 'Colombo', c: 'Sri Lanka', lat: 6.9271, lng: 79.8612 },
  { n: 'Beijing', c: 'China', lat: 39.9042, lng: 116.4074 },
  { n: 'Shanghai', c: 'China', lat: 31.2304, lng: 121.4737 },
  { n: 'Tokyo', c: 'Japan', lat: 35.6762, lng: 139.6503, big: 1 },
  { n: 'Seoul', c: 'South Korea', lat: 37.5665, lng: 126.9780 },
  { n: 'Bangkok', c: 'Thailand', lat: 13.7563, lng: 100.5018 },
  { n: 'Kuala Lumpur', c: 'Malaysia', lat: 3.1390, lng: 101.6869 },
  { n: 'Singapore', c: 'Singapore', lat: 1.3521, lng: 103.8198, big: 1 },
  { n: 'Jakarta', c: 'Indonesia', lat: -6.2088, lng: 106.8456 },
  { n: 'Manila', c: 'Philippines', lat: 14.5995, lng: 120.9842 },
  { n: 'Ho Chi Minh City', c: 'Vietnam', lat: 10.8231, lng: 106.6297 },
  // Oceania
  { n: 'Sydney', c: 'Australia', lat: -33.8688, lng: 151.2093 },
  { n: 'Melbourne', c: 'Australia', lat: -37.8136, lng: 144.9631 },
  { n: 'Perth', c: 'Australia', lat: -31.9505, lng: 115.8605 },
  { n: 'Auckland', c: 'New Zealand', lat: -36.8485, lng: 174.7633 },
];
// One planet, one site: the renter's own position (GPS) and the city they are
// browsing replace the old campus/county concepts.
const WORLD_CENTER = { lat: 20, lng: 5 }; // centres the whole planet in view
const FURN = ['Furnished', 'Semi-furnished', 'Unfurnished'];
const PERIODS = ['Per Month', 'Per Year'];
const WATER = ['Included in rent', 'Pay separately', 'Rationed'];
const ELEC = ['Included in rent', 'Own meter', 'Shared meter', 'Prepaid'];
const WIFI = ['Included in rent', 'Available but paid separately', 'Not available'];
const GARBAGE = ['Included', 'Not included', 'Paid separately'];
const BACKUP = ['None', 'Solar', 'Generator'];
const BATHS = ['1', '2', '3', '4+']; // bathroom COUNT — no more "shared/communal" hostel wording
const TENANTS = ['Anyone', 'Family', 'Singles / couples', 'Working professionals'];
const ROADS = ['Paved / tarmac', 'Gravel / dirt', 'Footpath only'];
const SECURITY = ['Guard', 'Gate lock', 'CCTV'];
const FLOORS = ['Ground', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
const AVAIL_OPTIONS = ['Available now', 'Within a week', 'Within a month', 'Next month', 'Pick a date…'];
const REPORT_REASONS = ['Fake or scam listing', 'Unit is already taken', 'Wrong price or info', 'Poster is not the landlord', 'Misleading photos', 'Other'];
const BOOST = { days: 7 }; // free during launch — one tap, no payment

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const usd = n => '$' + Number(n || 0).toLocaleString('en-US');
const shortK = n => '$' + (n >= 1000 ? ((n / 1000) >= 10 ? Math.round(n / 1000) : (n / 1000).toFixed(1).replace('.0', '')) + 'k' : String(n || 0));
const perShort = p => !p ? 'mo' : p.startsWith('Per Month') ? 'mo' : p.startsWith('Per Semester') ? 'sem' : 'yr';

function distMeters(a, b) {
  const R = 6371000, dLa = (b.lat - a.lat) * Math.PI / 180, dLo = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
// formatted distance from the renter to a point — "350 m", "2.3 km", "14 km"
const fmtDist = m => m == null ? '' : m < 950 ? Math.round(m / 50) * 50 + ' m' : (m / 1000).toFixed(m < 9500 ? 1 : 0).replace(/\.0$/, '') + ' km';

// ---- the renter's position & town (the heart of "houses near me") ----------
// pos: GPS position when the renter shares location. myTown: the town they are
// browsing — detected from GPS, or chosen by hand. Both persist on this device.
function getMyPos() { try { const v = JSON.parse(localStorage.getItem('hl_pos') || 'null'); return v && typeof v.lat === 'number' ? v : null; } catch (e) { return null; } }
function setMyPos(lat, lng) { try { localStorage.setItem('hl_pos', JSON.stringify({ lat: +lat, lng: +lng, at: Date.now() })); } catch (e) {} }
function getMyTown() { try { return localStorage.getItem('hl_town') || ''; } catch (e) { return ''; } }
function setMyTown(t) { try { t ? localStorage.setItem('hl_town', t) : localStorage.removeItem('hl_town'); } catch (e) {} }
function nearestTown(lat, lng) {
  let best = null, bd = Infinity;
  for (const t of CITIES) { const d = distMeters({ lat, lng }, t); if (d < bd) { bd = d; best = t; } }
  return { town: best.n, dist: bd };
}
function askLocation(cb) {
  if (!navigator.geolocation) { toast('Your browser does not support location', true); return; }
  toast('Getting your location…');
  navigator.geolocation.getCurrentPosition(
    p => {
      setMyPos(p.coords.latitude, p.coords.longitude);
      const near = nearestTown(p.coords.latitude, p.coords.longitude);
      if (near.dist < 60000) setMyTown(near.town); // GPS says which town you are in
      if (cb) cb(true);
    },
    () => { toast('Location permission denied — choose your town below instead', true); if (cb) cb(false); },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 }
  );
}
// distance line for a listing card, e.g. "· 2.3 km away" (empty when no GPS)
function distLabel(l) {
  const p = getMyPos();
  if (!p || l.lat == null || l.lng == null) return '';
  return fmtDist(distMeters(p, l)) + ' away';
}

function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.max(1, (Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 86400 * 7) return Math.floor(s / 86400) + 'd ago';
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
function fmtDate(ts) { return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
function fmtAvail(v) { if (!v) return 'Now'; return /^\d{4}-\d{2}-\d{2}/.test(v) ? fmtDate(v) : v; }
const parseSecurity = s => { try { const v = JSON.parse(s || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };

function amenityTags(l) {
  const t = [];
  if (l.water === 'Included in rent') t.push('Water incl.');
  if (l.wifi === 'Included in rent') t.push('WiFi');
  if (l.elec === 'Included in rent') t.push('Power incl.');
  if (l.ensuite === 'Yes' || l.bath === 'Ensuite (own)') t.push('En-suite');
  if (l.kitchen === 'Yes' || l.kitchen === 'Own') t.push('Own kitchen');
  if (l.parking === 'Yes') t.push('Parking');
  if (l.backup && l.backup !== 'None') t.push(l.backup + ' backup');
  if (parseSecurity(l.security).includes('Guard')) t.push('Guard');
  return t.slice(0, 3).map(x => `<span class="mini-tag">${esc(x)}</span>`).join('');
}

// Search a place: the built-in world cities first (instant + always works),
// then worldwide Nominatim — any address, estate or landmark on Earth.
async function searchPlaces(q) {
  const raw = String(q || '').trim();
  if (!raw) return null;
  const low = raw.toLowerCase();
  const hit = CITIES.find(p => p.n.toLowerCase() === low)
    || CITIES.find(p => p.n.toLowerCase().startsWith(low))
    || CITIES.find(p => p.n.toLowerCase().includes(low));
  if (hit) return { lat: hit.lat, lng: hit.lng, local: true };
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=en&q=' + encodeURIComponent(raw), { headers: { Accept: 'application/json' } });
    const j = await r.json();
    if (j && j[0]) return { lat: +j[0].lat, lng: +j[0].lon, local: false };
  } catch (e) { /* offline — fall through */ }
  return null;
}

// Numbers are stored digits-only in international form (e.g. 254712345678, 447700900123)
function waLink(num, text) {
  const n = String(num || '').replace(/\D/g, '');
  return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
}

// ---------- icons (stroke) ----------
function ic(name, cls) {
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    pin: '<path d="M12 21s-7-5.9-7-11a7 7 0 1 1 14 0c0 5.1-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    chat: '<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.6 0-3-.4-4.3-1L3 21l1.6-4.2A8.5 8.5 0 1 1 21 12z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6"/>',
    heart: '<path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    bolt: '<path d="M13 2 4.5 13.5H11L9.5 22 18 10.5h-6.5L13 2z"/>',
    shield: '<path d="M12 2.5 20 6v6c0 5-3.4 8.2-8 9.5C7.4 20.2 4 17 4 12V6l8-3.5z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
    back: '<path d="M15 19 8 12l7-7"/>',
    phone: '<path d="M5 3h4l1.5 5L8 9.7a13 13 0 0 0 6.3 6.3l1.7-2.5 5 1.5v4a2 2 0 0 1-2.2 2A17.9 17.9 0 0 1 3 5.2 2 2 0 0 1 5 3z"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/>',
    check: '<path d="m4.5 12.5 5 5L19.5 7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1"/>',
    out: '<path d="M9 4H5v16h4"/><path d="M14 8l4 4-4 4M18 12H8"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    photo: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m4.5 17.5 5-5 3.5 3.5 3-3 3.5 3.5"/>',
    doc: '<path d="M6 2.5h8L19 8v13.5H6z"/><path d="M13.5 2.5V8H19"/>',
    wa: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z"/><path d="M8.8 9.2c.6 2.7 3.3 5.3 6 6l1.3-1.5-2-1.2-1 .7a6.4 6.4 0 0 1-2.3-2.3l.7-1-1.2-2-1.5 1.3z"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
    edit: '<path d="M4 20h4L20 8l-4-4L4 16v4z"/>',
    send: '<path d="M21 3 10.5 13.5M21 3l-7 18-3.5-7.5L3 10l18-7z"/>',
    star: '<path d="m12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.2-5.6-3.1L6.4 20l1.2-6.2L3 9.6l6.3-.8L12 3z"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7"/>',
    moon: '<path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 1 0 10.7 10.7z"/>',
  };
  // width/height attrs = safe intrinsic default (18px); CSS rules override per context.
  // Without these, an SVG with only a viewBox blows up to fill flex/grid containers.
  return `<svg class="${cls || ''}" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}

// ---------- toast / modal / lightbox ----------
// (theme keys live on this device under hl_* — see api.js token key)
let toastTimer;
function toast(msg, isErr) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (isErr ? ' err' : '');
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
}
function modal(html, onOpen) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-ov"><div class="modal">${html}</div></div>`;
  const ov = root.firstElementChild;
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  if (onOpen) onOpen(root.querySelector('.modal'));
  return () => closeModal();
}
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }
function confirmDlg(title, text, okLabel, cb, danger) {
  modal(`<h3>${esc(title)}</h3><p class="auth-sub">${esc(text)}</p>
    <div style="display:flex;gap:9px;margin-top:18px">
      <button class="btn btn-outline" style="flex:1" data-close>Cancel</button>
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" style="flex:1" id="cf-ok">${esc(okLabel || 'Yes')}</button>
    </div>`, m => m.querySelector('#cf-ok').addEventListener('click', () => { closeModal(); cb(); }));
}
// report modal shared by listing page + chat thread
function openReport(listingId) {
  if (!state.user) { location.hash = '#/login'; return; }
  modal(`<h3>Report this listing</h3>
    <label class="lbl">Reason</label>
    <select class="inp" id="rp-reason">${REPORT_REASONS.map(x => `<option>${esc(x)}</option>`).join('')}</select>
    <label class="lbl">Details (optional)</label>
    <textarea class="inp" id="rp-note" placeholder="Tell us what is wrong…"></textarea>
    <button class="btn btn-primary btn-block" style="margin-top:14px" id="rp-send">Send report</button>`,
    m => m.querySelector('#rp-send').onclick = async () => {
      const res = await api('/listings/' + listingId + '/report', { body: { reason: m.querySelector('#rp-reason').value, note: m.querySelector('#rp-note').value } });
      closeModal();
      toast(res.ok ? 'Report sent. Our team will review it.' : res.error, !res.ok);
    });
}

// Worldwide scam warning for renters (first visit per device)
function maybeStudentCaution() {
  let acked = false;
  try { acked = !!localStorage.getItem('hl_caution'); } catch (e) { return; }
  if (acked || !state.user || state.user.role === 'LANDLORD') return;
  modal(`<div style="text-align:center;padding:4px 2px">
    <div style="width:60px;height:60px;margin:0 auto 12px;border-radius:18px;background:var(--ember-mist);color:var(--ember-deep);display:grid;place-items:center">${ic('shield')}</div>
    <h3 style="font-family:var(--disp);font-size:19px">Before you pay anyone</h3>
    <p style="font-size:13.5px;color:var(--ink2);line-height:1.55;margin:8px 0 12px">HuntIn never handles your rent. <b>Never send money — by transfer, app or cash — before you have physically visited the house and met the landlord or caretaker in person.</b></p>
    <div class="notice notice-r" style="text-align:left;margin-bottom:14px">${ic('flag')}<span><b>Scam signs:</b> a "viewing fee", refusing to meet in person, or pressure to pay before you have seen the house.</span></div>
    <button class="btn btn-green btn-block" id="ca-ok">I understand — show me houses</button>
  </div>`, m => m.querySelector('#ca-ok').onclick = () => {
    try { localStorage.setItem('hl_caution', '1'); } catch (e) {}
    closeModal();
  });
}

function lightbox(src) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = src;
  lb.hidden = false;
  lb.onclick = () => { lb.hidden = true; };
}

// ---------- light / dark / system theme ----------
// Three modes, like every other website: LIGHT, DARK, or SYSTEM (follows the
// phone/computer setting and switches automatically). The choice is saved per device.
// First-ever visitors get SYSTEM default — no saved choice means "match my device".
const THEME_META = { light: '#0e5a33', dark: '#141713' };
const THEME_NAMES = { light: 'Light mode', dark: 'Dark mode', system: 'System default' };
const sysDark = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); } catch (e) { return false; } };
function resolveTheme(mode) { return (mode === 'dark' || (mode !== 'light' && sysDark())) ? 'dark' : 'light'; }
function applyTheme(mode, save) {
  if (save) { try { localStorage.setItem('hl_theme', mode); } catch (e) {} }
  const t = resolveTheme(mode);
  document.documentElement.dataset.theme = t;
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', THEME_META[t]);
  // keep every toggle button on the page in sync (topbar, side nav, profile row).
  // Rich rows (profile) keep their own markup — we only swap the icon + state text.
  document.querySelectorAll('[data-theme-toggle]').forEach(b => {
    const ico = ic(mode === 'system' ? 'gear' : (t === 'dark' ? 'sun' : 'moon'));
    const st = b.querySelector('.theme-state');
    if (st) {
      st.textContent = mode === 'system' ? 'System' : (t === 'dark' ? 'Dark' : 'Light');
      const sv = b.querySelector('svg');
      if (sv) sv.outerHTML = ico;
    } else {
      b.innerHTML = `${ico}<span class="theme-lbl">${THEME_NAMES[mode] || THEME_NAMES.system}</span>`;
      b.title = 'Theme: ' + (THEME_NAMES[mode] || THEME_NAMES.system) + ' — tap to change';
    }
  });
}
function currentTheme() {
  try {
    const saved = localStorage.getItem('hl_theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
  } catch (e) {}
  return 'system'; // no choice made yet → follow the device's own setting
}
function toggleTheme() {
  const order = ['light', 'dark', 'system'];
  const next = order[(order.indexOf(currentTheme()) + 1) % order.length];
  applyTheme(next, true);
  toast('Theme: ' + THEME_NAMES[next]);
}

// ---------- admin notification badges ----------
// The API returns one tiny row: how many verifications / boosts / reports are waiting.
// renderAdminBadges() lights up every badge on the page — admin tabs, side-nav Admin
// link, profile row — so Isaac sees "something new" the moment it arrives.
function renderAdminBadges(c) {
  if (!c) return;
  const set = (key, n) => {
    document.querySelectorAll(`[data-adm-badge="${key}"]`).forEach(el => {
      if (n > 0) { el.textContent = n > 9 ? '9+' : n; el.hidden = false; }
      else el.hidden = true;
    });
  };
  const total = (c.verifications || 0) + (c.boosts || 0) + (c.reports || 0);
  set('verifications', c.verifications || 0);
  set('boosts', c.boosts || 0);
  set('reports', c.reports || 0);
  set('total', total);
}
async function refreshAdminCounts() {
  if (!state.user || state.user.role !== 'ADMIN') return;
  const r = await api('/admin/counts');
  if (r.ok) renderAdminBadges(r.counts || r);
}

// ---------- listing card ----------
// vacancy — the #1 thing renters scan for. Never hide it, never make it tiny:
//   0 vacant -> red ALL OCCUPIED badge + card photo dimmed
//   some vacant -> green badge with the exact count ("3 VACANT of 6" / "VACANT")
function vacInfo(l) {
  const u = Math.max(1, l.units || 1);
  const v = l.unitsVacant == null ? (l.status === 'TAKEN' ? 0 : u)
    : Math.max(0, Math.min(l.unitsVacant, u));
  const full = v <= 0 || l.status === 'TAKEN';
  return {
    u, v, full,
    label: full ? (u > 1 ? `All ${u} units occupied` : 'Occupied')
      : (u <= 1 ? 'Vacant now' : `${v} of ${u} units vacant`),
    badge: full
      ? `<span class="badge-vac full">${ic('x')} ALL OCCUPIED</span>`
      : (u <= 1
        ? `<span class="badge-vac open">${ic('check')} VACANT</span>`
        : `<span class="badge-vac open">${ic('check')} ${v} VACANT<span class="bv-of">of ${u}</span></span>`),
  };
}
function listingCard(l) {
  const boosted = l.boostedUntil && l.boostedUntil > Date.now();
  const verified = l.ownerVerified === 'APPROVED';
  const fl = flagOf(l.country);
  const locTxt = [esc(l.town), l.area ? esc(l.area) : '', l.country ? fl + ' ' + esc(l.country) : l.landmark ? esc(l.landmark) : ''].filter(Boolean).join(' · ');
  const dl = distLabel(l);
  const vac = vacInfo(l);
  return `<a class="card${vac.full ? ' occupied' : ''}" href="#/listing/${l.id}">
    <div class="cph">${l.thumb ? `<img loading="lazy" src="${l.thumb}" alt="${esc(l.title)}">` : `<div class="cph-empty">${ic('photo')}</div>`}
      <span class="wm"></span>
      ${boosted ? `<span class="badge-boost">${ic('bolt')}BOOSTED</span>` : ''}
      ${vac.badge}
    </div>
    <div class="cbody">
      <div class="cprice">${usd(l.rent)}<span>/${perShort(l.period)}</span></div>
      <div class="ctitle">${esc(l.title)}</div>
      <div class="cmeta">${ic('pin')}<span>${locTxt}</span></div>
      <div class="ctags">${amenityTags(l)}${dl ? `<span class="mini-tag" style="color:var(--pine-accent)">${ic('pin')} ${esc(dl)}</span>` : ''}</div>
      <div class="cfoot"><span>${verified ? `<span class="vbadge">${ic('shield')}Verified</span>` : ''}</span><span>${l.views || 0} views · ${timeAgo(l.createdAt)}</span></div>
    </div></a>`;
}
const skeletonGrid = n => `<div class="grid">${Array(n).fill('<div><div class="skel" style="aspect-ratio:4/3;border-radius:16px 16px 0 0"></div><div class="skel" style="height:110px;border-radius:0 0 16px 16px;margin-top:-1px"></div></div>').join('')}</div>`;
const emptyBox = (title, text) => `<div class="empty">${ic('pin')}<h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
