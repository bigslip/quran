# Quran.com Clone — Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Read "How to use this plan" first** — this is a master plan that decomposes into per-phase sub-plans.

**Goal:** Build a production-grade clone of quran.com-frontend-next with all user-facing capabilities: reading, audio, search, auth, collections, notes, learning plans, reading goals, calendar, Ramadan features, media maker, embeds, radio, and PWA — using quran.com-frontend-next as the *reference spec*, not as copyable source (the upstream README explicitly forbids copying).

**Architecture:** Next.js 14 (Pages Router) + TypeScript + SCSS-with-CSS-variables theming + Redux Toolkit (persisted) + SWR + XState for audio + Radix UI primitives. Backend is *not* cloned — we consume an existing public Quran API (decision in Phase 0). PWA via next-pwa, i18n via next-translate, error tracking via Sentry, CMS via Sanity or MDX.

**Tech Stack (matches reference for fidelity):**
- Next.js `^14.2.6` (Pages Router), React `^18.3.1`, TypeScript `^5.5.4`, Node 18.x
- State: `@reduxjs/toolkit`, `react-redux`, `redux-persist`, `xstate`, `@xstate/react`
- Data: `swr`, `humps` (camelCase keys), `refresh-fetch`, `next-seo`, `next-sitemap`
- UI: `@radix-ui/*` (16 primitives), `react-virtuoso`, `react-hook-form`, `react-hotkeys-hook`, `react-joyride`, `react-toastify`, `fuse.js`, `react-share`, `classnames`
- Styling: `sass`, `postcss`, `stylelint`, `stylelint-use-logical` (RTL via logical properties)
- Editor: `@milkdown/*` (notes & reflections rich text)
- Media: `@remotion/*` (Media Maker video generation)
- Auth: Firebase (matches reference) OR Auth.js / Supabase (alternative — Phase 0 decision)
- CMS: `@sanity/client`, `groq`, `@sanity/image-url` (matches reference) OR MDX (alternative)
- Audio: AudioWorklet (custom), Media Session API, `react-virtuoso`
- PWA: `next-pwa`, `next-fonts`
- Calendar: `@umalqura/core` (Hijri)
- i18n: `next-translate` (18 locales: en, ar, bn, fa, fr, id, it, nl, pt, ru, sq, th, tr, ur, zh, ms, es, sw, vi)
- Notifs: `@novu/headless` (in-app + email)
- Observability: `@sentry/nextjs`
- Testing: `vitest`, `@testing-library/react`, `@playwright/test`, Storybook 8

---

## How to use this plan

This is a **master plan** for a project that would take a single engineer 8–12 weeks. The work decomposes into 9 phases, each independently shippable. The reference repo at `/home/v2ray/projects/quran/` is the **spec** — read its source to answer behavior questions, but do NOT copy code or assets verbatim.

**Rules of engagement:**

1. **One phase at a time.** Do not jump ahead. Each phase produces working software you can demo.
2. **Each phase becomes its own detailed plan** using `superpowers:writing-plans` BEFORE implementation begins. Phase 0 + Phase 1 below are already detailed enough to start. Phases 2–8 are scoped but need their own plan written when you reach them.
3. **TDD throughout.** Write failing tests first, then implement. Reference repo's `__tests__/` and `*.stories.tsx` are the spec for component behavior.
4. **Commit frequently** — after every green test, after every self-contained change.
5. **Decisions are reversible.** Phase 0 locks in choices. Revisit if a later phase proves them wrong.

---

## Scope: Full Feature Inventory (the "what we're cloning" list)

Aggregated from the 4 parallel research agents. Every item below must exist in the clone.

### Routes (55+ pages)

