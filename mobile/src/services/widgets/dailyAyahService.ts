/**
 * Daily Ayah Curation Service & Deterministic Verse Engine.
 *
 * Provides curated daily Quranic verses for Home Screen Widgets and in-app display.
 * Includes both high-speed offline SQLite lookup (when DB is available) and a
 * deterministic, static fallback dataset of 365+ inspirational verses ensuring
 * native OS widgets never fail even under strict 30 MB memory limits.
 */

import { normalizeQuranArabic } from '../../utils/arabicTextSanitizer.ts';
import { formatRTLText } from '../../theme/rtl.ts';
import { adaptDatabase } from '../db/databaseAdapter.ts';
import type { DailyAyahPayload } from './widgetContracts.ts';
import { CURATED_DAILY_AYAHS, type CuratedDailyAyah } from './curatedDailyAyahs.ts';

export { CURATED_DAILY_AYAHS };
export type { CuratedDailyAyah };

/**
 * Calculates the 1-based day of year (1..366) for any Gregorian date.
 */
export function getDayOfYear(date: Date): number {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const current = new Date(Date.UTC(year, safeDate.getMonth(), safeDate.getDate()));
  return Math.floor((current.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

/**
 * Formats a Date object into standard "YYYY-MM-DD" date key.
 */
export function formatDateKey(date: Date): string {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const month = safeDate.getMonth() + 1;
  const day = safeDate.getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Builds canonical deep link URL for a specific verse.
 */
export function buildAyahDeepLinkUrl(
  surahId: number,
  ayahNumber: number,
  pageNumber: number,
): string {
  return `quranir://surah/${surahId}?verse=${ayahNumber}&page=${pageNumber}`;
}

/**
 * Deterministically returns the curated fallback Ayah for a given calendar date.
 * Uses exact date hash formula: `(year * 365 + dayOfYear) % curatedList.length`.
 */
export function getFallbackDailyAyah(date: Date): DailyAyahPayload {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const dayOfYear = getDayOfYear(safeDate);
  const dateKey = formatDateKey(safeDate);

  const hash = Math.abs(year * 365 + dayOfYear);
  const index = hash % CURATED_DAILY_AYAHS.length;
  const verse = CURATED_DAILY_AYAHS[index];

  return {
    surahId: verse.surahId,
    ayahNumber: verse.ayahNumber,
    surahNameFa: verse.surahNameFa,
    pageNumber: verse.pageNumber,
    arabicText: normalizeQuranArabic(verse.arabicText),
    translationFa: formatRTLText(verse.translationFa),
    translationAuthorFa: verse.translationAuthorFa || 'مکارم شیرازی',
    dateKey,
    deepLinkUrl: buildAyahDeepLinkUrl(verse.surahId, verse.ayahNumber, verse.pageNumber),
  };
}

/**
 * Fetches the Daily Ayah payload for a specific date.
 * If a SQLite database instance is provided, retrieves the full verse record and
 * validates character bounds (Arabic <= 180, Persian <= 250). If DB is unavailable,
 * throws, or produces out-of-bound text, gracefully falls back to the deterministic
 * curated fallback payload.
 */
export async function getDailyAyahForDate(date: Date, db?: unknown): Promise<DailyAyahPayload> {
  const fallback = getFallbackDailyAyah(date);

  if (!db) {
    return fallback;
  }

  try {
    const adapted = adaptDatabase(db);
    const row = await adapted.getFirst<{
      surahId: number;
      ayahNumber: number;
      pageNumber: number;
      arabicText: string;
      translationFa: string;
      surahNameFa: string;
    }>(
      `SELECT v.chapter_id AS surahId,
              v.verse_number AS ayahNumber,
              v.page_number AS pageNumber,
              v.text_uthmani AS arabicText,
              v.translation_fa_makarem AS translationFa,
              c.name_fa AS surahNameFa
       FROM verses v
       JOIN chapters c ON c.id = v.chapter_id
       WHERE v.chapter_id = ? AND v.verse_number = ?
       LIMIT 1`,
      [fallback.surahId, fallback.ayahNumber],
    );

    if (row && row.arabicText && row.translationFa) {
      const sanitizedArabic = normalizeQuranArabic(row.arabicText);
      const sanitizedTranslation = formatRTLText(row.translationFa);

      // Verify medium widget display bounds
      if (sanitizedArabic.length <= 180 && sanitizedTranslation.length <= 250) {
        return {
          surahId: row.surahId,
          ayahNumber: row.ayahNumber,
          surahNameFa: row.surahNameFa || fallback.surahNameFa,
          pageNumber: row.pageNumber,
          arabicText: sanitizedArabic,
          translationFa: sanitizedTranslation,
          translationAuthorFa: 'مکارم شیرازی',
          dateKey: fallback.dateKey,
          deepLinkUrl: buildAyahDeepLinkUrl(row.surahId, row.ayahNumber, row.pageNumber),
        };
      }
    }
  } catch {
    // Graceful memory-safe fallback on any SQLite error
  }

  return fallback;
}
