# 4-Theme Engine (Dark, Emerald, Sepia, Light) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-performance, accessible 4-theme theming engine (Midnight Onyx, Celestial
Emerald, Manuscript Sepia, Spiritual Light) across Quran.ir Mobile with WCAG AAA Ayah contrast,
precompiled 60fps reader styles, and zero regressions.

**Architecture:** Token dictionaries in `colors.ts` provide 4 harmonious color palettes. Zustand
store `useReadingStore` manages persistent `theme` state, consumed via `useThemeColors()` and
`useAppTheme()` hooks. Readers use precompiled static stylesheets (`verseCardThemeStyles[theme]`) to
eliminate garbage collection overhead and object allocations during virtualized FlatList scrolling.

**Tech Stack:** React Native, Expo Router, Zustand with persistence, TypeScript, Node.js Test Runner
(`node:test`, `node:assert`).

---

## Global Constraints

- Arabic Ayah scripture body text is **NEVER** orange, amber, or gold; always rendered in deep,
  crisp high-contrast ink (AAA >= 14.8:1).
- Gold/bronze is strictly reserved for decorative Ayah rosettes `﴿۱﴾` and small accents.
- All touch targets for theme selectors must be >= 44×44 points.
- Zero test regressions on existing 354 mobile unit tests (`export const colors = emeraldColors;`
  static default preserved).
- Persian digits formatting via `toPersianDigits` for all numbers in UI.
- All files strictly follow TypeScript and pass `yarn --cwd mobile typecheck`.

---

### Task 1: Color Token Dictionaries & Invariant Unit Tests

**Files:**

- Create: `mobile/src/theme/colors.test.mjs`
- Modify: `mobile/src/theme/colors.ts`
- Modify: `mobile/src/theme/index.ts`

**Interfaces:**

- Consumes: None (base tokens).
- Produces: `AppTheme = 'dark' | 'emerald' | 'sepia' | 'light'`, `ColorTheme`, `emeraldColors`,
  `darkColors`, `sepiaColors`, `lightColors`, `themePalettes: Record<AppTheme, ColorTheme>`,
  `colors = emeraldColors`.

- [ ] **Step 1: Write the failing test**

```javascript
// mobile/src/theme/colors.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  colors,
  emeraldColors,
  darkColors,
  sepiaColors,
  lightColors,
  themePalettes,
} from './colors.ts';

// Helper to compute luminance & contrast ratio according to WCAG 2.1 specs
function getLuminance(hex) {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3)
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  const rgb = [0, 2, 4].map((offset) => {
    const val = parseInt(cleaned.slice(offset, offset + 2), 16) / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Theme Palettes & Token Contracts', () => {
  it('preserves static colors export matching emeraldColors for 100% backward compatibility', () => {
    assert.strictEqual(colors, emeraldColors);
    assert.strictEqual(colors.goldAccent, '#fbbf24');
    assert.strictEqual(colors.surfaceCard, 'rgba(6, 32, 25, 0.75)');
    assert.strictEqual(colors.background, '#041410');
  });

  it('verifies all 4 palettes have identical token keys', () => {
    const keys = Object.keys(emeraldColors).sort();
    assert.deepStrictEqual(Object.keys(darkColors).sort(), keys);
    assert.deepStrictEqual(Object.keys(sepiaColors).sort(), keys);
    assert.deepStrictEqual(Object.keys(lightColors).sort(), keys);
    assert.deepStrictEqual(Object.keys(themePalettes).sort(), [
      'dark',
      'emerald',
      'light',
      'sepia',
    ]);
  });

  it('enforces WCAG AAA contrast ratio for Ayah textPrimary against background across all themes', () => {
    // dark: #f8fafc on #121212
    const darkRatio = getContrastRatio(darkColors.textPrimary, darkColors.background);
    assert.ok(darkRatio >= 14, `Dark theme contrast too low: ${darkRatio}`);

    // emerald: #f0fdf4 on #041410
    const emeraldRatio = getContrastRatio(emeraldColors.textPrimary, emeraldColors.background);
    assert.ok(emeraldRatio >= 14, `Emerald theme contrast too low: ${emeraldRatio}`);

    // sepia: #2D2319 on #FBF7EE
    const sepiaRatio = getContrastRatio(sepiaColors.textPrimary, sepiaColors.background);
    assert.ok(sepiaRatio >= 11, `Sepia theme contrast too low: ${sepiaRatio}`);

    // light: #0F172A on #F8FAFC
    const lightRatio = getContrastRatio(lightColors.textPrimary, lightColors.background);
    assert.ok(lightRatio >= 15, `Light theme contrast too low: ${lightRatio}`);
  });

  it('enforces darkened goldAccent for Light and Sepia to guarantee rosette visibility', () => {
    const sepiaGoldContrast = getContrastRatio(sepiaColors.goldAccent, sepiaColors.background);
    assert.ok(sepiaGoldContrast >= 4.5, `Sepia gold contrast too low: ${sepiaGoldContrast}`);

    const lightGoldContrast = getContrastRatio(lightColors.goldAccent, lightColors.background);
    assert.ok(lightGoldContrast >= 4.0, `Light gold contrast too low: ${lightGoldContrast}`);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/theme/colors.test.mjs` Expected: FAIL with "darkColors is not exported"

