# Architecture Decision Records (ADRs)

Status as of 2026-07-27. Each decision is locked for the quran.com clone project.

---

## ADR-A: Backend data source → **Self-host quran.com-api**

**Context:** quran.com-frontend-next consumes `api.qurancdn.com` behind a signature-auth'd proxy. Public alternatives exist (quran.com public API, Islamic Network, AlQuran Cloud) but each lacks features (qiraat matrix, layered translations, hadith linkage, advanced search).

**Decision:** Self-host the open-source `quran.com-api` backend. We own the database (Quran text, translations, tafsirs, reciter metadata, audio file inventory) and the API surface matches the frontend's expectations exactly — no client rewrites.

**Consequences:**
- Must run Postgres, an Elasticsearch/OpenSearch instance (for full-text search), and a CDN-compatible audio storage layer.
- Initial infra setup: ~3–5 days before any frontend feature that hits the API can be built.
- Operational burden (backups, scaling, security patches) is ours.
- We get feature parity with quran.com (qiraat, layered translations, hadiths, tafsirs, advanced copy).

**Migration path:** If self-hosting proves too heavy, fall back to api.quran.com public endpoints for read-only data and only self-host the user-data tables (bookmarks, notes, collections).

**Why not the alternatives:** Public APIs were rejected because the user explicitly wants full feature parity, and any of them would force dropping `/qiraat`, `/layers`, `/hadith`, or `/answers`.

---

## ADR-B: Authentication → **Firebase (match reference)**

**Context:** Reference uses Firebase for Google + Facebook + Apple OAuth + email magic-link. Alternatives: Auth.js (NextAuth), Supabase, Clerk.

**Decision:** Use Firebase Authentication exactly as the reference does.

**Consequences:**
- Google lock-in (acceptable per user direction).
- Apple Sign-In requires Apple Developer account ($99/yr) — defer until Phase 5.
- Email magic-link via Firebase's `sendSignInLinkToEmail`.
- Profile data (avatar, name) stored in our Postgres keyed by Firebase UID.
- Refresh-token flow uses `refresh-fetch` exactly like `src/lib/firebase.ts` in reference.

**Migration path:** If Firebase becomes a blocker (cost, privacy regulation), Auth.js can replace it without breaking the rest of the stack — the frontend only depends on a `useSession()`-shaped hook.

---

## ADR-C: CMS → **Sanity**

**Context:** Reference uses Sanity (`@sanity/client`, `groq`) for learning plans, product updates, and marketing content. Alternatives: MDX in repo, Payload CMS, no CMS.

**Decision:** Use Sanity, matching the reference.

**Consequences:**
- Free tier covers development and modest traffic.
- Need to define Sanity schemas for: `learningPlan`, `lesson`, `productUpdate`, `marketingPage`, `ramadanContent`.
- Lokalise handles UI string translation; Sanity handles authored content translation (per-document `locale` field pattern).
- Image pipeline via `@sanity/image-url`.

**Migration path:** Sanity Studio project can be exported to JSON and re-imported into Payload if we ever outgrow it.

---

## ADR-D: Font strategy → **All 604 Hafs v4 COLRv1 fonts**

**Context:** quran.com uses 604 individual `.woff` font files (`p1.woff`–`p604.woff`), one per Quran page, in COLRv1 format with embedded tajweed color palettes. This is the most visually distinctive feature. License status unknown.

**Decision:** Mirror all 604 fonts to our own CDN. Verify license redistributability first.

**Consequences:**
- ~50–200MB total font payload (varies by compression).
- Font loading strategy: load `p{N}.woff` on demand based on the current page being viewed; precache adjacent pages.
- Tajweed color palettes (`src/components/Verse/TajweedFontPalettes.tsx` in reference) must be ported.
- Per-page layout fidelity — the visual breaks and line counts match the printed Madani Mushaf.

**License action item:** Before deploying, contact quran.com maintainers or check `public/fonts/quran/hafs/v4/LICENSE*` in the reference repo. If redistribution is forbidden, fall back to a single UthmanicHafs font for v1.0 and revisit later.

**Migration path:** If license blocks us, the same component API supports swapping to a single-font strategy without breaking the reader UI.

---

## ADR-E: Styling → **SCSS + CSS variables**

**Context:** Reference uses Sass + postcss + stylelint with `stylelint-use-logical` for RTL, exposing 120+ CSS custom properties per theme (`light`/`dark`/`sepia`). Alternatives: Tailwind, CSS Modules, vanilla-extract.

**Decision:** Use SCSS + CSS variables, matching the reference architecture.

**Consequences:**
- Direct port of `src/styles/themes/{_light,_dark,_sepia}.scss` — 360 design tokens ready to use.
- Theme switching via `[data-theme="..."]` attribute on `<body>` driven by Redux.
- RTL via logical properties (`margin-inline-start`, `padding-block-end`, etc.) — enforced by `stylelint-use-logical`.
- More boilerplate than Tailwind, but the design system is already proven at scale.
- Storybook integration with `storybook-addon-rtl` for RTL component testing.

**Migration path:** If a future team prefers Tailwind, the CSS variables can be exposed as Tailwind theme tokens without a rewrite — components would migrate one at a time.

---

## ADR-F: Audio CDN → **Self-mirror (start local/free, migrate to S3 later)**

**Context:** Reference uses `audio.qurancdn.com` and `download.quranicaudio.com`. Public alternatives: EveryAyah, Islamic Network CDN. User decision: self-host, starting cheap.

**Decision:** Self-mirror audio files. Phase 1–4: store on disk (`/public/audio/` or a separate media directory) and serve via Next.js or a small static file server. Phase 5+: migrate to S3 + CloudFront when bandwidth or reliability demands it.

**Consequences:**
- Need to write a fetch script that downloads all reciter audio from public sources (EveryAyah, Islamic Network) into our storage.
- Storage budget: full Quran per reciter × ~100 reciters = potentially 500GB+. We'll start with 5–10 popular reciters and expand.
- Need a CDN-style URL pattern from day 1 (`https://audio.{our-domain}/{reciterId}/{chapterId}.mp3`) so the migration to S3 is a DNS/route change, not a code change.
- Range request support is required for seek/scrubbing — Next.js static serving handles this, but verify.

**Migration path:** When S3 is added:
1. Upload `/public/audio/` to S3 bucket.
2. Set up CloudFront distribution with range request support.
3. Update `NEXT_PUBLIC_AUDIO_CDN_BASE` env var.
4. No frontend code changes.

---

## Summary table

| Decision | Choice | Fidelity | Ops burden |
|---|---|---|---|
| A. Backend | Self-host quran.com-api | 100% | High |
| B. Auth | Firebase | 100% | Low |
| C. CMS | Sanity | 100% | Low |
| D. Fonts | All 604 COLRv1 v4 fonts | 100% | Medium (license check) |
| E. Styling | SCSS + CSS variables | 100% | Low |
| F. Audio CDN | Self-mirror → S3 | 100% | Medium → High |

**Theme:** Maximum fidelity to quran.com. Self-hosted infrastructure where it matters. Operational burden is accepted as the cost of parity.
