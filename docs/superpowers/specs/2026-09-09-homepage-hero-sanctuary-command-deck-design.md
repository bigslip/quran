# Modern Sanctuary Command Deck: HomePage Hero Redesign

## 1. Executive Summary
This design specification details the modern overhaul of `HomePageHero` (`src/components/HomePage/HomePageHero.tsx` and `HomePageHero.module.scss`) on Quran.ir. The redesign replaces the outdated button deck with a **Modern Sanctuary Command Deck**: a unified, centered frosted-glass hero experience combining a time-aware spiritual greeting, the **Quran.ir** Cinzel emblem, an interactive spotlight command search launcher (`⌘K`), curated quick-jump chips, and a prominent **"Continue Reading"** action dock.

---

## 2. Architecture & Component Hierarchy

```
HomePageHero
 ├── outerContainer (transparent, responsive padding, ambient celestial glow)
 └── innerContainer (max-width: 1040px, centered alignment)
      ├── greetingCapsule
      │    └── greetingBadge (frosted glass, time-aware title, animated pulse orb)
      ├── logoContainer
      │    └── Logo (Quran.ir in Cinzel typography, currentColor with primary accent)
      ├── heroSubtitle (GradualSpacing animated tagline: "Read · Recite · Reflect")
      ├── sanctuaryCommandBar (spotlight search trigger with search icon and ⌘K badge)
      ├── quickJumpTapestry (curated quick-jump pills with contextual badges)
      │    ├── Surah Yaseen (36) - Heart of the Quran
      │    ├── Surah Al-Mulk (67) - Night Recitation (dynamic ☾ badge)
      │    ├── Surah Al-Kahf (18) - Friday Sunnah (dynamic ✦ badge)
      │    ├── Ayat Al-Kursi (2:255) - Greatest Ayah
      │    └── Juz 30 (Amma) - 37 Surahs
      └── heroActionDock
           ├── ContinueReadingButton (emerald gradient, open-book icon, useGetContinueReadingUrl)
           └── ExploreSurahsButton (scroll down to Surah directory)
```

---

## 3. Detailed Specifications

### 3.1 Time-Aware Greeting Capsule
- **Dynamic Logic**: Leverages `getTimeOfDayPeriod()`, `isFriday()`, and `isNightTime()` with SSR hydration safety via `useHasMounted()`.
- **Styling**: Frosted glass capsule with subtle iridescent border (`--color-border-iridescent`), glowing pulse orb animating via `@keyframes pulse-glow`, and high-contrast typography in Light, Dark, and Sepia modes.

### 3.2 Spotlight Command Launcher
- **Trigger**: Full-width / max-width 560px frosted glass bar with search icon (`@/icons/search.svg`), prompt text (`"Search verses, surahs, topics, or jump to ayah..."`), and a keyboard shortcut badge (`"⌘K"` on macOS, `"Ctrl+K"` on Windows/Linux).
- **Interaction**: Clicking dispatches `setIsSearchModalOpen(true)` in Redux (`@/redux/slices/navbar`), opening the centered command palette search dialog modal.

### 3.3 Curated Quick-Jump Tapestry
- **Data Model**:
  - `yaseen`: Surah Yaseen (36) -> `/36` (`defaultSub: 'Heart of the Quran'`)
  - `mulk`: Surah Al-Mulk (67) -> `/67` (`defaultSub: 'Protection'`, dynamic ☾ badge when `isNightNow`)
  - `kahf`: Surah Al-Kahf (18) -> `/18` (`defaultSub: 'Friday Sunnah'`, dynamic ✦ badge when `isFridayToday`)
  - `kursi`: Ayat Al-Kursi (2:255) -> `/2/255` (`defaultSub: 'Greatest Ayah'`)
  - `juz30`: Juz 30 (Amma) -> `/juz/30` (`defaultSub: '37 Surahs'`)
- **Card Aesthetics**:
  - Translucent frosted background (`--color-surface-floating`).
  - Subtle gold accent title and metadata text.
  - Hover elevation with `-2px` lift and luminous aura.
  - Direction-aware layout with CSS logical properties (`margin-inline`, `padding-inline`).

### 3.4 Action Dock
- **Continue Reading CTA**:
  - URL from `useGetContinueReadingUrl()`.
  - Icon: `<IconBookOpen />`.
  - Gradient: `--color-primary-gradient` with gold accent hover effect.
- **Explore Surahs CTA**:
  - Smoothly scrolls the window to the Surah directory board (`#chapter-and-juz-list` or top of directory).
  - Icon: `<IconBookmarkFilled />` or list icon.

---

## 4. Theming, RTL & Accessibility

### 4.1 Theming
- Strict adherence to design tokens across Light, Dark, and Sepia themes:
  - `--color-surface-floating`
  - `--color-primary` & `--color-primary-gradient`
  - `--color-accent-gold` & `--color-accent-gold-subtle`
  - `--color-text-primary` & `--color-text-secondary`
  - `--color-border-iridescent` & `--color-border-subtle`

### 4.2 RTL Directionality
- All margins, paddings, gaps, and transforms use CSS logical properties (`margin-inline`, `padding-block`, `inset-inline-start`, `text-align: start`).
- Icons adapt appropriately in RTL mode (`/ar`, `/fa`, `/ur`).

### 4.3 Accessibility (a11y)
- All interactive buttons have explicit `aria-label` or accessible text.
- Spotlight launcher is an accessible `<button>` element with keyboard focus-visible rings (`outline-offset: 2px`).
- Decorative icons have `aria-hidden="true"`.
- Touch targets $\ge 44\text{px}$ on mobile viewports.

---

## 5. Testing & Validation Plan
1. **TypeScript Typecheck**: `npx tsc --noEmit` must pass with 0 errors.
2. **Unit Tests**:
   - `src/components/HomePage/HomePageHero.test.tsx`: Verify greeting rendering, spotlight search click, quick jump pill clicks, and continue reading navigation.
3. **Live Browser Audit**: Run `node scripts/chrome-live-monitor.mjs` to verify zero console errors, 200 OK responses, and clean layout rendering.
