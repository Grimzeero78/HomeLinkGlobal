# HuntIn (Global) — White-Hat Security Audit & Capacity Report

**Date:** 7 Nov 2026 · **Scope:** full API (`functions/api/[[route]].js`), client JS, headers, auth flows, live D1 `homelinkglobal-db`
**Method:** manual code review + automated attack suite (`scripts/whitehat_test.mjs`, 82 assertions) against a live local instance of the global build.

**Result: 82 / 82 PASSED.** All attempted attacks were blocked or rendered harmless.

## 0. Launch integrity — real platform, zero demo data

- The demo landlord account (`demo`) and all 14 seeded sample listings + 16 placeholder photos were **deleted from the production D1 database** and the seed block was **removed from `schema.sql`** — the platform now ships empty and only real users can create data.
- The only account on the live database is the real admin (`bridgetisaacadd`).
- CSP no longer allows any third-party photo host (`picsum.photos` origins removed from `_headers`); every image on the platform is user-uploaded and served from `'self'`/data URLs only.

## 1. Findings fixed during the HuntInKE audit (inherited by this build)

| # | Severity | Finding | Fix |
|---|----------|---------|-----|
| 1 | High | `/api/me` (GET) answered `200 ok` for **forged/expired tokens** and for **suspended** accounts | Now `401` without a valid session, `403` for suspended accounts |
| 2 | Medium | Fresh installs lacked chat `edited`/`deleted`/`hiddenFor` columns — message edit/delete crashed with 500 | Columns are part of the base schema |
| 3 | Low | `POST /api/setup` had no rate limit before the admin was claimed | Rate limited to 5 attempts/hour/IP, permanently locked after the first claim via a unique-row race guard |
| 4 | Low | `POST /api/listings/:id/boost` had no rate limit | Rate limited to 5/hour/user |
| 5 | Low | No request-body size cap | All requests > 16 MB rejected with `413` |

## 2. Global edition — new surfaces audited on 7 Nov 2026

- **`GET /api/geo`** (visitor country for the HuntIn <CC> wordmark): returns `request.cf.country` only — no user input, no DB, no storage. No injection or enumeration surface. ✔ tested
- **Country field on listings** (`country` required at create, filterable in browse): fully parameterised; SQLi through `country=` tested and harmless. ✔
- **Free instant boost** (no payments): owner-only, one active boost per listing, 5/hour/user rate limit, 7-day window. **Country targeting verified in both directions** — a boost jumps the queue only for renters browsing the boosted listing's own country or town; it never leaks into other countries' feeds. ✔ 8 assertions
- **International phone validation** (`^\+[1-9]\d{6,14}$`): local-only formats (e.g. `07…`) are rejected; numbers normalise to digits-only for WhatsApp links. ✔
- **Hint ≠ password** enforced at registration and at setup. ✔
- No payment processing exists anywhere in the global codebase — boosts are free, the platform never handles money (all UI surfaces repeat the "view first, never send money before viewing" rule as anti-scam education).

## 3. Attacks tested and blocked (automated suite, 82 assertions)

**Authentication & sessions**
- Brute-force login: locked after 15/min/IP and 8/min/username (`429`) ✔
- Registration flood: locked after 8/hour/IP ✔ · setup hammering: locked after 5/hour/IP ✔
- Constant-time hash compare; generic "Wrong username or password" (no user enumeration)
- Passwords: PBKDF2-SHA-256, 100 000 iterations, per-user 128-bit salt
- Sessions: 40-char CSPRNG tokens, 30-day expiry, server-side revocation — **token is dead after logout** ✔ · forged tokens rejected ✔ · suspended accounts blocked on every endpoint ✔

**Injection**
- SQL injection via search `q`, `town`, `country`, UNION SELECT, `DROP TABLE`/`DELETE FROM` payloads — all parameterised (`.bind()`), zero string-built SQL values; every table survived ✔
- XSS: `<img onerror>`, `<script>` payloads stored as inert data; every render path escapes via `esc()`; API responses are `application/json` + `X-Content-Type-Options: nosniff` ✔

