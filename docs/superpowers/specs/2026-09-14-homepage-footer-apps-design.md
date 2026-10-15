# Design Specification: Homepage Streamlining & Footer Mobile App Integration

**Date**: 2026-09-14  
**Status**: Approved  
**Author**: Antigravity Pair Programming

---

## 1. Executive Summary

To streamline the Quran.ir homepage and elevate core reading/exploring features, we are:
1. **Removing** the redundant "Community" and "Quran Apps" sections from both desktop and mobile homepage flows (`src/pages/index.tsx` and `src/components/HomePage/MobileHomepageSections/index.tsx`).
2. **Integrating** sleek, theme-aware iOS (App Store) and Android (Google Play) download badges into the global footer (`src/components/dls/Footer/TitleAndDescription.tsx`).
3. **Refactoring** the footer layout and styles using modern UI/UX design principles (`refactoring-ui`, `frontend-design`, `microinteractions`, and `web-design-guidelines`) with full RTL/LTR logical property compliance and responsive stacking.

---

## 2. UI/UX Architecture & Layout

### 2.1 Homepage Streamlining
- **Desktop Flow (`src/pages/index.tsx`)**:
  - Hero & Sanctuary Command Deck -> Continue Reading Ribbon -> Islamic Petal Surah Directory -> Quran Growth Journey / Learning Plans / Quran in a Year / Explore Topics.
  - Removed: `<CommunitySection />` and `<HomePageApps />`.
- **Mobile Flow (`src/components/HomePage/MobileHomepageSections/index.tsx`)**:
  - Removed: `<CommunitySection />`.

### 2.2 Global Footer Layout (Brand Column Integration)
The site-wide footer consists of a two-sided top container followed by the bottom utility bar:
1. **Start Column (Brand & App Portal Hub - Left in LTR / Right in RTL)**:
   - Quran text logo + Mission Title (`footer.title`).
   - Platform description & Quran.Foundation non-profit attribution (`footer.description`).
   - **New App Download Actions (`.appBadgesContainer`)**:
     - **App Store Badge**: Apple vector icon + "Download on the" subtext + "App Store" label.
     - **Google Play Badge**: Google Play vector icon + "Get it on" subtext + "Google Play" label.
     - Micro-interaction: Hover elevation (`translateY(-2px)`), subtle border illumination, smooth ease transition, and active click logging.
2. **End Column (Navigation Links Grid - 3 Columns)**:
   - `Navigate` (Home, Quran Radio, Reciters, About, Developers, Product Updates, Feedback, Support).
   - `Our Projects` (Quran.ir, Quran For Android, Quran iOS, QuranReflect, Sunnah.com, Nuqayah, Legacy, Corpus).
   - `Popular Links` (Ayatul Kursi, Surah Yaseen, Surah Al-Mulk, Surah Ar-Rahman, Surah Al-Waqi'ah, Surah Al-Kahf, Surah Al-Baqarah, Surah Ali 'Imran).
3. **Bottom Bar (`BottomSection.tsx`)**:
   - Theme Switcher, Language Switcher, and Copyright text.

---

## 3. Component Details & Design Tokens

### 3.1 Badge Component (`src/components/dls/Footer/AppStoreBadge.tsx`)
- Props:
  - `platform`: `'ios' | 'android'`
  - `href`: string
  - `ariaLabel?`: string
- Micro-interactions & Styling:
  - Surface: `var(--color-background-default-new)` or `var(--color-background-elevated-new)` with `border: 1px solid var(--color-borders-hairline)`.
  - Radius: `var(--border-radius-rounded)` (10px–12px).
  - Hover: `transform: translateY(-2px)`, `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)`, border color subtle brightening.
  - Active: `transform: translateY(0)`.
  - Icon: Clean SVG icons (`@/icons/apple.svg` and `@/icons/google.svg`), dimensioned consistently (24x24px).
  - Typography:
    - Subtext: `font-size: var(--font-size-xxsmall-px)` (10px–11px), uppercase/light weight, subtle muted opacity.
    - Title: `font-size: var(--font-size-small-px)` (13px–14px), semibold weight.
  - Analytics: Dispatches `logButtonClick('footer_app_store')` and `logButtonClick('footer_google_play')`.

### 3.2 Responsive & Logical Property Specifications
- Container `.appBadgesContainer`:
  - `display: flex; flex-wrap: wrap; gap: var(--spacing-xsmall-px); margin-block-start: var(--spacing-medium-px);`
- RTL Support:
  - Automatically adapts in Arabic/Persian/Urdu through `flex-direction`, `margin-inline-end`, `padding-inline`.
- Mobile Stacking:
  - At `<= 480px`, badges stretch nicely to 100% or equal flex columns for effortless thumb tapping.

---

## 4. Verification Plan

1. **Unit Tests**:
   - Create unit tests for `AppStoreBadge` and updated `TitleAndDescription`.
2. **Typecheck & Linter**:
   - Run `npx tsc --noEmit`.
3. **Visual Regression & Flow Verification**:
   - Capture desktop and mobile screenshots of Homepage (`/` and `/fa`).
   - Verify footer layout and badge rendering across light and dark themes.