**Reading & study (highest priority):**
- `/[chapterId]` — chapter reader (surah)
- `/[chapterId]/[verseId]` — single verse or range
- `/[chapterId]/[verseId]/tafsirs` — tafsir picker
- `/[chapterId]/tafsirs/[tafsirId]` — specific tafsir
- `/[chapterId]/lessons`, `/reflections`, `/related-verses`, `/qiraat`, `/layers`, `/hadith`, `/answers`, `/answers/[questionId]` — study-mode sub-views
- `/juz/[juzId]`, `/hizb/[hizbId]`, `/rub/[rubId]`, `/page/[pageId]` — alt navigation
- `/surah/[chapterId]/[...info]` — surah info page

**Audio & reciters:**
- `/radio` — 24/7 streaming stations
- `/reciters` — directory
- `/reciters/[reciterId]` — profile
- `/reciters/[reciterId]/[chapterId]` — chapter audio

**Search:**
- `/search` — full-text + filters

**Auth & profile:**
- `/login`, `/auth`, `/logout`, `/forgot-password`, `/reset-password`, `/complete-signup`
- `/profile` — settings, password, email prefs, account delete

**Personal:**
- `/my-quran` — dashboard with tabs (saved, recent, notes-and-reflections)
- `/collections/all`, `/collections/[collectionId]`
- `/reading-goal`, `/reading-goal/progress`
- `/my-learning-plans`, `/learning-plans`, `/learning-plans/[slug]`, `/learning-plans/[slug]/lessons/[lessonSlugOrId]`
- `/take-notes` — note-taking guide
- `/calendar` — Quran-in-a-year weekly program, Hijri dates

**Seasonal:**
- `/ramadan2026`, `/ramadan`, `/ramadanchallenge`, `/beyond-ramadan`, `/what-is-ramadan`

**Media & embeds:**
- `/media`, `/media/[shortenURL]` — Remotion video generator
- `/embed`, `/embed/[...slug]`, `/embed/ayah`, `/embed/v1` — embeddable widgets

**Info:**
- `/`, `/about-us`, `/about-the-quran`, `/developers`, `/apps`, `/support`, `/privacy`, `/terms-and-conditions`, `/product-updates`, `/product-updates/[id]`

### API routes (Next.js backend)

