import type { Chapter, Verse, Word } from '../../types/quran.ts';
import { toPersianDigits } from '../catalog/catalogFormatters.ts';

/**
 * Sacred Arabic Bismillah calligraphy text with exact Quranic diacritics and Alef Wasla.
 */
export const BISMILLAH_TEXT = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

/**
 * Layout, typography, and dimension contracts for Reader components.
 * Guarantees compliance with the Sanctuary design system and WCAG 44x44px minimum touch targets.
 */
export const READER_COMPONENT_CONTRACTS = {
  minTouchTarget: 44,
  surahHeader: {
    minHeight: 160,
    outerBorderRadius: 24,
    outerPadding: 16,
    innerBorderRadius: 16,
    innerPadding: 12,
    arabicFontSize: 32,
    arabicLineHeight: 48,
    persianFontSize: 16,
    persianLineHeight: 24,
    infoButtonSize: 44,
    infoIconSize: 20,
    emblemSize: 44,
    emblemInnerSize: 32,
    badgeBorderWidth: 1,
    containerBorderWidth: 1,
  },
  bismillah: {
    fontSize: 24,
    lineHeight: 44,
    text: BISMILLAH_TEXT,
    dividerHeight: 1,
    dividerWidthPercent: '80%',
    minHeight: 44,
  },
  verseCard: {
    minTouchTarget: 44,
    badgeOuterSize: 36,
    badgeInnerSize: 28,
    actionButtonSize: 44,
    actionIconSize: 20,
    defaultFontScale: 1.0,
    quranFontSize: 26,
    quranLineHeightDefault: 54,
    translationFontSize: 15,
    translationLineHeight: 26,
    activeBorderColor: '#10b981',
    activeBackgroundColor: 'rgba(10, 38, 30, 0.85)',
  },
  mushafPage: {
    totalLines: 15,
    minTouchTarget: 44,
    headerMinHeight: 44,
    footerMinHeight: 52,
    navButtonSize: 44,
    navIconSize: 22,
    quranFontSize: 22,
    quranLineHeight: 42,
  },
  audioDock: {
    minHeight: 64,
    primaryButtonSize: 48,
    secondaryButtonSize: 44,
    defaultReciter: 'استاد شهریار پرهیزگار',
    iconSize: 20,
    primaryIconSize: 24,
    borderRadius: 16,
  },
  settingsModal: {
    minScale: 0.8,
    maxScale: 1.6,
    scaleStep: 0.1,
    closeButtonSize: 44,
    stepperButtonSize: 44,
    stepperIconSize: 20,
    closeIconSize: 20,
    previewFontSize: 22,
    previewText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  },
} as const;

/**
 * Determines whether the Bismillah banner should be rendered for a given chapter.
 * Rules:
 * 1. Returns false if chapterId is 9 (Surah At-Tawbah does not have a Bismillah).
 * 2. Returns false if bismillahPre is explicitly false.
 * 3. Returns true for Surah 1 and Surah 2, and all other chapters when bismillahPre !== false.
 */
export function shouldRenderBismillah(
  chapterId: number,
  bismillahPre?: boolean
): boolean {
  if (chapterId === 9) {
    return false;
  }
  if (bismillahPre === false) {
    return false;
  }
  return true;
}

/**
 * Formats revelation place to Persian label ('مکی' or 'مدنی').
 */
export function formatRevelationPlace(place: 'makkah' | 'madinah'): string {
  return place === 'makkah' ? 'مکی' : 'مدنی';
}

/**
 * Formats Surah revelation order badge text in Persian digits.
 * Example: "ترتیب نزول: ۵"
 */
export function formatRevelationOrderBadge(revelationOrder: number): string {
  return `ترتیب نزول: ${toPersianDigits(revelationOrder)}`;
}

/**
 * Formats Surah verse count badge text in Persian digits.
 * Example: "۷ آیه"
 */
export function formatVerseCountBadge(versesCount: number): string {
  return `${toPersianDigits(versesCount)} آیه`;
}

/**
 * Formats Surah number badge text in Persian digits.
 * Example: "سوره ۱"
 */
export function formatSurahNumberBadge(chapterId: number): string {
  return `سوره ${toPersianDigits(chapterId)}`;
}

/**
 * Formats comprehensive accessibility label for SurahHeaderBanner.
 * Announces Surah number, Persian title, Arabic title, revelation place, revelation rank, and verse count.
 */
