import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../../../mobile/assets/data/quran.db');

describe('Mobile Quran SQLite Database Tests', () => {
  const db = new DatabaseSync(DB_PATH);

  it('should contain all 114 Surahs with proper metadata', () => {
    const chapters = db.prepare('SELECT * FROM chapters ORDER BY id ASC').all();
    assert.strictEqual(chapters.length, 114);

    const fatihah = chapters[0];
    assert.strictEqual(fatihah.id, 1);
    assert.strictEqual(fatihah.name_arabic, 'الفاتحة');
    assert.ok(fatihah.name_fa.includes('فاتحه'));
    assert.strictEqual(fatihah.verses_count, 7);

    const baqarah = chapters[1];
    assert.strictEqual(baqarah.id, 2);
    assert.strictEqual(baqarah.name_arabic, 'البقرة');
    assert.strictEqual(baqarah.verses_count, 286);
  });

  it('should contain all 6,236 Verses with Uthmani text and translations', () => {
    const countRow = db.prepare('SELECT COUNT(*) as total FROM verses').get();
    assert.strictEqual(countRow.total, 6236);

    const ayah1 = db.prepare('SELECT * FROM verses WHERE verse_key = ?').get('1:1');
    assert.ok(ayah1);
    assert.ok(ayah1.text_uthmani.includes('بِسْمِ'));
    assert.ok(ayah1.translation_fa_makarem.includes('بخشنده'));
    assert.ok(ayah1.translation_fa_ansarian.includes('رحمتش'));
    assert.ok(ayah1.translation_en_saheeh.includes('Mercy'));
  });

  it('should contain 77,430 Words with Persian word-by-word meanings', () => {
    const countRow = db.prepare('SELECT COUNT(*) as total FROM words').get();
    assert.strictEqual(countRow.total, 77430);

    const w1 = db.prepare('SELECT * FROM words WHERE location = ?').get('1:1:1');
    assert.strictEqual(w1.text_uthmani, 'بِسْمِ');
    assert.strictEqual(w1.translation_fa, 'به نام');

    const w2 = db.prepare('SELECT * FROM words WHERE location = ?').get('1:1:2');
    assert.strictEqual(w2.text_uthmani, 'ٱللَّهِ');
    assert.strictEqual(w2.translation_fa, 'خداوند');
  });

  it('should execute lightning-fast FTS5 search in Persian and Arabic', () => {
    const ftsResultsFa = db.prepare(`
      SELECT verse_key, translation_fa FROM search_fts
      WHERE search_fts MATCH ?
      LIMIT 5;
    `).all('بخشنده');
    assert.ok(ftsResultsFa.length > 0);
    assert.strictEqual(ftsResultsFa[0].verse_key, '1:1');

    const ftsResultsAr = db.prepare(`
      SELECT verse_key, text_clean_arabic FROM search_fts
      WHERE search_fts MATCH ?
      LIMIT 5;
    `).all('الله');
    assert.ok(ftsResultsAr.length > 0);
  });
});
