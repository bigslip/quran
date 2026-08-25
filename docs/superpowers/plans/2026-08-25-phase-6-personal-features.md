# Phase 6: Personal Features

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the Personal Features (My Quran Dashboard, Notes & Reflections, Reading Goals, and Calendar) are fully tested and compliant with the project's WAI-ARIA and DLS primitive standards.

**Architecture:** Similar to the previous phases, the components for these features already exist in `src/components/MyQuran`, `src/components/Notes`, `src/components/ReadingGoal`, and `src/components/QuranicCalendar`. However, they lack unit and integration tests, and may need HTML attributes spread for DLS consistency.

## Global Constraints
- Tests must pass in Vitest (`yarn --ignore-engines vitest run <file>`).
- Subagents must write tests *before* writing or modifying component logic (TDD).
- WAI-ARIA guidelines must be respected.
- DLS primitives (Skeleton, Spinner) should be used for loading states where appropriate, and containers must spread `HTMLAttributes` to support them.

---

### Task 65: My Quran Dashboard & Tabs Testing
**Files:**
- Create tests for `src/components/MyQuran/tabs/RecentContent/RecentContent.tsx`
- Create tests for `src/components/MyQuran/tabs/NotesAndReflectionsTab/NotesTab/NotesTabContent.tsx`
- Create tests for `src/components/MyQuran/SavedTabContent/index.tsx`
- Create tests for `src/pages/my-quran/index.tsx`

- [x] **Step 1:** Write rendering and interaction tests for the Recent Content, Notes, and Saved tabs in the My Quran dashboard. Verify empty states and populated states.
- [x] **Step 2:** Run tests — expect FAIL.
- [x] **Step 3:** Refactor the dashboard tab components to properly spread `HTMLAttributes` and resolve any missing ARIA attributes (e.g. `aria-selected` on tabs, `aria-busy` during data fetches).
- [x] **Step 4:** Run tests — expect PASS.

---

### Task 66: Notes & Reflections Components
**Files:**
- Create tests for components inside `src/components/Notes/` (e.g. `NoteItem`, `NotesList`)
- Modify component sources as necessary.

- [ ] **Step 1:** Write unit tests for the Notes components. Validate rendering of a note, editing, deleting, and attaching verses.
- [ ] **Step 2:** Ensure components correctly spread HTML attributes and use `aria-expanded`/`aria-controls` for any collapsible note contents or modals.
- [ ] **Step 3:** Run tests — expect FAIL.
- [ ] **Step 4:** Refactor and fix tests until PASS.

---

### Task 67: Reading Goals
**Files:**
- Create tests for `src/components/ReadingGoal/` and `src/components/ReadingGoalPage/` (e.g. tracking widget, wizard).

- [ ] **Step 1:** Write integration-level tests for the reading goal wizard and daily tracking UI. Verify interactions like setting a goal, incrementing progress, and completing a goal.
- [x] **Step 2:** Run tests — expect FAIL.
- [ ] **Step 3:** Ensure the reading goal components handle `HTMLAttributes` forwarding and use DLS progress bars correctly.
- [x] **Step 4:** Run tests — expect PASS.

---

### Task 68: Quranic Calendar & Bookmarks Migration
**Files:**
- Create tests for `src/components/QuranicCalendar/` (e.g. Hijri calendar rendering, week tracking).
- Create tests for `src/components/GuestBookmarksMigrationModal/`.

- [ ] **Step 1:** Write tests for the calendar components to ensure correct date rendering and interactions (e.g. switching months, selecting days).
- [ ] **Step 2:** Write tests for the Guest Bookmarks Migration Modal (verifying focus management, ARIA labels, and migration triggers).
- [ ] **Step 3:** Run tests — expect FAIL.
- [ ] **Step 4:** Fix the components/tests until PASS.
