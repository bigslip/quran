# Phase 1b.4 Feedback & Progress Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement 6 essential feedback and progress components (Skeleton, Spinner, Progress, CircularProgress, Badge, Pill) for the DLS, strictly following our TDD process, styling conventions, and Radix UI primitives where applicable.

**Architecture:** Each component is implemented as a standalone directory in `src/components/dls/`. Each directory contains the component code, SCSS module, Storybook story, and Vitest unit tests. Radix UI primitives are used to provide robust accessibility (e.g. `react-progress`).

**Tech Stack:** React, Next.js, Radix UI, SCSS Modules, Vitest, React Testing Library, Storybook.

## Global Constraints

- Must use SCSS modules (`*.module.scss`) and existing CSS variable tokens (`var(--color-...)`, `var(--font-...)`).
- Strictly adhere to WAI-ARIA guidelines.
- Tests must pass in Vitest (`yarn vitest run <file>`).
- Stories must function correctly in Storybook.
- **NOTE:** If a component already exists in the repository, you should review its current implementation. If it lacks tests or does not meet the accessibility/styling standards, you must write tests, refactor or rewrite the component to meet these standards, and ensure WAI-ARIA compliance. If it is already fully featured and tested, you may skip it.

---

### Task 49: Skeleton

**Files:**
- Create/Update: `src/components/dls/Skeleton/Skeleton.tsx`
- Create/Update: `src/components/dls/Skeleton/Skeleton.module.scss`
- Create/Update: `src/components/dls/Skeleton/Skeleton.stories.tsx`
- Create: `src/components/dls/Skeleton/Skeleton.test.tsx`

- [x] **Step 1: Write the failing test**
  Create `Skeleton.test.tsx` checking that it renders an element with `aria-hidden="true"` (since skeletons are visual placeholders) or appropriate `aria-busy`.
- [x] **Step 2: Run test — expect FAIL**
- [x] **Step 3: Implement SCSS**
  Ensure pulse animation is present.
- [x] **Step 4: Implement component**
- [x] **Step 5: Run test — expect PASS**
- [x] **Step 6: Write Storybook story**
- [x] **Step 7: Verify in Storybook & Commit**
  `git commit -m "feat(dls): implement Skeleton primitive"`

---

### Task 50: Spinner

**Files:**
- Create/Update: `src/components/dls/Spinner/Spinner.tsx`
- Create/Update: `src/components/dls/Spinner/Spinner.module.scss`
- Create/Update: `src/components/dls/Spinner/Spinner.stories.tsx`
- Create: `src/components/dls/Spinner/Spinner.test.tsx`

- [x] **Step 1: Write the failing test**
  Create `Spinner.test.tsx` checking that it renders a loading indicator (should have `role="status"` and visually hidden loading text or `aria-label`).
- [x] **Step 2: Run test — expect FAIL**
- [x] **Step 3: Implement SCSS**
- [x] **Step 4: Implement component**
- [x] **Step 5: Run test — expect PASS**
- [x] **Step 6: Write Storybook story**
- [x] **Step 7: Verify in Storybook & Commit**
  `git commit -m "feat(dls): implement Spinner primitive"`

---

### Task 51: Progress

**Files:**
- Create/Update: `src/components/dls/Progress/Progress.tsx`
- Create/Update: `src/components/dls/Progress/Progress.module.scss`
- Create/Update: `src/components/dls/Progress/Progress.stories.tsx`
- Create/Update: `src/components/dls/Progress/Progress.test.tsx`

- [x] **Step 1: Install Radix UI Progress (if not present)**
  `yarn add @radix-ui/react-progress`
- [x] **Step 2: Write the failing test**
  Check that it uses Radix UI and renders the correct value in WAI-ARIA attributes (`aria-valuenow`).
- [x] **Step 3: Run test — expect FAIL**
- [x] **Step 4: Implement SCSS**
- [x] **Step 5: Implement component**
- [x] **Step 6: Run test — expect PASS**
- [x] **Step 7: Write Storybook story**
- [x] **Step 8: Verify in Storybook & Commit**
  `git commit -m "feat(dls): implement Progress primitive"`

---

### Task 52: CircularProgress

**Files:**
- Create/Update: `src/components/dls/CircularProgress/CircularProgress.tsx`
- Create/Update: `src/components/dls/CircularProgress/CircularProgress.module.scss`
- Create/Update: `src/components/dls/CircularProgress/CircularProgress.stories.tsx`
- Create: `src/components/dls/CircularProgress/CircularProgress.test.tsx`

- [x] **Step 1: Write the failing test**
- [x] **Step 2: Run test — expect FAIL**
- [x] **Step 3: Implement SCSS**
  Must use SVG with `stroke-dasharray` and `stroke-dashoffset` for the progress circle.
- [x] **Step 4: Implement component**
  Ensure it has `role="progressbar"` and appropriate aria attributes.
- [x] **Step 5: Run test — expect PASS**
- [x] **Step 6: Write Storybook story**
- [x] **Step 7: Verify in Storybook & Commit**
  `git commit -m "feat(dls): implement CircularProgress primitive"`

---

### Task 53: Badge

**Files:**
- Create/Update: `src/components/dls/Badge/Badge.tsx`
- Create/Update: `src/components/dls/Badge/Badge.module.scss`
- Create/Update: `src/components/dls/Badge/Badge.stories.tsx`
- Create: `src/components/dls/Badge/Badge.test.tsx`

- [x] **Step 1: Write the failing test**
  A badge is often used as a notification dot or count attached to another element. Test that it renders the children and the badge content appropriately positioned.
- [x] **Step 2: Run test — expect FAIL**
- [x] **Step 3: Implement SCSS**
- [x] **Step 4: Implement component**
- [x] **Step 5: Run test — expect PASS**
- [x] **Step 6: Write Storybook story**
- [x] **Step 7: Verify in Storybook & Commit**
  `git commit -m "feat(dls): implement Badge primitive"`

---

### Task 54: Pill

**Files:**
- Create/Update: `src/components/dls/Pill/Pill.tsx`
- Create/Update: `src/components/dls/Pill/Pill.module.scss`
- Create/Update: `src/components/dls/Pill/Pill.stories.tsx`
- Create: `src/components/dls/Pill/Pill.test.tsx`

- [x] **Step 1: Write the failing test**
  A pill is a standalone rounded tag/label. Test rendering and any interactions (if removable).
- [x] **Step 2: Run test — expect FAIL**
- [x] **Step 3: Implement SCSS**
- [x] **Step 4: Implement component**
- [x] **Step 5: Run test — expect PASS**
- [x] **Step 6: Write Storybook story**
- [x] **Step 7: Verify in Storybook & Commit**
  `git commit -m "feat(dls): implement Pill primitive"`
