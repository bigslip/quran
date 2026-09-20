# Mobile Auto-Hiding Top Navigation Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a smooth 60fps native-driven auto-hiding top navigation bar in the Surah reader
(`mobile/src/app/surah/[id].tsx`) that maximizes sacred reading space on scroll-down, reveals on
scroll-up or near the top, handles safe area insets dynamically, and avoids audio/deep-link
auto-scroll collisions.

**Architecture:** Floating `position: 'absolute'` top bar driven by React Native's `Animated.Value`
with `useNativeDriver: true` for zero JS thread layout passes. Delta accumulation tracks
slow-reading gestures without triggering unnecessary React re-renders. Dynamic safe area insets via
`useSafeAreaInsets()` cleanly set top bar and FlatList padding. Offset compensation ensures audio
reciter auto-advance and deep links never clip underneath the floating bar.

**Tech Stack:** React Native (`Animated`, `Easing`), `react-native-safe-area-context`, Expo Router,
Node.js Test Runner (`node:test`, `node:assert`), TypeScript.

---

## Global Constraints

- Arabic Ayah scripture body text is **NEVER** orange, amber, or gold; always rendered in deep,
  crisp high-contrast ink (AAA >= 14.8:1).
- Gold/bronze is strictly reserved for decorative Ayah rosettes `﴿۱﴾` and small accents.
- All touch targets for navigation controls must remain >= 44×44 points.
- Zero test regressions on existing 377 mobile unit tests across 94 suites.
- All static regex/substring assertions in `surahReaderDeepLink.test.mjs` and
  `readerComponents.test.mjs` must remain strictly satisfied.
- Persian digits formatting via `toPersianDigits` for all numbers in UI.
- All files strictly follow TypeScript and pass `yarn --cwd mobile typecheck`.

---

### Task 1: Auto-Hide Logic Helper, Mathematical Contracts & Unit Tests

**Files:**

- Create: `mobile/src/utils/scrollAutoHide.ts`
- Create: `mobile/src/app/surah/surahNavBarAutoHide.test.mjs`

**Interfaces:**

- Consumes: `spacing` from `@/theme`.
- Produces:

  - `computeTopBarGeometry(insetsTop: number): { topBarPaddingTop: number; topBarHeight: number; BAR_CONTENT_HEIGHT: number }`
  - `createScrollDeltaAccumulator(options?: { hideThreshold?: number; showThreshold?: number })`:
    object with
    `processScroll(currentY: number, isUserInteracting: boolean, topBarHeight: number, isCurrentlyVisible: boolean): 'hide' | 'show' | 'none'`

- [ ] **Step 1: Write the failing unit test**

