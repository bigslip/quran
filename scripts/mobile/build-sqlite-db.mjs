import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const QDC_DIR = path.join(DATA_DIR, 'qdc');
const OUTPUT_DB_PATH = path.join(ROOT_DIR, 'mobile/assets/data/quran.db');

// Clean diacritics and normalize for Arabic/Persian FTS
function normalizeArabicText(text) {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove tashkeel & Quranic marks
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u200C\u200D]/g, ' ') // nim-faseleh to space
    .trim();
}

function normalizePersianText(text) {
  if (!text) return '';
  return text
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u200C\u200D]/g, ' ')
    .trim();
}

async function buildQuranDatabase() {
  console.log('🚀 Starting Quran SQLite Database Pre-bundler...');
  const startTime = Date.now();

  // Remove existing DB file if present
  if (fs.existsSync(OUTPUT_DB_PATH)) {
    fs.unlinkSync(OUTPUT_DB_PATH);
  }

  const db = new DatabaseSync(OUTPUT_DB_PATH);

  // Optimize SQLite PRAGMAs for fast bulk insert and mobile read speed
  db.exec('PRAGMA journal_mode = OFF;');
  db.exec('PRAGMA synchronous = OFF;');
  db.exec('PRAGMA page_size = 4096;');
  db.exec('PRAGMA cache_size = 10000;');

  console.log('📦 Creating database tables...');

  db.exec(`
    CREATE TABLE chapters (
      id INTEGER PRIMARY KEY,
      slug TEXT NOT NULL,
      name_simple TEXT NOT NULL,
      name_arabic TEXT NOT NULL,
      name_fa TEXT NOT NULL,
      name_en TEXT NOT NULL,
      revelation_place TEXT NOT NULL,
      revelation_order INTEGER NOT NULL,
      bismillah_pre INTEGER NOT NULL,
      verses_count INTEGER NOT NULL,
      pages_start INTEGER NOT NULL,
      pages_end INTEGER NOT NULL
    );

    CREATE TABLE verses (
      id INTEGER PRIMARY KEY,
      chapter_id INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      verse_key TEXT UNIQUE NOT NULL,
      page_number INTEGER NOT NULL,
      juz_number INTEGER NOT NULL,
      hizb_number INTEGER NOT NULL,
      rub_el_hizb_number INTEGER NOT NULL,
      ruku_number INTEGER,
      manzil_number INTEGER,
      sajdah_number INTEGER,
      text_uthmani TEXT NOT NULL,
      text_imlaei TEXT,
      text_indopak TEXT,
      translation_fa_makarem TEXT,
      translation_fa_ansarian TEXT,
      translation_en_saheeh TEXT,
      FOREIGN KEY (chapter_id) REFERENCES chapters (id)
    );

    CREATE TABLE words (
      id INTEGER PRIMARY KEY,
      verse_key TEXT NOT NULL,
      chapter_id INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      position INTEGER NOT NULL,
      location TEXT NOT NULL,
      text_uthmani TEXT NOT NULL,
      qpc_uthmani_hafs TEXT,
      text_indopak TEXT,
      text_imlaei_simple TEXT,
      translation_fa TEXT,
      translation_en TEXT,
      audio_url TEXT,
      page_number INTEGER,
      line_number INTEGER,
      FOREIGN KEY (chapter_id) REFERENCES chapters (id)
    );

    CREATE VIRTUAL TABLE search_fts USING fts5(
      verse_key UNINDEXED,
      chapter_id UNINDEXED,
      verse_number UNINDEXED,
      text_clean_arabic,
      translation_fa,
      translation_en
    );
  `);

  console.log('📖 Loading metadata, translations, and word datasets...');

  // 1. Load chapters
  const chaptersQdcPath = path.join(QDC_DIR, 'chapters.json');
  const chaptersFaPath = path.join(DATA_DIR, 'chapters/fa.json');
  const chaptersEnPath = path.join(DATA_DIR, 'chapters/en.json');

  const qdcChapters = JSON.parse(fs.readFileSync(chaptersQdcPath, 'utf8')).chapters;
  const faChapters = JSON.parse(fs.readFileSync(chaptersFaPath, 'utf8'));
  const enChapters = JSON.parse(fs.readFileSync(chaptersEnPath, 'utf8'));

  // 2. Load Translations
  console.log('📝 Loading verse translations (Makarem, Ansarian, Abdel Haleem)...');
  const makaremRaw = JSON.parse(fs.readFileSync(path.join(QDC_DIR, 'translations/841.json'), 'utf8'));
  const ansarianRaw = JSON.parse(fs.readFileSync(path.join(QDC_DIR, 'translations/842.json'), 'utf8'));
  const haleemRaw = JSON.parse(fs.readFileSync(path.join(QDC_DIR, 'translations/85.json'), 'utf8'));

  const getTranslationText = (rawObj, verseKey) => {
    if (!rawObj) return '';
    if (rawObj.byVerseKey && rawObj.byVerseKey[verseKey]) {
      return rawObj.byVerseKey[verseKey].text || '';
    }
    if (rawObj.translations) {
      const match = rawObj.translations.find((t) => t.verse_key === verseKey);
      if (match) return match.text || '';
    }
    return '';
  };

  // 3. Load Persian Word-by-Word
  console.log('🔍 Loading Persian Word-by-Word dictionary...');
  const wbwFaPath = path.join(QDC_DIR, 'wbw/fa.json');
  const wbwFaData = fs.existsSync(wbwFaPath)
    ? JSON.parse(fs.readFileSync(wbwFaPath, 'utf8'))
    : {};
  const wbwWordsMap = wbwFaData.words || wbwFaData;

  // 4. Load IndoPak words
  console.log('🕌 Loading IndoPak word dataset...');
  const indopakPath = path.join(QDC_DIR, 'indopak.json');
  const indopakData = fs.existsSync(indopakPath)
    ? JSON.parse(fs.readFileSync(indopakPath, 'utf8'))
    : {};
  const indopakWordsMap = indopakData.words || indopakData;

  // -------------------------------------------------------------
  // Bulk Insert Chapters
  // -------------------------------------------------------------
  console.log('📥 Inserting chapters into database...');
  const insertChapterStmt = db.prepare(`
    INSERT INTO chapters (
      id, slug, name_simple, name_arabic, name_fa, name_en,
      revelation_place, revelation_order, bismillah_pre,
      verses_count, pages_start, pages_end
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION;');
  for (const ch of qdcChapters) {
    const id = ch.id;
    const fa = faChapters[String(id)] || {};
    const en = enChapters[String(id)] || {};

    const slug = ch.slug?.slug || fa.slug || ch.name_simple.toLowerCase();
    const nameSimple = ch.name_simple;
    const nameArabic = ch.name_arabic;
    const nameFa = fa.translatedName || fa.transliteratedName || nameSimple;
    const nameEn = en.translatedName || en.transliteratedName || ch.translated_name?.name || nameSimple;
    const revPlace = ch.revelation_place;
    const revOrder = ch.revelation_order;
    const bismillahPre = ch.bismillah_pre ? 1 : 0;
    const versesCount = ch.verses_count;
    const pagesStart = ch.pages ? ch.pages[0] : 1;
    const pagesEnd = ch.pages ? ch.pages[1] : 1;

    insertChapterStmt.run(
      id, slug, nameSimple, nameArabic, nameFa, nameEn,
      revPlace, revOrder, bismillahPre, versesCount, pagesStart, pagesEnd
    );
  }
  db.exec('COMMIT;');

  // -------------------------------------------------------------
  // Iterate all 604 pages and insert verses & words
  // -------------------------------------------------------------
  console.log('📖 Processing 604 pages: extracting 6,236 verses and ~77,430 words...');

  const insertVerseStmt = db.prepare(`
    INSERT INTO verses (
      id, chapter_id, verse_number, verse_key, page_number,
      juz_number, hizb_number, rub_el_hizb_number, ruku_number,
      manzil_number, sajdah_number, text_uthmani, text_imlaei,
      text_indopak, translation_fa_makarem, translation_fa_ansarian, translation_en_saheeh
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertWordStmt = db.prepare(`
    INSERT INTO words (
      id, verse_key, chapter_id, verse_number, position, location,
      text_uthmani, qpc_uthmani_hafs, text_indopak, text_imlaei_simple,
      translation_fa, translation_en, audio_url, page_number, line_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFtsStmt = db.prepare(`
    INSERT INTO search_fts (
      verse_key, chapter_id, verse_number,
      text_clean_arabic, translation_fa, translation_en
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const processedVerses = new Set();
  let totalVersesCount = 0;
  let totalWordsCount = 0;

  db.exec('BEGIN TRANSACTION;');

  for (let pageNum = 1; pageNum <= 604; pageNum++) {
    const pageFilePath = path.join(QDC_DIR, `pages/${pageNum}.json`);
    if (!fs.existsSync(pageFilePath)) continue;

    const pageData = JSON.parse(fs.readFileSync(pageFilePath, 'utf8'));
    const verses = pageData.verses || [];

    for (const verse of verses) {
      if (processedVerses.has(verse.verse_key)) {
        continue;
      }
      processedVerses.add(verse.verse_key);
      totalVersesCount++;

      const [chapterStr, verseNumStr] = verse.verse_key.split(':');
      const chapterId = Number(chapterStr);
      const verseNumber = Number(verseNumStr);

      // Construct verse texts
      const words = verse.words || [];
      const verseWordsUthmani = [];
      const verseWordsImlaei = [];
      const verseWordsIndopak = [];

      for (const word of words) {
        if (word.char_type_name === 'end') continue; // Ayah end marker
        totalWordsCount++;

        const wordLocation = word.location || `${verse.verse_key}:${word.position}`;
        const wordUthmani = word.text_uthmani || word.qpc_uthmani_hafs || '';
        const wordQpc = word.qpc_uthmani_hafs || word.text_uthmani || '';
        const wordIndopak = indopakWordsMap[wordLocation] || word.text_indopak || '';
        const wordImlaei = word.text_imlaei_simple || word.text_uthmani || '';
        const wordTransFa = wbwWordsMap[wordLocation] || '';
        const wordTransEn = word.translation?.text || '';

        verseWordsUthmani.push(wordUthmani);
        verseWordsImlaei.push(wordImlaei);
        if (wordIndopak) verseWordsIndopak.push(wordIndopak);

        insertWordStmt.run(
          word.id || totalWordsCount,
          verse.verse_key,
          chapterId,
          verseNumber,
          word.position,
          wordLocation,
          wordUthmani,
          wordQpc,
          wordIndopak,
          wordImlaei,
          wordTransFa,
          wordTransEn,
          word.audio_url || '',
          word.page_number || pageNum,
          word.line_number || null
        );
      }

      const textUthmani = verse.text_uthmani || verseWordsUthmani.join(' ');
      const textImlaei = verseWordsImlaei.join(' ');
      const textIndopak = verseWordsIndopak.join(' ');

      // Lookup translations
      const transMakarem = getTranslationText(makaremRaw, verse.verse_key);
      const transAnsarian = getTranslationText(ansarianRaw, verse.verse_key);
      const transEnglish = getTranslationText(haleemRaw, verse.verse_key);

      insertVerseStmt.run(
        verse.id,
        chapterId,
        verseNumber,
        verse.verse_key,
        verse.page_number || pageNum,
        verse.juz_number || 1,
        verse.hizb_number || 1,
        verse.rub_el_hizb_number || 1,
        verse.ruku_number || null,
        verse.manzil_number || null,
        verse.sajdah_number || null,
        textUthmani,
        textImlaei,
        textIndopak,
        transMakarem,
        transAnsarian,
        transEnglish
      );

      // FTS Entry
      insertFtsStmt.run(
        verse.verse_key,
        chapterId,
        verseNumber,
        normalizeArabicText(textImlaei || textUthmani),
        normalizePersianText(transMakarem || transAnsarian),
        transEnglish
      );
    }
  }

  db.exec('COMMIT;');

  // Create performance indexes
  console.log('⚡ Creating performance indexes...');
  db.exec(`
    CREATE INDEX idx_verses_chapter ON verses (chapter_id);
    CREATE INDEX idx_verses_page ON verses (page_number);
    CREATE INDEX idx_verses_juz ON verses (juz_number);
    CREATE INDEX idx_words_verse ON words (verse_key);
    CREATE INDEX idx_words_chapter ON words (chapter_id);
    CREATE INDEX idx_words_page ON words (page_number);
  `);

  // Optimize DB size
  db.exec('VACUUM;');
  db.close();

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const dbSizeBytes = fs.statSync(OUTPUT_DB_PATH).size;
  const dbSizeMb = (dbSizeBytes / (1024 * 1024)).toFixed(2);

  console.log('\n========================================');
  console.log('✅ Quran SQLite Pre-bundler Finished!');
  console.log(`⏱️ Duration: ${durationSec}s`);
  console.log(`📁 Database Path: ${OUTPUT_DB_PATH}`);
  console.log(`💾 Size: ${dbSizeMb} MB`);
  console.log(`🕌 Total Chapters: ${qdcChapters.length}`);
  console.log(`📜 Total Verses: ${totalVersesCount}`);
  console.log(`🔤 Total Words: ${totalWordsCount}`);
  console.log('========================================\n');
}

buildQuranDatabase().catch((err) => {
  console.error('❌ Failed to build Quran database:', err);
  process.exit(1);
});
