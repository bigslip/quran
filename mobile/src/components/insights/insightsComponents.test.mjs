import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

import {
  INSIGHTS_COMPONENT_CONTRACTS,
  INSIGHTS_DRAWER_TABS,
  formatWordPositionBadge,
  formatArabicRoot,
  formatPartOfSpeechFa,
  formatInsightAyahHeader,
  formatTafsirPillTitle,
  formatReflectionCharCount,
  formatJuzAndPageBadge,
} from './insightsContracts.ts';
import { toPersianDigits } from '../catalog/catalogFormatters.ts';
import { colors } from '../../theme/colors.ts';
import { spacing, borderRadius } from '../../theme/spacing.ts';
import {
  setAyahDatabase,
  getAyahInsight,
  getWordLinguisticBreakdown,
  savePersonalReflection,
  getPersonalReflection,
  clearPersonalReflections,
  getTafsirForVerse,
  getTafsirExcerpts,
  setTafsirForVerseApiBaseUrl,
  resetTafsirForVerseApiBaseUrl,
} from '../../services/db/ayahInsightsService.ts';
import {
  setTafsirDatabase,
  resetTafsirDownloaderForTesting,
} from '../../services/db/tafsirDownloadService.ts';
import {
  getUserDatabase,
  resetUserDatabaseForTesting,
} from '../../services/db/userDatabase.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../../../mobile/assets/data/quran.db');

