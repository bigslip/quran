import type { SearchResult } from '../../types/quran.ts';

let customDb: any = null;

export function setSearchDatabase(db: any): void {
  customDb = db;
}

/**
 * Normalizes Arabic and Persian text by stripping diacritics and unifying letterforms.
 * Matches the indexing logic used during FTS5 SQLite table generation.
 */
export function normalizeSearchQuery(text: string): string {
  if (!text) return '';
  return text
    .replace(/\u0670/g, 'ا') // dagger alif represents long vowel alif in imlaei (e.g. الرحمٰن -> الرحمان)
    .replace(/[\u064B-\u065F\u06D6-\u06ED]/g, '') // remove tashkeel & Quranic marks
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u200C\u200D]/g, ' ') // nim-faseleh to space
    .trim();
}

/**
 * Normalizes query string for FTS matching into quoted prefix tokens.
 */
export function sanitizeFtsQuery(query: string): string {
  const normalized = normalizeSearchQuery(query);
  const clean = normalized.replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '').trim();
  if (!clean) return '';

  const tokens = clean.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';
  return tokens.map((t) => `"${t}"*`).join(' ');
}

/**
 * Executes full-text search across Quranic verses and Persian translations.
 */
export async function searchQuran(searchTerm: string, limit: number = 30): Promise<SearchResult[]> {
  const sanitized = sanitizeFtsQuery(searchTerm);
  if (!sanitized) return [];

  let db = customDb;
  if (!db) {
    const dbModule = await import('./database.ts');
    db = await dbModule.getDatabase();
  }

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

  if (typeof db.getAllAsync === 'function') {
    return await db.getAllAsync(query, [sanitized, limit]);
  } else if (typeof db.prepare === 'function') {
    return db.prepare(query).all(sanitized, limit);
  }
  return [];
}
