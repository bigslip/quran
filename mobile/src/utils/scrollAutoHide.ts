import { spacing } from '../theme/spacing.ts';

export const BAR_CONTENT_HEIGHT = 52; // 44px min touch target + 8px bottom padding

export interface TopBarGeometry {
  topBarPaddingTop: number;
  topBarHeight: number;
  BAR_CONTENT_HEIGHT: number;
}

export function computeTopBarGeometry(insetsTop?: number): TopBarGeometry {
  const topBarPaddingTop = Math.max(insetsTop || 0, spacing.sm);
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

export type ScrollAutoHideAction = 'hide' | 'show' | 'none';

export interface ScrollDeltaAccumulator {
  processScroll(
    currentY: number,
    isUserInteracting: boolean,
    topBarHeight: number,
    isCurrentlyVisible: boolean,
  ): ScrollAutoHideAction;
  reset(currentY?: number): void;
}

export function createScrollDeltaAccumulator(
  options?: ScrollDeltaAccumulatorOptions,
): ScrollDeltaAccumulator {
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
    ): ScrollAutoHideAction {
      // Always show near top or during overscroll (iOS rubber-banding)
      if (currentY <= topBarHeight) {
        accumulatedDelta = 0;
        lastScrollY = currentY;
        isInitialized = true;
        return isCurrentlyVisible ? 'none' : 'show';
      }

      if (!isInitialized) {
        lastScrollY = currentY;
        isInitialized = true;
        return 'none';
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
    reset(currentY = 0): void {
      accumulatedDelta = 0;
      lastScrollY = currentY;
      isInitialized = true;
    },
  };
}
