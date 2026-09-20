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

  it('resets accumulated delta and lastScrollY when reset() is explicitly called', () => {
    const accumulator = createScrollDeltaAccumulator({ hideThreshold: 30, showThreshold: -20 });
    const topBarHeight = 100;

    // Accumulate 25px of downward scroll
    accumulator.processScroll(200, true, topBarHeight, true);
    accumulator.processScroll(225, true, topBarHeight, true);

    // Call reset(0)
    accumulator.reset(0);

    // Now scrolling to 20px from 0 should not trigger hide because delta is only 20px (under 30px threshold)
    const action = accumulator.processScroll(20, true, topBarHeight, true);
    assert.strictEqual(action, 'none');
  });

  it('verifies static structural contracts in mobile/src/app/surah/[id].tsx', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const fileUrl = new URL(import.meta.url);
    const surahFilePath = path.resolve(path.dirname(fileUrl.pathname), '[id].tsx');
    const surahFileContent = fs.readFileSync(surahFilePath, 'utf8');

    // 1. useSafeAreaInsets
    assert.strictEqual(
      surahFileContent.includes('useSafeAreaInsets'),
      true,
      'Must include useSafeAreaInsets',
    );

    // 2. computeTopBarGeometry
    assert.strictEqual(
      surahFileContent.includes('computeTopBarGeometry'),
      true,
      'Must include computeTopBarGeometry',
    );

    // 3. useNativeDriver: true
    assert.strictEqual(
      surahFileContent.includes('useNativeDriver: true'),
      true,
      'Must include useNativeDriver: true',
    );

    // 4. pointerEvents={isNavBarInteractive ? 'auto' : 'none'}
    assert.strictEqual(
      surahFileContent.includes("pointerEvents={isNavBarInteractive ? 'auto' : 'none'}"),
      true,
      "Must include pointerEvents={isNavBarInteractive ? 'auto' : 'none'}",
    );

    // 5. scrollEventThrottle={16}
    assert.strictEqual(
      surahFileContent.includes('scrollEventThrottle={16}'),
      true,
      'Must include scrollEventThrottle={16}',
    );

    // 6. position: 'absolute' in styles.topBar
    const topBarMatch = surahFileContent.match(/topBar:\s*\{([^}]+)\}/s);
    assert.ok(topBarMatch, 'styles.topBar must exist in [id].tsx');
    assert.strictEqual(
      topBarMatch[1].includes("position: 'absolute'"),
      true,
      "styles.topBar must contain position: 'absolute'",
    );

    // 7. zIndex: 100
    assert.strictEqual(
      topBarMatch[1].includes('zIndex: 100'),
      true,
      'styles.topBar must contain zIndex: 100',
    );

    // 8. viewOffset: topBarHeight
    assert.strictEqual(
      surahFileContent.includes('viewOffset: topBarHeight'),
      true,
      'Must include viewOffset: topBarHeight',
    );
  });
});
