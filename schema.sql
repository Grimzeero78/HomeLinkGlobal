-- HuntIn (global) — D1 schema reference (authoritative copy)
-- This mirrors the SCHEMA const in functions/api/[[route]].js, which is what
-- actually runs: the API executes it on first hit, then applies versioned
-- ALTER TABLE migrations (see SCHEMA_VER / ensureSchema). Keep both in sync.
-- Seed rows at the bottom create one demo landlord and 14 sample listings
-- across 6 continents so the site looks alive on day one.
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pass_hash TEXT NOT NULL,
  pass_hint TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'SEEKER',
  phone TEXT NOT NULL DEFAULT '',
  verify_status TEXT NOT NULL DEFAULT 'NONE',
  doc_id TEXT NOT NULL DEFAULT '',
  doc_own TEXT NOT NULL DEFAULT '',
  verify_note TEXT NOT NULL DEFAULT '',
  suspended INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ownerId INTEGER NOT NULL,
  title TEXT NOT NULL,
  ptype TEXT NOT NULL DEFAULT 'Studio',
  units INTEGER NOT NULL DEFAULT 1,
  unitsVacant INTEGER,
  furnishing TEXT NOT NULL DEFAULT 'Unfurnished',
  floor TEXT NOT NULL DEFAULT 'Ground',
  town TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  area TEXT NOT NULL DEFAULT '',
  landmark TEXT NOT NULL DEFAULT '',
  lat REAL,
  lng REAL,
  road TEXT NOT NULL DEFAULT 'Paved / tarmac',
  rent INTEGER NOT NULL,
  period TEXT NOT NULL DEFAULT 'Per Month',
  terms TEXT NOT NULL DEFAULT '',
  deposit INTEGER NOT NULL DEFAULT 0,
  fees TEXT NOT NULL DEFAULT 'None',
  negotiable INTEGER NOT NULL DEFAULT 0,
  water TEXT NOT NULL DEFAULT 'Included in rent',
  waterCost TEXT NOT NULL DEFAULT '',
  waterSched TEXT NOT NULL DEFAULT '',
  waterTank TEXT NOT NULL DEFAULT 'No',
  elec TEXT NOT NULL DEFAULT 'Own meter',
  elecCost TEXT NOT NULL DEFAULT '',
  wifi TEXT NOT NULL DEFAULT 'Not available',
  wifiCost TEXT NOT NULL DEFAULT '',
  wifiProvider TEXT NOT NULL DEFAULT '',
  garbage TEXT NOT NULL DEFAULT 'Included',
  backup TEXT NOT NULL DEFAULT 'None',
  bath TEXT NOT NULL DEFAULT '1',
  ensuite TEXT NOT NULL DEFAULT 'No',
  kitchen TEXT NOT NULL DEFAULT 'No',
  parking TEXT NOT NULL DEFAULT 'No',
  balcony TEXT NOT NULL DEFAULT 'No',
  tile TEXT NOT NULL DEFAULT 'Tiled',
  ceiling TEXT NOT NULL DEFAULT 'Yes',
  wardrobe TEXT NOT NULL DEFAULT 'No',
  bed TEXT NOT NULL DEFAULT 'No',
  hotShower TEXT NOT NULL DEFAULT 'No',
  security TEXT NOT NULL DEFAULT '[]',
  tenantPref TEXT NOT NULL DEFAULT 'Anyone',
  pets TEXT NOT NULL DEFAULT 'No',
  availableFrom TEXT NOT NULL DEFAULT '',
  contactPhone TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  views INTEGER NOT NULL DEFAULT 0,
  boostedUntil INTEGER,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(ownerId);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(createdAt);
CREATE INDEX IF NOT EXISTS idx_listings_town ON listings(town, status);
CREATE INDEX IF NOT EXISTS idx_listings_country ON listings(country, status);
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listingId INTEGER NOT NULL,
  url TEXT NOT NULL,
  thumb TEXT NOT NULL DEFAULT '',
  idx INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_photos_listing ON photos(listingId);
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listingId INTEGER NOT NULL,
  studentId INTEGER NOT NULL,
  landlordId INTEGER NOT NULL,
  lastMsg TEXT NOT NULL DEFAULT '',
  lastAt INTEGER NOT NULL DEFAULT 0,
  typingAt INTEGER,
  typingBy INTEGER,
  createdAt INTEGER NOT NULL,
  UNIQUE(listingId, studentId)
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  convId INTEGER NOT NULL,
  senderId INTEGER NOT NULL,
  text TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  readAt INTEGER,
  edited INTEGER NOT NULL DEFAULT 0,
  deleted INTEGER NOT NULL DEFAULT 0,
  hiddenFor TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(convId, id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(convId, readAt);
CREATE INDEX IF NOT EXISTS idx_conv_student ON conversations(studentId, lastAt);
CREATE INDEX IF NOT EXISTS idx_conv_landlord ON conversations(landlordId, lastAt);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status, createdAt);
CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL,
  listing_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, listing_id)
);
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listingId INTEGER NOT NULL,
  reporterId INTEGER,
  reason TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'OPEN',
  createdAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS boosts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listingId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  town TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  until INTEGER,
  createdAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
