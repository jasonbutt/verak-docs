# Kevara Changelog

**Format:** Each entry has a one-line summary of what shipped and why it matters, followed by technical detail for developer reference. **Maintained by:** Jason G. Butterfield **Last updated:** 30 May 2026

---

## 6 May 2026

### AppNav — Unified Navigation Shell

Replaced per-page inline headers with a single `AppNav` component across all four app pages, giving the app a consistent navigation shell and freeing page layouts from managing their own top bars.

**Files changed:**

- `components/AppNav.js` — UserMenu dropdown now highlights active page with blue dot \+ bold text via `usePathname()`  
- `app/feed/page.js` — AppNav replaces inline header  
- `app/dashboard/page.js` — AppNav added; sidebar trimmed (logo, profile pill, ThemeToggle removed); sidebar repositioned to `top: 56, height: calc(100vh - 56px)`  
- `app/settings/page.js` — AppNav added; 220px app sidebar removed entirely  
- `app/profile/page.js` — AppNav added; `ProfileHub` gets `skipNav={true}` prop to suppress its own sticky bar and add `paddingTop: 56`

---

### Feed — Interactions, Composer & Sidebar Polish

Wired up real like/repost actions, inline reply composer, emoji and image attachment, and cleaned up sidebar copy.

**Files changed:**

- `app/feed/page.js`  
  - Like & Repost: calls `agent.like`/`deleteLike` and `agent.repost`/`deleteRepost` with optimistic UI and rollback on error  
  - Inline Reply: expands composer with reply record linking to parent/root post  
  - Compose — Emoji: 20-emoji popover, inserts at cursor position  
  - Compose — Images: file picker, up to 4 previews, uploaded as blobs on post  
  - "Network Groups" → "Orbit Groups" in right panel  
  - Footer links updated: About/Privacy/Terms/Help → kevara.co \+ © notice  
  - Full Network mode now discovers Kevara connections for "On Kevara" sidebar  
  - Own Profile Sync accounts appear at top of "On Kevara" list with YOU badge

---

### Feed — Sidebar & Like State Fixes

Removed own accounts from the "On Kevara" sidebar (list should show people you follow, not yourself), fixed the like icon to use a filled/hollow state, and made like/repost state initialise from the API rather than only from localStorage.

**Files changed:**

- `app/feed/page.js`  
  - "On Kevara" sidebar: own Profile Sync accounts removed  
  - Heart icon: filled solid red when liked, hollow outline when not (controlled by `filled` prop on SVG)  
  - Like/repost persistence: initialises from `post.viewer.like` (API) first, falls back to `kv-liked-{did}` in localStorage

---

### Settings — My Network Polish

Minor UX fixes to the Settings page for multi-account management clarity.

**Files changed:**

- `app/settings/page.js`  
  - Profile Sync sort: primary account always first  
  - Single-account checkbox greyed out and disabled with explanatory note  
  - "← My Network" back link added to sub-nav sidebar  
  - Feed section label displays as "My Network" instead of translation key

---

## 7–9 May 2026

### Homepage — Dynamic Showcase

Replaced hardcoded static placeholder pills on the marketing homepage with a live client-side fetch from a new Showcase API. Also added an admin Showcase tab to manage the featured profile and member list.

**Files changed/created:**

- `app/api/showcase/route.js` *(new)* — GET (public, CDN cached) \+ POST (admin-authed)  
- `serve.mjs` — Added `/api/showcase` handler mirroring the Next.js route for dev server  
- `public/index.html` — Live JS fetches showcase config, renders featured profile card (gold border) \+ scrolling member pills; profile links are environment-aware  
- `app/admin/page.js` — New Showcase tab: ownership banner, list AT-URI field, member typeahead (220ms debounced), member list with Remove, featured profile picker, Save button  
- `lib/redis.js` — `getShowcaseConfig()` \+ `setShowcaseConfig()` using `showcase:config` key

---

### Multi-Account — Cross-Network Profile Value

Shipped four cross-account features making multi-network presence visible and useful on the public profile and in the orbit view.

**What shipped:**

1. **Unified activity heatmap \+ merged feed** — public profile merges post feeds and heatmap across all linked accounts  
2. **Cross-network verification panel** — public profile shows "Verified on \[Bluesky\] \[Gander\] \[EuroSky\]" row with network logos, follower counts, and profile links  
3. **Primary \= Resume Authority** — primary account is the single source of truth for Sifa resume data; secondary accounts contribute network reach only. Amber info banner shown when viewing a secondary account's profile as owner  
4. **Merged Orbit** — orbit connections merged and deduplicated by DID across all accounts; each connection gains `sourceAccounts` field; ConnectionCard shows coloured network dots \+ "N networks" badge

**Files changed:**

- `hooks/useOrbitConnections.js` — signature changed to `useOrbitConnections(accounts, primaryAccount)`; connections fetched in parallel, merged, deduplicated by DID; `addConnection` writes to primaryAccount only; `removeConnection` deletes from every account that has the DID  
- `components/ProfileHub.js` — `syncLinkedAccounts()` writes linked accounts to `is.kevara.linkpage` PDS record; cross-network verification panel added; secondary account amber banner added; primary always used as Sifa write authority  
- `lib/atproto.js` — `pubMap` now stores `{ value, pdsHost, did }`; `blobUrl()` helper constructs blob URLs against the correct PDS; Standard.site cards get `thumbnailUrl` and `publication.iconUrl`  
- `app/orbits/page.js`, `app/orbits/map/page.js`, `app/feed/page.js` — all three call sites updated to merged orbit hook

