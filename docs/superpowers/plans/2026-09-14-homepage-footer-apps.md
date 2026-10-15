# Implementation Plan: Homepage Streamlining & Footer Mobile App Integration

**Date**: 2026-09-14  
**Design Spec**: `docs/superpowers/specs/2026-09-14-homepage-footer-apps-design.md`

---

## Tasks

### Task 1: Remove Community & Apps from Homepage
- Edit `src/pages/index.tsx`:
  - Remove `<CommunitySection />` and `<HomePageApps />` JSX blocks.
  - Clean up unused dynamic imports for `CommunitySection` and `HomePageApps`.
- Edit `src/components/HomePage/MobileHomepageSections/index.tsx`:
  - Remove `<CommunitySection />` and its dynamic import.
- Run typecheck.

### Task 2: Create Footer AppStoreBadge Component & Unit Tests
- Create `src/components/dls/Footer/AppStoreBadge.test.tsx` testing rendering of Apple & Google badges, localized subtexts, click logging, and external link attributes.
- Create `src/components/dls/Footer/AppStoreBadge.tsx` supporting:
  - `platform: 'ios' | 'android'`
  - Localized labels using `useTranslation('common')` and `useTranslation('home')` fallback.
  - Event logging: `logButtonClick('footer_app_store')` & `logButtonClick('footer_google_play')`.
- Update `src/components/dls/Footer/TitleAndDescription.tsx`:
  - Integrate iOS and Android download badges beneath description with container `.appBadgesContainer`.

### Task 3: Footer SCSS Styling & Responsive Layout
- Update `src/components/dls/Footer/Footer.module.scss`:
  - Add `.appBadgesContainer`, `.appBadge`, `.iosButton`, `.androidButton`, `.badgeIcon`, `.badgeText`, `.badgeSubtext`, `.badgeTitle`.
  - Add smooth hover micro-interactions (`transform: translateY(-2px); box-shadow: ...`).
  - Use RTL-friendly logical properties.
  - Add responsive stacking on mobile (`<= 480px`).

### Task 4: Translations & Unit Verification
- Ensure `locales/*/common.json` has `footer.download-on`, `footer.get-it-on`, `footer.app-store`, `footer.google-play` (or fallback).
- Run unit tests: `yarn --ignore-engines test --run src/components/dls/Footer/`.
- Run typecheck: `npx tsc --noEmit`.

### Task 5: Visual Regression Verification
- Use Playwright to capture screenshots of `/` and `/fa` (desktop & mobile).
- Verify footer badge placement, RTL alignment, and clean absence of Community & Apps on homepage.
