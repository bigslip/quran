# UI/UX Redesign Specification: "Modern Spiritual Sanctuary"

- **Status:** Approved for Implementation Planning
- **Author:** Senior Staff Product Designer & Frontend Architect
- **Date:** 2026-08-30
- **Scope:** Core Experience Redesign (Homepage & Discovery, Quran Reader & Translation View, Floating Audio Player Bar)

---

## 1. Executive Vision & Design Philosophy

The **"Modern Spiritual Sanctuary"** aesthetic merges timeless Quranic elegance with modern, high-craft digital product design. It aims to elevate reading immersion, reduce cognitive friction, and provide a tranquil, sacred space for engaging with the Holy Quran across all devices.

### Core Design Principles
1. **Sacred Typography First:** Arabic scripture remains the unquestioned focal point. Type hierarchy, glyph spacing, diacritic alignment, and font-scale ratios are tuned for effortless legibility.
2. **Tranquil Color & Elevation:** Subtle monochromatic slate/emerald palettes, rich dark mode contrasts (deep midnight obsidian `#0B1117`), warm parchment tones for sepia mode, and refined glassmorphic surfaces.
3. **Calm & Contextual Interactivity:** Eliminates visual clutter by tucking secondary verse actions (Tafsir, Reflect, Copy, Notes) into elegant contextual hover states and compact touch-friendly menus.
4. **Effortless Continuity:** Clear visual indicators for reading streaks, quick-resumption cards, and continuous word-by-word audio highlighting.

---

## 2. Design System & Token Foundation (DLS)

### 2.1 Color Harmonies & Palettes

| Token | Light Theme | Dark Theme | Sepia / Warm Theme |
| :--- | :--- | :--- | :--- |
| **`--color-surface-bg`** | `#F8FAFC` (Pure Calm White/Slate) | `#0B1117` (Deep Obsidian) | `#FBF7EE` (Warm Parchment) |
| **`--color-surface-card`** | `#FFFFFF` (Elevated White) | `#141D26` (Muted Slate Card) | `#F4EBD9` (Aged Linen) |
| **`--color-surface-floating`** | `rgba(255, 255, 255, 0.85)` (Frosted Glass) | `rgba(20, 29, 38, 0.88)` (Obsidian Glass) | `rgba(244, 235, 217, 0.90)` |
| **`--color-primary`** | `#0D7A5F` (Deep Emerald) | `#10B981` (Vibrant Mint Emerald) | `#1B5E20` (Forest Ink) |
| **`--color-primary-subtle`** | `rgba(13, 122, 95, 0.08)` | `rgba(16, 185, 129, 0.12)` | `rgba(27, 94, 32, 0.10)` |
| **`--color-accent-gold`** | `#D97706` (Warm Amber Gold) | `#FBBF24` (Radiant Gold) | `#B45309` (Antique Gold) |
| **`--color-text-primary`** | `#0F172A` (Slate 900) | `#F1F5F9` (Slate 100) | `#2A241C` (Dark Umber) |
| **`--color-text-secondary`** | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) | `#6B5E4F` (Sepia Muted) |
| **`--color-border-subtle`** | `rgba(226, 232, 240, 0.8)` | `rgba(51, 65, 85, 0.6)` | `rgba(215, 201, 178, 0.7)` |

### 2.2 Elevation & Glassmorphism
- **Floating Bar Backdrop Filter:** `backdrop-filter: blur(16px) saturate(180%)`
- **Card Elevation Hover:** `box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)`
- **Active Word Glow:** `box-shadow: 0 0 12px var(--color-primary-subtle)` with rounded radius `var(--border-radius-rounded)`.

---

## 3. Domain 1: Homepage & Discovery Hub

### 3.1 Redesigned Hero Section
- **Dynamic Greeting & Daily Ayah Capsule:** Displays a serene, contextual greeting ("Assalamu Alaikum", time-of-day subtle indicator) alongside an elegant pill showing the Day's Ayah or active Reading Streak.
- **Glassmorphic Command Bar:** Integrated search input with instant keyboard shortcut indicator (`⌘K` / `Ctrl+K`), quick voice search trigger, and auto-expanding popover with recent searches & Surah quick-jumps.
- **Quick Action Pills:** Rapid jump pills for "Surah Yaseen", "Surah Al-Mulk", "Surah Al-Kahf (Fridays)", "Juz 30 (Amma)", and "Daily Quran Goal".

### 3.2 Reading Dashboard & Streak Cards
- **Unified Resumption Card:**
  - Clear visual distinction between "Continue Reading" (last read Ayah / page) and "Daily Reading Goal".
  - Clean circular progress visualization with smooth SVG stroke animations for goal completion.
  - Seamless fallback for guest users: "Start your daily journey" with one-click goal setup.