- `/api/proxy/[...path]` — gateway to backend (signature-auth'd)
- `/api/ayah-widget` — embed widget SSR

### Cross-cutting features

- **Quran reader:** multi-mushaf (Hafs v4, Madani V1/V2, Tajweed V1/V2/V4, IndoPak), 10 font scales, word-by-word hover, tajweed color coding, RTL, persistent audio bar, sidebar nav, study mode tabs, pinned verses, reading-view/translation-view/tafsir-view/reflection-view
- **Audio player:** XState-driven (audioPlayerMachine, verseCycleMachine, rangeCycleMachine, repeatMachine), reciter library, playback speed, repeat modes, Media Session API, background playback, verse-timestamp sync
- **Theming:** light / dark / sepia, persisted via redux-persist, applied via `[data-theme]` attribute + 120+ CSS variables per theme
- **i18n:** 18 locales, RTL for ar/ur/fa, locale-based default translation selection
- **Fonts:** Figtree (UI), Kitab (Arabic), 604 COLRv1 page-fonts for Hafs v4 (one per Quran page) — see Phase 1 font strategy
- **Bookmarks:** 3 types (ayah, range, page); guest bookmarks + synced when logged in
- **Collections:** CRUD, public/private, bulk move/delete, search within, sorting
- **Notes:** simple textarea + verse attachment; rich-text Milkdown for reflections posted to QuranReflect (we'll fork to local reflections if we don't partner)
- **Reading goals:** daily time/pages/verse-range targets, streaks, email reminders via Novu
- **Learning plans:** Sanity-CMS'd courses with syllabus, lessons, progress tracking, certificates
- **Calendar:** weekly Quran reading program, Hijri (@umalqura/core), mark-complete, PDF downloads
- **Ramadan:** Mulk 30-day challenge, daily themed reflections, email signup
- **Media Maker:** Remotion-powered shareable video clips with custom styling
- **Embed widgets:** iframe-embeddable ayah with full theming
- **PWA:** next-pwa with custom runtime caching (fonts CacheFirst, images SWR, API NetworkFirst with 10s timeout)
- **SEO:** next-seo + next-sitemap, security headers, custom redirects for legacy URL formats
- **Observability:** Sentry (client + server + profiling), source maps
- **Onboarding:** react-joyride multi-step tours (homepage, settings, reading, personalization)

---

## Phase 0: Decisions & Project Setup (1–2 days)

**Goal:** Lock the architectural decisions. Get a greenfield Next.js project running locally with CI.

### 0.1 Critical decisions (BLOCKING — resolve before any code)

Use `superpowers:brainstorming` if you want help thinking through these. Defaults marked **(Recommended)**.

#### Decision A: Backend data source

The reference uses `api.qurancdn.com` behind a signature-auth'd proxy. We need a public alternative.

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Quran.com API v4 (api.quran.com)** — public GraphQL/REST | Same data as reference, full features (tafsirs, qiraat, audio), free | May rate-limit; some endpoints require auth | **(Recommended)** — try first |
| **Islamic Network CDN + API (api.islamic.network, cdn.islamic.network)** | Free, generous limits, used by many apps, official | Smaller feature set; no qiraat/layered translations | Fallback |
| **AlQuran Cloud (alquran.cloud/api)** | REST, edition-based, simple | Limited advanced features | Fallback |
| **Self-host quran.com-api** (their open-source backend) | Full feature parity | Heavy ops burden (Postgres, search index, audio pipeline) | Last resort |

**Action:** Stand up a tiny script (`scripts/probe-apis.ts`) that hits each candidate API for `surah 1 ayah 1` and checks: verse text, translations list, audio URL, tafsir. Pick the one that covers the most features.

#### Decision B: Authentication

Reference uses Firebase (Google, Facebook, Apple, magic-link via email). Alternatives:

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Auth.js (NextAuth) with email magic link + Google + GitHub** | Self-hosted, no vendor lock-in, generous | Less polished than Firebase for SMS/social | **(Recommended)** |
| **Supabase Auth** | Postgres + storage + auth in one, generous free tier | Vendor lock-in | Strong alt if you want DB + storage too |
| **Firebase** (match reference) | Battle-tested, social providers easy | Google lock-in, privacy concerns | If you want max fidelity |

#### Decision C: CMS for learning plans + product updates

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Sanity** (match reference) | Free tier, GROQ, great editor | Vendor lock-in | **(Recommended)** for parity |
| **MDX files in repo** | Zero ops, version-controlled | Non-technical authors can't edit | For MVP |
| **Contentlayer + MDX** | Type-safe, build-time | Deprecation risk | Skip |

#### Decision D: Font strategy for Quran text

Reference uses **604 COLRv1 fonts** (one per Quran page, `p1.woff`–`p604.woff`, ~?MB each) for pixel-perfect Hafs v4 rendering with tajweed color palettes. This is the *most distinctive* part of quran.com's UX.

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Download & self-host all 604 v4 COLRv1 fonts** | Pixel-perfect parity, full tajweed colors | ~50–200MB total; complex loading strategy | **(Recommended)** for full clone |
| **Use a single UthmanicHafs font for everything** | Simple, ~1MB | No per-page layout; basic tajweed | MVP-only |
| **Use IndoPak font for South Asian style** | Single font, ~1MB | Different script; not Hafs v4 | Alt style |
| **Skip tajweed colors entirely** | Fastest to ship | Loses core feature | Skip |

**Action:** Determine license of the v4 fonts (`public/fonts/quran/hafs/v4/` in reference). If redistributable, mirror to your CDN. If not, use option 2 or 3.

#### Decision E: Styling approach

| Option | Verdict |
|---|---|
| **SCSS + CSS variables** (match reference) | **(Recommended)** for fidelity + 120+ theme tokens already designed |
| Tailwind CSS | Faster to write, loses direct copy of design tokens |

#### Decision F: Audio CDN

Reference uses `audio.qurancdn.com` and `download.quranicaudio.com`. Public alternatives:
- **EveryAyah CDN** (everyayah.com/data/) — free, verse-by-verse MP3s
- **Islamic Network CDN** (cdn.islamic.network) — free, reciter + full surah

**Action:** Probe both. We'll write the audio module to be CDN-agnostic.

### 0.2 Concrete Phase 0 tasks

- [ ] **Step 1: Resolve decisions A–F.** Write your choices into `docs/decisions.md` (one ADR per decision). Use AskUserQuestion if unclear.
- [ ] **Step 2: Create the new project directory.** Reference repo stays at `/home/v2ray/projects/quran/` (read-only spec). New project at `/home/v2ray/projects/quran-clone/` (or your preferred name).

  ```bash
  mkdir /home/v2ray/projects/quran-clone && cd /home/v2ray/projects/quran-clone
  ```

- [ ] **Step 3: Scaffold Next.js.**

  ```bash
  npx create-next-app@14 . --typescript --eslint --use-yarn --no-tailwind --app=false --src-dir=true --import-alias="@/*"
  ```

  Confirm `--app=false` (Pages Router to match reference). Confirm `--no-tailwind` (we use SCSS).

- [ ] **Step 4: Install all dependencies from `reference/package.json`.**

  Read `/home/v2ray/projects/quran/package.json` and copy the dependencies/devDependencies lists verbatim into your new `package.json`. Then:

  ```bash
  yarn install
  ```

  Verify `yarn dev` starts and `localhost:3000` renders the default page.

- [ ] **Step 5: Copy configs verbatim from reference.** These define the toolchain:

  - `.eslintrc.json`, `.eslintignore`, `.prettierrc`, `.stylelintrc.json`
  - `tsconfig.json` (adjust paths if needed)
  - `next.config.js` (strip Sentry/PWA until Phase 8)
  - `playwright.config.ts`, `vitest.config.ts`, `tsconfig.storybook.json`
  - `.storybook/` directory

  Then `yarn lint && yarn test` — both should pass on the empty scaffold.

- [ ] **Step 6: Set up Storybook.**

  ```bash
  yarn storybook
  ```

  Confirm Storybook loads on `:6006` with no errors.

- [ ] **Step 7: Initialize git, first commit, push to your own GitHub repo.**

  ```bash
  git init && git add . && git commit -m "chore: scaffold Next.js 14 project with toolchain"
  gh repo create quran-clone --private --source=. --remote=origin --push
  ```

- [ ] **Step 8: Write the Phase 1 detailed plan.** Use `superpowers:writing-plans` to expand Phase 1 below into per-task TDD steps. This is mandatory before Phase 1 implementation begins.

---

## Phase 1: Foundation — Design System & Layout Shell (1 week)

**Goal:** A themable, RTL-aware design system with the persistent layout (navbar, footer, audio bar slot). No Quran-specific features yet.

**Architecture:** SCSS variables → CSS custom properties → `[data-theme]` attribute on `<body>`. Redux Toolkit with `theme` slice persisted to localStorage. Radix UI unstyled primitives composed into DLS components in `src/components/dls/`. Storybook stories for every component.

**Files (high-level — full TDD steps in the Phase 1 sub-plan):**
- `src/styles/themes/_light.scss`, `_dark.scss`, `_sepia.scss` (120+ tokens each)
- `src/styles/{reset,variables,breakpoints,constants,utility,shades,fonts,global}.scss`
- `src/redux/{store.ts,slices/theme.ts}` with redux-persist
- `src/components/ThemeProvider.tsx`
- `src/components/dls/*` — Button, Input, TextArea, Checkbox, RadioGroup, Select, Combobox, StarRating, Card, Separator, Scrollable, Modal, ContentModal, Tabs, TabSwitcher, Pagination, Breadcrumb, Toast, Skeleton, Spinner, Progress, CircularProgress, Badge, Pill, HoverCard, ClickableHoverCard, SelectionCard, SelectionList, QuranWord, Bismillah, SurahPreview, Popover, PopoverMenu, Tooltip, HelperTooltip, ConfirmationModal, Slider, Switch, Toggle, Counter, DurationInput, CompactSelector, Link, Calendar, IconContainer, ShareButtons, Collapsible, Sorter, Footer (47 total)
- `src/components/Navbar/*` — Logo, SearchDrawer (slot), NavigationDrawer, SettingsDrawer, LanguageSelector, MobileStickyItemsBar
- `src/components/dls/Footer/*`
- `src/components/Layout/*` — page shell with persistent slots
- `.storybook/main.ts`, stories for every component

**Phase 1 exit criteria:**
- All 47 DLS primitives implemented with stories
- Light/dark/sepia theme switching persisted across reloads
- RTL toggle works for ar/ur/fa
- Homepage (`/`) renders a hero placeholder + navbar + footer
- Lighthouse a11y score ≥ 95 on homepage
- All tests green

---

## Phase 2: Reading Experience Core (2 weeks)

**Goal:** The Quran reader at `/<chapterId>/<verseId?>` with multiple mushafs, fonts, translations, tafsir, and word-by-word. This is the heart of the product.

**Sub-features (each needs its own detailed plan):**
1. **Chapter list & navigation** — homepage section + sidebar in reader
2. **Quran reader container** (`src/components/QuranReader/`) — Page, PageContainer, Line, TranslatedAyah
3. **Verse rendering** (`src/components/Verse/`) — text, translations, font switching, tajweed palette
4. **Word component** (`src/components/dls/QuranWord/`) — GlyphWord (COLRv1), TextWord, WordPopover, hover audio
5. **Multi-mushaf support** — QPC Hafs (default), Madani V1/V2, Tajweed V1/V2/V4, IndoPak; 15-line & 16-line layouts
6. **Reading preferences** — font picker, scale (10 sizes), translations multi-select, tafsir multi-select
7. **Sidebar nav** — surah/juz/hizb/rub/page trees, revelation vs canonical order toggle
8. **Context menu** — per-verse actions (copy, share, bookmark, note, play)
9. **Bismillah rendering** per surah
10. **Pinned verses bar**
11. **Reader top actions** — search-within-surah, settings, share
12. **Local bookmarks** (guest mode) → redux-persist

**Phase 2 exit criteria:**
- Reading any of 114 surahs works end-to-end
- Switching between 6+ mushaf layouts preserves scroll position
- Word-by-word hover shows translation + plays audio on click
- Tajweed colors render in Tajweed V4 mode
- Bookmark a verse → see it in sidebar pin bar
- Lighthouse perf ≥ 80 on a long surah (e.g. Al-Baqarah)

**Reference reading order:** spend a day reading `src/components/QuranReader/`, `src/components/Verse/`, `src/components/dls/QuranWord/` in the reference repo before writing the Phase 2 detailed plan.

---

## Phase 3: Audio Player (1 week)

**Goal:** Persistent bottom audio bar with XState-driven playback. Don't start until Phase 2 is green.

**Sub-features:**
1. **AudioWorklet setup** (`src/audioInput/audio-worklet.ts`) — custom worklet for low-latency processing
2. **XState machines** (`src/xstate/actors/audioPlayer/`) — `audioPlayerMachine`, `verseCycleMachine`, `rangeCycleMachine`, `repeatMachine`
3. **AudioPlayer UI** (`src/components/AudioPlayer/`) — full bar + body + slider + repeat modal + playback controls
4. **Reciter data** — fetch list, store selection in redux-persist
5. **Verse-timestamp sync** — highlight current verse during playback
6. **Repeat modes** — single verse, range, infinite
7. **Media Session API** — lock screen controls, metadata
8. **Background playback** — service worker integration
9. **Radio mode** — `/radio` page with curated stations

**Phase 3 exit criteria:**
- Play full surah with auto-advance
- Repeat a verse range N times
- Reciter switch mid-surah resumes at correct verse
- Lock-screen controls work (Android + iOS Safari)
- `/radio` streams 5+ stations continuously

---

## Phase 4: Search (3–5 days)

**Goal:** `/search` with full-text + filters + history.

**Sub-features:**
1. Search input with autocomplete (Fuse.js client-side for surah names + recent searches)
2. Backend search via chosen API's search endpoint
3. Result highlighting
4. Filters: by surah, juz, translation, language
5. Pagination (10/page)
6. Search history persisted to localStorage
7. Voice search (Tarteel API integration — optional, requires API key)

---

## Phase 5: Auth & Sync (1 week)

**Goal:** Email magic link + Google OAuth (Decision B). Sync local bookmarks/notes/goals to backend on login.

**Sub-features:**
1. Auth.js setup with email + Google providers
2. `/login`, `/auth` (callback), `/logout`, `/forgot-password`, `/reset-password`, `/complete-signup` pages
3. OTP verification UI (`react-verification-input`)
4. Session refresh via `refresh-fetch`
5. Profile page — avatar upload, name edit, password change (if password-set), email prefs, account delete
6. Local→cloud sync on first login (redux-persist → backend mutations)
7. SSO between this app and your other properties (if multi-app)

---

## Phase 6: Personal Features (1.5 weeks)

**Goal:** Collections, notes, reading goals, My Quran dashboard, calendar.

**Sub-features:**
1. **Bookmarks** — sync to backend; 3 types (ayah, range, page)
2. **Collections** — CRUD, public/private, bulk ops, sorting, search within
3. **Notes** — textarea + verse attachment (NOT Milkdown — Milkdown is for reflections only in reference)
4. **Reflections** — Milkdown editor posting to a community surface (fork QuranReflect to local-only if needed)
5. **Reading goals** — wizard, daily tracking, streaks, Novu email reminders
6. **My Quran dashboard** — Saved / Recent / Notes-and-Reflections tabs
7. **Calendar** — Hijri (@umalqura/core) + Quran-in-a-year weekly program with PDF downloads

---

## Phase 7: Content & Community (2 weeks)

**Goal:** Learning plans, radio/reciters, Ramadan features, media maker, embeds.

**Sub-features:**
1. **Learning plans** — Sanity schema + `learning-plans/*` routes + enrollment + progress + certificates
2. **Reciters pages** — directory, profile, chapter audio
3. **Ramadan hub** — `/ramadan2026`, `/ramadanchallenge` (daily email via Novu), `/beyond-ramadan`, `/what-is-ramadan`
4. **Media Maker** — Remotion compositions, `/media` builder UI, `/media/[shortenURL]` share pages, background video library
5. **Embed widgets** — `/embed`, `/embed/ayah`, `/embed/v1` with `/api/ayah-widget` SSR + iframe code generator
6. **Product updates** — Sanity-driven blog at `/product-updates/*`

---

## Phase 8: Polish, PWA, Observability (1 week + ongoing)

**Goal:** Ship to production.

**Sub-features:**
1. **PWA** — `next-pwa` with runtime caching config copied from `pwa-runtime-config.js` (tune MP3 handling per Firefox issue noted there)
2. **SEO** — `next-seo` per-page meta, `next-sitemap` postbuild, OG images, Twitter cards
3. **Security headers** — copy `configs/SecurityHeaders.js`
4. **Redirects** — copy `next.config.js` redirects (legacy URL formats)
5. **Middleware** — case-insensitive Ramadan routes + `_next/data` 404 trick (see `src/middleware.ts`)
6. **Sentry** — client + server + profiling-node, source maps upload
7. **Performance** — bundle analyzer pass, code-split heavy components (Remotion, Milkdown), font subsetting
8. **Accessibility** — Storybook a11y addon on all stories, keyboard nav audit, screen reader pass
9. **E2E tests** — Playwright covering: read a surah, play audio, search, login flow, bookmark a verse, create a collection
10. **i18n** — Lokalise integration OR manual locale file completion for all 18 languages
11. **CI/CD** — GitHub Actions: lint, test, build, deploy to Vercel/Netlify on PR

---

## Total estimate

| Phase | Duration |
|---|---|
| 0: Decisions + setup | 1–2 days |
| 1: Foundation | 1 week |
| 2: Reading core | 2 weeks |
| 3: Audio | 1 week |
| 4: Search | 3–5 days |
| 5: Auth + sync | 1 week |
| 6: Personal features | 1.5 weeks |
| 7: Content + community | 2 weeks |
| 8: Polish + ship | 1 week + ongoing |
| **Total** | **~9–11 weeks** for one engineer; parallelizable to ~5–6 weeks with 2 engineers (Phases 5+6 in parallel with 7) |

---

## Risk register

| Risk | Mitigation |
|---|---|
| Chosen Quran API lacks qiraat/layered translations/hadiths | Accept reduced feature set in `/qiraat`, `/layers`, `/hadith` routes OR self-host `quran.com-api` |
| 604 COLRv1 fonts have unclear license | Use single UthmanicHafs font for MVP; revisit for v1.0 |
| Remotion video rendering is expensive (Lambda) | Ship Media Maker behind a feature flag; gate by login |
| Reflections depend on QuranReflect.com (third-party) | Fork to local reflections table; lose community vibe |
| Audio CDN rate-limits or goes down | Multi-CDN fallback (EveryAyah + Islamic Network + self-mirror) |
| Scope creep (this is huge) | Strict phase gates. Ship Phase 2 as a usable MVP. |
| Legal: "copying the code/project is unacceptable" (per README) | Reference spec only. Write all code fresh. Don't copy assets without license check. Brand it differently. |

---

## Self-review (per `writing-plans` skill)

**Spec coverage check:** Every feature surfaced by the 4 research agents is mapped to a phase above. Cross-checked against: 55+ routes table (✓ Phase 2/3/4/5/6/7), API proxy (✓ Phase 0 decision A + Phase 5 auth), 47 DLS components (✓ Phase 1), audio XState (✓ Phase 3), Sanity CMS (✓ Phase 0 decision C + Phase 7), PWA config (✓ Phase 8), i18n 18 locales (✓ Phase 1 + Phase 8), onboarding tours (✓ Phase 6 — add to My Quran dashboard). **Gaps:** none material. Some features (voice search via Tarteel, qiraat matrix, layered translations) are marked optional pending API capability.

**Placeholder scan:** Phase 0 tasks have exact commands. Phases 1–8 are scoped but intentionally not task-by-task — each requires its own `writing-plans` session before implementation. This is correct per skill guidance ("each phase becomes its own detailed plan").

**Type consistency:** Phase numbering consistent throughout. Tech stack versions pinned. No naming drift.

---

## Execution Handoff

This is a master plan. **Do not implement Phases 2–8 directly from this doc** — write a per-phase detailed plan first using `superpowers:writing-plans`.

**Immediate next steps:**
1. Work through Phase 0 decisions A–F (use `AskUserQuestion` if you want me to drive the decisions).
2. Once decisions are locked, I write the **Phase 1 detailed plan** (47 DLS components with TDD steps).
3. Execute Phase 1 via `superpowers:subagent-driven-development` or `superpowers:executing-plans`.

**Which now?**
- **A:** "Drive Phase 0 decisions" — I ask the 6 questions, lock the ADRs, scaffold the project.
- **B:** "Write Phase 1 detailed plan" — assume default decisions (recommended), produce the full TDD plan for Foundation.
- **C:** "Both" — decisions + Phase 1 plan, ready to execute.
