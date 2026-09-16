import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
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

  it('should retrieve all 30 Juzs with valid page ranges, verse counts, starting Surahs, and contained Surahs', () => {
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
    assert.ok(juz1.surah_names_text.includes('فاتحه'));
    assert.ok(juz1.surah_names_text.includes('بقره'));

    // Verify Juz 2 contains Al-Baqarah
    const juz2 = juzs[1];
    assert.ok(juz2.surah_names_text.includes('بقره'));

    // Verify Juz 3 contains Al-Baqarah and Ali Imran
    const juz3 = juzs[2];
    assert.ok(juz3.surah_names_text.includes('بقره'));
    assert.ok(juz3.surah_names_text.includes('عمران'));

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
    assert.ok(juz30.surah_names_text.includes('نبأ') || juz30.surah_names_text.includes('نبا'));
    assert.ok(juz30.surah_names_text.includes('اخلاص'));
    assert.ok(juz30.surah_names_text.includes('فلق'));
    assert.ok(juz30.surah_names_text.includes('ناس'));
    assert.ok(juz30.surah_names_text.includes('کافرون') || juz30.surah_names_text.includes('كافرون'));

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
      assert.ok(typeof juz.surah_names_text === 'string' && juz.surah_names_text.length > 0);
      totalVerses += juz.verses_count;
    }
    assert.strictEqual(totalVerses, 6236);
  });

  it('should correctly order Surahs by canonical id vs revelation_order', () => {
    // 1. Order by canonical id ASC
    const byId = db.prepare('SELECT * FROM chapters ORDER BY id ASC;').all();
    assert.strictEqual(byId.length, 114);
    assert.strictEqual(byId[0].id, 1);
    assert.strictEqual(byId[0].name_arabic, 'الفاتحة');
    assert.strictEqual(byId[0].revelation_order, 5);

    assert.strictEqual(byId[1].id, 2);
    assert.strictEqual(byId[1].name_arabic, 'البقرة');

    assert.strictEqual(byId[113].id, 114);
    assert.strictEqual(byId[113].name_arabic, 'الناس');

    // Verify all 1..114 are strictly monotonic by id
    for (let i = 0; i < 114; i++) {
      assert.strictEqual(byId[i].id, i + 1);
    }

    // 2. Order by revelation_order ASC
    const byRev = db.prepare('SELECT * FROM chapters ORDER BY revelation_order ASC;').all();
    assert.strictEqual(byRev.length, 114);

    // 1st revealed Surah: Al-Alaq (id 96, revelation_order 1)
    assert.strictEqual(byRev[0].id, 96);
    assert.strictEqual(byRev[0].revelation_order, 1);
    assert.strictEqual(byRev[0].name_arabic, 'العلق');

    // 2nd revealed Surah: Al-Qalam (id 68, revelation_order 2)
    assert.strictEqual(byRev[1].id, 68);
    assert.strictEqual(byRev[1].revelation_order, 2);
    assert.strictEqual(byRev[1].name_arabic, 'القلم');

    // 3rd revealed Surah: Al-Muzzammil (id 73, revelation_order 3)
    assert.strictEqual(byRev[2].id, 73);
    assert.strictEqual(byRev[2].revelation_order, 3);

    // 4th revealed Surah: Al-Muddaththir (id 74, revelation_order 4)
    assert.strictEqual(byRev[3].id, 74);
    assert.strictEqual(byRev[3].revelation_order, 4);

    // 5th revealed Surah: Al-Fatihah (id 1, revelation_order 5)
    assert.strictEqual(byRev[4].id, 1);
    assert.strictEqual(byRev[4].revelation_order, 5);

    // Last revealed Surah: An-Nasr (id 110, revelation_order 114)
    assert.strictEqual(byRev[113].id, 110);
    assert.strictEqual(byRev[113].revelation_order, 114);
    assert.strictEqual(byRev[113].name_arabic, 'النصر');

    // Verify all 1..114 revelation ranks are strictly monotonic without duplicates or gaps
    for (let i = 0; i < 114; i++) {
      assert.strictEqual(byRev[i].revelation_order, i + 1);
    }

    // Ensure both arrays contain the exact same set of chapters
    const setById = new Set(byId.map((c) => c.id));
    const setByRev = new Set(byRev.map((c) => c.id));
    assert.strictEqual(setById.size, 114);
    assert.strictEqual(setByRev.size, 114);
    for (let id = 1; id <= 114; id++) {
      assert.ok(setById.has(id));
      assert.ok(setByRev.has(id));
    }
  });

  it('should query Surahs by Juz accurately (getSurahsByJuz)', () => {
    const getSurahsByJuzQuery = `
      SELECT DISTINCT c.* FROM chapters c
      JOIN verses v ON v.chapter_id = c.id
      WHERE v.juz_number = ?
      ORDER BY c.id ASC;
    `;

    // Juz 1: Contains Al-Fatihah (1) and Al-Baqarah (2)
    const juz1Surahs = db.prepare(getSurahsByJuzQuery).all(1);
    assert.strictEqual(juz1Surahs.length, 2);
    assert.strictEqual(juz1Surahs[0].id, 1);
    assert.strictEqual(juz1Surahs[1].id, 2);

    // Juz 2: Contains only Al-Baqarah (2)
    const juz2Surahs = db.prepare(getSurahsByJuzQuery).all(2);
    assert.strictEqual(juz2Surahs.length, 1);
    assert.strictEqual(juz2Surahs[0].id, 2);

    // Juz 3: Contains Al-Baqarah (2) and Ali 'Imran (3)
    const juz3Surahs = db.prepare(getSurahsByJuzQuery).all(3);
    assert.strictEqual(juz3Surahs.length, 2);
    assert.strictEqual(juz3Surahs[0].id, 2);
    assert.strictEqual(juz3Surahs[1].id, 3);

    // Juz 30: Contains 37 Surahs from 78 (An-Naba) to 114 (An-Nas)
    const juz30Surahs = db.prepare(getSurahsByJuzQuery).all(30);
    assert.strictEqual(juz30Surahs.length, 37);
    assert.strictEqual(juz30Surahs[0].id, 78);
    assert.strictEqual(juz30Surahs[36].id, 114);
    for (let i = 0; i < 37; i++) {
      assert.strictEqual(juz30Surahs[i].id, 78 + i);
    }
  });

  describe('Page-based Reading Engine Queries (getVersesByPage & getPageWords)', () => {
    function getVersesByPage(pageNumber) {
      const versesQuery = `
        SELECT * FROM verses
        WHERE page_number = ?
        ORDER BY id ASC;
      `;
      const verses = db.prepare(versesQuery).all(pageNumber);

      if (verses.length > 0) {
        const wordsQuery = `
          SELECT * FROM words
          WHERE page_number = ?
          ORDER BY line_number ASC, position ASC;
        `;
        const allWords = db.prepare(wordsQuery).all(pageNumber);

        const wordsByVerse = new Map();
        for (const w of allWords) {
          if (!wordsByVerse.has(w.verse_key)) {
            wordsByVerse.set(w.verse_key, []);
          }
          wordsByVerse.get(w.verse_key).push(w);
        }

        for (const v of verses) {
          v.words = wordsByVerse.get(v.verse_key) || [];
        }
      }

      return verses;
    }

    function getPageWords(pageNumber) {
      const wordsQuery = `
        SELECT * FROM words
        WHERE page_number = ?
        ORDER BY line_number ASC, position ASC;
      `;
      return db.prepare(wordsQuery).all(pageNumber);
    }

    it('should correctly return verses for Page 1 (Al-Fatihah 1:1..1:7), Page 2 (Al-Baqarah 2:1..2:5), and Page 604 (Al-Ikhlas, Al-Falaq, An-Nas)', () => {
      // 1. Page 1: Al-Fatihah (1:1 .. 1:7)
      const page1Verses = getVersesByPage(1);
      assert.strictEqual(page1Verses.length, 7);
      assert.strictEqual(page1Verses[0].verse_key, '1:1');
      assert.strictEqual(page1Verses[6].verse_key, '1:7');
      assert.deepStrictEqual(
        page1Verses.map((v) => v.verse_key),
        ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7']
      );
      for (const v of page1Verses) {
        assert.strictEqual(v.page_number, 1);
        assert.strictEqual(v.chapter_id, 1);
        assert.ok(Array.isArray(v.words) && v.words.length > 0);
      }
      // 1:1 has 4 words ('بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَـٰنِ', 'ٱلرَّحِيمِ')
      assert.strictEqual(page1Verses[0].words.length, 4);
      assert.strictEqual(page1Verses[0].words[0].text_uthmani, 'بِسْمِ');

      // 2. Page 2: Al-Baqarah (2:1 .. 2:5)
      const page2Verses = getVersesByPage(2);
      assert.strictEqual(page2Verses.length, 5);
      assert.strictEqual(page2Verses[0].verse_key, '2:1');
      assert.strictEqual(page2Verses[4].verse_key, '2:5');
      assert.deepStrictEqual(
        page2Verses.map((v) => v.verse_key),
        ['2:1', '2:2', '2:3', '2:4', '2:5']
      );
      for (const v of page2Verses) {
        assert.strictEqual(v.page_number, 2);
        assert.strictEqual(v.chapter_id, 2);
        assert.ok(Array.isArray(v.words) && v.words.length > 0);
      }
      // 2:1 is 'الٓمٓ' (1 word)
      assert.strictEqual(page2Verses[0].words.length, 1);
      assert.strictEqual(page2Verses[0].words[0].text_uthmani, 'الٓمٓ');

      // 3. Page 604: Al-Ikhlas (112:1..112:4), Al-Falaq (113:1..113:5), An-Nas (114:1..114:6)
      const page604Verses = getVersesByPage(604);
      assert.strictEqual(page604Verses.length, 15);
      assert.strictEqual(page604Verses[0].verse_key, '112:1');
      assert.strictEqual(page604Verses[3].verse_key, '112:4');
      assert.strictEqual(page604Verses[4].verse_key, '113:1');
      assert.strictEqual(page604Verses[8].verse_key, '113:5');
      assert.strictEqual(page604Verses[9].verse_key, '114:1');
      assert.strictEqual(page604Verses[14].verse_key, '114:6');

      const chapterIdsOn604 = [...new Set(page604Verses.map((v) => v.chapter_id))];
      assert.deepStrictEqual(chapterIdsOn604, [112, 113, 114]);
      for (const v of page604Verses) {
        assert.strictEqual(v.page_number, 604);
        assert.ok(Array.isArray(v.words) && v.words.length > 0);
      }

      // Empty results for non-existent pages
      assert.deepStrictEqual(getVersesByPage(0), []);
      assert.deepStrictEqual(getVersesByPage(605), []);
    });

    it('should return all words for Page 1 with valid line_number and position (getPageWords: Page 1)', () => {
      const page1Words = getPageWords(1);
      assert.strictEqual(page1Words.length, 29);

      // Verify all words have page_number 1 and valid line_number and position
      for (let i = 0; i < page1Words.length; i++) {
        const w = page1Words[i];
        assert.strictEqual(w.page_number, 1);
        assert.strictEqual(typeof w.line_number, 'number');
        assert.ok(w.line_number >= 1 && w.line_number <= 15);
        assert.strictEqual(typeof w.position, 'number');
        assert.ok(w.position >= 1);
      }

      // First word: Bismillah
      assert.strictEqual(page1Words[0].verse_key, '1:1');
      assert.strictEqual(page1Words[0].position, 1);
      assert.strictEqual(page1Words[0].line_number, 9);
      assert.strictEqual(page1Words[0].text_uthmani, 'بِسْمِ');

      // Last word: Ad-Dallin
      const lastWord = page1Words[page1Words.length - 1];
      assert.strictEqual(lastWord.verse_key, '1:7');
      assert.strictEqual(lastWord.position, 9);
      assert.strictEqual(lastWord.line_number, 15);
      assert.strictEqual(lastWord.text_uthmani, 'ٱلضَّآلِّينَ');

      // Verify ordering is monotonic by line_number ASC, then position within line
      for (let i = 0; i < page1Words.length - 1; i++) {
        const curr = page1Words[i];
        const next = page1Words[i + 1];
        assert.ok(
          curr.line_number < next.line_number ||
            (curr.line_number === next.line_number &&
              (curr.verse_key !== next.verse_key || curr.position <= next.position))
        );
      }
    });

    it('should ensure word counts from getPageWords match hydrated verse words across pages', () => {
      const testPages = [1, 2, 3, 21, 582, 604];

      for (const page of testPages) {
        const pageWords = getPageWords(page);
        const pageVerses = getVersesByPage(page);

        // Sum words across all hydrated verses on the page
        const totalVerseWords = pageVerses.reduce((acc, v) => acc + (v.words?.length || 0), 0);
        assert.strictEqual(
          pageWords.length,
          totalVerseWords,
          `Word count mismatch on page ${page}: getPageWords=${pageWords.length} vs verse words=${totalVerseWords}`
        );

        // Verify set of word IDs from getPageWords matches all hydrated verse words
        const flattenedVerseWords = pageVerses.flatMap((v) => v.words);
        assert.strictEqual(flattenedVerseWords.length, pageWords.length);

        const pageWordIds = new Set(pageWords.map((w) => w.id));
        const verseWordIds = new Set(flattenedVerseWords.map((w) => w.id));
        assert.strictEqual(pageWordIds.size, verseWordIds.size);
        for (const id of pageWordIds) {
          assert.ok(verseWordIds.has(id));
        }
      }
    });

    it('should verify verseService.ts exports getVersesByPage and getPageWords with correct signatures', () => {
      const serviceFilePath = path.resolve(__dirname, 'verseService.ts');
      const serviceCode = fs.readFileSync(serviceFilePath, 'utf8');

      assert.ok(serviceCode.includes('export async function getVersesByPage(pageNumber: number): Promise<Verse[]>'));
      assert.ok(serviceCode.includes('export async function getPageWords(pageNumber: number): Promise<Word[]>'));
      assert.ok(serviceCode.includes('SELECT * FROM verses'));
      assert.ok(serviceCode.includes('WHERE page_number = ?'));
      assert.ok(serviceCode.includes('ORDER BY id ASC'));
      assert.ok(serviceCode.includes('SELECT * FROM words'));
      assert.ok(serviceCode.includes('ORDER BY line_number ASC, position ASC'));
    });

    it('should verify useReadingStore state properties, defaults, and setters contract', () => {
      const storeFilePath = path.resolve(__dirname, '../../stores/useReadingStore.ts');
      const storeCode = fs.readFileSync(storeFilePath, 'utf8');

      // State properties
      assert.ok(storeCode.includes("viewMode: 'continuous' | 'mushaf'"));
      assert.ok(storeCode.includes("quranFont: 'hafs' | 'indopak'"));
      assert.ok(storeCode.includes('activeVerseKey: string | null'));
      assert.ok(storeCode.includes('isPlaying: boolean'));
      assert.ok(storeCode.includes("activeTranslation: 'makarem' | 'ansarian' | 'both'"));

      // Setters interface
      assert.ok(storeCode.includes("setViewMode: (mode: 'continuous' | 'mushaf') => void"));
      assert.ok(storeCode.includes("setQuranFont: (font: 'hafs' | 'indopak') => void"));
      assert.ok(storeCode.includes('setActiveVerseKey: (key: string | null) => void'));
      assert.ok(storeCode.includes('setIsPlaying: (playing: boolean) => void'));
      assert.ok(storeCode.includes("setActiveTranslation: (translation: 'makarem' | 'ansarian' | 'both') => void"));

      // Defaults
      assert.ok(storeCode.includes("viewMode: 'continuous'"));
      assert.ok(storeCode.includes("quranFont: 'hafs'"));
      assert.ok(storeCode.includes('activeVerseKey: null'));
      assert.ok(storeCode.includes('isPlaying: false'));
      assert.ok(storeCode.includes("activeTranslation: 'makarem'"));

      // Action implementations
      assert.ok(storeCode.includes('setViewMode: (viewMode) => set({ viewMode })'));
      assert.ok(storeCode.includes('setQuranFont: (quranFont) => set({ quranFont })'));
      assert.ok(storeCode.includes('setActiveVerseKey: (activeVerseKey) => set({ activeVerseKey })'));
      assert.ok(storeCode.includes('setIsPlaying: (isPlaying) => set({ isPlaying })'));
      assert.ok(storeCode.includes('setActiveTranslation: (activeTranslation) => set({ activeTranslation })'));
    });
  });
});