---

### Articles — Standard.site Card Redesign

Improved the article card layout across all three formats (list / tiles / carousel) and added article network visibility controls.

**Files changed:**

- `components/ProfileHub.js` — card redesigned as horizontal flex: 90px thumbnail strip (right-edge gradient fade) \+ content panel; publication source row shows icon \+ name \+ platform pill; image-less cards stay full-width text  
- Locale files (EN/FR/DE/ES) — "My Links" → "My Articles"; nav key `nav_my_links` updated; link-chain icon → open-book icon  
- `contexts/SubscriptionContext.js` — `articles_format` and `articles_pin_hide` added as Pro features; `ARTICLES_LIMIT = { free: 3, pro: 6 }` exported

---

## 10 May 2026

### Articles — Pro Formatting & Pin/Hide Controls

Gave Pro users control over article display format (List / Tiles / Carousel) and per-article pin/hide settings. Free users see the controls but can't use them.

**Files changed:**

- `components/ProfileHub.js` (WritingFeed rewrite)  
  - Free: 3 most recent articles, list format only, gear icon shows upgrade CTA  
  - Pro: up to 6 articles, gear icon opens settings panel with format picker \+ per-article pin (gold) and hide (eye/slash) controls  
  - 3 layout variants: list cards, 2-col tile grid, horizontal carousel  
  - Preferences stored in `kevaraRecord.articles` inside `is.kevara.linkpage` via `putSifaRecord`  
  - Gear/lock icon links to `/dashboard?tab=articles`  
- `app/dashboard/page.js` — reads `?tab=articles` on mount; activates "My Articles" tab  
- `components/ArticlesPanel.js` — fully self-contained; free tier shows upsell banner \+ disabled controls; Pro tier has format picker with SVG previews, per-article controls, Save with ✓ confirmation  
- Article network hide/show controls added; platform pills reflect hidden state; `articleNetworkKey` used consistently for toggle identity

---

## 15 May 2026

### Planets — Full Feature Launch

Built Planets (formerly Orbit Groups) from scratch: curated professional groups backed by AT Protocol lists, with subscribe/unsubscribe, PDS persistence, Orbit Map integration, and an admin panel.

**What shipped:**

- Subscribe to Official or Community planets; membership persists to PDS via `is.kevara.planet.subscription` records  
- Planet feed integration: Planets tier in feed filter surfaces posts from subscribed planet members  
- Orbit Map: subscribed planets appear as distinct ringed nodes; clicking opens a member panel with "In orbit" badges  
- Pro gating: subscribing is free; creating community planets requires Pro

**Files changed/created:**

- `lib/redis.js` — 6 planet helpers: `savePlanet`, `getPlanet`, `deletePlanet`, `registerOfficialPlanet`, `registerCommunityPlanet`, `listOfficialPlanets`, `listCommunityPlanets`  
- `lib/planets.js` *(new)* — `getPlanetMembers`, `createBskyList`, `addListMember`, `removeListMember`, `createPlanetRecord`, `subscribeToPlanet`, `writePlanetSubscription`, `deletePlanetSubscription`, `listPlanetSubscriptions`  
- `app/api/planets/route.js` — public GET returning official \+ community planets with member counts and trust scores  
- `app/api/planets/register/route.js` — Pro-gated POST for community planet registration  
- `app/api/admin/planets/route.js` — admin GET/POST/DELETE for managing official planets  
- `components/planets/PlanetRings.js` *(new)* — deterministic SVG rings using mulberry32 seeded from planet ID  
- `components/planets/PlanetsTab.js` *(new)* — full tab with PlanetCard, PlanetDetail, trust bar, Pro gating, subscribe/unsubscribe flow, filter pills (All / Joined / category)  
- `app/orbits/page.js` — "My Orbit | Planets" tab bar added to sticky header  
- `app/admin/page.js` — PlanetsAdmin component \+ Planets tab; ownership notice ("Managed by Kevara.app"); isCurator prop gates controls  
- `contexts/SubscriptionContext.js` — `planets_subscribe: 'free'`, `planets_create: 'pro'` added

---

### Ozone Labels — Verification & Pro Subscription Wiring

Wired Kevara Verification and Pro subscription status to signed Ozone labels instead of PDS record checks alone.

**Files changed/created:**

- `lib/labels-server.js` *(new)* — `applyOzoneLabel(did, labelVal)` and `removeOzoneLabel(did, labelVal)`; Basic auth; silent-fails if Ozone unreachable  
- `app/api/admin/subscription/route.js` — POST now calls `applyOzoneLabel(did, 'kevara-pro')` on grant; DELETE removes it  
- `app/orbits/page.js`, `components/ConnectionCard.js`, `components/SearchResultCard.js` — checkmarks gated on `kevara-verified` label, not just "has a Kevara account"  
- `app/settings/page.js` (VerificationSection) — checks both Redis verification record AND `labeler.kevara.app` directly; fixes cases where manual CLI label grant wasn't surfacing

