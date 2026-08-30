# Modern Spiritual Sanctuary UI/UX Redesign Implementation Plan

> **Goal:** Implement the "Modern Spiritual Sanctuary" UI/UX redesign across DLS design tokens, Homepage discovery hub, Quran Reader & Translation view, and Floating Audio Player dock.
> **Architecture Spec:** `docs/superpowers/specs/2026-08-30-modern-spiritual-sanctuary-ui-ux-design.md`
> **Branch:** `feature/modern-spiritual-sanctuary-ui-ux`

---

## Proposed Milestones & Tasks

### Milestone 1: Design Tokens & DLS Elevation (Foundation)
- **Task 1.1: SCSS Token Modernization**
  - Update `src/styles/variables.scss` and theme color variables with the deep emerald palette, refined neutral slate scales, obsidian dark mode (`#0B1117`), and parchment warm mode (`#FBF7EE`).
  - Add glassmorphic backdrop tokens (`--backdrop-filter-frosted`, `--elevation-floating`).
- **Task 1.2: DLS Primitives Polish**
  - Refine `src/dls/Button/`, `src/dls/IconContainer/`, `src/dls/Badge/`, and `src/dls/PopoverMenu/` with smooth hover micro-transitions (`scale(1.02)` / subtle border illumination) and accessible tap states.

### Milestone 2: Homepage Discovery & Hero Redesign
- **Task 2.1: Modern Hero with Contextual Capsule & Quick Action Pills**
  - Redesign `src/components/HomePage/HomePageHero.tsx` and `HomePageHero.module.scss`.
  - Add Islamic greeting capsule ("Assalamu Alaikum", time-of-day indicator) and quick jump pills ("Surah Yaseen", "Surah Al-Mulk", "Surah Al-Kahf", "Juz 30").
- **Task 2.2: Redesign Resumption & Reading Goal Cards**
  - Polish `src/components/HomePage/ReadingSection/StreakOrGoalCard/` and `ChapterCard/` with clear resumption hierarchy, smooth SVG goal progress ring, and elegant geometric Surah badges.
- **Task 2.3: Chapter Grid & Surah List Card Elevation**
  - Redesign `src/components/chapters/ChapterCard.tsx` and list wrappers with modernized typography, calligraphy ligatures, and responsive hover cards.

### Milestone 3: Quran Reader & Translation Immersion View
- **Task 3.1: Glassmorphic Floating Reader Header**
  - Redesign `src/components/QuranReader/Navigation/` and sticky command bar with auto-hide on scroll, quick Surah jumper, reading/translation mode switcher, and instant font scaler.
- **Task 3.2: Verse & Translation Cell Layout**
  - Redesign `src/components/QuranReader/TranslationView/TranslationViewCell.tsx` and `VerseText.tsx` with generous line height (`2.4`), crisp Tajweed/Hafs rendering, and word-by-word tooltip styling.
  - Redesign contextual verse action bar (`[Play]`, `[Tafsir]`, `[Reflect]`, `[Share]`, `[Bookmark]`).
- **Task 3.3: Mushaf Reading View Framing**
  - Polish `src/components/QuranReader/ReadingView/` with ornamental manuscript header framing and responsive page pagination controls.

### Milestone 4: Modern Floating Audio Player Dock
- **Task 4.1: Floating Island Dock Structure**
  - Redesign `src/components/AudioPlayer/AudioPlayer.tsx` and `AudioPlayer.module.scss` into a suspended floating island dock with frosted glass blur.
- **Task 4.2: Playback Controls & High-Precision Scrubber**
  - Redesign `PlaybackControls.tsx` and `AudioPlayerSlider.tsx` with pulse play animation, timestamp counters, and hover time preview tooltips.

### Milestone 5: Verification & End-to-End Visual Audit
- **Task 5.1: Headless Chrome Browser Audit & Vitest Test Execution**
  - Run full test suite (`yarn test`).
  - Run Playwright Chrome audit script to verify 0 console errors, 0 hydration mismatches, and responsive rendering across Mobile (375px), Tablet (768px), and Desktop (1440px).

---

## Execution Strategy
Each milestone will be implemented by dedicated sub-agents, keeping contexts clean and staging atomic, verifiable commits.
