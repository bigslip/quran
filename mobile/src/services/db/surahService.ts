import { getDatabase } from './database';
import { Chapter, Juz } from '@/types/quran';

/**
 * Fetches all 114 Surahs ordered by revelation or chapter number.
 */
export async function getAllSurahs(orderBy: 'id' | 'revelation_order' = 'id'): Promise<Chapter[]> {
  const db = await getDatabase();
  const query = `SELECT * FROM chapters ORDER BY ${orderBy} ASC;`;
  const results = await db.getAllAsync<Chapter>(query);
  return results;
}

/**
 * Fetches a single Surah by ID (1..114).
 */
export async function getSurahById(id: number): Promise<Chapter | null> {
  const db = await getDatabase();
  const query = `SELECT * FROM chapters WHERE id = ? LIMIT 1;`;
  const result = await db.getFirstAsync<Chapter>(query, [id]);
  return result || null;
}

/**
 * Fetches Surahs in a specific Juz.
 */
export async function getSurahsByJuz(juzNumber: number): Promise<Chapter[]> {
  const db = await getDatabase();
  const query = `
    SELECT DISTINCT c.* FROM chapters c
    JOIN verses v ON v.chapter_id = c.id
    WHERE v.juz_number = ?
    ORDER BY c.id ASC;
  `;
  const results = await db.getAllAsync<Chapter>(query, [juzNumber]);
  return results;
}

/**
 * Fetches all 30 Juzs with page ranges, verse counts, starting Surah metadata, and all contained Surah names.
 */
export async function getAllJuzs(): Promise<Juz[]> {
  const db = await getDatabase();
  const query = `
    WITH juz_meta AS (
      SELECT 
        juz_number,
        MIN(page_number) AS page_start,
        MAX(page_number) AS page_end,
        COUNT(id) AS verses_count,
        MIN(id) AS first_verse_id
      FROM verses
      GROUP BY juz_number
    ),
    juz_surahs AS (
      SELECT 
        v.juz_number,
        GROUP_CONCAT(DISTINCT c.name_fa) AS surah_names_fa,
        GROUP_CONCAT(DISTINCT c.name_arabic) AS surah_names_arabic
      FROM verses v
      JOIN chapters c ON c.id = v.chapter_id
      GROUP BY v.juz_number
    )
    SELECT 
      jm.juz_number,
      jm.page_start,
      jm.page_end,
      jm.verses_count,
      v.chapter_id AS first_chapter_id,
      v.verse_key AS first_verse_key,
      c.name_arabic AS first_surah_name_arabic,
      c.name_fa AS first_surah_name_fa,
      SUBSTR(v.text_uthmani, 1, 60) AS preview_text,
      TRIM(COALESCE(js.surah_names_fa, '') || ',' || COALESCE(js.surah_names_arabic, ''), ',') AS surah_names_text
    FROM juz_meta jm
    JOIN verses v ON v.id = jm.first_verse_id
    JOIN chapters c ON c.id = v.chapter_id
    LEFT JOIN juz_surahs js ON js.juz_number = jm.juz_number
    ORDER BY jm.juz_number ASC;
  `;
  const results = await db.getAllAsync<Juz>(query);
  return results.map((row: Juz) => ({
    ...row,
    surah_names: row.surah_names_text
      ? row.surah_names_text.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
  }));
}

