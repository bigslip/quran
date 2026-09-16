import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

import {
  BISMILLAH_TEXT,
  READER_COMPONENT_CONTRACTS,
  shouldRenderBismillah,
  formatRevelationPlace,
  formatRevelationOrderBadge,
  formatVerseCountBadge,
  formatSurahNumberBadge,
  formatSurahHeaderAccessibilityLabel,
  formatInfoButtonAccessibilityLabel,
} from './readerContracts.ts';
import { toPersianDigits } from '../catalog/catalogFormatters.ts';
import { colors } from '../../theme/colors.ts';
import { spacing, borderRadius } from '../../theme/spacing.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../../../mobile/assets/data/quran.db');

describe('Reader Components Logic, Contracts & Data Integrity Tests', () => {
  const db = new DatabaseSync(DB_PATH);
  const typographySource = fs.readFileSync(
    path.resolve(__dirname, '../../theme/typography.ts'),
    'utf8'
  );

  describe('BismillahBanner Rules & Calligraphy Verification', () => {
    it('verifies exact sacred Quranic calligraphy text with Alef Wasla and diacritics', () => {
      assert.strictEqual(BISMILLAH_TEXT, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ');
      assert.ok(BISMILLAH_TEXT.includes('ٱللَّهِ')); // Alef Wasla
      assert.ok(BISMILLAH_TEXT.includes('ٱلرَّحْمَـٰنِ')); // Dagger Alef & Alef Wasla
      assert.ok(BISMILLAH_TEXT.includes('ٱلرَّحِيمِ'));
    });

    it('renders for Surah 1 (Al-Fatihah) and Surah 2 (Al-Baqarah)', () => {
      // Surah 1 with undefined bismillahPre
      assert.strictEqual(shouldRenderBismillah(1), true);
      // Surah 1 with explicit true
      assert.strictEqual(shouldRenderBismillah(1, true), true);

      // Surah 2 with undefined bismillahPre
      assert.strictEqual(shouldRenderBismillah(2), true);
      // Surah 2 with explicit true
      assert.strictEqual(shouldRenderBismillah(2, true), true);
    });

    it('unconditionally returns false (null) for Surah 9 (At-Tawbah)', () => {
      // Surah 9 with undefined bismillahPre
      assert.strictEqual(shouldRenderBismillah(9), false);
      // Surah 9 with explicit true (Surah 9 NEVER renders Bismillah)
      assert.strictEqual(shouldRenderBismillah(9, true), false);
      // Surah 9 with explicit false
      assert.strictEqual(shouldRenderBismillah(9, false), false);
    });

    it('returns false when bismillahPre is explicitly passed as false', () => {
      assert.strictEqual(shouldRenderBismillah(1, false), false);
      assert.strictEqual(shouldRenderBismillah(2, false), false);
      assert.strictEqual(shouldRenderBismillah(114, false), false);
    });

    it('verifies Bismillah rendering rules across all 114 Surahs from database', () => {
      const chapters = db.prepare('SELECT id, bismillah_pre FROM chapters ORDER BY id ASC').all();
      assert.strictEqual(chapters.length, 114);

      for (const ch of chapters) {
        if (ch.id === 9) {
          // Surah 9 must never render
          assert.strictEqual(shouldRenderBismillah(ch.id), false);
          assert.strictEqual(shouldRenderBismillah(ch.id, Boolean(ch.bismillah_pre)), false);
        } else if (ch.id === 1) {
          // Surah 1 renders opening Bismillah
          assert.strictEqual(shouldRenderBismillah(ch.id), true);
        } else {
          // Surahs 2..8 and 10..114 render Bismillah
          assert.strictEqual(shouldRenderBismillah(ch.id), true);
          assert.strictEqual(shouldRenderBismillah(ch.id, Boolean(ch.bismillah_pre)), true);
        }
      }
    });

    it('verifies Bismillah layout contracts and theme tokens', () => {
      const { bismillah, minTouchTarget } = READER_COMPONENT_CONTRACTS;

      assert.strictEqual(bismillah.fontSize, 24);
      assert.strictEqual(bismillah.lineHeight, 44);
      assert.strictEqual(bismillah.minHeight, minTouchTarget);
      assert.strictEqual(bismillah.dividerHeight, 1);
      assert.strictEqual(bismillah.text, BISMILLAH_TEXT);

      // Gold styling tokens
      assert.strictEqual(colors.goldAccent, '#fbbf24');
      assert.strictEqual(colors.goldGlow, 'rgba(251, 191, 36, 0.2)');

      assert.ok(typographySource.includes("quranHafs: 'UthmanicHafs'"));
    });

    it('verifies BismillahBanner.tsx source code structure and accessibility', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, './BismillahBanner.tsx'),
        'utf8'
      );

      // BismillahBanner checks chapter 9 and bismillahPre via shouldRenderBismillah
      assert.ok(source.includes('shouldRenderBismillah(chapterId, bismillahPre)'));
      assert.ok(source.includes('return null;'));

      // Typography & colors
      assert.ok(source.includes('fonts.quranHafs'));
      assert.ok(source.includes('colors.goldAccent'));
      assert.ok(source.includes('colors.goldGlow'));
      assert.ok(source.includes('BISMILLAH_TEXT'));

      // Accessibility
      assert.ok(source.includes('accessible={true}'));
      assert.ok(source.includes('accessibilityRole="header"'));
      assert.ok(source.includes('accessibilityLabel="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"'));

      // Ornate dividers
      assert.ok(source.includes('dividerRow'));
      assert.ok(source.includes('dividerLine'));
      assert.ok(source.includes('ornamentDot'));
      assert.ok(source.includes('ornamentDiamond'));
    });
  });

  describe('SurahHeaderBanner Formatting, Badges & Accessibility', () => {
    it('formats Surah number in Persian digits', () => {
      assert.strictEqual(formatSurahNumberBadge(1), 'سوره ۱');
      assert.strictEqual(formatSurahNumberBadge(2), 'سوره ۲');
      assert.strictEqual(formatSurahNumberBadge(18), 'سوره ۱۸');
      assert.strictEqual(formatSurahNumberBadge(114), 'سوره ۱۱۴');
    });

    it('formats revelation order in Persian digits', () => {
      assert.strictEqual(formatRevelationOrderBadge(1), 'ترتیب نزول: ۱');
      assert.strictEqual(formatRevelationOrderBadge(5), 'ترتیب نزول: ۵');
      assert.strictEqual(formatRevelationOrderBadge(87), 'ترتیب نزول: ۸۷');
      assert.strictEqual(formatRevelationOrderBadge(114), 'ترتیب نزول: ۱۱۴');
    });

    it('formats verse count in Persian digits', () => {
      assert.strictEqual(formatVerseCountBadge(7), '۷ آیه');
      assert.strictEqual(formatVerseCountBadge(286), '۲۸۶ آیه');
      assert.strictEqual(formatVerseCountBadge(110), '۱۱۰ آیه');
      assert.strictEqual(formatVerseCountBadge(6), '۶ آیه');
    });

    it('applies correct revelation place Persian label', () => {
      assert.strictEqual(formatRevelationPlace('makkah'), 'مکی');
      assert.strictEqual(formatRevelationPlace('madinah'), 'مدنی');
    });

    it('formats comprehensive header accessibility label with Persian numerals', () => {
      const fatihah = {
        id: 1,
        name_fa: 'فاتحه',
        name_arabic: 'الفاتحة',
        revelation_place: 'makkah',
        revelation_order: 5,
        verses_count: 7,
      };

      const a11yLabel = formatSurahHeaderAccessibilityLabel(fatihah);
      assert.strictEqual(
        a11yLabel,
        'سوره شماره ۱، فاتحه، الفاتحة، مکی، رتبه نزول ۵، ۷ آیه'
      );
    });

    it('formats info button accessibility label with Persian Surah name', () => {
      assert.strictEqual(
        formatInfoButtonAccessibilityLabel('فاتحه'),
        'اطلاعات و شناسنامه سوره فاتحه'
      );
      assert.strictEqual(
        formatInfoButtonAccessibilityLabel('بقره'),
        'اطلاعات و شناسنامه سوره بقره'
      );
    });

    it('validates all 114 Surahs from DB satisfy SurahHeaderBanner contracts', () => {
      const chapters = db.prepare('SELECT * FROM chapters ORDER BY id ASC').all();
      assert.strictEqual(chapters.length, 114);

      for (const ch of chapters) {
        // ID & Persian formatting
        assert.strictEqual(formatSurahNumberBadge(ch.id), `سوره ${toPersianDigits(ch.id)}`);

        // Revelation order badge
        assert.strictEqual(
          formatRevelationOrderBadge(ch.revelation_order),
          `ترتیب نزول: ${toPersianDigits(ch.revelation_order)}`
        );

        // Verse count badge
        assert.strictEqual(
          formatVerseCountBadge(ch.verses_count),
          `${toPersianDigits(ch.verses_count)} آیه`
        );

        // Revelation place
        assert.ok(ch.revelation_place === 'makkah' || ch.revelation_place === 'madinah');
        const placeLabel = formatRevelationPlace(ch.revelation_place);
        assert.ok(placeLabel === 'مکی' || placeLabel === 'مدنی');

        // Accessibility label completeness
        const a11y = formatSurahHeaderAccessibilityLabel(ch);
        assert.ok(a11y.includes(`سوره شماره ${toPersianDigits(ch.id)}`));
        assert.ok(a11y.includes(ch.name_fa));
        assert.ok(a11y.includes(ch.name_arabic));
        assert.ok(a11y.includes(placeLabel));
        assert.ok(a11y.includes(`رتبه نزول ${toPersianDigits(ch.revelation_order)}`));
        assert.ok(a11y.includes(`${toPersianDigits(ch.verses_count)} آیه`));

        // Info button accessibility label
        const infoA11y = formatInfoButtonAccessibilityLabel(ch.name_fa);
        assert.strictEqual(infoA11y, `اطلاعات و شناسنامه سوره ${ch.name_fa}`);
      }
    });

    it('verifies boundary cases: Surah 1 (Al-Fatihah), Surah 2 (Al-Baqarah), Surah 9 (At-Tawbah), Surah 114 (An-Nas)', () => {
      const fatihah = db.prepare('SELECT * FROM chapters WHERE id = 1').get();
      assert.strictEqual(fatihah.name_arabic, 'الفاتحة');
      assert.strictEqual(formatRevelationPlace(fatihah.revelation_place), 'مکی');
      assert.strictEqual(formatRevelationOrderBadge(fatihah.revelation_order), 'ترتیب نزول: ۵');
      assert.strictEqual(formatVerseCountBadge(fatihah.verses_count), '۷ آیه');

      const baqarah = db.prepare('SELECT * FROM chapters WHERE id = 2').get();
      assert.strictEqual(baqarah.name_arabic, 'البقرة');
      assert.strictEqual(formatRevelationPlace(baqarah.revelation_place), 'مدنی');
      assert.strictEqual(formatRevelationOrderBadge(baqarah.revelation_order), 'ترتیب نزول: ۸۷');
      assert.strictEqual(formatVerseCountBadge(baqarah.verses_count), '۲۸۶ آیه');

      const tawbah = db.prepare('SELECT * FROM chapters WHERE id = 9').get();
      assert.strictEqual(tawbah.name_arabic, 'التوبة');
      assert.strictEqual(formatRevelationPlace(tawbah.revelation_place), 'مدنی');
      assert.strictEqual(formatRevelationOrderBadge(tawbah.revelation_order), 'ترتیب نزول: ۱۱۳');
      assert.strictEqual(formatVerseCountBadge(tawbah.verses_count), '۱۲۹ آیه');

      const nas = db.prepare('SELECT * FROM chapters WHERE id = 114').get();
      assert.strictEqual(nas.name_arabic, 'الناس');
      assert.strictEqual(formatRevelationPlace(nas.revelation_place), 'مکی');
      assert.strictEqual(formatRevelationOrderBadge(nas.revelation_order), 'ترتیب نزول: ۲۱');
      assert.strictEqual(formatVerseCountBadge(nas.verses_count), '۶ آیه');
    });
  });

  describe('Touch Targets & Layout Dimensions Contracts (>= 44x44px)', () => {
    it('verifies minimum touch targets comply with WCAG >= 44x44px', () => {
      const { minTouchTarget, surahHeader, bismillah } = READER_COMPONENT_CONTRACTS;

      assert.strictEqual(minTouchTarget, 44);
      assert.ok(surahHeader.infoButtonSize >= minTouchTarget, 'Info button size >= 44px');
      assert.ok(surahHeader.emblemSize >= minTouchTarget, 'Emblem size >= 44px');
      assert.ok(surahHeader.minHeight >= minTouchTarget, 'SurahHeader minHeight >= 44px');
      assert.ok(bismillah.minHeight >= minTouchTarget, 'Bismillah minHeight >= 44px');
    });

    it('verifies Sanctuary design tokens: colors, typography, spacing, border radii', () => {
      const { surahHeader } = READER_COMPONENT_CONTRACTS;

      // Card geometry
      assert.strictEqual(surahHeader.outerBorderRadius, borderRadius.xl);
      assert.strictEqual(surahHeader.innerBorderRadius, borderRadius.lg);
      assert.strictEqual(surahHeader.outerPadding, spacing.lg);
      assert.strictEqual(surahHeader.innerPadding, spacing.md);

      // Calligraphy & typography
      assert.strictEqual(surahHeader.arabicFontSize, 32);
      assert.strictEqual(surahHeader.arabicLineHeight, 48);
      assert.strictEqual(surahHeader.persianFontSize, 16);
      assert.strictEqual(surahHeader.persianLineHeight, 24);
      assert.strictEqual(surahHeader.infoIconSize, 20);

      // Sanctuary theme tokens
      assert.strictEqual(colors.surfaceCard, 'rgba(6, 32, 25, 0.75)');
      assert.strictEqual(colors.surfaceFloating, 'rgba(10, 38, 30, 0.85)');
      assert.strictEqual(colors.borderIridescent, 'rgba(52, 211, 153, 0.3)');
      assert.strictEqual(colors.borderSubtle, 'rgba(16, 185, 129, 0.15)');
      assert.strictEqual(colors.goldAccent, '#fbbf24');
      assert.strictEqual(colors.badgeMakki, 'rgba(245, 158, 11, 0.15)');
      assert.strictEqual(colors.badgeMadani, 'rgba(16, 185, 129, 0.15)');
      assert.strictEqual(colors.badgeMakkiText, '#fcd34d');
      assert.strictEqual(colors.badgeMadaniText, '#6ee7b7');
      assert.ok(typographySource.includes("quranHafs: 'UthmanicHafs'"));
      assert.ok(typographySource.includes("uiRegular: 'Vazirmatn-Regular'"));
    });

    it('verifies SurahHeaderBanner.tsx source code contains required layout, touch targets, and props', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, './SurahHeaderBanner.tsx'),
        'utf8'
      );

      // 1. Ornate Sanctuary frame with tokens
      assert.ok(source.includes('colors.surfaceCard'));
      assert.ok(source.includes('colors.surfaceFloating'));
      assert.ok(source.includes('colors.borderIridescent'));
      assert.ok(source.includes('borderRadius.xl'));
      assert.ok(source.includes('spacing.lg'));

      // 2. Calligraphic titles
      assert.ok(source.includes('fonts.quranHafs'));
      assert.ok(source.includes('colors.goldAccent'));
      assert.ok(source.includes('chapter.name_arabic'));
      assert.ok(source.includes('fonts.uiRegular'));
      assert.ok(source.includes('chapter.name_fa'));

      // 3. Badges row
      assert.ok(source.includes('surahNumberBadgeText'));
      assert.ok(source.includes('revelationPlaceText'));
      assert.ok(source.includes('revelationOrderText'));
      assert.ok(source.includes('verseCountText'));
      assert.ok(source.includes('colors.badgeMakki'));
      assert.ok(source.includes('colors.badgeMadani'));

      // 4. Info button with Info icon and >= 44x44px touch target
      assert.ok(source.includes('<Info'));
      assert.ok(source.includes('minWidth: READER_COMPONENT_CONTRACTS.surahHeader.infoButtonSize'));
      assert.ok(source.includes('minHeight: READER_COMPONENT_CONTRACTS.surahHeader.infoButtonSize'));
      assert.ok(source.includes('accessibilityRole="button"'));
      assert.ok(source.includes('onPress={handleInfoPress}'));
      assert.ok(source.includes('onPressInfo?.(chapter)'));

      // 5. Persian numerals via toPersianDigits
      assert.ok(source.includes('toPersianDigits(chapter.id)'));
    });
  });

  describe('Reader Index Exports Contract', () => {
    it('verifies mobile/src/components/reader/index.ts exports all components and contracts', () => {
      const indexSource = fs.readFileSync(
        path.resolve(__dirname, './index.ts'),
        'utf8'
      );

      assert.ok(indexSource.includes("export * from './SurahHeaderBanner'"));
      assert.ok(indexSource.includes("export * from './BismillahBanner'"));
      assert.ok(indexSource.includes("export * from './readerContracts'"));
    });
  });
});
