import { toPersianDigits } from '../catalog/catalogFormatters.ts';

/**
 * Component dimensions and layout contracts for Insights touch targets and accessibility.
 */
export const INSIGHTS_COMPONENT_CONTRACTS = {
  minTouchTarget: 44,
  activeChipHeight: 44,
  wordCardMinHeight: 64,
  cardBorderRadius: 16,
  wordHitSlop: { top: 8, bottom: 8, left: 6, right: 6 },
  activeBannerFontSize: 24,
  activeBannerLineHeight: 38,
  scriptureFontSize: 24,
  scriptureLineHeight: 44,
  translationFontSize: 15,
  translationLineHeight: 26,
  wordButtonMinWidth: 44,
  wordButtonMinHeight: 44,
  activeWordBorderWidth: 1.5,
  activeCardBorderWidth: 1.5,
  tafsirPillMinHeight: 44,
  tafsirPillMinWidth: 44,
  tafsirBodyLineHeight: 26,
  reflectionInputMinHeight: 100,
  reflectionButtonMinHeight: 44,
  reflectionButtonMinWidth: 44,
  drawerMinTouchTarget: 44,
  drawerMaxSheetHeightPercent: 0.9,
  dragHandleWidth: 36,
  dragHandleHeight: 4,
  headerButtonMinHeight: 44,
  headerButtonMinWidth: 44,
  drawerActionIconSize: 20,
  tabSwitcherMinHeight: 44,
  tabButtonMinHeight: 44,
  tabButtonMinWidth: 44,

  // New Ergonomic Redesign Contracts
  drawerExpandedSheetHeightPercent: 0.93,
  compactScriptureBannerMinHeight: 46,
  compactScriptureFontSize: 18,
  compactScriptureLineHeight: 32,
  tafsirStepperButtonMinSize: 44,
  tafsirParagraphSpacing: 16,
  tafsirStandardFontSize: 15,
  tafsirStandardLineHeight: 27,
  tafsirComfortableFontSize: 17,
  tafsirComfortableLineHeight: 31,
  tafsirLargeFontSize: 20,
  tafsirLargeLineHeight: 36,
  reflectionGenerousInputMinHeight: 200,
} as const;

/**
 * 3-Tab definition for the Ayah Insights Drawer.
 */
export const INSIGHTS_DRAWER_TABS = [
  { id: 'tafsir', label: 'تفسیر و تدبر' },
  { id: 'vocabulary', label: 'تحلیل واژگان' },
  { id: 'reflection', label: 'یادداشت من' },
] as const;

export type InsightDrawerTabId = (typeof INSIGHTS_DRAWER_TABS)[number]['id'];

/**
 * Formats a word's position into a Persian numeral badge string (e.g. "واژه ۱", "واژه ۲").
 */
export function formatWordPositionBadge(position: number): string {
  return `واژه ${toPersianDigits(position)}`;
}

/**
 * Formats an Arabic 3-letter (or multi-letter) root into standardized Persian/Arabic notation:
 * e.g. "صبر" -> "«ص-ب-ر»", "ص-ب-ر" -> "«ص-ب-ر»", undefined/empty -> "—".
 */
export function formatArabicRoot(root?: string): string {
  if (!root || typeof root !== 'string') {
    return '—';
  }

  // Strip existing guillemets, dashes, hyphens, and whitespace
  const cleaned = root.replace(/[\s\-«»—–]/g, '').trim();
  if (!cleaned) {
    return '—';
  }

  const hyphenated = Array.from(cleaned).join('-');
  return `«${hyphenated}»`;
}

/**
 * Maps English part of speech (or parses existing POS) to a standardized Persian label:
 * - 'verb' -> 'فعل'
 * - 'noun' -> 'اسم'
 * - 'particle' -> 'حرف'
 * - fallback -> 'کلمه'
 */
export function formatPartOfSpeechFa(pos?: string): string {
  if (!pos || typeof pos !== 'string') {
    return 'کلمه';
  }

  const normalized = pos.trim().toLowerCase();
  if (normalized === 'verb' || normalized.startsWith('verb')) {
    return 'فعل';
  }
  if (normalized === 'noun' || normalized.startsWith('noun')) {
    return 'اسم';
  }
  if (normalized === 'particle' || normalized.startsWith('particle')) {
    return 'حرف';
  }

  // Support Persian POS descriptions gracefully
  if (pos.includes('فعل')) {
    return 'فعل';
  }
  if (pos.includes('اسم')) {
    return 'اسم';
  }
  if (pos.includes('حرف')) {
    return 'حرف';
  }

  return 'کلمه';
}

