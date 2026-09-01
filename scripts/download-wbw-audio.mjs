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
const CONCURRENCY = parseInt(getArg('concurrency', '20'), 10);
const FORCE = hasFlag('force');

// Pad number to 3 digits (e.g. 1 -> "001")
const pad3 = (num) => String(num).padStart(3, '0');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Fetch with retry and exponential backoff
 */
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 500) {
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
      if (res.status === 404) return null; // File does not exist on remote
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
 * Fetch all word audio locations for a Surah
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
          // Only download actual words (ignore Ayah end markers)
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

  // Skip if already exists and has non-zero size
  if (!FORCE && fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (stat.size > 0) {
      return { status: 'skipped', fileName };
    }
  }

  try {
    const res = await fetchWithRetry(downloadUrl);
    if (!res) {
      return { status: 'not_found', fileName };
    }
    const buffer = Buffer.from(await res.arrayBuffer());

    // Basic validity check: MP3 header or reasonable size (> 200 bytes)
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
 * Concurrency worker pool runner
 */
async function runWorkerPool(tasks, concurrency, onProgress) {
  let currentIndex = 0;
  let completedCount = 0;
  const results = {
    downloaded: 0,
    skipped: 0,
    not_found: 0,
    failed: 0,
    totalBytes: 0,
  };

  const workers = Array.from({ length: concurrency }, async () => {
    while (currentIndex < tasks.length) {
      const taskIndex = currentIndex++;
      const task = tasks[taskIndex];
      const result = await downloadAudioFile(task);

      completedCount++;
      if (result.status === 'downloaded') {
        results.downloaded++;
        results.totalBytes += result.bytes || 0;
      } else if (result.status === 'skipped') {
        results.skipped++;
      } else if (result.status === 'not_found') {
        results.not_found++;
      } else {
        results.failed++;
      }

      onProgress(completedCount, tasks.length, results);
    }
  });

  await Promise.all(workers);
  return results;
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
  console.log(`📖 Surahs to Process : ${surahs.length} surah(s) [${surahs.slice(0, 5).join(', ')}${surahs.length > 5 ? '...' : ''}]\n`);

  console.log('⏳ Fetching word metadata from QuranCDN...');
  const allTasks = [];
  const startTime = Date.now();

  for (let i = 0; i < surahs.length; i++) {
    const surahId = surahs[i];
    process.stdout.write(`\r🔍 Indexing Surah ${surahId} (${i + 1}/${surahs.length})... `);
    const tasks = await fetchSurahAudioTasks(surahId);
    allTasks.push(...tasks);
  }

  console.log(`\n✅ Found ${allTasks.length.toLocaleString()} word audio files to process.\n`);

  if (allTasks.length === 0) {
    console.log('No audio tasks found. Exiting.');
    return;
  }

  console.log('🚀 Starting downloads...\n');

  let lastPrint = 0;
  const downloadStartTime = Date.now();

  const results = await runWorkerPool(allTasks, CONCURRENCY, (completed, total, stats) => {
    const now = Date.now();
    if (now - lastPrint > 150 || completed === total) {
      lastPrint = now;
      const elapsedSec = (now - downloadStartTime) / 1000;
      const speed = elapsedSec > 0 ? (completed / elapsedSec).toFixed(1) : 0;
      const percent = ((completed / total) * 100).toFixed(1);
      const remaining = total - completed;
      const etaSec = speed > 0 ? Math.round(remaining / speed) : 0;

      process.stdout.write(
        `\r[${percent}%] ${completed}/${total} | ` +
          `⚡ ${speed} files/s | ` +
          `⬇️ ${stats.downloaded} new | ` +
          `⏭️ ${stats.skipped} skipped | ` +
          `⏱️ ETA: ${etaSec}s    `
      );
    }
  });

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n\n══════════════════════════════════════════════════════════════');
  console.log('🎉 Word-by-Word Audio Download Summary:');
  console.log(`   • Total Audio Files   : ${allTasks.length.toLocaleString()}`);
  console.log(`   • Downloaded (New)    : ${results.downloaded.toLocaleString()} (${formatBytes(results.totalBytes)})`);
  console.log(`   • Skipped (Existing)  : ${results.skipped.toLocaleString()}`);
  console.log(`   • Not Found / 404     : ${results.not_found}`);
  console.log(`   • Failed              : ${results.failed}`);
  console.log(`   • Elapsed Time        : ${totalTime}s`);
  console.log(`   • Output Directory    : ${OUTPUT_DIR}`);
  console.log('══════════════════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error in WBW audio downloader:', err);
  process.exit(1);
});
