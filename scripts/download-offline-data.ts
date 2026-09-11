import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://api.qurancdn.com/api/qdc';
const DATA_DIR = path.join(process.cwd(), 'data/qdc');

// CLI options
const FORCE_DOWNLOAD = process.argv.includes('--force');
const CONCURRENCY_LIMIT = 8;

/**
 * Helper to ensure necessary directories exist.
 */
async function ensureDirs() {
  const dirs = [
    DATA_DIR,
    path.join(DATA_DIR, 'chapters'),
    path.join(DATA_DIR, 'pages'),
    path.join(DATA_DIR, 'translations'),
    path.join(DATA_DIR, 'tafsirs'),
    path.join(DATA_DIR, 'resources'),
    path.join(DATA_DIR, 'audio'),
    path.join(DATA_DIR, 'audio/reciters'),
    path.join(DATA_DIR, 'audio/reciters/7'),
    path.join(DATA_DIR, 'audio-timestamps'),
  ];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Check if a file already exists and contains valid non-empty JSON.
 */
async function fileExistsAndValid(filePath: string): Promise<boolean> {
  if (FORCE_DOWNLOAD) return false;
  try {
    const stats = await fs.stat(filePath);
    if (stats.size < 10) return false;
    const content = await fs.readFile(filePath, 'utf-8');
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sleep helper for backoff.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Robust fetch JSON with retry and exponential backoff.
 */
async function fetchJsonWithRetry(url: string, retries = 5, initialDelay = 500): Promise<any> {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'QuranOfflineIngestion/1.0',
          Accept: 'application/json',
        },
      });

      if (res.status === 429 || res.status >= 500) {
        if (attempt === retries) {
          throw new Error(`HTTP ${res.status} for ${url} after ${retries} attempts`);
        }
        console.warn(`[Retry ${attempt}/${retries}] HTTP ${res.status} for ${url}. Waiting ${delay}ms...`);
        await sleep(delay);
        delay *= 2;
        continue;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      return json;
    } catch (err: any) {
      if (attempt === retries) throw err;
      console.warn(`[Retry ${attempt}/${retries}] Error fetching ${url}: ${err.message}. Waiting ${delay}ms...`);
      await sleep(delay);
      delay *= 2;
    }
  }
}

/**
 * Run tasks with a concurrency pool.
 */
