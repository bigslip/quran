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
} as const;

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
