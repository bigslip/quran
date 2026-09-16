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
  formatVerseBadgeNumber,
  formatContinuousVerseAccessibilityLabel,
  formatMushafJuzTitle,
  formatMushafPageTitle,
  formatMushafSurahTitle,
  formatMushafHeaderAccessibilityLabel,
  groupWordsByLine,
  CHAPTER_NAMES_FA,
  getSurahNameFa,
  formatAudioDockTitle,
  formatFontScalePercentage,
  clampFontScale,
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

  describe('ContinuousVerseCard Component Contracts, Layout & Formatting', () => {
    it('formats verse badge number in Persian digits for single, double, and triple digits', () => {
      assert.strictEqual(formatVerseBadgeNumber(1), '۱');
      assert.strictEqual(formatVerseBadgeNumber(7), '۷');
      assert.strictEqual(formatVerseBadgeNumber(42), '۴۲');
      assert.strictEqual(formatVerseBadgeNumber(110), '۱۱۰');
      assert.strictEqual(formatVerseBadgeNumber(255), '۲۵۵');
      assert.strictEqual(formatVerseBadgeNumber(286), '۲۸۶');
    });

    it('formats comprehensive accessibility label for ContinuousVerseCard with active translation info', () => {
      const verse = { verse_number: 255, chapter_id: 2 };
      assert.strictEqual(
        formatContinuousVerseAccessibilityLabel(verse),
        'آیه شماره ۲۵۵ از سوره ۲'
      );
      assert.strictEqual(
        formatContinuousVerseAccessibilityLabel(verse, 'مکارم'),
        'آیه شماره ۲۵۵ از سوره ۲، ترجمه فعال: مکارم'
      );
      assert.strictEqual(
        formatContinuousVerseAccessibilityLabel(verse, 'انصاریان'),
        'آیه شماره ۲۵۵ از سوره ۲، ترجمه فعال: انصاریان'
      );
      assert.strictEqual(
        formatContinuousVerseAccessibilityLabel(verse, 'هردو'),
        'آیه شماره ۲۵۵ از سوره ۲، ترجمه فعال: هردو'
      );
    });

    it('verifies font scale scaling calculations and contracts', () => {
      const { quranFontSize, quranLineHeightDefault, defaultFontScale } =
        READER_COMPONENT_CONTRACTS.verseCard;

      assert.strictEqual(quranFontSize, 26);
      assert.strictEqual(quranLineHeightDefault, 54);
      assert.strictEqual(defaultFontScale, 1.0);

      // Scale 1.0 (default)
      const scale1Size = Math.round(quranFontSize * 1.0);
      const scale1LH = Math.round(quranLineHeightDefault * 1.0);
      assert.strictEqual(scale1Size, 26);
      assert.strictEqual(scale1LH, 54);
      assert.ok(scale1LH >= 52 && scale1LH <= 56, 'Line height at scale 1.0 is ~52-56px');

      // Scale 1.3
      const scale13Size = Math.round(quranFontSize * 1.3);
      const scale13LH = Math.round(quranLineHeightDefault * 1.3);
      assert.strictEqual(scale13Size, 34);
      assert.strictEqual(scale13LH, 70);

      // Scale 0.8
      const scale08Size = Math.round(quranFontSize * 0.8);
      const scale08LH = Math.round(quranLineHeightDefault * 0.8);
      assert.strictEqual(scale08Size, 21);
      assert.strictEqual(scale08LH, 43);

      // Scale 1.5
      const scale15Size = Math.round(quranFontSize * 1.5);
      const scale15LH = Math.round(quranLineHeightDefault * 1.5);
      assert.strictEqual(scale15Size, 39);
      assert.strictEqual(scale15LH, 81);
    });

    it('simulates translation switching logic (makarem, ansarian, both, none)', () => {
      const sampleVerse = {
        id: 1,
        chapter_id: 1,
        verse_number: 1,
        verse_key: '1:1',
        page_number: 1,
        juz_number: 1,
        hizb_number: 1,
        rub_el_hizb_number: 1,
        text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
        translation_fa_makarem: 'به نام خداوند بخشنده بخشایشگر',
        translation_fa_ansarian: 'به نام خدا که رحمتش بی‌اندازه است و مهربانی‌اش همیشگی',
      };

      function evaluateRenderedTranslations(showTranslation, activeTranslation, v) {
        const renderMakarem =
          showTranslation &&
          (activeTranslation === 'makarem' || activeTranslation === 'both') &&
          Boolean(v.translation_fa_makarem);
        const renderAnsarian =
          showTranslation &&
          (activeTranslation === 'ansarian' || activeTranslation === 'both') &&
          Boolean(v.translation_fa_ansarian);
        return { renderMakarem, renderAnsarian };
      }

      // 1. activeTranslation === 'makarem'
      const tMakarem = evaluateRenderedTranslations(true, 'makarem', sampleVerse);
      assert.strictEqual(tMakarem.renderMakarem, true);
      assert.strictEqual(tMakarem.renderAnsarian, false);

      // 2. activeTranslation === 'ansarian'
      const tAnsarian = evaluateRenderedTranslations(true, 'ansarian', sampleVerse);
      assert.strictEqual(tAnsarian.renderMakarem, false);
      assert.strictEqual(tAnsarian.renderAnsarian, true);

      // 3. activeTranslation === 'both'
      const tBoth = evaluateRenderedTranslations(true, 'both', sampleVerse);
      assert.strictEqual(tBoth.renderMakarem, true);
      assert.strictEqual(tBoth.renderAnsarian, true);

      // 4. showTranslation === false
      const tDisabled = evaluateRenderedTranslations(false, 'both', sampleVerse);
      assert.strictEqual(tDisabled.renderMakarem, false);
      assert.strictEqual(tDisabled.renderAnsarian, false);
    });

    it('verifies active playing state styling contract tokens', () => {
      const { activeBorderColor, activeBackgroundColor } =
        READER_COMPONENT_CONTRACTS.verseCard;

      assert.strictEqual(activeBorderColor, '#10b981');
      assert.strictEqual(activeBorderColor, colors.primary);
      assert.strictEqual(activeBackgroundColor, 'rgba(10, 38, 30, 0.85)');
      assert.strictEqual(activeBackgroundColor, colors.surfaceFloating);
    });

    it('verifies ContinuousVerseCard.tsx source code contracts and accessibility', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, './ContinuousVerseCard.tsx'),
        'utf8'
      );

      // 1. Concentric geometric verse number badge in Persian digits
      assert.ok(source.includes('badgeOuter'));
      assert.ok(source.includes('badgeInner'));
      assert.ok(source.includes('verseBadgeText'));
      assert.ok(source.includes('formatVerseBadgeNumber(verse.verse_number)'));

      // 2. Sacred Arabic text with selectable font and scaling
      assert.ok(source.includes('arabicFontFamily'));
      assert.ok(source.includes('fonts.quranHafs'));
      assert.ok(source.includes('fonts.quranIndoPak'));
      assert.ok(source.includes('scaledQuranFontSize'));
      assert.ok(source.includes('scaledQuranLineHeight'));
      assert.ok(source.includes('colors.textPrimary'));
      assert.ok(source.includes('allowFontScaling={false}'));

      // 3. Word-by-word inline view
      assert.ok(source.includes('showWordByWord'));
      assert.ok(source.includes('wbwFlowContainer'));
      assert.ok(source.includes('wbwItemCard'));
      assert.ok(source.includes('wbwGlossText'));
      assert.ok(source.includes('word.translation_fa'));

      // 4. Translation view with chips
      assert.ok(source.includes('translationsContainer'));
      assert.ok(source.includes('translationBlock'));
      assert.ok(source.includes('translatorChip'));
      assert.ok(source.includes('مکارم شیرازی'));
      assert.ok(source.includes('حسین انصاریان'));
      assert.ok(source.includes('verse.translation_fa_makarem'));
      assert.ok(source.includes('verse.translation_fa_ansarian'));

      // 5. 4 Action buttons with >= 44x44px touch targets
      assert.ok(source.includes('onPlayVerse'));
      assert.ok(source.includes('onBookmarkVerse'));
      assert.ok(source.includes('onShareVerse'));
      assert.ok(source.includes('onVerseInsights'));
      assert.ok(source.includes('minWidth: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize'));
      assert.ok(source.includes('minHeight: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize'));
      assert.ok(source.includes('accessibilityRole="button"'));

      // 6. Active playing state
      assert.ok(source.includes('isActivePlaying'));
      assert.ok(source.includes('cardActive'));
      assert.ok(source.includes('cardInactive'));
      assert.ok(source.includes('colors.surfaceFloating'));
      assert.ok(source.includes('colors.primary'));
    });
  });

  describe('MushafPageView Component Contracts, Line Grouping & Navigation', () => {
    it('groups words by line across 15 lines for Page 1 (Al-Fatihah) from SQLite database', () => {
      const page1Words = db
        .prepare(
          'SELECT * FROM words WHERE page_number = 1 ORDER BY line_number ASC, chapter_id ASC, verse_number ASC, position ASC'
        )
        .all();
      assert.strictEqual(page1Words.length, 29);

      const lineMap = groupWordsByLine(page1Words);
      assert.strictEqual(lineMap.size, 15);

      // On Page 1, lines 1..8 are decorative frame/headpiece, lines 9..15 contain all 29 words
      for (let l = 1; l <= 8; l++) {
        assert.strictEqual(lineMap.get(l).length, 0, `Line ${l} on Page 1 must be empty`);
      }

      let totalWordsInMap = 0;
      for (let l = 9; l <= 15; l++) {
        const wordsOnLine = lineMap.get(l);
        assert.ok(wordsOnLine.length > 0, `Line ${l} on Page 1 must have words`);
        totalWordsInMap += wordsOnLine.length;
      }
      assert.strictEqual(totalWordsInMap, 29);

      // First word: Bismillah on line 9
      assert.strictEqual(lineMap.get(9)[0].verse_key, '1:1');
      assert.strictEqual(lineMap.get(9)[0].text_uthmani, 'بِسْمِ');

      // Last word: Ad-Dallin on line 15
      const line15Words = lineMap.get(15);
      assert.strictEqual(line15Words[line15Words.length - 1].verse_key, '1:7');
      assert.strictEqual(line15Words[line15Words.length - 1].text_uthmani, 'ٱلضَّآلِّينَ');
    });

    it('groups words by line across all 15 lines for Page 3 from SQLite database', () => {
      const page3Words = db
        .prepare(
          'SELECT * FROM words WHERE page_number = 3 ORDER BY line_number ASC, chapter_id ASC, verse_number ASC, position ASC'
        )
        .all();
      assert.ok(page3Words.length > 0);

      const lineMap = groupWordsByLine(page3Words);
      assert.strictEqual(lineMap.size, 15);

      // All 15 lines on Page 3 must contain words
      for (let l = 1; l <= 15; l++) {
        const wordsOnLine = lineMap.get(l);
        assert.ok(wordsOnLine.length > 0, `Line ${l} on Page 3 must have words`);
        for (const w of wordsOnLine) {
          assert.strictEqual(w.line_number, l);
        }
      }

      // Check strict monotonic reading order inside every line
      for (let l = 1; l <= 15; l++) {
        const words = lineMap.get(l);
        for (let i = 0; i < words.length - 1; i++) {
          const curr = words[i];
          const next = words[i + 1];
          assert.ok(
            curr.chapter_id < next.chapter_id ||
              (curr.chapter_id === next.chapter_id && curr.verse_number < next.verse_number) ||
              (curr.chapter_id === next.chapter_id &&
                curr.verse_number === next.verse_number &&
                curr.position < next.position),
            `Line ${l} words must be in strict sequential reading order`
          );
        }
      }
    });

    it('groups words across multi-Surah page (Page 604) correctly preserving line grouping', () => {
      const page604Words = db
        .prepare(
          'SELECT * FROM words WHERE page_number = 604 ORDER BY line_number ASC, chapter_id ASC, verse_number ASC, position ASC'
        )
        .all();
      assert.ok(page604Words.length > 0);

      const lineMap = groupWordsByLine(page604Words);
      assert.strictEqual(lineMap.size, 15);

      // Page 604 contains Surahs 112 (Al-Ikhlas), 113 (Al-Falaq), and 114 (An-Nas)
      const surahsFound = new Set();
      for (let l = 1; l <= 15; l++) {
        for (const w of lineMap.get(l)) {
          surahsFound.add(w.chapter_id);
        }
      }
      assert.ok(surahsFound.has(112));
      assert.ok(surahsFound.has(113));
      assert.ok(surahsFound.has(114));
    });

    it('handles edge cases for groupWordsByLine (empty input, unsorted input, invalid lines)', () => {
      // Empty input
      const emptyMap = groupWordsByLine([]);
      assert.strictEqual(emptyMap.size, 15);
      for (let l = 1; l <= 15; l++) {
        assert.deepStrictEqual(emptyMap.get(l), []);
      }

      // Unsorted input is sorted in canonical reading order
      const unsortedWords = [
        { id: 2, line_number: 1, chapter_id: 1, verse_number: 1, position: 2, text_uthmani: 'ٱللَّهِ' },
        { id: 1, line_number: 1, chapter_id: 1, verse_number: 1, position: 1, text_uthmani: 'بِسْمِ' },
        { id: 3, line_number: 16, chapter_id: 1, verse_number: 1, position: 3, text_uthmani: 'invalid' }, // line 16 out of bounds
      ];
      const sortedMap = groupWordsByLine(unsortedWords);
      assert.strictEqual(sortedMap.get(1).length, 2);
      assert.strictEqual(sortedMap.get(1)[0].position, 1);
      assert.strictEqual(sortedMap.get(1)[1].position, 2);
      assert.strictEqual(sortedMap.has(16), false);
    });

    it('formats Mushaf page header titles in Persian digits', () => {
      // Juz titles
      assert.strictEqual(formatMushafJuzTitle(1), 'جزء ۱');
      assert.strictEqual(formatMushafJuzTitle(15), 'جزء ۱۵');
      assert.strictEqual(formatMushafJuzTitle(30), 'جزء ۳۰');

      // Page titles
      assert.strictEqual(formatMushafPageTitle(1), 'صفحه ۱');
      assert.strictEqual(formatMushafPageTitle(2), 'صفحه ۲');
      assert.strictEqual(formatMushafPageTitle(604), 'صفحه ۶۰۴');

      // Surah titles
      assert.strictEqual(formatMushafSurahTitle('فاتحه'), 'سوره فاتحه');
      assert.strictEqual(formatMushafSurahTitle('سوره بقره'), 'سوره بقره');
      assert.strictEqual(formatMushafSurahTitle(''), '');

      // Header accessibility label
      assert.strictEqual(
        formatMushafHeaderAccessibilityLabel(1, 1, 'فاتحه'),
        'صفحه ۱، جزء ۱، سوره فاتحه'
      );
      assert.strictEqual(
        formatMushafHeaderAccessibilityLabel(604, 30, 'ناس'),
        'صفحه ۶۰۴، جزء ۳۰، سوره ناس'
      );
    });

    it('verifies CHAPTER_NAMES_FA and getSurahNameFa lookup across all 114 Surahs', () => {
      assert.strictEqual(Object.keys(CHAPTER_NAMES_FA).length, 114);
      assert.strictEqual(getSurahNameFa(1), 'فاتحه');
      assert.strictEqual(getSurahNameFa(2), 'بقره');
      assert.strictEqual(getSurahNameFa(3), 'آل عمران');
      assert.strictEqual(getSurahNameFa(18), 'کهف');
      assert.strictEqual(getSurahNameFa(36), 'یس');
      assert.strictEqual(getSurahNameFa(55), 'الرحمن');
      assert.strictEqual(getSurahNameFa(112), 'اخلاص');
      assert.strictEqual(getSurahNameFa(113), 'فلق');
      assert.strictEqual(getSurahNameFa(114), 'ناس');
      assert.strictEqual(getSurahNameFa(999), '');
    });

    it('verifies MushafPageView.tsx source code structure, contracts, and touch targets', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, './MushafPageView.tsx'),
        'utf8'
      );

      // 1. Header bar
      assert.ok(source.includes('accessibilityRole="header"'));
      assert.ok(source.includes('formatMushafJuzTitle'));
      assert.ok(source.includes('formatMushafSurahTitle'));
      assert.ok(source.includes('formatMushafPageTitle'));

      // 2. 15-line physical layout
      assert.ok(source.includes('READER_COMPONENT_CONTRACTS.mushafPage.totalLines'));
      assert.ok(source.includes('groupWordsByLine'));
      assert.ok(source.includes('LINES_LIST.map') || source.includes('linesList.map'));
      assert.ok(source.includes('mushafLine'));
      assert.ok(source.includes('flexDirection: \'row-reverse\''));

      // 3. Interactive word selection
      assert.ok(source.includes('onVersePress?.(word.verse_key)'));
      assert.ok(source.includes('ayahEndMarker'));

      // 4. Page navigation bottom controls with >= 44x44px touch targets
      assert.ok(source.includes('onPrevPage'));
      assert.ok(source.includes('onNextPage'));
      assert.ok(source.includes('minWidth: READER_COMPONENT_CONTRACTS.mushafPage.navButtonSize'));
      assert.ok(source.includes('minHeight: READER_COMPONENT_CONTRACTS.mushafPage.navButtonSize'));
      assert.ok(source.includes('accessibilityLabel="صفحه قبلی"'));
      assert.ok(source.includes('accessibilityLabel="صفحه بعدی"'));
      assert.ok(source.includes('disabled={pageNumber >= 604}'));
      assert.ok(source.includes('disabled={pageNumber <= 1}'));
    });
  });

  describe('AudioPlaybackDock Component Contracts, Layout & Formatting', () => {
    it('formats Persian Ayah title with Surah name and Persian verse numbers', () => {
      // Standard cases
      assert.strictEqual(
        formatAudioDockTitle('الفاتحه', 1),
        'سوره الفاتحه • آیه ۱'
      );
      assert.strictEqual(
        formatAudioDockTitle('سوره بقره', 255),
        'سوره بقره • آیه ۲۵۵'
      );
      assert.strictEqual(
        formatAudioDockTitle('کهف', 110),
        'سوره کهف • آیه ۱۱۰'
      );

      // Surah name only
      assert.strictEqual(formatAudioDockTitle('یس'), 'سوره یس');
      assert.strictEqual(formatAudioDockTitle('سوره اخلاص'), 'سوره اخلاص');

      // Verse number only
      assert.strictEqual(formatAudioDockTitle(undefined, 7), 'آیه ۷');
      assert.strictEqual(formatAudioDockTitle('', 42), 'آیه ۴۲');

      // Empty input
      assert.strictEqual(formatAudioDockTitle(), '');
      assert.strictEqual(formatAudioDockTitle('', undefined), '');
    });

    it('verifies AudioPlaybackDock layout and dimension contracts', () => {
      const { audioDock, minTouchTarget } = READER_COMPONENT_CONTRACTS;

      assert.strictEqual(audioDock.minHeight, 64);
      assert.strictEqual(audioDock.primaryButtonSize, 48);
      assert.strictEqual(audioDock.secondaryButtonSize, 44);
      assert.strictEqual(audioDock.defaultReciter, 'استاد شهریار پرهیزگار');

      // Touch target compliance
      assert.ok(audioDock.minHeight >= minTouchTarget);
      assert.ok(audioDock.primaryButtonSize >= minTouchTarget);
      assert.ok(audioDock.secondaryButtonSize >= minTouchTarget);
    });

    it('verifies AudioPlaybackDock.tsx source code structure, contracts, RTL layout, and accessibility', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, './AudioPlaybackDock.tsx'),
        'utf8'
      );

      // 1. Props interface
      assert.ok(source.includes('interface AudioPlaybackDockProps'));
      assert.ok(source.includes('isPlaying: boolean'));
      assert.ok(source.includes('activeVerseKey: string | null'));
      assert.ok(source.includes('surahName?: string'));
      assert.ok(source.includes('verseNumber?: number'));
      assert.ok(source.includes('reciterName?: string'));
      assert.ok(source.includes('onPlayPause?: () => void'));
      assert.ok(source.includes('onNextAyah?: () => void'));
      assert.ok(source.includes('onPrevAyah?: () => void'));
      assert.ok(source.includes('onToggleRepeat?: () => void'));
      assert.ok(source.includes('isRepeating?: boolean'));
      assert.ok(source.includes('onPressDock?: () => void'));
      assert.ok(source.includes('onCloseDock?: () => void'));

      // 2. Returns null when activeVerseKey is null
      assert.ok(source.includes('if (!activeVerseKey)'));
      assert.ok(source.includes('return null;'));

      // 3. Fallback reciter name
      assert.ok(source.includes('READER_COMPONENT_CONTRACTS.audioDock.defaultReciter'));

      // 4. RTL alignment and Sanctuary tokens
      assert.ok(source.includes("flexDirection: 'row-reverse'"));
      assert.ok(source.includes('colors.surfaceFloating'));
      assert.ok(source.includes('colors.borderIridescent'));
      assert.ok(source.includes('colors.primary'));
      assert.ok(source.includes('borderRadius.lg'));

      // 5. Controls toolbar and prominent Play/Pause button (48px)
      assert.ok(source.includes('playPauseButton'));
      assert.ok(source.includes('READER_COMPONENT_CONTRACTS.audioDock.primaryButtonSize'));
      assert.ok(source.includes('READER_COMPONENT_CONTRACTS.audioDock.secondaryButtonSize'));

      // 6. Lucide icons: Play, Pause, SkipBack, SkipForward, Repeat, X
      assert.ok(source.includes('<Play'));
      assert.ok(source.includes('<Pause'));
      assert.ok(source.includes('<SkipBack'));
      assert.ok(source.includes('<SkipForward'));
      assert.ok(source.includes('<Repeat'));
      assert.ok(source.includes('<X'));

      // 7. Persian accessibility labels & roles
      assert.ok(source.includes('accessibilityRole="toolbar"'));
      assert.ok(source.includes('accessibilityRole="button"'));
      assert.ok(source.includes('توقف پخش صوت'));
      assert.ok(source.includes('پخش صوت'));
      assert.ok(source.includes('آیه بعدی'));
      assert.ok(source.includes('آیه قبلی'));
      assert.ok(source.includes('تکرار آیه'));
      assert.ok(source.includes('بستن پخش صوتی'));

      // 8. React.memo optimization
      assert.ok(source.includes('React.memo('));
    });
  });

  describe('ReaderSettingsModal Component Contracts, Stepper & Toggles', () => {
    it('formats font scale percentages with Persian numerals', () => {
      assert.strictEqual(formatFontScalePercentage(1.0), '۱۰۰٪');
      assert.strictEqual(formatFontScalePercentage(0.8), '۸۰٪');
      assert.strictEqual(formatFontScalePercentage(1.6), '۱۶۰٪');
      assert.strictEqual(formatFontScalePercentage(1.2), '۱۲۰٪');
      assert.strictEqual(formatFontScalePercentage(0.95), '۹۵٪');
      assert.strictEqual(formatFontScalePercentage(1.35), '۱۳۵٪');
    });

    it('enforces font scale boundaries [0.8 .. 1.6] and stepper clamping logic', () => {
      const { minScale, maxScale, scaleStep } = READER_COMPONENT_CONTRACTS.settingsModal;

      assert.strictEqual(minScale, 0.8);
      assert.strictEqual(maxScale, 1.6);
      assert.strictEqual(scaleStep, 0.1);

      // Clamping logic
      assert.strictEqual(clampFontScale(0.5), 0.8);
      assert.strictEqual(clampFontScale(0.79), 0.8);
      assert.strictEqual(clampFontScale(0.8), 0.8);
      assert.strictEqual(clampFontScale(1.0), 1.0);
      assert.strictEqual(clampFontScale(1.4), 1.4);
      assert.strictEqual(clampFontScale(1.6), 1.6);
      assert.strictEqual(clampFontScale(1.61), 1.6);
      assert.strictEqual(clampFontScale(2.0), 1.6);

      // Decrement step clamp simulation
      let currentScale = 0.8;
      let nextScale = Math.max(minScale, Math.round((currentScale - scaleStep) * 10) / 10);
      assert.strictEqual(nextScale, 0.8, 'Cannot decrement below minScale 0.8');

      // Increment step clamp simulation
      currentScale = 1.6;
      nextScale = Math.min(maxScale, Math.round((currentScale + scaleStep) * 10) / 10);
      assert.strictEqual(nextScale, 1.6, 'Cannot increment above maxScale 1.6');

      // Mid-range step
      currentScale = 1.0;
      assert.strictEqual(
        Math.min(maxScale, Math.round((currentScale + scaleStep) * 10) / 10),
        1.1
      );
      assert.strictEqual(
        Math.max(minScale, Math.round((currentScale - scaleStep) * 10) / 10),
        0.9
      );
    });

    it('verifies ReaderSettingsModal layout, dimension contracts, and touch targets', () => {
      const { settingsModal, minTouchTarget } = READER_COMPONENT_CONTRACTS;

      assert.strictEqual(settingsModal.closeButtonSize, 44);
      assert.strictEqual(settingsModal.stepperButtonSize, 44);
      assert.ok(settingsModal.closeButtonSize >= minTouchTarget);
      assert.ok(settingsModal.stepperButtonSize >= minTouchTarget);
    });

    it('verifies ReaderSettingsModal.tsx source code structure, contracts, and touch targets', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, './ReaderSettingsModal.tsx'),
        'utf8'
      );

      // 1. Props interface
      assert.ok(source.includes('interface ReaderSettingsModalProps'));
      assert.ok(source.includes('visible: boolean'));
      assert.ok(source.includes('onClose: () => void'));
      assert.ok(source.includes('fontScale: number'));
      assert.ok(source.includes('onChangeFontScale: (scale: number) => void'));
      assert.ok(source.includes("viewMode: 'continuous' | 'mushaf'"));
      assert.ok(source.includes("onChangeViewMode: (mode: 'continuous' | 'mushaf') => void"));
      assert.ok(source.includes("quranFont: 'hafs' | 'indopak'"));
      assert.ok(source.includes("onChangeQuranFont: (font: 'hafs' | 'indopak') => void"));
      assert.ok(source.includes("activeTranslation: 'makarem' | 'ansarian' | 'both'"));
      assert.ok(source.includes("onChangeActiveTranslation: (translation: 'makarem' | 'ansarian' | 'both') => void"));
      assert.ok(source.includes('showWordByWord: boolean'));
      assert.ok(source.includes('onToggleWordByWord: (show: boolean) => void'));
      assert.ok(source.includes('showTranslation?: boolean'));
      assert.ok(source.includes('onToggleShowTranslation?: (show: boolean) => void'));

      // 2. Modal configuration
      assert.ok(source.includes('<Modal'));
      assert.ok(source.includes('transparent={true}'));
      assert.ok(source.includes('animationType="slide"'));

      // 3. Header and dismiss touch targets >= 44x44px
      assert.ok(source.includes('تنظیمات مطالعه قرآن'));
      assert.ok(source.includes('READER_COMPONENT_CONTRACTS.settingsModal.closeButtonSize'));
      assert.ok(source.includes('accessibilityLabel="بستن تنظیمات"'));

      // 4. Section 1: View mode segmented buttons
      assert.ok(source.includes('حالت نمایش'));
      assert.ok(source.includes('نمای متنی (پیوسته)'));
      assert.ok(source.includes('مصحف چاپی (۱۵ خطی)'));
      assert.ok(source.includes("onChangeViewMode('continuous')"));
      assert.ok(source.includes("onChangeViewMode('mushaf')"));

      // 5. Section 2: Quran font segmented buttons
      assert.ok(source.includes('قلم رسم‌الخط قرآن'));
      assert.ok(source.includes('عثمان طه (حفص)'));
      assert.ok(source.includes('نستعلیق (اردو / شبه‌قاره)'));
      assert.ok(source.includes("onChangeQuranFont('hafs')"));
      assert.ok(source.includes("onChangeQuranFont('indopak')"));

      // 6. Section 3: Font scale stepper & live preview
      assert.ok(source.includes('اندازه قلم قرآن'));
      assert.ok(source.includes('READER_COMPONENT_CONTRACTS.settingsModal.stepperButtonSize'));
      assert.ok(source.includes('handleDecrementScale'));
      assert.ok(source.includes('handleIncrementScale'));
      assert.ok(source.includes('formatFontScalePercentage'));
      assert.ok(source.includes('previewArabicText'));
      assert.ok(source.includes('previewText'));

      // 7. Section 4: Persian translation segmented selector
      assert.ok(source.includes('انتخاب مترجم فارسی'));
      assert.ok(source.includes('مکارم شیرازی'));
      assert.ok(source.includes('حسین انصاریان'));
      assert.ok(source.includes('هر دو'));
      assert.ok(source.includes("onChangeActiveTranslation('makarem')"));
      assert.ok(source.includes("onChangeActiveTranslation('ansarian')"));
      assert.ok(source.includes("onChangeActiveTranslation('both')"));

      // 8. Section 5: Switches
      assert.ok(source.includes('<Switch'));
      assert.ok(source.includes('نمایش ترجمه واژه به واژه'));
      assert.ok(source.includes('نمایش ترجمه فارسی'));

      // 9. Sanctuary tokens
      assert.ok(source.includes('colors.surfaceCard'));
      assert.ok(source.includes('colors.primary'));
      assert.ok(source.includes('borderRadius.xl'));

      // 10. React.memo optimization
      assert.ok(source.includes('React.memo('));
    });
  });

  describe('Dual-Mode Touch Targets & Accessibility Compliance (>= 44x44px)', () => {
    it('verifies all reader components guarantee minimum touch target size >= 44x44px', () => {
      const {
        minTouchTarget,
        surahHeader,
        bismillah,
        verseCard,
        mushafPage,
        audioDock,
        settingsModal,
      } = READER_COMPONENT_CONTRACTS;

      assert.strictEqual(minTouchTarget, 44);

      // SurahHeaderBanner
      assert.ok(surahHeader.infoButtonSize >= minTouchTarget);
      assert.ok(surahHeader.emblemSize >= minTouchTarget);
      assert.ok(surahHeader.minHeight >= minTouchTarget);

      // BismillahBanner
      assert.ok(bismillah.minHeight >= minTouchTarget);

      // ContinuousVerseCard
      assert.ok(verseCard.actionButtonSize >= minTouchTarget);
      assert.strictEqual(verseCard.minTouchTarget, 44);

      // MushafPageView
      assert.ok(mushafPage.navButtonSize >= minTouchTarget);
      assert.ok(mushafPage.headerMinHeight >= minTouchTarget);
      assert.ok(mushafPage.footerMinHeight >= minTouchTarget);
      assert.strictEqual(mushafPage.minTouchTarget, 44);

      // AudioPlaybackDock
      assert.ok(audioDock.primaryButtonSize >= minTouchTarget);
      assert.ok(audioDock.secondaryButtonSize >= minTouchTarget);
      assert.ok(audioDock.minHeight >= minTouchTarget);

      // ReaderSettingsModal
      assert.ok(settingsModal.closeButtonSize >= minTouchTarget);
      assert.ok(settingsModal.stepperButtonSize >= minTouchTarget);
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
      assert.ok(indexSource.includes("export * from './ContinuousVerseCard'"));
      assert.ok(indexSource.includes("export * from './MushafPageView'"));
      assert.ok(indexSource.includes("export * from './AudioPlaybackDock'"));
      assert.ok(indexSource.includes("export * from './ReaderSettingsModal'"));
      assert.ok(indexSource.includes("export * from './readerContracts'"));
    });
  });
});


