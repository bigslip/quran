import type { Chapter, Juz } from '../../types/quran.ts';

/**
 * Component dimensions and layout contracts for touch targets and accessibility.
 */
export const CATALOG_COMPONENT_CONTRACTS = {
  minTouchTarget: 44,
  surahCard: {
    minHeight: 74,
    minWidth: 44,
    badgeOuterSize: 44,
    badgeInnerSize: 36,
    badgeOuterBorderWidth: 1.5,
    badgeInnerBorderWidth: 1,
    arabicFontSize: 21,
    arabicLineHeight: 32,
    chipPaddingHorizontal: 6,
    chipPaddingVertical: 2,
    chipBorderWidth: 1,
    containerBorderWidth: 1,
  },
  juzCard: {
    minHeight: 110,
    minWidth: 44,
    juzBadgeBorderWidth: 1.5,
    ayahPillBorderWidth: 1,
    previewLineHeight: 28,
    previewFontSize: 16,
    containerBorderWidth: 1,
  },
} as const;

/**
 * Converts ASCII digits (0-9) to Persian digits (۰-۹).
 */
export function toPersianDigits(input: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/[0-9]/g, (digit) => farsiDigits[parseInt(digit, 10)]);
}

/**
 * Returns the badge number string for a Surah card.
 * In revelation order mode, returns the revelation order; otherwise returns the standard Surah ID.
 * Defaults to Persian digits (usePersian = true).
 */
export function formatSurahBadgeNumber(
  surah: Pick<Chapter, 'id' | 'revelation_order'>,
  isRevelationOrder = false,
  usePersian = true
): string {
  const num = isRevelationOrder ? surah.revelation_order : surah.id;
  return usePersian ? toPersianDigits(num) : String(num);
}

/**
 * Returns formatted verse count string: e.g. "۷ آیه" or "7 آیه".
 * Defaults to Persian digits (usePersian = true).
 */
export function formatAyahCount(versesCount: number, usePersian = true): string {
  const numStr = usePersian ? toPersianDigits(versesCount) : String(versesCount);
  return `${numStr} آیه`;
}

/**
 * Returns formatted Juz badge title: e.g. "جزء ۱" or "جزء 1".
 * Defaults to Persian digits (usePersian = true).
 */
export function formatJuzBadge(juzNumber: number, usePersian = true): string {
  const numStr = usePersian ? toPersianDigits(juzNumber) : String(juzNumber);
  return `جزء ${numStr}`;
}

/**
 * Extracts the starting Ayah number from a verse_key (e.g. "1:1" -> "1", "2:142" -> "142").
 */
export function extractAyahNumberFromKey(verseKey: string): string {
  if (!verseKey) return '1';
  const parts = verseKey.split(':');
  return parts.length > 1 ? parts[1] : parts[0];
}

/**
 * Formats starting Surah and Ayah info: e.g. "سوره فاتحه • آیه ۱".
 * Defaults to Persian digits (usePersian = true).
 */
export function formatJuzStartInfo(
  firstSurahNameFa: string,
  firstVerseKey: string,
  usePersian = true
): string {
  const ayahNum = extractAyahNumberFromKey(firstVerseKey);
  const formattedAyah = usePersian ? toPersianDigits(ayahNum) : ayahNum;
  return `سوره ${firstSurahNameFa} • آیه ${formattedAyah}`;
}

/**
 * Formats page range indicator: e.g. "صفحات ۱ تا ۲۱".
 * Defaults to Persian digits (usePersian = true).
 */
export function formatJuzPageRange(
  pageStart: number,
  pageEnd: number,
  usePersian = true
): string {
  const startStr = usePersian ? toPersianDigits(pageStart) : String(pageStart);
  const endStr = usePersian ? toPersianDigits(pageEnd) : String(pageEnd);
  return `صفحات ${startStr} تا ${endStr}`;
}

/**
 * Formats canonical Surah hint for revelation order mode: e.g. "• شماره سوره: ۱".
 * Defaults to Persian digits (usePersian = true).
 */
export function formatCanonicalSurahHint(surahId: number, usePersian = true): string {
  const numStr = usePersian ? toPersianDigits(surahId) : String(surahId);
  return `• شماره سوره: ${numStr}`;
}

/**
 * Formats accessibility label for Surah card, including Surah number and Persian numerals by default.
 */
export function formatSurahAccessibilityLabel(
  surah: Pick<Chapter, 'id' | 'name_fa' | 'name_arabic' | 'verses_count' | 'revelation_order'>,
  isRevelationOrder = false,
  usePersian = true
): string {
  const surahIdStr = usePersian ? toPersianDigits(surah.id) : String(surah.id);
  const verseCountStr = formatAyahCount(surah.verses_count, usePersian);

  if (isRevelationOrder) {
    const revOrderStr = usePersian ? toPersianDigits(surah.revelation_order) : String(surah.revelation_order);
    return `سوره ${surahIdStr}، ${surah.name_fa}، رتبه نزول ${revOrderStr}، ${surah.name_arabic}، ${verseCountStr}`;
  }
  return `سوره ${surahIdStr}، ${surah.name_fa}، ${surah.name_arabic}، ${verseCountStr}`;
}

/**
 * Formats accessibility label for Juz card with Persian numerals by default.
 */
export function formatJuzAccessibilityLabel(
  juz: Pick<Juz, 'juz_number' | 'first_surah_name_fa' | 'first_verse_key' | 'page_start' | 'page_end' | 'verses_count'>,
  usePersian = true
): string {
  const badgeText = formatJuzBadge(juz.juz_number, usePersian);
  const startInfo = formatJuzStartInfo(juz.first_surah_name_fa, juz.first_verse_key, usePersian);
  const pageRange = formatJuzPageRange(juz.page_start, juz.page_end, usePersian);
  const ayahCount = formatAyahCount(juz.verses_count, usePersian);
  return `${badgeText}، ${startInfo}، ${pageRange}، ${ayahCount}`;
}

/**
 * Returns revelation place label in Persian ('مکی' or 'مدنی').
 */
export function getRevelationPlaceLabel(place: 'makkah' | 'madinah'): string {
  return place === 'makkah' ? 'مکی' : 'مدنی';
}

/**
 * Returns the router navigation target for a Surah.
 */
export function getSurahNavigationRoute(chapterId: number): string {
  return `/surah/${chapterId}`;
}

/**
 * Returns the router navigation target for a Juz (opens the first chapter of the Juz).
 */
export function getJuzNavigationRoute(firstChapterId: number): string {
  return `/surah/${firstChapterId}`;
}