INSERT OR IGNORE INTO settings (key, value) VALUES ('launched_at', '');

-- ============ DEMO SEED (run once; INSERT OR IGNORE keeps it idempotent) ============
-- Demo landlord: username 'demo' — password hash is random garbage, nobody signs in.
INSERT OR IGNORE INTO users (id, username, pass_hash, pass_hint, name, role, phone, created_at)
  VALUES (1, 'demo', 'seededsalt$seededhashnologin', '', 'HuntIn Demo Homes', 'LANDLORD', '', 1730000000000);

INSERT OR IGNORE INTO listings
  (id, ownerId, title, ptype, units, unitsVacant, furnishing, floor, town, country, area, landmark, lat, lng, road,
   rent, period, deposit, fees, negotiable, water, elec, wifi, garbage, backup, bath, ensuite, kitchen, parking,
   balcony, tile, security, tenantPref, pets, availableFrom, contactPhone, status, views, createdAt, updatedAt) VALUES
  (1, 1, 'Bright 2 Bedroom — Canary Wharf views', '2 Bedroom', 4, 2, 'Furnished', '3rd', 'London', 'United Kingdom', 'Canary Wharf', 'near the DLR station', 51.5054, -0.0235, 'Paved / tarmac', 1650, 'Per Month', 1650, 'None', 1, 'Included in rent', 'Own meter', 'Included in rent', 'Included', 'None', '1', 'Yes', 'Yes', 'Yes', 'Yes', 'Tiled', '["Guard","CCTV"]', 'Working professionals', 'No', 'Available now', '', 'AVAILABLE', 34, 1730000100000, 1730000100000),
  (2, 1, 'Cozy Studio — Northern Quarter', 'Studio', 6, 3, 'Semi-furnished', '1st', 'Manchester', 'United Kingdom', 'Northern Quarter', 'off Piccadilly', 53.4831, -2.2378, 'Paved / tarmac', 780, 'Per Month', 780, 'None', 0, 'Pay separately', 'Own meter', 'Available but paid separately', 'Not included', 'None', '1', 'No', 'Yes', 'No', 'No', 'Tiled', '[]', 'Singles / couples', 'Yes', 'Available now', '', 'AVAILABLE', 21, 1730000200000, 1730000200000),
  (3, 1, 'Marina view 1 Bedroom — full amenities', '1 Bedroom', 12, 5, 'Furnished', '8th', 'Dubai', 'United Arab Emirates', 'Dubai Marina', 'walk to the beach', 25.0805, 55.1403, 'Paved / tarmac', 1250, 'Per Month', 1250, 'None', 1, 'Included in rent', 'Included in rent', 'Included in rent', 'Included', 'Generator', '2', 'Yes', 'Yes', 'Yes', 'Yes', 'Tiled', '["Guard","CCTV","Gate lock"]', 'Anyone', 'Yes', 'Available now', '', 'AVAILABLE', 57, 1730000300000, 1730000300000),
  (4, 1, 'Self-contained Mini Flat — Lekki Phase 1', '1 Bedroom', 8, 4, 'Unfurnished', '2nd', 'Lagos', 'Nigeria', 'Lekki Phase 1', 'off Admiralty Way', 6.4405, 3.4712, 'Paved / tarmac', 420, 'Per Month', 420, 'None', 1, 'Pay separately', 'Own meter', 'Available but paid separately', 'Not included', 'Generator', '1', 'Yes', 'Yes', 'No', 'No', 'Tiled', '["Guard","Gate lock"]', 'Working professionals', 'No', 'Available now', '', 'AVAILABLE', 42, 1730000400000, 1730000400000),
  (5, 1, 'Serviced Bedsitter — Kilimani', 'Studio', 10, 6, 'Semi-furnished', '2nd', 'Nairobi', 'Kenya', 'Kilimani', 'near the mall', -1.2921, 36.7819, 'Paved / tarmac', 210, 'Per Month', 210, 'None', 1, 'Included in rent', 'Own meter', 'Included in rent', 'Included', 'Solar', '1', 'Yes', 'Yes', 'No', 'No', 'Tiled', '["Guard","CCTV"]', 'Anyone', 'No', 'Available now', '', 'AVAILABLE', 66, 1730000500000, 1730000500000),
  (6, 1, 'Garden Apartment — Sea Point', '1 Bedroom', 5, 1, 'Furnished', 'Ground', 'Cape Town', 'South Africa', 'Sea Point', 'on the promenade', -33.9169, 18.3862, 'Paved / tarmac', 940, 'Per Month', 940, 'None', 0, 'Included in rent', 'Prepaid', 'Included in rent', 'Included', 'None', '1', 'Yes', 'Yes', 'Yes', 'Yes', 'Tiled', '["Guard"]', 'Anyone', 'Yes', 'Available now', '', 'AVAILABLE', 29, 1730000600000, 1730000600000),
  (7, 1, 'Spacious Family Home — East Legon', 'House', 2, 1, 'Unfurnished', 'Ground', 'Accra', 'Ghana', 'East Legon', 'off Lagos Avenue', 5.6366, -0.1571, 'Paved / tarmac', 690, 'Per Month', 690, 'None', 1, 'Pay separately', 'Prepaid', 'Available but paid separately', 'Not included', 'Generator', '3', 'Yes', 'Yes', 'Yes', 'Yes', 'Tiled', '["Guard","Gate lock"]', 'Family', 'Yes', 'Available now', '', 'AVAILABLE', 18, 1730000700000, 1730000700000),
  (8, 1, 'Compact 1 BHK — Andheri West metro', '1 Bedroom', 14, 7, 'Unfurnished', '4th', 'Mumbai', 'India', 'Andheri West', '5 min from the metro', 19.1364, 72.8296, 'Paved / tarmac', 260, 'Per Month', 260, 'None', 1, 'Included in rent', 'Own meter', 'Available but paid separately', 'Included', 'None', '1', 'Yes', 'Yes', 'No', 'No', 'Tiled', '["Gate lock"]', 'Anyone', 'No', 'Available now', '', 'AVAILABLE', 51, 1730000800000, 1730000800000),
  (9, 1, 'City condo — Orchard MRT 3 min', '2 Bedroom', 20, 8, 'Furnished', '12th', 'Singapore', 'Singapore', 'Orchard', 'by the MRT', 1.3049, 103.8318, 'Paved / tarmac', 2350, 'Per Month', 2350, 'None', 0, 'Included in rent', 'Included in rent', 'Included in rent', 'Included', 'Generator', '2', 'Yes', 'Yes', 'Yes', 'Yes', 'Tiled', '["Guard","CCTV"]', 'Working professionals', 'No', 'Available now', '', 'AVAILABLE', 73, 1730000900000, 1730000900000),
  (10, 1, 'Sunny 2 Bed — downtown Toronto', '2 Bedroom', 16, 6, 'Furnished', '6th', 'Toronto', 'Canada', 'Church-Yonge Corridor', 'steps from the subway', 43.6608, -79.3804, 'Paved / tarmac', 1780, 'Per Month', 1780, 'None', 1, 'Included in rent', 'Included in rent', 'Included in rent', 'Included', 'None', '2', 'Yes', 'Yes', 'No', 'Yes', 'Tiled', '["Guard","CCTV"]', 'Anyone', 'Yes', 'Available now', '', 'AVAILABLE', 39, 1730001000000, 1730001000000),
  (11, 1, 'Brooklyn loft — Williamsburg', 'Apartment', 6, 2, 'Furnished', '2nd', 'New York', 'United States', 'Williamsburg', 'near the L train', 40.7143, -73.9613, 'Paved / tarmac', 2650, 'Per Month', 2650, 'None', 0, 'Included in rent', 'Included in rent', 'Included in rent', 'Included', 'None', '1', 'Yes', 'Yes', 'No', 'Yes', 'Tiled', '["CCTV"]', 'Working professionals', 'Yes', 'Available now', '', 'AVAILABLE', 88, 1730001100000, 1730001100000),
  (12, 1, 'Condo near Makati CBD — furnished', 'Studio', 18, 9, 'Furnished', '9th', 'Manila', 'Philippines', 'Poblacion', 'walk to the night market', 14.5764, 121.0349, 'Paved / tarmac', 340, 'Per Month', 340, 'None', 1, 'Pay separately', 'Prepaid', 'Included in rent', 'Included', 'Generator', '1', 'Yes', 'Yes', 'No', 'No', 'Tiled', '["Guard"]', 'Singles / couples', 'No', 'Available now', '', 'AVAILABLE', 47, 1730001200000, 1730001200000),
  (13, 1, 'Vila 2 quartos — Pinheiros', '2 Bedroom', 4, 0, 'Semi-furnished', '1st', 'Sao Paulo', 'Brazil', 'Pinheiros', 'near the metro green line', -23.5645, -46.6822, 'Paved / tarmac', 1150, 'Per Month', 1150, 'None', 1, 'Included in rent', 'Own meter', 'Available but paid separately', 'Included', 'None', '2', 'Yes', 'Yes', 'Yes', 'No', 'Tiled', '["Gate lock"]', 'Family', 'Yes', 'Available now', '', 'AVAILABLE', 25, 1730001300000, 1730001300000),
  (14, 1, 'Light-filled 1 Bed — Surry Hills', '1 Bedroom', 8, 3, 'Furnished', '2nd', 'Sydney', 'Australia', 'Surry Hills', 'near Central Station', -33.8861, 151.2111, 'Paved / tarmac', 620, 'Per Month', 620, 'None', 1, 'Included in rent', 'Included in rent', 'Included in rent', 'Included', 'None', '1', 'Yes', 'Yes', 'No', 'Yes', 'Tiled', '["Guard","CCTV"]', 'Anyone', 'No', 'Available now', '', 'AVAILABLE', 61, 1730001400000, 1730001400000);