```javascript
// mobile/src/app/surah/surahNavBarAutoHide.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { computeTopBarGeometry, createScrollDeltaAccumulator } from '../../utils/scrollAutoHide.ts';

describe('Auto-Hiding Top Bar Geometry & Scroll Delta Accumulator', () => {
  it('computes topBarPaddingTop and topBarHeight correctly with safe area insets', () => {
    // Notchless device: insets.top = 0
    const geom0 = computeTopBarGeometry(0);
    assert.strictEqual(geom0.topBarPaddingTop >= 8, true);
    assert.strictEqual(geom0.topBarHeight, geom0.topBarPaddingTop + geom0.BAR_CONTENT_HEIGHT);

    // Standard iPhone with notch: insets.top = 47
    const geomNotch = computeTopBarGeometry(47);
    assert.strictEqual(geomNotch.topBarPaddingTop, 47);
    assert.strictEqual(geomNotch.topBarHeight, 47 + geomNotch.BAR_CONTENT_HEIGHT);

    // iPhone Dynamic Island: insets.top = 59
    const geomIsland = computeTopBarGeometry(59);
    assert.strictEqual(geomIsland.topBarPaddingTop, 59);
    assert.strictEqual(geomIsland.topBarHeight, 59 + geomIsland.BAR_CONTENT_HEIGHT);
  });

  it('unconditionally returns show when near top or during negative overscroll (iOS bounce)', () => {
    const accumulator = createScrollDeltaAccumulator();
    const topBarHeight = 100;

    // Negative bounce (currentY = -15)
    assert.strictEqual(accumulator.processScroll(-15, true, topBarHeight, false), 'show');
    // At top (currentY = 0)
    assert.strictEqual(accumulator.processScroll(0, true, topBarHeight, false), 'show');
    // Below bar height (currentY = 50 <= 100)
    assert.strictEqual(accumulator.processScroll(50, true, topBarHeight, false), 'show');
  });

  it('ignores programmatic scroll when isUserInteracting is false', () => {
    const accumulator = createScrollDeltaAccumulator();
    const topBarHeight = 100;

    // Initial position at 200
    accumulator.processScroll(200, true, topBarHeight, true);

    // Large scroll jump without user interaction (e.g. audio auto-advance)
    const result = accumulator.processScroll(600, false, topBarHeight, true);
    assert.strictEqual(result, 'none');
  });

  it('accumulates small incremental deltas during slow reading and triggers hide', () => {
    const accumulator = createScrollDeltaAccumulator({ hideThreshold: 30, showThreshold: -20 });
    const topBarHeight = 100;

    // Start at 200
    accumulator.processScroll(200, true, topBarHeight, true);

    // Read slowly: 10 frames of +3.5px each (total 35px)
    let triggeredAction = 'none';
    for (let i = 1; i <= 10; i++) {
      const action = accumulator.processScroll(200 + i * 3.5, true, topBarHeight, true);
      if (action !== 'none') triggeredAction = action;
    }
    assert.strictEqual(triggeredAction, 'hide');
  });

  it('resets accumulated delta when scroll direction reverses and triggers show on upward scroll', () => {
    const accumulator = createScrollDeltaAccumulator({ hideThreshold: 30, showThreshold: -20 });
    const topBarHeight = 100;

    // Scroll down past 300 (hidden)
    accumulator.processScroll(300, true, topBarHeight, false);

    // Read upward by 25px total across 5 frames (-5px each)
    let triggeredAction = 'none';
    for (let i = 1; i <= 5; i++) {
      const action = accumulator.processScroll(300 - i * 5, true, topBarHeight, false);
      if (action !== 'none') triggeredAction = action;
    }
    assert.strictEqual(triggeredAction, 'show');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/app/surah/surahNavBarAutoHide.test.mjs` Expected: Failure because
`mobile/src/utils/scrollAutoHide.ts` does not exist yet.

- [ ] **Step 3: Implement `mobile/src/utils/scrollAutoHide.ts`**

```typescript
// mobile/src/utils/scrollAutoHide.ts
import { spacing } from '../theme/spacing';

export const BAR_CONTENT_HEIGHT = 52; // 44px min touch target + 8px bottom padding

export interface TopBarGeometry {
  topBarPaddingTop: number;
  topBarHeight: number;
  BAR_CONTENT_HEIGHT: number;
}

export function computeTopBarGeometry(insetsTop: number): TopBarGeometry {
  const topBarPaddingTop = Math.max(insetsTop, spacing.sm);
  const topBarHeight = topBarPaddingTop + BAR_CONTENT_HEIGHT;
  return {
    topBarPaddingTop,
    topBarHeight,
    BAR_CONTENT_HEIGHT,
  };
}

export interface ScrollDeltaAccumulatorOptions {
  hideThreshold?: number;
  showThreshold?: number;
}

export function createScrollDeltaAccumulator(options?: ScrollDeltaAccumulatorOptions) {
  const hideThreshold = options?.hideThreshold ?? 30;
  const showThreshold = options?.showThreshold ?? -20;

  let accumulatedDelta = 0;
  let lastScrollY = 0;
  let isInitialized = false;

  return {
    processScroll(
      currentY: number,
      isUserInteracting: boolean,
      topBarHeight: number,
      isCurrentlyVisible: boolean,
    ): 'hide' | 'show' | 'none' {
      if (!isInitialized) {
        lastScrollY = currentY;
        isInitialized = true;
        return 'none';
      }

      // Always show near top or during overscroll (iOS rubber-banding)
      if (currentY <= topBarHeight) {
        accumulatedDelta = 0;
        lastScrollY = currentY;
        return isCurrentlyVisible ? 'none' : 'show';
      }

      // Programmatic scroll (audio playback, deep links, quick jump) -> suppress
      if (!isUserInteracting) {
        lastScrollY = currentY;
        return 'none';
      }

      const diff = currentY - lastScrollY;
      lastScrollY = currentY;

      // Reset accumulated delta when scroll direction reverses
      if ((diff > 0 && accumulatedDelta < 0) || (diff < 0 && accumulatedDelta > 0)) {
        accumulatedDelta = 0;
      }
      accumulatedDelta += diff;

      // Check thresholds
      if (accumulatedDelta > hideThreshold && isCurrentlyVisible) {
        return 'hide';
      }
      if (accumulatedDelta < showThreshold && !isCurrentlyVisible) {
        return 'show';
      }

      return 'none';
    },
    reset(currentY = 0) {
      accumulatedDelta = 0;
      lastScrollY = currentY;
      isInitialized = true;
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/app/surah/surahNavBarAutoHide.test.mjs` Expected: 4 passing tests in
`surahNavBarAutoHide.test.mjs`.

