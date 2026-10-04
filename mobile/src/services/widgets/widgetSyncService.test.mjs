import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  syncWidgetData,
  getCachedWidgetData,
  initWidgetSyncSubscriber,
  WIDGET_DATA_STORAGE_KEY,
  MAX_WIDGET_PAYLOAD_BYTES,
} from './widgetSyncService.ts';
import { useReadingStore } from '../../stores/useReadingStore.ts';

describe('Widget Sync Service & Shared Storage Bridge Tests', () => {
  beforeEach(() => {
    // Reset reading store to standard baseline
    useReadingStore.getState().setLastRead(1, 1, 'فاتحه (گشایش)', 1, 1);
  });

  describe('Schema Validation & Contract Compliance', () => {
    it('generates a valid WidgetSharedData payload conforming to widgetContracts', async () => {
      const widgetData = await syncWidgetData({ force: true });

      assert.strictEqual(widgetData.schemaVersion, 1);
      assert.ok(typeof widgetData.updatedAt === 'number' && widgetData.updatedAt > 0);

      // Prayer times structure
      assert.ok(widgetData.prayerTimes, 'prayerTimes must be defined');
      assert.strictEqual(widgetData.prayerTimes.cityNameFa, 'تهران');
      assert.strictEqual(widgetData.prayerTimes.calculationMethod, 'tehran_geophysics');
      assert.strictEqual(typeof widgetData.prayerTimes.latitude, 'number');
      assert.strictEqual(typeof widgetData.prayerTimes.longitude, 'number');

      // 7-day rolling schedule
      assert.strictEqual(
        widgetData.prayerTimes.schedule.length,
        7,
        'Must have 7 days in rolling schedule',
      );
      const firstDay = widgetData.prayerTimes.schedule[0];
      assert.ok(firstDay.dateIso && firstDay.dateFa);
      assert.strictEqual(firstDay.milestones.length, 9, 'Each day must contain all 9 milestones');

      const milestoneKeys = firstDay.milestones.map((m) => m.key);
      const expectedKeys = [
        'imsak',
        'fajr',
        'sunrise',
        'dhuhr',
        'asr',
        'sunset',
        'maghrib',
        'isha',
        'midnight',
      ];
      assert.deepStrictEqual(milestoneKeys, expectedKeys);

      // Daily Ayah structure
      assert.ok(widgetData.dailyAyah, 'dailyAyah must be defined');
      assert.strictEqual(typeof widgetData.dailyAyah.surahId, 'number');
      assert.strictEqual(typeof widgetData.dailyAyah.ayahNumber, 'number');
      assert.ok(widgetData.dailyAyah.surahNameFa.length > 0);
      assert.strictEqual(typeof widgetData.dailyAyah.pageNumber, 'number');
      assert.ok(widgetData.dailyAyah.arabicText.length > 0);
      assert.ok(widgetData.dailyAyah.translationFa.length > 0);
      assert.ok(widgetData.dailyAyah.deepLinkUrl.startsWith('quranir://surah/'));

      // Last Read structure
      assert.ok(widgetData.lastRead, 'lastRead must be defined');
      assert.strictEqual(widgetData.lastRead.surahId, 1);
      assert.strictEqual(widgetData.lastRead.ayahNumber, 1);
      assert.strictEqual(widgetData.lastRead.surahNameFa, 'فاتحه (گشایش)');
      assert.strictEqual(widgetData.lastRead.pageNumber, 1);
      assert.strictEqual(widgetData.lastRead.juzNumber, 1);
      assert.ok(widgetData.lastRead.deepLinkUrl.startsWith('quranir://surah/1?verse=1'));
    });

    it('customizes prayer times when cityId or custom coordinates are provided', async () => {
      // Test Mashhad
      const mashhadData = await syncWidgetData({ cityId: 'mashhad', force: true });
      assert.strictEqual(mashhadData.prayerTimes.cityNameFa, 'مشهد');
      assert.strictEqual(mashhadData.prayerTimes.latitude, 36.3);
      assert.strictEqual(mashhadData.prayerTimes.longitude, 59.6);

      // Test custom coordinates (Tabriz vicinity)
      const coordData = await syncWidgetData({
        coords: { lat: 38.08, lng: 46.29 },
        force: true,
      });
      assert.strictEqual(coordData.prayerTimes.latitude, 38.08);
      assert.strictEqual(coordData.prayerTimes.longitude, 46.29);
      assert.ok(coordData.prayerTimes.cityNameFa.length > 0);
    });

    it('supports deterministic calculation for a target date', async () => {
      const fixedDate = new Date(2026, 9, 4); // 2026-10-04
      const result = await syncWidgetData({ date: fixedDate, force: true });

      assert.strictEqual(result.prayerTimes.schedule[0].dateIso, '2026-10-04');
      assert.strictEqual(result.dailyAyah.dateKey, '2026-10-04');
    });
  });

  describe('Payload Size Budget & Memory Limit (< 200 KB)', () => {
    it('guarantees serialized JSON payload footprint is well below 200 KB', async () => {
      const widgetData = await syncWidgetData({ force: true });
      const serialized = JSON.stringify(widgetData);
      const byteLength = Buffer.byteLength(serialized, 'utf8');

      assert.ok(
        byteLength < MAX_WIDGET_PAYLOAD_BYTES,
        `Payload size (${byteLength} bytes) exceeds limit of ${MAX_WIDGET_PAYLOAD_BYTES} bytes (200 KB)`,
      );

      // Verify strict headroom (typical size should be under 20 KB)
      assert.ok(
        byteLength < 25 * 1024,
        `Payload size (${byteLength} bytes) is unexpectedly large, should be under 25 KB`,
      );
    });
  });

  describe('Cached Data Retrieval & Storage Key', () => {
    it('exports expected storage key constant', () => {
      assert.strictEqual(WIDGET_DATA_STORAGE_KEY, 'quran_widget_data');
    });

    it('retrieves cached data synchronously via getCachedWidgetData()', async () => {
      const freshData = await syncWidgetData({ force: true });
      const cached = getCachedWidgetData();

      assert.ok(cached !== null, 'Cached data should not be null after sync');
      assert.strictEqual(cached?.schemaVersion, freshData.schemaVersion);
      assert.strictEqual(cached?.dailyAyah.dateKey, freshData.dailyAyah.dateKey);
      assert.strictEqual(cached?.lastRead.surahId, freshData.lastRead.surahId);
    });
  });

  describe('Store Subscription & Reactive Synchronization', () => {
    it('subscribes to useReadingStore and updates lastRead upon reading progress changes', async () => {
      const unsubscribe = initWidgetSyncSubscriber({ debounceMs: 50 });

      // Change reading state
      useReadingStore.getState().setLastRead(2, 255, 'بقره', 42, 3);

      // Wait for debounced sync to complete
      await new Promise((resolve) => setTimeout(resolve, 150));

      const updatedCached = getCachedWidgetData();
      assert.ok(updatedCached !== null);
      assert.strictEqual(updatedCached?.lastRead.surahId, 2);
      assert.strictEqual(updatedCached?.lastRead.ayahNumber, 255);
      assert.strictEqual(updatedCached?.lastRead.surahNameFa, 'بقره');
      assert.strictEqual(updatedCached?.lastRead.pageNumber, 42);
      assert.strictEqual(updatedCached?.lastRead.juzNumber, 3);
      assert.strictEqual(
        updatedCached?.lastRead.deepLinkUrl,
        'quranir://surah/2?verse=255&page=42',
      );

      unsubscribe();
    });
  });

  describe('Resilience & Graceful Error Handling', () => {
    it('recovers gracefully and returns valid data even if custom storage throws synchronously', async () => {
      const data = await syncWidgetData({
        force: true,
        storageOverride: {
          setItem: () => {
            throw new Error('Synchronous disk write failure');
          },
        },
      });
      assert.ok(data);
      assert.strictEqual(data.schemaVersion, 1);
      assert.strictEqual(data.lastRead.surahId, 1);
    });

    it('recovers gracefully and returns valid data even if storage rejects asynchronously', async () => {
      const data = await syncWidgetData({
        force: true,
        storageOverride: {
          setItem: async () => {
            throw new Error('Asynchronous disk write rejection');
          },
        },
      });
      assert.ok(data);
      assert.strictEqual(data.schemaVersion, 1);
      assert.strictEqual(data.lastRead.surahId, 1);
    });
  });
});
