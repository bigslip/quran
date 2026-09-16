import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

import {
  toPersianDigits,
  formatSurahBadgeNumber,
  formatAyahCount,
  formatJuzBadge,
  extractAyahNumberFromKey,
  formatJuzStartInfo,
  formatJuzPageRange,
  formatCanonicalSurahHint,
  formatSurahAccessibilityLabel,
  formatJuzAccessibilityLabel,
  getRevelationPlaceLabel,
  getSurahNavigationRoute,
  getJuzNavigationRoute,
  normalizeSearchText,
  filterSurahs,
  filterJuzs,
  CATALOG_COMPONENT_CONTRACTS,
  CATALOG_TABS,
} from './catalogFormatters.ts';
import { colors } from '../../theme/colors.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../../../mobile/assets/data/quran.db');

describe('Catalog Components Logic & Data Integrity Tests', () => {
  const db = new DatabaseSync(DB_PATH);

  describe('Formatting Functions & Helpers (Persian Numerals Default)', () => {
    it('toPersianDigits converts ASCII digits 0-9 to Persian digits', () => {
      assert.strictEqual(toPersianDigits(0), '۰');
      assert.strictEqual(toPersianDigits(1), '۱');
      assert.strictEqual(toPersianDigits(114), '۱۱۴');
      assert.strictEqual(toPersianDigits(6236), '۶۲۳۶');
      assert.strictEqual(toPersianDigits('سوره 1 • آیه 7'), 'سوره ۱ • آیه ۷');
    });

    it('formatSurahBadgeNumber defaults to Persian numerals and handles revelation order', () => {
      const fatihah = { id: 1, revelation_order: 5 };
      const baqarah = { id: 2, revelation_order: 87 };

      // Standard mode (default Persian numerals)
      assert.strictEqual(formatSurahBadgeNumber(fatihah), '۱');
      assert.strictEqual(formatSurahBadgeNumber(baqarah), '۲');

      // Revelation order mode (default Persian numerals)
      assert.strictEqual(formatSurahBadgeNumber(fatihah, true), '۵');
      assert.strictEqual(formatSurahBadgeNumber(baqarah, true), '۸۷');

      // Explicit ASCII mode
      assert.strictEqual(formatSurahBadgeNumber(fatihah, false, false), '1');
      assert.strictEqual(formatSurahBadgeNumber(fatihah, true, false), '5');
    });

    it('formatAyahCount defaults to Persian numerals', () => {
      assert.strictEqual(formatAyahCount(7), '۷ آیه');
      assert.strictEqual(formatAyahCount(286), '۲۸۶ آیه');
      // Explicit ASCII
      assert.strictEqual(formatAyahCount(7, false), '7 آیه');
      assert.strictEqual(formatAyahCount(286, false), '286 آیه');
    });

    it('formatJuzBadge defaults to Persian numerals', () => {
      assert.strictEqual(formatJuzBadge(1), 'جزء ۱');
      assert.strictEqual(formatJuzBadge(30), 'جزء ۳۰');
      // Explicit ASCII
      assert.strictEqual(formatJuzBadge(1, false), 'جزء 1');
      assert.strictEqual(formatJuzBadge(30, false), 'جزء 30');
    });

    it('extractAyahNumberFromKey extracts the ayah number from verse_key', () => {
      assert.strictEqual(extractAyahNumberFromKey('1:1'), '1');
      assert.strictEqual(extractAyahNumberFromKey('2:142'), '142');
      assert.strictEqual(extractAyahNumberFromKey('78:1'), '1');
      assert.strictEqual(extractAyahNumberFromKey(''), '1');
      assert.strictEqual(extractAyahNumberFromKey('10'), '10');
    });

    it('formatJuzStartInfo defaults to Persian numerals', () => {
      assert.strictEqual(
        formatJuzStartInfo('فاتحه', '1:1'),
        'سوره فاتحه • آیه ۱'
      );
      assert.strictEqual(
        formatJuzStartInfo('بقره', '2:142'),
        'سوره بقره • آیه ۱۴۲'
      );
      // Explicit ASCII
      assert.strictEqual(
        formatJuzStartInfo('بقره', '2:142', false),
        'سوره بقره • آیه 142'
      );
    });

    it('formatJuzPageRange defaults to Persian numerals', () => {
      assert.strictEqual(formatJuzPageRange(1, 21), 'صفحات ۱ تا ۲۱');
      assert.strictEqual(formatJuzPageRange(582, 604), 'صفحات ۵۸۲ تا ۶۰۴');
      // Explicit ASCII
      assert.strictEqual(formatJuzPageRange(1, 21, false), 'صفحات 1 تا 21');
      assert.strictEqual(formatJuzPageRange(582, 604, false), 'صفحات 582 تا 604');
    });

    it('formatCanonicalSurahHint formats canonical surah ID for revelation order mode', () => {
      assert.strictEqual(formatCanonicalSurahHint(1), '• شماره سوره: ۱');
      assert.strictEqual(formatCanonicalSurahHint(96), '• شماره سوره: ۹۶');
      // Explicit ASCII
      assert.strictEqual(formatCanonicalSurahHint(96, false), '• شماره سوره: 96');
    });

    it('formatSurahAccessibilityLabel includes surah number in Persian numerals', () => {
      const fatihah = { id: 1, name_fa: 'فاتحه', name_arabic: 'الفاتحة', verses_count: 7, revelation_order: 5 };
      const alaq = { id: 96, name_fa: 'علق', name_arabic: 'العلق', verses_count: 19, revelation_order: 1 };

      // Standard mode
      assert.strictEqual(
        formatSurahAccessibilityLabel(fatihah, false),
        'سوره ۱، فاتحه، الفاتحة، ۷ آیه'
      );

      // Revelation order mode (includes canonical ID and revelation rank)
      assert.strictEqual(
        formatSurahAccessibilityLabel(fatihah, true),
        'سوره ۱، فاتحه، رتبه نزول ۵، الفاتحة، ۷ آیه'
      );
      assert.strictEqual(
        formatSurahAccessibilityLabel(alaq, true),
        'سوره ۹۶، علق، رتبه نزول ۱، العلق، ۱۹ آیه'
      );

      // Explicit ASCII mode
      assert.strictEqual(
        formatSurahAccessibilityLabel(fatihah, false, false),
        'سوره 1، فاتحه، الفاتحة، 7 آیه'
      );
    });

    it('formatJuzAccessibilityLabel formats complete Juz accessibility summary in Persian', () => {
      const juz1 = {
        juz_number: 1,
        first_surah_name_fa: 'فاتحه',
        first_verse_key: '1:1',
        page_start: 1,
        page_end: 21,
        verses_count: 148,
      };

      assert.strictEqual(
        formatJuzAccessibilityLabel(juz1),
        'جزء ۱، سوره فاتحه • آیه ۱، صفحات ۱ تا ۲۱، ۱۴۸ آیه'
      );
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
    it('validates all 114 Surahs satisfy SurahCardItem props & Persian formatting contracts', () => {
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

        // Verse count in Persian
        assert.ok(surah.verses_count > 0);
        const verseCountStr = formatAyahCount(surah.verses_count);
        assert.strictEqual(verseCountStr, `${toPersianDigits(surah.verses_count)} آیه`);

        // Badge numbers: default Persian
        const standardBadge = formatSurahBadgeNumber(surah, false);
        assert.strictEqual(standardBadge, toPersianDigits(surah.id));

        const revBadge = formatSurahBadgeNumber(surah, true);
        assert.strictEqual(revBadge, toPersianDigits(surah.revelation_order));

        // Canonical hint for revelation order
        const canonicalHint = formatCanonicalSurahHint(surah.id);
        assert.strictEqual(canonicalHint, `• شماره سوره: ${toPersianDigits(surah.id)}`);

        // Navigation Route
        const route = getSurahNavigationRoute(surah.id);
        assert.strictEqual(route, `/surah/${surah.id}`);

        // Accessibility Labels (verify actual formatters)
        const standardA11y = formatSurahAccessibilityLabel(surah, false);
        assert.ok(standardA11y.includes(`سوره ${toPersianDigits(surah.id)}`));
        assert.ok(standardA11y.includes(surah.name_fa));
        assert.ok(standardA11y.includes(surah.name_arabic));
        assert.ok(standardA11y.includes(toPersianDigits(surah.verses_count)));

        const revA11y = formatSurahAccessibilityLabel(surah, true);
        assert.ok(revA11y.includes(`سوره ${toPersianDigits(surah.id)}`));
        assert.ok(revA11y.includes(`رتبه نزول ${toPersianDigits(surah.revelation_order)}`));
      }
    });

    it('properly differentiates Al-Fatihah and Al-Alaq revelation ranks & canonical hints', () => {
      const fatihah = db.prepare('SELECT * FROM chapters WHERE id = 1').get();
      assert.strictEqual(fatihah.id, 1);
      assert.strictEqual(fatihah.revelation_order, 5);
      assert.strictEqual(formatSurahBadgeNumber(fatihah, false), '۱');
      assert.strictEqual(formatSurahBadgeNumber(fatihah, true), '۵');
      assert.strictEqual(formatCanonicalSurahHint(fatihah.id), '• شماره سوره: ۱');
      assert.strictEqual(
        formatSurahAccessibilityLabel(fatihah, true),
        `سوره ۱، ${fatihah.name_fa}، رتبه نزول ۵، الفاتحة، ۷ آیه`
      );

      const alaq = db.prepare('SELECT * FROM chapters WHERE id = 96').get();
      assert.strictEqual(alaq.id, 96);
      assert.strictEqual(alaq.revelation_order, 1); // First revealed Surah
      assert.strictEqual(formatSurahBadgeNumber(alaq, false), '۹۶');
      assert.strictEqual(formatSurahBadgeNumber(alaq, true), '۱');
      assert.strictEqual(formatCanonicalSurahHint(alaq.id), '• شماره سوره: ۹۶');
      assert.strictEqual(
        formatSurahAccessibilityLabel(alaq, true),
        `سوره ۹۶، ${alaq.name_fa}، رتبه نزول ۱، العلق، ۱۹ آیه`
      );
    });
  });

  describe('JuzCardItem Props & Data Integrity', () => {
    it('validates all 30 Juzs satisfy JuzCardItem props & Persian formatting contracts', () => {
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

        // Badge title in Persian
        const badgeTitle = formatJuzBadge(juz.juz_number);
        assert.strictEqual(badgeTitle, `جزء ${toPersianDigits(juz.juz_number)}`);

        // Verse Count in Persian
        assert.ok(juz.verses_count > 0);
        const versesStr = formatAyahCount(juz.verses_count);
        assert.strictEqual(versesStr, `${toPersianDigits(juz.verses_count)} آیه`);

        // Start Info in Persian
        const startInfo = formatJuzStartInfo(juz.first_surah_name_fa, juz.first_verse_key);
        assert.ok(startInfo.startsWith(`سوره ${juz.first_surah_name_fa}`));
        const startAyahNum = toPersianDigits(extractAyahNumberFromKey(juz.first_verse_key));
        assert.ok(startInfo.includes(` • آیه ${startAyahNum}`));

        // Page Range in Persian
        const pageRange = formatJuzPageRange(juz.page_start, juz.page_end);
        assert.strictEqual(
          pageRange,
          `صفحات ${toPersianDigits(juz.page_start)} تا ${toPersianDigits(juz.page_end)}`
        );

        // Navigation Route
        const navRoute = getJuzNavigationRoute(juz.first_chapter_id);
        assert.strictEqual(navRoute, `/surah/${juz.first_chapter_id}`);

        // Arabic Preview Snippet
        assert.ok(typeof juz.preview_text === 'string' && juz.preview_text.length > 0);

        // Accessibility Label using actual formatter
        const a11yLabel = formatJuzAccessibilityLabel(juz);
        assert.ok(a11yLabel.includes(`جزء ${toPersianDigits(juz.juz_number)}`));
        assert.ok(a11yLabel.includes(juz.first_surah_name_fa));
        assert.ok(a11yLabel.includes(startAyahNum));
        assert.ok(a11yLabel.includes(toPersianDigits(juz.page_start)));
        assert.ok(a11yLabel.includes(toPersianDigits(juz.page_end)));
        assert.ok(a11yLabel.includes(toPersianDigits(juz.verses_count)));
      }
    });

    it('verifies Juz 1 and Juz 30 boundary cases with Persian numerals', () => {
      // Juz 1: Al-Fatihah 1:1, pages 1 to 21
      const juz1StartInfo = formatJuzStartInfo('فاتحه', '1:1');
      assert.strictEqual(juz1StartInfo, 'سوره فاتحه • آیه ۱');
      assert.strictEqual(formatJuzPageRange(1, 21), 'صفحات ۱ تا ۲۱');
      assert.strictEqual(getJuzNavigationRoute(1), '/surah/1');

      // Juz 30: An-Naba 78:1, pages 582 to 604
      const juz30StartInfo = formatJuzStartInfo('نبأ', '78:1');
      assert.strictEqual(juz30StartInfo, 'سوره نبأ • آیه ۱');
      assert.strictEqual(formatJuzPageRange(582, 604), 'صفحات ۵۸۲ تا ۶۰۴');
      assert.strictEqual(getJuzNavigationRoute(78), '/surah/78');
    });
  });

  describe('Touch Target & Layout Contracts Verification', () => {
    it('verifies exported component layout contracts satisfy minimum touch dimensions (>= 44px)', () => {
      const { minTouchTarget, surahCard, juzCard } = CATALOG_COMPONENT_CONTRACTS;

      assert.strictEqual(minTouchTarget, 44);
      assert.ok(surahCard.minHeight >= minTouchTarget, 'SurahCardItem minHeight satisfies 44px');
      assert.ok(surahCard.minWidth >= minTouchTarget, 'SurahCardItem minWidth satisfies 44px');
      assert.ok(juzCard.minHeight >= minTouchTarget, 'JuzCardItem minHeight satisfies 44px');
      assert.ok(juzCard.minWidth >= minTouchTarget, 'JuzCardItem minWidth satisfies 44px');

      // Concentric medallion dimensions
      assert.strictEqual(surahCard.badgeOuterSize, 44);
      assert.strictEqual(surahCard.badgeInnerSize, 36);
      assert.ok(surahCard.badgeOuterSize >= minTouchTarget);
    });

    it('verifies Sanctuary theme tokens are defined and properly structured', () => {
      // Primary accent tokens
      assert.strictEqual(colors.primarySubtle, 'rgba(16, 185, 129, 0.12)');
      assert.strictEqual(colors.primaryGlow, 'rgba(16, 185, 129, 0.25)');

      // Revelation badge tokens
      assert.strictEqual(colors.badgeMadani, 'rgba(16, 185, 129, 0.15)');
      assert.strictEqual(colors.badgeMadaniText, '#6ee7b7');
      assert.strictEqual(colors.badgeMakki, 'rgba(245, 158, 11, 0.15)');
      assert.strictEqual(colors.badgeMakkiText, '#fcd34d');

      // Sacred gold tokens
      assert.strictEqual(colors.goldAccent, '#fbbf24');
      assert.strictEqual(colors.goldGlow, 'rgba(251, 191, 36, 0.2)');
    });

    it('verifies CatalogTabSwitcher and CatalogEmptyState layout contracts satisfy >= 44px touch targets', () => {
      const { minTouchTarget, tabSwitcher, emptyState } = CATALOG_COMPONENT_CONTRACTS;

      assert.strictEqual(minTouchTarget, 44);
      assert.ok(tabSwitcher.minHeight >= minTouchTarget, 'tabSwitcher minHeight satisfies 44px');
      assert.ok(tabSwitcher.containerMinHeight >= minTouchTarget, 'tabSwitcher containerMinHeight satisfies 44px');
      assert.ok(tabSwitcher.tabMinHeight >= minTouchTarget, 'tabSwitcher tabMinHeight satisfies 44px');
      assert.ok(tabSwitcher.tabMinWidth >= minTouchTarget, 'tabSwitcher tabMinWidth satisfies 44px');

      assert.ok(emptyState.clearButtonMinHeight >= minTouchTarget, 'clearButtonMinHeight satisfies 44px');
      assert.ok(emptyState.clearButtonMinWidth >= minTouchTarget, 'clearButtonMinWidth satisfies 44px');
      assert.strictEqual(emptyState.iconBadgeSize, 64);
    });

    it('verifies CATALOG_TABS definition satisfies required 3 Sanctuary tabs', () => {
      assert.strictEqual(CATALOG_TABS.length, 3);
      assert.deepStrictEqual(
        CATALOG_TABS.map((t) => t.id),
        ['surah', 'juz', 'revelation']
      );

      const surahTab = CATALOG_TABS.find((t) => t.id === 'surah');
      const juzTab = CATALOG_TABS.find((t) => t.id === 'juz');
      const revTab = CATALOG_TABS.find((t) => t.id === 'revelation');

      assert.ok(surahTab?.label.includes('سوره'));
      assert.strictEqual(juzTab?.label, 'جزءها');
      assert.strictEqual(revTab?.label, 'ترتیب نزول');
    });

    it('verifies CatalogTabSwitcher root view does not have accessible={true} to keep tabs directly focusable', () => {
      const switcherSource = fs.readFileSync(
        path.resolve(__dirname, './CatalogTabSwitcher.tsx'),
        'utf8'
      );
      // Container View must declare accessibilityRole="tablist"
      assert.ok(switcherSource.includes('accessibilityRole="tablist"'));
      // Container View must NOT have accessible={true} so child tabs are not collapsed/hidden by screen readers
      assert.doesNotMatch(switcherSource, /<View[^>]*accessible=\{true\}[^>]*accessibilityRole="tablist"/);
      assert.doesNotMatch(switcherSource, /<View[^>]*accessibilityRole="tablist"[^>]*accessible=\{true\}/);
      // Child TouchableOpacity tabs must have accessibilityRole="tab" and accessible={true}
      assert.ok(switcherSource.includes('accessibilityRole="tab"'));
      assert.ok(switcherSource.includes('accessible={true}'));
    });
  });

  describe('Search Text Normalization (normalizeSearchText)', () => {
    it('normalizes Persian and Arabic digits to ASCII 0-9', () => {
      assert.strictEqual(normalizeSearchText('۰۱۲۳۴۵۶۷۸۹'), '0123456789');
      assert.strictEqual(normalizeSearchText('٠١٢٣٤٥٦٧٨٩'), '0123456789');
      assert.strictEqual(normalizeSearchText('سوره ۱۱۴'), 'سوره 114');
      assert.strictEqual(normalizeSearchText('جزء ۳۰'), 'جزء 30');
    });

    it('removes Arabic diacritics / harakat, superscript alef, tatweel, and ZWNJ/ZWJ', () => {
      assert.strictEqual(normalizeSearchText('الْفَاتِحَةُ'), 'الفاتحه');
      assert.strictEqual(normalizeSearchText('الرَّحْمَٰنِ الرَّحِيمِ'), 'الرحمن الرحیم');
      assert.strictEqual(normalizeSearchText('قُـــرْآن'), 'قران');
      assert.strictEqual(normalizeSearchText('سوره‌ها'), 'سورهها');
    });

    it('normalizes Arabic letters to Persian standard (Yeh, Kaf, Teh Marbuta, Alef variants)', () => {
      // Yeh variants
      assert.strictEqual(normalizeSearchText('علي'), 'علی');
      assert.strictEqual(normalizeSearchText('هدى'), 'هدی');

      // Kaf variant
      assert.strictEqual(normalizeSearchText('كتاب'), 'کتاب');

      // Teh Marbuta & Heh with Hamza
      assert.strictEqual(normalizeSearchText('الفاتحة'), 'الفاتحه');
      assert.strictEqual(normalizeSearchText('خانۀ'), 'خانه');

      // Alef forms
      assert.strictEqual(normalizeSearchText('آل عمران'), 'ال عمران');
      assert.strictEqual(normalizeSearchText('الأنعام'), 'الانعام');
      assert.strictEqual(normalizeSearchText('الإخلاص'), 'الاخلاص');
      assert.strictEqual(normalizeSearchText('النبإ'), 'النبا');
      assert.strictEqual(normalizeSearchText('نبأ'), 'نبا');

      // Waw with Hamza (ؤ -> و) and Yeh with Hamza (ئ -> ی)
      assert.strictEqual(normalizeSearchText('المؤمنون'), 'المومنون');
      assert.strictEqual(normalizeSearchText('مومنون'), 'مومنون');
      assert.strictEqual(normalizeSearchText('لؤلؤ'), 'لولو');
      assert.strictEqual(normalizeSearchText('قائم'), 'قایم');
      assert.strictEqual(normalizeSearchText('ذئب'), 'ذیب');
    });

    it('strips hyphens and apostrophes for transliterated search and lowercases', () => {
      assert.strictEqual(normalizeSearchText('Ya-Sin'), 'yasin');
      assert.strictEqual(normalizeSearchText("Al-Mu'minun"), 'almuminun');
      assert.strictEqual(normalizeSearchText("Ali 'Imran"), 'ali imran');
      assert.strictEqual(normalizeSearchText('  Al-Fatihah  '), 'alfatihah');
      assert.strictEqual(normalizeSearchText('  THE OPENER  '), 'the opener');
      assert.strictEqual(normalizeSearchText(''), '');
      assert.strictEqual(normalizeSearchText(null), '');
      assert.strictEqual(normalizeSearchText(undefined), '');
    });
  });

  describe('Real-Time Surah Search Filtering (filterSurahs)', () => {
    const chapters = db.prepare('SELECT * FROM chapters ORDER BY id ASC').all();

    it('empty or whitespace query returns all 114 Surahs unchanged', () => {
      assert.strictEqual(filterSurahs(chapters, '').length, 114);
      assert.strictEqual(filterSurahs(chapters, '   ').length, 114);
      assert.strictEqual(filterSurahs(chapters, null).length, 114);
    });

    it('filters by Persian name (e.g. "فاتحه")', () => {
      const results = filterSurahs(chapters, 'فاتحه');
      assert.ok(results.length >= 1);
      assert.strictEqual(results[0].id, 1);
      assert.ok(results[0].name_fa.includes('فاتحه'));
    });

    it('filters by Arabic calligraphy name (e.g. "الفاتحة")', () => {
      const results = filterSurahs(chapters, 'الفاتحة');
      assert.ok(results.length >= 1);
      assert.strictEqual(results[0].id, 1);
      assert.strictEqual(results[0].name_arabic, 'الفاتحة');
    });

    it('filters by simple transliterated name (e.g. "Fatihah")', () => {
      const results = filterSurahs(chapters, 'Fatihah');
      assert.ok(results.length >= 1);
      assert.strictEqual(results[0].id, 1);
      assert.strictEqual(results[0].name_simple, 'Al-Fatihah');
    });

    it('filters by English name (e.g. "The Opener")', () => {
      const results = filterSurahs(chapters, 'The Opener');
      assert.ok(results.length >= 1);
      assert.strictEqual(results[0].id, 1);
      assert.strictEqual(results[0].name_en, 'The Opener');
    });

    it('filters by number (ASCII 1 and Persian ۱)', () => {
      const asciiResults = filterSurahs(chapters, '1');
      assert.ok(asciiResults.length >= 1);
      assert.ok(asciiResults.some((s) => s.id === 1));

      const persianResults = filterSurahs(chapters, '۱');
      assert.ok(persianResults.length >= 1);
      assert.ok(persianResults.some((s) => s.id === 1));

      // Boundary check for Surah 114
      const surah114Ascii = filterSurahs(chapters, '114');
      assert.ok(surah114Ascii.some((s) => s.id === 114));

      const surah114Persian = filterSurahs(chapters, '۱۱۴');
      assert.ok(surah114Persian.some((s) => s.id === 114));
    });

    it('filters with prefix "سوره" (e.g. "سوره ۱" and "سوره فاتحه")', () => {
      const resNum = filterSurahs(chapters, 'سوره ۱');
      assert.ok(resNum.some((s) => s.id === 1));

      const resName = filterSurahs(chapters, 'سوره فاتحه');
      assert.ok(resName.some((s) => s.id === 1));
    });

    it('matches revelation order rank (e.g. Surah Al-Alaq revelation_order: 1)', () => {
      const results = filterSurahs(chapters, '1');
      assert.ok(results.some((s) => s.id === 96 && s.revelation_order === 1));
    });

    it('matches transliterated queries with hyphens and apostrophes (yasin -> Ya-Sin, muminun -> Al-Mu\'minun, ali imran -> Ali \'Imran)', () => {
      const yasinResults = filterSurahs(chapters, 'yasin');
      assert.ok(yasinResults.some((s) => s.name_simple === 'Ya-Sin'));

      const muminunResults = filterSurahs(chapters, 'muminun');
      assert.ok(muminunResults.some((s) => s.name_simple === "Al-Mu'minun"));

      const aliImranResults = filterSurahs(chapters, 'ali imran');
      assert.ok(aliImranResults.some((s) => s.name_simple === "Ali 'Imran"));
    });

    it('matches Arabic queries with hamza on waw (مومنون -> المؤمنون)', () => {
      const results = filterSurahs(chapters, 'مومنون');
      assert.ok(results.some((s) => s.name_arabic === 'المؤمنون'));
    });

    it('returns empty array when no Surah matches query', () => {
      const results = filterSurahs(chapters, 'کلمه_ناموجود_در_قرآن_xyz');
      assert.strictEqual(results.length, 0);
    });
  });

  describe('Real-Time Juz Search Filtering (filterJuzs)', () => {
    const juzQuery = `
      WITH juz_meta AS (
        SELECT
          juz_number,
          MIN(page_number) as page_start,
          MAX(page_number) as page_end,
          COUNT(id) as verses_count,
          MIN(id) as min_verse_id
        FROM verses
        GROUP BY juz_number
      ),
      juz_surahs AS (
        SELECT 
          v.juz_number,
          GROUP_CONCAT(DISTINCT c.name_fa) AS surah_names_fa,
          GROUP_CONCAT(DISTINCT c.name_arabic) AS surah_names_arabic
        FROM verses v
        JOIN chapters c ON c.id = v.chapter_id
        GROUP BY v.juz_number
      )
      SELECT
        jm.juz_number,
        jm.page_start,
        jm.page_end,
        jm.verses_count,
        v.chapter_id as first_chapter_id,
        v.verse_key as first_verse_key,
        c.name_arabic as first_surah_name_arabic,
        c.name_fa as first_surah_name_fa,
        SUBSTR(v.text_uthmani, 1, 45) || '...' as preview_text,
        TRIM(COALESCE(js.surah_names_fa, '') || ',' || COALESCE(js.surah_names_arabic, ''), ',') AS surah_names_text
      FROM juz_meta jm
      JOIN verses v ON v.id = jm.min_verse_id
      JOIN chapters c ON c.id = v.chapter_id
      LEFT JOIN juz_surahs js ON js.juz_number = jm.juz_number
      ORDER BY jm.juz_number ASC;
    `;
    const rawJuzs = db.prepare(juzQuery).all();
    const juzs = rawJuzs.map((j) => ({
      ...j,
      surah_names: j.surah_names_text
        ? j.surah_names_text.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }));

    it('empty or whitespace query returns all 30 Juzs unchanged', () => {
      assert.strictEqual(filterJuzs(juzs, '').length, 30);
      assert.strictEqual(filterJuzs(juzs, '   ').length, 30);
      assert.strictEqual(filterJuzs(juzs, null).length, 30);
    });

    it('filters by number (ASCII 30 and Persian ۳۰)', () => {
      const asciiResults = filterJuzs(juzs, '30');
      assert.strictEqual(asciiResults.length, 1);
      assert.strictEqual(asciiResults[0].juz_number, 30);

      const persianResults = filterJuzs(juzs, '۳۰');
      assert.strictEqual(persianResults.length, 1);
      assert.strictEqual(persianResults[0].juz_number, 30);
    });

    it('filters by "جزء ۳۰" and "جزء 30"', () => {
      const res1 = filterJuzs(juzs, 'جزء ۳۰');
      assert.strictEqual(res1.length, 1);
      assert.strictEqual(res1[0].juz_number, 30);

      const res2 = filterJuzs(juzs, 'جزء 30');
      assert.strictEqual(res2.length, 1);
      assert.strictEqual(res2[0].juz_number, 30);
    });

    it('filters by starting Surah Persian name (e.g. "نبأ" for Juz 30)', () => {
      const results = filterJuzs(juzs, 'نبأ');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].juz_number, 30);
      assert.ok(results[0].first_surah_name_fa.includes('نبأ'));

      // Also without hamza: "نبا"
      const resultsNoHamza = filterJuzs(juzs, 'نبا');
      assert.strictEqual(resultsNoHamza.length, 1);
      assert.strictEqual(resultsNoHamza[0].juz_number, 30);
    });

    it('filters by starting Surah Arabic name (e.g. "النبإ" for Juz 30)', () => {
      const results = filterJuzs(juzs, 'النبإ');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].juz_number, 30);
    });

    it('filters by starting Surah for Juz 1 ("فاتحه")', () => {
      const results = filterJuzs(juzs, 'فاتحه');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].juz_number, 1);
    });

    it('filters by Surah name across all contained Surahs ("بقره" in Juz 1, 2, 3)', () => {
      const results = filterJuzs(juzs, 'بقره');
      assert.strictEqual(results.length, 3);
      assert.deepStrictEqual(
        results.map((j) => j.juz_number),
        [1, 2, 3]
      );
    });

    it('filters by Surah names in Juz 30 ("اخلاص", "فلق", "ناس", "کافرون")', () => {
      for (const surahName of ['اخلاص', 'فلق', 'ناس', 'کافرون']) {
        const results = filterJuzs(juzs, surahName);
        assert.ok(
          results.some((j) => j.juz_number === 30),
          `Searching "${surahName}" should match Juz 30`
        );
      }
    });

    it('filters by "سوره" prefix for contained Surah ("سوره بقره" in Juz 1, 2, 3)', () => {
      const results = filterJuzs(juzs, 'سوره بقره');
      assert.strictEqual(results.length, 3);
      assert.deepStrictEqual(
        results.map((j) => j.juz_number),
        [1, 2, 3]
      );
    });

    it('returns empty array when no Juz matches query', () => {
      const results = filterJuzs(juzs, 'جزء ۹۹۹');
      assert.strictEqual(results.length, 0);
    });
  });

  describe('Surahs Screen (surahs.tsx) Integration & State Filtering Tests', () => {
    const surahsById = db.prepare('SELECT * FROM chapters ORDER BY id ASC;').all();
    const surahsByRev = db.prepare('SELECT * FROM chapters ORDER BY revelation_order ASC;').all();
    const rawJuzs = db.prepare(`
      WITH juz_meta AS (
        SELECT 
          juz_number,
          MIN(page_number) AS page_start,
          MAX(page_number) AS page_end,
          COUNT(id) AS verses_count,
          MIN(id) AS first_verse_id
        FROM verses
        GROUP BY juz_number
      ),
      juz_surahs AS (
        SELECT 
          v.juz_number,
          GROUP_CONCAT(DISTINCT c.name_fa) AS surah_names_fa,
          GROUP_CONCAT(DISTINCT c.name_arabic) AS surah_names_arabic
        FROM verses v
        JOIN chapters c ON c.id = v.chapter_id
        GROUP BY v.juz_number
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
        SUBSTR(v.text_uthmani, 1, 60) AS preview_text,
        TRIM(COALESCE(js.surah_names_fa, '') || ',' || COALESCE(js.surah_names_arabic, ''), ',') AS surah_names_text
      FROM juz_meta jm
      JOIN verses v ON v.id = jm.first_verse_id
      JOIN chapters c ON c.id = v.chapter_id
      LEFT JOIN juz_surahs js ON js.juz_number = jm.juz_number
      ORDER BY jm.juz_number ASC;
    `).all();

    const juzs = rawJuzs.map((j) => ({
      ...j,
      surah_names: j.surah_names_text
        ? j.surah_names_text.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }));

    const surahsScreenSource = fs.readFileSync(
      path.resolve(__dirname, '../../app/(tabs)/surahs.tsx'),
      'utf8'
    );

    it('verifies surahs.tsx source code contains required layout, headers, components, and virtualization props', () => {
      // 1. Sanctuary Header with AmbientGlow height={220}
      assert.ok(
        surahsScreenSource.includes('<AmbientGlow height={220}'),
        'surahs.tsx must render AmbientGlow with height={220}'
      );

      // 2. Title row: "فهرست قرآن" with counter badge
      assert.ok(
        surahsScreenSource.includes('فهرست قرآن'),
        'surahs.tsx must render Sanctuary title "فهرست قرآن"'
      );
      assert.ok(
        surahsScreenSource.includes('countBadge'),
        'surahs.tsx must define countBadge in styles and JSX'
      );

      // 3. SearchBar with real-time query and onClear
      assert.ok(
        surahsScreenSource.includes('<SearchBar'),
        'surahs.tsx must render SearchBar'
      );
      assert.ok(
        surahsScreenSource.includes('onClear='),
        'SearchBar must have onClear prop bound to clear query'
      );

      // 4. CatalogTabSwitcher with activeTab and onTabChange
      assert.ok(
        surahsScreenSource.includes('<CatalogTabSwitcher'),
        'surahs.tsx must render CatalogTabSwitcher'
      );
      assert.ok(
        surahsScreenSource.includes('activeTab={activeTab}'),
        'CatalogTabSwitcher must bind activeTab state'
      );
      assert.ok(
        surahsScreenSource.includes('onTabChange='),
        'CatalogTabSwitcher must bind onTabChange handler'
      );

      // 5. ActivityIndicator for loading state
      assert.ok(
        surahsScreenSource.includes('<ActivityIndicator'),
        'surahs.tsx must render ActivityIndicator during loading'
      );
      assert.ok(
        surahsScreenSource.includes('colors.primary'),
        'ActivityIndicator must use colors.primary'
      );

      // 6. FlatList with exact performance virtualization props
      assert.ok(
        surahsScreenSource.includes('initialNumToRender={12}'),
        'FlatList must specify initialNumToRender={12}'
      );
      assert.ok(
        surahsScreenSource.includes('maxToRenderPerBatch={12}'),
        'FlatList must specify maxToRenderPerBatch={12}'
      );
      assert.ok(
        surahsScreenSource.includes('windowSize={5}'),
        'FlatList must specify windowSize={5}'
      );
      assert.ok(
        surahsScreenSource.includes('removeClippedSubviews={true}'),
        'FlatList must specify removeClippedSubviews={true}'
      );

      // 7. CatalogEmptyState rendering on empty results
      assert.ok(
        surahsScreenSource.includes('<CatalogEmptyState'),
        'FlatList must configure CatalogEmptyState as ListEmptyComponent'
      );
      assert.ok(
        surahsScreenSource.includes('onClearQuery='),
        'CatalogEmptyState must receive onClearQuery handler'
      );

      // 8. Navigation handlers to /surah/[id] and first_chapter_id
      assert.ok(
        surahsScreenSource.includes('/surah/'),
        'surahs.tsx must navigate to /surah/[id]'
      );
      assert.ok(
        surahsScreenSource.includes('first_chapter_id'),
        'Juz navigation must target first_chapter_id'
      );
    });

    it('simulates canonical Surah tab: data filtering, counter badge, and card contracts', () => {
      const activeTab = 'surah';

      // Default state (no search)
      const query = '';
      const filtered = filterSurahs(surahsById, query);
      assert.strictEqual(filtered.length, 114);
      assert.strictEqual(filtered[0].id, 1);
      assert.strictEqual(filtered[113].id, 114);

      // Counter badge text
      const countBadge = `${toPersianDigits(filtered.length)} سوره`;
      assert.strictEqual(countBadge, '۱۱۴ سوره');

      // Search by Persian name "کوثر"
      const filteredKawthar = filterSurahs(surahsById, 'کوثر');
      assert.strictEqual(filteredKawthar.length, 1);
      assert.strictEqual(filteredKawthar[0].id, 108);
      assert.strictEqual(filteredKawthar[0].name_arabic, 'الكوثر');
      assert.strictEqual(`${toPersianDigits(filteredKawthar.length)} سوره`, '۱ سوره');

      // Search by Persian numeral "۱۰۸"
      const filteredNumPersian = filterSurahs(surahsById, '۱۰۸');
      assert.ok(filteredNumPersian.some((s) => s.id === 108));

      // Navigation target
      const navRoute = getSurahNavigationRoute(filteredKawthar[0].id);
      assert.strictEqual(navRoute, '/surah/108');
    });

    it('simulates revelation order tab: chronological sequence, rank badge, and canonical hints', () => {
      const activeTab = 'revelation';

      // Default state
      const query = '';
      const filtered = filterSurahs(surahsByRev, query);
      assert.strictEqual(filtered.length, 114);

      // First revealed is Surah Al-Alaq (id 96, revelation_order 1)
      assert.strictEqual(filtered[0].id, 96);
      assert.strictEqual(filtered[0].revelation_order, 1);
      assert.strictEqual(formatSurahBadgeNumber(filtered[0], true), '۱');
      assert.strictEqual(formatCanonicalSurahHint(filtered[0].id), '• شماره سوره: ۹۶');

      // 5th revealed is Surah Al-Fatihah (id 1, revelation_order 5)
      assert.strictEqual(filtered[4].id, 1);
      assert.strictEqual(filtered[4].revelation_order, 5);
      assert.strictEqual(formatSurahBadgeNumber(filtered[4], true), '۵');
      assert.strictEqual(formatCanonicalSurahHint(filtered[4].id), '• شماره سوره: ۱');

      // Last revealed is Surah An-Nasr (id 110, revelation_order 114)
      assert.strictEqual(filtered[113].id, 110);
      assert.strictEqual(filtered[113].revelation_order, 114);
      assert.strictEqual(formatSurahBadgeNumber(filtered[113], true), '۱۱۴');
      assert.strictEqual(formatCanonicalSurahHint(filtered[113].id), '• شماره سوره: ۱۱۰');

      // Counter badge text
      const countBadge = `${toPersianDigits(filtered.length)} سوره`;
      assert.strictEqual(countBadge, '۱۱۴ سوره');
    });

    it('simulates Juz tab: 30 partitions, starting Surah pointers, and contained Surah recall', () => {
      const activeTab = 'juz';

      // Default state
      const query = '';
      const filtered = filterJuzs(juzs, query);
      assert.strictEqual(filtered.length, 30);
      assert.strictEqual(filtered[0].juz_number, 1);
      assert.strictEqual(filtered[29].juz_number, 30);

      // Counter badge text
      const countBadge = `${toPersianDigits(filtered.length)} جزء`;
      assert.strictEqual(countBadge, '۳۰ جزء');

      // Search by Juz number "۳۰"
      const filteredJuz30 = filterJuzs(juzs, '۳۰');
      assert.strictEqual(filteredJuz30.length, 1);
      assert.strictEqual(filteredJuz30[0].juz_number, 30);
      assert.strictEqual(filteredJuz30[0].first_chapter_id, 78);
      assert.strictEqual(getJuzNavigationRoute(filteredJuz30[0].first_chapter_id), '/surah/78');
      assert.strictEqual(`${toPersianDigits(filteredJuz30.length)} جزء`, '۱ جزء');

      // Search by contained Surah "ناس" -> matches Juz 30
      const filteredNas = filterJuzs(juzs, 'ناس');
      assert.ok(filteredNas.some((j) => j.juz_number === 30));

      // Search by contained Surah "بقره" -> matches Juz 1, 2, and 3
      const filteredBaqarah = filterJuzs(juzs, 'بقره');
      assert.strictEqual(filteredBaqarah.length, 3);
      assert.deepStrictEqual(filteredBaqarah.map((j) => j.juz_number), [1, 2, 3]);
      assert.strictEqual(`${toPersianDigits(filteredBaqarah.length)} جزء`, '۳ جزء');
    });

    it('verifies empty state behavior when query matches zero items in any tab', () => {
      const unmatchedQuery = 'کلمه_ناموجود_در_قرآن_xyz_123';

      const emptySurahs = filterSurahs(surahsById, unmatchedQuery);
      assert.strictEqual(emptySurahs.length, 0);
      assert.strictEqual(`${toPersianDigits(emptySurahs.length)} سوره`, '۰ سوره');

      const emptyRev = filterSurahs(surahsByRev, unmatchedQuery);
      assert.strictEqual(emptyRev.length, 0);
      assert.strictEqual(`${toPersianDigits(emptyRev.length)} سوره`, '۰ سوره');

      const emptyJuz = filterJuzs(juzs, unmatchedQuery);
      assert.strictEqual(emptyJuz.length, 0);
      assert.strictEqual(`${toPersianDigits(emptyJuz.length)} جزء`, '۰ جزء');
    });

    it('verifies keyExtractor uniqueness across all 3 tabs without collisions', () => {
      // Key extractor formula used in surahs.tsx:
      // if ('juz_number' in item) return `juz-${item.juz_number}`;
      // return `${activeTab}-${item.id}`;

      // 1. Canonical surah tab
      const surahKeys = surahsById.map((s) => `surah-${s.id}`);
      assert.strictEqual(new Set(surahKeys).size, 114);

      // 2. Revelation surah tab
      const revKeys = surahsByRev.map((s) => `revelation-${s.id}`);
      assert.strictEqual(new Set(revKeys).size, 114);

      // 3. Juz tab
      const juzKeys = juzs.map((j) => `juz-${j.juz_number}`);
      assert.strictEqual(new Set(juzKeys).size, 30);

      // Cross-tab collision check between all 3 sets
      const allKeys = [...surahKeys, ...revKeys, ...juzKeys];
      assert.strictEqual(new Set(allKeys).size, 114 + 114 + 30);
    });
  });
});