---

## 16 May 2026

### Feed — Rich Text, Infinite Scroll & Thread Polish

Added AT Protocol rich text rendering, auto infinite scroll, reply character counter, and reply context indicators across feed and thread views.

**Files changed:**

- `app/feed/page.js`  
  - `RichText` component handles UTF-8 byte-offset facets: links → `<a>`, @mentions → `/directory/<did>`, \#hashtags → brand blue  
  - "Replying to @handle" indicator above reply posts  
  - `IntersectionObserver` on sentinel div triggers `loadMore()` within 400px of bottom; "Load more" button remains as fallback  
  - Inline reply character counter (300 − length); turns gold below 30, red over limit  
- `app/post/[did]/[rkey]/page.js` — same RichText and character counter applied to thread view

---

### Auth — Hard Logout Fix

Fixed a soft-logout bug where switching users left the previous user's profile bleeding through.

**Files changed:**

- `contexts/AtProtoContext.js` — `clearAll()` rewritten as a hard clear: wipes `accounts: []` and `primaryId: null` completely

---

### Dev Auth Bypass

Added a dev-only app-password login path so the full OAuth flow isn't required against localhost.

**Files changed/created:**

- `lib/oauth-session.js` — `secure` cookie flag now `NODE_ENV === 'production'`  
- `app/api/auth/logout/route.js` — cookie-clear header matches env check  
- `app/api/auth/dev-login/route.js` *(new)* — resolves handle → DID → PDS, calls `createSession`, writes identical Redis session shape; hard-refuses in production  
- `lib/pds-client.js` — all XRPC calls check `authMode === 'apppassword'`; uses `Authorization: Bearer` instead of DPoP; token refresh uses `refreshSession`  
- `app/login/page.js` — amber "Dev Login (App Password)" panel rendered when `NEXT_PUBLIC_DEV_AUTH_BYPASS=true`  
- `.env.development` — `DEV_AUTH_BYPASS=true` and `NEXT_PUBLIC_DEV_AUTH_BYPASS=true` added

---

### Admin — Showcase Config Migrated to Redis

Moved showcase config from disk JSON to Redis for consistency with the rest of the app's state.

**Files changed:**

- `lib/redis.js` — `getShowcaseConfig()` \+ `setShowcaseConfig()` using `showcase:config`  
- `app/api/showcase/route.js` — reads/writes Redis; removed `fs` and `path` imports  
- `next.config.mjs` — reverted (file tracing no longer needed)

---

## 18 May 2026

### Kevara Firehose Service

Built and shipped a standalone Node.js worker service (`kevara-firehose`) to Railway that listens to the AT Protocol relay and Ozone label stream, increments Redis KPI counters, and enqueues broadcast post jobs.

**Repo:** `github.com/jasonbutt/kevara-firehose`

**What it does:**

- Connects to `wss://bsky.network`, filters for Kevara/Sifa lexicon events  
- Connects to Ozone label stream (`wss://labeler.kevara.app`), listens for label emissions  
- Increments Redis KPI counters (`kpi:{metric}:{date}`, 90-day TTL)  
- Enqueues post jobs to `post:queue` Redis list (capped at 50\)

**Bugs fixed during build:**

- Rogue `handlers/package.json` stub broke ESM resolution  
- Firehose API uses constructor callbacks, not EventEmitter  
- `@upstash/redis` instead of `redis` package to match main app credentials  
- `https://` → `wss://` for Ozone WebSocket URL  
- Raw `Buffer` corrupted by `.toString()` before CBOR decoding  
- CBOR frame format requires `decodeFirst` twice (two concatenated values)  
- `cborg` needed as explicit dependency

**Env fix:** `OZONE_PUBLIC_URL`, `OZONE_ADMIN_PASSWORD`, `OZONE_SERVER_DID` were missing from Vercel env vars, silently failing the admin → Ozone label path.

---

### Admin — Analytics Tab & KPI Dashboard

Added a full Analytics tab to the admin panel with time-series KPI charts, credibility tier distribution, and a broadcast post queue.

**Files changed/created:**

- `lib/postTemplates.js` *(new)* — shared `TEMPLATES` object (source of truth for admin \+ firehose)  
- `app/api/analytics/kpi/route.js` *(new)* — KPI totals \+ daily series per metric/date range via `redis.mget`  
- `app/api/analytics/post-queue/route.js` *(new)* — queue GET \+ POST actions (enable/disable templates, set active variant, discard, clear, send\_now)  
- `app/admin/page.js` — Analytics tab: time range picker, 5 KPI tiles with period deltas, growth bar chart (recharts), credibility tier distribution, regional placeholder, broadcast queue panel

---

### Admin — Credibility & Member Search Polish

Added typeahead search to the Members and Verification admin tabs; surfaced credibility network stats in the header bar.

**Files changed:**

- `app/admin/page.js`  
  - Members tab: `AdminHandleSearch` with full Bluesky typeahead replaces bare input; selecting a suggestion immediately triggers lookup  
  - Verification tab: `searchActorsTypeahead` with 250ms debounce; dropdown populates filter on selection  
  - Credibility tab header: "Total Scored · Authority · Sovereign · Avg Score" stats bar

---

## 19 May 2026

