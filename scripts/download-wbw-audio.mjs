#!/usr/bin/env node

/**
 * Word-by-Word (WBW) Audio Downloader for Quran.com
 *
 * Downloads all Word-by-Word pronunciation MP3 audio files from QuranCDN
 * and saves them directly to `public/audio/wbw/` for fast, local, offline-capable playback.
 *
 * Usage:
 *   node scripts/download-wbw-audio.mjs                     # Download all 114 Surahs
 *   node scripts/download-wbw-audio.mjs --surah=1           # Download Surah 1 only
 *   node scripts/download-wbw-audio.mjs --surah=1-10        # Download Surahs 1 through 10
 *   node scripts/download-wbw-audio.mjs --concurrency=30    # Custom download concurrency
 *   node scripts/download-wbw-audio.mjs --force             # Overwrite existing files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'public', 'audio', 'wbw');

const CDN_BASE_URL = 'https://audio.qurancdn.com/wbw/';
const API_BASE_URL = 'https://api.qurancdn.com/api/qdc/';

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name, defaultValue) => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  if (arg) return arg.split('=')[1];
  return defaultValue;
};
const hasFlag = (name) => args.includes(`--${name}`);

const SURAH_ARG = getArg('surah', 'all');
const CONCURRENCY = parseInt(getArg('concurrency', '25'), 10);
const FORCE = hasFlag('force');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Fetch with retry and exponential backoff
 */
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 400) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; QuranApp/1.0; +https://quran.com)',
          ...(options.headers || {}),
        },
      });
      if (res.ok) return res;
      if (res.status === 404) return null;
      if (attempt === retries) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    } catch (err) {
      if (attempt === retries) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, backoff * Math.pow(2, attempt - 1)));
  }
  return null;
}

/**
 * Get list of Surahs to download
 */
