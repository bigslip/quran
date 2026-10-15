# UI/UX Major Architecture Redesign Specification: "Universal Spotlight & Content-First Sanctuary"

- **Status:** Approved for Implementation
- **Author:** Senior Staff Product Architect & Principal UI/UX Engineer
- **Date:** 2026-08-31
- **Branch:** `feature/modern-spiritual-sanctuary-ui-ux`

---

## 1. Core Architectural Shifts

### 1.1 Universal Spotlight Search in Top Navbar
- **Problem:** Currently, search is duplicated: a small button in the navbar and a massive search input in the Hero that consumes the primary viewport.
- **Solution:**
  - Introduce a **Universal Command Bar Pill** directly in the center of the top navigation bar (`NavbarBody`).
  - Desktop: Frosted glass pill with search icon, localized placeholder (*"Search Quran, Surah, or Ayah..."*), and a distinct `⌘K` / `Ctrl+K` hotkey badge.
  - Mobile: Prominent search icon and quick-search tap trigger.
  - Clicking the pill opens the Command Palette / Search Drawer with instant Surah jumping and recent searches.

### 1.2 Content-First Homepage Information Architecture
- **Problem:** The primary content users seek—the 114 Surahs and 30 Juz directory—is buried at the bottom of the page beneath 6 secondary sections.
- **Solution:**
  - **Zone 1: Spiritual Hero & Daily Inspiration Sanctuary:**
    - Contextual Islamic greeting capsule ("Assalamu Alaikum", time of day).
    - Daily Verse / Inspiration highlight capsule with one-click audio play.
    - Quick-jump pills: Surah Yaseen (36), Al-Mulk (67), Al-Kahf (18), Ayah Al-Kursi (2:255), Juz 30 (Amma).
  - **Zone 2: Unified Reading Resumption & Goals:**
    - Quick resume card (last read Ayah & page) + circular SVG daily goal progress ring.
  - **Zone 3: Core Quran Directory (Surah / Juz / Revelation Order):**
    - Prominently positioned immediately after Resumption, giving users instant access to reading scripture.
  - **Zone 4: Discover & Deepen Grid:**
    - Structured 2-column discovery section for Learning Plans, Explore Topics, Quran in a Year, and Community Reflections.
  - **Zone 5: Apps & Ecosystem Footer:**
    - Mobile apps showcase and portal links.

---

## 2. Implementation Milestones

### Milestone 1: Top Navbar Universal Command Bar
- Update `src/components/Navbar/NavbarBody/index.tsx` & `NavbarBody.module.scss`.
- Add desktop centered `NavbarCommandBar` with frosted glass styling, `⌘K` badge, and search drawer trigger.

### Milestone 2: Hero & Daily Inspiration Sanctuary Redesign
- Refactor `src/components/HomePage/HomePageHero.tsx` & `HomePageHero.module.scss`.
- Remove redundant embedded search input from Hero.
- Feature the Daily Inspiration Ayah, Bismillah art, and Quick-Jump Pills with modern sanctuary aesthetics.

### Milestone 3: Homepage Information Architecture Re-ordering
- Update `src/pages/index.tsx` and `src/components/HomePage/MobileHomepageSections.tsx`.
- Place `ChapterAndJuzListWrapper` in Zone 3 (immediately after `ReadingSection`).
- Organize secondary sections (`LearningPlans`, `ExploreTopics`, `QuranInYear`, `Community`) into an elegant `DiscoverGrid`.

### Milestone 4: Multi-Viewport Chrome Verification & E2E Audit
- Test on Desktop (1440px), Tablet (768px), and Mobile (375px).
- Verify 0 console errors, 0 hydration mismatches, and 100% test pass rate.
