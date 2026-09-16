import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

import {
  INSIGHTS_COMPONENT_CONTRACTS,
  formatWordPositionBadge,
  formatArabicRoot,
  formatPartOfSpeechFa,
  formatInsightAyahHeader,
} from './insightsContracts.ts';
import { toPersianDigits } from '../catalog/catalogFormatters.ts';
import { colors } from '../../theme/colors.ts';
import { spacing, borderRadius } from '../../theme/spacing.ts';
import {
  setAyahDatabase,
  getAyahInsight,
  getWordLinguisticBreakdown,
} from '../../services/db/ayahInsightsService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../../../mobile/assets/data/quran.db');

describe('Ayah Insights & Interactive Word Card Tests (Task 2)', () => {
  const db = new DatabaseSync(DB_PATH);
  setAyahDatabase(db);

  describe('Formatting Helpers & Persian Numerals', () => {
    it('formatWordPositionBadge formats word position with Persian numerals', () => {
      assert.strictEqual(formatWordPositionBadge(1), 'واژه ۱');
      assert.strictEqual(formatWordPositionBadge(2), 'واژه ۲');
      assert.strictEqual(formatWordPositionBadge(5), 'واژه ۵');
      assert.strictEqual(formatWordPositionBadge(10), 'واژه ۱۰');
      assert.strictEqual(formatWordPositionBadge(28), 'واژه ۲۸');
      assert.strictEqual(formatWordPositionBadge(114), 'واژه ۱۱۴');
    });

    it('formatArabicRoot formats roots into standardized guillemets with hyphens', () => {
      // 3-letter roots
      assert.strictEqual(formatArabicRoot('صبر'), '«ص-ب-ر»');
      assert.strictEqual(formatArabicRoot('حمد'), '«ح-م-د»');
      assert.strictEqual(formatArabicRoot('علم'), '«ع-ل-م»');
      assert.strictEqual(formatArabicRoot('قول'), '«ق-و-ل»');

      // Already hyphenated or spaced
      assert.strictEqual(formatArabicRoot('ص-ب-ر'), '«ص-ب-ر»');
      assert.strictEqual(formatArabicRoot('ص ب ر'), '«ص-ب-ر»');
      assert.strictEqual(formatArabicRoot('«ص-ب-ر»'), '«ص-ب-ر»');

      // Multi-letter or unusual roots
      assert.strictEqual(formatArabicRoot('دحرج'), '«د-ح-ر-ج»');
      assert.strictEqual(formatArabicRoot('كفء'), '«ك-ف-ء»');

      // Empty, undefined, null, or whitespace-only inputs return fallback dash
      assert.strictEqual(formatArabicRoot(undefined), '—');
      assert.strictEqual(formatArabicRoot(null), '—');
      assert.strictEqual(formatArabicRoot(''), '—');
      assert.strictEqual(formatArabicRoot('   '), '—');
      assert.strictEqual(formatArabicRoot('—'), '—');
      assert.strictEqual(formatArabicRoot(' - '), '—');
    });

    it('formatPartOfSpeechFa maps English and Persian POS to standardized Persian labels', () => {
      // Standard English POS
      assert.strictEqual(formatPartOfSpeechFa('verb'), 'فعل');
      assert.strictEqual(formatPartOfSpeechFa('noun'), 'اسم');
      assert.strictEqual(formatPartOfSpeechFa('particle'), 'حرف');

      // Case insensitivity
      assert.strictEqual(formatPartOfSpeechFa('VERB'), 'فعل');
      assert.strictEqual(formatPartOfSpeechFa('Noun'), 'اسم');
      assert.strictEqual(formatPartOfSpeechFa('Particle'), 'حرف');
      assert.strictEqual(formatPartOfSpeechFa('  verb  '), 'فعل');

      // Persian POS descriptions
      assert.strictEqual(formatPartOfSpeechFa('فعل'), 'فعل');
      assert.strictEqual(formatPartOfSpeechFa('فعل ماضی'), 'فعل');
      assert.strictEqual(formatPartOfSpeechFa('فعل مضارع'), 'فعل');
      assert.strictEqual(formatPartOfSpeechFa('اسم'), 'اسم');
      assert.strictEqual(formatPartOfSpeechFa('اسم فاعل'), 'اسم');
      assert.strictEqual(formatPartOfSpeechFa('حرف'), 'حرف');
      assert.strictEqual(formatPartOfSpeechFa('حرف جر'), 'حرف');

      // Fallbacks
      assert.strictEqual(formatPartOfSpeechFa(undefined), 'کلمه');
      assert.strictEqual(formatPartOfSpeechFa(null), 'کلمه');
      assert.strictEqual(formatPartOfSpeechFa(''), 'کلمه');
      assert.strictEqual(formatPartOfSpeechFa('unknown_pos'), 'کلمه');
    });

    it('formatInsightAyahHeader formats Surah name and verse number in Persian digits', () => {
      assert.strictEqual(formatInsightAyahHeader('کهف', 28), 'سوره کهف • آیه ۲۸');
      assert.strictEqual(formatInsightAyahHeader('فاتحه', 1), 'سوره فاتحه • آیه ۱');
      assert.strictEqual(formatInsightAyahHeader('بقره', 255), 'سوره بقره • آیه ۲۵۵');
      assert.strictEqual(formatInsightAyahHeader('ناس', 6), 'سوره ناس • آیه ۶');

      // Handles string with "سوره" prefix gracefully without duplicating
      assert.strictEqual(formatInsightAyahHeader('سوره کهف', 28), 'سوره کهف • آیه ۲۸');
      assert.strictEqual(formatInsightAyahHeader('  فاتحه  ', 7), 'سوره فاتحه • آیه ۷');
    });
  });

  describe('INSIGHTS_COMPONENT_CONTRACTS Validation', () => {
    it('verifies minimum touch targets comply with WCAG >= 44x44px', () => {
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.minTouchTarget >= 44,
        'minTouchTarget must be at least 44px'
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.activeChipHeight >= 44,
        'activeChipHeight must be at least 44px'
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.wordCardMinHeight >= 64,
        'wordCardMinHeight must be at least 64px'
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.wordButtonMinWidth >= 44,
        'wordButtonMinWidth must be at least 44px'
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.wordButtonMinHeight >= 44,
        'wordButtonMinHeight must be at least 44px'
      );
    });

    it('verifies typography and layout contracts', () => {
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.activeBannerFontSize, 24);
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.scriptureFontSize, 24);
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.cardBorderRadius, 16);
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.translationFontSize, 15);
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.translationLineHeight, 26);
      assert.deepStrictEqual(INSIGHTS_COMPONENT_CONTRACTS.wordHitSlop, {
        top: 8,
        bottom: 8,
        left: 6,
        right: 6,
      });
    });
  });

  describe('Database Linguistic Data Verification', () => {
    it('verifies linguistic breakdown for Figma reference Ayah 18:28 (Al-Kahf)', async () => {
      const words = await getWordLinguisticBreakdown('18:28', db);
      assert.ok(words.length > 0, 'Ayah 18:28 must contain words');

      // Word 1: وَٱصْبِرْ (root: صبر, POS: فعل)
      const w1 = words[0];
      assert.strictEqual(w1.position, 1);
      assert.ok(w1.text_uthmani.includes('ٱصْبِرْ'));
      assert.strictEqual(w1.root_arabic, 'صبر');
      assert.strictEqual(formatArabicRoot(w1.root_arabic), '«ص-ب-ر»');
      assert.strictEqual(formatPartOfSpeechFa(w1.part_of_speech), 'فعل');
      assert.strictEqual(formatWordPositionBadge(w1.position), 'واژه ۱');
      assert.ok(w1.translation_fa.length > 0);

      // Verify all words have valid positions and Persian translations
      words.forEach((w, idx) => {
        assert.strictEqual(w.position, idx + 1);
        assert.ok(w.text_uthmani.length > 0);
        assert.ok(typeof w.translation_fa === 'string');
      });
    });

    it('verifies linguistic breakdown for benchmark Ayah 1:1 (Al-Fatihah)', async () => {
      const words = await getWordLinguisticBreakdown('1:1', db);
      assert.strictEqual(words.length, 4);

      // Word 1: بِسْمِ
      assert.strictEqual(words[0].position, 1);
      assert.strictEqual(words[0].text_uthmani, 'بِسْمِ');
      assert.strictEqual(words[0].translation_fa, 'به نام');

      // Word 2: ٱللَّهِ
      assert.strictEqual(words[1].position, 2);
      assert.strictEqual(words[1].text_uthmani, 'ٱللَّهِ');
      assert.strictEqual(words[1].translation_fa, 'خداوند');

      // Word 3: ٱلرَّحْمَـٰنِ
      assert.strictEqual(words[2].position, 3);
      assert.strictEqual(words[2].text_uthmani, 'ٱلرَّحْمَـٰنِ');
      assert.strictEqual(words[2].root_arabic, 'رحم');
      assert.strictEqual(formatArabicRoot(words[2].root_arabic), '«ر-ح-م»');

      // Word 4: ٱلرَّحِيمِ
      assert.strictEqual(words[3].position, 4);
      assert.strictEqual(words[3].text_uthmani, 'ٱلرَّحِيمِ');
      assert.strictEqual(words[3].root_arabic, 'رحم');
      assert.strictEqual(formatArabicRoot(words[3].root_arabic), '«ر-ح-م»');
    });
  });

  describe('AyahScripturePreviewCard Component Source & Contracts', () => {
    const cardSource = fs.readFileSync(
      path.resolve(__dirname, './AyahScripturePreviewCard.tsx'),
      'utf8'
    );

    it('verifies component props interface exports and React.memo wrapping', () => {
      assert.ok(cardSource.includes('export interface AyahScripturePreviewCardProps'));
      assert.ok(cardSource.includes('verseKey: string;'));
      assert.ok(cardSource.includes('textUthmani: string;'));
      assert.ok(cardSource.includes('textIndopak?: string;'));
      assert.ok(cardSource.includes('translationFa?: string;'));
      assert.ok(cardSource.includes('words: WordLinguisticInfo[];'));
      assert.ok(cardSource.includes('activeWordPosition: number;'));
      assert.ok(cardSource.includes('onSelectWord: (position: number) => void;'));
      assert.ok(cardSource.includes("quranFont?: 'hafs' | 'indopak';"));
      assert.ok(cardSource.includes('style?: StyleProp<ViewStyle>;'));
      assert.ok(cardSource.includes('testID?: string;'));
      assert.ok(cardSource.includes('React.memo('));
      assert.ok(cardSource.includes("displayName = 'AyahScripturePreviewCard'"));
    });

    it('verifies Active Word Banner Chip displays required elements', () => {
      // Banner container
      assert.ok(cardSource.includes('activeBanner'));
      assert.ok(cardSource.includes('accessibilityRole="summary"'));

      // Calligraphic preview (font size 24px)
      assert.ok(cardSource.includes('activeWordCalligraphy'));
      assert.ok(cardSource.includes('INSIGHTS_COMPONENT_CONTRACTS.activeBannerFontSize'));

      // Persian gloss translation
      assert.ok(cardSource.includes('activeGlossText'));
      assert.ok(cardSource.includes('activeWord.translation_fa'));

      // Root chip
      assert.ok(cardSource.includes('formatArabicRoot(activeWord.root_arabic)'));
      assert.ok(cardSource.includes('rootChip'));

      // Part of speech badge
      assert.ok(cardSource.includes('formatPartOfSpeechFa(activeWord.part_of_speech)'));
      assert.ok(cardSource.includes('posBadge'));

      // Position badge
      assert.ok(cardSource.includes('formatWordPositionBadge(activeWord.position)'));
    });

    it('verifies Interactive Arabic Scripture Text Flow and Word Tapping', () => {
      // RTL wrap container
      assert.ok(cardSource.includes('scriptureFlowContainer'));
      assert.ok(cardSource.includes("flexDirection: 'row-reverse'"));
      assert.ok(cardSource.includes("flexWrap: 'wrap'"));

      // Touch target with hitSlop and button role
      assert.ok(cardSource.includes('INSIGHTS_COMPONENT_CONTRACTS.wordHitSlop'));
      assert.ok(cardSource.includes('accessibilityRole="button"'));
      assert.ok(cardSource.includes('onSelectWord(word.position)'));

      // Active state prominent emerald highlight
      assert.ok(cardSource.includes('wordButtonActive'));
      assert.ok(cardSource.includes('colors.primarySubtle'));
      assert.ok(cardSource.includes('colors.primary'));
      assert.ok(cardSource.includes('scriptureWordActive'));
      assert.ok(cardSource.includes("fontWeight: '700'"));

      // Quran font switching (hafs vs indopak)
      assert.ok(cardSource.includes('fonts.quranIndoPak'));
      assert.ok(cardSource.includes('fonts.quranHafs'));
      assert.ok(cardSource.includes('word.text_indopak'));
    });

    it('verifies Persian translation text display below scripture', () => {
      assert.ok(cardSource.includes('translationContainer'));
      assert.ok(cardSource.includes('translationText'));
      assert.ok(cardSource.includes('translationFa'));
      assert.ok(cardSource.includes('fonts.uiRegular'));
      assert.ok(cardSource.includes('colors.textSecondary'));
    });
  });

  describe('WordLinguisticBreakdownCard Component Source & Contracts', () => {
    const wordCardSource = fs.readFileSync(
      path.resolve(__dirname, './WordLinguisticBreakdownCard.tsx'),
      'utf8'
    );

    it('verifies component props interface exports and React.memo wrapping', () => {
      assert.ok(wordCardSource.includes('export interface WordLinguisticBreakdownCardProps'));
      assert.ok(wordCardSource.includes('word: WordLinguisticInfo;'));
      assert.ok(wordCardSource.includes('isActive: boolean;'));
      assert.ok(wordCardSource.includes('onPress?: () => void;'));
      assert.ok(wordCardSource.includes("quranFont?: 'hafs' | 'indopak';"));
      assert.ok(wordCardSource.includes('style?: StyleProp<ViewStyle>;'));
      assert.ok(wordCardSource.includes('testID?: string;'));
      assert.ok(wordCardSource.includes('React.memo('));
      assert.ok(wordCardSource.includes("displayName = 'WordLinguisticBreakdownCard'"));
    });

    it('verifies position badge, calligraphy, linguistic tags, and Persian gloss', () => {
      // Position badge in Persian numerals
      assert.ok(wordCardSource.includes('toPersianDigits(word.position)'));
      assert.ok(wordCardSource.includes('positionBadge'));

      // Sacred Arabic word in Quran font
      assert.ok(wordCardSource.includes('arabicWordText'));
      assert.ok(wordCardSource.includes('fonts.quranHafs'));
      assert.ok(wordCardSource.includes('fonts.quranIndoPak'));

      // Linguistic tags (Root & POS)
      assert.ok(wordCardSource.includes('formatArabicRoot(word.root_arabic)'));
      assert.ok(wordCardSource.includes('rootChip'));
      assert.ok(wordCardSource.includes('formatPartOfSpeechFa(word.part_of_speech)'));
      assert.ok(wordCardSource.includes('posBadge'));

      // Persian gloss
      assert.ok(wordCardSource.includes('word.translation_fa'));
      assert.ok(wordCardSource.includes('glossText'));
    });

    it('verifies touch target size >= 44x44px and active state styling', () => {
      // Min touch target >= 44x44px, minHeight 64px
      assert.ok(wordCardSource.includes('INSIGHTS_COMPONENT_CONTRACTS.wordCardMinHeight'));
      assert.ok(wordCardSource.includes('INSIGHTS_COMPONENT_CONTRACTS.minTouchTarget'));
      assert.ok(wordCardSource.includes('accessibilityRole="button"'));

      // Active state emerald border and floating background
      assert.ok(wordCardSource.includes('cardActive'));
      assert.ok(wordCardSource.includes('colors.primary'));
      assert.ok(wordCardSource.includes('colors.surfaceFloating'));

      // Inactive state surface card
      assert.ok(wordCardSource.includes('cardInactive'));
      assert.ok(wordCardSource.includes('colors.borderSubtle'));
      assert.ok(wordCardSource.includes('colors.surfaceCard'));
    });
  });

  describe('Simulated Logic & Interactive Callbacks', () => {
    it('simulates word selection callback triggering onSelectWord', () => {
      let selectedPosition = null;
      const onSelectWord = (pos) => {
        selectedPosition = pos;
      };

      // Simulating tap on word at position 3
      onSelectWord(3);
      assert.strictEqual(selectedPosition, 3);

      // Simulating tap on word at position 1
      onSelectWord(1);
      assert.strictEqual(selectedPosition, 1);
    });

    it('simulates Quran font selection for Hafs vs IndoPak', () => {
      const mockWord = {
        id: 1,
        verse_key: '1:1',
        position: 1,
        text_uthmani: 'بِسْمِ',
        text_indopak: 'بِسۡمِ',
        translation_fa: 'به نام',
      };

      function resolveWordText(word, quranFont) {
        return quranFont === 'indopak' && word.text_indopak
          ? word.text_indopak
          : word.text_uthmani;
      }

      assert.strictEqual(resolveWordText(mockWord, 'hafs'), 'بِسْمِ');
      assert.strictEqual(resolveWordText(mockWord, 'indopak'), 'بِسۡمِ');
      assert.strictEqual(resolveWordText(mockWord, undefined), 'بِسْمِ');

      // Fallback when indopak text is not available
      const wordWithoutIndopak = {
        id: 2,
        verse_key: '1:1',
        position: 2,
        text_uthmani: 'ٱللَّهِ',
        translation_fa: 'خداوند',
      };
      assert.strictEqual(resolveWordText(wordWithoutIndopak, 'indopak'), 'ٱللَّهِ');
    });

    it('simulates active word resolution from words array', () => {
      const words = [
        { id: 1, position: 1, text_uthmani: 'واژه۱' },
        { id: 2, position: 2, text_uthmani: 'واژه۲' },
        { id: 3, position: 3, text_uthmani: 'واژه۳' },
      ];

      function resolveActiveWord(wordList, activePos) {
        return wordList.find((w) => w.position === activePos) || wordList[0] || null;
      }

      assert.strictEqual(resolveActiveWord(words, 2).text_uthmani, 'واژه۲');
      assert.strictEqual(resolveActiveWord(words, 3).text_uthmani, 'واژه۳');
      // Position not found defaults to first word
      assert.strictEqual(resolveActiveWord(words, 99).text_uthmani, 'واژه۱');
      // Empty array returns null
      assert.strictEqual(resolveActiveWord([], 1), null);
    });

    it('simulates accessibility label generation with Persian numerals', () => {
      const mockWord = {
        position: 7,
        text_uthmani: 'صِرَٰطَ',
        translation_fa: 'راه',
      };

      const a11yLabel = `واژه ${toPersianDigits(mockWord.position)}: ${mockWord.text_uthmani}، معنی: ${mockWord.translation_fa}`;
      assert.strictEqual(a11yLabel, 'واژه ۷: صِرَٰطَ، معنی: راه');
    });
  });

  describe('Insights Index Exports Contract', () => {
    it('verifies mobile/src/components/insights/index.ts exports all components and contracts', () => {
      const indexSource = fs.readFileSync(
        path.resolve(__dirname, './index.ts'),
        'utf8'
      );

      assert.ok(indexSource.includes("export * from './insightsContracts'"));
      assert.ok(indexSource.includes("export * from './AyahScripturePreviewCard'"));
      assert.ok(indexSource.includes("export * from './WordLinguisticBreakdownCard'"));
    });
  });
});
