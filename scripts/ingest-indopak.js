/* eslint-disable no-console */
const fs = require('fs/promises');
const path = require('path');

const TOTAL_CHAPTERS = 114;
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'qdc', 'indopak');
const UNIFIED_FILE = path.join(__dirname, '..', 'data', 'qdc', 'indopak.json');

async function fetchWithRetry(url, maxRetries = 5, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === maxRetries) {
        throw err;
      }
      console.warn(
        `[Retry ${attempt}/${maxRetries}] Failed to fetch ${url}: ${err.message}. Retrying in ${delayMs}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}

async function fetchChapterWords(chapterId) {
  let page = 1;
  let allVerses = [];
  let totalPages = 1;

  do {
    const url = `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?words=true&mushaf=7&word_fields=text_indopak,location&per_page=300&page=${page}`;
    const data = await fetchWithRetry(url);
    if (data.verses) {
      allVerses = allVerses.concat(data.verses);
    }
    if (data.pagination && data.pagination.total_pages) {
      totalPages = data.pagination.total_pages;
    }
    page++;
  } while (page <= totalPages);

  return allVerses;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const unifiedMap = {};
  let totalWordCount = 0;

  console.log('Starting ingestion of IndoPak Quran script dataset across 114 Surahs...');

  // Concurrency limit of 10 to be polite but fast
  const CHUNK_SIZE = 10;
  for (let i = 1; i <= TOTAL_CHAPTERS; i += CHUNK_SIZE) {
    const batch = [];
    for (let c = i; c < i + CHUNK_SIZE && c <= TOTAL_CHAPTERS; c++) {
      batch.push(c);
    }

    await Promise.all(
      batch.map(async (chapterId) => {
        const verses = await fetchChapterWords(chapterId);
        const chapterWords = {};

        for (const verse of verses) {
          const verseKey = verse.verse_key;
          if (!verse.words) continue;

          verse.words.forEach((word, idx) => {
            const wordPosition = word.position || idx + 1;
            const location = word.location || `${verseKey}:${wordPosition}`;
            const textIndopak = word.text_indopak || word.text || '';

            chapterWords[location] = textIndopak;
            unifiedMap[location] = textIndopak;
            totalWordCount++;
          });
        }

        const chapterPayload = {
          chapterId,
          mushaf: 7,
          words: chapterWords,
        };

        await fs.writeFile(
          path.join(OUTPUT_DIR, `${chapterId}.json`),
          JSON.stringify(chapterPayload, null, 2),
          'utf-8'
        );
        console.log(
          `Surah ${chapterId.toString().padStart(3, ' ')} ingested (${Object.keys(chapterWords).length} words)`
        );
      })
    );
  }

  await fs.writeFile(UNIFIED_FILE, JSON.stringify(unifiedMap, null, 2), 'utf-8');
  console.log(`\nSuccessfully ingested IndoPak dataset: ${totalWordCount} words written to ${UNIFIED_FILE}`);
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
