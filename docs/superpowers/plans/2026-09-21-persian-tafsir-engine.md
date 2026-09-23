# Persian Quran Tafsir Engine & Mobile Download Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build authentic sovereign backend Tafsir API endpoints, structure the authentic Persian
Quran Tafsir datasets (_Tafsir Nemouneh_ & _Tafsir Noor_), and implement mobile on-demand SQLite
download management with frequent-user offline nudging.

**Architecture:**

1. Backend: Implement Quran.com-compatible endpoint
   `GET /api/proxy/content/api/qdc/tafsirs/:tafsirId/by_ayah/:verseKey` in
   `src/utils/localDataEngine.ts` backed by authentic Persian Tafsir datasets.
2. Ingestion: Ingest and bundle full authentic Persian Tafsirs into both JSON chunks and
   downloadable SQLite packages.
3. Mobile: Implement `tafsirDownloadService.ts` to manage on-demand SQLite downloads with progress
   tracking and persistent storage in `FileSystem.documentDirectory`.
4. Mobile Insights & UI: Update `ayahInsightsService.ts` to smartly resolve Tafsir from local
   downloaded SQLite DB -> local cache -> backend API. Add download management in `settings.tsx` and
   frequent-user offline nudge banner in `TafsirTabContent.tsx`.

**Tech Stack:** Next.js API Routes, TypeScript, SQLite (`expo-sqlite`, `node:sqlite`),
`expo-file-system`, React Native, Zustand.

## Global Constraints

- Every single API must exist on our side; zero reliance on external quran.com or third-party
  servers.
- Sacred scripture text and scholarly Tafsirs must remain authentic and uncorrupted.
- Mobile initial app bundle must NOT be bloated by default; Tafsir SQLite files are strictly
  downloaded on-demand.
- Touch targets in settings and banners must remain >= 44×44 points.
- Zero test regressions on existing mobile test suites (384 passing).

---

### Task 1: Backend Persian Tafsir Ingestion & Canonical Datasets

**Files:**

- Create: `scripts/ingest-persian-tafsirs.ts`
- Create: `data/qdc/tafsirs/171.json` (Nemouneh)
- Create: `data/qdc/tafsirs/172.json` (Noor)
- Modify: `data/qdc/tafsirs-list.json`
- Test: `tests/unit/tafsir-ingestion.test.ts`

**Interfaces:**

- Consumes: Raw Persian Tafsir verses & points from verified Tanzil/Quran.ir scholarly corpus.
- Produces: `data/qdc/tafsirs/171.json` and `172.json` with lookup mapping by `verse_key`.

- [x] **Step 1: Write the failing test for Persian Tafsir dataset structure**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement ingestion script and register 171 (Nemouneh) & 172 (Noor) in
      `tafsirs-list.json`**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit dataset & ingestion script**

---

### Task 2: Sovereign Backend Tafsir API Endpoint & Download Route

**Files:**

- Modify: `src/utils/localDataEngine.ts`
- Test: `tests/unit/local-data-engine-tafsir.test.ts`

**Interfaces:**

- Consumes: Clean paths `tafsirs/:idOrSlug/by_ayah/:verseKey` and `download/tafsirs/:slug.db`
- Produces: `TafsirContentResponse` matching QuranCDN format.

- [x] **Step 1: Write the failing test for localDataEngine tafsir endpoints**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement `tafsirs/:id/by_ayah/:verseKey` and SQLite package download endpoint in
      `localDataEngine.ts`**
- [x] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Verify via
      `curl http://localhost:3000/api/proxy/content/api/qdc/tafsirs/171/by_ayah/1:1`**
- [x] **Step 6: Commit backend endpoint changes**

---

### Task 3: Mobile Tafsir Download Manager Service & SQLite Storage

**Files:**

- Create: `mobile/src/services/db/tafsirDownloadService.ts`
- Test: `mobile/src/services/db/tafsirDownloadService.test.mjs`

**Interfaces:**

- Consumes: Backend download route, `FileSystem.documentDirectory`, and `expo-sqlite`.
- Produces: `downloadTafsirDatabase(slug, onProgress)`, `isTafsirDownloaded(slug)`,
  `deleteTafsirDatabase(slug)`, `getDownloadedTafsirDb(slug)`.

- [ ] **Step 1: Write the failing test for Tafsir download management**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `tafsirDownloadService.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit mobile download service**

---

### Task 4: Hybrid Tafsir Resolution in `ayahInsightsService.ts`

**Files:**

- Modify: `mobile/src/services/db/ayahInsightsService.ts`
- Test: `mobile/src/components/insights/insightsComponents.test.mjs`

**Interfaces:**

- Consumes: `tafsirDownloadService`, SQLite query, and sovereign backend API fallback with caching.
- Produces: `getTafsirExcerpts(verseKey)` returning real authentic Tafsir excerpts for Nemouneh,
  Noor, and Al-Mizan.

- [ ] **Step 1: Write the failing test for hybrid Tafsir fetching and caching**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement hybrid resolution (Downloaded SQLite -> Local Cache Table -> Sovereign
      API)**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit hybrid resolution changes**

---

### Task 5: Mobile Settings UI: Download Offline Tafsirs Manager

**Files:**

- Modify: `mobile/src/app/(tabs)/settings.tsx`
- Test: `mobile/src/app/(tabs)/settingsTafsir.test.mjs`

**Interfaces:**

- Consumes: `tafsirDownloadService` methods and active download states.
- Produces: UI cards for downloading, tracking progress, and removing offline Tafsirs.

- [ ] **Step 1: Write failing UI test for Settings Tafsir download section**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement «دانلود تفاسیر برای استفاده آفلاین» section with progress bar and delete
      button**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit settings screen updates**

---

### Task 6: Frequent-User Offline Nudge Banner in `TafsirTabContent`

**Files:**

- Modify: `mobile/src/stores/useReadingStore.ts`
- Modify: `mobile/src/components/insights/TafsirTabContent.tsx`
- Test: `mobile/src/components/insights/tafsirFrequentUserBanner.test.mjs`

**Interfaces:**

- Consumes: `tafsirUsageCount`, `isDownloaded`, and banner dismissal state.
- Produces: Elegant dismissible banner with one-tap link to Settings.

- [ ] **Step 1: Write failing test for usage count tracking and banner visibility**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement usage tracker in store and render banner in `TafsirTabContent.tsx`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit frequent-user prompt**

---

### Task 7: Full System Verification & End-to-End Auditing

**Files:**

- Run: Full mobile test suite `yarn --cwd mobile test`
- Run: Mobile typecheck `yarn --cwd mobile typecheck`
- Run: Web test suite `yarn test`
- Verify: Expo bundler port 8081 & Next.js server port 3000

- [ ] **Step 1: Run all test suites and confirm 0 errors**
- [ ] **Step 2: Test live API calls and verify complete authenticity of Persian Tafsir text**
- [ ] **Step 3: Commit final verification**
