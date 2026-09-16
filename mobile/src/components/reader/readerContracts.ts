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
 * Maps all 114 Surah IDs to their Arabic names.
 */
export const CHAPTER_NAMES_ARABIC: Record<number, string> = {
  1: 'الفاتحة',
  2: 'البقرة',
  3: 'آل عمران',
  4: 'النساء',
  5: 'المائدة',
  6: 'الأنعام',
  7: 'الأعراف',
  8: 'الأنفال',
  9: 'التوبة',
  10: 'يونس',
  11: 'هود',
  12: 'يوسف',
  13: 'الرعد',
  14: 'ابراهيم',
  15: 'الحجر',
  16: 'النحل',
  17: 'الإسراء',
  18: 'الكهف',
  19: 'مريم',
  20: 'طه',
  21: 'الأنبياء',
  22: 'الحج',
  23: 'المؤمنون',
  24: 'النور',
  25: 'الفرقان',
  26: 'الشعراء',
  27: 'النمل',
  28: 'القصص',
  29: 'العنكبوت',
  30: 'الروم',
  31: 'لقمان',
  32: 'السجدة',
  33: 'الأحزاب',
  34: 'سبإ',
  35: 'فاطر',
  36: 'يس',
  37: 'الصافات',
  38: 'ص',
  39: 'الزمر',
  40: 'غافر',
  41: 'فصلت',
  42: 'الشورى',
  43: 'الزخرف',
  44: 'الدخان',
  45: 'الجاثية',
  46: 'الأحقاف',
  47: 'محمد',
  48: 'الفتح',
  49: 'الحجرات',
  50: 'ق',
  51: 'الذاريات',
  52: 'الطور',
  53: 'النجم',
  54: 'القمر',
  55: 'الرحمن',
  56: 'الواقعة',
  57: 'الحديد',
  58: 'المجادلة',
  59: 'الحشر',
  60: 'الممتحنة',
  61: 'الصف',
  62: 'الجمعة',
  63: 'المنافقون',
  64: 'التغابن',
  65: 'الطلاق',
  66: 'التحريم',
  67: 'الملك',
  68: 'القلم',
  69: 'الحاقة',
  70: 'المعارج',
  71: 'نوح',
  72: 'الجن',
  73: 'المزمل',
  74: 'المدثر',
  75: 'القيامة',
  76: 'الانسان',
  77: 'المرسلات',
  78: 'النبإ',
  79: 'النازعات',
  80: 'عبس',
  81: 'التكوير',
  82: 'الإنفطار',
  83: 'المطففين',
  84: 'الإنشقاق',
  85: 'البروج',
  86: 'الطارق',
  87: 'الأعلى',
  88: 'الغاشية',
  89: 'الفجر',
  90: 'البلد',
  91: 'الشمس',
  92: 'الليل',
  93: 'الضحى',
  94: 'الشرح',
  95: 'التين',
  96: 'العلق',
  97: 'القدر',
  98: 'البينة',
  99: 'الزلزلة',
  100: 'العاديات',
  101: 'القارعة',
  102: 'التكاثر',
  103: 'العصر',
  104: 'الهمزة',
  105: 'الفيل',
  106: 'قريش',
  107: 'الماعون',
  108: 'الكوثر',
  109: 'الكافرون',
  110: 'النصر',
  111: 'المسد',
  112: 'الإخلاص',
  113: 'الفلق',
  114: 'الناس',
};

/**
 * Maps all 114 Surah IDs to their total verse counts.
 */
export const CHAPTER_VERSES_COUNT: Record<number, number> = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6,
};

/**
 * Returns Arabic Surah name for a chapter ID (1..114).
 */
export function getSurahNameArabic(chapterId: number): string {
  return CHAPTER_NAMES_ARABIC[chapterId] || '';
}

/**
 * Returns total verses count for a chapter ID (1..114).
 */