### 3.3 Surah / Juz / Revelation Order Navigation Grid
- **Chapter Card Architecture:**
  - Left: Beautiful Surah number badge framed in a clean geometric octagon / soft rounded shape.
  - Center: Surah transliterated name in bold modern typography + translated meaning in muted tone.
  - Right: Ornate Arabic calligraphy ligature (`surahnames` font) with Ayah count pill.
  - Interactive States: Smooth scale transition (`1.015x`) and subtle emerald border highlight on hover/focus.

---

## 4. Domain 2: Quran Reader & Translation View

### 4.1 Sticky Top Floating Command Bar
- **Minimalist Sticky Header:** Glassmorphic bar that gently hides on downward scroll and reappears on upward scroll to maximize reading canvas.
- **Reader Controls:**
  - Quick Surah & Ayah jumper dropdown.
  - Single-click toggle between **Translation Mode** and **Reading (Mushaf) Mode**.
  - Font scaling slider (`A-` / `A+`) with real-time responsive rem adjustments.
  - Translation selector pill showing active translator count (e.g. "English (Saheeh Int.) + 1 more").

### 4.2 Translation View Verse Cell
- **Verse Cell Layout:**
  - Header: Ayah badge (e.g. `2:255`), Juz / Page indicator, quick play button.
  - Arabic Text Body: Generous vertical padding, line-height `2.4`, crisp font rendering with full support for Uthmanic Hafs, IndoPak, and Tajweed colors.
  - Word-by-Word Interactivity: Hovering any word reveals a polished tooltip with word transliteration, English translation, and single-word audio playback.
  - Translation Section: Readable editorial typography (line-height `1.8`), footnotes rendered in gentle underlined badges that open non-intrusive popovers.
  - Contextual Action Bar: Revealed on verse hover or bottom-tap on mobile:
    - `[▶ Play Ayah]` `[📖 Tafsir]` `[💭 Reflect]` `[🔗 Share/Copy]` `[🔖 Bookmark]`

### 4.3 Reading (Mushaf) Page View
- **Framed Manuscript Experience:**
  - Subtle ornamental top and bottom headers with Surah title in calligraphy.
  - Fully justified line-by-line rendering for 15-line and 16-line Mushafs with zero line overflow.
  - Smooth page-turning buttons with keyboard Left/Right arrow hotkey hints.

---

## 5. Domain 3: Modern Audio Player Bar

### 5.1 Floating Dock Architecture
- **Floating Island Dock:** Suspended `16px` above the bottom edge on desktop and tablet with rounded corners (`16px`) and frosted glass backdrop blur.
- **Left Column:** Reciter avatar, reciter name, active Surah & Ayah (`Al-Baqarah, Ayah 255`).
- **Center Column:**
  - Prominent Play/Pause button with pulse ring animation while playing.
  - Previous / Next Ayah step buttons.
  - High-precision progress scrubber slider with timestamp counter (`01:24 / 04:15`) and hover time preview tooltip.
- **Right Column:**
  - Speed selector (`0.75x`, `1.0x`, `1.25x`, `1.5x`).
  - Repeat mode toggle (Repeat Verse / Repeat Range modal).
  - Volume slider with mute toggle.
  - Reciter switcher modal launcher with reciter search.

---

## 6. Accessibility (a11y), Performance & Responsive Design

1. **WAI-ARIA & Keyboard Navigation:**
   - Full keyboard navigation across Surah cards, verse action buttons, and audio player controls (`Space` to play/pause, `J`/`K` to seek, `Esc` to dismiss modals).
   - Screen reader announcements for active Ayah audio highlights (`aria-live="polite"`).
2. **Zero Layout Shifts (CLS 0):**
   - Fixed height containers for font-loading states with skeleton fallbacks.
3. **RTL Continuity:**
   - Perfect symmetrical mirroring for Arabic and Persian locales with logical CSS properties (`padding-inline`, `margin-inline`, `inset-inline-start`).

---

## 7. Implementation Roadmap & Milestones

1. **Milestone 1: DLS Tokens & Global Themes** — Polish SCSS variables, frosted glass effects, and typography scale.
2. **Milestone 2: Homepage Discovery & Hero** — Redesign Hero, Search command bar, reading streak widget, and Chapter cards.
3. **Milestone 3: Quran Reader & Verse Cells** — Redesign sticky navigation bar, verse cell layout, action bar, and word-by-word tooltips.
4. **Milestone 4: Floating Audio Player Dock** — Redesign bottom audio dock, scrubber, and playback control buttons.
5. **Milestone 5: End-to-End Verification** — Multi-device browser testing, accessibility auditing, and test suite execution.
