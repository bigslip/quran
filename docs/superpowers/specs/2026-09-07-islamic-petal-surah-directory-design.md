# Design Specification: Islamic Petal Surah Directory (Staggered Honeycomb Tapestry)

**Date**: 2026-09-07  
**Status**: Proposed / Approved by User  
**Target Feature**: Transform the Homepage Surah list into an Islamic Arched Sanctuary Board with Staggered Yellow Petal-Shaped Medallions (Option 1).

---

## 1. Overview & Inspiration

Inspired by the classical Islamic mosque architecture reference (`surah.jpeg`) and the *Muezzin* Islamic center design language, this feature replaces the standard vertical card layout with an authentic **Staggered Islamic Petal Tapestry**.

Each of the 114 Surahs is housed inside a warm ivory-gold, 8-scalloped floral petal medallion (*Shamsa / Khatim*). These medallions interlock in alternating offset rows against a deep emerald arched sanctuary frame with ogee/mihrab crest motifs.

```
                  ┌──────────────────── ✦ ────────────────────┐
                  │              Emerald Mihrab Crest         │
                  │                                           │
                  │     ╭─╮         ╭─╮         ╭─╮         ╭─╮   │
                  │   ╭╯ 1 ╰╮     ╭╯ 2 ╰╮     ╭╯ 3 ╰╮     ╭╯ 4 ╰╮ │
                  │    ╰╮ ╭╯       ╰╮ ╭╯       ╰╮ ╭╯       ╰╮ ╭╯  │
                  │     ╰─╯         ╰─╯         ╰─╯         ╰─╯   │
                  │           ╭─╮         ╭─╮         ╭─╮     │
                  │         ╭╯ 5 ╰╮     ╭╯ 6 ╰╮     ╭╯ 7 ╰╮   │
                  │          ╰╮ ╭╯       ╰╮ ╭╯       ╰╮ ╭╯    │
                  │           ╰─╯         ╰─╯         ╰─╯     │
                  │     ╭─╮         ╭─╮         ╭─╮         ╭─╮   │
                  │   ╭╯ 8 ╰╮     ╭╯ 9 ╰╮     ╭╯10 ╰╮     ╭╯11 ╰╮ │
                  │    ╰╮ ╭╯       ╰╮ ╭╯       ╰╮ ╭╯       ╰╮ ╭╯  │
                  │     ╰─╯         ╰─╯         ╰─╯         ╰─╯   │
                  │                                           │
                  └──────────────────── ✦ ────────────────────┘
```

---

## 2. Component Architecture

### 2.1 `PetalSurahCard` (`src/components/chapters/PetalSurahCard/`)
- **File Structure**:
  - `PetalSurahCard.tsx`: Interactive link card component.
  - `PetalSurahCard.module.scss`: Styling, transforms, hover states, and responsive scaling.
  - `PetalSurahCard.test.tsx`: Unit tests verifying rendering, click events, localized numbers, and a11y attributes.
- **Visual & Structural Elements**:
  1. **Petal SVG Silhouette**:
     - Smooth 8-lobed scalloped diamond/rosette vector path.
     - Fill: Warm cream/ivory-gold gradient (`#fffef5` $\rightarrow$ `#fef3c7` $\rightarrow$ `#fde68a`).
     - Stroke: `1.5px` to `2.5px` gold border (`#f59e0b` / `var(--color-accent-gold)`).
     - Inner shadow / ambient depth for tactile elevation.
  2. **Surah Index Badge**:
     - Circular emerald/gold medallion at the top (`width: 26px`, `height: 26px`).
     - Displaying localized number (`toLocalizedNumber(chapter.id, lang)`).
  3. **Arabic Calligraphy Title**:
     - Rendered in Amiri font or `ChapterIconContainer` in deep sanctuary green (`#064e3b`).
  4. **Transliterated Surah Title**:
     - Display serif font (`Cinzel`, `weight: 700`, `letter-spacing: 0.04em`).
  5. **Metadata Tags**:
     - Number of Ayahs (`7 Ayahs`) and Revelation Place (`Makki` / `Madani`) in subtle amber tags.
  6. **Interactions**:
     - Hover: Smooth $-6\text{px}$ lift, scale $(1.04)$, luminous golden aura drop-shadow.
     - Focus-Visible: Accessible 2px gold focus ring with offset.
     - Touch: Minimum $44\text{px} \times 44\text{px}$ effective tap target.

### 2.2 `IslamicSanctuaryBoard` Container (`src/components/chapters/ChapterAndJuzList.module.scss` or Subcomponent)
- **Sanctuary Backdrop**:
  - Deep sanctuary emerald radial gradient (`radial-gradient(circle at 50% 20%, #065f46 0%, #04382c 60%, #02241c 100%)`).
  - Subtle arabesque/geometric texture overlay at low opacity (`0.05`).
  - Arched mihrab/ogee crest at the top and bottom with gold calligraphy/arabesque dividers.
  - Smooth rounded corners (`border-radius: 32px`) and ambient box shadow.

### 2.3 Staggered Honeycomb Layout Engine
- Responsive row chunking:
  - **Desktop ($\ge 1024\text{px}$)**: Alternating rows of $4 \rightarrow 3 \rightarrow 4 \rightarrow 3 \dots$ with vertical overlap (`margin-top: -30px`).
  - **Tablet ($768\text{px} - 1023\text{px}$)**: Alternating rows of $3 \rightarrow 2 \rightarrow 3 \rightarrow 2 \dots$ with vertical overlap (`margin-top: -24px`).
  - **Mobile ($< 768\text{px}$)**: Alternating rows of $2 \rightarrow 1 \rightarrow 2 \rightarrow 1 \dots$ (or responsive fluid wrap) with compact petal scaling (`150px` - `165px`).
- Preserves filter/search reactivity: When filtering (e.g. searching "Kahf" or filtering "Madani"), the remaining subset dynamically re-chunks into the staggered honeycomb grid without layout jumps.

---

## 3. Integration & Compatibility

1. **Quick Search & Filter Scrubber**:
   - The search input and Makki/Madani filter pills remain at the top of the section, styled in harmony with the emerald sanctuary theme.
2. **Tabs (Surah / Juz / Revelation Order)**:
   - **Surah Tab**: Displays the Staggered Honeycomb Petal Tapestry.
   - **Revelation Order Tab**: Displays the Staggered Honeycomb Petal Tapestry sorted chronologically.
   - **Juz Tab**: Displays the existing Juz view with harmonized sanctuary styling.
3. **Sort Controls**:
   - Ascending / Descending sorting cleanly re-orders the honeycomb array.
4. **Localization (i18n) & RTL**:
   - Full support for Arabic (`/ar`), Urdu (`/ur`), Persian (`/fa`), and English.
   - Number localization via `toLocalizedNumber`.

---

## 4. Testing & Verification Plan

1. **Unit Tests**:
   - `PetalSurahCard.test.tsx`: Test rendering of all 114 Surahs, localized numbers, metadata badges, and click triggers.
   - `ChapterAndJuzList.test.tsx`: Test search filtering, tab switching, and empty state rendering.
2. **Visual & Cross-Theme Verification**:
   - Dark mode, Light mode, and Sepia mode rendering.
   - Responsive viewports: Desktop ($1440\text{px}$), Tablet ($768\text{px}$), Mobile ($390\text{px}$, $375\text{px}$).
3. **Automated Audits**:
   - `npx tsc --noEmit` (0 errors).
   - Full test suite pass (`yarn test`).
   - `chrome-live-monitor.mjs` for zero runtime/console errors.
