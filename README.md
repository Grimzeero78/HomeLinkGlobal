# HuntIn — Houses & Rentals worldwide

A mobile-first PWA where **anyone, anywhere** can find or list vacant houses,
rooms and apartments in any city on Earth. Same proven engine as the Kenya
platform, opened up to the world:

- **Country-targeted Boosts** — free during launch; one tap pins a listing at the top **only for renters browsing that country**. A Kenya boost never disturbs a UK feed.
- **Search is never limited** — anyone can search any city, area or landmark worldwide (built-in world gazetteer + worldwide OpenStreetMap geocoding).
- **World map** — full-planet Google/OSM tiles; every listing is a price chip you can fly to.
- **USD pricing** (`$`), international phone numbers (E.164, digits-only storage), country + city on every listing.
- **No payments on-platform** — "send money" flows removed entirely; rent and deposits stay face-to-face. Boosts are free, so there is nothing to pay.
- WhatsApp-first contact, landlord verification, in-app chat with read receipts.

## Stack
- Static frontend (`public/`) — vanilla JS PWA, Leaflet maps, no framework.
- Backend: Cloudflare Pages Functions (`functions/api/[[route]].js`) — one catch-all API.
- Database: Cloudflare D1 (binding `DB`). Auto-schema on first request (SCHEMA_VER 5) + optional `schema.sql` with demo seed (14 listings across 6 continents).

## Deploy (fresh account)
1. `npx wrangler d1 create homelinkglobal-db` → paste the id into `wrangler.toml`.
2. (Optional demo data) `npx wrangler d1 execute homelinkglobal-db --remote --file schema.sql`.
3. `npx wrangler pages deploy --project-name=homelinkglobal --commit-dirty=true` (or push to GitHub and connect the repo in the dashboard).
4. First visit to `/#/setup` creates the admin account. Done.
