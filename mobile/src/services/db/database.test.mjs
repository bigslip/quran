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

  it('should retrieve all 30 Juzs with valid page ranges, verse counts, and starting Surahs', () => {
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
        SUBSTR(v.text_uthmani, 1, 60) AS preview_text
      FROM juz_meta jm
      JOIN verses v ON v.id = jm.first_verse_id
      JOIN chapters c ON c.id = v.chapter_id
      ORDER BY jm.juz_number ASC;
    `;
    const juzs = db.prepare(query).all();

    // Verify exactly 30 Juzs
    assert.strictEqual(juzs.length, 30);

    // Verify Juz 1 boundary & metadata
    const juz1 = juzs[0];
    assert.strictEqual(juz1.juz_number, 1);
    assert.strictEqual(juz1.page_start, 1);
    assert.strictEqual(juz1.page_end, 21);
    assert.strictEqual(juz1.verses_count, 148);
    assert.strictEqual(juz1.first_chapter_id, 1);
    assert.strictEqual(juz1.first_verse_key, '1:1');
    assert.strictEqual(juz1.first_surah_name_arabic, 'الفاتحة');
    assert.ok(juz1.first_surah_name_fa.includes('فاتحه'));
    assert.ok(juz1.preview_text.length > 0);

    // Verify Juz 30 boundary & metadata
    const juz30 = juzs[29];
    assert.strictEqual(juz30.juz_number, 30);
    assert.strictEqual(juz30.page_start, 582);
    assert.strictEqual(juz30.page_end, 604);
    assert.strictEqual(juz30.verses_count, 564);
    assert.strictEqual(juz30.first_chapter_id, 78);
    assert.strictEqual(juz30.first_verse_key, '78:1');
    assert.strictEqual(juz30.first_surah_name_arabic, 'النبإ');
    assert.ok(juz30.first_surah_name_fa.includes('نبأ'));
    assert.ok(juz30.preview_text.length > 0);

    // Verify properties across all 30 Juzs
    let totalVerses = 0;
    for (let i = 0; i < 30; i++) {
      const juz = juzs[i];
      assert.strictEqual(juz.juz_number, i + 1);
      assert.ok(juz.page_start >= 1 && juz.page_start <= 604);
      assert.ok(juz.page_end >= juz.page_start && juz.page_end <= 604);
      assert.ok(juz.verses_count > 0);
      assert.ok(juz.first_chapter_id >= 1 && juz.first_chapter_id <= 114);
      assert.ok(typeof juz.first_verse_key === 'string' && juz.first_verse_key.includes(':'));
      assert.ok(typeof juz.first_surah_name_arabic === 'string' && juz.first_surah_name_arabic.length > 0);
      assert.ok(typeof juz.first_surah_name_fa === 'string' && juz.first_surah_name_fa.length > 0);
      assert.ok(typeof juz.preview_text === 'string' && juz.preview_text.length > 0);
      totalVerses += juz.verses_count;
    }
    assert.strictEqual(totalVerses, 6236);
  });
});