**Access control (IDOR)**
- Edit / delete / status-toggle / boost of another user's listing → blocked ✔ (admins included)
- Seeker attempting landlord-only actions → `403` ✔
- Opening or editing a stranger's conversation → `404` ✔
- Non-admin hitting admin endpoints → `401/403` ✔
- Deleted messages: text wiped server-side (tombstone), `hiddenFor` respected per viewer ✔

**Abuse prevention**
- Uploads: strict raster-image regex only (`png/jpg/webp/gif`) — **SVG and HTML uploads rejected** ✔
- 3–8 photos enforced; listing photos client-compressed to ≤150 KB, docs ≤260 KB; per-field length caps; 2-listing free cap / 5 verified
- View counter deduped 1 per IP per listing per 6 h; typing pings throttled; message 30/min; conv creation 10/min; browse reads 240/min/IP
- 17 MB body rejected with `413` ✔

**Headers** (`public/_headers`)
- `Content-Security-Policy`: self-only scripts, **zero third-party image hosts**, OSM/geolocation tiles only for the world map
- `X-Frame-Options: DENY`, `frame-ancestors 'none'` (no clickjacking) · `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(self), camera=(), microphone=(), payment=()` — location never leaves the device without consent

**Admin claim safety**
- One-time setup: unique `admin_locked` settings row makes the claim race-proof; second attempt `403`; rate limited ✔

## 4. Residual risks (accepted, documented)

- **Password hints** are recoverable via `/api/hint/:username` (rate limited 10/min/IP). By design it lets real users recover accounts; it also reveals whether a username exists. Hints can never be the password (enforced server-side).
- **Rate limiting is per-isolate** (in-memory). Distributed floods are absorbed by Cloudflare's edge; per-isolate windows are a defence-in-depth layer, not the only one.
- **Photos are stored as data URLs in D1** (≤150 KB each, compressed client-side). Safe under the strict MIME + size caps, but at large scale an R2 bucket is the natural next step (see capacity table).

## 5. Capacity — can the account hold the people?

Account `507a35f3…` runs the **Cloudflare Free plan** (no paid subscriptions). Measured headroom:

| Resource | Free-plan limit | Used today | Real-world meaning |
|---|---|---|---|
| D1 storage (all 7 DBs share) | **5 GB** | ~7.3 MB | ≈ **4,000–6,000 photo listings** (≈450 KB photos/listing) + hundreds of thousands of user/message rows |
| D1 rows written | **100,000 / day** | ~0 | ≈ 20,000 new listings/day, or ~100k chat messages/day |
| D1 rows read | **5 million / day** | thousands | ≈ 25,000–50,000 browse/search requests/day |
| Pages Functions invocations | **100,000 / day** | — | ≈ 10,000–15,000 active visitors/day (≈8 API calls per visit) |
| Static asset requests + bandwidth | **Unlimited** | — | Photos/pages serve at the edge with no cap, no cost |
| D1 databases | 10 per account | 7 | 3 slots free |

**Verdict:** the free plan comfortably carries the launch phase — thousands of registered users, a few thousand live listings, ~10k daily visitors — with every security control active. The first ceiling you will feel at scale is API invocations (100k/day).

**The day you outgrow it — $5/month Workers Paid:**
- Functions: 100k/day → **10 million/month** (≈ 100×)
- D1: 5M reads/day → **25 billion rows read/month**, 50M writes/month
- Photos move from D1 data URLs to **R2 storage (10 GB free tier, zero egress fees)** — a small code change in `functions/api/[[route]].js` upload paths, everything else stays.

## 6. How to re-run the audit

```bash
cd HuntInGlobal && npm install
npx wrangler pages dev public --d1 DB=homelinkglobal-local --persist-to .wrangler/state --port 8794 &
node scripts/whitehat_test.mjs   # 82 assertions, expects 82 passed / 0 failed
```
