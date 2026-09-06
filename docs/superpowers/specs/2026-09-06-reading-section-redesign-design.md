# Design Specification: Continue Reading Sanctuary Ribbon & Announcement Architecture

**Date**: 2026-09-06  
**Status**: Approved  
**Target Area**: Homepage (`src/pages/index.tsx`, `src/components/HomePage/ReadingSection/`)  

---

## 1. Objectives & Context

### 1.1 Problem Statement
The section directly below the `SpiritualPrayerRibbon` currently consists of:
1. An oversized, asymmetrical 2-column card layout in `ReadingSection` where the left "Continue Reading" box is excessively tall and empty, while the right column stacks mismatched streak and event boxes.
2. A heavy, obtrusive `HomepageFundraisingBanner` taking up massive vertical space right before the Surah directory.

### 1.2 Goals
1. Consolidate the entire reading resume, habit tracking, and announcements into a single, cohesive, low-profile **Sanctuary Ribbon** with frosted glass aesthetic and smooth rounded corners (`border-radius: var(--border-radius-rounded)`).
2. Maintain the full underlying infrastructure of the fundraising / announcement banner component (`HomepageFundraisingBanner`, Redux slice `fundraisingBanner.ts`), allowing configurable message broadcasting while removing the default obtrusive vertical space on the homepage.
3. Ensure fluid responsiveness across Desktop, Tablet, and Mobile, adhering to accessibility standards (tap targets ≥ 44px, WCAG AA contrast, keyboard navigation).

---

## 2. Architecture & Layout Specification

### 2.1 Unified Sanctuary Ribbon Layout
The ribbon replaces the old 2-column split cards with a structured horizontal container with 3 functional zones:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ✦ RESUME JOURNEY                           │  🔥 SPIRITUAL HABIT         │  ✨ ANNOUNCEMENT / BADGE   │
│  [ 02 ]  Al-Baqarah · Ayah 255 (Page 42)    │  5-Day Streak · 15 min today │  Ramadan Challenge →       │
│          [ ▶ Resume Reading ]               │  [ My Quran ↗ ]             │  (Configurable Pill)       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Zone 1: Sacred Journey Resume (Left)
- **Surah Medallion**: A `36x36px` diamond badge (`45°` rotated square with gold border and accent color) showing localized Surah number.
- **Surah & Ayah Information**:
  - Transliterated English Surah Name + Arabic Display typography.
  - Subtitle badge: `Ayah {verseNumber}` (or `Page {pageNumber}`) with subtle dot separator.
- **Action Button**: Compact, high-contrast action button `[ ▶ Resume Reading ]` linking directly to the saved verse or page.
- **First-time / Guest Fallback**: If no bookmark exists, gracefully displays `Surah Al-Fatihah` with `[ ▶ Begin Reading ]`.

#### Zone 2: Habit & Consistency Hub (Center / Right)
- **Streak & Goal Pill**:
  - Displays current reading streak (`🔥 {streak} Days`) and/or daily goal progress (`🎯 {current}/{target} min`).
  - If no goal is active, displays an encouraging `[ 🎯 Set Daily Goal ]` or `[ 🔖 My Quran ]` quick link.
- **Interactive Links**: Navigates to `/reading-goal` or `/my-quran` with event logging.

#### Zone 3: Configurable Seasonal / Announcement Pill (Far Right)
- **Compact Badge**: Low-profile rounded pill badge with subtle sparkle / beacon icon (`✨ Ramadan Challenge` or custom banner broadcast).
- **Navigation / Modal Trigger**: Direct link or trigger for active announcements without pushing down homepage flow.

---

## 3. Responsive Breakpoints & Ergonomics

| Viewport | Layout Mode | Container Height | Key Behavior |
| :--- | :--- | :--- | :--- |
| **Desktop (≥ 1024px)** | Single continuous horizontal ribbon | ~`84px` | All 3 zones aligned in a single row with subtle vertical dividers |
| **Tablet (768px – 1023px)** | 2-Zone row | ~`96px` | Left: Resume Action; Right: Combined Habit + Announcement Tag |
| **Mobile (< 768px)** | Compact stacked card | ~`110px` | Top: Surah resume row + Play CTA; Bottom: Streak badge + Announcement pill |

---

## 4. Theming, Styling & Accessibility Tokens

- **Backdrop & Surfaces**:
  - Background: `var(--color-surface-card)` with `backdrop-filter: var(--backdrop-filter-frosted)`.
  - Borders: `1px solid var(--color-border-iridescent)`.
  - Border Radius: `var(--border-radius-rounded)` (`15px` / `16px`).
  - Shadow: `var(--shadow-card)` with hover elevation to `var(--shadow-card-hover)`.
- **Typography**:
  - Surah display name: `var(--font-size-medium-px)` bold.
  - Secondary details: `var(--color-text-secondary)` with WCAG 2.1 AA compliance (≥ 4.5:1).
- **Accessibility**:
  - Minimum tap target height: `44px` on interactive elements.
  - Semantic HTML landmarks with `aria-label` on resume and habit action buttons.
  - Complete RTL support with CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline-start`).

---

## 5. Verification & Testing Strategy

1. **Unit Tests**:
   - Update `src/components/HomePage/ReadingSection/index.test.tsx` to verify:
     - Rendering of Resume action for logged-in and guest users.
     - Streak and goal display when data is present vs fallback.
     - Announcement pill interactions.
2. **Type Safety**:
   - `npx tsc --noEmit` with zero type errors.
3. **End-to-End & Visual Audit**:
   - Playwright screenshots across Desktop (`1440x900`), Tablet (`768x1024`), and Mobile (`375x812`).
   - `node scripts/chrome-live-monitor.mjs` verifying 0 console errors and 0 network failures.
