import type { Chapter, Juz } from '../../types/quran.ts';

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
 */
export function formatSurahBadgeNumber(
  surah: Pick<Chapter, 'id' | 'revelation_order'>,
  isRevelationOrder = false,
  usePersian = false
): string {
  const num = isRevelationOrder ? surah.revelation_order : surah.id;
  return usePersian ? toPersianDigits(num) : String(num);
}

/**
 * Returns formatted verse count string: e.g. "7 آیه" or "۷ آیه".
 */
export function formatAyahCount(versesCount: number, usePersian = false): string {
  const numStr = usePersian ? toPersianDigits(versesCount) : String(versesCount);
  return `${numStr} آیه`;
}

/**
 * Returns formatted Juz badge title: e.g. "جزء 1" or "جزء ۱".
 */
export function formatJuzBadge(juzNumber: number, usePersian = false): string {
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
 * Formats starting Surah and Ayah info: e.g. "سوره فاتحه • آیه 1".
 */
export function formatJuzStartInfo(
  firstSurahNameFa: string,
  firstVerseKey: string,
  usePersian = false
): string {
  const ayahNum = extractAyahNumberFromKey(firstVerseKey);
  const formattedAyah = usePersian ? toPersianDigits(ayahNum) : ayahNum;
  return `سوره ${firstSurahNameFa} • آیه ${formattedAyah}`;
}

/**
 * Formats page range indicator: e.g. "صفحات 1 تا 21".
 */
export function formatJuzPageRange(
  pageStart: number,
  pageEnd: number,
  usePersian = false
): string {
  const startStr = usePersian ? toPersianDigits(pageStart) : String(pageStart);
  const endStr = usePersian ? toPersianDigits(pageEnd) : String(pageEnd);
  return `صفحات ${startStr} تا ${endStr}`;
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
