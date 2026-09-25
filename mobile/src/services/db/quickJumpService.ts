import { adaptDatabase, type SQLiteLikeDb } from './databaseAdapter.ts';
import type { JumpDestination, JuzCardInfo } from './quickJumpContracts.ts';

let customDatabaseInstance: any = null;
let cachedJuzCards: JuzCardInfo[] | null = null;

/**
 * Sets a custom database instance (e.g. Node DatabaseSync in tests or custom provider).
 */
export function setQuickJumpDatabase(db: SQLiteLikeDb | any | null): void {
  customDatabaseInstance = db;
  cachedJuzCards = null;
}

/**
 * Resets the active database instance and clears cached Juz cards (primarily for testing).
 */
export function resetQuickJumpDatabaseForTesting(): void {
  customDatabaseInstance = null;
  cachedJuzCards = null;
}

/**
 * Internal helper to resolve the active database instance.
 */
async function getActiveDb(): Promise<SQLiteLikeDb> {
  if (customDatabaseInstance) {
    return adaptDatabase(customDatabaseInstance);
  }

  try {
    const dbModule = typeof require !== 'undefined' ? require('./database') : null;
    if (dbModule && typeof dbModule.getDatabase === 'function') {
      const expoDb = await dbModule.getDatabase();
      return adaptDatabase(expoDb);
    }
    throw new Error('No database module found');
  } catch {
    throw new Error(
      'No active database provider found for quickJumpService. Call setQuickJumpDatabase(db) or ensure getDatabase() is available.',
    );
  }
}

/**
 * Resolves destination for a specific Surah (1..114) and Ayah.
 * Automatically clamps inputs to valid Surah range (1..114) and verse count (1..chapter.verses_count).
 */
export async function resolveAyahDestination(
  chapterId: number,
  verseNumber: number,
): Promise<JumpDestination> {
  const db = await getActiveDb();
  const clampedChapterId = Math.min(114, Math.max(1, Math.floor(chapterId) || 1));

  const chapter = await db.getFirst<{
    id: number;
    name_arabic: string;
    name_fa: string;
    verses_count: number;
  }>('SELECT id, name_arabic, name_fa, verses_count FROM chapters WHERE id = ? LIMIT 1;', [
    clampedChapterId,
  ]);

  if (!chapter) {
    throw new Error(`Chapter not found for id: ${clampedChapterId}`);
  }

  const clampedVerseNumber = Math.min(
    chapter.verses_count,
    Math.max(1, Math.floor(verseNumber) || 1),
  );

  const verse = await db.getFirst<{
    id: number;
    chapter_id: number;
    verse_number: number;
    verse_key: string;
    page_number: number;
    juz_number: number;
  }>(
    'SELECT id, chapter_id, verse_number, verse_key, page_number, juz_number FROM verses WHERE chapter_id = ? AND verse_number = ? LIMIT 1;',
    [clampedChapterId, clampedVerseNumber],
  );

  if (!verse) {
    throw new Error(`Verse not found for ${clampedChapterId}:${clampedVerseNumber}`);
  }

  return {
    chapterId: clampedChapterId,
    verseNumber: clampedVerseNumber,
    pageNumber: verse.page_number,
    juzNumber: verse.juz_number,
    verseKey: verse.verse_key,
    chapterNameArabic: chapter.name_arabic,
    chapterNameFa: chapter.name_fa,
    totalVerses: chapter.verses_count,
  };
}

/**
 * Resolves destination for a given Page (1..604).
 * Returns the first verse located on that page. Clamps input to 1..604.
 */
export async function resolvePageDestination(pageNumber: number): Promise<JumpDestination> {
  const db = await getActiveDb();
  const clampedPage = Math.min(604, Math.max(1, Math.floor(pageNumber) || 1));

  const row = await db.getFirst<{
    chapter_id: number;
    verse_number: number;
    verse_key: string;
    page_number: number;
    juz_number: number;
    name_arabic: string;
    name_fa: string;
    verses_count: number;
  }>(
    `SELECT 
      v.chapter_id,
      v.verse_number,
      v.verse_key,
      v.page_number,
      v.juz_number,
      c.name_arabic,
      c.name_fa,
      c.verses_count
    FROM verses v
    JOIN chapters c ON c.id = v.chapter_id
    WHERE v.page_number = ?
    ORDER BY v.id ASC
    LIMIT 1;`,
    [clampedPage],
  );

  if (!row) {
    throw new Error(`No verses found on page: ${clampedPage}`);
  }

  return {
    chapterId: row.chapter_id,
    verseNumber: row.verse_number,
    pageNumber: row.page_number,
    juzNumber: row.juz_number,
    verseKey: row.verse_key,
    chapterNameArabic: row.name_arabic,
    chapterNameFa: row.name_fa,
    totalVerses: row.verses_count,
  };
}

/**
 * Resolves destination for a given Juz (1..30).
 * Returns the opening verse of that Juz. Clamps input to 1..30.
 */
export async function resolveJuzDestination(juzNumber: number): Promise<JumpDestination> {
  const db = await getActiveDb();
  const clampedJuz = Math.min(30, Math.max(1, Math.floor(juzNumber) || 1));

  const row = await db.getFirst<{
    chapter_id: number;
    verse_number: number;
    verse_key: string;
    page_number: number;
    juz_number: number;
    name_arabic: string;
    name_fa: string;
    verses_count: number;
  }>(
    `SELECT 
      v.chapter_id,
      v.verse_number,
      v.verse_key,
      v.page_number,
      v.juz_number,
      c.name_arabic,
      c.name_fa,
      c.verses_count
    FROM verses v
    JOIN chapters c ON c.id = v.chapter_id
    WHERE v.juz_number = ?
    ORDER BY v.id ASC
    LIMIT 1;`,
    [clampedJuz],
  );

  if (!row) {
    throw new Error(`No verses found in juz: ${clampedJuz}`);
  }

  return {
    chapterId: row.chapter_id,
    verseNumber: row.verse_number,
    pageNumber: row.page_number,
    juzNumber: row.juz_number,
    verseKey: row.verse_key,
    chapterNameArabic: row.name_arabic,
    chapterNameFa: row.name_fa,
    totalVerses: row.verses_count,
  };
}

/**
 * Retrieves cards for all 30 Juzs with start Surah metadata, start page, and verse count.
 * In-memory cached after first load.
 */
export async function getAllJuzCards(): Promise<JuzCardInfo[]> {
  if (cachedJuzCards) {
    return cachedJuzCards;
  }

  const db = await getActiveDb();
  const query = `
    WITH juz_meta AS (
      SELECT 
        juz_number,
        MIN(page_number) AS start_page,
        COUNT(id) AS verse_count,
        MIN(id) AS first_verse_id
      FROM verses
      GROUP BY juz_number
    )
    SELECT 
      jm.juz_number AS juzNumber,
      v.chapter_id AS startChapterId,
      v.verse_number AS startVerseNumber,
      jm.start_page AS startPageNumber,
      jm.verse_count AS verseCount,
      c.name_arabic AS firstSurahNameArabic,
      c.name_fa AS firstSurahNameFa
    FROM juz_meta jm
    JOIN verses v ON v.id = jm.first_verse_id
    JOIN chapters c ON c.id = v.chapter_id
    ORDER BY jm.juz_number ASC;
  `;

  const rows = await db.getAll<JuzCardInfo>(query);
  cachedJuzCards = rows;
  return rows;
}
