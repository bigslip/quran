import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PRAYER_SCREEN_CONTRACTS,
  PRAYER_MILESTONES_ORDER,
  PRAYER_MILESTONES_META,
  formatSolarFullDateFa,
  formatHijriDateFa,
  getNextPrayerMilestone,
  formatCountdownFa,
  resolveCityOrDefault,
  PRAYER_STORAGE_CITY_KEY,
} from '../services/prayer/prayerScreenContracts.ts';
import {
  computeDayPrayerSchedule,
  toPersianDigits,
  calculateTehranPrayers,
} from '../services/prayer/tehranPrayerEngine.ts';
import { IRANIAN_PROVINCIAL_CAPITALS, DEFAULT_CITY } from '../services/prayer/iranianCities.ts';
import { syncWidgetData } from '../services/widgets/widgetSyncService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prayersFilePath = path.resolve(__dirname, 'prayers.tsx');

describe('Daily Prayer Sanctuary Screen & Widget Deep-Linking Contracts', () => {
  describe('File Structure & React Component Contracts', () => {
    it('prayers.tsx exists in mobile/src/app/ and handles quranir://prayers route', () => {
      assert.ok(
        fs.existsSync(prayersFilePath),
        'mobile/src/app/prayers.tsx must exist to satisfy Expo Router deep link quranir://prayers',
      );
    });

    it('prayers.tsx default export exists and defines a valid React functional component', () => {
      const source = fs.readFileSync(prayersFilePath, 'utf8');
      assert.ok(
        /export\s+default\s+function\s+\w+/.test(source) ||
          /export\s+default\s+memo\(/.test(source),
        'prayers.tsx must have a default export functional component',
      );
      assert.ok(
        source.includes('return (') || source.includes('return <'),
        'Component must return JSX elements',
      );
    });

    it('contains all required testIDs for UI automation and accessibility audits', () => {
      const source = fs.readFileSync(prayersFilePath, 'utf8');
      const requiredTestIDs = [
        'prayer-sanctuary-screen',
        'prayer-back-button',
        'prayer-city-selector',
        'prayer-countdown-card',
        'prayer-milestone-grid',
        'prayer-milestone-imsak',
        'prayer-milestone-fajr',
        'prayer-milestone-sunrise',
        'prayer-milestone-dhuhr',
        'prayer-milestone-asr',
        'prayer-milestone-sunset',
        'prayer-milestone-maghrib',
        'prayer-milestone-isha',
        'prayer-milestone-midnight',
      ];

      for (const testID of requiredTestIDs) {
        assert.ok(source.includes(testID), `prayers.tsx must include testID="${testID}"`);
      }
    });

    it('enforces minimum touch targets of 44x44 points across all interactive buttons', () => {
      const source = fs.readFileSync(prayersFilePath, 'utf8');
      assert.ok(
        PRAYER_SCREEN_CONTRACTS.minTouchTarget >= 44,
        'Contract minTouchTarget must be at least 44 points',
      );
      assert.ok(
        source.includes('minHeight: 44') ||
          source.includes('minHeight: PRAYER_SCREEN_CONTRACTS.minTouchTarget'),
        'Interactive elements must guarantee minHeight >= 44',
      );
      assert.ok(
        source.includes('minWidth: 44') ||
          source.includes('minWidth: PRAYER_SCREEN_CONTRACTS.minTouchTarget'),
        'Interactive elements must guarantee minWidth >= 44',
      );
    });

    it('wires back navigation using router.back() with fallback to router.replace("/")', () => {
      const source = fs.readFileSync(prayersFilePath, 'utf8');
      assert.ok(source.includes('router.back()'), 'Back button must invoke router.back()');
      assert.ok(
        source.includes("router.replace('/')") || source.includes('router.replace("/"'),
        'Back button must provide fallback to router.replace("/") when history is empty',
      );
    });

    it('strictly preserves typography rules with fonts without synthetic fontWeight', () => {
      const source = fs.readFileSync(prayersFilePath, 'utf8');
      assert.ok(
        source.includes('fonts.uiBold') ||
          source.includes('fonts.uiRegular') ||
          source.includes('fonts.uiMedium'),
        'Must use typography fonts from theme',
      );
      // Ensure no synthetic fontWeight on custom fonts
      const styleMatches = source.match(/fontFamily:\s*fonts\.\w+[^}]+/g) || [];
      for (const style of styleMatches) {
        assert.strictEqual(
          style.includes('fontWeight:'),
          false,
          'Custom typography fonts must not include conflicting synthetic fontWeight',
        );
      }
    });

    it('formats Persian text with formatRTLText to anchor RTL text rendering', () => {
      const source = fs.readFileSync(prayersFilePath, 'utf8');
      assert.ok(
        source.includes('formatRTLText'),
        'prayers.tsx must use formatRTLText for Persian strings',
      );
    });
  });

  describe('Exact 9 Prayer Milestones & Calculations', () => {
    it('defines exactly all 9 milestones in proper chronological order', () => {
      assert.strictEqual(PRAYER_MILESTONES_ORDER.length, 9);
      assert.deepStrictEqual(PRAYER_MILESTONES_ORDER, [
        'imsak',
        'fajr',
        'sunrise',
        'dhuhr',
        'asr',
        'sunset',
        'maghrib',
        'isha',
        'midnight',
      ]);
    });

    it('each milestone contains authentic Persian title and descriptive subtitle', () => {
      const imsak = PRAYER_MILESTONES_META.imsak;
      assert.strictEqual(imsak.titleFa, 'امساک');
      assert.strictEqual(imsak.subtitleFa, 'پایان وقت سحری');

      const fajr = PRAYER_MILESTONES_META.fajr;
      assert.strictEqual(fajr.titleFa, 'اذان صبح');

      const dhuhr = PRAYER_MILESTONES_META.dhuhr;
      assert.strictEqual(dhuhr.titleFa, 'اذان ظهر');

      const maghrib = PRAYER_MILESTONES_META.maghrib;
      assert.strictEqual(maghrib.titleFa, 'اذان مغرب');

      const midnight = PRAYER_MILESTONES_META.midnight;
      assert.strictEqual(midnight.titleFa, 'نیمه‌شب شرعی');
    });

    it('computes exact schedule with Persian numerals in all 9 milestone times', () => {
      const testDate = new Date(2026, 9, 4); // 2026-10-04
      const schedule = computeDayPrayerSchedule(
        testDate,
        DEFAULT_CITY.latitude,
        DEFAULT_CITY.longitude,
        3.5,
      );

      assert.strictEqual(schedule.milestones.length, 9);
      for (const milestone of schedule.milestones) {
        assert.ok(
          /[\u06F0-\u06F9]/.test(milestone.timeFa),
          `timeFa (${milestone.timeFa}) must contain Persian digits`,
        );
        assert.strictEqual(
          /[0-9]/.test(milestone.timeFa),
          false,
          `timeFa (${milestone.timeFa}) must not contain Western ASCII digits`,
        );
      }
    });

    it('correctly calculates next upcoming prayer milestone and countdown', () => {
      const testDate = new Date(2026, 9, 4);
      const schedule = computeDayPrayerSchedule(
        testDate,
        DEFAULT_CITY.latitude,
        DEFAULT_CITY.longitude,
        3.5,
      );

      // Pick time before Dhuhr: at 10:00 AM local time
      const year = testDate.getFullYear();
      const month = testDate.getMonth();
      const day = testDate.getDate();
      const morningTime = new Date(Date.UTC(year, month, day, 6, 30, 0)); // 10:00 AM IRST (UTC+3.5)

      const nextInfo = getNextPrayerMilestone(schedule, morningTime);
      assert.strictEqual(nextInfo.milestone.key, 'dhuhr');
      assert.strictEqual(nextInfo.milestone.nameFa, 'اذان ظهر');
      assert.ok(nextInfo.remainingMs > 0);
      assert.ok(nextInfo.countdownFa.includes('اذان ظهر'));
      assert.ok(/[\u06F0-\u06F9]/.test(nextInfo.countdownFa));
      assert.ok(nextInfo.progressFraction >= 0 && nextInfo.progressFraction <= 1);
    });

    it('formats countdown text in Persian properly for various durations', () => {
      // 42 minutes
      const cd42 = formatCountdownFa(42 * 60 * 1000, 'اذان ظهر');
      assert.strictEqual(cd42, '۴۲ دقیقه تا اذان ظهر');

      // 2 hours and 15 minutes
      const cd2h15m = formatCountdownFa((2 * 60 + 15) * 60 * 1000, 'اذان مغرب');
      assert.strictEqual(cd2h15m, '۲ ساعت و ۱۵ دقیقه تا اذان مغرب');

      // 1 hour exact
      const cd1h = formatCountdownFa(60 * 60 * 1000, 'اذان صبح');
      assert.strictEqual(cd1h, '۱ ساعت تا اذان صبح');

      // 0 or negative
      const cdNow = formatCountdownFa(0, 'اذان ظهر');
      assert.strictEqual(cdNow, 'هم‌اکنون');
    });
  });

  describe('Solar & Lunar Hijri Date Formatting', () => {
    it('formats full Persian solar date with weekday and Persian digits', () => {
      const testDate = new Date(2026, 9, 4); // Sunday, Oct 4 2026
      const formattedSolar = formatSolarFullDateFa(testDate);

      assert.ok(formattedSolar.includes('یکشنبه'), 'Must include Persian weekday');
      assert.ok(formattedSolar.includes('مهر'), 'Must include Persian month name');
      assert.ok(formattedSolar.includes('۱۴۰۵'), 'Must include Persian year in Persian numerals');
      assert.strictEqual(
        /[0-9]/.test(formattedSolar),
        false,
        'Solar date must not contain ASCII digits',
      );
    });

    it('formats authentic Islamic Hijri date in Persian script', () => {
      const testDate = new Date(2026, 9, 4);
      const formattedHijri = formatHijriDateFa(testDate);

      assert.ok(formattedHijri.length > 5, 'Hijri date must be non-empty');
      assert.ok(/[\u06F0-\u06F9]/.test(formattedHijri), 'Hijri date must contain Persian numerals');
      assert.ok(
        formattedHijri.includes('۱۴۴۸') || formattedHijri.includes('ربیع'),
        'Hijri date should represent year 1448 or Islamic month',
      );
    });
  });

  describe('Iranian Provincial Capitals & City Switching', () => {
    it('exposes all 31 Iranian provincial capitals with valid coordinates', () => {
      assert.strictEqual(IRANIAN_PROVINCIAL_CAPITALS.length, 31);
      const tehran = resolveCityOrDefault('tehran');
      assert.strictEqual(tehran.nameFa, 'تهران');
      assert.strictEqual(tehran.latitude, 35.7);
      assert.strictEqual(tehran.longitude, 51.42);

      const mashhad = resolveCityOrDefault('mashhad');
      assert.strictEqual(mashhad.nameFa, 'مشهد');
      assert.strictEqual(mashhad.latitude, 36.3);
      assert.strictEqual(mashhad.longitude, 59.6);

      const tabriz = resolveCityOrDefault('tabriz');
      assert.strictEqual(tabriz.nameFa, 'تبریز');
    });

    it('falls back gracefully to Tehran when city ID is invalid or null', () => {
      const fallback = resolveCityOrDefault('non-existent-city');
      assert.strictEqual(fallback.id, 'tehran');
      assert.strictEqual(fallback.nameFa, 'تهران');
    });

    it('calculates different prayer times for different provincial capitals', () => {
      const year = 2026;
      const month = 10;
      const day = 4;

      const tehranTimes = calculateTehranPrayers(year, month, day, 35.7, 51.42, 3.5);
      const mashhadTimes = calculateTehranPrayers(year, month, day, 36.3, 59.6, 3.5);
      const tabrizTimes = calculateTehranPrayers(year, month, day, 38.08, 46.29, 3.5);

      // Mashhad is in the east, so Fajr and Sunrise happen earlier than in Tehran
      assert.notStrictEqual(tehranTimes.fajr, mashhadTimes.fajr);
      assert.notStrictEqual(tehranTimes.sunrise, tabrizTimes.sunrise);
    });

    it('triggers syncWidgetData({ cityId }) and updates shared widget payload', async () => {
      const syncResult = await syncWidgetData({ cityId: 'isfahan', force: true });
      assert.strictEqual(syncResult.prayerTimes.cityNameFa, 'اصفهان');
      assert.strictEqual(syncResult.prayerTimes.latitude, 32.65);
      assert.strictEqual(syncResult.prayerTimes.longitude, 51.67);
      assert.strictEqual(syncResult.prayerTimes.schedule.length, 7);
    });

    it('persists selected city under dedicated storage key', () => {
      assert.strictEqual(PRAYER_STORAGE_CITY_KEY, 'quran_selected_city_id');
      const source = fs.readFileSync(prayersFilePath, 'utf8');
      assert.ok(
        source.includes(PRAYER_STORAGE_CITY_KEY) || source.includes('quran_selected_city_id'),
        'prayers.tsx must persist city selection under storage key',
      );
      assert.ok(
        source.includes('syncWidgetData'),
        'prayers.tsx must call syncWidgetData when city changes',
      );
    });
  });
});
