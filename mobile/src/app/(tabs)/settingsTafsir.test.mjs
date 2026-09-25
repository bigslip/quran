import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  SETTINGS_TAFSIR_CONTRACTS,
  formatTafsirSizeFa,
  formatDownloadProgressFa,
  formatTotalStorageFa,
  getTafsirItemState,
} from './settingsContracts.ts';
import { AVAILABLE_DOWNLOADABLE_TAFSIRS } from '../../services/db/tafsirDownloadService.ts';

describe('Settings Offline Tafsir Manager UI Contracts & Logic Tests', () => {
  describe('Touch Targets, Dimensions & Layout Contracts', () => {
    it('enforces touch targets >= 44x44 points for all buttons and interactive elements', () => {
      assert.ok(
        SETTINGS_TAFSIR_CONTRACTS.minTouchTarget >= 44,
        'minTouchTarget must be at least 44 points',
      );
      assert.ok(
        SETTINGS_TAFSIR_CONTRACTS.actionButtonMinHeight >= 44,
        'actionButtonMinHeight must be at least 44 points',
      );
      assert.ok(
        SETTINGS_TAFSIR_CONTRACTS.actionButtonMinWidth >= 44,
        'actionButtonMinWidth must be at least 44 points',
      );
      assert.ok(
        SETTINGS_TAFSIR_CONTRACTS.cardMinHeight >= 72,
        'cardMinHeight must be at least 72 points',
      );
      assert.strictEqual(SETTINGS_TAFSIR_CONTRACTS.cardBorderRadius, 16);
      assert.strictEqual(SETTINGS_TAFSIR_CONTRACTS.progressBarHeight, 6);
    });

    it('contains valid section headers and localized labels', () => {
      assert.strictEqual(
        SETTINGS_TAFSIR_CONTRACTS.sectionTitle,
        'تفاسیر قرآن کریم و استفاده آفلاین',
      );
      assert.strictEqual(
        SETTINGS_TAFSIR_CONTRACTS.downloadActionLabel,
        'دانلود برای استفاده آفلاین',
      );
      assert.strictEqual(
        SETTINGS_TAFSIR_CONTRACTS.deleteActionLabel,
        'حذف فایل آفلاین',
      );
      assert.strictEqual(
        SETTINGS_TAFSIR_CONTRACTS.downloadedBadgeLabel,
        'بارگیری‌شده',
      );
    });

    it('exposes all authentic Persian Tafsirs in the manager', () => {
      assert.strictEqual(AVAILABLE_DOWNLOADABLE_TAFSIRS.length, 2);
      const slugs = AVAILABLE_DOWNLOADABLE_TAFSIRS.map((t) => t.slug);
      assert.ok(slugs.includes('fa-tafsir-nemouneh'));
      assert.ok(slugs.includes('fa-tafsir-noor'));
    });
  });

  describe('Formatting Helpers with Persian Numerals', () => {
    it('formats approximate Tafsir size in Persian numerals', () => {
      assert.strictEqual(formatTafsirSizeFa(12), '۱۲ مگابایت');
      assert.strictEqual(formatTafsirSizeFa(10), '۱۰ مگابایت');
      assert.strictEqual(formatTafsirSizeFa(0), '۰ مگابایت');
    });

    it('formats download progress percentage in Persian numerals', () => {
      assert.strictEqual(formatDownloadProgressFa(0), '۰٪');
      assert.strictEqual(formatDownloadProgressFa(0.45), '۴۵٪');
      assert.strictEqual(formatDownloadProgressFa(0.504), '۵۰٪');
      assert.strictEqual(formatDownloadProgressFa(1.0), '۱۰۰٪');
    });

    it('formats total storage consumed in Persian format', () => {
      assert.strictEqual(formatTotalStorageFa(0), '۰ مگابایت');
      // 12 MB = 12 * 1024 * 1024 = 12582912 bytes
      assert.strictEqual(formatTotalStorageFa(12582912), '۱۲ مگابایت');
      // 22.4 MB
      assert.strictEqual(formatTotalStorageFa(22 * 1024 * 1024), '۲۲ مگابایت');
    });
  });

  describe('Tafsir Item State Machine', () => {
    it('correctly identifies not_downloaded state', () => {
      const state = getTafsirItemState('fa-tafsir-nemouneh', [], new Set());
      assert.strictEqual(state, 'not_downloaded');
    });

    it('correctly identifies downloading state when active', () => {
      const activeDownloads = new Set(['fa-tafsir-nemouneh']);
      const state = getTafsirItemState('fa-tafsir-nemouneh', [], activeDownloads);
      assert.strictEqual(state, 'downloading');
    });

    it('correctly identifies downloaded state when slug is present in downloaded list', () => {
      const downloadedSlugs = ['fa-tafsir-nemouneh'];
      const activeDownloads = new Set();
      const state = getTafsirItemState('fa-tafsir-nemouneh', downloadedSlugs, activeDownloads);
      assert.strictEqual(state, 'downloaded');
    });

    it('prioritizes downloading state if download is currently active even if previously downloaded', () => {
      const downloadedSlugs = ['fa-tafsir-nemouneh'];
      const activeDownloads = new Set(['fa-tafsir-nemouneh']);
      const state = getTafsirItemState('fa-tafsir-nemouneh', downloadedSlugs, activeDownloads);
      assert.strictEqual(state, 'downloading');
    });
  });
});
