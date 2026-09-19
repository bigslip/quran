import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeFtsQuery, normalizeSearchQuery } from './searchService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../../assets/data/quran.db');

describe('FTS Search Query Normalization & Service Tests', () => {
  it('should normalize Arabic and Persian text by stripping diacritics and unifying letters', () => {
    // Strips tashkeel and maps dagger alif
    assert.strictEqual(normalizeSearchQuery('بِسْمِ'), 'بسم');
    assert.strictEqual(normalizeSearchQuery('الرَّحْمَٰنِ'), 'الرحمان');

    // Normalizes Alef forms (إ أ آ ٱ -> ا)
    assert.strictEqual(normalizeSearchQuery('إِنَّا'), 'انا');
    assert.strictEqual(normalizeSearchQuery('آمَنُوا'), 'امنوا');

    // Normalizes Arabic Yeh/Kaf to Persian Yeh/Kaf
    assert.strictEqual(normalizeSearchQuery('كتاب'), 'کتاب');
    assert.strictEqual(normalizeSearchQuery('علی'), 'علی');
  });

  it('should format clean multi-token FTS query', () => {
    const fts = sanitizeFtsQuery('بِسْمِ اللَّهِ');
    assert.strictEqual(fts, '"بسم"* "الله"*');
  });

  it('should return matching verses from search_fts even when user inputs text with full harakat', () => {
    const db = new DatabaseSync(dbPath, { readOnly: true });
    const ftsQuery = sanitizeFtsQuery('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');

    const rows = db
      .prepare(
        `
      SELECT verse_key, text_clean_arabic FROM search_fts
      WHERE search_fts MATCH ?
      LIMIT 1;
    `,
      )
      .all(ftsQuery);

    db.close();
    assert.ok(rows.length > 0, 'Query with harakat should match Al-Fatihah 1:1');
    assert.strictEqual(rows[0].verse_key, '1:1');
  });
});