async function runConcurrent<T>(items: T[], limit: number, worker: (item: T, index: number) => Promise<void>) {
  const executing: Promise<void>[] = [];
  let index = 0;

  for (const item of items) {
    const currentIndex = index++;
    const p = Promise.resolve().then(() => worker(item, currentIndex));
    executing.push(p);

    const clean = () => {
      const idx = executing.indexOf(p);
      if (idx !== -1) executing.splice(idx, 1);
    };
    p.then(clean).catch(clean);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
}

/**
 * Download chapter lists and metadata for all 114 chapters.
 */
async function downloadChapters() {
  console.log('📖 Downloading chapters metadata...');

  const languages = ['en', 'fa', 'ar'];
  for (const lang of languages) {
    const dest = path.join(DATA_DIR, lang === 'en' ? 'chapters.json' : `chapters_${lang}.json`);
    if (!(await fileExistsAndValid(dest))) {
      const data = await fetchJsonWithRetry(`${BASE_URL}/chapters?language=${lang}`);
      await fs.writeFile(dest, JSON.stringify(data, null, 2));
      // Also copy to chapters/chapters_{lang}.json
      await fs.writeFile(path.join(DATA_DIR, `chapters/chapters_${lang}.json`), JSON.stringify(data, null, 2));
    }
  }

  // Ensure default chapters.json exists
  const defaultChaptersPath = path.join(DATA_DIR, 'chapters.json');
  if (!(await fileExistsAndValid(defaultChaptersPath))) {
    const data = await fetchJsonWithRetry(`${BASE_URL}/chapters?language=en`);
    await fs.writeFile(defaultChaptersPath, JSON.stringify(data, null, 2));
  }

  // Download chapter info for all 114 chapters
  const chapterIds = Array.from({ length: 114 }, (_, i) => i + 1);
  let doneCount = 0;

  await runConcurrent(chapterIds, CONCURRENCY_LIMIT, async (id) => {
    const infoDest = path.join(DATA_DIR, `chapters/${id}-info.json`);
    if (!(await fileExistsAndValid(infoDest))) {
      const info = await fetchJsonWithRetry(`${BASE_URL}/chapters/${id}/info?language=en`);
      await fs.writeFile(infoDest, JSON.stringify(info, null, 2));
    }

    // Also download chapter detail
    const chapterDest = path.join(DATA_DIR, `chapters/${id}.json`);
    if (!(await fileExistsAndValid(chapterDest))) {
      const chapter = await fetchJsonWithRetry(`${BASE_URL}/chapters/${id}?language=en`);
      await fs.writeFile(chapterDest, JSON.stringify(chapter, null, 2));
    }

    doneCount++;
    if (doneCount % 20 === 0 || doneCount === 114) {
      console.log(`  Chapters processed: ${doneCount}/114`);
    }
  });
}

/**
 * Download 604 Mushaf pages with full word & font data (code_v1, code_v2, qpc_uthmani_hafs, etc.).
 */
async function downloadPages() {
  console.log('📄 Downloading 604 Mushaf pages (full word and glyph tokens)...');

  const pages = Array.from({ length: 604 }, (_, i) => i + 1);
  let doneCount = 0;

  await runConcurrent(pages, CONCURRENCY_LIMIT, async (page) => {
    const dest = path.join(DATA_DIR, `pages/${page}.json`);
    if (!(await fileExistsAndValid(dest))) {
      const url = `${BASE_URL}/verses/by_page/${page}?words=true&per_page=all&word_fields=verse_key,verse_id,page_number,location,text_uthmani,text_imlaei_simple,code_v1,code_v2,qpc_uthmani_hafs&mushaf=2&filter_page_words=true`;
      const pageData = await fetchJsonWithRetry(url);
      await fs.writeFile(dest, JSON.stringify(pageData, null, 2));
    }

    doneCount++;
    if (doneCount % 50 === 0 || doneCount === 604) {
      console.log(`  Pages processed: ${doneCount}/604`);
    }
  });
}

/**
 * Build and save global pages lookup tables for Mushaf 1 & 2.
 */
async function downloadPagesLookup() {
  console.log('🗺️ Generating and downloading pages lookup tables...');

  // Build lookup mapping from downloaded pages data for Mushaf 2
  const pagesLookupMapV2: Record<string, any> = {};

  for (let page = 1; page <= 604; page++) {
    const pagePath = path.join(DATA_DIR, `pages/${page}.json`);
    if (await fileExistsAndValid(pagePath)) {
      const pageData = JSON.parse(await fs.readFile(pagePath, 'utf-8'));
      const verses = pageData.verses || [];
      if (verses.length > 0) {
        const firstVerseKey = verses[0].verse_key || `${verses[0].chapter_id}:${verses[0].verse_number}`;
        const lastVerseKey =
          verses[verses.length - 1].verse_key ||
          `${verses[verses.length - 1].chapter_id}:${verses[verses.length - 1].verse_number}`;

        pagesLookupMapV2[String(page)] = {
          first_verse_key: firstVerseKey,
          last_verse_key: lastVerseKey,
          from: firstVerseKey,
          to: lastVerseKey,
          firstVerseKey,
          lastVerseKey,
        };
      }
    }
  }

  const lookupV2 = {
    total_page: 604,
    totalPage: 604,
    lookup_range: {
      from: '1:1',
      to: '114:6',
    },
    lookupRange: {
      from: '1:1',
      to: '114:6',
    },
    pages: pagesLookupMapV2,
  };

  // For Mushaf 1 (standard Madani 604 pages), layout is identical
  const lookupV1 = { ...lookupV2 };

  await fs.writeFile(path.join(DATA_DIR, 'pages-lookup-v1.json'), JSON.stringify(lookupV1, null, 2));
  await fs.writeFile(path.join(DATA_DIR, 'pages-lookup-v2.json'), JSON.stringify(lookupV2, null, 2));
  await fs.writeFile(path.join(DATA_DIR, 'pages/lookup.json'), JSON.stringify(lookupV2, null, 2));
  console.log('  ✅ Pages lookup tables generated for 604 pages.');
}

/**
 * Download resources: translations list, tafsirs list, languages, juzs.
 */
async function downloadResources() {
  console.log('📚 Downloading resources metadata (translations, tafsirs, languages, juzs)...');

  // Translations list
  const transListPath = path.join(DATA_DIR, 'translations-list.json');
  if (!(await fileExistsAndValid(transListPath))) {
    const transList = await fetchJsonWithRetry(`${BASE_URL}/resources/translations?language=en`);
    await fs.writeFile(transListPath, JSON.stringify(transList, null, 2));
    await fs.writeFile(path.join(DATA_DIR, 'translations/translations-list.json'), JSON.stringify(transList, null, 2));
    await fs.writeFile(path.join(DATA_DIR, 'resources/translations_en.json'), JSON.stringify(transList, null, 2));
  }

  // Tafsirs list
  const tafsirListPath = path.join(DATA_DIR, 'tafsirs-list.json');
  if (!(await fileExistsAndValid(tafsirListPath))) {
    const tafsirList = await fetchJsonWithRetry(`${BASE_URL}/resources/tafsirs?language=en`);
    await fs.writeFile(tafsirListPath, JSON.stringify(tafsirList, null, 2));
    await fs.writeFile(path.join(DATA_DIR, 'tafsirs/tafsirs-list.json'), JSON.stringify(tafsirList, null, 2));
    await fs.writeFile(path.join(DATA_DIR, 'resources/tafsirs_en.json'), JSON.stringify(tafsirList, null, 2));
  }

  // Languages list
  const langListPath = path.join(DATA_DIR, 'languages.json');
  if (!(await fileExistsAndValid(langListPath))) {
    const langList = await fetchJsonWithRetry(`${BASE_URL}/resources/languages?language=en`);
    await fs.writeFile(langListPath, JSON.stringify(langList, null, 2));
    await fs.writeFile(path.join(DATA_DIR, 'resources/languages_en.json'), JSON.stringify(langList, null, 2));
  }

  // Juzs list
  const juzsPath = path.join(DATA_DIR, 'juzs.json');
  if (!(await fileExistsAndValid(juzsPath))) {
    const juzs = await fetchJsonWithRetry(`${BASE_URL}/juzs`);
    await fs.writeFile(juzsPath, JSON.stringify(juzs, null, 2));
  }
}

/**
 * Download core translations (20 Saheeh Int, 84 T. Usmani, 85 Haleem, 149 Bridges, 136 Makarem FA, 135 IslamHouse FA, 131 Khattab, 16 Muyassar).
 */
async function downloadTranslations() {
  console.log('🌐 Downloading core translations data...');

  const coreTranslationIds = [20, 84, 85, 149, 136, 135, 131, 29, 16];
  const chapters = Array.from({ length: 114 }, (_, i) => i + 1);

  for (const transId of coreTranslationIds) {
    const dest = path.join(DATA_DIR, `translations/${transId}.json`);
    if (await fileExistsAndValid(dest)) {
      console.log(`  Translation ${transId} already downloaded.`);
      continue;
    }

    console.log(`  Downloading translation ID ${transId} across 114 chapters...`);
    const allVerses: any[] = [];
    const versesByVerseKey: Record<string, any> = {};

    let doneChapters = 0;
    await runConcurrent(chapters, CONCURRENCY_LIMIT, async (chapterId) => {
      try {
        const url = `${BASE_URL}/verses/by_chapter/${chapterId}?translations=${transId}&per_page=all`;
        const data = await fetchJsonWithRetry(url);
        if (data.verses) {
          for (const v of data.verses) {
            allVerses.push(v);
            if (v.translations && v.translations.length > 0) {
              versesByVerseKey[v.verse_key] = v.translations[0];
            }
          }
        }
      } catch (err: any) {
        console.warn(`    Warning: Failed to fetch translation ${transId} for chapter ${chapterId}: ${err.message}`);
      }
      doneChapters++;
      if (doneChapters % 30 === 0 || doneChapters === 114) {
        process.stdout.write(`    ${doneChapters}/114 chapters downloaded for trans ${transId}\r`);
      }
    });
    console.log(`    Downloaded ${allVerses.length} verses for translation ${transId}.`);

    // Sort verses by id
    allVerses.sort((a, b) => (a.id || 0) - (b.id || 0));

    const translationData = {
      translationId: transId,
      totalVerses: allVerses.length,
      verses: allVerses,
      byVerseKey: versesByVerseKey,
    };

    await fs.writeFile(dest, JSON.stringify(translationData, null, 2));
  }
}

/**
 * Download reciter metadata and chapter audio timestamp segments for Mohamed Siddiq al-Minshawi (reciter 9).
 */
async function downloadAudioMetadata() {
  console.log('🎙️ Downloading audio metadata and timestamps for reciter 9 (Mohamed Siddiq al-Minshawi)...');

  // Reciters list
  const recitersPath = path.join(DATA_DIR, 'audio/reciters.json');
  if (!(await fileExistsAndValid(recitersPath))) {
    const reciters = await fetchJsonWithRetry(`${BASE_URL}/audio/reciters?locale=en`);
    await fs.writeFile(recitersPath, JSON.stringify(reciters, null, 2));
  }

  // Reciter 9 info
  const reciter9Dir = path.join(DATA_DIR, 'audio/reciters/9');
  await fs.mkdir(reciter9Dir, { recursive: true });
  const reciter9InfoPath = path.join(reciter9Dir, 'info.json');
  if (!(await fileExistsAndValid(reciter9InfoPath))) {
    const reciter9 = await fetchJsonWithRetry(`${BASE_URL}/audio/reciters/9?locale=en`);
    await fs.writeFile(reciter9InfoPath, JSON.stringify(reciter9, null, 2));
  }

  // Download segment timings for all 114 chapters
  const chapters = Array.from({ length: 114 }, (_, i) => i + 1);
  let doneCount = 0;

  await runConcurrent(chapters, CONCURRENCY_LIMIT, async (chapterId) => {
    const dest = path.join(DATA_DIR, `audio/reciters/9/${chapterId}.json`);
    const timestampDest = path.join(DATA_DIR, `audio-timestamps/${chapterId}.json`);

    if (!(await fileExistsAndValid(dest))) {
      try {
        const data = await fetchJsonWithRetry(`${BASE_URL}/audio/reciters/9/audio_files?chapter=${chapterId}&segments=true`);
        await fs.writeFile(dest, JSON.stringify(data, null, 2));
        await fs.writeFile(timestampDest, JSON.stringify(data, null, 2));
      } catch (err: any) {
        console.warn(`    Warning: Failed audio files for chapter ${chapterId}: ${err.message}`);
      }
    }

    doneCount++;
    if (doneCount % 30 === 0 || doneCount === 114) {
      console.log(`  Audio timings processed: ${doneCount}/114`);
    }
  });
}

/**
 * Main execution.
 */
async function run() {
  console.log('🚀 Starting Canonical Data Ingestion Pipeline for Quran.ir...');
  console.log(`Output Directory: ${DATA_DIR}`);

  const startTime = Date.now();

  await ensureDirs();
  await downloadChapters();
  await downloadPages();
  await downloadPagesLookup();
  await downloadResources();
  await downloadTranslations();
  await downloadAudioMetadata();

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 ✅ Canonical data ingestion complete in ${elapsedSec}s!`);
}

run().catch((err) => {
  console.error('❌ Data ingestion pipeline failed:', err);
  process.exit(1);
});
