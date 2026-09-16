import type { Chapter } from '../../types/quran.ts';
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
