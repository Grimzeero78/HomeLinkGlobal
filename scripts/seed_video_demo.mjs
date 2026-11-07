#!/usr/bin/env node
// VIDEO-ONLY seed — inserts demo listings into the LOCAL wrangler D1
// (homelinkglobal-local via http://127.0.0.1:8794). NEVER run against live.
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:8794/api';
const PH = JSON.parse(fs.readFileSync('/tmp/video_photos.json', 'utf8'));
const PW = 'HuntGlobal7Kx'; // strong: upper+lower+digit, 12 chars

const landlords = [
  { username: 'videodemo_amina', name: 'Amina W.', phone: '+254712000001', role: 'LANDLORD' },
  { username: 'videodemo_jake', name: 'Jake M.', phone: '+15120000002', role: 'LANDLORD' },
  { username: 'videodemo_priya', name: 'Priya S.', phone: '+919800000003', role: 'LANDLORD' },
  { username: 'videodemo_omar', name: 'Omar K.', phone: '+971500000004', role: 'LANDLORD' },
];

const listings = [
  // [landlordIdx, payload]
  [0, {
    title: 'Sunny 2 Bedroom in Kilimani', ptype: '2 Bedroom', units: 4, unitsVacant: 2,
    furnishing: 'Semi-furnished', floor: '3', town: 'Nairobi', country: 'Kenya', area: 'Kilimani',
    landmark: 'Near Yaya Centre', period: 'Per Month', rent: 45000, deposit: 45000,
    water: 'Yes', elec: 'Tokens', bath: 'Own', kitchen: 'Yes', parking: 'Yes', ensuite: 'Yes',
    contactPhone: '+254712000001', lat: -1.2921, lng: 36.7830, terms: 'Rent payable monthly in advance. Water included. viewing any day 9am-6pm.',
    photos: ['l1_p1', 'l1_p2', 'l1_p3'],
  }],
  [1, {
    title: 'Downtown Studio near Zilker Park', ptype: 'Studio', units: 6, unitsVacant: 1,
    furnishing: 'Furnished', floor: '12', town: 'Austin', country: 'United States', area: 'South Congress',
    landmark: '5 min walk to the park', period: 'Per Month', rent: 1450, deposit: 1450,
    water: 'Yes', elec: 'Included', bath: 'Own', kitchen: 'Yes', parking: 'Yes',
    contactPhone: '+15120000002', lat: 30.2489, lng: -97.7600, terms: '12-month lease available. Pets welcome. Gym in building.',
    photos: ['l2_p1', 'l2_p2', 'l2_p3'],
  }],
  [2, {
    title: 'Sea-view 2BHK in Bandra West', ptype: '2 Bedroom', units: 1, unitsVacant: 1,
    furnishing: 'Furnished', floor: '14', town: 'Mumbai', country: 'India', area: 'Bandra West',
    landmark: 'Off Carter Road', period: 'Per Month', rent: 68000, deposit: 136000,
    water: 'Yes', elec: 'MSEB', bath: 'Own', kitchen: 'Yes', backup: 'Yes',
    contactPhone: '+919800000003', lat: 19.0596, lng: 72.8295, terms: 'Society charges included. 2 months deposit. Family preferred.',
    photos: ['l3_p1', 'l3_p2', 'l3_p3'],
  }],
  [0, {
    title: 'Family Home with Garden in Ntinda', ptype: 'House', units: 1, unitsVacant: 1,
    furnishing: 'Unfurnished', floor: 'Ground', town: 'Kampala', country: 'Uganda', area: 'Ntinda',
    landmark: 'Off Stretcher Road', period: 'Per Month', rent: 1800000, deposit: 1800000,
    water: 'Tank', elec: 'UME', bath: 'Own', kitchen: 'Yes', parking: 'Yes', pets: 'Yes',
    contactPhone: '+254712000001', lat: 0.3524, lng: 32.6168, terms: 'Wall fence, private compound. Water tank installed.',
    photos: ['l4_p1', 'l4_p2', 'l4_p3'],
  }],
  [1, {
    title: 'Bright 1 Bed in Shoreditch', ptype: '1 Bedroom', units: 3, unitsVacant: 1,
    furnishing: 'Furnished', floor: '5', town: 'London', country: 'United Kingdom', area: 'Shoreditch',
    landmark: 'Near Old Street station', period: 'Per Month', rent: 1900, deposit: 1900,
    water: 'Included', elec: 'Prepaid', bath: 'Own', kitchen: 'Yes', wifi: 'Yes',
    contactPhone: '+15120000002', lat: 51.5257, lng: -0.0850, terms: 'Available now. Council tax separate. No agency fees.',
    photos: ['l5_p1', 'l5_p2', 'l5_p3'],
  }],
  [3, {
    title: 'Marina View Studio, Dubai', ptype: 'Studio', units: 8, unitsVacant: 3,
    furnishing: 'Furnished', floor: '31', town: 'Dubai', country: 'United Arab Emirates', area: 'Dubai Marina',
    landmark: '2 min to Marina Walk', period: 'Per Month', rent: 4200, deposit: 4200,
    water: 'Included', elec: 'DEWA', bath: 'Own', kitchen: 'Yes', parking: 'Yes', backup: 'Yes',
    contactPhone: '+971500000004', lat: 25.0800, lng: 55.1403, terms: 'Chiller free. Gym + pool access. DEWA and internet separate.',
    photos: ['l6_p1', 'l6_p2', 'l6_p3'],
  }],
  [2, {
    title: 'Self-contained in Lekki Phase 1', ptype: 'Apartment', units: 4, unitsVacant: 2,
    furnishing: 'Semi-furnished', floor: '2', town: 'Lagos', country: 'Nigeria', area: 'Lekki Phase 1',
    landmark: 'Off Admiralty Way', period: 'Per Year', rent: 350000, deposit: 350000,
    water: 'Borehole', elec: ' prepaid meter', bath: 'Own', kitchen: 'Yes', backup: 'Yes',
    contactPhone: '+919800000003', lat: 6.4408, lng: 3.4712, terms: '1 year rent plus agency and caution fees. 24hr power backup.',
    photos: ['l7_p1', 'l7_p2', 'l7_p3'],
  }],
  [3, {
    title: 'Altbau 2-Zi in Prenzlauer Berg', ptype: '2 Bedroom', units: 2, unitsVacant: 1,
    furnishing: 'Unfurnished', floor: '4', town: 'Berlin', country: 'Germany', area: 'Prenzlauer Berg',
    landmark: 'Near Mauerpark', period: 'Per Month', rent: 1150, deposit: 2300,
    water: 'Included', elec: 'Stromtag', bath: 'Own', kitchen: 'Yes', balcony: 'Yes',
    contactPhone: '+971500000004', lat: 52.5411, lng: 13.4128, terms: 'Kaltmiete. High ceilings, wooden floors. Available 1st.',
    photos: ['l8_p1', 'l8_p2', 'l8_p3'],
  }],
];

const j = async (r) => { const x = await r.json(); if (!r.ok || x.ok === false) throw new Error(r.status + ' ' + JSON.stringify(x)); return x; };

const tokens = [];
for (const u of landlords) {
  const reg = await j(await fetch(`${BASE}/register`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...u, password: PW, confirm: PW, hint: 'video demo account' }),
  }));
  tokens.push(reg.token);
  console.log('registered', u.username);
}

const ids = [];
for (const [li, L] of listings) {
  const body = { ...L, photos: L.photos.map(k => PH[k]) };
  const r = await j(await fetch(`${BASE}/listings`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tokens[li] },
    body: JSON.stringify(body),
  }));
  ids.push(r.id || r.listingId || r.listing?.id);
  console.log('listing created:', L.title, '→', JSON.stringify(r).slice(0, 90));
}

// boost the Nairobi + Mumbai ones (free launch boost)
for (const i of [0, 2]) {
  await j(await fetch(`${BASE}/listings/${ids[i]}/boost`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tokens[listings[i][0]] },
    body: '{}',
  }));
  console.log('boosted', ids[i]);
}
fs.writeFileSync('/tmp/video_ids.json', JSON.stringify(ids));
console.log('SEED_OK ids=' + ids.join(','));