export function getSurahVersesCount(chapterId: number): number {
  return CHAPTER_VERSES_COUNT[chapterId] || 0;
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

/**
 * Formats the Ayah end marker with ornate Quranic brackets (U+FD3E and U+FD3F) and Persian numerals.
 *
 * In standard Unicode and bidirectional text presentation:
 * - U+FD3E (﴾) has the opening curve (facing inwards to the right in LTR presentation)
 * - U+FD3F (﴿) has the closing curve (facing inwards to the left in LTR presentation)
 * Enclosing the Persian verse number between \uFD3E and \uFD3F guarantees that the ornate brackets
 * gracefully embrace the number across both Android and iOS without inverting outwards.
 *
 * Example: formatAyahEndMarker(1) => " ﴾۱﴿ "
 */
export function formatAyahEndMarker(verseNumber: number): string {
  return ` ﴾${toPersianDigits(verseNumber)}﴿ `;
}

/**
 * Strips Arabic combining diacritical marks (harakat, tashkeel, sukun, dagger alif)
 * to count actual base glyphs for visual line layout calculations.
 */
export function countArabicBaseCharacters(text?: string): number {
  if (!text) return 0;
  return text.replace(/[\u0640\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08E1]/g, '').trim().length;
}

export interface MushafLineFontSizeResult {
  fontSize: number;
  lineHeight: number;
  wordPadding: number;
  isJustified: boolean;
}

/**
 * Calculates responsive font size, line height, and word spacing for a 15-line physical Mushaf line.
 *
 * Algorithm:
 * - Uses total base character length and Ayah marker count to compute line glyph weight.
 * - Caps dynamic font size by physical screen width constraint to strictly guarantee that text
 *   NEVER overflows horizontally past screen margins across all devices (360px..1024px) and
 *   font scales (0.8x..1.6x).
 * - Distributes remaining width via edge-to-edge justification (justifyContent: 'space-between')
 *   for lines with >= 4 words.
 */
export function calculateMushafLineFontSize(params: {
  wordCount: number;
  totalBaseChars: number;
  markerCount: number;
  availableLineWidth: number;
  fontScale?: number;
}): MushafLineFontSizeResult {
  const {
    wordCount,
    totalBaseChars,
    markerCount,
    availableLineWidth,
    fontScale = 1.0,
  } = params;

  const totalItems = wordCount + markerCount;
  // Effective character weight: base glyphs + inter-word spacing + marker glyphs
  const effectiveCharWeight = totalBaseChars + (wordCount * 0.7) + (markerCount * 3.0);

  // Maximum safe font size that physically fits availableLineWidth with 0.43 char width coefficient
  const safeAvailWidth = Math.max(240, availableLineWidth - 6);
  const maxSafeFontSize = Math.floor(safeAvailWidth / Math.max(1, effectiveCharWeight * 0.43));

  // Base font size targets based on items count
  let baseTarget: number;
  if (totalItems <= 4) {
    baseTarget = 22;
  } else if (totalItems <= 6) {
    baseTarget = 20;
  } else if (totalItems <= 8) {
    baseTarget = 18;
  } else if (totalItems <= 10) {
    baseTarget = 16.5;
  } else {
    baseTarget = 15;
  }

  // Scale target font size by user's fontScale
  const desired = baseTarget * fontScale;

  // Final font size clamped to safe upper bound to prevent horizontal overflow
  const fontSize = Math.max(11, Math.min(maxSafeFontSize, Math.round(desired)));

  // Proportional line height: base 42px or scaled by font size
  const lineHeight = Math.max(
    READER_COMPONENT_CONTRACTS.mushafPage.quranLineHeight,
    Math.round(fontSize * 2.3)
  );

  // Dynamic word padding: reduced to 0 on dense lines so justification handles spacing
  const wordPadding = wordCount >= 8 ? 0 : wordCount >= 6 ? 0.5 : 1;

  // Justify lines with 4 or more words from edge to edge
  const isJustified = wordCount >= 4;

  return {
    fontSize,
    lineHeight,
    wordPadding,
    isJustified,
  };
}

