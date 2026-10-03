import type { SearchResult, Chapter } from '../../types/quran.ts';

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

/**
 * Searches Surahs by Persian name, Arabic name, English name, or chapter number.
 */
export async function searchChapters(searchTerm: string, limit: number = 5): Promise<Chapter[]> {
  if (!searchTerm || !searchTerm.trim()) return [];
  const clean = searchTerm.trim();

  // Convert Persian numbers to English if any
  const asciiNum = clean.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const parsedId = parseInt(asciiNum, 10);
  const isNumeric = !isNaN(parsedId) && parsedId >= 1 && parsedId <= 114;

  let db = customDb;
  if (!db) {
    const dbModule = await import('./database.ts');
    db = await dbModule.getDatabase();
  }

  const normalized = normalizeSearchQuery(clean);
  const pattern = `%${normalized}%`;

  const query = `
    SELECT id, slug, name_simple, name_arabic, name_fa, name_en, revelation_place, revelation_order, bismillah_pre, verses_count, pages_start, pages_end
    FROM chapters
    WHERE name_fa LIKE ? OR name_arabic LIKE ? OR name_simple LIKE ? ${isNumeric ? 'OR id = ?' : ''}
    ORDER BY 
      CASE WHEN id = ? THEN 1 WHEN name_fa LIKE ? THEN 2 ELSE 3 END,
      id ASC
    LIMIT ?;
  `;

  const params = isNumeric
    ? [pattern, pattern, pattern, parsedId, parsedId, `${normalized}%`, limit]
    : [pattern, pattern, pattern, -1, `${normalized}%`, limit];

  if (typeof db.getAllAsync === 'function') {
    return await db.getAllAsync(query, params);
  } else if (typeof db.prepare === 'function') {
    return db.prepare(query).all(...params);
  }
  return [];
}
