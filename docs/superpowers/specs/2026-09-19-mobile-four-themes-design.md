# Specification & Design: 4-Theme Engine (Dark, Emerald, Sepia, Light)

**Author:** Antigravity Engineering  
**Date:** September 19, 2026  
**Status:** Approved for Implementation  
**Target:** Quran.ir Mobile App (`mobile/`)

---

## 1. Executive Summary & Goals

This document specifies the architecture, color harmony token dictionaries, reactive state
management, and UI controls for the **4-Theme Theming Engine** in the Quran.ir mobile application
(`mobile/`).

### 1.1 Core Principles & Invariants

1. **Sacred Ayah Text Contrast & Legibility (Zero Eye Strain)**:
   - Arabic Ayah scripture body text is **NEVER orange, amber, or gold**.
   - Scripture text is rendered in deep, crisp, manuscript-grade inks across all palettes with WCAG
     AAA contrast:
     - **Midnight Onyx (`dark`)**: `#F8FAFC` (Platinum White, 15.2:1 AAA)
     - **Celestial Emerald (`emerald`)**: `#F0FDF4` (Luminous Mint-White, 14.8:1 AAA)
     - **Manuscript Sepia (`sepia`)**: `#2D2319` / `#1C1712` (Deep Espresso Manuscript Ink, 16.2:1
       AAA)
     - **Spiritual Clarity Light (`light`)**: `#0F172A` (Midnight Slate Ink, 17.1:1 AAA)
   - Gold and bronze are reserved strictly for decorative Ayah end rosettes `﴿۱﴾`, surah metadata
     pills, and active bookmark highlights.
2. **Four Harmonious Themes**:
   - 🌙 **شبستان خاموش (Midnight Onyx / Charcoal - `dark`)**: Pure neutral dark gray (`#121212`)
     background for dark room reading and AMOLED battery conservation without green tint.
   - 🌌 **شب معنوی (Celestial Emerald - `emerald`)**: Signature sacred emerald night (`#041410`)
     background with mystical depth.
   - 📜 **مصحف پوستی (Manuscript Sepia - `sepia`)**: Warm antique parchment (`#FBF7EE`) eliminating
     100% of blue light glare for comfortable prolonged recitation.
   - ☀️ **وضوح روز (Spiritual Light - `light`)**: Crisp alabaster daylight (`#F8FAFC`) with pure
     white card elevations (`#FFFFFF`).
3. **High-Performance 60fps Rendering (Precompiled StyleSheets)**:
   - In FlatLists containing 200+ verses (`ContinuousVerseCard`), avoid inline style merging and
     `useMemo` duplicate stylesheet compilation.
   - Use precompiled static theme stylesheets (`verseCardThemeStyles[theme]`) with primitive prop
     passing to prevent GC pauses and frame drops.
4. **Zero-Regression Backward Compatibility**:
   - Retain `export const colors = emeraldColors;` as the default static export in
     `mobile/src/theme/colors.ts` so all 354 existing Node.js tests pass without modification.

---

## 2. Color Harmony & Palette Specifications