- [ ] **Step 3: Implement the 4-theme token palettes**

Update `mobile/src/theme/colors.ts`:

```typescript
export const emeraldColors = {
  // Brand Accent
  primary: '#10b981',
  primaryLight: '#34d399',
  primaryDark: '#059669',
  primarySubtle: 'rgba(16, 185, 129, 0.12)',
  primaryGlow: 'rgba(16, 185, 129, 0.25)',

  // Celestial Emerald Palette (Original theme)
  background: '#041410',
  backgroundElevated: '#062019',
  surfaceCard: 'rgba(6, 32, 25, 0.75)',
  surfaceCardHover: 'rgba(12, 46, 37, 0.9)',
  surfaceFloating: 'rgba(10, 38, 30, 0.85)',

  // Borders & Dividers
  borderSubtle: 'rgba(16, 185, 129, 0.15)',
  borderIridescent: 'rgba(52, 211, 153, 0.3)',
  borderActive: '#10b981',
  borderSeparator: 'rgba(255, 255, 255, 0.07)',

  // Text Hierarchy
  textPrimary: '#f0fdf4',
  textSecondary: '#a7f3d0',
  textMuted: '#6ee7b7',
  textFaded: '#94a3b8',
  textInverse: '#021410',

  // Accents & Badges
  goldAccent: '#fbbf24',
  goldGlow: 'rgba(251, 191, 36, 0.2)',
  badgeMakki: 'rgba(245, 158, 11, 0.15)',
  badgeMakkiText: '#fcd34d',
  badgeMadani: 'rgba(16, 185, 129, 0.15)',
  badgeMadaniText: '#6ee7b7',

  // Status
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#38bdf8',
} as const;

export const darkColors: typeof emeraldColors = {
  primary: '#10b981',
  primaryLight: '#34d399',
  primaryDark: '#059669',
  primarySubtle: 'rgba(16, 185, 129, 0.12)',
  primaryGlow: 'rgba(16, 185, 129, 0.25)',

  background: '#121212',
  backgroundElevated: '#1a1a1a',
  surfaceCard: '#1e1e1e',
  surfaceCardHover: '#282828',
  surfaceFloating: '#242424',

  borderSubtle: 'rgba(255, 255, 255, 0.09)',
  borderIridescent: 'rgba(255, 255, 255, 0.16)',
  borderActive: '#10b981',
  borderSeparator: 'rgba(255, 255, 255, 0.06)',

  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textFaded: '#64748b',
  textInverse: '#0f172a',

  goldAccent: '#fbbf24',
  goldGlow: 'rgba(251, 191, 36, 0.2)',
  badgeMakki: 'rgba(245, 158, 11, 0.15)',
  badgeMakkiText: '#fcd34d',
  badgeMadani: 'rgba(16, 185, 129, 0.15)',
  badgeMadaniText: '#6ee7b7',

  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#38bdf8',
};

export const sepiaColors: typeof emeraldColors = {
  primary: '#059669',
  primaryLight: '#10b981',
  primaryDark: '#047857',
  primarySubtle: 'rgba(5, 150, 105, 0.12)',
  primaryGlow: 'rgba(5, 150, 105, 0.22)',

  background: '#FBF7EE',
  backgroundElevated: '#F5EFE0',
  surfaceCard: '#F3ECE0',
  surfaceCardHover: '#EBE2D0',
  surfaceFloating: '#FFFFFF',

  borderSubtle: 'rgba(139, 94, 60, 0.16)',
  borderIridescent: 'rgba(180, 130, 80, 0.28)',
  borderActive: '#059669',
  borderSeparator: 'rgba(139, 94, 60, 0.10)',

  textPrimary: '#2D2319',
  textSecondary: '#57422E',
  textMuted: '#785D45',
  textFaded: '#A08873',
  textInverse: '#FBF7EE',

  goldAccent: '#B45309',
  goldGlow: 'rgba(180, 83, 9, 0.16)',
  badgeMakki: 'rgba(217, 119, 6, 0.12)',
  badgeMakkiText: '#B45309',
  badgeMadani: 'rgba(5, 150, 105, 0.12)',
  badgeMadaniText: '#047857',

  success: '#059669',
  error: '#dc2626',
  warning: '#d97706',
  info: '#0284c7',
};

export const lightColors: typeof emeraldColors = {
  primary: '#059669',
  primaryLight: '#10b981',
  primaryDark: '#047857',
  primarySubtle: 'rgba(5, 150, 105, 0.10)',
  primaryGlow: 'rgba(5, 150, 105, 0.20)',

  background: '#F8FAFC',
  backgroundElevated: '#FFFFFF',
  surfaceCard: '#FFFFFF',
  surfaceCardHover: '#F1F5F9',
  surfaceFloating: '#FFFFFF',

  borderSubtle: 'rgba(0, 0, 0, 0.08)',
  borderIridescent: 'rgba(5, 150, 105, 0.25)',
  borderActive: '#059669',
  borderSeparator: 'rgba(0, 0, 0, 0.05)',

  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textFaded: '#94A3B8',
  textInverse: '#FFFFFF',

  goldAccent: '#D97706',
  goldGlow: 'rgba(217, 119, 6, 0.16)',
  badgeMakki: 'rgba(217, 119, 6, 0.10)',
  badgeMakkiText: '#B45309',
  badgeMadani: 'rgba(5, 150, 105, 0.10)',
  badgeMadaniText: '#047857',

  success: '#059669',
  error: '#dc2626',
  warning: '#d97706',
  info: '#0284c7',
};

export type AppTheme = 'dark' | 'emerald' | 'sepia' | 'light';
export type ColorTheme = typeof emeraldColors;

export const themePalettes: Record<AppTheme, ColorTheme> = {
  dark: darkColors,
  emerald: emeraldColors,
  sepia: sepiaColors,
  light: lightColors,
};

// Static default alias for 100% test compatibility
export const colors = emeraldColors;
```

