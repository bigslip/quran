# Phase 4 Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalize the `/search` page and search components, ensuring they meet the requirements of full-text search, filters, search history, client-side autocomplete (Fuse.js), and rigorous test coverage.

**Architecture:** The core search features reside in `src/components/Search/` and `src/pages/search.tsx`. Most features are already prototyped but lack test coverage and the client-side Fuse.js surah autocomplete.

## Global Constraints
- Tests must pass in Vitest (`yarn vitest run <file>`).
- Subagents must write tests *before* writing or modifying component logic (TDD).
- WAI-ARIA guidelines must be respected.
- DLS primitives (Skeleton, Spinner) should be used for loading states where appropriate, and containers must spread `HTMLAttributes` to support them.

---

### Task 55: Client-side Surah Autocomplete (Fuse.js)
**Files:**
- Modify `src/components/Search/CommandBar/ExpandedSearchInputSection/index.tsx`
- Create `src/components/Search/CommandBar/ExpandedSearchInputSection/index.test.tsx`

- [x] **Step 1:** Write a failing test for `ExpandedSearchInputSection` asserting that given a search query matching a Surah name (e.g. "Yasin"), it renders a suggestion for that Surah immediately without an API call.
- [x] **Step 2:** Run test — expect FAIL.
- [x] **Step 3:** Implement Fuse.js client-side search inside `ExpandedSearchInputSection` for surah names (using `chaptersData`), combined with recent searches. Avoid calling `getNewSearchResults` API for basic chapter name matches.
- [x] **Step 4:** Run test — expect PASS.

---

### Task 56: Search History Testing & Refactoring
**Files:**
- Create `src/components/Search/SearchHistory/index.test.tsx`
- Modify `src/components/Search/SearchHistory/index.tsx` (if needed for ARIA or fixes)

- [x] **Step 1:** Write a failing test for `SearchHistory` verifying it pulls from Redux `selectSearchHistory`, renders suggestions, and dispatches `removeSearchHistoryRecord` when the remove button is clicked.
- [x] **Step 2:** Run test — expect FAIL (until mocked properly).
- [x] **Step 3:** Refactor `SearchHistory` if necessary to spread `HTMLAttributes` to its root div (to support overlays/primitives).
- [x] **Step 4:** Run test — expect PASS.

---

### Task 57: Search Filters Testing & Refactoring
**Files:**
- Create `src/components/Search/Filters/TranslationsFilter.test.tsx`
- Create `src/components/Search/Filters/LanguagesFilter.test.tsx`

- [x] **Step 1:** Write tests for `TranslationsFilter` ensuring it correctly filters translations based on the search input, dispatches selected translations, and renders correctly.
- [x] **Step 2:** Write tests for `LanguagesFilter`.
- [x] **Step 3:** Ensure both components spread `HTMLAttributes` to their root elements.
- [x] **Step 4:** Run tests — expect PASS.

---

### Task 58: Search Results Testing & Refactoring
**Files:**
- Create `src/components/Search/SearchResults/index.test.tsx`
- Modify `src/components/Search/SearchResults/index.tsx`

- [x] **Step 1:** Write a test for `SearchResults` that mocks a `SearchResponse` and verifies it renders a list of `SearchResultItem`s.
- [x] **Step 2:** Check if `SearchResults` correctly forwards `HTMLAttributes` to its root div to support the `Skeleton` primitive while loading.
- [x] **Step 3:** Run test — expect PASS.

---

### Task 59: Search Page Integration Test
**Files:**
- Create `src/pages/search.test.tsx`

- [ ] **Step 1:** Write an integration test for `SearchPage`. Mock the API calls and Redux state. Verify that entering a query updates the URL, triggers a search, and displays the `SearchBodyContainer`.
- [ ] **Step 2:** Run test — expect PASS.