export function formatSurahHeaderAccessibilityLabel(
  chapter: Pick<
    Chapter,
    'id' | 'name_fa' | 'name_arabic' | 'revelation_place' | 'revelation_order' | 'verses_count'
  >
): string {
  const surahNum = toPersianDigits(chapter.id);
  const place = formatRevelationPlace(chapter.revelation_place);
  const revOrder = toPersianDigits(chapter.revelation_order);
  const verses = formatVerseCountBadge(chapter.verses_count);
  return `سوره شماره ${surahNum}، ${chapter.name_fa}، ${chapter.name_arabic}، ${place}، رتبه نزول ${revOrder}، ${verses}`;
}

/**
 * Formats accessibility label for the Info button in SurahHeaderBanner.
 */
export function formatInfoButtonAccessibilityLabel(chapterNameFa: string): string {
  return `اطلاعات و شناسنامه سوره ${chapterNameFa}`;
}

/**
 * Formats verse number badge in Persian numerals.
 */
export function formatVerseBadgeNumber(verseNumber: number): string {
  return toPersianDigits(verseNumber);
}

/**
 * Formats comprehensive accessibility label for ContinuousVerseCard.
 */
export function formatContinuousVerseAccessibilityLabel(
  verse: Pick<Verse, 'verse_number' | 'chapter_id'>,
  activeTranslation?: string
): string {
  const vNum = toPersianDigits(verse.verse_number);
  const cNum = toPersianDigits(verse.chapter_id);
  const base = `آیه شماره ${vNum} از سوره ${cNum}`;
  if (activeTranslation) {
    return `${base}، ترجمه فعال: ${activeTranslation}`;
  }
  return base;
}

/**
 * Formats Mushaf header Juz title in Persian digits: e.g. "جزء ۱".
 */
export function formatMushafJuzTitle(juzNumber: number): string {
  return `جزء ${toPersianDigits(juzNumber)}`;
}

/**
 * Formats Mushaf header Page title in Persian digits: e.g. "صفحه ۱".
 */
export function formatMushafPageTitle(pageNumber: number): string {
  return `صفحه ${toPersianDigits(pageNumber)}`;
}

/**
 * Formats Mushaf header Surah title: e.g. "سوره فاتحه".
 */
export function formatMushafSurahTitle(surahName: string): string {
  if (!surahName) return '';
  return surahName.startsWith('سوره') ? surahName : `سوره ${surahName}`;
}

/**
 * Formats comprehensive accessibility label for MushafPageView header.
 */
export function formatMushafHeaderAccessibilityLabel(
  pageNumber: number,
  juzNumber?: number,
  surahName?: string
): string {
  const parts: string[] = [`صفحه ${toPersianDigits(pageNumber)}`];
  if (juzNumber !== undefined) {
    parts.push(formatMushafJuzTitle(juzNumber));
  }
  if (surahName) {
    parts.push(formatMushafSurahTitle(surahName));
  }
  return parts.join('، ');
}

/**
 * Maps all 114 Surah IDs to their Persian names without extra qualifiers.
 */
export const CHAPTER_NAMES_FA: Record<number, string> = {
  1: 'فاتحه',
  2: 'بقره',
  3: 'آل عمران',
  4: 'نساء',
  5: 'مائده',
  6: 'انعام',
  7: 'اعراف',
  8: 'انفال',
  9: 'توبه',
  10: 'یونس',
  11: 'هود',
  12: 'یوسف',
  13: 'رعد',
  14: 'ابراهیم',
  15: 'حجر',
  16: 'نحل',
  17: 'اسراء',
  18: 'کهف',
  19: 'مریم',
  20: 'طه',
  21: 'انبیاء',
  22: 'حج',
  23: 'مؤمنون',
  24: 'نور',
  25: 'فرقان',
  26: 'شعراء',
  27: 'نمل',
  28: 'قصص',
  29: 'عنکبوت',
  30: 'روم',
  31: 'لقمان',
  32: 'سجده',
  33: 'احزاب',
  34: 'سبأ',
  35: 'فاطر',
  36: 'یس',
  37: 'صافات',
  38: 'ص',
  39: 'زمر',
  40: 'غافر',
  41: 'فصلت',
  42: 'شوری',
  43: 'زخرف',
  44: 'دخان',
  45: 'جاثیه',
  46: 'احقاف',
  47: 'محمد',
  48: 'فتح',
  49: 'حجرات',
  50: 'ق',
  51: 'ذاریات',
  52: 'طور',
  53: 'نجم',
  54: 'قمر',
  55: 'الرحمن',
  56: 'واقعه',
  57: 'حدید',
  58: 'مجادله',
  59: 'حشر',
  60: 'ممتحنه',
  61: 'صف',
  62: 'جمعه',
  63: 'منافقون',
  64: 'تغابن',
  65: 'طلاق',
  66: 'تحریم',
  67: 'ملک',
  68: 'قلم',
  69: 'حاقه',
  70: 'معارج',
  71: 'نوح',
  72: 'جن',
  73: 'مزمل',
  74: 'مدثر',
  75: 'قیامت',
  76: 'انسان',
  77: 'مرسلات',
  78: 'نبأ',
  79: 'نازعات',
  80: 'عبس',
  81: 'تکویر',
  82: 'انفطار',
  83: 'مطففین',
  84: 'انشقاق',
  85: 'بروج',
  86: 'طارق',
  87: 'اعلی',
  88: 'غاشیه',
  89: 'فجر',
  90: 'بلد',
  91: 'شمس',
  92: 'لیل',
  93: 'ضحی',
  94: 'شرح',
  95: 'تین',
  96: 'علق',
  97: 'قدر',
  98: 'بینه',
  99: 'زلزال',
  100: 'عادیات',
  101: 'قارعه',
  102: 'تکاثر',
  103: 'عصر',
  104: 'همزه',
  105: 'فیل',
  106: 'قریش',
  107: 'ماعون',
  108: 'کوثر',
  109: 'کافرون',
  110: 'نصر',
  111: 'مسد',
  112: 'اخلاص',
  113: 'فلق',
  114: 'ناس',
};

