# Specification & Design: Mobile Auto-Hiding Top Navigation Bar

**Author:** Antigravity Engineering  
**Date:** September 20, 2026  
**Status:** Approved for Implementation  
**Target:** Quran.ir Mobile App (`mobile/`)

---

## 1. Executive Summary & Goals

In the Quran Surah Reader (`mobile/src/app/surah/[id].tsx`), vertical screen space is premium sacred
real estate. When a reader scrolls through the Quran text, chrome UI should step back gracefully,
dedicating the maximum possible screen area to the holy scripture and translation text.

### 1.1 Core Principles & Invariants

1. **Sacred Ayah Text Visibility & Immersion**:
   - Scrolling down through Surah verses smoothly slides the top navigation bar off-screen.
   - Scrolling up (or reaching the top of the Surah) immediately slides the top navigation bar back
     into view.
2. **True 60fps Native Driver Animation**:
   - Zero JS layout passes: all motion utilizes `Animated.Value` with `useNativeDriver: true`.
   - Transformation uses `translateY` (from `0` to `-topBarHeight`) coupled with `opacity` (from `1`
     to `0`).
   - Zero unnecessary React re-renders: gesture tracking and threshold checks reside in refs
     (`accumulatedDeltaRef`, `lastScrollYRef`, `isNavBarVisibleRef`). `setState` is strictly invoked
     once upon actual visibility state changes.
3. **Safe Area & Geometry Harmony**:
   - Replace hardcoded `paddingTop: 54` with dynamic safe area insets via `useSafeAreaInsets()`.
   - `topBarPaddingTop = Math.max(insets.top, spacing.sm)`.
   - Content container padding dynamically compensates for
     `topBarHeight = topBarPaddingTop + BAR_CONTENT_HEIGHT`.
4. **Auto-Scroll & Audio Synchronization Reliability**:
   - Suppress auto-hide during programmatic scrolls (e.g. audio reciter auto-advance, deep-link
     `?verse=N`, Quick Jump) using the existing `isUserInteractingRef`.
   - Auto-scroll target offsets (in `CellRenderer` and `scrollToIndex`) must account for the
     floating top bar using `viewOffset: topBarHeight` and
     `offset: Math.max(0, layout.y - topBarHeight - spacing.sm)` so active verses are never clipped
     under the navigation bar.
5. **Mode Differentiation**:
   - **Continuous View (`continuous`)**: Auto-hiding enabled on scroll.
   - **Mushaf Page View (`mushaf`)**: Top bar remains fixed and visible to preserve the physical
     15-line Quran page layout without gaps or layout shifts. Switching modes immediately restores
     the top bar.
6. **Zero-Regression Invariant**:
   - All 377 existing mobile unit tests across 94 test suites must continue to pass.
   - All static regex/substring assertions in `surahReaderDeepLink.test.mjs` and
     `readerComponents.test.mjs` are strictly preserved.
   - Accessibility (`pointerEvents="none"` when hidden, `accessibilityElementsHidden={true}`)
     prevents phantom taps on offscreen controls.

---

## 2. Technical Architecture & Component Design

### 2.1 Geometry & Safe Area Layout

In `mobile/src/app/surah/[id].tsx`:

- Import `useSafeAreaInsets` from `'react-native-safe-area-context'`.
- Compute dynamic bar height:
  ```ts
  const insets = useSafeAreaInsets();
  const topBarPaddingTop = Math.max(insets.top, spacing.sm);
  const BAR_CONTENT_HEIGHT = 52; // 44px min touch target + 8px bottom padding
  const topBarHeight = topBarPaddingTop + BAR_CONTENT_HEIGHT;
  ```
- Position top bar absolutely:
  ```tsx
  <Animated.View
    style={[
      styles.topBar,
      {
        paddingTop: topBarPaddingTop,
        backgroundColor: colors.backgroundElevated,
        borderBottomColor: colors.borderSubtle,
        transform: [{ translateY }],
        opacity,
      },
    ]}
    pointerEvents={isNavBarInteractive ? 'auto' : 'none'}
    aria-hidden={!isNavBarInteractive}
    accessibilityElementsHidden={!isNavBarInteractive}
    importantForAccessibility={isNavBarInteractive ? 'auto' : 'no-hide-descendants'}
  >
    {/* Navigation buttons and Sanctuary Quick Jump Pill */}
  </Animated.View>
  ```
