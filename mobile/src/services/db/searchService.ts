import { getDatabase } from './database';
import { SearchResult } from '@/types/quran';

/**
 * Normalizes query string for FTS matching.
 */
function sanitizeFtsQuery(query: string): string {
  const clean = query
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
    .trim();
  if (!clean) return '';
  return `"${clean}"*`;
}

/**
 * Executes full-text search across Quranic verses and Persian translations.
 */
export async function searchQuran(searchTerm: string, limit: number = 30): Promise<SearchResult[]> {
  const sanitized = sanitizeFtsQuery(searchTerm);
  if (!sanitized) return [];

  const db = await getDatabase();
  const query = `
    SELECT 
      f.verse_key,
      f.chapter_id,
      f.verse_number,
      f.text_clean_arabic,
      f.translation_fa,
      f.translation_en,
      c.name_fa AS chapter_name_fa,
      c.name_arabic AS chapter_name_arabic
    FROM search_fts f
    JOIN chapters c ON c.id = f.chapter_id
    WHERE search_fts MATCH ?
    ORDER BY rank
    LIMIT ?;
  `;

  const results = await db.getAllAsync<SearchResult>(query, [sanitized, limit]);
  return results;
}
