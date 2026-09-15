import { getDatabase } from './database';
import { Chapter } from '@/types/quran';

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
