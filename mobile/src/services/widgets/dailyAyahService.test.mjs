import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

import {
  getDailyAyahForDate,
  getFallbackDailyAyah,
  getDayOfYear,
  CURATED_DAILY_AYAHS,
} from './dailyAyahService.ts';
import { INCORRECT_SUKUN_REGEX } from '../../utils/arabicTextSanitizer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../../../mobile/assets/data/quran.db');

describe('Daily Ayah Curation Service & Contracts Tests', () => {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });

  describe('Curated Dataset & Character Bounds Constraints', () => {
    it('contains at least 365 curated spiritual verses for daily rotation', () => {
      assert.ok(Array.isArray(CURATED_DAILY_AYAHS), 'CURATED_DAILY_AYAHS must be an array');
      assert.ok(
        CURATED_DAILY_AYAHS.length >= 365,
        `CURATED_DAILY_AYAHS must have at least 365 items, got: ${CURATED_DAILY_AYAHS.length}`,
      );
    });

    it('verifies every single curated verse strictly satisfies character length limits', () => {
      for (let i = 0; i < CURATED_DAILY_AYAHS.length; i++) {
        const verse = CURATED_DAILY_AYAHS[i];
        assert.ok(
          verse.surahId >= 1 && verse.surahId <= 114,
          `Verse at index ${i} has invalid surahId: ${verse.surahId}`,
        );
        assert.ok(
          verse.ayahNumber >= 1,
          `Verse at index ${i} has invalid ayahNumber: ${verse.ayahNumber}`,
        );
        assert.ok(
          verse.pageNumber >= 1 && verse.pageNumber <= 604,
          `Verse at index ${i} has invalid pageNumber: ${verse.pageNumber}`,
        );
        assert.ok(
          verse.surahNameFa && verse.surahNameFa.length > 0,
          `Verse at index ${i} must have non-empty surahNameFa`,
        );

        // Character limits from specification:
        // Arabic <= 180 chars, Persian <= 250 chars
        assert.ok(
          verse.arabicText.length <= 180,
          `Verse ${verse.surahId}:${verse.ayahNumber} (index ${i}) Arabic text exceeds 180 chars: ${verse.arabicText.length}`,
        );
        assert.ok(
          verse.translationFa.length <= 250,
          `Verse ${verse.surahId}:${verse.ayahNumber} (index ${i}) Persian text exceeds 250 chars: ${verse.translationFa.length}`,
        );
        assert.ok(
          verse.arabicText.length > 0,
          `Verse ${verse.surahId}:${verse.ayahNumber} Arabic text cannot be empty`,
        );
        assert.ok(
          verse.translationFa.length > 0,
          `Verse ${verse.surahId}:${verse.ayahNumber} Persian translation cannot be empty`,
        );
      }
    });

    it('contains prominent spiritual & inspirational verses in the curated collection', () => {
      const verseKeys = new Set(CURATED_DAILY_AYAHS.map((v) => `${v.surahId}:${v.ayahNumber}`));

      // Verify renowned Quranic verses highlighted in design spec are present
      const expectedKeys = [
        '2:255', // Ayat al-Kursi
        '3:190', // Inna fi khalqis samawati
        '13:28', // Ala bi-dhikrillahi tatma'innul qulub
        '24:35', // Allahu nurus samawati wal ard
        '39:53', // Qul ya 'ibadiyalladhina asrafu
        '59:22', // Huwallahulladhi la ilaha illa hu
        '59:24', // Huwallahul khaliqul bari'ul musawwir
        '94:5', // Fa inna ma'al 'usri yusra
        '94:6', // Inna ma'al 'usri yusra
      ];

      for (const key of expectedKeys) {
        assert.ok(
          verseKeys.has(key),
          `Expected iconic verse ${key} to be present in curated verses`,
        );
      }
    });
  });

  describe('Deterministic Date Selection & Day Hash Algorithm', () => {
    it('correctly calculates day of year across leap and non-leap years', () => {
      assert.strictEqual(getDayOfYear(new Date(2026, 0, 1)), 1); // Jan 1, 2026
      assert.strictEqual(getDayOfYear(new Date(2026, 0, 31)), 31); // Jan 31, 2026
      assert.strictEqual(getDayOfYear(new Date(2026, 1, 1)), 32); // Feb 1, 2026
      assert.strictEqual(getDayOfYear(new Date(2026, 11, 31)), 365); // Dec 31, 2026 (non-leap)

      // Leap year 2024
      assert.strictEqual(getDayOfYear(new Date(2024, 1, 29)), 60); // Feb 29, 2024
      assert.strictEqual(getDayOfYear(new Date(2024, 11, 31)), 366); // Dec 31, 2024 (leap)
    });

    it('returns 100% deterministic verse payload for identical dates', () => {
      const date1 = new Date(2026, 9, 4); // 2026-10-04
      const result1 = getFallbackDailyAyah(date1);
      const result2 = getFallbackDailyAyah(date1);

      assert.deepStrictEqual(result1, result2);
      assert.strictEqual(result1.dateKey, '2026-10-04');
    });

    it('evaluates exact hash formula: (year * 365 + dayOfYear) % curatedList.length', () => {
      const testDate = new Date(2026, 9, 4); // 2026-10-04
      const year = 2026;
      const doy = getDayOfYear(testDate);
      const expectedIndex = (year * 365 + doy) % CURATED_DAILY_AYAHS.length;
      const expectedVerse = CURATED_DAILY_AYAHS[expectedIndex];

      const ayah = getFallbackDailyAyah(testDate);
      assert.strictEqual(ayah.surahId, expectedVerse.surahId);
      assert.strictEqual(ayah.ayahNumber, expectedVerse.ayahNumber);
    });

    it('handles negative or invalid date objects safely with default fallback', () => {
      const invalidAyah = getFallbackDailyAyah(new Date(NaN));
      assert.ok(invalidAyah);
      assert.ok(invalidAyah.surahId >= 1 && invalidAyah.surahId <= 114);
      assert.ok(invalidAyah.dateKey.length === 10);
    });
  });

  describe('Sanitization & RTL Typography Compliance', () => {
    it('sanitizes all Arabic text eliminating un-normalized sukun glyphs', () => {
      for (const verse of CURATED_DAILY_AYAHS) {
        assert.strictEqual(
          INCORRECT_SUKUN_REGEX.test(verse.arabicText),
          false,
          `Verse ${verse.surahId}:${verse.ayahNumber} contains un-normalized sukun rosettes`,
        );
      }

      const ayah = getFallbackDailyAyah(new Date(2026, 9, 4));
      assert.strictEqual(INCORRECT_SUKUN_REGEX.test(ayah.arabicText), false);
    });

    it('prefixes Persian translation with strong RTL marker \\u200F via formatRTLText', () => {
      for (const verse of CURATED_DAILY_AYAHS) {
        assert.ok(
          verse.translationFa.startsWith('\u200F'),
          `Verse ${verse.surahId}:${verse.ayahNumber} Persian translation must start with \\u200F`,
        );
      }

      const ayah = getFallbackDailyAyah(new Date(2026, 9, 4));
      assert.ok(ayah.translationFa.startsWith('\u200F'));
      assert.strictEqual(ayah.translationAuthorFa, 'مکارم شیرازی');
    });
  });

  describe('Deep Link Resolution Format', () => {
    it('generates valid quranir://surah/{id}?verse={num}&page={page} deep links', () => {
      const deepLinkRegex =
        /^quranir:\/\/surah\/([1-9][0-9]?|1[0-1][0-4])\?verse=[1-9][0-9]*&page=([1-9][0-9]?|[1-5][0-9]{2}|60[0-4])$/;

      for (let i = 0; i < 30; i++) {
        const d = new Date(2026, 9, i + 1);
        const ayah = getFallbackDailyAyah(d);
        assert.match(
          ayah.deepLinkUrl,
          deepLinkRegex,
          `Deep link ${ayah.deepLinkUrl} must match canonical deep link format`,
        );
        assert.strictEqual(
          ayah.deepLinkUrl,
          `quranir://surah/${ayah.surahId}?verse=${ayah.ayahNumber}&page=${ayah.pageNumber}`,
        );
      }
    });
  });

  describe('SQLite Database Lookup & Memory Safety Fallback', () => {
    it('hydrates verse from SQLite database when db instance is provided', async () => {
      const date = new Date(2026, 9, 4);
      const ayah = await getDailyAyahForDate(date, db);

      assert.ok(ayah);
      assert.ok(ayah.surahId >= 1 && ayah.surahId <= 114);
      assert.ok(ayah.ayahNumber >= 1);
      assert.ok(ayah.pageNumber >= 1 && ayah.pageNumber <= 604);
      assert.strictEqual(ayah.dateKey, '2026-10-04');
      assert.ok(ayah.arabicText.length <= 180);
      assert.ok(ayah.translationFa.length <= 250);
      assert.ok(ayah.translationFa.startsWith('\u200F'));
      assert.strictEqual(
        ayah.deepLinkUrl,
        `quranir://surah/${ayah.surahId}?verse=${ayah.ayahNumber}&page=${ayah.pageNumber}`,
      );
    });

    it('falls back seamlessly without error when db instance is undefined', async () => {
      const date = new Date(2026, 9, 4);
      const ayah = await getDailyAyahForDate(date);

      assert.ok(ayah);
      assert.strictEqual(ayah.dateKey, '2026-10-04');
      assert.strictEqual(
        ayah.deepLinkUrl,
        `quranir://surah/${ayah.surahId}?verse=${ayah.ayahNumber}&page=${ayah.pageNumber}`,
      );
    });

    it('recovers gracefully to fallback when db throws runtime error', async () => {
      const brokenDb = {
        getFirst: () => {
          throw new Error('Database locked / corrupted');
        },
      };

      const date = new Date(2026, 9, 4);
      const ayah = await getDailyAyahForDate(date, brokenDb);

      assert.ok(ayah);
      assert.strictEqual(ayah.dateKey, '2026-10-04');
    });
  });
});
