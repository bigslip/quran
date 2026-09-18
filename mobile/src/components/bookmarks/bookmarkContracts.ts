/* eslint-disable @typescript-eslint/naming-convention */
import { toPersianDigits } from '../catalog/catalogFormatters.ts';
import type { HydratedBookmark, Tag } from '../../types/bookmark.ts';

/**
 * Layout, typography, and dimension contracts for Bookmarks screen & components.
 * Guarantees compliance with the Sanctuary design system and WCAG 44x44px minimum touch targets.
 */
export const BOOKMARK_COMPONENT_CONTRACTS = {
  minTouchTarget: 44,
  card: {
    borderRadius: 16,
    baseBackground: '#0A261E',
    borderColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    padding: 16,
    emeraldAccent: '#10B981',
    goldAccent: '#F59E0B',
    arabicFontSize: 24,
    arabicLineHeight: 48,
    translationFontSize: 15,
    translationLineHeight: 26,
    noteFontSize: 14,
    noteLineHeight: 22,
  },
  actionButton: {
    size: 44,
    iconSize: 20,
    borderRadius: 22,
  },
  rosetteBadge: {
    outerSize: 36,
    innerSize: 28,
  },
  undoSnackbar: {
    autoDismissMs: 4000,
    minHeight: 48,
    borderRadius: 12,
  },
} as const;

export interface SortOptionItem {
  id: 'date_desc' | 'date_asc' | 'quran_order';
  label: string;
}

export const SORT_OPTIONS: readonly SortOptionItem[] = [
  { id: 'date_desc', label: 'جدیدترین' },
  { id: 'date_asc', label: 'قدیمی‌ترین' },
  { id: 'quran_order', label: 'به ترتیب مصحف' },
] as const;

/**
 * Formats a Persian chapter name into a polite title e.g. "سوره بقره".
 */
export function formatBookmarkChapterTitle(chapterNameFa?: string): string {
  if (!chapterNameFa) return 'سوره قرآن';
  const stripped = chapterNameFa.split('(')[0].trim();
  if (stripped.startsWith('سوره')) {
    return stripped;
  }
  return `سوره ${stripped}`;
}

/**
 * Formats verse number into an Ayah badge with Persian digits e.g. "آیه ۲۵۵".
 */
export function formatBookmarkAyahBadge(verseNumber: number): string {
  return `آیه ${toPersianDigits(verseNumber)}`;
}

/**
 * Formats relative Persian time string from timestamp (e.g. "همین الان", "امروز", "دیروز", "۳ روز پیش").
 */
export function formatRelativeTimeFa(timestamp: number, now: number = Date.now()): string {
  if (!timestamp || timestamp <= 0) return '';
  const diffMs = Math.max(0, now - timestamp);
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) {
    return 'همین الان';
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${toPersianDigits(diffMin)} دقیقه پیش`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    const nowDate = new Date(now);
    const itemDate = new Date(timestamp);
    if (
      nowDate.getDate() === itemDate.getDate() &&
      nowDate.getMonth() === itemDate.getMonth() &&
      nowDate.getFullYear() === itemDate.getFullYear()
    ) {
      return 'امروز';
    }
    return `${toPersianDigits(diffHours)} ساعت پیش`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'دیروز';
  }
  if (diffDays < 7) {
    return `${toPersianDigits(diffDays)} روز پیش`;
  }
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffDays < 30) {
    return `${toPersianDigits(diffWeeks)} هفته پیش`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  if (diffDays < 365) {
    return `${toPersianDigits(diffMonths)} ماه پیش`;
  }
  const diffYears = Math.floor(diffDays / 365);
  return `${toPersianDigits(diffYears)} سال پیش`;
}

/**
 * Generates the deep-link URL and parameter object for navigating to a verse in the reader.
 */
export function createReaderDeepLink(
  chapterId: number,
  verseNumber: number
): { pathname: string; params: { id: string; verse: string } } {
  return {
    pathname: `/surah/${chapterId}`,
    params: {
      id: String(chapterId),
      verse: String(verseNumber),
    },
  };
}

/**
 * Formats a shareable text message with Arabic, translation, and Surah citation.
 */
export function formatBookmarkShareText(
  bookmark: HydratedBookmark,
  translationText?: string
): string {
  const chapterTitle = formatBookmarkChapterTitle(bookmark.chapter_name_fa);
  const ayahBadge = formatBookmarkAyahBadge(bookmark.verse_number);
  const trans = translationText || bookmark.translation_fa_makarem || bookmark.translation_fa_ansarian || '';

  let message = `${bookmark.text_uthmani}\n\n`;
  if (trans) {
    message += `${trans}\n\n`;
  }
  message += `[${chapterTitle} • ${ayahBadge}]`;
  return message;
}

/**
 * Calculates live bookmark counts for each tag in the tags array.
 */
export function calculateTagCounts(
  tags: Tag[],
  bookmarks: HydratedBookmark[]
): Map<string, number> {
  const countMap = new Map<string, number>();
  for (const tag of tags) {
    countMap.set(tag.id, 0);
  }
  for (const b of bookmarks) {
    if (b.tags && Array.isArray(b.tags)) {
      for (const t of b.tags) {
        countMap.set(t.id, (countMap.get(t.id) || 0) + 1);
      }
    }
  }
  return countMap;
}