### Analytics — Privacy-First PDS Analytics System

Replaced all legacy analytics tracking with a privacy-safe system: raw signals are enriched and discarded at the edge, cleaned records written to the user's own PDS.

**Files changed/created:**

- `lib/lexicons/is.kevara.analytics.event.json` *(new)* — unified lexicon: `eventType`, `timestamp`, optional `linkId`, `linkLabel`, `regionCode`, `referrerSource`, `deviceType`  
- `app/api/analytics/event/route.js` *(new)* — Vercel Edge Function; enriches with geo/device/referrer; discards raw signals; rate-limits at 30 events/IP/5min; writes cleaned record to user's PDS  
- `lib/analytics.js` — client-side `trackEvent()` emitter; silent-fail; `keepalive: true`  
- `lib/useAnalytics.js` — `useAnalytics(session, window)` hook; paginates PDS records (100/page, cap 5000); aggregates profile views, link clicks, engagement score, top links with CTR, geo/referrer/device breakdowns, 7×24 peak heatmap  
- `app/dashboard/page.js` — full analytics UI: shimmer skeletons, period selector (7d/30d/all — Pro only), stat cards, geo panel, top links, referrer, device split, peak heatmap, article clicks table, CSV export  
- `components/ProfileHub.js` — replaced old tracking calls with `trackEvent()` for `profile.view`, `article.click`, `publication.click`

---

## 20 May 2026

### Light Theme — Full Profile Support

Fixed hydration mismatch and completed light theme support across all three profile banner layouts.

**Files changed:**

- `app/layout.js` — removed hardcoded `dark` class from `<html>`; added `suppressHydrationWarning`  
- `components/ProfileHub.js`  
  - Added missing `import { useTheme } from '@/components/ThemeProvider'`  
  - Removed orphaned `}` causing build error  
  - StackedBanner, EditorialBanner, MinimalBanner: all hardcoded dark values → CSS variables

---

## 21 May 2026

### Brand — "Gander Gold" → "KV Gold"

Renamed the brand colour token throughout the codebase. Hex value `#E6B325` is unchanged; only the name and display copy were updated.

**Files changed:**

- `app/globals.css` — `--gander-gold` → `--kv-gold`  
- `app/feed/page.js` — "Gander-Gold Kevara badge ring" → "KV Gold Kevara badge ring"  
- `app/admin/page.js` — `LABEL_DEFS` and `LABEL_CFG` entries for `kevara-verified`: 'Verified' → 'Kevara Verified'  
- All CLAUDE.md / brand token references updated

---

### Feed — Viewer State Hydration Fix

Fixed like/repost state not persisting across feed types (Orbits, Planets, Satellites) after cache clear. Root cause: unauthenticated AppView calls returned empty `post.viewer`.

**Fix:** `hydrateViewerState(feedItems, account)` in `app/feed/page.js` — calls `agent.com.atproto.repo.listRecords` on the user's own repo for `app.bsky.feed.like` and `app.bsky.feed.repost` collections (100 records each), then merges the AT-URIs back into feed items. Applied to all feed paths including load-more pagination.

---

## 22 May 2026

### Dev Auth — OAuth Session Cookie Fix

Fixed session cookie not being set over HTTP on localhost.

**Files changed:**

- `lib/oauth-session.js` — `secure` cookie flag is now `NODE_ENV === 'production'`

---

### Admin — OAuth \+ PDS Write Security Hardening

Moved admin PDS writes off direct browser JWT calls to a server-side proxy with Redis-stored JWT and automatic token refresh.

**Files changed:**

- `app/api/admin/pds/route.js` *(new)* — server-side XRPC proxy; reads JWT from Redis; handles token refresh  
- `app/api/admin/auth/route.js` — stores `{ accessJwt, refreshJwt, pdsHost }` in Redis on login; `accessJwt`/`refreshJwt` removed from client state  
- `lib/sifa.js` — detects `accessJwt === '__oauth__'` and routes through `/api/xrpc` proxy

---

### Planets — Filter Pills & Joined Sorting

Added a horizontally scrollable filter pill bar to PlanetsTab and improved subscribed planet sorting.

**Files changed:**

- `components/planets/PlanetsTab.js`  
  - `SectionLabel` shared component added  
  - `PlanetCard` accepts `isSubscribed`; green border \+ "Joined ✓" badge when true  
  - `FilterPills`: All / Joined·N / Tech / Legal / Finance / Creative / Science  
  - All view: "Joined Planets" section floats to top; subscribed planets excluded from lower sections  
  - Joined filter: flat list of subscribed planets; empty state if none  
  - Category filter: flat list; subscribed first within category

---

## 23 May 2026

### Feed — Like/Repost Viewer State Fix (Revised)

Revised the hydration approach after the `getPosts`\-based fix failed for OAuth users and non-Bluesky PDSes.

**Files changed:**

- `app/feed/page.js` — `hydrateViewerState` rewritten to use `agent.com.atproto.repo.listRecords` on the user's own repo; works for both OAuth and app-password sessions across all PDS hosts

---

### Member Directory / Discover

Shipped Phase 2 of the member directory: authoritative region detection via PDS, enriched planet chips, regional sub-routes, and a Featured/All members split.

**Files changed/created:**

