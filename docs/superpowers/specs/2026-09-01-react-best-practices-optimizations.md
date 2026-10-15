# Specification: React Best Practices Performance Optimizations

- **Status:** Approved for Implementation
- **Standard:** Vercel React Best Practices (`vercel-react-best-practices`)
- **Date:** 2026-09-01
- **Branch:** `feature/modern-spiritual-sanctuary-ui-ux`

---

## 1. Executive Summary

Based on comprehensive multi-domain performance audits using the `vercel-react-best-practices` guidelines, this specification details the performance hardening of the Next.js pages, Redux subscriptions, component rendering pipeline, and event listener abstractions across Quran.ir frontend.

---

## 2. Implementation Milestones

### Milestone 1: Redux State Granularity & Re-render Optimization
1. **Granular Font Selectors (`rerender-derived-state`):**
   - Add `selectQuranTextFontScale`, `selectTranslationFontScale`, `selectTafsirFontScale` in `src/redux/slices/QuranReader/styles.ts`.
   - Refactor `src/components/dls/QuranWord/GlyphWord.tsx` and `TajweedWordImage.tsx` to subscribe to granular primitives instead of the full `state.quranReaderStyles` object.
2. **Selector Memoization (`rerender-memo`):**
   - Wrap `selectInlineDisplayWordByWordPreferences` with `createSelector` in `src/redux/slices/QuranReader/readingPreferences.ts`.
   - Wrap `selectOrderedBookmarkedVerses` and `selectOrderedBookmarkedPages` with `createSelector` in `src/redux/slices/QuranReader/bookmarks.ts`.
   - Use stable fallback `const EMPTY_PINNED_VERSES: PinnedVerse[] = []` in `src/redux/slices/QuranReader/pinnedVerses.ts`.
3. **Derived Boolean Hover/Selection Selectors (`rerender-derived-state`):**
   - Add parameterized `selectIsVerseHovered(verseKey)` and `selectIsVerseSelected(verseKey)` in `src/redux/slices/QuranReader/readingViewVerse.ts`.
   - Update `src/components/Verse/VerseText.tsx` to subscribe to derived booleans.
   - Refactor `PinVerseAction.tsx` to use `selectIsVersePinned(state, verseKey)` directly.
4. **Reducer Equality Guards (`rerender-use-ref-transient-values`):**
   - Add equality checks in `src/redux/slices/navbar.ts` and `src/redux/slices/QuranReader/contextMenu.ts` so `setIsVisible` and `setIsExpanded` return unchanged state reference when payload equals current value.

### Milestone 2: Event Listeners & DOM Rendering Performance
1. **Shared MediaQuery Singleton with `useSyncExternalStore` (`client-event-listeners`):**
   - Refactor `src/hooks/useIsMobile.ts` to use `matchMedia` + `useSyncExternalStore` (eliminating up to 1,200 duplicate resize listeners).
   - Defer reads in `QuranWord.tsx` and `useScrollWithContextMenuOffset.ts` where `isMobile` is only queried inside callbacks.
2. **Passive Scroll Listeners (`client-passive-event-listeners`):**
   - Add `{ passive: true }` in `src/hooks/useScrollDirection.ts` and `src/components/QuranReader/ReadingView/StudyModeModal/useStudyModeScroll.ts`.
3. **Callback Ref Stabilization (`advanced-event-handler-refs`):**
   - Store callbacks in `useRef` within `src/hooks/useOutsideClickDetector.ts` and `src/hooks/useScrollListener.ts`.
4. **CSS Content Visibility (`rendering-content-visibility`):**
   - Add `content-visibility: auto; contain-intrinsic-size: auto 44px;` for navigation list items in `SidebarNavigation.module.scss`.

### Milestone 3: Next.js Async Waterfalls & Bundle Splitting
1. **Eliminate Async Waterfalls (`async-parallel`):**
   - Flatten multi-step sequential `await`s in `src/pages/media/index.tsx`, `page/[pageId].tsx`, `search.tsx`, `radio.tsx`, and `product-updates/index.tsx` into `Promise.all`.
2. **Dynamic Imports & Code Splitting (`bundle-dynamic-imports`, `bundle-conditional`):**
   - Lazy-load tab components in `src/pages/my-quran/index.tsx` using `next/dynamic(..., { ssr: false })` at render time.
   - Lazy-load `@remotion/player` in `src/pages/media/index.tsx`.
   - Add `modularizeImports` for `lodash` in `next.config.js`.
3. **SSR / Hydration Auth Sync (`rendering-hydration-no-flicker`):**
   - Use `useAuthData()` with mount hydration check in `src/pages/index.tsx` and `NavigationDrawer.tsx` to prevent hydration mismatches.

---

## 3. Verification Protocol

- Run `npx tsc --noEmit` -> 0 errors.
- Run test suites: `yarn --ignore-engines test`.
- Run Chrome Live Monitor: `yarn browser:audit` across Desktop, Tablet, and Mobile.