/**
 * Formats an Ayah header for insights/tadabbur display with Persian numerals:
 * e.g. "سوره کهف • آیه ۲۸", "سوره فاتحه • آیه ۱".
 */
export function formatInsightAyahHeader(surahName: string, verseNumber: number): string {
  const cleanSurahName = (surahName || '').replace(/^سوره\s+/, '').trim();
  return `سوره ${cleanSurahName} • آیه ${toPersianDigits(verseNumber)}`;
}

/**
 * Formats a Tafsir excerpt into a concise pill label for the source selector:
 * e.g. "نمونه (مکارم)", "المیزان (طباطبایی)", "نور (قرائتی)".
 */
export function formatTafsirPillTitle(tafsir?: {
  id?: string;
  author_name?: string;
  title?: string;
}): string {
  if (!tafsir) return '';
  const id = (tafsir.id || '').toLowerCase();
  const author = tafsir.author_name || '';

  if (id.includes('nemouneh') || author.includes('نمونه') || author.includes('مکارم')) {
    return 'نمونه (مکارم)';
  }
  if (id.includes('mizan') || author.includes('المیزان') || author.includes('طباطبایی')) {
    return 'المیزان (طباطبایی)';
  }
  if (id.includes('noor') || author.includes('نور') || author.includes('قرائتی')) {
    return 'نور (قرائتی)';
  }

  return author || tafsir.title || tafsir.id || '';
}

/**
 * Formats a character count into Persian numeral notation with "نویسه" suffix:
 * e.g. 42 -> "۴۲ نویسه", 0 -> "۰ نویسه".
 */
export function formatReflectionCharCount(count: number): string {
  const safeCount = typeof count === 'number' && !Number.isNaN(count) ? Math.max(0, count) : 0;
  return `${toPersianDigits(safeCount)} نویسه`;
}

/**
 * Formats Juz and Page numbers into a Persian numeral badge string:
 * e.g. (15, 297) -> "صفحه ۲۹۷ • جزء ۱۵".
 */
export function formatJuzAndPageBadge(juz?: number, page?: number): string {
  const pagePart =
    typeof page === 'number' && !Number.isNaN(page) ? `صفحه ${toPersianDigits(page)}` : '';
  const juzPart =
    typeof juz === 'number' && !Number.isNaN(juz) ? `جزء ${toPersianDigits(juz)}` : '';
  if (pagePart && juzPart) {
    return `${pagePart} • ${juzPart}`;
  }
  return pagePart || juzPart || '';
}

export type TafsirFontSizeLevel = 'standard' | 'comfortable' | 'large';

export const TAFSIR_READING_FONT_SCALES: Record<
  TafsirFontSizeLevel,
  {
    fontSize: number;
    lineHeight: number;
    labelFa: string;
  }
> = {
  standard: { fontSize: 15, lineHeight: 27, labelFa: 'استاندارد' },
  comfortable: { fontSize: 17, lineHeight: 31, labelFa: 'خوانا' },
  large: { fontSize: 20, lineHeight: 36, labelFa: 'بزرگ' },
};

/**
 * Splits raw exegesis text into semantic paragraphs.
 */
export function splitTafsirParagraphs(text?: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  return normalized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Formats character count and word count into Persian numeral notation:
 * e.g. (42, 8) -> "۴۲ نویسه • ۸ کلمه"
 */
export function formatReflectionMetrics(charCount: number, wordCount: number): string {
  const safeChars = Math.max(
    0,
    typeof charCount === 'number' && !Number.isNaN(charCount) ? charCount : 0,
  );
  const safeWords = Math.max(
    0,
    typeof wordCount === 'number' && !Number.isNaN(wordCount) ? wordCount : 0,
  );
  return `${toPersianDigits(safeChars)} نویسه • ${toPersianDigits(safeWords)} کلمه`;
}

export * from './tafsirNudgeContracts.ts';
