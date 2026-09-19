/**
 * Quick Jump Navigation Contracts & Types
 * Defines data structures and typography/numeral conversion utilities for the
 * Universal "Go To" Quick Jump modal across Surah reader, Home, and Catalog.
 */

export interface JumpDestination {
  chapterId: number;
  verseNumber: number;
  pageNumber: number;
  juzNumber: number;
  verseKey: string;
  chapterNameArabic: string;
  chapterNameFa: string;
  totalVerses: number;
}

export interface JuzCardInfo {
  juzNumber: number;
  startChapterId: number;
  startVerseNumber: number;
  startPageNumber: number;
  verseCount: number;
  firstSurahNameArabic: string;
  firstSurahNameFa: string;
}

/**
 * Converts Western ASCII digits (0-9) to Persian digits (۰-۹).
 */
export function toPersianDigits(input: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/[0-9]/g, (digit) => farsiDigits[parseInt(digit, 10)]);
}

/**
 * Converts both Persian (۰-۹) and Arabic (٠-٩) numerals to standard ASCII digits (0-9).
 */
export function toAsciiDigits(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/**
 * Parses a localized string (containing Western, Persian, or Arabic digits) into an integer.
 * Returns NaN if the input is empty or invalid.
 */
export function parseLocalizedNumber(str: string | number): number {
  if (str === null || str === undefined) return NaN;
  const ascii = toAsciiDigits(String(str).trim());
  if (!/^-?\d+$/.test(ascii)) return NaN;
  const val = parseInt(ascii, 10);
  return Number.isFinite(val) ? val : NaN;
}

/**
 * Strips parenthesized translations and optional prefixes from Persian Surah names.
 * e.g. "بقره (گاو ماده)" -> "بقره", "سوره فاتحه" -> "فاتحه"
 */
export function cleanSurahNameFa(nameFa: string): string {
  if (!nameFa) return '';
  return nameFa
    .split('(')[0]
    .replace(/^سوره\s+/, '')
    .trim();
}

/**
 * Formats a Persian destination preview line:
 * e.g. "سوره بقره • آیه ۲۵۵ • صفحه ۴۲ • جزء ۳"
 */
export function formatDestinationPreview(dest: JumpDestination): string {
  const surahName =
    cleanSurahNameFa(dest.chapterNameFa) ||
    dest.chapterNameArabic ||
    toPersianDigits(dest.chapterId);
  const verseStr = toPersianDigits(dest.verseNumber);
  const pageStr = toPersianDigits(dest.pageNumber);
  const juzStr = toPersianDigits(dest.juzNumber);
  return `سوره ${surahName} • آیه ${verseStr} • صفحه ${pageStr} • جزء ${juzStr}`;
}

export type QuickJumpTabId = 'surah_ayah' | 'page' | 'juz';

export interface QuickJumpTabDefinition {
  id: QuickJumpTabId;
  label: string;
}

export const QUICK_JUMP_TABS: QuickJumpTabDefinition[] = [
  { id: 'surah_ayah', label: 'سوره و آیه' },
  { id: 'page', label: 'صفحه' },
  { id: 'juz', label: 'جزء' },
];

export const QUICK_JUMP_MODAL_CONTRACTS = {
  minTouchTarget: 44,
  buttonMinHeight: 48,
  closeButtonSize: 44,
  modalTitle: 'پرش سریع به متن قرآن',
  actionButtonLabel: 'مشاهده و شروع تلاوت',
} as const;
