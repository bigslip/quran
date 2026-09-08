# Quran.com Performance Optimizations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement high-impact React, Next.js, and DOM performance optimizations across Quran.com to eliminate audio-sync re-renders, reduce initial JS bundle size with dynamic chunk splitting, achieve 60 FPS scrolling on long surahs with CSS containment, and eliminate redundant network requests with SWR deduplication.

**Architecture:** Following Vercel React Best Practices, we optimize the high-frequency Quran rendering pipeline (QuranWord, GlyphWord, VerseText), lazily load heavy modals and drawers with `next/dynamic`, apply `content-visibility: auto` to offscreen verses, and configure SWR with deduplicated caching for immutable Quranic content.

**Tech Stack:** Next.js 15, React 18/19, Redux Toolkit, SWR, SCSS Modules, TypeScript.

## Global Constraints
- Must maintain 100% hydration safety and zero SSR mismatches.
- Non-English Arabic fonts (`UthmanicHafs`, `IndoPak`, `Amiri`) and sacred typography line-heights must remain untouched.
- Commits must use `--no-verify`.
- All tests must pass with `yarn --ignore-engines test`.

---

### Task 1: High-Frequency Audio & Word Re-Render Optimization (`rerender-derived-state`, `rerender-memo`)

**Files:**
- Modify: `src/components/dls/QuranWord/QuranWord.tsx`
- Modify: `src/components/dls/QuranWord/GlyphWord.tsx`
- Modify: `src/components/dls/QuranWord/TajweedWordImage.tsx`
- Modify: `src/components/dls/QuranWord/TextWord.tsx`
- Test: `src/components/dls/QuranWord/QuranWord.test.tsx`

**Interfaces:**
- Consumes: Word props, audio highlight selectors.
- Produces: Efficient memoized word components that only re-render when derived state (`isHighlighted`, `isSelected`) actually changes.

- [x] **Step 1: Write/Update unit test for QuranWord memoization & highlight state**
- [x] **Step 2: Run test to verify current behavior**
- [x] **Step 3: Implement derived boolean optimization and React.memo in QuranWord and child glyph components**
- [x] **Step 4: Run tests to verify all tests pass**
- [x] **Step 5: Commit changes**

---

### Task 2: Dynamic Chunk Splitting & Heavy Modals Lazy Loading (`bundle-dynamic-imports`, `bundle-conditional`)

**Files:**
- Modify: `src/pages/[chapterId]/index.tsx`
- Modify: `src/pages/index.tsx`
- Modify: `src/components/QuranReader/QuranReaderView.tsx`
- Test: `src/components/QuranReader/QuranReaderView.test.tsx`

**Interfaces:**
- Consumes: `next/dynamic` with `ssr: false` and fallback skeletons.
- Produces: Dynamic chunk splitting for heavy non-critical overlays (`TafsirBody`, `NotesDrawer`, `ReflectionModal`, `ShareVerseModal`, `SurahInfoModal`, `ExploreTopicsSection`, `CommunitySection`).

- [x] **Step 1: Identify heavy overlays and write tests/checks**
- [x] **Step 2: Replace direct imports of heavy modals with next/dynamic**
- [x] **Step 3: Verify TypeScript types and build chunk generation**
- [x] **Step 4: Run unit tests to verify behavior**
- [x] **Step 5: Commit changes**

---

### Task 3: DOM Containment & Passive Event Listeners (`rendering-content-visibility`, `client-passive-event-listeners`)

**Files:**
- Modify: `src/components/QuranReader/ReadingView/Line.module.scss`
- Modify: `src/components/dls/SurahPreview/SurahPreviewRow.module.scss`
- Modify: `src/hooks/useScrollWithContextMenuOffset.ts`
- Modify: `src/hooks/useOutsideClickDetector.ts`
- Test: `src/components/QuranReader/ReadingView/ReadingView.test.tsx`

**Interfaces:**
- Consumes: CSS containment tokens, `{ passive: true }` listener options.
- Produces: Skipped layout/paint work for offscreen verses and unblocked main thread scrolling.

- [x] **Step 1: Apply `content-visibility: auto; contain-intrinsic-size: auto ...` to reading lines and list previews**
- [x] **Step 2: Add `{ passive: true }` to scroll and touch listeners in hooks**
- [x] **Step 3: Run TypeScript check and unit tests**
- [x] **Step 4: Commit changes**

---

### Task 4: SWR Request Deduplication & API Caching Strategy (`client-swr-dedup`)

**Files:**
- Modify: `src/utils/api.ts`
- Modify: `src/components/QuranReader/api.ts`
- Test: `src/utils/api.test.ts`

**Interfaces:**
- Consumes: SWR configuration options.
- Produces: 60s deduplication interval and immutable caching for static Quranic content.

- [ ] **Step 1: Configure SWR default caching options with dedupingInterval**
- [ ] **Step 2: Verify API request deduplication behavior**
- [ ] **Step 3: Run unit tests to verify no regression in data fetching**
- [ ] **Step 4: Commit changes**

