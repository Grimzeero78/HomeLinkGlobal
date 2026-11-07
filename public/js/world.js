// HuntIn — WORLD data: every country on Earth, its flag, its LOCAL currency and
// its most-spoken language. One table powers the country pickers, the per-country
// currency display (₹ in India, KSh in Kenya, £ in the UK…), the language the app
// opens in, and the mapping from the visitor's Cloudflare country code (state.cc)
// to everything above. A house in India shows ₹ to everybody — never USD.
// Format: [name, ISO2, flag, currencyCode, currencySymbol, defaultLang]
'use strict';
const WORLD = [
  // ---- Africa ----
  ['Algeria','DZ','🇩🇿','DZD','DA','ar'], ['Angola','AO','🇦🇴','AOA','Kz','pt'], ['Benin','BJ','🇧🇯','XOF','CFA','fr'],
  ['Botswana','BW','🇧🇼','BWP','P','en'], ['Burkina Faso','BF','🇧🇫','XOF','CFA','fr'], ['Burundi','BI','🇧🇮','BIF','FBu','fr'],
  ['Cabo Verde','CV','🇨🇻','CVE','$','pt'], ['Cameroon','CM','🇨🇲','XAF','FCFA','fr'], ['Central African Republic','CF','🇨🇫','XAF','FCFA','fr'],
  ['Chad','TD','🇹🇩','XAF','FCFA','fr'], ['Comoros','KM','🇰🇲','KMF','CF','fr'], ['Congo (DRC)','CD','🇨🇩','CDF','FC','fr'],
  ['Congo (Republic)','CG','🇨🇬','XAF','FCFA','fr'], ['Djibouti','DJ','🇩🇯','DJF','Fdj','fr'], ['Egypt','EG','🇪🇬','EGP','EGP','ar'],
  ['Equatorial Guinea','GQ','🇬🇶','XAF','FCFA','es'], ['Eritrea','ER','🇪🇷','ERN','Nfk','en'], ['Eswatini','SZ','🇸🇿','SZL','E','en'],
  ['Ethiopia','ET','🇪🇹','ETB','Br','en'], ['Gabon','GA','🇬🇦','XAF','FCFA','fr'], ['Gambia','GM','🇬🇲','GMD','D','en'],
  ['Ghana','GH','🇬🇭','GHS','GH₵','en'], ['Guinea','GN','🇬🇳','GNF','FG','fr'], ['Guinea-Bissau','GW','🇬🇼','XOF','CFA','pt'],
  ['Ivory Coast','CI','🇨🇮','XOF','CFA','fr'], ['Kenya','KE','🇰🇪','KES','KSh','sw'], ['Lesotho','LS','🇱🇸','LSL','L','en'],
  ['Liberia','LR','🇱🇷','LRD','$','en'], ['Libya','LY','🇱🇾','LYD','LYD','ar'], ['Madagascar','MG','🇲🇬','MGA','Ar','fr'],
  ['Malawi','MW','🇲🇼','MWK','MK','en'], ['Mali','ML','🇲🇱','XOF','CFA','fr'], ['Mauritania','MR','🇲🇷','MRU','UM','ar'],
  ['Mauritius','MU','🇲🇺','MUR','Rs','en'], ['Morocco','MA','🇲🇦','MAD','DH','ar'], ['Mozambique','MZ','🇲🇿','MZN','MT','pt'],
  ['Namibia','NA','🇳🇦','NAD','$','en'], ['Niger','NE','🇳🇪','XOF','CFA','fr'], ['Nigeria','NG','🇳🇬','NGN','₦','en'],
  ['Rwanda','RW','🇷🇼','RWF','FRw','en'], ['Sao Tome & Principe','ST','🇸🇹','STN','Db','pt'], ['Senegal','SN','🇸🇳','XOF','CFA','fr'],
  ['Seychelles','SC','🇸🇨','SCR','Rs','en'], ['Sierra Leone','SL','🇸🇱','SLE','Le','en'], ['Somalia','SO','🇸🇴','SOS','Sh','en'],
  ['South Africa','ZA','🇿🇦','ZAR','R','en'], ['South Sudan','SS','🇸🇸','SSP','£','en'], ['Sudan','SD','🇸🇩','SDG','SDG','ar'],
  ['Tanzania','TZ','🇹🇿','TZS','TSh','sw'], ['Togo','TG','🇹🇬','XOF','CFA','fr'], ['Tunisia','TN','🇹🇳','TND','DT','ar'],
  ['Uganda','UG','🇺🇬','UGX','USh','en'], ['Zambia','ZM','🇿🇲','ZMW','K','en'], ['Zimbabwe','ZW','🇿🇼','USD','Z$','en'],
  // ---- Middle East & Central Asia ----
  ['Afghanistan','AF','🇦🇫','AFN','Af','fa'], ['Armenia','AM','🇦🇲','AMD','֏','en'], ['Azerbaijan','AZ','🇦🇿','AZN','₼','en'],
  ['Bahrain','BH','🇧🇭','BHD','BD','ar'], ['Georgia','GE','🇬🇪','GEL','₾','en'], ['Iran','IR','🇮🇷','IRR','IRR','fa'],
  ['Iraq','IQ','🇮🇶','IQD','IQD','ar'], ['Israel','IL','🇮🇱','ILS','₪','en'], ['Jordan','JO','🇯🇴','JOD','JD','ar'],
  ['Kazakhstan','KZ','🇰🇿','KZT','₸','en'], ['Kuwait','KW','🇰🇼','KWD','KD','ar'], ['Kyrgyzstan','KG','🇰🇬','KGS','⃀','en'],
  ['Lebanon','LB','🇱🇧','LBP','L£','ar'], ['Oman','OM','🇴🇲','OMR','RO','ar'], ['Palestine','PS','🇵🇸','ILS','₪','ar'],
  ['Qatar','QA','🇶🇦','QAR','QR','ar'], ['Saudi Arabia','SA','🇸🇦','SAR','SAR','ar'], ['Syria','SY','🇸🇾','SYP','£S','ar'],
  ['Tajikistan','TJ','🇹🇯','TJS','SM','en'], ['Turkey','TR','🇹🇷','TRY','₺','tr'], ['Turkmenistan','TM','🇹🇲','TMT','m','en'],
  ['United Arab Emirates','AE','🇦🇪','AED','AED','ar'], ['Uzbekistan','UZ','🇺🇿','UZS',"so'm",'en'], ['Yemen','YE','🇾🇪','YER','﷼','ar'],
  // ---- Europe ----
  ['Albania','AL','🇦🇱','ALL','L','en'], ['Andorra','AD','🇦🇩','EUR','€','es'], ['Austria','AT','🇦🇹','EUR','€','de'],
  ['Belarus','BY','🇧🇾','BYN','Br','en'], ['Belgium','BE','🇧🇪','EUR','€','nl'], ['Bosnia & Herzegovina','BA','🇧🇦','BAM','KM','en'],
  ['Bulgaria','BG','🇧🇬','BGN','лв','en'], ['Croatia','HR','🇭🇷','EUR','€','en'], ['Cyprus','CY','🇨🇾','EUR','€','en'],
  ['Czechia','CZ','🇨🇿','CZK','Kč','en'], ['Denmark','DK','🇩🇰','DKK','kr','en'], ['Estonia','EE','🇪🇪','EUR','€','en'],
  ['Finland','FI','🇫🇮','EUR','€','en'], ['France','FR','🇫🇷','EUR','€','fr'], ['Germany','DE','🇩🇪','EUR','€','de'],
  ['Greece','GR','🇬🇷','EUR','€','en'], ['Hungary','HU','🇭🇺','HUF','Ft','en'], ['Iceland','IS','🇮🇸','ISK','kr','en'],
  ['Ireland','IE','🇮🇪','EUR','€','en'], ['Italy','IT','🇮🇹','EUR','€','it'], ['Kosovo','XK','🇽🇰','EUR','€','en'],
  ['Latvia','LV','🇱🇻','EUR','€','en'], ['Liechtenstein','LI','🇱🇮','CHF','CHF','de'], ['Lithuania','LT','🇱🇹','EUR','€','en'],
  ['Luxembourg','LU','🇱🇺','EUR','€','fr'], ['Malta','MT','🇲🇹','EUR','€','en'], ['Moldova','MD','🇲🇩','MDL','L','en'],
  ['Monaco','MC','🇲🇨','EUR','€','fr'], ['Montenegro','ME','🇲🇪','EUR','€','en'], ['Netherlands','NL','🇳🇱','EUR','€','nl'],
  ['North Macedonia','MK','🇲🇰','MKD','ден','en'], ['Norway','NO','🇳🇴','NOK','kr','en'], ['Poland','PL','🇵🇱','PLN','zł','pl'],
  ['Portugal','PT','🇵🇹','EUR','€','pt'], ['Romania','RO','🇷🇴','RON','lei','en'], ['Russia','RU','🇷🇺','RUB','₽','ru'],
  ['San Marino','SM','🇸🇲','EUR','€','it'], ['Serbia','RS','🇷🇸','RSD','дин','en'], ['Slovakia','SK','🇸🇰','EUR','€','en'],
  ['Slovenia','SI','🇸🇮','EUR','€','en'], ['Spain','ES','🇪🇸','EUR','€','es'], ['Sweden','SE','🇸🇪','SEK','kr','en'],
  ['Switzerland','CH','🇨🇭','CHF','CHF','de'], ['Ukraine','UA','🇺🇦','UAH','₴','en'], ['United Kingdom','GB','🇬🇧','GBP','£','en'],
  ['Vatican City','VA','🇻🇦','EUR','€','it'],
  // ---- Americas ----
  ['Antigua & Barbuda','AG','🇦🇬','XCD','$','en'], ['Argentina','AR','🇦🇷','ARS','$','es'], ['Bahamas','BS','🇧🇸','BSD','B$','en'],
  ['Barbados','BB','🇧🇧','BBD','Bds$','en'], ['Belize','BZ','🇧🇿','BZD','BZ$','en'], ['Bolivia','BO','🇧🇴','BOB','Bs','es'],
  ['Brazil','BR','🇧🇷','BRL','R$','pt'], ['Canada','CA','🇨🇦','CAD','C$','en'], ['Chile','CL','🇨🇱','CLP','$','es'],
  ['Colombia','CO','🇨🇴','COP','$','es'], ['Costa Rica','CR','🇨🇷','CRC','₡','es'], ['Cuba','CU','🇨🇺','CUP','$','es'],
  ['Dominica','DM','🇩🇲','XCD','$','en'], ['Dominican Republic','DO','🇩🇴','DOP','RD$','es'], ['Ecuador','EC','🇪🇨','USD','$','es'],
  ['El Salvador','SV','🇸🇻','USD','$','es'], ['Grenada','GD','🇬🇩','XCD','$','en'], ['Guatemala','GT','🇬🇹','GTQ','Q','es'],
  ['Guyana','GY','🇬🇾','GYD','G$','en'], ['Haiti','HT','🇭🇹','HTG','G','fr'], ['Honduras','HN','🇭🇳','HNL','L','es'],
  ['Jamaica','JM','🇯🇲','JMD','J$','en'], ['Mexico','MX','🇲🇽','MXN','$','es'], ['Nicaragua','NI','🇳🇮','NIO','C$','es'],
  ['Panama','PA','🇵🇦','PAB','B/.','es'], ['Paraguay','PY','🇵🇾','PYG','₲','es'], ['Peru','PE','🇵🇪','PEN','S/','es'],
  ['Saint Kitts & Nevis','KN','🇰🇳','XCD','$','en'], ['Saint Lucia','LC','🇱🇨','XCD','$','en'], ['Saint Vincent','VC','🇻🇨','XCD','$','en'],
  ['Suriname','SR','🇸🇷','SRD','$','nl'], ['Trinidad & Tobago','TT','🇹🇹','TTD','TT$','en'], ['United States','US','🇺🇸','USD','$','en'],
  ['Uruguay','UY','🇺🇾','UYU','$U','es'], ['Venezuela','VE','🇻🇪','VES','Bs','es'],
  // ---- South & East Asia ----
  ['Bangladesh','BD','🇧🇩','BDT','৳','bn'], ['Bhutan','BT','🇧🇹','BTN','Nu.','en'], ['Brunei','BN','🇧🇳','BND','B$','en'],
  ['Cambodia','KH','🇰🇭','KHR','៛','en'], ['China','CN','🇨🇳','CNY','¥','zh'], ['Hong Kong','HK','🇭🇰','HKD','HK$','zh'],
  ['India','IN','🇮🇳','INR','₹','hi'], ['Indonesia','ID','🇮🇩','IDR','Rp','id'], ['Japan','JP','🇯🇵','JPY','¥','ja'],
  ['Laos','LA','🇱🇦','LAK','₭','en'], ['Macao','MO','🇲🇴','MOP','MOP$','zh'], ['Malaysia','MY','🇲🇾','MYR','RM','en'],
  ['Maldives','MV','🇲🇻','MVR','Rf','en'], ['Mongolia','MN','🇲🇳','MNT','₮','en'], ['Myanmar','MM','🇲🇲','MMK','K','en'],
  ['Nepal','NP','🇳🇵','NPR','Rs','en'], ['North Korea','KP','🇰🇵','KPW','₩','ko'], ['Pakistan','PK','🇵🇰','PKR','Rs','ur'],
  ['Philippines','PH','🇵🇭','PHP','₱','fil'], ['Singapore','SG','🇸🇬','SGD','S$','en'], ['South Korea','KR','🇰🇷','KRW','₩','ko'],
  ['Sri Lanka','LK','🇱🇰','LKR','Rs','en'], ['Taiwan','TW','🇹🇼','TWD','NT$','zh'], ['Thailand','TH','🇹🇭','THB','฿','en'],
  ['Vietnam','VN','🇻🇳','VND','₫','vi'],
  // ---- Oceania ----
  ['Australia','AU','🇦🇺','AUD','A$','en'], ['Fiji','FJ','🇫🇯','FJD','FJ$','en'], ['New Zealand','NZ','🇳🇿','NZD','NZ$','en'],
  ['Papua New Guinea','PG','🇵🇬','PGK','K','en'], ['Samoa','WS','🇼🇸','WST','T','en'], ['Solomon Islands','SB','🇸🇧','SBD','SI$','en'],
  ['Tonga','TO','🇹🇴','TOP','T$','en'], ['Vanuatu','VU','🇻🇺','VUV','VT','en'],
];
// hero chips on the home page (the rest are all in the country pickers)
const FEAT_CC = ['KE','UG','NG','GH','ZA','GB','DE','US','CA','AE','IN','BR'];
// CC → listing-country name (Cloudflare gives ISO-2; listings store full names).
// Extra territories/micro-states Cloudflare may report that are not rows above.
const CC_EXTRA = { PR:['Puerto Rico','es'], GI:['Gibraltar','en'], IM:['Isle of Man','en'], JE:['Jersey','en'],
  GG:['Guernsey','en'], FO:['Faroe Islands','en'], GL:['Greenland','en'], BM:['Bermuda','en'], KY:['Cayman Islands','en'],
  RE:['Réunion','fr'], YT:['Mayotte','fr'], GP:['Guadeloupe','fr'], MQ:['Martinique','fr'], GF:['French Guiana','fr'],
  NC:['New Caledonia','fr'], PF:['French Polynesia','fr'], AW:['Aruba','nl'], CW:['Curaçao','nl'], SX:['Sint Maarten','en'] };

