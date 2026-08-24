# Phase 2b: ReadingView Containers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retrofit the core structural components of the Reading View (`Line`, `TranslatedAyah`, `Page`, `PageContainer`) with Vitest test suites, ensure proper HTML prop forwarding, and confirm WAI-ARIA compliance.

**Architecture:** These components wrap the `QuranWord` primitives (tested in 2a) into lines and pages that make up a standard Mushaf reading experience. They heavily use Redux for user preferences and state.

**Tech Stack:** React, Vitest, React Testing Library, SCSS modules, Redux (mocked).

## Global Constraints

- Must use SCSS modules (`*.module.scss`).
- Strictly adhere to WAI-ARIA guidelines.
- Tests must pass in Vitest (`yarn vitest run <file> --ignore-engines`).

---

### Task 1: `Line` Component

**Files:**
- Modify: `src/components/QuranReader/ReadingView/Line.tsx`
- Create: `src/components/QuranReader/ReadingView/Line.test.tsx`

**Scope:**
- `Line` renders a single line of a Mushaf page. It contains multiple `QuranWord`s.
- Update `Line` to accept `...props` (extend `React.HTMLAttributes<HTMLDivElement>`).
- Write `Line.test.tsx` mocking `QuranWord` to ensure the words map correctly.

- [ ] **Step 1:** Write the failing test `Line.test.tsx`. Mock `react-redux` and `@/dls/QuranWord/QuranWord`.
- [ ] **Step 2:** Run test to verify it fails (`yarn vitest run src/components/QuranReader/ReadingView/Line.test.tsx`).
- [ ] **Step 3:** Implement `Line.tsx` modifications (spread `...props` to the main container).
- [ ] **Step 4:** Run test to verify it passes.
- [ ] **Step 5:** Commit: `feat(reader): add tests and prop forwarding to Line component`

---

### Task 2: `TranslatedAyah` Component

**Files:**
- Modify: `src/components/QuranReader/ReadingView/TranslatedAyah.tsx`
- Create: `src/components/QuranReader/ReadingView/TranslatedAyah.test.tsx`

**Scope:**
- `TranslatedAyah` is used when "Word by Word Translation" is enabled in reading mode. It renders a block instead of a strict inline text.
- Update to accept `...props`.
- Write tests to ensure it renders translations.

- [ ] **Step 1:** Write the failing test `TranslatedAyah.test.tsx`. Mock Redux hooks and internal hooks if needed.
- [ ] **Step 2:** Run test to verify it fails.
- [ ] **Step 3:** Implement `TranslatedAyah.tsx` modifications.
- [ ] **Step 4:** Run test to verify it passes.
- [ ] **Step 5:** Commit: `feat(reader): add tests and prop forwarding to TranslatedAyah component`

---

### Task 3: `Page` Component

**Files:**
- Modify: `src/components/QuranReader/ReadingView/Page.tsx`
- Create: `src/components/QuranReader/ReadingView/Page.test.tsx`

**Scope:**
- `Page` groups `Line`s together.
- Note that `Page` does complex grouping logic (by lines) which is pure. Test that it handles basic page rendering correctly.
- Update to accept `...props`.

- [ ] **Step 1:** Write the failing test `Page.test.tsx`. Mock `Line` and `TranslatedAyah`.
- [ ] **Step 2:** Run test to verify it fails.
- [ ] **Step 3:** Implement `Page.tsx` modifications.
- [ ] **Step 4:** Run test to verify it passes.
- [ ] **Step 5:** Commit: `feat(reader): add tests and prop forwarding to Page component`

---

### Task 4: `PageContainer` Component

**Files:**
- Modify: `src/components/QuranReader/ReadingView/PageContainer.tsx`
- Create: `src/components/QuranReader/ReadingView/PageContainer.test.tsx`

**Scope:**
- `PageContainer` is wrapped by an IntersectionObserver to detect when a user scrolls a page into view.
- Update to accept `...props`.
- Write tests ensuring the intersection observer hook is called and it renders `Page`.

- [ ] **Step 1:** Write the failing test `PageContainer.test.tsx`. Mock `react-intersection-observer`, Redux, and `Page`.
- [ ] **Step 2:** Run test to verify it fails.
- [ ] **Step 3:** Implement `PageContainer.tsx` modifications.
- [ ] **Step 4:** Run test to verify it passes.
- [ ] **Step 5:** Commit: `feat(reader): add tests and prop forwarding to PageContainer component`

