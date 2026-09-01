# UI Improvement Journey: Refactoring UI Overhaul

**Target App:** Quran.com Frontend  
**Frameworks Used:** `improve-app`, `refactoring-ui`, `microinteractions`, `web-typography`  
**Active Branch:** `feature/modern-spiritual-sanctuary-ui-ux`  

---

## 1. Journey Map & Progress Tracker

| Phase | Focus Area | Core Refactoring UI Techniques | Status |
|---|---|---|---|
| **Phase 1** | **Homepage & Chapter Grid** | Visual hierarchy, constrained spacing scale (8/16/24/32px), typography scale, glowing badges, clean card borders & micro-lift | **completed** |
| **Phase 2** | **Quran Reader & Verse Immersion** | Verse typography rhythm (Arabic line-height 2.4), translation contrast, de-emphasized metadata, contextual action menu hover states | **pending** |
| **Phase 3** | **Floating Audio Player & Dock** | Island dock elevation, sleek scrubber with tooltip time preview, unified button hierarchy, reciter badge | **pending** |
| **Phase 4** | **My Quran Dashboard & Reading Goals** | Tabular metrics hierarchy, streak progress rings, empty states with clear CTAs, clean bookmark/note cards | **pending** |

---

## 2. Phase 1 Scope & Refactoring UI Scorecard (Homepage & Chapter Grid)

### Diagnostic Baseline (Refactoring UI 7-Point Audit):
1. **Visual Hierarchy:**
   - De-emphasized secondary labels (e.g. "Surah", "Ayahs", "Revelation") vs primary chapter transliterated & translated names.
   - Distinct primary vs secondary button hierarchy in hero quick jumps.
2. **Spacing & Sizing Scale:**
   - Standardized spacing scale (4, 8, 12, 16, 20, 24, 32, 48, 64px) across all modules.
   - Enforced outer section spacing (48–64px) > card internal padding (16–24px) > element gaps (8–12px).
3. **Typography & Rhythm:**
   - Heading line-height tightened (`1.15`), body text relaxed (`1.6`).
   - Arabic calligraphy ligatures vertically aligned with English chapter names with optical centering.
4. **Depth & Elevation:**
   - Frosted obsidian glass cards with subtle multi-layer shadows (`border + 0 8px 32px rgba(...)`).
   - Optical border illumination and gentle 1.015x scale lift (`cubic-bezier(0.16, 1, 0.3, 1)`) on card hover/focus.
5. **Layout & Responsive Harmony:**
   - 3-column desktop grid with fixed aspect harmony; fluid 2-column tablet; single-column mobile.

---

## 3. Key Decisions & Change Log
- **2026-09-01**: Journey initiated. Phase 1 active on Homepage Hero, Reading Section card, and Chapter Grid tabs.
- **2026-09-01**: **Phase 1 Complete**.
  - Refactored `ChapterBlock.tsx` and `ChapterBlock.module.scss` with octagonal glowing chapter number badges (`transform: rotate(45deg)`), clear transliterated/translated hierarchy, and vertically centered Arabic ligatures (`surahnames` font).
  - Modernized `ChapterAndJuzList.module.scss` grid with constrained 16px gap on desktop/tablet and fluid responsiveness.
  - Refined `SurahPreviewRow.module.scss` with magnetic 1.015x lift, frosted glass depth, and theme resilience.
  - Enhanced `ReadingSection` & `ChapterCard` with prominent "Continue Reading" / "Verse X" pill button and SVG progress ring glow.
  - Standardized `HomePageHero` and `NavbarBody` with logical properties (`border-block-end`, `margin-inline`, `padding-inline`) and theme resilience across Dark, Light, and Sepia modes.