const CBYCC = {};   // 'KE' -> 'Kenya'
const CCBYN = {};   // 'Kenya' -> row
for (const [n, cc, f, code, sym, lg] of WORLD) { CBYCC[cc] = n; CCBYN[n] = { n, cc, f, code, sym, lg, feat: FEAT_CC.includes(cc) }; }
// country name for a Cloudflare CC — with graceful fallback to the raw code
function countryOfCc(cc) {
  if (!cc) return '';
  if (CBYCC[cc]) return CBYCC[cc];
  if (CC_EXTRA[cc]) return CC_EXTRA[cc][0];
  return '';
}
function defaultLangOfCc(cc) {
  if (!cc) return 'en';
  if (CCBYN[CBYCC[cc]]) return CCBYN[CBYCC[cc]].lg;
  if (CC_EXTRA[cc]) return CC_EXTRA[cc][1];
  return 'en';
}
// ---- local currency formatting: cur(12000, 'India') -> "₹12,000" ----
function curSym(country) { const r = CCBYN[country]; return r ? r.sym : ''; }
function curCode(country) { const r = CCBYN[country]; return r ? r.code : ''; }
function cur(n, country) {
  const num = Number(n || 0).toLocaleString('en-US');
  const s = curSym(country);
  if (s) return s + num;
  return '$' + num; // unknown country — neutral fallback
}
// ---- floors: the whole planet uses this — Mumbai towers have 40+ floors ----
// stored as text; numeric values render "14 floor" style, legacy labels pass through.
function floorLabel(f) {
  const s = String(f == null ? '' : f).trim();
  if (!s) return '';
  if (/^-?\d+$/.test(s)) {
    const n = parseInt(s, 10);
    if (n === 0) return 'Ground floor';
    if (n === -1) return 'Basement';
    if (n === -2) return 'Basement 2';
    return n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th') + ' floor';
  }
  return s; // legacy values like 'Ground', '3rd'
}
// ---- major world cities (datalist autocomplete + map fallback centres).
// big:1 = major metro used as the map's first centre. Every listing's exact spot
// always comes from the landlord's own map pin, so these are city-centre helpers.
const CITIES = [
  // Africa
  { n: 'Nairobi', c: 'Kenya', lat: -1.2864, lng: 36.8172, big: 1 },
  { n: 'Mombasa', c: 'Kenya', lat: -4.0435, lng: 39.6682 },
  { n: 'Kisumu', c: 'Kenya', lat: -0.0917, lng: 34.7680 },
  { n: 'Nakuru', c: 'Kenya', lat: -0.3031, lng: 36.0800 },
  { n: 'Kampala', c: 'Uganda', lat: 0.3476, lng: 32.5825 },
  { n: 'Dar es Salaam', c: 'Tanzania', lat: -6.7924, lng: 39.2083 },
  { n: 'Dodoma', c: 'Tanzania', lat: -6.1630, lng: 35.7516 },
  { n: 'Kigali', c: 'Rwanda', lat: -1.9441, lng: 30.0619 },
  { n: 'Addis Ababa', c: 'Ethiopia', lat: 9.0192, lng: 38.7525 },
  { n: 'Lagos', c: 'Nigeria', lat: 6.5244, lng: 3.3792, big: 1 },
  { n: 'Abuja', c: 'Nigeria', lat: 9.0765, lng: 7.3986 },
  { n: 'Port Harcourt', c: 'Nigeria', lat: 4.8156, lng: 7.0498 },
  { n: 'Kano', c: 'Nigeria', lat: 12.0022, lng: 8.5920 },
  { n: 'Accra', c: 'Ghana', lat: 5.6037, lng: -0.1870 },
  { n: 'Kumasi', c: 'Ghana', lat: 6.6885, lng: -1.6244 },
  { n: 'Dakar', c: 'Senegal', lat: 14.7167, lng: -17.4677 },
  { n: 'Abidjan', c: 'Ivory Coast', lat: 5.3600, lng: -4.0083 },
  { n: 'Kinshasa', c: 'Congo (DRC)', lat: -4.4419, lng: 15.2663 },
  { n: 'Luanda', c: 'Angola', lat: -8.8390, lng: 13.2894 },
  { n: 'Khartoum', c: 'Sudan', lat: 15.5007, lng: 32.5599 },
  { n: 'Johannesburg', c: 'South Africa', lat: -26.2041, lng: 28.0473 },
  { n: 'Cape Town', c: 'South Africa', lat: -33.9249, lng: 18.4241, big: 1 },
  { n: 'Durban', c: 'South Africa', lat: -29.8587, lng: 31.0218 },
  { n: 'Pretoria', c: 'South Africa', lat: -25.7479, lng: 28.2293 },
  { n: 'Harare', c: 'Zimbabwe', lat: -17.8252, lng: 31.0335 },
  { n: 'Lusaka', c: 'Zambia', lat: -15.3875, lng: 28.3228 },
  { n: 'Maputo', c: 'Mozambique', lat: -25.9692, lng: 32.5732 },
  { n: 'Cairo', c: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { n: 'Alexandria', c: 'Egypt', lat: 31.2001, lng: 29.9187 },
  { n: 'Casablanca', c: 'Morocco', lat: 33.5731, lng: -7.5898 },
  { n: 'Marrakesh', c: 'Morocco', lat: 31.6295, lng: -7.9811 },
  { n: 'Algiers', c: 'Algeria', lat: 36.7538, lng: 3.0588 },
  { n: 'Tunis', c: 'Tunisia', lat: 36.8065, lng: 10.1815 },
  { n: 'Antananarivo', c: 'Madagascar', lat: -18.8792, lng: 47.5079 },
  { n: 'Port Louis', c: 'Mauritius', lat: -20.1609, lng: 57.5012 },
  // Europe
  { n: 'London', c: 'United Kingdom', lat: 51.5074, lng: -0.1278, big: 1 },
  { n: 'Manchester', c: 'United Kingdom', lat: 53.4808, lng: -2.2426 },
  { n: 'Birmingham', c: 'United Kingdom', lat: 52.4862, lng: -1.8904 },
  { n: 'Leeds', c: 'United Kingdom', lat: 53.8008, lng: -1.5491 },
  { n: 'Glasgow', c: 'United Kingdom', lat: 55.8642, lng: -4.2518 },
  { n: 'Dublin', c: 'Ireland', lat: 53.3498, lng: -6.2603 },
  { n: 'Paris', c: 'France', lat: 48.8566, lng: 2.3522, big: 1 },
  { n: 'Lyon', c: 'France', lat: 45.7640, lng: 4.8357 },
  { n: 'Marseille', c: 'France', lat: 43.2965, lng: 5.3698 },
  { n: 'Berlin', c: 'Germany', lat: 52.5200, lng: 13.4050 },
  { n: 'Munich', c: 'Germany', lat: 48.1351, lng: 11.5820 },
  { n: 'Hamburg', c: 'Germany', lat: 53.5511, lng: 9.9937 },
  { n: 'Frankfurt', c: 'Germany', lat: 50.1109, lng: 8.6821 },
  { n: 'Madrid', c: 'Spain', lat: 40.4168, lng: -3.7038 },
  { n: 'Barcelona', c: 'Spain', lat: 41.3874, lng: 2.1686 },
  { n: 'Valencia', c: 'Spain', lat: 39.4699, lng: -0.3763 },
  { n: 'Rome', c: 'Italy', lat: 41.9028, lng: 12.4964 },
  { n: 'Milan', c: 'Italy', lat: 45.4642, lng: 9.1900 },
  { n: 'Amsterdam', c: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { n: 'Rotterdam', c: 'Netherlands', lat: 51.9244, lng: 4.4777 },
  { n: 'Brussels', c: 'Belgium', lat: 50.8503, lng: 4.3517 },
  { n: 'Lisbon', c: 'Portugal', lat: 38.7223, lng: -9.1393 },
  { n: 'Porto', c: 'Portugal', lat: 41.1579, lng: -8.6291 },
  { n: 'Warsaw', c: 'Poland', lat: 52.2297, lng: 21.0122 },
  { n: 'Krakow', c: 'Poland', lat: 50.0647, lng: 19.9450 },
  { n: 'Vienna', c: 'Austria', lat: 48.2082, lng: 16.3738 },
  { n: 'Prague', c: 'Czechia', lat: 50.0755, lng: 14.4378 },
  { n: 'Budapest', c: 'Hungary', lat: 47.4979, lng: 19.0402 },
  { n: 'Bucharest', c: 'Romania', lat: 44.4268, lng: 26.1025 },
  { n: 'Athens', c: 'Greece', lat: 37.9838, lng: 23.7275 },
  { n: 'Istanbul', c: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { n: 'Ankara', c: 'Turkey', lat: 39.9334, lng: 32.8597 },
  { n: 'Kyiv', c: 'Ukraine', lat: 50.4501, lng: 30.5234 },
  { n: 'Moscow', c: 'Russia', lat: 55.7558, lng: 37.6173 },
  { n: 'Saint Petersburg', c: 'Russia', lat: 59.9311, lng: 30.3609 },
  { n: 'Stockholm', c: 'Sweden', lat: 59.3293, lng: 18.0686 },
  { n: 'Oslo', c: 'Norway', lat: 59.9139, lng: 10.7522 },
  { n: 'Copenhagen', c: 'Denmark', lat: 55.6761, lng: 12.5683 },
  { n: 'Helsinki', c: 'Finland', lat: 60.1699, lng: 24.9384 },
  { n: 'Zurich', c: 'Switzerland', lat: 47.3769, lng: 8.5417 },
  { n: 'Geneva', c: 'Switzerland', lat: 46.2044, lng: 6.1432 },
  // Americas
  { n: 'New York', c: 'United States', lat: 40.7128, lng: -74.0060, big: 1 },
  { n: 'Los Angeles', c: 'United States', lat: 34.0522, lng: -118.2437 },
  { n: 'Chicago', c: 'United States', lat: 41.8781, lng: -87.6298 },
  { n: 'Houston', c: 'United States', lat: 29.7604, lng: -95.3698 },
  { n: 'Miami', c: 'United States', lat: 25.7617, lng: -80.1918 },
  { n: 'San Francisco', c: 'United States', lat: 37.7749, lng: -122.4194 },
  { n: 'Boston', c: 'United States', lat: 42.3601, lng: -71.0589 },
  { n: 'Seattle', c: 'United States', lat: 47.6062, lng: -122.3321 },
  { n: 'Atlanta', c: 'United States', lat: 33.7490, lng: -84.3880 },
  { n: 'Dallas', c: 'United States', lat: 32.7767, lng: -96.7970 },
  { n: 'Toronto', c: 'Canada', lat: 43.6532, lng: -79.3832, big: 1 },
  { n: 'Vancouver', c: 'Canada', lat: 49.2827, lng: -123.1207 },
  { n: 'Montreal', c: 'Canada', lat: 45.5019, lng: -73.5674 },
  { n: 'Calgary', c: 'Canada', lat: 51.0447, lng: -114.0719 },
  { n: 'Mexico City', c: 'Mexico', lat: 19.4326, lng: -99.1332 },
  { n: 'Guadalajara', c: 'Mexico', lat: 20.6597, lng: -103.3496 },
  { n: 'Monterrey', c: 'Mexico', lat: 25.6866, lng: -100.3161 },
  { n: 'Sao Paulo', c: 'Brazil', lat: -23.5505, lng: -46.6333, big: 1 },
  { n: 'Rio de Janeiro', c: 'Brazil', lat: -22.9068, lng: -43.1729 },
  { n: 'Brasilia', c: 'Brazil', lat: -15.7939, lng: -47.8828 },
  { n: 'Buenos Aires', c: 'Argentina', lat: -34.6037, lng: -58.3816 },
  { n: 'Bogota', c: 'Colombia', lat: 4.7110, lng: -74.0721 },
  { n: 'Medellin', c: 'Colombia', lat: 6.2442, lng: -75.5812 },
  { n: 'Lima', c: 'Peru', lat: -12.0464, lng: -77.0428 },
  { n: 'Santiago', c: 'Chile', lat: -33.4489, lng: -70.6693 },
  { n: 'Quito', c: 'Ecuador', lat: -0.1807, lng: -78.4678 },
  { n: 'Caracas', c: 'Venezuela', lat: 10.4806, lng: -66.9036 },
  { n: 'Montevideo', c: 'Uruguay', lat: -34.9011, lng: -56.1645 },
  { n: 'Panama City', c: 'Panama', lat: 8.9824, lng: -79.5199 },
  { n: 'San Jose', c: 'Costa Rica', lat: 9.9281, lng: -84.0907 },
  { n: 'Havana', c: 'Cuba', lat: 23.1136, lng: -82.3666 },
  { n: 'Santo Domingo', c: 'Dominican Republic', lat: 18.4861, lng: -69.9312 },
  { n: 'Kingston', c: 'Jamaica', lat: 17.9712, lng: -76.7936 },
  // Middle East
  { n: 'Dubai', c: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, big: 1 },
  { n: 'Abu Dhabi', c: 'United Arab Emirates', lat: 24.4539, lng: 54.3773 },
  { n: 'Sharjah', c: 'United Arab Emirates', lat: 25.3463, lng: 55.4209 },
  { n: 'Doha', c: 'Qatar', lat: 25.2854, lng: 51.5310 },
  { n: 'Riyadh', c: 'Saudi Arabia', lat: 24.7136, lng: 46.6753 },
  { n: 'Jeddah', c: 'Saudi Arabia', lat: 21.4858, lng: 39.1925 },
  { n: 'Kuwait City', c: 'Kuwait', lat: 29.3759, lng: 47.9774 },
  { n: 'Manama', c: 'Bahrain', lat: 26.2285, lng: 50.5860 },
  { n: 'Muscat', c: 'Oman', lat: 23.5880, lng: 58.3829 },
  { n: 'Amman', c: 'Jordan', lat: 31.9454, lng: 35.9284 },
  { n: 'Beirut', c: 'Lebanon', lat: 33.8938, lng: 35.5018 },
  { n: 'Baghdad', c: 'Iraq', lat: 33.3152, lng: 44.3661 },
  { n: 'Tehran', c: 'Iran', lat: 35.6892, lng: 51.3890 },
  { n: 'Tel Aviv', c: 'Israel', lat: 32.0853, lng: 34.7818 },
  // South & East Asia
  { n: 'Mumbai', c: 'India', lat: 19.0760, lng: 72.8777, big: 1 },
  { n: 'Delhi', c: 'India', lat: 28.6139, lng: 77.2090 },
  { n: 'Bengaluru', c: 'India', lat: 12.9716, lng: 77.5946 },
  { n: 'Hyderabad', c: 'India', lat: 17.3850, lng: 78.4867 },
  { n: 'Chennai', c: 'India', lat: 13.0827, lng: 80.2707 },
  { n: 'Kolkata', c: 'India', lat: 22.5726, lng: 88.3639 },
  { n: 'Pune', c: 'India', lat: 18.5204, lng: 73.8567 },
  { n: 'Ahmedabad', c: 'India', lat: 23.0225, lng: 72.5714 },
  { n: 'Karachi', c: 'Pakistan', lat: 24.8607, lng: 67.0011 },
  { n: 'Lahore', c: 'Pakistan', lat: 31.5204, lng: 74.3587 },
  { n: 'Islamabad', c: 'Pakistan', lat: 33.6844, lng: 73.0479 },
  { n: 'Dhaka', c: 'Bangladesh', lat: 23.8103, lng: 90.4125 },
  { n: 'Chattogram', c: 'Bangladesh', lat: 22.3569, lng: 91.7832 },
  { n: 'Colombo', c: 'Sri Lanka', lat: 6.9271, lng: 79.8612 },
  { n: 'Kathmandu', c: 'Nepal', lat: 27.7172, lng: 85.3240 },
  { n: 'Beijing', c: 'China', lat: 39.9042, lng: 116.4074 },
  { n: 'Shanghai', c: 'China', lat: 31.2304, lng: 121.4737 },
  { n: 'Shenzhen', c: 'China', lat: 22.5431, lng: 114.0579 },
  { n: 'Guangzhou', c: 'China', lat: 23.1291, lng: 113.2644 },
  { n: 'Chengdu', c: 'China', lat: 30.5728, lng: 104.0668 },
  { n: 'Hangzhou', c: 'China', lat: 30.2741, lng: 120.1551 },
  { n: 'Taipei', c: 'Taiwan', lat: 25.0330, lng: 121.5654 },
  { n: 'Hong Kong', c: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { n: 'Tokyo', c: 'Japan', lat: 35.6762, lng: 139.6503, big: 1 },
  { n: 'Osaka', c: 'Japan', lat: 34.6937, lng: 135.5023 },
  { n: 'Seoul', c: 'South Korea', lat: 37.5665, lng: 126.9780 },
  { n: 'Busan', c: 'South Korea', lat: 35.1796, lng: 129.0756 },
  { n: 'Ulaanbaatar', c: 'Mongolia', lat: 47.8864, lng: 106.9057 },
  { n: 'Tashkent', c: 'Uzbekistan', lat: 41.2995, lng: 69.2401 },
  { n: 'Almaty', c: 'Kazakhstan', lat: 43.2220, lng: 76.8512 },
  { n: 'Baku', c: 'Azerbaijan', lat: 40.4093, lng: 49.8671 },
  { n: 'Tbilisi', c: 'Georgia', lat: 41.7151, lng: 44.8271 },
  // Southeast Asia
  { n: 'Bangkok', c: 'Thailand', lat: 13.7563, lng: 100.5018 },
  { n: 'Chiang Mai', c: 'Thailand', lat: 18.7883, lng: 98.9853 },
  { n: 'Hanoi', c: 'Vietnam', lat: 21.0278, lng: 105.8342 },
  { n: 'Ho Chi Minh City', c: 'Vietnam', lat: 10.8231, lng: 106.6297 },
  { n: 'Kuala Lumpur', c: 'Malaysia', lat: 3.1390, lng: 101.6869 },
  { n: 'Penang', c: 'Malaysia', lat: 5.4141, lng: 100.3288 },
  { n: 'Singapore', c: 'Singapore', lat: 1.3521, lng: 103.8198, big: 1 },
  { n: 'Jakarta', c: 'Indonesia', lat: -6.2088, lng: 106.8456, big: 1 },
  { n: 'Surabaya', c: 'Indonesia', lat: -7.2575, lng: 112.7521 },
  { n: 'Bandung', c: 'Indonesia', lat: -6.9175, lng: 107.6191 },
  { n: 'Bali', c: 'Indonesia', lat: -8.4095, lng: 115.1889 },
  { n: 'Manila', c: 'Philippines', lat: 14.5995, lng: 120.9842 },
  { n: 'Cebu', c: 'Philippines', lat: 10.3157, lng: 123.8854 },
  { n: 'Davao', c: 'Philippines', lat: 7.1907, lng: 125.4553 },
  { n: 'Phnom Penh', c: 'Cambodia', lat: 11.5564, lng: 104.9282 },
  { n: 'Yangon', c: 'Myanmar', lat: 16.8661, lng: 96.1951 },
  // Oceania
  { n: 'Sydney', c: 'Australia', lat: -33.8688, lng: 151.2093 },
  { n: 'Melbourne', c: 'Australia', lat: -37.8136, lng: 144.9631 },
  { n: 'Brisbane', c: 'Australia', lat: -27.4698, lng: 153.0251 },
  { n: 'Perth', c: 'Australia', lat: -31.9505, lng: 115.8605 },
  { n: 'Adelaide', c: 'Australia', lat: -34.9285, lng: 138.6007 },
  { n: 'Auckland', c: 'New Zealand', lat: -36.8485, lng: 174.7633 },
  { n: 'Wellington', c: 'New Zealand', lat: -41.2866, lng: 174.7756 },
  { n: 'Suva', c: 'Fiji', lat: -18.1416, lng: 178.4419 },
];