- `lib/directory.js` *(new)* — `getRegionFromDid(did)`: resolves DID via PLC directory → extracts PDS `serviceEndpoint` → matches gander/eurosky patterns; cached in Redis at `did:region:<did>` with 24h TTL; `invalidateRegionCache(did)` for PDS migration  
- `app/api/directory/index/route.js` — replaced handle-TLD guessing with `getRegionFromDid()`; loads planet metadata in one Redis pass; sort: Pro+Verified → Pro → Verified → Free, then by `updatedAt`  
- `app/api/directory/public/route.js` — Redis cache entry includes `updatedAt` for sort  
- `components/directory/DirectoryMemberCard.js` — planet chips show name \+ coloured category dot; up to 2 visible \+ "+N more"; tooltip on hover; clicking chip navigates to `/orbits?planet=<planetId>`  
- `app/discover/page.js` — results split into "Featured Professionals" (Pro, gold header) and "All Members"  
- `app/discover/[region]/page.js` *(new)* — handles `/discover/ca`, `/discover/eu`, `/discover/global`; server component with `generateMetadata()` and `generateStaticParams()`  
- `app/globals.css` — `--kv-gold: #E6B325` and `--aero-blue: #00A3FF` added to `:root` (both were referenced but never defined)

---

### Public Roadmap

Added a public-facing roadmap page to the marketing site.

**Files changed/created:**

- `public/roadmap.html` *(new)* — 12-item roadmap table; colour-coded status dots (green/Live, blue/Coming, gold/Planned); legend; CTA strip  
- `middleware.ts` — `/roadmap.html` added to `PUBLIC_PREFIXES` allowlist  
- `app/beta/page.js` — BETA\_ITEMS updated: Portfolio publishing → live; Directory → soon; mobile apps → soon  
- Footer updated on all 9 public pages to include Roadmap link

---

## 24 May 2026

### Directory — For Hire Mode

Added a "For Hire" mode to the member directory so professionals can signal availability with service types and rate bands.

**Files changed/created:**

- New lexicon: `is.kevara.directory.forhire.json`  
- `app/api/directory/forhire/route.js` *(new)* — GET/PUT; reads/writes to PDS; manages `directory:forhire:index` \+ 5min Redis cache  
- `app/settings/page.js` — new "For Hire" SectionCard: toggle, availability dot, service type chips, rate band select, work arrangement  
- `components/directory/ServicesMemberCard.js` *(new)* — availability dot, service type chips, rate band, "Contact via AT Protocol" button  
- `app/discover/page.js` — "For Hire" mode enabled; filters popover: service type chips \+ "Available now" toggle; `ServicesMemberCard` wired in  
- `/profile/[handle]` — green "For Hire" pill in name area (smooth-scrolls to Services section); Services section at bottom of profile

---

### Directory — Speaker Mode

Added a "Speaker" mode to the directory for professionals available for talks and appearances.

**Files changed/created:**

- `lib/lexicons/is.kevara.directory.speaker.json` *(new)* — `available`, `talkTopics`, `formats`, `pastAppearances`, `travelAvailability`, `feeRange`, `bio`  
- `app/api/directory/speaker/route.js` *(new)* — GET/PUT; manages `directory:speaker:index` \+ 5min Redis cache; strips bio/pastAppearances from unauthenticated responses  
- `app/settings/page.js` — new "Speaker Profile" SectionCard below For Hire  
- `components/directory/SpeakerMemberCard.js` *(new)* — gold "Available to Speak" badge; topic/format chips; travel/fee/appearances meta; "Book / Enquire" button with logged-out bottom sheet gate  
- `app/discover/page.js` — "Speaking" mode enabled; speaker filters in FiltersPopover; `SpeakerMemberCard` wired in grid  
- `components/ProfileHub.js` — gold "Speaker" badge in banner; fetches speaker record; SpeakerSection with bio, topics, formats, travel, fee, appearances, "Book / Enquire" soft gate  
- `app/admin/page.js` — "Directory" tab added; `DirectoryAdmin` component with counts by mode \+ region, manual DID seed input

---

### Admin — Stats Dashboard

Surfaced live stats across all five admin sections in a top stats bar.

**Files changed/created:**

- `app/api/admin/directory/stats/route.js` *(new)* — total, portfolio, services, speakers, CA/EU/global breakdown, recent 20 DIDs  
- `app/api/admin/directory/seed/route.js` *(new)* — POST; adds DID to `directory:index` for manual onboarding  
- `app/admin/page.js` — stats bar: Members (Active Pro / New this week / Expiring soon / Paid), Verification (Pending / Approved / Rejected / Revoked), Planets (Official / Community / Total), Credibility (Total scored / Authority / Sovereign / Professional / Avg score), Audit Log (Total / Today / This week)

---

## 28 May 2026

### Analytics — Summary Flush & Network Growth Snapshots

Added analytics aggregation (flush raw events → summary records) and a network growth dashboard panel with week-over-week deltas.

**Files changed/created:**

