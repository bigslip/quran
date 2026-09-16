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
  tabSwitcher: {
    minHeight: 44,
    containerMinHeight: 52,
    tabMinHeight: 44,
    tabMinWidth: 44,
    containerBorderWidth: 1,
    activeTabBorderWidth: 1,
    padding: 4,
  },
  emptyState: {
    minHeight: 200,
    iconBadgeSize: 64,
    clearButtonMinHeight: 44,
    clearButtonMinWidth: 44,
    clearButtonBorderWidth: 1,
  },
} as const;

/**
 * Tab identifier for the catalog tab switcher:
 * - 'surah': standard Surah list
 * - 'juz': 30 Juz partitions
 * - 'revelation': chronological revelation order
 */
export type CatalogTabId = 'surah' | 'juz' | 'revelation';

export interface CatalogTab {
  id: CatalogTabId;
  label: string;
}

export const CATALOG_TABS: readonly CatalogTab[] = [
  { id: 'surah', label: 'سوره‌ها' },
  { id: 'juz', label: 'جزءها' },
  { id: 'revelation', label: 'ترتیب نزول' },
] as const;


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

/**
 * Normalizes text for Arabic / Persian search matching:
 * - Converts Persian digits (۰-۹) and Arabic digits (٠-٩) to ASCII 0-9
 * - Removes Arabic diacritics / harakat ([\u064B-\u065F]), superscript alef (\u0670), tatweel (\u0640), and ZWNJ/ZWJ
 * - Normalizes Arabic Yeh (ي, ى) to Persian Yeh (ی)
 * - Normalizes Arabic Kaf (ك) to Persian Kaf (ک)
 * - Normalizes Teh Marbuta (ة) and Heh with Hamza (ۀ) to Heh (ه)
 * - Normalizes Alef forms (آ, أ, إ, ٱ) to bare Alef (ا)
 * - Trims whitespace and lowercases
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06F0))
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u064B-\u065F\u0670\u0640\u200C\u200D]/g, '')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ةۀ]/g, 'ه')
    .replace(/[آأإٱ]/g, 'ا')
    .trim()
    .toLowerCase();
}

/**
 * Filters Surahs based on real-time search query.
 * Matches:
 * - Persian name (name_fa)
 * - Arabic calligraphy name (name_arabic)
 * - Simple transliterated name (name_simple)
 * - English translation name (name_en)
 * - Surah number (id)
 * - Revelation order (revelation_order)
 * Returns the original array unchanged if query is empty.
 */
export function filterSurahs(surahs: Chapter[], query: string): Chapter[] {
  if (!query || !query.trim()) {
    return surahs;
  }
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return surahs;
  }

  const cleanQuery = normalizedQuery.replace(/^سوره\s*/, '').trim();

  return surahs.filter((surah) => {
    const nameFaNorm = normalizeSearchText(surah.name_fa);
    const nameArabicNorm = normalizeSearchText(surah.name_arabic);
    const nameSimpleNorm = normalizeSearchText(surah.name_simple);
    const nameEnNorm = normalizeSearchText(surah.name_en);
    const idStr = String(surah.id);
    const revOrderStr = String(surah.revelation_order);

    if (
      nameFaNorm.includes(normalizedQuery) ||
      nameArabicNorm.includes(normalizedQuery) ||
      nameSimpleNorm.includes(normalizedQuery) ||
      nameEnNorm.includes(normalizedQuery) ||
      idStr === normalizedQuery ||
      revOrderStr === normalizedQuery
    ) {
      return true;
    }

    if (cleanQuery && cleanQuery !== normalizedQuery) {
      if (
        nameFaNorm.includes(cleanQuery) ||
        nameArabicNorm.includes(cleanQuery) ||
        nameSimpleNorm.includes(cleanQuery) ||
        nameEnNorm.includes(cleanQuery) ||
        idStr === cleanQuery ||
        revOrderStr === cleanQuery
      ) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Filters Juzs based on real-time search query.
 * Matches:
 * - Juz number (e.g. 30 or "۳۰")
 * - "جزء X" (e.g. "جزء ۳۰", "جزء 30")
 * - First Surah Persian name (first_surah_name_fa)
 * - First Surah Arabic name (first_surah_name_arabic)
 * Returns the original array unchanged if query is empty.
 */
export function filterJuzs(juzs: Juz[], query: string): Juz[] {
  if (!query || !query.trim()) {
    return juzs;
  }
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return juzs;
  }

  const cleanQuery = normalizedQuery.replace(/^جزء\s*/, '').trim();

  return juzs.filter((juz) => {
    const juzNumStr = String(juz.juz_number);
    const juzBadgeNorm = normalizeSearchText(`جزء ${juz.juz_number}`);
    const surahFaNorm = normalizeSearchText(juz.first_surah_name_fa);
    const surahArabicNorm = normalizeSearchText(juz.first_surah_name_arabic);

    if (
      juzNumStr === normalizedQuery ||
      juzBadgeNorm.includes(normalizedQuery) ||
      surahFaNorm.includes(normalizedQuery) ||
      surahArabicNorm.includes(normalizedQuery)
    ) {
      return true;
    }

    if (cleanQuery && cleanQuery !== normalizedQuery) {
      if (
        juzNumStr === cleanQuery ||
        surahFaNorm.includes(cleanQuery) ||
        surahArabicNorm.includes(cleanQuery)
      ) {
        return true;
      }
    }

    return false;
  });
}