describe('Insights Components Logic, Interactive States & Design System Tests', () => {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
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

    it('formatTafsirPillTitle formats tafsirs into concise source pill labels', () => {
      assert.strictEqual(
        formatTafsirPillTitle({ id: 'nemouneh', author_name: 'مکارم شیرازی (نمونه)' }),
        'نمونه (مکارم)',
      );
      assert.strictEqual(
        formatTafsirPillTitle({ id: 'al-mizan', author_name: 'علامه طباطبایی (المیزان)' }),
        'المیزان (طباطبایی)',
      );
      assert.strictEqual(
        formatTafsirPillTitle({ id: 'noor', author_name: 'حجت‌الاسلام قرائتی (نور)' }),
        'نور (قرائتی)',
      );

      // Fallbacks
      assert.strictEqual(
        formatTafsirPillTitle({ id: 'custom', author_name: 'تفسیر ابوالفتوح رازی' }),
        'تفسیر ابوالفتوح رازی',
      );
      assert.strictEqual(formatTafsirPillTitle(undefined), '');
    });

    it('formatReflectionCharCount formats character counts with Persian numerals and suffix', () => {
      assert.strictEqual(formatReflectionCharCount(0), '۰ نویسه');
      assert.strictEqual(formatReflectionCharCount(42), '۴۲ نویسه');
      assert.strictEqual(formatReflectionCharCount(150), '۱۵۰ نویسه');
      assert.strictEqual(formatReflectionCharCount(-5), '۰ نویسه');
    });
  });

  describe('INSIGHTS_COMPONENT_CONTRACTS Validation', () => {
    it('verifies minimum touch targets comply with WCAG >= 44x44px', () => {
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.minTouchTarget >= 44,
        'minTouchTarget must be at least 44px',
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.activeChipHeight >= 44,
        'activeChipHeight must be at least 44px',
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.wordCardMinHeight >= 64,
        'wordCardMinHeight must be at least 64px',
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.wordButtonMinWidth >= 44,
        'wordButtonMinWidth must be at least 44px',
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.wordButtonMinHeight >= 44,
        'wordButtonMinHeight must be at least 44px',
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.tafsirPillMinHeight >= 44,
        'tafsirPillMinHeight must be at least 44px',
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.tafsirPillMinWidth >= 44,
        'tafsirPillMinWidth must be at least 44px',
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.reflectionButtonMinHeight >= 44,
        'reflectionButtonMinHeight must be at least 44px',
      );
      assert.ok(
        INSIGHTS_COMPONENT_CONTRACTS.reflectionButtonMinWidth >= 44,
        'reflectionButtonMinWidth must be at least 44px',
      );
    });

    it('verifies typography and layout contracts', () => {
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.activeBannerFontSize, 24);
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.scriptureFontSize, 24);
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.cardBorderRadius, 16);
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.translationFontSize, 15);
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.translationLineHeight, 26);
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.tafsirBodyLineHeight, 26);
      assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.reflectionInputMinHeight, 100);
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
      'utf8',
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
      'utf8',
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
        return quranFont === 'indopak' && word.text_indopak ? word.text_indopak : word.text_uthmani;
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

      const a11yLabel = `واژه ${toPersianDigits(mockWord.position)}: ${
        mockWord.text_uthmani
      }، معنی: ${mockWord.translation_fa}`;
      assert.strictEqual(a11yLabel, 'واژه ۷: صِرَٰطَ، معنی: راه');
    });
  });

  describe('TafsirTabContent Component Source & Contracts (Task 3)', () => {
    const tafsirSource = fs.readFileSync(path.resolve(__dirname, './TafsirTabContent.tsx'), 'utf8');

    it('verifies TafsirTabContentProps interface exports and React.memo wrapping', () => {
      assert.ok(tafsirSource.includes('export interface TafsirTabContentProps'));
      assert.ok(tafsirSource.includes('tafsirs: TafsirExcerpt[];'));
      assert.ok(tafsirSource.includes('selectedTafsirId: string;'));
      assert.ok(tafsirSource.includes('onSelectTafsir: (id: string) => void;'));
      assert.ok(tafsirSource.includes('contemplativeTheme?: string;'));
      assert.ok(tafsirSource.includes('style?: StyleProp<ViewStyle>;'));
      assert.ok(tafsirSource.includes('testID?: string;'));
      assert.ok(tafsirSource.includes('React.memo('));
      assert.ok(tafsirSource.includes("displayName = 'TafsirTabContent'"));
    });

    it('verifies Contemplative Theme Card structure and styling', () => {
      assert.ok(tafsirSource.includes('themeCard'));
      assert.ok(tafsirSource.includes('contemplativeTheme'));
      assert.ok(tafsirSource.includes('«پیام کلیدی و تم تدبری»'));
      assert.ok(tafsirSource.includes('colors.surfaceFloating'));
      assert.ok(tafsirSource.includes('colors.primary'));
      assert.ok(tafsirSource.includes('Sparkles'));
      assert.ok(tafsirSource.includes('themeContentText'));
    });

    it('verifies Source Selector Segmented Pills and touch targets >= 44x44px', () => {
      assert.ok(tafsirSource.includes('sourceSelectorContainer'));
      assert.ok(tafsirSource.includes('accessibilityRole="tablist"'));
      assert.ok(tafsirSource.includes('accessibilityRole="tab"'));
      assert.ok(tafsirSource.includes('onSelectTafsir(tafsir.id)'));
      assert.ok(tafsirSource.includes('pillButtonActive'));
      assert.ok(tafsirSource.includes('colors.primarySubtle'));
      assert.ok(tafsirSource.includes('colors.primary'));
      assert.ok(tafsirSource.includes('INSIGHTS_COMPONENT_CONTRACTS.tafsirPillMinHeight'));
      assert.ok(tafsirSource.includes('INSIGHTS_COMPONENT_CONTRACTS.tafsirPillMinWidth'));
      assert.ok(tafsirSource.includes('formatTafsirPillTitle(tafsir)'));
    });

    it('verifies Selected Tafsir Exegesis Card, Author Chip, and Bullet Takeaways', () => {
      assert.ok(tafsirSource.includes('exegesisCard'));
      assert.ok(tafsirSource.includes('authorBadge'));
      assert.ok(tafsirSource.includes('colors.goldAccent'));
      assert.ok(tafsirSource.includes('activeTafsir.author_name'));
      assert.ok(tafsirSource.includes('activeTafsir.title'));
      assert.ok(tafsirSource.includes('tafsirBodyText'));
      assert.ok(tafsirSource.includes('colors.textPrimary'));
      assert.ok(tafsirSource.includes('INSIGHTS_COMPONENT_CONTRACTS.tafsirBodyLineHeight'));

      // Takeaways section and bullet points
      assert.ok(tafsirSource.includes('takeawaysSection'));
      assert.ok(tafsirSource.includes('نکات کلیدی و تدبری'));
      assert.ok(tafsirSource.includes('bulletDot'));
      assert.ok(tafsirSource.includes('takeawayText'));
      assert.ok(tafsirSource.includes('emptyCard'));
    });
  });

  describe('PersonalReflectionCard Component Source & Contracts (Task 3)', () => {
    const reflectionSource = fs.readFileSync(
      path.resolve(__dirname, './PersonalReflectionCard.tsx'),
      'utf8',
    );

    it('verifies PersonalReflectionCardProps interface exports and React.memo wrapping', () => {
      assert.ok(reflectionSource.includes('export interface PersonalReflectionCardProps'));
      assert.ok(reflectionSource.includes('verseKey: string;'));
      assert.ok(reflectionSource.includes('initialReflection?: string;'));
      assert.ok(reflectionSource.includes('onSaveReflection: (note: string) => Promise<void>;'));
      assert.ok(reflectionSource.includes('style?: StyleProp<ViewStyle>;'));
      assert.ok(reflectionSource.includes('testID?: string;'));
      assert.ok(reflectionSource.includes('React.memo('));
      assert.ok(reflectionSource.includes("displayName = 'PersonalReflectionCard'"));
    });

    it('verifies Sanctuary card container, header title, and subtitle', () => {
      assert.ok(reflectionSource.includes('colors.surfaceCard'));
      assert.ok(reflectionSource.includes('colors.borderSubtle'));
      assert.ok(reflectionSource.includes('borderRadius.lg'));
      assert.ok(reflectionSource.includes('یادداشت و تاملات شخصی'));
      assert.ok(
        reflectionSource.includes('«برداشت‌ها و تجربیات شخصی خود را در پرتو این آیه ثبت کنید»'),
      );
    });

    it('verifies Multi-line TextInput with RTL formatting and minHeight 100px', () => {
      assert.ok(
        reflectionSource.includes('«تامل و برداشت شخصی خود را از این آیه شریفه بنویسید...»'),
      );
      assert.ok(reflectionSource.includes('multiline'));
      assert.ok(reflectionSource.includes("textAlign: 'right'"));
      assert.ok(reflectionSource.includes("writingDirection: 'rtl'"));
      assert.ok(reflectionSource.includes('INSIGHTS_COMPONENT_CONTRACTS.reflectionInputMinHeight'));
      assert.ok(reflectionSource.includes('colors.backgroundElevated'));
    });

    it('verifies Action row, Save button, Clear button, Status badge, and Character counter', () => {
      // Save button with emerald background and >= 44x44px target
      assert.ok(reflectionSource.includes('saveButton'));
      assert.ok(reflectionSource.includes('colors.primary'));
      assert.ok(reflectionSource.includes('ذخیره یادداشت'));
      assert.ok(
        reflectionSource.includes('INSIGHTS_COMPONENT_CONTRACTS.reflectionButtonMinHeight'),
      );
      assert.ok(reflectionSource.includes('INSIGHTS_COMPONENT_CONTRACTS.reflectionButtonMinWidth'));

      // Clear button
      assert.ok(reflectionSource.includes('clearButton'));
      assert.ok(reflectionSource.includes('پاک کردن'));

      // Status badge
      assert.ok(reflectionSource.includes('statusBadge'));
      assert.ok(reflectionSource.includes('ذخیره شد'));

      // Character counter with Persian numerals
      assert.ok(reflectionSource.includes('formatReflectionCharCount(note.length)'));
      assert.ok(reflectionSource.includes('charCountText'));
    });
  });

  describe('Tafsir & Reflection Interactive Simulated Workflows (Task 3)', () => {
    it('simulates tafsir pill switching callback and active tafsir resolution', () => {
      const mockTafsirs = [
        {
          id: 'nemouneh',
          author_name: 'مکارم شیرازی (نمونه)',
          title: 'تفسیر نمونه',
          text: 'متن نمونه',
          points: ['نکته ۱', 'نکته ۲'],
        },
        {
          id: 'al-mizan',
          author_name: 'علامه طباطبایی (المیزان)',
          title: 'تفسیر المیزان',
          text: 'متن المیزان',
          points: ['نکته الف'],
        },
        {
          id: 'noor',
          author_name: 'حجت‌الاسلام قرائتی (نور)',
          title: 'تفسیر نور',
          text: 'متن نور',
        },
      ];

      let currentSelectedId = 'nemouneh';
      const onSelectTafsir = (id) => {
        currentSelectedId = id;
      };

      function resolveTafsir(tafsirList, selectedId) {
        return tafsirList.find((t) => t.id === selectedId) || tafsirList[0] || null;
      }

      // Initial active tafsir
      let active = resolveTafsir(mockTafsirs, currentSelectedId);
      assert.strictEqual(active.id, 'nemouneh');
      assert.strictEqual(formatTafsirPillTitle(active), 'نمونه (مکارم)');
      assert.strictEqual(active.points.length, 2);

      // Select Al-Mizan
      onSelectTafsir('al-mizan');
      active = resolveTafsir(mockTafsirs, currentSelectedId);
      assert.strictEqual(active.id, 'al-mizan');
      assert.strictEqual(formatTafsirPillTitle(active), 'المیزان (طباطبایی)');
      assert.strictEqual(active.points.length, 1);

      // Select Noor
      onSelectTafsir('noor');
      active = resolveTafsir(mockTafsirs, currentSelectedId);
      assert.strictEqual(active.id, 'noor');
      assert.strictEqual(formatTafsirPillTitle(active), 'نور (قرائتی)');

      // Unmatched ID falls back to first tafsir
      active = resolveTafsir(mockTafsirs, 'unknown-id');
      assert.strictEqual(active.id, 'nemouneh');

      // Empty tafsirs list returns null
      assert.strictEqual(resolveTafsir([], 'nemouneh'), null);
    });

    it('simulates reflection editing, character counting, and clear functionality', () => {
      let currentNote = '';
      let isSaved = false;

      const handleChangeText = (text) => {
        currentNote = text;
        isSaved = false;
      };

      const handleClear = () => {
        currentNote = '';
        isSaved = false;
      };

      // Initial state
      assert.strictEqual(currentNote, '');
      assert.strictEqual(formatReflectionCharCount(currentNote.length), '۰ نویسه');

      // Type contemplation text
      handleChangeText('این آیه یادآور اهمیت پایداری در ایمان است.');
      assert.strictEqual(currentNote.length, 42);
      assert.strictEqual(formatReflectionCharCount(currentNote.length), '۴۲ نویسه');
      assert.strictEqual(isSaved, false);

      // Clear reflection
      handleClear();
      assert.strictEqual(currentNote, '');
      assert.strictEqual(formatReflectionCharCount(currentNote.length), '۰ نویسه');
    });

    it('simulates saving reflection to SQLite and retrieving persisted note', async () => {
      const testVerseKey = '18:28';
      const testReflection = 'تامل و برداشت شخصی در باب همراهی با صادقان و صابران.';

      // Save reflection
      await savePersonalReflection(testVerseKey, testReflection, db);

      // Retrieve persisted reflection
      const persisted = await getPersonalReflection(testVerseKey, db);
      assert.ok(persisted !== null, 'Saved reflection must be retrievable');
      assert.strictEqual(persisted, testReflection);

      // Update reflection
      const updatedReflection = 'برداشت اصلاح‌شده: پایداری در همراهی با حق.';
      await savePersonalReflection(testVerseKey, updatedReflection, db);
      const updated = await getPersonalReflection(testVerseKey, db);
      assert.strictEqual(updated, updatedReflection);

      // Save empty note to delete/clear reflection
      await savePersonalReflection(testVerseKey, '', db);
      const deleted = await getPersonalReflection(testVerseKey, db);
      assert.strictEqual(deleted, null);
      clearPersonalReflections();
    });
  });

  describe('AyahInsightsDrawer Sanctuary Sheet Tests (Task 4)', () => {
    const drawerSource = fs.readFileSync(
      path.resolve(__dirname, './AyahInsightsDrawer.tsx'),
      'utf8',
    );

    describe('Drawer Formatting & Contracts', () => {
      it('formatJuzAndPageBadge formats juz and page in Persian numerals', () => {
        assert.strictEqual(formatJuzAndPageBadge(15, 297), 'صفحه ۲۹۷ • جزء ۱۵');
        assert.strictEqual(formatJuzAndPageBadge(1, 1), 'صفحه ۱ • جزء ۱');
        assert.strictEqual(formatJuzAndPageBadge(30, 604), 'صفحه ۶۰۴ • جزء ۳۰');

        // Handles missing page or juz gracefully
        assert.strictEqual(formatJuzAndPageBadge(undefined, 297), 'صفحه ۲۹۷');
        assert.strictEqual(formatJuzAndPageBadge(15, undefined), 'جزء ۱۵');
        assert.strictEqual(formatJuzAndPageBadge(undefined, undefined), '');
      });

      it('verifies INSIGHTS_DRAWER_TABS contract', () => {
        assert.strictEqual(INSIGHTS_DRAWER_TABS.length, 3);
        assert.deepStrictEqual(INSIGHTS_DRAWER_TABS[0], { id: 'tafsir', label: 'تفسیر و تدبر' });
        assert.deepStrictEqual(INSIGHTS_DRAWER_TABS[1], {
          id: 'vocabulary',
          label: 'تحلیل واژگان',
        });
        assert.deepStrictEqual(INSIGHTS_DRAWER_TABS[2], { id: 'reflection', label: 'یادداشت من' });
      });

      it('verifies drawer layout and accessibility contracts in INSIGHTS_COMPONENT_CONTRACTS', () => {
        assert.ok(INSIGHTS_COMPONENT_CONTRACTS.drawerMinTouchTarget >= 44);
        assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.drawerMaxSheetHeightPercent, 0.9);
        assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.dragHandleWidth, 36);
        assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.dragHandleHeight, 4);
        assert.ok(INSIGHTS_COMPONENT_CONTRACTS.headerButtonMinHeight >= 44);
        assert.ok(INSIGHTS_COMPONENT_CONTRACTS.headerButtonMinWidth >= 44);
        assert.strictEqual(INSIGHTS_COMPONENT_CONTRACTS.drawerActionIconSize, 20);
        assert.ok(INSIGHTS_COMPONENT_CONTRACTS.tabSwitcherMinHeight >= 44);
        assert.ok(INSIGHTS_COMPONENT_CONTRACTS.tabButtonMinHeight >= 44);
        assert.ok(INSIGHTS_COMPONENT_CONTRACTS.tabButtonMinWidth >= 44);
      });
    });

    describe('AyahInsightsDrawer Component Source & Architecture', () => {
      it('verifies AyahInsightsDrawerProps interface exports and React.memo wrapping', () => {
        assert.ok(drawerSource.includes('export interface AyahInsightsDrawerProps'));
        assert.ok(drawerSource.includes('visible: boolean;'));
        assert.ok(drawerSource.includes('verse: Verse | null;'));
        assert.ok(drawerSource.includes('chapterNameFa?: string;'));
        assert.ok(drawerSource.includes('onClose: () => void;'));
        assert.ok(drawerSource.includes('onPlayVerse?: (verse: Verse) => void;'));
        assert.ok(drawerSource.includes('onBookmarkVerse?: (verse: Verse) => void;'));
        assert.ok(drawerSource.includes('isBookmarked?: boolean;'));
        assert.ok(drawerSource.includes("quranFont?: 'hafs' | 'indopak';"));
        assert.ok(drawerSource.includes('style?: StyleProp<ViewStyle>;'));
        assert.ok(drawerSource.includes('testID?: string;'));
        assert.ok(drawerSource.includes('React.memo('));
        assert.ok(drawerSource.includes("displayName = 'AyahInsightsDrawer'"));
      });

      it('verifies Modal, Darkened Backdrop, and Bottom Sheet container styling', () => {
        // Transparent slide modal
        assert.ok(drawerSource.includes('<Modal'));
        assert.ok(drawerSource.includes('transparent={true}'));
        assert.ok(drawerSource.includes('animationType="slide"'));
        assert.ok(drawerSource.includes('onRequestClose={onClose}'));

        // Backdrop with 65% opacity and touchable dismiss
        assert.ok(drawerSource.includes("backgroundColor: 'rgba(0, 0, 0, 0.65)'"));
        assert.ok(drawerSource.includes('onPress={onClose}'));
        assert.ok(drawerSource.includes('accessibilityLabel="بستن پنجره تدبر"'));

        // Sheet container
        assert.ok(drawerSource.includes('colors.surfaceCard'));
        assert.ok(drawerSource.includes('colors.borderSubtle'));
        assert.ok(drawerSource.includes('borderRadius.xl'));
        assert.ok(drawerSource.includes("maxHeight: '90%'"));

        // Drag handle indicator
        assert.ok(drawerSource.includes('INSIGHTS_COMPONENT_CONTRACTS.dragHandleWidth'));
        assert.ok(drawerSource.includes('INSIGHTS_COMPONENT_CONTRACTS.dragHandleHeight'));
        assert.ok(drawerSource.includes('dragHandle'));
      });

      it('verifies RTL Header Bar, Persian digits title, Juz/Page badge, and 5 action buttons', () => {
        // RTL Header bar
        assert.ok(drawerSource.includes('headerBar'));
        assert.ok(drawerSource.includes("flexDirection: 'row-reverse'"));

        // Persian digits Surah & Ayah title
        assert.ok(
          drawerSource.includes("formatInsightAyahHeader(chapterNameFa || '', verse.verse_number)"),
        );
        assert.ok(
          drawerSource.includes('formatJuzAndPageBadge(verse.juz_number, verse.page_number)'),
        );

        // 5 action buttons
        assert.ok(drawerSource.includes('INSIGHTS_COMPONENT_CONTRACTS.headerButtonMinWidth'));
        assert.ok(drawerSource.includes('INSIGHTS_COMPONENT_CONTRACTS.headerButtonMinHeight'));

        // 1. Copy button
        assert.ok(drawerSource.includes('accessibilityLabel="کپی متن و ترجمه آیه"'));
        assert.ok(drawerSource.includes('Copy'));

        // 2. Share button
        assert.ok(drawerSource.includes('accessibilityLabel="اشتراکگذاری آیه"'));
        assert.ok(drawerSource.includes('Share2'));

        // 3. Bookmark button
        assert.ok(drawerSource.includes('accessibilityLabel="نشانکردن آیه"'));
        assert.ok(drawerSource.includes('Bookmark'));
        assert.ok(drawerSource.includes('onBookmarkVerse'));

        // 4. Play button
        assert.ok(drawerSource.includes('accessibilityLabel="پخش صوتی آیه"'));
        assert.ok(drawerSource.includes('Play'));
        assert.ok(drawerSource.includes('onPlayVerse'));

        // 5. Close button
        assert.ok(drawerSource.includes('accessibilityLabel="بستن پنجره تدبر"'));
        assert.ok(drawerSource.includes('X'));
      });

      it('verifies Sticky Scripture Preview with AyahScripturePreviewCard', () => {
        assert.ok(drawerSource.includes('<AyahScripturePreviewCard'));
        assert.ok(drawerSource.includes('verseKey={verse.verse_key}'));
        assert.ok(drawerSource.includes('textUthmani={verse.text_uthmani}'));
        assert.ok(drawerSource.includes('activeWordPosition={activeWordPosition}'));
        assert.ok(drawerSource.includes('onSelectWord={setActiveWordPosition}'));
        assert.ok(drawerSource.includes('quranFont={quranFont}'));
      });

      it('verifies Segmented 3-Tab Switcher and Tab Body rendering', () => {
        // 3-tab switcher
        assert.ok(drawerSource.includes('INSIGHTS_DRAWER_TABS.map'));
        assert.ok(drawerSource.includes('accessibilityRole="tab"'));
        assert.ok(drawerSource.includes('accessibilityRole="tablist"'));
        assert.ok(drawerSource.includes('colors.primarySubtle'));
        assert.ok(drawerSource.includes('colors.primary'));

        // Tab body ScrollView
        assert.ok(drawerSource.includes('<ScrollView'));
        assert.ok(drawerSource.includes('scrollBody'));

        // Loading spinner
        assert.ok(drawerSource.includes('<ActivityIndicator'));
        assert.ok(drawerSource.includes('colors.primary'));

        // Conditional rendering: TafsirTabContent vs WordLinguisticBreakdownCard vs PersonalReflectionCard
        assert.ok(drawerSource.includes('<TafsirTabContent'));
        assert.ok(drawerSource.includes('<WordLinguisticBreakdownCard'));
        assert.ok(drawerSource.includes('<PersonalReflectionCard'));

        // Data integration
        assert.ok(drawerSource.includes('getAyahInsight(verse.verse_key)'));
        assert.ok(drawerSource.includes('getPersonalReflection(verse.verse_key)'));
        assert.ok(drawerSource.includes('savePersonalReflection(verse.verse_key, note)'));
        assert.ok(drawerSource.includes('isMounted'));
      });
    });

    describe('Simulated Workflows & State Synchronization', () => {
      it('simulates tab switching between tafsir, vocabulary, and reflection', () => {
        let activeTab = 'tafsir';
        const setActiveTab = (tab) => {
          activeTab = tab;
        };

        assert.strictEqual(activeTab, 'tafsir');
        setActiveTab('vocabulary');
        assert.strictEqual(activeTab, 'vocabulary');
        setActiveTab('reflection');
        assert.strictEqual(activeTab, 'reflection');
      });

      it('simulates word position synchronization between preview and breakdown card', () => {
        let activeWordPosition = 1;
        const setActiveWordPosition = (pos) => {
          activeWordPosition = pos;
        };

        assert.strictEqual(activeWordPosition, 1);
        // Tapping word 5 in scripture preview
        setActiveWordPosition(5);
        assert.strictEqual(activeWordPosition, 5);

        // Tapping word 2 in vocabulary breakdown list
        setActiveWordPosition(2);
        assert.strictEqual(activeWordPosition, 2);
      });

      it('simulates copy and share formatting for an Ayah', () => {
        const mockVerse = {
          chapter_id: 18,
          verse_number: 28,
          verse_key: '18:28',
          text_uthmani: 'وَٱصْبِرْ نَفْسَكَ مَعَ ٱلَّذِينَ يَدْعُونَ رَبَّهُم',
          translation_fa_makarem: 'با کسانی باش که پروردگار خود را صبح و شام می‌خوانند.',
        };

        const copyText = `${mockVerse.text_uthmani}\n\n${mockVerse.translation_fa_makarem}`.trim();
        assert.ok(copyText.includes('وَٱصْبِرْ'));
        assert.ok(copyText.includes('پروردگار خود را'));

        const ayahHeader = formatInsightAyahHeader('کهف', mockVerse.verse_number);
        const shareText =
          `${mockVerse.text_uthmani}\n\n${mockVerse.translation_fa_makarem}\n(${ayahHeader})`.trim();
        assert.ok(shareText.includes('سوره کهف • آیه ۲۸'));
      });

      it('simulates all 5 header action button callbacks', () => {
        const mockVerse = {
          id: 2168,
          chapter_id: 18,
          verse_number: 28,
          verse_key: '18:28',
          text_uthmani: 'وَٱصْبِرْ نَفْسَكَ مَعَ ٱلَّذِينَ يَدْعُونَ رَبَّهُم',
        };

        let playedVerse = null;
        let bookmarkedVerse = null;
        let closed = false;

        const onPlayVerse = (v) => {
          playedVerse = v;
        };
        const onBookmarkVerse = (v) => {
          bookmarkedVerse = v;
        };
        const onClose = () => {
          closed = true;
        };

        onPlayVerse(mockVerse);
        assert.strictEqual(playedVerse?.verse_key, '18:28');

        onBookmarkVerse(mockVerse);
        assert.strictEqual(bookmarkedVerse?.verse_key, '18:28');

        onClose();
        assert.strictEqual(closed, true);
      });
    });
  });

  describe('Insights Index & Reader Index Exports Contract', () => {
    it('verifies mobile/src/components/insights/index.ts exports all components and contracts', () => {
      const indexSource = fs.readFileSync(path.resolve(__dirname, './index.ts'), 'utf8');

      assert.ok(indexSource.includes("export * from './insightsContracts'"));
      assert.ok(indexSource.includes("export * from './AyahScripturePreviewCard'"));
      assert.ok(indexSource.includes("export * from './WordLinguisticBreakdownCard'"));
      assert.ok(indexSource.includes("export * from './TafsirTabContent'"));
      assert.ok(indexSource.includes("export * from './PersonalReflectionCard'"));
      assert.ok(indexSource.includes("export * from './AyahInsightsDrawer'"));
    });

    it('verifies mobile/src/components/reader/index.ts exports AyahInsightsDrawer', () => {
      const readerIndexSource = fs.readFileSync(
        path.resolve(__dirname, '../reader/index.ts'),
        'utf8',
      );

      assert.ok(readerIndexSource.includes("export * from '../insights/AyahInsightsDrawer'"));
    });
  });

  describe('Screen Integration: Surah Reader Screen & AyahInsightsDrawer (Task 5)', () => {
    const surahScreenPath = path.resolve(__dirname, '../../app/surah/[id].tsx');
    const surahScreenSource = fs.readFileSync(surahScreenPath, 'utf8');

    it('verifies surah/[id].tsx imports and renders AyahInsightsDrawer', () => {
      assert.ok(
        surahScreenSource.includes('AyahInsightsDrawer'),
        'surah/[id].tsx must reference AyahInsightsDrawer',
      );
      assert.ok(
        surahScreenSource.includes('import { AyahInsightsDrawer }') ||
          surahScreenSource.includes('AyahInsightsDrawer,'),
        'surah/[id].tsx must import AyahInsightsDrawer',
      );
      assert.ok(
        surahScreenSource.includes('<AyahInsightsDrawer'),
        'surah/[id].tsx must render <AyahInsightsDrawer in JSX',
      );
      assert.ok(
        surahScreenSource.includes('testID="ayah-insights-drawer"'),
        'AyahInsightsDrawer must have testID="ayah-insights-drawer"',
      );
    });

    it('verifies state management (selectedInsightVerse, isInsightsOpen) and handlers (handleVerseInsights, handleCloseInsights)', () => {
      assert.ok(
        surahScreenSource.includes('selectedInsightVerse'),
        'Must define selectedInsightVerse state',
      );
      assert.ok(surahScreenSource.includes('isInsightsOpen'), 'Must define isInsightsOpen state');
      assert.ok(
        surahScreenSource.includes('handleVerseInsights'),
        'Must implement handleVerseInsights callback',
      );
      assert.ok(
        surahScreenSource.includes('handleCloseInsights'),
        'Must implement handleCloseInsights callback',
      );
      assert.ok(
        surahScreenSource.includes('setSelectedInsightVerse(verse)'),
        'handleVerseInsights must set selected insight verse',
      );
      assert.ok(
        surahScreenSource.includes('setIsInsightsOpen(true)'),
        'handleVerseInsights must open insights drawer',
      );
      assert.ok(
        surahScreenSource.includes('setIsInsightsOpen(false)'),
        'handleCloseInsights must close insights drawer',
      );
      assert.ok(
        surahScreenSource.includes('setSelectedInsightVerse(null)'),
        'handleCloseInsights must reset selected insight verse',
      );
    });

    it('verifies AyahInsightsDrawer prop bindings and callback connections', () => {
      assert.ok(
        surahScreenSource.includes('visible={isInsightsOpen}'),
        'Must bind visible={isInsightsOpen}',
      );
      assert.ok(
        surahScreenSource.includes('verse={selectedInsightVerse}'),
        'Must bind verse={selectedInsightVerse}',
      );
      assert.ok(
        surahScreenSource.includes('chapterNameFa={chapter?.name_fa}'),
        'Must bind chapterNameFa={chapter?.name_fa}',
      );
      assert.ok(
        surahScreenSource.includes('onClose={handleCloseInsights}'),
        'Must bind onClose={handleCloseInsights}',
      );
      assert.ok(
        surahScreenSource.includes('onPlayVerse={handlePlayVerse}'),
        'Must bind onPlayVerse={handlePlayVerse}',
      );
      assert.ok(
        surahScreenSource.includes('onBookmarkVerse={handleBookmarkVerse}'),
        'Must bind onBookmarkVerse={handleBookmarkVerse}',
      );
      assert.ok(
        surahScreenSource.includes('quranFont={quranFont}'),
        'Must bind quranFont={quranFont}',
      );
      assert.ok(
        surahScreenSource.includes('onVerseInsights={handleVerseInsights}'),
        'ContinuousVerseCard must bind onVerseInsights={handleVerseInsights}',
      );
    });

    it('verifies isBookmarked derivation from bookmarkedKeys Set and toggle behavior', () => {
      assert.ok(
        surahScreenSource.includes('bookmarkedKeys.has(selectedInsightVerse.verse_key)'),
        'Must check bookmarkedKeys.has(selectedInsightVerse.verse_key) for isBookmarked',
      );

      // Simulation of bookmarkedKeys Set behavior with verse selection
      const mockVerse1 = { verse_key: '18:28' };
      const mockVerse2 = { verse_key: '18:29' };
      const bookmarkedKeys = new Set(['18:28']);

      const isBookmarked1 = mockVerse1 ? bookmarkedKeys.has(mockVerse1.verse_key) : false;
      assert.strictEqual(isBookmarked1, true, '18:28 should be bookmarked');

      const isBookmarked2 = mockVerse2 ? bookmarkedKeys.has(mockVerse2.verse_key) : false;
      assert.strictEqual(isBookmarked2, false, '18:29 should not be bookmarked');

      const isBookmarkedNull = null ? bookmarkedKeys.has(null.verse_key) : false;
      assert.strictEqual(isBookmarkedNull, false, 'Null verse should default to false');
    });

    it('simulates the complete user interaction flow: tap insights -> drawer opens -> play/bookmark/close', () => {
      // 1. Initial State
      let selectedInsightVerse = null;
      let isInsightsOpen = false;
      let activeVerseKey = null;
      let isPlaying = false;
      const bookmarkedKeys = new Set();

      const handleVerseInsights = (verse) => {
        selectedInsightVerse = verse;
        isInsightsOpen = true;
      };

      const handleCloseInsights = () => {
        isInsightsOpen = false;
        selectedInsightVerse = null;
      };

      const handlePlayVerse = (verse) => {
        activeVerseKey = verse.verse_key;
        isPlaying = true;
      };

      const handleBookmarkVerse = (verse) => {
        if (bookmarkedKeys.has(verse.verse_key)) {
          bookmarkedKeys.delete(verse.verse_key);
        } else {
          bookmarkedKeys.add(verse.verse_key);
        }
      };

      const testVerse = {
        id: 2168,
        chapter_id: 18,
        verse_number: 28,
        verse_key: '18:28',
        text_uthmani: 'وَٱصْبِرْ نَفْسَكَ مَعَ ٱلَّذِينَ يَدْعُونَ رَبَّهُم',
      };

      // 2. User taps insights icon on ContinuousVerseCard
      handleVerseInsights(testVerse);
      assert.strictEqual(isInsightsOpen, true);
      assert.deepStrictEqual(selectedInsightVerse, testVerse);

      // Verify bookmarked prop derivation
      assert.strictEqual(bookmarkedKeys.has(selectedInsightVerse.verse_key), false);

      // 3. User bookmarks verse from drawer header
      handleBookmarkVerse(selectedInsightVerse);
      assert.strictEqual(bookmarkedKeys.has('18:28'), true);
      assert.strictEqual(bookmarkedKeys.has(selectedInsightVerse.verse_key), true);

      // 4. User plays audio from drawer header
      handlePlayVerse(selectedInsightVerse);
      assert.strictEqual(activeVerseKey, '18:28');
      assert.strictEqual(isPlaying, true);

      // 5. User closes drawer
      handleCloseInsights();
      assert.strictEqual(isInsightsOpen, false);
      assert.strictEqual(selectedInsightVerse, null);
    });
  });

  describe('getTafsirForVerse — Hybrid Tafsir Resolution (Task 4)', () => {
    // Store the original global fetch so we can restore it
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
      resetTafsirForVerseApiBaseUrl();
      resetTafsirDownloaderForTesting();
      resetUserDatabaseForTesting();
    });

    it('getTafsirForVerse is a function exported from ayahInsightsService', () => {
      assert.strictEqual(typeof getTafsirForVerse, 'function');
    });

    it('returns normalized TafsirContent when backend API responds with valid tafsir data', async () => {
      const mockPayload = {
        tafsir: {
          resource_id: 171,
          slug: 'fa-tafsir-nemouneh',
          text: 'متن تفسیر نمونه برای آیه ۲۸ سوره کهف',
          points: ['نکته اول', 'نکته دوم', 'نکته سوم'],
          language_name: 'fa',
        },
      };

      globalThis.fetch = async (url) => ({
        ok: true,
        json: async () => mockPayload,
      });

      setTafsirForVerseApiBaseUrl('https://mock.quran.ir');
      const result = await getTafsirForVerse('18:28', 171);

      assert.ok(result !== null, 'result must not be null');
      assert.strictEqual(result.resourceId, 171);
      assert.strictEqual(result.slug, 'fa-tafsir-nemouneh');
      assert.ok(result.text.includes('تفسیر نمونه'));
      assert.deepStrictEqual(result.points, ['نکته اول', 'نکته دوم', 'نکته سوم']);
      assert.strictEqual(result.languageName, 'fa');
    });

    it('builds the correct API URL for numeric tafsirId and slug-style tafsirId', async () => {
      const capturedUrls = [];

      globalThis.fetch = async (url) => {
        capturedUrls.push(url);
        return { ok: true, json: async () => ({ tafsir: { resource_id: 172, slug: 'fa-tafsir-noor', text: 'test', points: [], language_name: 'fa' } }) };
      };

      setTafsirForVerseApiBaseUrl('https://mock.quran.ir');

      await getTafsirForVerse('1:1', 172);
      assert.ok(
        capturedUrls[0].includes('/api/proxy/content/api/qdc/tafsirs/172/by_ayah/1%3A1') ||
          capturedUrls[0].includes('/api/proxy/content/api/qdc/tafsirs/172/by_ayah/1:1'),
        `URL should contain tafsir ID and verse key, got: ${capturedUrls[0]}`,
      );

      await getTafsirForVerse('18:28', 'fa-tafsir-noor');
      assert.ok(
        capturedUrls[1].includes('/api/proxy/content/api/qdc/tafsirs/fa-tafsir-noor/by_ayah/'),
        `URL should contain slug, got: ${capturedUrls[1]}`,
      );
    });

    it('returns null when the API responds with a non-OK HTTP status', async () => {
      globalThis.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) });

      setTafsirForVerseApiBaseUrl('https://mock.quran.ir');
      const result = await getTafsirForVerse('2:255', 171);
      assert.strictEqual(result, null);
    });

    it('returns null when the API response body has no tafsir field', async () => {
      globalThis.fetch = async () => ({
        ok: true,
        json: async () => ({ error: 'not found' }),
      });

      setTafsirForVerseApiBaseUrl('https://mock.quran.ir');
      const result = await getTafsirForVerse('1:1', 171);
      assert.strictEqual(result, null);
    });

    it('returns null when fetch throws a network error', async () => {
      globalThis.fetch = async () => {
        throw new Error('Network error');
      };

      setTafsirForVerseApiBaseUrl('https://mock.quran.ir');
      const result = await getTafsirForVerse('18:28', 'fa-tafsir-nemouneh');
      assert.strictEqual(result, null);
    });

    it('normalizes missing optional fields (points defaults to [], languageName defaults to fa)', async () => {
      globalThis.fetch = async () => ({
        ok: true,
        json: async () => ({
          tafsir: {
            resource_id: 171,
            slug: 'fa-tafsir-nemouneh',
            text: 'متن تفسیر',
            // no points, no language_name
          },
        }),
      });

      setTafsirForVerseApiBaseUrl('https://mock.quran.ir');
      const result = await getTafsirForVerse('1:1', 171);

      assert.ok(result !== null);
      assert.deepStrictEqual(result.points, []);
      assert.strictEqual(result.languageName, 'fa');
    });

    it('local SQLite stub (not-downloaded) correctly falls through to backend API path', async () => {
      // Ensure no tafsir is registered as downloaded (resetTafsirDownloaderForTesting is called in afterEach)
      let apiFetched = false;

      globalThis.fetch = async () => {
        apiFetched = true;
        return {
          ok: true,
          json: async () => ({
            tafsir: { resource_id: 171, slug: 'fa-tafsir-nemouneh', text: 'متن', points: ['نکته'], language_name: 'fa' },
          }),
        };
      };

      setTafsirForVerseApiBaseUrl('https://mock.quran.ir');
      const result = await getTafsirForVerse('18:28', 171);

      assert.strictEqual(apiFetched, true, 'API must be called when tafsir is not downloaded locally');
      assert.ok(result !== null);
      assert.strictEqual(result.resourceId, 171);
    });

    it('queries local SQLite database when Tafsir is downloaded', async () => {
      const mockTafsirDb = new DatabaseSync(':memory:');
      mockTafsirDb.exec(`
        CREATE TABLE verses (
          verse_key TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          points TEXT
        );
        INSERT INTO verses (verse_key, text, points) VALUES
          ('1:1', 'متن محلی تفسیر نمونه', '["نکته محلی ۱","نکته محلی ۲"]');
      `);

      setTafsirDatabase('fa-tafsir-nemouneh', mockTafsirDb);

      const result = await getTafsirForVerse('1:1', 'fa-tafsir-nemouneh');
      assert.ok(result !== null, 'result must not be null');
      assert.strictEqual(result.text, 'متن محلی تفسیر نمونه');
      assert.deepStrictEqual(result.points, ['نکته محلی ۱', 'نکته محلی ۲']);
    });

    it('returns cached Tafsir verse from local SQLite cache table before querying API', async () => {
      const userDb = await getUserDatabase();
      await userDb.run(
        'INSERT OR REPLACE INTO cached_tafsir_verses (tafsir_id, verse_key, text, points_json, language_name, cached_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['171', '2:255', 'متن کش شده آیه الکرسی', '["نکته کش"]', 'fa', Date.now()],
      );

      let apiCalled = false;
      globalThis.fetch = async () => {
        apiCalled = true;
        throw new Error('API should not be called');
      };

      const result = await getTafsirForVerse('2:255', 171);
      assert.strictEqual(apiCalled, false, 'API must not be called when present in cache table');
      assert.ok(result !== null);
      assert.strictEqual(result.text, 'متن کش شده آیه الکرسی');
      assert.deepStrictEqual(result.points, ['نکته کش']);
    });

    it('saves fetched API response to local SQLite cache table', async () => {
      globalThis.fetch = async () => ({
        ok: true,
        json: async () => ({
          tafsir: {
            resource_id: 171,
            slug: 'fa-tafsir-nemouneh',
            text: 'تفسیر ذخیره شده در کش',
            points: ['نکته ذخیره شده'],
            language_name: 'fa',
          },
        }),
      });

      setTafsirForVerseApiBaseUrl('https://mock.quran.ir');
      await getTafsirForVerse('3:18', 171);

      const userDb = await getUserDatabase();
      const cached = await userDb.getFirst(
        'SELECT text, points_json FROM cached_tafsir_verses WHERE tafsir_id = ? AND verse_key = ?',
        ['171', '3:18'],
      );
      assert.ok(cached !== null, 'Tafsir must be persisted to cached_tafsir_verses');
      assert.strictEqual(cached.text, 'تفسیر ذخیره شده در کش');
    });

    it('getTafsirExcerpts incorporates fetched Tafsir content for Nemouneh and Noor', async () => {
      globalThis.fetch = async (url) => {
        if (url.includes('/171/')) {
          return {
            ok: true,
            json: async () => ({
              tafsir: {
                resource_id: 171,
                slug: 'fa-tafsir-nemouneh',
                text: 'نمونه آنلاین',
                points: ['نکته نمونه'],
                language_name: 'fa',
              },
            }),
          };
        }
        if (url.includes('/172/')) {
          return {
            ok: true,
            json: async () => ({
              tafsir: {
                resource_id: 172,
                slug: 'fa-tafsir-noor',
                text: 'نور آنلاین',
                points: ['نکته نور'],
                language_name: 'fa',
              },
            }),
          };
        }
        return { ok: false };
      };

      setTafsirForVerseApiBaseUrl('https://mock.quran.ir');
      const excerpts = await getTafsirExcerpts('112:1');
      assert.strictEqual(excerpts.length, 3);
      const nemouneh = excerpts.find((e) => e.id === 'nemouneh');
      const noor = excerpts.find((e) => e.id === 'noor');
      assert.strictEqual(nemouneh.text, 'نمونه آنلاین');
      assert.deepStrictEqual(nemouneh.points, ['نکته نمونه']);
      assert.strictEqual(noor.text, 'نور آنلاین');
      assert.deepStrictEqual(noor.points, ['نکته نور']);
    });
  });
});

