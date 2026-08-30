# Brand & Visual Redesign Specification: "Royal Indigo & Celestial Emerald"

- **Status:** Approved for Implementation
- **Author:** Principal Brand Designer & Lead Frontend Architect
- **Date:** 2026-08-31
- **Branch:** `feature/modern-spiritual-sanctuary-ui-ux`

---

## 1. Brand Identity & Color Palette

### 1.1 Brand Philosophy
The **"Royal Indigo & Celestial Emerald"** identity establishes a distinctive, modern, and awe-inspiring aesthetic. It departs completely from generic flat websites by introducing:
1. **Atmospheric Depth:** Deep cosmos-inspired obsidian navy canvas (`#070A13` to `#0A0E1A`) with dynamic ambient gradient meshes.
2. **Luminous Accents:** Electric celestial cyan/emerald gradients (`#00F2FE` &rarr; `#4FACFE` &rarr; `#00E5FF`) that illuminate interactive elements, typography headers, and active reading states.
3. **Iridescent Glass Surfaces:** Frosted multi-layered glassmorphic cards (`rgba(14, 22, 40, 0.65)`) framed by ultra-fine iridescent borders (`rgba(0, 242, 254, 0.18)`).
4. **Neon Glow & Kinetic Micro-Interactions:** Subtle ambient glow shadows (`box-shadow: 0 8px 32px rgba(0, 242, 254, 0.12)`) and smooth magnetic lift on hover.

### 1.2 Master Color Token Map

| Token | Dark / Celestial Palette | Light Contrast Palette |
| :--- | :--- | :--- |
| **`--color-surface-bg`** | `#070A13` (Deep Obsidian Indigo) | `#F0F4FA` (Ice Slate) |
| **`--color-surface-card`** | `rgba(14, 22, 40, 0.70)` (Obsidian Glass) | `#FFFFFF` (Pure Card) |
| **`--color-surface-card-hover`** | `rgba(20, 32, 58, 0.85)` | `#F8FAFC` |
| **`--color-primary`** | `#00F2FE` (Electric Celestial Cyan) | `#0284C7` (Sky Blue) |
| **`--color-primary-gradient`** | `linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)` | `linear-gradient(135deg, #0284C7 0%, #0369A1 100%)` |
| **`--color-secondary-gradient`** | `linear-gradient(135deg, #05FFA1 0%, #00F2FE 100%)` | `linear-gradient(135deg, #0D9488 0%, #0284C7 100%)` |
| **`--color-border-iridescent`** | `rgba(0, 242, 254, 0.22)` | `rgba(2, 132, 199, 0.18)` |
| **`--color-glow-celestial`** | `0 0 24px rgba(0, 242, 254, 0.25)` | `0 0 16px rgba(2, 132, 199, 0.15)` |

---

## 2. Visual Overhaul Components

### 2.1 The Grand Celestial Hero Stage
- **Ambient Canvas:** Multi-layered radial gradient mesh with glowing light orbs in the background.
- **Hero Title & Typography:**
  - *"The Noble Quran"* rendered with a gradient clip (`--color-primary-gradient`) and subtle text glow.
  - Arabic Bismillah calligraphy in luminous emerald-cyan with soft drop-shadow aura.
- **Trending Quick-Jump Pills:**
  - Redesigned as floating glass capsules with neon border illumination on hover:
    - `Surah Yaseen (36)`
    - `Surah Al-Mulk (67)`
    - `Surah Al-Kahf (18)`
    - `Ayah Al-Kursi (2:255)`
    - `Juz 30 (Amma)`

### 2.2 Celestial Reading Command Center
- **Reading Streak & Resumption:**
  - High-precision circular SVG neon progress dial.
  - Glowing resume card showing last read Ayah with direct play button and glowing bookmark icon.

### 2.3 Luxury Iridescent Chapter Grid
- **Chapter Cards:**
  - Octagonal neon number badge with glowing cyan counter.
  - Bold transliterated Surah name + translated subtitle.
  - Ornate Arabic calligraphy ligature in glowing celestial font.
  - Card hover state: Magnetic `translateY(-3px)` lift + luminous border illumination + celestial shadow glow.
- **Filter Tabs:**
  - Redesigned Surah / Juz / Revelation Order tabs with glowing active slider pill.

### 2.4 Universal Navbar Spotlight Bar
- Polished centered search pill with frosted indigo glass, glowing cyan focus state, and `⌘K` badge.

---

## 3. Implementation Milestones

1. **Milestone 1: Brand Token & Palette Overhaul** — Update `src/styles/theme.scss`, `_dark.scss`, `_light.scss`, and CSS variables.
2. **Milestone 2: Grand Celestial Hero Stage** — Overhaul `HomePageHero.tsx` & `HomePageHero.module.scss` with glowing gradients and glass pills.
3. **Milestone 3: Luxury Chapter Cards & Reading Hub** — Redesign `ChapterBlock.module.scss`, `ChapterAndJuzList.module.scss`, `SurahPreviewRow.module.scss`, and `ReadingSection.module.scss`.
4. **Milestone 4: Multi-Viewport Chrome Verification & E2E Audit** — Audit on Desktop, Tablet, and Mobile to ensure 0 errors and pristine visual rendering.