- `styles.topBar`:
  ```ts
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
  }
  ```
- FlatList `contentContainerStyle`:
  ```ts
  contentContainerStyle={[
    styles.versesListContent,
    {
      backgroundColor: colors.background,
      paddingTop: topBarHeight + spacing.xs,
    },
    activeVerseKey ? styles.versesListWithDock : null,
  ]}
  ```

### 2.2 Native Driver Animation Mechanism

```ts
const navAnim = useRef(new Animated.Value(0)).current; // 0 = visible, 1 = hidden
const isNavBarVisibleRef = useRef(true);
const [isNavBarInteractive, setIsNavBarInteractive] = useState(true);

const translateY = navAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0, -topBarHeight],
});

const opacity = navAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [1, 0],
});

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

### 2.3 Scroll Delta Accumulation & Thresholds

```ts
const accumulatedDeltaRef = useRef(0);
const lastScrollYRef = useRef(0);

const handleScroll = useCallback(
  (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = e.nativeEvent.contentOffset.y;

    // 1. Unconditionally show near the top of the Surah or during negative overscroll (iOS bounce)
    if (currentY <= topBarHeight) {
      accumulatedDeltaRef.current = 0;
      lastScrollYRef.current = currentY;
      showNavBar();
      return;
    }

    // 2. Ignore non-user programmatic scrolls (audio sync, deep-links, quick jump)
    if (!isUserInteractingRef.current) {
      lastScrollYRef.current = currentY;
      return;
    }

    const diff = currentY - lastScrollYRef.current;
    lastScrollYRef.current = currentY;

    // 3. Reset accumulated delta if scroll direction reverses
    if (
      (diff > 0 && accumulatedDeltaRef.current < 0) ||
      (diff < 0 && accumulatedDeltaRef.current > 0)
    ) {
      accumulatedDeltaRef.current = 0;
    }
    accumulatedDeltaRef.current += diff;

    // 4. Threshold triggers: +30px to hide, -20px to show
    if (accumulatedDeltaRef.current > 30) {
      hideNavBar();
    } else if (accumulatedDeltaRef.current < -20) {
      showNavBar();
    }
  },
  [topBarHeight, showNavBar, hideNavBar],
);
```

### 2.4 Programmatic Scroll and Modal Protections

1. **Auto-Scroll Offset Calculation**:
   - In `CellRenderer` (lines 295-298) and active verse auto-scroll `useEffect` (lines 316-319):
     ```ts
     flatListRef.current?.scrollToOffset({
       offset: Math.max(0, layout.y - topBarHeight - spacing.sm),
       animated: true,
     });
     ```
   - In `onScrollToIndexFailed` and any `scrollToIndex`:
     ```ts
     viewOffset: topBarHeight,
     ```
2. **Modal and Mode Changes**:
   - When `isSettingsOpen`, `isQuickJumpOpen`, or `isInsightsOpen` becomes `true`, trigger
     `showNavBar()`.
   - When switching modes in `handleToggleViewMode`, trigger `showNavBar()`.

---

## 3. Verification & Test Plan

1. **Unit Tests**:
   - Create `mobile/src/app/surah/surahNavBarAutoHide.test.mjs` verifying:
     - Safe area calculation and bar height geometry formulas.
     - Delta accumulation and threshold math (slow scroll accumulation, direction reversal reset,
       iOS negative scroll clamping).
     - Auto-hide suppression when user is not interacting
       (`isUserInteractingRef.current === false`).
     - Accessibility attributes and pointer events toggle.
2. **Regression Testing**:
   - Run `mobile/src/app/surah/surahReaderDeepLink.test.mjs` -> Pass.
   - Run `mobile/src/components/reader/readerComponents.test.mjs` -> Pass.
   - Run full mobile test suite `node --test 'src/**/*.test.{ts,mjs}'` -> All 377+ tests pass.
   - Run `yarn --cwd mobile typecheck` -> Clean TypeScript build.