- [ ] **Step 5: Run typecheck**

Run: `yarn --cwd mobile typecheck` Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add mobile/src/utils/scrollAutoHide.ts mobile/src/app/surah/surahNavBarAutoHide.test.mjs
git commit -m "feat(mobile): implement scroll delta accumulator and top bar geometry utility"
```

---

### Task 2: Implement Auto-Hiding Floating Navigation Bar in `mobile/src/app/surah/[id].tsx`

**Files:**

- Modify: `mobile/src/app/surah/[id].tsx`

**Interfaces:**

- Consumes:
  - `computeTopBarGeometry`, `createScrollDeltaAccumulator` from `@/utils/scrollAutoHide`
  - `useSafeAreaInsets` from `'react-native-safe-area-context'`
  - `Animated`, `Easing` from `'react-native'`
- Produces:

  - Dynamic floating `Animated.View` top bar
  - 60fps `translateY` and `opacity` transition
  - Zero-rerender scroll handler on `FlatList`
  - Proper offset adjustments for audio sync and deep link navigation

- [ ] **Step 1: Check existing test baseline before edits**

Run:
`node --test mobile/src/app/surah/surahReaderDeepLink.test.mjs mobile/src/components/reader/readerComponents.test.mjs`
Expected: All tests pass.

- [ ] **Step 2: Update `mobile/src/app/surah/[id].tsx`**

1. Add imports:
   ```typescript
   import { Animated, Easing, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
   import { useSafeAreaInsets } from 'react-native-safe-area-context';
   import { computeTopBarGeometry, createScrollDeltaAccumulator } from '@/utils/scrollAutoHide';
   ```
2. Integrate safe area geometry and animation values:

   ```typescript
   const insets = useSafeAreaInsets();
   const { topBarPaddingTop, topBarHeight } = computeTopBarGeometry(insets.top);

   const navAnim = React.useRef(new Animated.Value(0)).current; // 0 = visible, 1 = hidden
   const isNavBarVisibleRef = React.useRef(true);
   const [isNavBarInteractive, setIsNavBarInteractive] = React.useState(true);
   const scrollAccumulatorRef = React.useRef(createScrollDeltaAccumulator());
   ```

3. Create `hideNavBar` and `showNavBar` callbacks:

   ```typescript
   const hideNavBar = useCallback(() => {
     if (!isNavBarVisibleRef.current) return;
     isNavBarVisibleRef.current = false;
     setIsNavBarInteractive(false);
     Animated.timing(navAnim, {
       toValue: 1,
       duration: 200,
       easing: Easing.out(Easing.ease),
       useNativeDriver: true,
     }).start();
   }, [navAnim]);

   const showNavBar = useCallback(() => {
     if (isNavBarVisibleRef.current) return;
     isNavBarVisibleRef.current = true;
     setIsNavBarInteractive(true);
     Animated.timing(navAnim, {
       toValue: 0,
       duration: 220,
       easing: Easing.out(Easing.ease),
       useNativeDriver: true,
     }).start();
   }, [navAnim]);
   ```

4. Interpolate `translateY` and `opacity`:
   ```typescript
   const navTranslateY = navAnim.interpolate({
     inputRange: [0, 1],
     outputRange: [0, -topBarHeight],
   });
   const navOpacity = navAnim.interpolate({
     inputRange: [0, 1],
     outputRange: [1, 0],
   });
   ```
5. Implement `handleScroll`:
   ```typescript
   const handleScroll = useCallback(
     (e: NativeSyntheticEvent<NativeScrollEvent>) => {
       const currentY = e.nativeEvent.contentOffset.y;
       const action = scrollAccumulatorRef.current.processScroll(
         currentY,
         isUserInteractingRef.current,
         topBarHeight,
         isNavBarVisibleRef.current,
       );
       if (action === 'hide') {
         hideNavBar();
       } else if (action === 'show') {
         showNavBar();
       }
     },
     [topBarHeight, hideNavBar, showNavBar],
   );
   ```
6. Attach `onScroll={handleScroll}` and `scrollEventThrottle={16}` to `FlatList`.
7. Update `contentContainerStyle` on `FlatList` to use `paddingTop: topBarHeight + spacing.xs`.
8. Update `CellRenderer` (lines 295-298) and active verse auto-scroll (lines 316-319) to offset by
   `topBarHeight + spacing.sm`:
   ```typescript
   flatListRef.current?.scrollToOffset({
     offset: Math.max(0, layout.y - topBarHeight - spacing.sm),
     animated: true,
   });
   ```
   and in `onScrollToIndexFailed`:
   ```typescript
   flatListRef.current?.scrollToIndex({
     index: info.index,
     animated: true,
     viewPosition: 0,
     viewOffset: topBarHeight,
   });
   ```
9. Wrap the top bar in `<Animated.View>` with floating absolute styling:
   ```tsx
   <Animated.View
     style={[
       styles.topBar,
       {
         paddingTop: topBarPaddingTop,
         backgroundColor: colors.backgroundElevated,
         borderBottomColor: colors.borderSubtle,
         transform: [{ translateY: navTranslateY }],
         opacity: navOpacity,
       },
     ]}
     pointerEvents={isNavBarInteractive ? 'auto' : 'none'}
     aria-hidden={!isNavBarInteractive}
     accessibilityElementsHidden={!isNavBarInteractive}
     importantForAccessibility={isNavBarInteractive ? 'auto' : 'no-hide-descendants'}
   >
     {/* Existing contents preserved verbatim */}
   </Animated.View>
   ```
10. Update `styles.topBar` to:
    ```typescript
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      zIndex: 100,
    },
    ```
11. Add `showNavBar()` triggers:
    - When `isSettingsOpen`, `isQuickJumpOpen`, or `isInsightsOpen` changes to `true`.
    - In `handleToggleViewMode` when changing modes.

- [ ] **Step 3: Run unit tests and deep link tests**

Run:
`node --test mobile/src/app/surah/surahReaderDeepLink.test.mjs mobile/src/components/reader/readerComponents.test.mjs mobile/src/app/surah/surahNavBarAutoHide.test.mjs`
Expected: All tests pass.

- [ ] **Step 4: Run typecheck**

Run: `yarn --cwd mobile typecheck` Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/app/surah/[id].tsx
git commit -m "feat(mobile): auto-hide top navigation bar on scroll in surah reader"
```

---

### Task 3: Full Verification, Edge-Case Auditing & Expo Bundling Confirmation

**Files:**

- Modify: `mobile/src/app/surah/surahNavBarAutoHide.test.mjs` (add integration assertions)

- [ ] **Step 1: Add source contract assertions to `surahNavBarAutoHide.test.mjs`**

Verify that `surah/[id].tsx` contains:

- `useSafeAreaInsets`
- `useNativeDriver: true`
- `pointerEvents={isNavBarInteractive ? 'auto' : 'none'}`
- `scrollEventThrottle={16}`
- `position: 'absolute'` in `styles.topBar`
- `viewOffset: topBarHeight`

- [ ] **Step 2: Run all 377+ mobile unit tests**

Run: `node --test 'mobile/src/**/*.test.{ts,mjs}'` Expected: All suites pass with 0 failures.

- [ ] **Step 3: Run full TypeScript check**

Run: `yarn --cwd mobile typecheck` Expected: Clean pass.

- [ ] **Step 4: Verify Expo Metro bundler status**

Verify that `http://localhost:8081` bundles cleanly without warnings or errors.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/app/surah/surahNavBarAutoHide.test.mjs
git commit -m "test(mobile): add structural and contract tests for surah top bar auto-hide"
```
