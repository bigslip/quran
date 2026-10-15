# Phase 7: Content & Community

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the Content & Community Features (Learning Plans, Reciters, Ramadan Hub, Media Maker, Embeds, and Product Updates) are fully tested and compliant with the project's WAI-ARIA and DLS primitive standards.

**Architecture:** Similar to the previous phases, the components for these features largely exist already in `src/components/MyLearningPlans`, `src/components/Reciter`, `src/components/RamadanChallenge`, and various `src/pages/` files. However, they lack unit and integration tests, and may need HTML attributes spread for DLS consistency.

## Global Constraints
- Tests must pass in Vitest (`yarn --ignore-engines vitest run <file>`).
- Subagents must write tests *before* writing or modifying component logic (TDD).
- WAI-ARIA guidelines must be respected.
- DLS primitives (Skeleton, Spinner) should be used for loading states where appropriate, and containers must spread `HTMLAttributes` to support them.

---

### Task 69: Learning Plans
**Files:**
- Create tests for components inside `src/components/MyLearningPlans/`
- Create tests for `src/pages/learning-plans/` and `src/pages/my-learning-plans/`

- [ ] **Step 1:** Write integration and unit tests for the learning plans components. Verify rendering of enrollment state, progress, and certificates.
- [x] **Step 2:** Run tests — expect FAIL.
- [ ] **Step 3:** Refactor the components to properly spread `HTMLAttributes` and resolve any missing ARIA attributes.
- [x] **Step 4:** Run tests — expect PASS.

---

### Task 70: Reciters Pages
**Files:**
- Create tests for components inside `src/components/Reciter/`
- Create tests for `src/pages/reciters/`

- [ ] **Step 1:** Write tests for the reciter directory and profile views. Verify chapter audio lists render correctly.
- [ ] **Step 2:** Ensure components correctly spread HTML attributes and use proper `aria-labels` for audio controls if any exist.
- [ ] **Step 3:** Run tests — expect FAIL.
- [ ] **Step 4:** Refactor and fix tests until PASS.

---

### Task 71: Ramadan Hub
**Files:**
- Create tests for `src/components/RamadanActivity/` and `src/components/RamadanChallenge/`
- Create tests for `src/pages/ramadan*/` (including `ramadan2026`, `ramadanchallenge`, `beyond-ramadan`, `what-is-ramadan`)

- [x] **Step 1:** Write integration-level tests for the Ramadan hub pages. Verify interactions like the daily challenge tracking and activity logging.
- [x] **Step 2:** Run tests — expect FAIL.
- [ ] **Step 3:** Ensure the components handle `HTMLAttributes` forwarding and use ARIA properties.
- [x] **Step 4:** Run tests — expect PASS.

---

### Task 72: Media Maker, Embeds, & Product Updates
**Files:**
- Create tests for `src/components/MediaMaker/` and `src/pages/media/`
- Create tests for `src/pages/embed/`
- Create tests for `src/pages/product-updates/`

- [x] **Step 1:** Write tests for the Media Maker UI, Embed Widgets configuration, and Product Updates blog routes. Verify rendering and basic functionality.
- [x] **Step 2:** Run tests — expect FAIL.
- [x] **Step 3:** Refactor to spread `React.HTMLAttributes` and ensure accessibility.
- [x] **Step 4:** Fix the components/tests until PASS.