- `lib/lexicons/is.kevara.analytics.summary.json` *(new)*  
- `lib/analytics.js` — `flushAnalyticsSummary(session, rawEvents)`: aggregates batch, writes single `is.kevara.analytics.summary` record via XRPC proxy; silent-fail  
- `lib/useAnalytics.js` — refactored: all summary records fetched first; raw events capped at 5 pages; flush triggered when raw events ≥ 400 and events older than 90 days exist; old records batch-deleted; summaries included in 'all' window totals  
- `lib/lexicons/is.kevara.network.snapshot.json` *(new)* — `snapshotAt`, per-network entries, `totalSifaFollows`/`totalOrbitMembers` roll-ups  
- `lib/network.js` — `writeNetworkSnapshot(session, accounts)`: counts `id.sifa.graph.follow` records; fetches follower counts; no-ops if snapshot written within 23 hours; all XRPC through `/api/xrpc`  
- `lib/useNetworkGrowth.js` — fetches all snapshot pages; builds `growthSeries`; computes WoW delta; fires `writeNetworkSnapshot` as side-effect  
- `app/dashboard/page.js` — `NetworkGrowthPanel`: sparkline of `totalSifaFollows` over time; WoW delta chips (green ↑ / red ↓); per-network pills; Pro-gated

---

## 29 May 2026

### Endorsements Dashboard Panel

Surfaced received Sifa endorsements on the dashboard with skill grouping and verified endorser indicators.

**Files changed/created:**

- `lib/lexicons/id.sifa.endorsement.json` *(new)* — reference copy of Sifa Standard schema  
- `lib/useEndorsements.js` *(new)* — iterates orbit connections in batches of 5; reads each endorser's PDS (public, no auth); deduplicates by `endorserDid + skill`; enriches with `endorserVerified` via `getCachedLabels`; returns `endorsements`, `skillGroups`, `topSkills`, `totalEndorsements`, `verifiedEndorsements`  
- `app/dashboard/page.js` — `EndorsementsPanel` after NetworkGrowthPanel; Pro-gated; top skills as pills (KV Gold dot on skills with verified endorsers); recent endorsements list (max 5): avatar, handle, verified badge, skill tag, relative timestamp

---

### Notifications — Orbit, Endorsement & Verification

Added a full notification system: fire-and-forget PDS writes on key actions, a notifications hook, bell icon with unread count in AppNav, and a dedicated notifications page.

**Files changed/created:**

- `lib/lexicons/is.kevara.notification.json` *(new)* — `orbit_added`, `endorsement_received`, `verification_issued` types  
- `lib/notifications.js` *(new)* — `writeNotification(targetPdsHost, targetDid, notification)`: unauthenticated `createRecord` against target's PDS; silent-fail  
- `components/ProfileHub.js` — `handleOrbit` fires `writeNotification` on add path only; fire-and-forget  
- `lib/useNotifications.js` *(new)* — `notifications`, `unreadCount`, `hasOrbitAddBack`, `markRead`, `markAllRead`, `markActionTaken`, `deleteReadNotifications`; supports OAuth and app-password; optimistic updates; max 2 pages (200 records)  
- `components/AppNav.js` — IBell SVG icon; Aero Blue badge (≤9 or "9+"); inserted before profile pill on authenticated views  
- `app/notifications/page.js` *(new)* — single-column 680px layout; `OrbitCard` with inline "+ Add to my Orbit" button; unread cards with `#00A3FF` left border; empty state; "Clear read notifications" button

---

## 30 May 2026

### Planets — Nomination System

Added a peer nomination mechanism for Planets: users can suggest accounts for planets they're subscribed to; planet admins review a nominations queue and accept or decline.

**What shipped:**

- Nomination records stored on the nominator's PDS as `is.kevara.planet.nomination` (sovereign, no central storage)  
- Redis-backed nomination counts and queue for admin review  
- Official planets: moderated (admin accepts/declines)  
- Community planets: same flow, configurable threshold for auto-add (foundation laid)  
- "Suggest for a Planet" trigger on `ConnectionCard` and `ProfileHub`  
- `NominateModal` with planet selector, reason field (140 char), and confirmation state  
- Admin nominations queue in Planets tab: nomination count badge (KV Gold), expandable nominator list with reason, Accept / Decline actions

**Files changed/created:**

- `lib/redis.js` — 7 nomination helpers: `saveNomination`, `deleteNomination`, `getNominationsForPlanet`, `getNominationCount`, `hasNominated`, `acceptNomination`, `declineNomination`  
- `lib/planets.js` — `writeNomination`, `deleteNomination` (PDS record), `listNominationsForPlanet`, `getNominationCount`  
- `app/api/planets/nominate/route.js` *(new)* — POST (submit nomination) \+ DELETE (withdraw); duplicate and existing-member checks; writes to both Redis and PDS  
- `app/api/planets/nominate/check/route.js` *(new)* — GET pre-check: `alreadyNominated`, `alreadyMember`, `nominationCount`  
- `app/api/admin/planets/nominations/route.js` *(new)* — GET (queue for a planet, sorted by nomination count) \+ POST (accept → `addListMember` \+ clear Redis) \+ DELETE (decline \+ 30-day cooldown key)  
- `app/admin/page.js` — NominationQueueItem per nominee: avatar, display name, nomination count badge, expandable nominator list, Accept / Decline buttons  
- `components/planets/NominateModal.js` *(new)* — planet selector (filtered to subscribed), reason textarea (140 char counter, turns KV Gold at 120+), confirmation state, 409 error handling  
- `components/ConnectionCard.js` — "⊕ Planet" icon-button in action row; opens `NominateModal`  
- `components/ProfileHub.js` — "Suggest for a Planet" text button on non-owner view; opens `NominateModal`