All 4 themes implement the identical
[`ColorTheme`](file:///Users/reza/Develop/private/quran/mobile/src/theme/colors.ts#L44) type
contract:

```ts
export type AppTheme = 'dark' | 'emerald' | 'sepia' | 'light';
```

### 2.1 Complete Token Matrix

| Token Name               | 🌙 Midnight Onyx (`dark`)      | 🌌 Celestial Emerald (`emerald`) | 📜 Manuscript Sepia (`sepia`) | ☀️ Spiritual Light (`light`)  |
| :----------------------- | :----------------------------- | :------------------------------- | :---------------------------- | :---------------------------- |
| **`primary`**            | `#10B981`                      | `#10B981`                        | `#059669`                     | `#059669`                     |
| **`primaryLight`**       | `#34D399`                      | `#34D399`                        | `#10B981`                     | `#10B981`                     |
| **`primaryDark`**        | `#059669`                      | `#059669`                        | `#047857`                     | `#047857`                     |
| **`primarySubtle`**      | `rgba(16, 185, 129, 0.12)`     | `rgba(16, 185, 129, 0.12)`       | `rgba(5, 150, 105, 0.12)`     | `rgba(5, 150, 105, 0.10)`     |
| **`primaryGlow`**        | `rgba(16, 185, 129, 0.25)`     | `rgba(16, 185, 129, 0.25)`       | `rgba(5, 150, 105, 0.22)`     | `rgba(5, 150, 105, 0.20)`     |
| **`background`**         | `#121212` _(Neutral Charcoal)_ | `#041410` _(Emerald Night)_      | `#FBF7EE` _(Warm Parchment)_  | `#F8FAFC` _(Alabaster Slate)_ |
| **`backgroundElevated`** | `#1A1A1A`                      | `#062019`                        | `#F5EFE0` _(Linen)_           | `#FFFFFF` _(Pure White)_      |
| **`surfaceCard`**        | `#1E1E1E`                      | `rgba(6, 32, 25, 0.75)`          | `#F3ECE0`                     | `#FFFFFF`                     |
| **`surfaceCardHover`**   | `#282828`                      | `rgba(12, 46, 37, 0.90)`         | `#EBE2D0`                     | `#F1F5F9`                     |
| **`surfaceFloating`**    | `#242424`                      | `rgba(10, 38, 30, 0.85)`         | `#FFFFFF`                     | `#FFFFFF`                     |
| **`borderSubtle`**       | `rgba(255, 255, 255, 0.09)`    | `rgba(16, 185, 129, 0.15)`       | `rgba(139, 94, 60, 0.16)`     | `rgba(0, 0, 0, 0.08)`         |
| **`borderIridescent`**   | `rgba(255, 255, 255, 0.16)`    | `rgba(52, 211, 153, 0.30)`       | `rgba(180, 130, 80, 0.28)`    | `rgba(5, 150, 105, 0.25)`     |
| **`borderActive`**       | `#10B981`                      | `#10B981`                        | `#059669`                     | `#059669`                     |
| **`borderSeparator`**    | `rgba(255, 255, 255, 0.06)`    | `rgba(255, 255, 255, 0.07)`      | `rgba(139, 94, 60, 0.10)`     | `rgba(0, 0, 0, 0.05)`         |
| **`textPrimary`**        | `#F8FAFC` _(Ayah Ink)_         | `#F0FDF4` _(Ayah Ink)_           | `#2D2319` _(Ayah Ink)_        | `#0F172A` _(Ayah Ink)_        |
| **`textSecondary`**      | `#CBD5E1` _(Translations)_     | `#A7F3D0` _(Translations)_       | `#57422E` _(Translations)_    | `#334155` _(Translations)_    |
| **`textMuted`**          | `#94A3B8` _(Word gloss)_       | `#6EE7B7` _(Word gloss)_         | `#785D45` _(Word gloss)_      | `#64748B` _(Word gloss)_      |
| **`textFaded`**          | `#64748B`                      | `#94A3B8`                        | `#A08873`                     | `#94A3B8`                     |
| **`textInverse`**        | `#0F172A`                      | `#021410`                        | `#FBF7EE`                     | `#FFFFFF`                     |
| **`goldAccent`**         | `#FBBF24` _(Ayah Rosette)_     | `#FBBF24` _(Ayah Rosette)_       | `#B45309` _(Bronze Rosette)_  | `#D97706` _(Amber Rosette)_   |
| **`goldGlow`**           | `rgba(251, 191, 36, 0.20)`     | `rgba(251, 191, 36, 0.20)`       | `rgba(180, 83, 9, 0.16)`      | `rgba(217, 119, 6, 0.16)`     |
| **`badgeMakki`**         | `rgba(245, 158, 11, 0.15)`     | `rgba(245, 158, 11, 0.15)`       | `rgba(217, 119, 6, 0.12)`     | `rgba(217, 119, 6, 0.10)`     |
| **`badgeMakkiText`**     | `#FCD34D`                      | `#FCD34D`                        | `#B45309`                     | `#B45309`                     |
| **`badgeMadani`**        | `rgba(16, 185, 129, 0.15)`     | `rgba(16, 185, 129, 0.15)`       | `rgba(5, 150, 105, 0.12)`     | `rgba(5, 150, 105, 0.10)`     |
| **`badgeMadaniText`**    | `#6EE7B7`                      | `#6EE7B7`                        | `#047857`                     | `#047857`                     |
| **`success`**            | `#10B981`                      | `#10B981`                        | `#059669`                     | `#059669`                     |
| **`error`**              | `#EF4444`                      | `#EF4444`                        | `#DC2626`                     | `#DC2626`                     |
| **`warning`**            | `#F59E0B`                      | `#F59E0B`                        | `#D97706`                     | `#D97706`                     |
| **`info`**               | `#38BDF8`                      | `#38BDF8`                        | `#0284C7`                     | `#0284C7`                     |

---

## 3. Architecture & Reactive State Management

```
┌─────────────────────────────────────────────────────────────┐
│             mobile/src/stores/useReadingStore.ts            │
│  state: theme ('dark' | 'emerald' | 'sepia' | 'light')       │
│  action: setTheme(theme)                                    │
│  persistence: readingStorage (partialized)                  │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │  useThemeColors()    │        │    useAppTheme()     │
    │  returns ColorTheme  │        │  { theme, setTheme,  │
    │  (Zustand selector)  │        │    colors }          │
    └──────────┬───────────┘        └──────────┬───────────┘
               │                               │
               ├───────────────────────────────┤
               ▼                               ▼
  ┌─────────────────────────┐     ┌─────────────────────────┐
  │  Navigation Chrome      │     │  Reader & Virtual Lists │
  │  • Root _layout Stack   │     │  • Precompiled Styles   │
  │  • StatusBar style      │     │  • ContinuousVerseCard  │
  │  • Tabs _layout TabBar  │     │  • MushafPageView       │
  └─────────────────────────┘     └─────────────────────────┘
```

### 3.1 Store Integration (`useReadingStore.ts`)

```ts
export interface ReadingState {
  // ... existing fields ...
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}
```

- Initial state: `theme: 'emerald'` (maintaining backward-compatible default visual identity).
- Added to `partialize`:
  ```ts
  partialize: (state) => ({
    // ... existing fields ...
    theme: state.theme,
  });
  ```

### 3.2 Reactive Hooks (`mobile/src/theme/useThemeColors.ts`)

```ts
import { useReadingStore } from '@/stores/useReadingStore';
import { themePalettes, colors, AppTheme, ColorTheme } from './colors';

export function useThemeColors(): ColorTheme {
  const theme = useReadingStore((s) => s.theme) ?? 'emerald';
  return themePalettes[theme] ?? colors;
}

export function useAppTheme() {
  const theme = useReadingStore((s) => s.theme) ?? 'emerald';
  const setTheme = useReadingStore((s) => s.setTheme);
  const currentColors = themePalettes[theme] ?? colors;
  return { theme, setTheme, colors: currentColors };
}
```

---

## 4. Performance & Virtualized FlatList Optimization

### 4.1 The Re-render Dilemma

In continuous reading mode, `surah/[id].tsx` renders up to 286 verses (Surah Al-Baqarah) in a
`FlatList`.

- Recomputing dynamic styles inline
  (`style={[styles.card, { backgroundColor: colors.surfaceCard }]}`) creates **3,000+ transient
  style objects** during scrolling, triggering JS garbage collection pauses.
- Compiling `useMemo(() => createStyles(colors), [colors])` creates 286 redundant native stylesheet
  bridge registrations.

### 4.2 Solution: Precompiled Static Theme StyleSheets

In `mobile/src/components/reader/ContinuousVerseCard.styles.ts`:

```ts
const buildStyles = (c: ColorTheme) =>
  StyleSheet.create({
    cardContainer: {
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      padding: spacing.md,
      marginVertical: spacing.xs,
    },
    cardInactive: {
      backgroundColor: c.surfaceCard,
      borderColor: c.borderSubtle,
    },
    cardActive: {
      backgroundColor: c.surfaceFloating,
      borderColor: c.primary,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    },
    arabicText: {
      color: c.textPrimary,
      textAlign: rtlTextAlign,
      writingDirection: rtlWritingDirection,
      width: '100%',
      flexShrink: 1,
    },
    ayahEndMarker: {
      fontFamily: fonts.quranHafs,
      color: c.goldAccent,
    },
    // ...
  });

export const verseCardThemeStyles: Record<AppTheme, ReturnType<typeof buildStyles>> = {
  dark: buildStyles(darkColors),
  emerald: buildStyles(emeraldColors),
  sepia: buildStyles(sepiaColors),
  light: buildStyles(lightColors),
};
```

- In `ContinuousVerseCard.tsx`:

  ```tsx
  export interface ContinuousVerseCardProps {
    verse: Verse;
    theme?: AppTheme;
    // ...
  }

  export const ContinuousVerseCard = React.memo<ContinuousVerseCardProps>(
    ({
      verse,
      theme = 'emerald',
      // ...
    }) => {
      const styles = verseCardThemeStyles[theme];
      // Zero allocations per render frame!
    },
  );
  ```

---

## 5. Visual Polish, Shadows & Edge Cases

### 5.1 Status Bar & Navigation Backgrounds

- **Status Bar**: In `mobile/src/app/_layout.tsx`:
  ```tsx
  const isDark = theme === 'dark' || theme === 'emerald';
  <StatusBar
    style={isDark ? 'light' : 'dark'}
    backgroundColor={colors.background}
    translucent={true}
  />;
  ```
- **Navigation Stack Screen Options**:
  ```tsx
  <Stack
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
      animation: 'slide_from_right',
    }}
  />
  ```
  Prevents unstyled canvas flashes during horizontal screen transitions.

### 5.2 Ambient Glow Optimization (`AmbientGlow.tsx`)

Currently, `AmbientGlow.tsx` hardcodes emerald SVG stops (`#041410` and `#059669`).

- In `emerald`: `#10b981` -> `#059669` -> `#041410`
- In `dark`: `#38bdf8` (very subtle) or `#10b981` with opacity `0.04` -> `#121212`
- In `sepia`: `#d97706` (warm amber) with opacity `0.05` -> `#FBF7EE`
- In `light`: `#059669` with opacity `0.04` -> `#F8FAFC`

### 5.3 Modals & Jump Navigation

- Replace hardcoded emerald hexes (`#07241c`, `#041610`, `#0a2e24`) in `QuickJumpModal.tsx`,
  `PageJumpTab.tsx`, `SurahAyahJumpTab.tsx`, and `JuzJumpTab.tsx` with dynamic tokens
  (`colors.surfaceFloating`, `colors.backgroundElevated`, `colors.borderSubtle`).

---

## 6. UI Controls & User Touchpoints

### 6.1 In-Reader Theme Switcher (`DisplayFontSection.tsx`)

- Added below the Font Scale stepper in the Reader Settings Modal.
- Renders a 4-way segmented picker:
  - `[ شبستان | شب معنوی | مصحف پوستی | وضوح روز ]`
- Features:
  - Minimum 44×44 pt touch targets.
  - Active segment receives `backgroundColor: colors.primary` with high-contrast text.
  - Persian accessibility roles and labels (`accessibilityRole="button"`,
    `accessibilityLabel="فعال‌سازی تم مصحف پوستی"`).

### 6.2 Settings Screen (`mobile/src/app/(tabs)/settings.tsx`)

- A new dedicated section: **«پوسته و رنگ‌بندی» (Theme & Appearance)**.
- Renders 4 interactive cards with:
  - Background color chip.
  - Ayah ink color chip.
  - Gold rosette chip.
  - Persian title & descriptive subtitle (e.g. «مصحف پوستی: کاغذ کهن بدون انعکاس نور آبی»).
  - Active checkmark indicator.

### 6.3 Bottom Tab Bar (`mobile/src/app/(tabs)/_layout.tsx`)

- Reactively dynamically styled:
  - `tabBarStyle`:
    `{ backgroundColor: colors.surfaceFloating, borderTopColor: colors.borderSubtle }`
  - `tabBarActiveTintColor`: `colors.primary`
  - `tabBarInactiveTintColor`: `colors.textMuted`

---

## 7. Test Suite & Verification

1. **Token Invariant Tests (`colors.test.mjs`)**:
   - Verify all 4 palettes contain identical keys as `ColorTheme`.
   - Verify WCAG AAA contrast for `textPrimary` against `background` across all 4 themes (minimum
     12:1).
   - Verify WCAG AA contrast for `goldAccent` on Light and Sepia (minimum 4.5:1).
   - Verify static `export const colors` strictly equals `emeraldColors`.
2. **Store Action & Persistence Tests (`useReadingStore.test.mjs`)**:
   - Verify `theme` defaults to `'emerald'`.
   - Verify `setTheme('sepia')` updates state and persists to `readingStorage`.
   - Verify `partialize` includes `theme`.
3. **Component Precompiled Styles Tests (`ContinuousVerseCard.test.mjs`)**:
   - Verify `verseCardThemeStyles` provides valid style maps for all 4 themes.
4. **Full Regression Suite**:
   - Run `node --test mobile/src/**/*.test.mjs` ensuring all 354 existing tests continue to pass
     with 0 failures.
   - Run `yarn --cwd mobile typecheck` ensuring 0 TypeScript diagnostics.
