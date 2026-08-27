# Phase 8: Polish, PWA, SEO & Observability

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the final production readiness phase: test and harden SEO meta generation, Next.js Edge Middleware, Security Headers, and PWA runtime caching configuration.

## Global Constraints
- Tests must pass in Vitest (`yarn --ignore-engines vitest run <file>`).
- Subagents must write tests *before* writing or modifying component logic (TDD).
- WAI-ARIA guidelines must be strictly upheld.
- Ensure strict TypeScript typing without unsafe `any` casts.

---

### Task 73: SEO & Social Sharing Utilities
**Files:**
- Create `src/utils/seo.test.ts`
- Create/modify `src/lib/og.test.ts` if needed
- Refactor `src/utils/seo.ts` if needed

- [x] **Step 1:** Write comprehensive unit tests for `src/utils/seo.ts` covering title generation, canonical URLs, OpenGraph locales, twitter card types, and environment-dependent noindex/nofollow flags.
- [x] **Step 2:** Run tests — expect FAIL.
- [x] **Step 3:** Implement/refactor any missing SEO utility functions and export interfaces cleanly.
- [x] **Step 4:** Run tests — expect PASS.

---

### Task 74: Edge Middleware & Security Headers
**Files:**
- Create `src/middleware.test.ts`
- Create `configs/SecurityHeaders.test.js`
- Modify `src/middleware.ts` if needed

- [x] **Step 1:** Write unit tests for `src/middleware.ts` verifying `_next/data` 404 response handling, case-insensitive Ramadan redirects (`/ramadan2026`, `/ramadanchallenge`), and standard passthrough.
- [x] **Step 2:** Write tests verifying `configs/SecurityHeaders.js` for CSP directives, Permissions-Policy, Referrer-Policy, and X-Content-Type-Options.
- [x] **Step 3:** Run tests — expect FAIL.
- [x] **Step 4:** Refactor and ensure all tests PASS cleanly.

---

### Task 75: PWA & Service Worker Runtime Caching
**Files:**
- Create `pwa-runtime-config.test.js`
- Modify `pwa-runtime-config.js` if needed

- [ ] **Step 1:** Write tests for `pwa-runtime-config.js` verifying caching strategies (`CacheFirst`, `StaleWhileRevalidate`, `NetworkFirst`) for Google Fonts, static assets, and media exclusions.
- [x] **Step 2:** Run tests — expect FAIL.
- [ ] **Step 3:** Ensure caching rules are robust, valid regex patterns, and properly configured.
- [x] **Step 4:** Run tests — expect PASS.

---

### Task 76: Production Verification & Final Build Audit
**Files:**
- Verification across full test suite
- Typecheck & build health audit

- [ ] **Step 1:** Run full test suite across all phases (1–8) and ensure 100% pass rate.
- [ ] **Step 2:** Generate final Phase 8 review artifact.