function getSurahList(surahArg) {
  if (surahArg === 'all' || !surahArg) {
    return Array.from({ length: 114 }, (_, i) => i + 1);
  }
  if (surahArg.includes('-')) {
    const [start, end] = surahArg.split('-').map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  if (surahArg.includes(',')) {
    return surahArg.split(',').map(Number);
  }
  return [Number(surahArg)];
}

/**
 * Fetch all word audio tasks for a Surah
 */
async function fetchSurahAudioTasks(surahId) {
  const tasks = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${API_BASE_URL}verses/by_chapter/${surahId}?words=true&per_page=50&page=${page}`;
    try {
      const res = await fetchWithRetry(url);
      if (!res) break;
      const data = await res.json();
      const verses = data.verses || [];

      if (verses.length === 0) {
        hasMore = false;
        break;
      }

      for (const verse of verses) {
        const words = verse.words || [];
        for (const word of words) {
          if (word.char_type_name === 'word' && word.audio_url) {
            const fileName = path.basename(word.audio_url);
            const downloadUrl = `${CDN_BASE_URL}${fileName}`;
            const targetPath = path.join(OUTPUT_DIR, fileName);
            tasks.push({
              fileName,
              downloadUrl,
              targetPath,
              surahId,
              verseKey: verse.verse_key,
              location: word.location,
            });
          }
        }
      }

      if (!data.pagination || page >= data.pagination.total_pages) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (err) {
      console.error(`\n[!] Error fetching metadata for Surah ${surahId} page ${page}:`, err.message);
      hasMore = false;
    }
  }

  return tasks;
}

/**
 * Download a single audio file
 */
async function downloadAudioFile(task) {
  const { fileName, downloadUrl, targetPath } = task;

  if (!FORCE && fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (stat.size > 200) {
      return { status: 'skipped', fileName, bytes: stat.size };
    }
  }

  try {
    const res = await fetchWithRetry(downloadUrl);
    if (!res) {
      return { status: 'not_found', fileName };
    }
    const buffer = Buffer.from(await res.arrayBuffer());

    if (buffer.length < 200) {
      return { status: 'invalid', fileName };
    }

    fs.writeFileSync(targetPath, buffer);
    return { status: 'downloaded', fileName, bytes: buffer.length };
  } catch (err) {
    return { status: 'failed', fileName, error: err.message };
  }
}

/**
 * Format bytes into human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Process tasks with concurrency pool
 */
async function runWorkerPool(tasks, concurrency, onProgress) {
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, tasks.length || 1) }, async () => {
    while (currentIndex < tasks.length) {
      const taskIndex = currentIndex++;
      const task = tasks[taskIndex];
      const result = await downloadAudioFile(task);
      onProgress(result);
    }
  });

  await Promise.all(workers);
}

/**
 * Main execution
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        Quran.com Word-by-Word (WBW) Audio Downloader         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`📁 Target Directory : ${OUTPUT_DIR}`);
  console.log(`⚡ Concurrency      : ${CONCURRENCY} parallel workers`);
  console.log(`🔄 Force Overwrite  : ${FORCE ? 'Yes' : 'No (skipping existing)'}`);

  const surahs = getSurahList(SURAH_ARG);
  console.log(`📖 Surahs to Process : ${surahs.length} surah(s)\n`);

  const globalStats = {
    totalWords: 0,
    downloaded: 0,
    skipped: 0,
    not_found: 0,
    failed: 0,
    totalBytes: 0,
  };

  const overallStartTime = Date.now();

  for (let i = 0; i < surahs.length; i++) {
    const surahId = surahs[i];
    const surahStartTime = Date.now();

    process.stdout.write(`\r⏳ [${i + 1}/${surahs.length}] Fetching Surah ${surahId} words... `);
    const tasks = await fetchSurahAudioTasks(surahId);
    globalStats.totalWords += tasks.length;

    let surahDownloaded = 0;
    let surahSkipped = 0;
    let surahFailed = 0;

    await runWorkerPool(tasks, CONCURRENCY, (result) => {
      if (result.status === 'downloaded') {
        globalStats.downloaded++;
        surahDownloaded++;
        globalStats.totalBytes += result.bytes || 0;
      } else if (result.status === 'skipped') {
        globalStats.skipped++;
        surahSkipped++;
      } else if (result.status === 'not_found') {
        globalStats.not_found++;
      } else {
        globalStats.failed++;
        surahFailed++;
      }
    });

    const surahDuration = ((Date.now() - surahStartTime) / 1000).toFixed(1);
    const totalElapsed = ((Date.now() - overallStartTime) / 1000).toFixed(0);

    console.log(
      `\r✅ [${i + 1}/${surahs.length}] Surah ${pad3(surahId)}: ${tasks.length} words ` +
        `(${surahDownloaded} new, ${surahSkipped} cached) in ${surahDuration}s ` +
        `| Total: ${globalStats.downloaded} new (${formatBytes(globalStats.totalBytes)}) | Elapsed: ${totalElapsed}s`
    );
  }

  const totalTime = ((Date.now() - overallStartTime) / 1000).toFixed(1);

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('🎉 Complete Word-by-Word Audio Download Summary:');
  console.log(`   • Total Audio Files   : ${globalStats.totalWords.toLocaleString()}`);
  console.log(`   • Downloaded (New)    : ${globalStats.downloaded.toLocaleString()} (${formatBytes(globalStats.totalBytes)})`);
  console.log(`   • Skipped (Cached)    : ${globalStats.skipped.toLocaleString()}`);
  console.log(`   • Not Found           : ${globalStats.not_found}`);
  console.log(`   • Failed              : ${globalStats.failed}`);
  console.log(`   • Elapsed Time        : ${totalTime}s`);
  console.log(`   • Output Directory    : ${OUTPUT_DIR}`);
  console.log('══════════════════════════════════════════════════════════════\n');
}

function pad3(num) {
  return String(num).padStart(3, '0');
}

main().catch((err) => {
  console.error('\n❌ Fatal error in WBW audio downloader:', err);
  process.exit(1);
});