---

### Planets — Nomination Notifications

Wired notifications into the nomination flow so nominated and accepted accounts are informed.

**Files changed:**

- `app/api/planets/nominate/route.js` — fire-and-forget `writeNotification` to nominated account on submission (`planet_nomination` type: planet name, reason, nominator handle)  
- `app/api/admin/planets/nominations/route.js` — fire-and-forget `writeNotification` to accepted account (`planet_accepted` type); re-reads curator's refreshed Redis session before send  
- `app/notifications/page.js`  
  - `PlanetNominationCard` *(new)* — blue left border; nominator handle, planet name, reason in italics  
  - `PlanetAcceptedCard` *(new)* — KV Gold left border, planet ring icon, "Welcome to \[Planet Name\]\!"  
  - Both wired into `notifications.map` render switch (previously hit `return null`)

**Bug fixes:**

- `app/api/admin/planets/nominations/route.js` — GET was returning `{ ...profile }` without `nominatedDid` explicitly set; added `nominatedDid` to returned object so `nom.nominatedDid` resolves correctly on Decline  
- `app/api/admin/auth/route.js` — `isCurator` was always `false` when `KEVARA_CURATOR_DID` env var was unset, blocking the entire planet management panel. If `KEVARA_CURATOR_DID` is not set, any authenticated admin is now treated as curator. Requires sign-out and sign back in to take effect.
---
02 Jun 2026

## Phase 4 Strategy Review — Recruiter Marketplace Convergence

**Strategic decisions recorded:**

* Recruiter GTM model shifted from subscription-first to credits-at-point-of-contact.
  Rationale: subscription model requires critical recruiter mass before generating
  revenue; credits model monetizes at the moment of highest intent and works at any
  scale. Browse is free, outreach costs a credit.
* Credit pack structure: 5 for $25 / 20 for $75 / 50 for $150. Volume buyers
  convert to subscription (prepaid credits at discount).
* Recruiter billing is a standalone Stripe product — not entangled with Sovereign
  Pro subscription logic.
* `kevara-recruiter` Ozone label retained as optional identity signal, not an
  access gate. Self-serve signup, buy credits, go.
* Redis key: `recruiter:credits:{did}` — deducted on outreach send, prompts
  purchase if zero.

## Credential Verification & Trust Architecture

**New lexicon: `is.kevara.credential`**

* Stored on user's own PDS. Fields: credentialType (degree / diploma / certificate
  / licence / badge / membership / course), institutionName, title, fieldOfStudy,
  issuedYear, issuedMonth, expiresYear, credentialId, credentialUrl, verificationStatus,
  documentBlobs (max 3, user PDS blobs only), positionRef (AT-URI), visibility
  (public / orbit-only / hidden), createdAt, updatedAt.
* verificationStatus is always computed server-side, never trusted from client:
  unverified → peer-confirmed → document-on-file → electronically-verified.
* documentBlobs stored exclusively on user's PDS via com.atproto.repo.uploadBlob.
  Never on Kevara infrastructure.
* File: lib/lexicons/is.kevara.credential.json

**New helper: `lib/credentialVerifier.js`**

* verifyCredentialUrl(url) — fetches credential URL with 5s timeout, detects
  Open Badges v2/v3 and W3C VC endpoints, falls back to URL-reachable check.
  Never throws. Redis cache at credverify:{urlHash} with 24h TTL.

**New API: `app/api/credentials/route.js`** (GET / POST / PUT / DELETE)

* GET: lists user's credentials sorted by issuedYear desc.
* POST: creates credential, runs verifyCredentialUrl if URL present, sets
  verificationStatus server-side.
* PUT: updates credential, recomputes verificationStatus (electronically-verified
  > document-on-file > peer-confirmed > unverified).
* DELETE: removes record, busts trust-portfolio Redis cache.
* peer-confirmed check: scans id.sifa.endorsement records for credentialRef
  pointing to this credential's AT-URI. Cached at credential:peers:{did}:{rkey}
  with 10min TTL.

**New API: `app/api/credentials/upload/route.js`**

* Accepts multipart/form-data (file + rkey). Validates MIME type server-side
  (jpeg/png/webp/pdf only, 5MB max). Uploads to user's PDS via XRPC proxy.
  Appends blob ref to documentBlobs (max 3). Recomputes verificationStatus.

**CredentialsSection added to `components/ResumeHub.js`**

* Owner view: add/edit/delete credential form, file attach button (Pro-gated
  for document upload and electronic verification), verification status badge.
* Visitor view: read-only cards. orbit-only credentials gated by
  id.sifa.graph.follow check. hidden credentials never rendered.
* Verification status badge tiers: unverified (grey) / peer-confirmed (Aero Blue)
  / document-on-file (Aero Blue + paperclip) / electronically-verified (KV Gold).
  KV Gold reserved for electronically-verified only.

## Sifa Partnership — Endorsement Schema Proposal

**Decision: layer on top of Sifa, not around it.**

