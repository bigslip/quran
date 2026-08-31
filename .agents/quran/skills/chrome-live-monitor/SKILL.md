---
name: chrome-live-monitor
description: Runs persistent Google Chrome browser console, network, and hydration audits to detect and fix runtime errors in real-time.
---

# Chrome Live Console & Network Monitor

Use this skill whenever building, modifying, or testing UI components, routes, or client-side hooks to ensure zero runtime errors, zero React warnings, and zero failed network requests.

## Capabilities & Workflows

1. **Automated Multi-Viewport Audit**:
   - Executes Headless Google Chrome across Desktop (1440x900), Tablet (768x1024), and Mobile (375x812).
   - Navigates through key application routes (`/`, `/1`, `/2`, `/36`, `/fa/2`, `/ar/1`, `/juz/1`, `/page/1`, `/search`, `/my-quran`, `/reading-goal`).
   - Run via:
     ```bash
     yarn browser:audit
     # or
     node scripts/chrome-live-monitor.mjs
     ```

2. **Real-Time Live Monitor (Watch Mode)**:
   - Launches an active Chrome instance listening to `page.on('console')`, `page.on('pageerror')`, and `page.on('response')`.
   - Run via:
     ```bash
     yarn browser:monitor
     # or
     node scripts/chrome-live-monitor.mjs --watch
     ```

3. **Subagent Background Auditor Pattern**:
   - When developing or refactoring, spawn a subagent with:
     - Model: `inherit`
     - Role: `Chrome Live Monitor Subagent`
     - System command: `node scripts/chrome-live-monitor.mjs`
   - Investigate any reported stack trace, locate the source file in `src/`, and apply fixes cleanly.

## Common Issues & Fixes
- **React Hydration Error:** Use `useIsMobile()` hook instead of direct `isMobile()` render evaluations. Ensure no `<a>` inside `<a>` or `<button>` inside `<a>`.
- **404 Font/Asset Requests:** Check `next.config.js` fallback proxy rules for static QuranCDN assets.
- **Unmemoized Redux Selectors:** Wrap derived objects in `createSelector`.