/**
 * Returns Persian Surah name for a chapter ID (1..114).
 */
export function getSurahNameFa(chapterId: number): string {
  return CHAPTER_NAMES_FA[chapterId] || '';
}

/**
 * Groups words by physical Mushaf line number (1..15).
 * Words on each line are strictly sorted in sequential reading order:
 * chapter_id ASC, verse_number ASC, position ASC.
 */
export function groupWordsByLine(words: Word[]): Map<number, Word[]> {
  const lineMap = new Map<number, Word[]>();
  for (let line = 1; line <= READER_COMPONENT_CONTRACTS.mushafPage.totalLines; line++) {
    lineMap.set(line, []);
  }

  if (!words || words.length === 0) {
    return lineMap;
  }

  // Clone and sort words strictly in canonical reading order
  const sortedWords = [...words].sort((a, b) => {
    const lineA = a.line_number ?? 0;
    const lineB = b.line_number ?? 0;
    if (lineA !== lineB) return lineA - lineB;

    const chA = a.chapter_id ?? 0;
    const chB = b.chapter_id ?? 0;
    if (chA !== chB) return chA - chB;

    const vA = a.verse_number ?? 0;
    const vB = b.verse_number ?? 0;
    if (vA !== vB) return vA - vB;

    const pA = a.position ?? 0;
    const pB = b.position ?? 0;
    return pA - pB;
  });

  for (const word of sortedWords) {
    const line = word.line_number;
    if (line !== undefined && line >= 1 && line <= READER_COMPONENT_CONTRACTS.mushafPage.totalLines) {
      lineMap.get(line)?.push(word);
    }
  }

  return lineMap;
}

/**
 * Formats Persian Ayah title for AudioPlaybackDock:
 * e.g., "سوره الفاتحه • آیه ۱" or "سوره فاتحه • آیه ۱"
 */
export function formatAudioDockTitle(
  surahName?: string,
  verseNumber?: number
): string {
  const parts: string[] = [];

  if (surahName && surahName.trim().length > 0) {
    const trimmed = surahName.trim();
    parts.push(trimmed.startsWith('سوره') ? trimmed : `سوره ${trimmed}`);
  }

  if (verseNumber !== undefined && verseNumber !== null) {
    parts.push(`آیه ${toPersianDigits(verseNumber)}`);
  }

  return parts.join(' • ');
}

/**
 * Formats font scale value (0.8 .. 1.6) to Persian percentage string:
 * e.g. 1.0 -> '۱۰۰٪', 0.8 -> '۸۰٪', 1.6 -> '۱۶۰٪'
 */
export function formatFontScalePercentage(scale: number): string {
  const percentage = Math.round(scale * 100);
  return `${toPersianDigits(percentage)}٪`;
}

/**
 * Clamps font scale to the contractual [minScale, maxScale] range (0.8 .. 1.6).
 * Rounds to 1 decimal place.
 */
export function clampFontScale(scale: number): number {
  const min = READER_COMPONENT_CONTRACTS.settingsModal.minScale;
  const max = READER_COMPONENT_CONTRACTS.settingsModal.maxScale;
  const clamped = Math.max(min, Math.min(max, scale));
  return Math.round(clamped * 10) / 10;
}