* Do not fork or silently extend id.sifa.endorsement.
* Propose two optional backward-compatible fields to Gui at singi-labs/sifa-lexicons:
  - positionRef (string, at-uri): links endorsement to a specific id.sifa.position record
  - credentialRef (string, at-uri): links endorsement to an education/credential record
* Both optional. Zero breaking change to existing Sifa implementations.
* PR branch name: feat/endorsement-context-refs
* Commit style: Conventional Commits (feat:, fix:, docs:)
* Draft message to Gui prepared. Send before opening PR.

**Endorsement proximity weighting (AppView compute, no schema change):**

* When rendering id.sifa.endorsement records, cross-reference endorser's
  id.sifa.position records against subject's id.sifa.position records.
* Org name + date range overlap → flag as "colleague endorsement" → elevated
  weight tier in display.
* Cached at trust:proximity:{endorserDid}:{subjectDid} with 24h TTL.
* Build AFTER Trust Portfolio surface is complete — weighting needs a surface
  to render into.

**CLAUDE.md flag:** writeEndorsement() in lib/sifa.js currently writes to
id.sifa.endorsement without positionRef/credentialRef. Once Gui merges the
proposal, update the write path to accept and pass these optional fields when
endorsement is contextualised to a role or credential.

## Trust Portfolio Surface

**Strategic decisions:**

* Placement: above the resume/career section on the public Embassy profile.
  Renders immediately after the banner card, before SifaCTA and ResumeHub.
* Visibility model (Option C — tiered):
  - Verification status + tier badge: fully public
  - Credential cards (title, institution, status): fully public
  - Skill endorsement summary (top skills + counts): fully public
  - Endorser identities (who endorsed): logged-in users only
  - Credibility score number: owner only, fetched separately, never in API response
  - orbit-only credentials: orbit members only (id.sifa.graph.follow check)
  - hidden credentials: never rendered for visitors
* Credibility display: tier label only for visitors (Authority / Expert /
  Professional / Verified). Numeric score shown to owner only below tier pill.
* Pro gating: viewing Trust Portfolio is free. Owner improvement nudges are
  Pro-gated. Document upload and electronic verification already Pro-gated in
  credential API.

**New API: `app/api/trust-portfolio/[handle]/route.js`**

* Single aggregated GET — resolves DID, parallel fetches labels + credentials +
  endorsement summary + credibility composite.
* fetchPublicEndorsementSummary() returns topSkills (max 6, sorted by count desc)
  with totalCount and verifiedCount per skill. Endorser DIDs/handles never
  included in unauthenticated response.
* Authenticated requests additionally resolve endorser handles + avatars (max 3
  per skill) into endorsersBySkill.
* documentBlobs array never included in any API response.
* credibility.score always null from this endpoint.
* Cache: Redis trust-portfolio:{did} with 5min TTL.
* Cache busted on credential POST / PUT / DELETE.

**New component: `components/TrustPortfolio.js`**

* 2-column grid desktop, single column mobile (breakpoint 640px).
* Left column: Verification badge + Credibility tier pill. Owner sees numeric
  score in small muted text below pill. Tier colours: authority = KV Gold,
  expert/professional = Aero Blue, verified = muted.
* Right column: up to 3 credential cards sorted by trust tier desc. "+ N more"
  expand link if more exist.
* Bottom row (full width): skill endorsement pills, max 6. Each pill: skill name,
  count badge, KV Gold dot if verifiedCount > 0. Avatar stack (max 3) for
  logged-in viewers only. Logged-out visitors see lock icon + "Sign in to see
  who endorsed" soft gate.
* Owner Pro nudges: one nudge shown at a time — no credentials / unverified URL
  credentials / zero endorsements, in that priority order.
* Skeleton loader: layout-stable shimmer, no spinner, no content shift on load.
* Trust Portfolio fetch is independent of profile banner render — banner loads
  immediately, Trust Portfolio loads async.

**`components/ProfileHub.js` modified:**

* Fetches /api/trust-portfolio/{handle} independently alongside existing fetches.
* Owner also fetches /api/credibility/score separately for ownerScore prop.
* TrustPortfolio rendered after BannerCard, before SifaCTA and ResumeHub.
* SkillsSection in ResumeHub receives showEndorserStack={!isPublicView} to
  prevent avatar stack duplication below the Trust Portfolio on public profiles.
---
### Added
- Verified Accounts section on the Embassy: cryptographically verified external accounts 
  (GitHub, domain, LinkedIn, npm, ORCiD, Mastodon) sourced from the user's own PDS via 
  Keytrace. Visible to all viewers including unauthenticated shadow view.

### Changed
- Credibility score now incorporates verified Keytrace identity claims. 
  Verified domain, LinkedIn, GitHub, and npm proofs contribute to Identity 
  Integrity and Professional Completeness scores respectively.

### Changed
- Verification queue now displays verified external accounts (GitHub, domain, 
  LinkedIn, npm, ORCiD, Mastodon) for each pending request, sourced live from 
  the subject's PDS via Keytrace. High-confidence requests are flagged 
  automatically when strong identity anchors are present.
- Verification queue now shows the full submitted evidence including name, 
  organisation, email, and category fields that were previously stored but 
  not displayed.
---


*To update this file: paste it into the Kevara project in Claude, make changes in a session, and ask Claude to append the new entry at the bottom in the same format.*  
