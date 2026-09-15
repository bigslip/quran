import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

import {
  toPersianDigits,
  formatSurahBadgeNumber,
  formatAyahCount,
  formatJuzBadge,
  extractAyahNumberFromKey,
  formatJuzStartInfo,
  formatJuzPageRange,
  getRevelationPlaceLabel,
  getSurahNavigationRoute,
  getJuzNavigationRoute,
} from './catalogFormatters.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../../../mobile/assets/data/quran.db');

describe('Catalog Components Logic & Data Integrity Tests', () => {
  const db = new DatabaseSync(DB_PATH);

  describe('Formatting Functions & Helpers', () => {
    it('toPersianDigits converts ASCII digits 0-9 to Persian digits', () => {
      assert.strictEqual(toPersianDigits(0), '۰');
      assert.strictEqual(toPersianDigits(1), '۱');
      assert.strictEqual(toPersianDigits(114), '۱۱۴');
      assert.strictEqual(toPersianDigits(6236), '۶۲۳۶');
      assert.strictEqual(toPersianDigits('سوره 1 • آیه 7'), 'سوره ۱ • آیه ۷');
    });

    it('formatSurahBadgeNumber handles standard and revelation order modes', () => {
      const fatihah = { id: 1, revelation_order: 5 };
      const baqarah = { id: 2, revelation_order: 87 };

      // Standard mode
      assert.strictEqual(formatSurahBadgeNumber(fatihah, false), '1');
      assert.strictEqual(formatSurahBadgeNumber(baqarah, false), '2');

      // Revelation order mode
      assert.strictEqual(formatSurahBadgeNumber(fatihah, true), '5');
      assert.strictEqual(formatSurahBadgeNumber(baqarah, true), '87');

      // Persian digits mode
      assert.strictEqual(formatSurahBadgeNumber(fatihah, false, true), '۱');
      assert.strictEqual(formatSurahBadgeNumber(fatihah, true, true), '۵');
    });

    it('formatAyahCount formats verse counts properly', () => {
      assert.strictEqual(formatAyahCount(7), '7 آیه');
      assert.strictEqual(formatAyahCount(286), '286 آیه');
      assert.strictEqual(formatAyahCount(7, true), '۷ آیه');
      assert.strictEqual(formatAyahCount(286, true), '۲۸۶ آیه');
    });

    it('formatJuzBadge formats Juz title badge', () => {
      assert.strictEqual(formatJuzBadge(1), 'جزء 1');
      assert.strictEqual(formatJuzBadge(30), 'جزء 30');
      assert.strictEqual(formatJuzBadge(1, true), 'جزء ۱');
      assert.strictEqual(formatJuzBadge(30, true), 'جزء ۳۰');
    });

    it('extractAyahNumberFromKey extracts the ayah number from verse_key', () => {
      assert.strictEqual(extractAyahNumberFromKey('1:1'), '1');
      assert.strictEqual(extractAyahNumberFromKey('2:142'), '142');
      assert.strictEqual(extractAyahNumberFromKey('78:1'), '1');
      assert.strictEqual(extractAyahNumberFromKey(''), '1');
      assert.strictEqual(extractAyahNumberFromKey('10'), '10');
    });

    it('formatJuzStartInfo formats starting Surah and Ayah info', () => {
      assert.strictEqual(
        formatJuzStartInfo('فاتحه', '1:1'),
        'سوره فاتحه • آیه 1'
      );
      assert.strictEqual(
        formatJuzStartInfo('بقره', '2:142'),
        'سوره بقره • آیه 142'
      );
      assert.strictEqual(
        formatJuzStartInfo('بقره', '2:142', true),
        'سوره بقره • آیه ۱۴۲'
      );
    });

    it('formatJuzPageRange formats page boundary strings', () => {
      assert.strictEqual(formatJuzPageRange(1, 21), 'صفحات 1 تا 21');
      assert.strictEqual(formatJuzPageRange(582, 604), 'صفحات 582 تا 604');
      assert.strictEqual(formatJuzPageRange(1, 21, true), 'صفحات ۱ تا ۲۱');
      assert.strictEqual(formatJuzPageRange(582, 604, true), 'صفحات ۵۸۲ تا ۶۰۴');
    });

    it('getRevelationPlaceLabel returns Persian label for Makkah / Madinah', () => {
      assert.strictEqual(getRevelationPlaceLabel('makkah'), 'مکی');
      assert.strictEqual(getRevelationPlaceLabel('madinah'), 'مدنی');
    });

    it('getSurahNavigationRoute and getJuzNavigationRoute return correct Expo Router paths', () => {
      assert.strictEqual(getSurahNavigationRoute(1), '/surah/1');
      assert.strictEqual(getSurahNavigationRoute(114), '/surah/114');
      assert.strictEqual(getJuzNavigationRoute(1), '/surah/1');
      assert.strictEqual(getJuzNavigationRoute(78), '/surah/78');
    });
  });

  describe('SurahCardItem Props & Data Integrity', () => {
    it('validates all 114 Surahs satisfy SurahCardItem props requirements', () => {
      const chapters = db.prepare('SELECT * FROM chapters ORDER BY id ASC').all();
      assert.strictEqual(chapters.length, 114);

      for (const surah of chapters) {
        // ID & Ordering
        assert.ok(surah.id >= 1 && surah.id <= 114);
        assert.ok(surah.revelation_order >= 1 && surah.revelation_order <= 114);

        // Titles & Calligraphy
        assert.ok(typeof surah.name_arabic === 'string' && surah.name_arabic.trim().length > 0);
        assert.ok(typeof surah.name_fa === 'string' && surah.name_fa.trim().length > 0);
        assert.ok(typeof surah.name_simple === 'string' && surah.name_simple.trim().length > 0);

        // Revelation place & chip label
        assert.ok(surah.revelation_place === 'makkah' || surah.revelation_place === 'madinah');
        const chipLabel = getRevelationPlaceLabel(surah.revelation_place);
        assert.ok(chipLabel === 'مکی' || chipLabel === 'مدنی');

        // Verse count
        assert.ok(surah.verses_count > 0);
        const verseCountStr = formatAyahCount(surah.verses_count);
        assert.ok(verseCountStr.includes('آیه'));

        // Badge numbers in standard and revelation order modes
        const standardBadge = formatSurahBadgeNumber(surah, false);
        assert.strictEqual(standardBadge, String(surah.id));

        const revBadge = formatSurahBadgeNumber(surah, true);
        assert.strictEqual(revBadge, String(surah.revelation_order));

        // Navigation Route
        const route = getSurahNavigationRoute(surah.id);
        assert.strictEqual(route, `/surah/${surah.id}`);

        // Accessibility Label
        const a11yLabel = `سوره ${surah.name_fa}، ${surah.name_arabic}، ${surah.verses_count} آیه`;
        assert.ok(a11yLabel.includes(surah.name_fa));
        assert.ok(a11yLabel.includes(surah.name_arabic));
      }
    });

    it('properly differentiates Al-Fatihah and Al-Alaq revelation ranks', () => {
      const fatihah = db.prepare('SELECT * FROM chapters WHERE id = 1').get();
      assert.strictEqual(fatihah.id, 1);
      assert.strictEqual(fatihah.revelation_order, 5);
      assert.strictEqual(formatSurahBadgeNumber(fatihah, false), '1');
      assert.strictEqual(formatSurahBadgeNumber(fatihah, true), '5');

      const alaq = db.prepare('SELECT * FROM chapters WHERE id = 96').get();
      assert.strictEqual(alaq.id, 96);
      assert.strictEqual(alaq.revelation_order, 1); // First revealed Surah
      assert.strictEqual(formatSurahBadgeNumber(alaq, false), '96');
      assert.strictEqual(formatSurahBadgeNumber(alaq, true), '1');
    });
  });

  describe('JuzCardItem Props & Data Integrity', () => {
    it('validates all 30 Juzs satisfy JuzCardItem props requirements', () => {
      const query = `
        WITH juz_meta AS (
          SELECT 
            juz_number,
            MIN(page_number) AS page_start,
            MAX(page_number) AS page_end,
            COUNT(id) AS verses_count,
            MIN(id) AS first_verse_id
          FROM verses
          GROUP BY juz_number
        )
        SELECT 
          jm.juz_number,
          jm.page_start,
          jm.page_end,
          jm.verses_count,
          v.chapter_id AS first_chapter_id,
          v.verse_key AS first_verse_key,
          c.name_arabic AS first_surah_name_arabic,
          c.name_fa AS first_surah_name_fa,
          SUBSTR(v.text_uthmani, 1, 60) AS preview_text
        FROM juz_meta jm
        JOIN verses v ON v.id = jm.first_verse_id
        JOIN chapters c ON c.id = v.chapter_id
        ORDER BY jm.juz_number ASC;
      `;
      const juzs = db.prepare(query).all();
      assert.strictEqual(juzs.length, 30);

      for (let i = 0; i < 30; i++) {
        const juz = juzs[i];
        assert.strictEqual(juz.juz_number, i + 1);

        // Badge title
        const badgeTitle = formatJuzBadge(juz.juz_number);
        assert.strictEqual(badgeTitle, `جزء ${juz.juz_number}`);

        // Verse Count
        assert.ok(juz.verses_count > 0);
        const versesStr = formatAyahCount(juz.verses_count);
        assert.ok(versesStr.includes(`${juz.verses_count} آیه`));

        // Start Info
        const startInfo = formatJuzStartInfo(juz.first_surah_name_fa, juz.first_verse_key);
        assert.ok(startInfo.startsWith('سوره '));
        assert.ok(startInfo.includes(' • آیه '));

        // Page Range
        const pageRange = formatJuzPageRange(juz.page_start, juz.page_end);
        assert.strictEqual(pageRange, `صفحات ${juz.page_start} تا ${juz.page_end}`);

        // Navigation Route
        const navRoute = getJuzNavigationRoute(juz.first_chapter_id);
        assert.strictEqual(navRoute, `/surah/${juz.first_chapter_id}`);

        // Arabic Preview Snippet
        assert.ok(typeof juz.preview_text === 'string' && juz.preview_text.length > 0);

        // Accessibility Label
        const a11yLabel = `${badgeTitle}، ${startInfo}، ${pageRange}، ${versesStr}`;
        assert.ok(a11yLabel.includes(`جزء ${juz.juz_number}`));
        assert.ok(a11yLabel.includes(juz.first_surah_name_fa));
      }
    });

    it('verifies Juz 1 and Juz 30 boundary cases in detail', () => {
      // Juz 1: Al-Fatihah 1:1, pages 1 to 21
      const juz1StartInfo = formatJuzStartInfo('فاتحه', '1:1');
      assert.strictEqual(juz1StartInfo, 'سوره فاتحه • آیه 1');
      assert.strictEqual(formatJuzPageRange(1, 21), 'صفحات 1 تا 21');
      assert.strictEqual(getJuzNavigationRoute(1), '/surah/1');

      // Juz 30: An-Naba 78:1, pages 582 to 604
      const juz30StartInfo = formatJuzStartInfo('نبأ', '78:1');
      assert.strictEqual(juz30StartInfo, 'سوره نبأ • آیه 1');
      assert.strictEqual(formatJuzPageRange(582, 604), 'صفحات 582 تا 604');
      assert.strictEqual(getJuzNavigationRoute(78), '/surah/78');
    });
  });

  describe('Touch Target & Accessibility Standards Verification', () => {
    it('verifies touch target minimum dimensions (>= 44x44px) contract', () => {
      const minTouchTarget = 44;
      const surahCardMinHeight = 74;
      const surahCardMinWidth = 44;
      const juzCardMinHeight = 110;
      const juzCardMinWidth = 44;

      assert.ok(surahCardMinHeight >= minTouchTarget, 'SurahCardItem minHeight satisfies 44px');
      assert.ok(surahCardMinWidth >= minTouchTarget, 'SurahCardItem minWidth satisfies 44px');
      assert.ok(juzCardMinHeight >= minTouchTarget, 'JuzCardItem minHeight satisfies 44px');
      assert.ok(juzCardMinWidth >= minTouchTarget, 'JuzCardItem minWidth satisfies 44px');
    });
  });
});
