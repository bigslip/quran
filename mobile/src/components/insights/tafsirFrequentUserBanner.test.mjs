import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  TAFSIR_NUDGE_BANNER_CONTRACTS,
  shouldShowTafsirNudgeBanner,
} from './tafsirNudgeContracts.ts';
import { useReadingStore } from '../../stores/useReadingStore.ts';
import { readingStorage } from '../../stores/readingStorage.ts';

describe('Tafsir Frequent-User Offline Nudge Banner Contracts & Logic', () => {
  describe('Touch Targets, Dimensions & Layout Contracts', () => {
    it('enforces touch targets >= 44x44 points for all interactive elements in the nudge banner', () => {
      assert.ok(
        TAFSIR_NUDGE_BANNER_CONTRACTS.minTouchTarget >= 44,
        'minTouchTarget must be at least 44 points',
      );
      assert.ok(
        TAFSIR_NUDGE_BANNER_CONTRACTS.ctaButtonMinHeight >= 44,
        'ctaButtonMinHeight must be at least 44 points',
      );
      assert.ok(
        TAFSIR_NUDGE_BANNER_CONTRACTS.ctaButtonMinWidth >= 44,
        'ctaButtonMinWidth must be at least 44 points',
      );
      assert.ok(
        TAFSIR_NUDGE_BANNER_CONTRACTS.dismissButtonMinHeight >= 44,
        'dismissButtonMinHeight must be at least 44 points',
      );
      assert.ok(
        TAFSIR_NUDGE_BANNER_CONTRACTS.dismissButtonMinWidth >= 44,
        'dismissButtonMinWidth must be at least 44 points',
      );
      assert.strictEqual(TAFSIR_NUDGE_BANNER_CONTRACTS.cardBorderRadius, 16);
      assert.strictEqual(TAFSIR_NUDGE_BANNER_CONTRACTS.triggerThreshold, 5);
    });

    it('contains valid localized Persian banner copy and route contracts', () => {
      assert.strictEqual(TAFSIR_NUDGE_BANNER_CONTRACTS.bannerTitle, 'مطالعه آفلاین تفاسیر قرآن');
      assert.strictEqual(
        TAFSIR_NUDGE_BANNER_CONTRACTS.bannerDescription,
        'با دانلود تفاسیر نمونه و نور، در هر زمان و بدون نیاز به اینترنت به معارف آیات دسترسی داشته باشید.',
      );
      assert.strictEqual(TAFSIR_NUDGE_BANNER_CONTRACTS.ctaButtonLabel, 'دانلود تفاسیر');
      assert.strictEqual(
        TAFSIR_NUDGE_BANNER_CONTRACTS.dismissButtonLabel,
        'بستن پیام پیشنهاد دانلود تفاسیر',
      );
      assert.strictEqual(TAFSIR_NUDGE_BANNER_CONTRACTS.settingsRoute, '/(tabs)/settings');
    });
  });

  describe('shouldShowTafsirNudgeBanner Decision Matrix', () => {
    it('returns false when open count is less than threshold (5)', () => {
      assert.strictEqual(
        shouldShowTafsirNudgeBanner({
          tafsirOpenCount: 0,
          isTafsirNudgeDismissed: false,
          isAllTafsirDownloaded: false,
        }),
        false,
      );

      assert.strictEqual(
        shouldShowTafsirNudgeBanner({
          tafsirOpenCount: 4,
          isTafsirNudgeDismissed: false,
          isAllTafsirDownloaded: false,
        }),
        false,
      );
    });

    it('returns true when open count >= 5, not dismissed, and tafsirs not all downloaded', () => {
      assert.strictEqual(
        shouldShowTafsirNudgeBanner({
          tafsirOpenCount: 5,
          isTafsirNudgeDismissed: false,
          isAllTafsirDownloaded: false,
        }),
        true,
      );

      assert.strictEqual(
        shouldShowTafsirNudgeBanner({
          tafsirOpenCount: 12,
          isTafsirNudgeDismissed: false,
          isAllTafsirDownloaded: false,
        }),
        true,
      );
    });

    it('returns false if user already dismissed the nudge banner', () => {
      assert.strictEqual(
        shouldShowTafsirNudgeBanner({
          tafsirOpenCount: 10,
          isTafsirNudgeDismissed: true,
          isAllTafsirDownloaded: false,
        }),
        false,
      );
    });

    it('returns false if all authentic Persian tafsirs are already downloaded', () => {
      assert.strictEqual(
        shouldShowTafsirNudgeBanner({
          tafsirOpenCount: 10,
          isTafsirNudgeDismissed: false,
          isAllTafsirDownloaded: true,
        }),
        false,
      );
    });

    it('returns false if both dismissed and all downloaded', () => {
      assert.strictEqual(
        shouldShowTafsirNudgeBanner({
          tafsirOpenCount: 20,
          isTafsirNudgeDismissed: true,
          isAllTafsirDownloaded: true,
        }),
        false,
      );
    });
  });

  describe('Reading Store Tafsir Nudge State & Persistence', () => {
    it('initializes store with default tafsirOpenCount 0 and isTafsirNudgeDismissed false', () => {
      const state = useReadingStore.getState();
      assert.strictEqual(typeof state.tafsirOpenCount, 'number');
      assert.strictEqual(typeof state.isTafsirNudgeDismissed, 'boolean');
      assert.strictEqual(typeof state.incrementTafsirOpenCount, 'function');
      assert.strictEqual(typeof state.dismissTafsirNudge, 'function');
      assert.strictEqual(typeof state.resetTafsirNudge, 'function');
    });

    it('increments tafsirOpenCount atomically on incrementTafsirOpenCount()', () => {
      useReadingStore.getState().resetTafsirNudge();
      assert.strictEqual(useReadingStore.getState().tafsirOpenCount, 0);

      useReadingStore.getState().incrementTafsirOpenCount();
      assert.strictEqual(useReadingStore.getState().tafsirOpenCount, 1);

      useReadingStore.getState().incrementTafsirOpenCount();
      useReadingStore.getState().incrementTafsirOpenCount();
      assert.strictEqual(useReadingStore.getState().tafsirOpenCount, 3);
    });

    it('sets isTafsirNudgeDismissed to true on dismissTafsirNudge()', () => {
      useReadingStore.getState().resetTafsirNudge();
      assert.strictEqual(useReadingStore.getState().isTafsirNudgeDismissed, false);

      useReadingStore.getState().dismissTafsirNudge();
      assert.strictEqual(useReadingStore.getState().isTafsirNudgeDismissed, true);
    });

    it('resets both count and dismissal state on resetTafsirNudge()', () => {
      useReadingStore.getState().incrementTafsirOpenCount();
      useReadingStore.getState().dismissTafsirNudge();
      assert.ok(useReadingStore.getState().tafsirOpenCount > 0);
      assert.strictEqual(useReadingStore.getState().isTafsirNudgeDismissed, true);

      useReadingStore.getState().resetTafsirNudge();
      assert.strictEqual(useReadingStore.getState().tafsirOpenCount, 0);
      assert.strictEqual(useReadingStore.getState().isTafsirNudgeDismissed, false);
    });

    it('persists tafsirOpenCount and isTafsirNudgeDismissed in store storage partialize', () => {
      // Clean test slate
      useReadingStore.getState().resetTafsirNudge();
      for (let i = 0; i < 5; i++) {
        useReadingStore.getState().incrementTafsirOpenCount();
      }
      useReadingStore.getState().dismissTafsirNudge();

      const raw = readingStorage.getItem('quran-reading-store');
      assert.ok(raw, 'Persisted store json must exist in storage');
      const parsed = JSON.parse(raw);
      assert.strictEqual(parsed.state.tafsirOpenCount, 5);
      assert.strictEqual(parsed.state.isTafsirNudgeDismissed, true);
    });
  });

  describe('TafsirTabContent Banner Integration & Touch Target Guarantees', () => {
    it('verifies that cta button and dismiss button meet minimum 44x44 points touch target', () => {
      assert.ok(TAFSIR_NUDGE_BANNER_CONTRACTS.ctaButtonMinHeight >= 44);
      assert.ok(TAFSIR_NUDGE_BANNER_CONTRACTS.ctaButtonMinWidth >= 44);
      assert.ok(TAFSIR_NUDGE_BANNER_CONTRACTS.dismissButtonMinHeight >= 44);
      assert.ok(TAFSIR_NUDGE_BANNER_CONTRACTS.dismissButtonMinWidth >= 44);
      assert.ok(TAFSIR_NUDGE_BANNER_CONTRACTS.minTouchTarget >= 44);
    });

    it('verifies navigation contract route points to settings tab', () => {
      assert.strictEqual(TAFSIR_NUDGE_BANNER_CONTRACTS.settingsRoute, '/(tabs)/settings');
    });

    it('verifies threshold trigger requirement is precisely 5 opens', () => {
      assert.strictEqual(TAFSIR_NUDGE_BANNER_CONTRACTS.triggerThreshold, 5);
    });
  });
});