-- Two photos per listing (stable stock URLs so cards render before landlords upload)
INSERT OR IGNORE INTO photos (listingId, url, thumb, idx) VALUES
  (1,  'https://picsum.photos/seed/huntin-london1/1150/860',  'https://picsum.photos/seed/huntin-london1/340/254', 0),
  (1,  'https://picsum.photos/seed/huntin-london2/1150/860',  '', 1),
  (2,  'https://picsum.photos/seed/huntin-mcr1/1150/860',     'https://picsum.photos/seed/huntin-mcr1/340/254', 0),
  (3,  'https://picsum.photos/seed/huntin-dubai1/1150/860',   'https://picsum.photos/seed/huntin-dubai1/340/254', 0),
  (3,  'https://picsum.photos/seed/huntin-dubai2/1150/860',   '', 1),
  (4,  'https://picsum.photos/seed/huntin-lagos1/1150/860',   'https://picsum.photos/seed/huntin-lagos1/340/254', 0),
  (5,  'https://picsum.photos/seed/huntin-nbo1/1150/860',     'https://picsum.photos/seed/huntin-nbo1/340/254', 0),
  (6,  'https://picsum.photos/seed/huntin-cpt1/1150/860',     'https://picsum.photos/seed/huntin-cpt1/340/254', 0),
  (7,  'https://picsum.photos/seed/huntin-accra1/1150/860',   'https://picsum.photos/seed/huntin-accra1/340/254', 0),
  (8,  'https://picsum.photos/seed/huntin-mumbai1/1150/860',  'https://picsum.photos/seed/huntin-mumbai1/340/254', 0),
  (9,  'https://picsum.photos/seed/huntin-sg1/1150/860',      'https://picsum.photos/seed/huntin-sg1/340/254', 0),
  (10, 'https://picsum.photos/seed/huntin-tor1/1150/860',     'https://picsum.photos/seed/huntin-tor1/340/254', 0),
  (11, 'https://picsum.photos/seed/huntin-nyc1/1150/860',     'https://picsum.photos/seed/huntin-nyc1/340/254', 0),
  (12, 'https://picsum.photos/seed/huntin-mnl1/1150/860',     'https://picsum.photos/seed/huntin-mnl1/340/254', 0),
  (13, 'https://picsum.photos/seed/huntin-sao1/1150/860',     'https://picsum.photos/seed/huntin-sao1/340/254', 0),
  (14, 'https://picsum.photos/seed/huntin-syd1/1150/860',     'https://picsum.photos/seed/huntin-syd1/340/254', 0);