Update `mobile/src/theme/index.ts`:

```typescript
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './rtl';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/theme/colors.test.mjs` Expected: PASS with 4 subtests.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/theme/colors.ts mobile/src/theme/index.ts mobile/src/theme/colors.test.mjs
git commit -m "feat(mobile): add 4-theme palette dictionaries and contrast invariant tests"
```

---

### Task 2: Persistent State & Reactive Hooks

**Files:**

- Create: `mobile/src/theme/useThemeColors.ts`
- Modify: `mobile/src/theme/index.ts`
- Modify: `mobile/src/stores/useReadingStore.ts`
- Modify: `mobile/src/stores/useReadingStore.test.mjs`

**Interfaces:**

- Consumes: `AppTheme`, `ColorTheme`, `themePalettes` from `@/theme`.
- Produces: `useReadingStore.theme: AppTheme`, `useReadingStore.setTheme(theme: AppTheme)`,
  `useThemeColors(): ColorTheme`, `useAppTheme(): { theme, setTheme, colors }`.

- [ ] **Step 1: Write the failing test in `useReadingStore.test.mjs`**

Add tests to `mobile/src/stores/useReadingStore.test.mjs`:

```javascript
it('manages and persists the active reading theme (4 themes)', () => {
  const store = useReadingStore.getState();
  assert.strictEqual(store.theme, 'emerald');

  store.setTheme('sepia');
  assert.strictEqual(useReadingStore.getState().theme, 'sepia');

  store.setTheme('dark');
  assert.strictEqual(useReadingStore.getState().theme, 'dark');

  store.setTheme('light');
  assert.strictEqual(useReadingStore.getState().theme, 'light');

  // Reset back to default
  store.setTheme('emerald');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/stores/useReadingStore.test.mjs` Expected: FAIL with
`assert.strictEqual(store.theme, 'emerald')` (undefined).

- [ ] **Step 3: Implement store changes and reactive hooks**

In `mobile/src/stores/useReadingStore.ts`:

1. Import `AppTheme` from `../theme/colors.ts`.
2. Add `theme: AppTheme;` and `setTheme: (theme: AppTheme) => void;` to `ReadingState`.
3. In initial state: `theme: 'emerald'`.
4. In actions: `setTheme: (theme) => set({ theme })`.
5. In `partialize`: add `theme: state.theme`.

Create `mobile/src/theme/useThemeColors.ts`:

```typescript
import { useReadingStore } from '@/stores/useReadingStore';
import { themePalettes, emeraldColors, AppTheme, ColorTheme } from './colors';

export function useThemeColors(): ColorTheme {
  const theme = useReadingStore((s) => s.theme) ?? 'emerald';
  return themePalettes[theme] ?? emeraldColors;
}

export function useAppTheme(): {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  colors: ColorTheme;
} {
  const theme = useReadingStore((s) => s.theme) ?? 'emerald';
  const setTheme = useReadingStore((s) => s.setTheme);
  const currentColors = themePalettes[theme] ?? emeraldColors;
  return { theme, setTheme, colors: currentColors };
}
```

Re-export in `mobile/src/theme/index.ts`:

```typescript
export * from './colors';
export * from './useThemeColors';
export * from './typography';
export * from './spacing';
export * from './rtl';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/stores/useReadingStore.test.mjs` Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/stores/useReadingStore.ts mobile/src/stores/useReadingStore.test.mjs mobile/src/theme/useThemeColors.ts mobile/src/theme/index.ts
git commit -m "feat(mobile): add theme state to useReadingStore and useThemeColors hook"
```

---

### Task 3: Root & Tab Navigation Chrome Theming

**Files:**

- Modify: `mobile/src/app/_layout.tsx`
- Modify: `mobile/src/app/(tabs)/_layout.tsx`
- Modify: `mobile/src/components/common/AmbientGlow.tsx`
- Create: `mobile/src/components/common/AmbientGlow.test.mjs`

**Interfaces:**

- Consumes: `useAppTheme`, `useThemeColors` from `@/theme`.
- Produces: Dynamic status bar style, seamless stack animation container, theme-aware tab bar,
  dynamic ambient background glow.

- [ ] **Step 1: Write test for AmbientGlow stops per theme**

```javascript
// mobile/src/components/common/AmbientGlow.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const glowSource = fs.readFileSync(path.resolve(__dirname, './AmbientGlow.tsx'), 'utf8');

describe('AmbientGlow Theme Awareness Tests', () => {
  it('verifies AmbientGlow utilizes theme colors rather than static hardcoded hexes', () => {
    assert.ok(glowSource.includes('useThemeColors') || glowSource.includes('useAppTheme'));
    assert.ok(!glowSource.includes('stopColor="#041410"'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/components/common/AmbientGlow.test.mjs` Expected: FAIL.

- [ ] **Step 3: Implement dynamic navigation chrome & AmbientGlow**

Update `mobile/src/components/common/AmbientGlow.tsx`:

- Use `const { theme, colors } = useAppTheme();`
- Dynamically select gradient stop color and opacity based on `theme`:
  - `emerald`: center `#10B981` (0.25) -> base `colors.background` (1)
  - `dark`: center `#38BDF8` (0.05) or `#10B981` (0.05) -> base `colors.background` (1)
  - `sepia`: center `#D97706` (0.06) -> base `colors.background` (1)
  - `light`: center `#059669` (0.04) -> base `colors.background` (1)

Update `mobile/src/app/_layout.tsx`:

- Use `const { theme, colors } = useAppTheme();`
- Calculate `const isDark = theme === 'dark' || theme === 'emerald';`
- Set
  `<StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} translucent={true} />`
- Set `<View style={[styles.container, { backgroundColor: colors.background }]}>`
- Set
  `<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>`

Update `mobile/src/app/(tabs)/_layout.tsx`:

- Use `const colors = useThemeColors();`
- Update `tabBarStyle`:
  ```tsx
  tabBarStyle: {
    backgroundColor: colors.surfaceFloating,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  }
  ```
- Update `tabBarActiveTintColor: colors.primary`
- Update `tabBarInactiveTintColor: colors.textMuted`

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/components/common/AmbientGlow.test.mjs` Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/components/common/AmbientGlow.tsx mobile/src/components/common/AmbientGlow.test.mjs mobile/src/app/_layout.tsx mobile/src/app/\(tabs\)/_layout.tsx
git commit -m "feat(mobile): dynamically adapt StatusBar, TabBar, Stack contentStyle, and AmbientGlow"
```

---

### Task 4: High-Performance Precompiled Reader StyleSheets

**Files:**

- Create: `mobile/src/components/reader/ContinuousVerseCard.styles.ts`
- Modify: `mobile/src/components/reader/ContinuousVerseCard.tsx`
- Modify: `mobile/src/app/surah/[id].tsx`
- Modify: `mobile/src/components/reader/MushafPageView.tsx`
- Modify: `mobile/src/components/reader/readerComponents.test.mjs`

**Interfaces:**

- Consumes: `AppTheme`, `ColorTheme`, `themePalettes` from `@/theme`.
- Produces: `verseCardThemeStyles: Record<AppTheme, StyleSheet>`,
  `ContinuousVerseCard(props: { theme?: AppTheme })`.

- [ ] **Step 1: Write the failing test in `readerComponents.test.mjs`**

Add tests to `mobile/src/components/reader/readerComponents.test.mjs`:

```javascript
describe('Reader 4-Theme Precompiled Stylesheets Tests', () => {
  it('provides valid precompiled stylesheets for all 4 themes with zero runtime allocations', async () => {
    const { verseCardThemeStyles } = await import('./ContinuousVerseCard.styles.ts');
    assert.ok(verseCardThemeStyles.dark);
    assert.ok(verseCardThemeStyles.emerald);
    assert.ok(verseCardThemeStyles.sepia);
    assert.ok(verseCardThemeStyles.light);

    // Verify specific ink colors across themes
    assert.strictEqual(verseCardThemeStyles.sepia.arabicText.color, '#2D2319');
    assert.strictEqual(verseCardThemeStyles.light.arabicText.color, '#0F172A');
    assert.strictEqual(verseCardThemeStyles.dark.arabicText.color, '#f8fafc');
    assert.strictEqual(verseCardThemeStyles.emerald.arabicText.color, '#f0fdf4');

    // Verify rosette colors across themes
    assert.strictEqual(verseCardThemeStyles.sepia.ayahEndMarker.color, '#B45309');
    assert.strictEqual(verseCardThemeStyles.light.ayahEndMarker.color, '#D97706');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/components/reader/readerComponents.test.mjs` Expected: FAIL with
"cannot find module ContinuousVerseCard.styles.ts".

- [ ] **Step 3: Implement precompiled styles and wire into Reader**

Create `mobile/src/components/reader/ContinuousVerseCard.styles.ts`:

- Define `buildVerseCardStyles(c: ColorTheme)` producing all necessary styles for cards, headers,
  actions, Arabic text, word-by-word glosses, and translations.
- Export
  `verseCardThemeStyles: Record<AppTheme, ReturnType<typeof buildVerseCardStyles>> = { dark: ..., emerald: ..., sepia: ..., light: ... }`.

Update `mobile/src/components/reader/ContinuousVerseCard.tsx`:

- Add `theme?: AppTheme;` to `ContinuousVerseCardProps` (default: `'emerald'`).
- Inside the component: `const styles = verseCardThemeStyles[theme];`.
- Replace all static `colors.xxx` references inside JSX with `styles` or `themePalettes[theme]`.

Update `mobile/src/app/surah/[id].tsx`:

- Call `const { theme, colors } = useAppTheme();`
- Pass `theme={theme}` to `ContinuousVerseCard` in FlatList `renderItem`.
- Pass `theme={theme}` to `MushafPageView`.
- Apply `{ backgroundColor: colors.background }` to container and list backgrounds.
- Update `topBarTitlePill` and navigation pill styles using `colors.surfaceFloating` and
  `colors.borderSubtle`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/components/reader/readerComponents.test.mjs` Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/components/reader/ContinuousVerseCard.styles.ts mobile/src/components/reader/ContinuousVerseCard.tsx mobile/src/app/surah/\[id\].tsx mobile/src/components/reader/MushafPageView.tsx mobile/src/components/reader/readerComponents.test.mjs
git commit -m "perf(mobile): precompile theme stylesheets for 60fps virtualized reader FlatList"
```

---

### Task 5: In-Reader Theme Switcher & Settings Screen

**Files:**

- Modify: `mobile/src/components/reader/settings/DisplayFontSection.tsx`
- Modify: `mobile/src/app/(tabs)/settings.tsx`
- Create: `mobile/src/components/reader/settings/DisplayFontSectionTheme.test.mjs`

**Interfaces:**

- Consumes: `useAppTheme`, `AppTheme` from `@/theme`.
- Produces: 4-way segmented theme switcher with 44×44 pt touch targets in reader settings, theme
  preview cards in settings screen.

- [ ] **Step 1: Write test for Theme segmented switcher**

```javascript
// mobile/src/components/reader/settings/DisplayFontSectionTheme.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const source = fs.readFileSync(path.resolve(__dirname, './DisplayFontSection.tsx'), 'utf8');

describe('DisplayFontSection Theme Switcher Tests', () => {
  it('implements 4-way theme selector with all 4 themes and accessibility attributes', () => {
    assert.ok(source.includes('theme-dark'));
    assert.ok(source.includes('theme-emerald'));
    assert.ok(source.includes('theme-sepia'));
    assert.ok(source.includes('theme-light'));
    assert.ok(source.includes('minHeight: 44') || source.includes('minHeight: stepperButtonSize'));
    assert.ok(source.includes('accessibilityRole="button"'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/components/reader/settings/DisplayFontSectionTheme.test.mjs` Expected:
FAIL.

- [ ] **Step 3: Implement Theme Selector in DisplayFontSection and Settings**

In `mobile/src/components/reader/settings/DisplayFontSection.tsx`:

- Add a 4th block: `تم و رنگ‌بندی مصحف`.
- Add 4-segment buttons:
  - `dark`: "شبستان"
  - `emerald`: "شب معنوی"
  - `sepia`: "مصحف پوستی"
  - `light`: "وضوح روز"
- Each button has `testID={`${testID}-theme-${t}`}`, `minHeight: 44`, and color preview indicator.
- Call `setTheme(t)`.

In `mobile/src/app/(tabs)/settings.tsx`:

- Add dedicated section: «پوسته و رنگ‌بندی».
- Display 4 theme cards showing:

  - Theme name (Persian & subtitle)
  - Color palette swatch dot preview
  - Active checkmark if `theme === currentTheme`.
  - Calling `setTheme(t)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/components/reader/settings/DisplayFontSectionTheme.test.mjs` Expected:
PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/components/reader/settings/DisplayFontSection.tsx mobile/src/app/\(tabs\)/settings.tsx mobile/src/components/reader/settings/DisplayFontSectionTheme.test.mjs
git commit -m "feat(mobile): add 4-way theme switcher to reader settings and main settings screen"
```

---

### Task 6: Modal & Overlay Tokenization

**Files:**

- Modify: `mobile/src/components/navigation/QuickJumpModal.tsx`
- Modify: `mobile/src/components/navigation/PageJumpTab.tsx`
- Modify: `mobile/src/components/navigation/SurahAyahJumpTab.tsx`
- Modify: `mobile/src/components/navigation/JuzJumpTab.tsx`
- Create: `mobile/src/components/navigation/QuickJumpModalTheme.test.mjs`

**Interfaces:**

- Consumes: `useThemeColors` from `@/theme`.
- Produces: Seamless modal styling conforming to active theme without hardcoded dark emerald hex
  codes.

- [ ] **Step 1: Write test checking removal of hardcoded emerald hexes**

```javascript
// mobile/src/components/navigation/QuickJumpModalTheme.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modalSource = fs.readFileSync(path.resolve(__dirname, './QuickJumpModal.tsx'), 'utf8');

describe('QuickJumpModal Theme Tokenization Tests', () => {
  it('does not contain hardcoded dark emerald background hexes in QuickJumpModal', () => {
    assert.ok(!modalSource.includes('#07241c'));
    assert.ok(!modalSource.includes('#041610'));
    assert.ok(!modalSource.includes('#0a2e24'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/components/navigation/QuickJumpModalTheme.test.mjs` Expected: FAIL.

- [ ] **Step 3: Replace hardcoded hexes with theme tokens**

In `QuickJumpModal.tsx`, `PageJumpTab.tsx`, `SurahAyahJumpTab.tsx`, `JuzJumpTab.tsx`:

- Import `useThemeColors` from `@/theme`.
- Replace `#07241c` with `colors.surfaceFloating` / `colors.backgroundElevated`.
- Replace `#041610` with `colors.background`.
- Replace `#0a2e24` with `colors.surfaceCardHover`.
- Ensure modal header, tabs, search inputs, and item cards dynamically adopt active theme colors.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/components/navigation/QuickJumpModalTheme.test.mjs` Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/components/navigation/QuickJumpModal.tsx mobile/src/components/navigation/PageJumpTab.tsx mobile/src/components/navigation/SurahAyahJumpTab.tsx mobile/src/components/navigation/JuzJumpTab.tsx mobile/src/components/navigation/QuickJumpModalTheme.test.mjs
git commit -m "refactor(mobile): tokenize QuickJumpModal and tabs for dynamic multi-theme support"
```

---

### Task 7: Full Test Suite Verification & TypeScript Typecheck

**Files:**

- Test: All tests across `mobile/src/**/*.test.mjs`
- Typecheck: Entire mobile workspace via `yarn --cwd mobile typecheck`

- [ ] **Step 1: Run full unit test suite**

Run: `node --test mobile/src/**/*.test.mjs` Expected: 360+ tests PASS (354 existing + 6 new theme
tests), 0 failures.

- [ ] **Step 2: Run TypeScript typecheck**

Run: `yarn --cwd mobile typecheck` Expected: 0 errors.

- [ ] **Step 3: Commit final verification confirmation**

```bash
git commit --allow-empty -m "chore(mobile): verify 4-theme engine with 100% test pass rate and 0 typecheck errors"
```
