/* eslint-disable no-console */
const fs = require('fs/promises');
const path = require('path');

const TOTAL_CHAPTERS = 114;
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'qdc', 'wbw', 'fa');
const UNIFIED_FILE = path.join(__dirname, '..', 'data', 'qdc', 'wbw', 'fa.json');

function normalizePersianText(text) {
  if (!text) return '';
  return text
    .replace(/[\u064A\u0649]/g, '\u06CC') // Arabic Yeh to Persian Yeh
    .replace(/\u0643/g, '\u06A9') // Arabic Kaf to Persian Kaf
    .replace(/\u06C0/g, '\u0647\u200C\u06CC') // Normalize heh goal
    .replace(/\s+/g, ' ')
    .trim();
}

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
      console.warn(`[Retry ${attempt}/${maxRetries}] Failed to fetch ${url}: ${err.message}. Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}

async function fetchChapterWords(chapterId) {
  let page = 1;
  let allVerses = [];
  let totalPages = 1;

  do {
    const url = `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?language=fa&words=true&word_fields=text_uthmani,translation&word_translation_language=fa&per_page=300&page=${page}`;
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

  console.log('Starting ingestion of Persian Word-by-Word data across 114 Surahs...');

  for (let chapterId = 1; chapterId <= TOTAL_CHAPTERS; chapterId++) {
    const verses = await fetchChapterWords(chapterId);
    const chapterWords = {};

    for (const verse of verses) {
      const verseKey = verse.verse_key; // e.g. "1:1"
      if (!verse.words) continue;

      verse.words.forEach((word, idx) => {
        const wordPosition = word.position || idx + 1;
        const location = word.location || `${verseKey}:${wordPosition}`;
        const rawText = word.translation?.text || '';
        const cleanText = normalizePersianText(rawText);

        chapterWords[location] = cleanText;
        unifiedMap[location] = cleanText;
        totalWordCount++;
      });
    }

    const chapterPayload = {
      chapterId,
      language: 'fa',
      languageName: 'persian',
      languageId: 43,
      words: chapterWords,
    };

    await fs.writeFile(
      path.join(OUTPUT_DIR, `${chapterId}.json`),
      JSON.stringify(chapterPayload, null, 2),
      'utf-8'
    );
    console.log(`Surah ${chapterId.toString().padStart(3, ' ')} ingested (${Object.keys(chapterWords).length} words)`);
  }

  await fs.writeFile(UNIFIED_FILE, JSON.stringify(unifiedMap, null, 2), 'utf-8');
  console.log(`Successfully generated data/qdc/wbw/fa.json with ${totalWordCount} total word tokens!`);
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
