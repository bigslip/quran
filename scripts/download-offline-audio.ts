import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// CLI options
const args = process.argv.slice(2);
const getArg = (name: string, defaultValue: string) => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  if (arg) return arg.split('=')[1];
  return defaultValue;
};
const hasFlag = (name: string) => args.includes(`--${name}`);

const RECITER_ID = parseInt(getArg('reciter', '9'), 10); // Default: Mohamed Siddiq al-Minshawi (9)
const CHAPTERS_ARG = getArg('chapters', 'all');
const CONCURRENCY_LIMIT = parseInt(getArg('concurrency', '6'), 10);
const FORCE = hasFlag('force');

const OUTPUT_DIR = path.join(process.cwd(), `public/audio/reciters/${RECITER_ID}`);

/**
 * Format chapter number to 3-digit padded string (e.g. 1 -> "001")
 */
const formatChapter = (num: number) => String(num).padStart(3, '0');

/**
 * Parse chapter list from CLI argument
 */
function getChapterList(arg: string): number[] {
  if (arg === 'all' || !arg) {
    return Array.from({ length: 114 }, (_, i) => i + 1);
  }
  if (arg.includes('-')) {
    const [start, end] = arg.split('-').map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  if (arg.includes(',')) {
    return arg.split(',').map(Number).filter(Boolean);
  }
  return [Number(arg)];
}

/**
 * Check if a file exists and has non-zero size
 */
async function fileExistsAndValid(filePath: string): Promise<boolean> {
  if (FORCE) return false;
  try {
    const stats = await fs.stat(filePath);
    return stats.size > 10000; // valid audio file is at least 10KB
  } catch {
    return false;
  }
}

/**
 * Sleep helper
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get candidate URLs for a given reciter and chapter
 */
function getReciterCandidateUrls(reciterId: number, chapterId: number): string[] {
  const padded = formatChapter(chapterId);

  if (reciterId === 9) {
    // Mohamed Siddiq al-Minshawi (Murattal)
    return [
      `https://download.quranicaudio.com/qdc/siddiq_minshawi/murattal/${chapterId}.mp3`,
      `https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/${padded}.mp3`,
      `https://server10.mp3quran.net/minsh/${padded}.mp3`,
    ];
  }

  if (reciterId === 7) {
    // Mishari Rashid Al-Afasy
    return [
      `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${chapterId}.mp3`,
      `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${padded}.mp3`,
      `https://server8.mp3quran.net/afs/${padded}.mp3`,
    ];
  }

  if (reciterId === 2) {
    // AbdulBaset AbdulSamad (Murattal)
    return [
      `https://download.quranicaudio.com/qdc/abdul_baset/murattal/${chapterId}.mp3`,
      `https://download.quranicaudio.com/quran/abdulbaset_mujawwad/${padded}.mp3`,
      `https://server7.mp3quran.net/basit/${padded}.mp3`,
    ];
  }

  if (reciterId === 6) {
    // Mahmoud Khalil Al-Husary (Murattal)
    return [
      `https://download.quranicaudio.com/qdc/khalil_al_husary/murattal/${chapterId}.mp3`,
      `https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree_iza3ah/${padded}.mp3`,
      `https://server13.mp3quran.net/husr/${padded}.mp3`,
    ];
  }

  if (reciterId === 3) {
    // Abdur-Rahman as-Sudais
    return [
      `https://download.quranicaudio.com/qdc/abdurrahmaan_as_sudais/murattal/${chapterId}.mp3`,
      `https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/${padded}.mp3`,
      `https://server11.mp3quran.net/sds/${padded}.mp3`,
    ];
  }

  // Generic fallback
  return [
    `https://download.quranicaudio.com/quran/${reciterId}/${padded}.mp3`,
    `https://download.quranicaudio.com/qdc/${reciterId}/murattal/${chapterId}.mp3`,
  ];
}

/**
 * Download an audio file with fallback sources and retry logic
 */
async function downloadChapterAudio(chapterId: number, retries = 3): Promise<void> {
  const padded = formatChapter(chapterId);
  const destPadded = path.join(OUTPUT_DIR, `${padded}.mp3`);
  const destUnpadded = path.join(OUTPUT_DIR, `${chapterId}.mp3`);

  if ((await fileExistsAndValid(destPadded)) && (await fileExistsAndValid(destUnpadded))) {
    return;
  }

  const urls = getReciterCandidateUrls(RECITER_ID, chapterId);

  let lastError: Error | null = null;

  for (const url of urls) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'QuranOfflineAudioIngestion/1.0',
          },
        });

        if (!res.ok) {
          if (res.status === 404) {
            break; // Try next URL fallback
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        if (!res.body) {
          throw new Error('Response body is empty');
        }

        const tempDest = `${destPadded}.tmp`;
        const fileStream = createWriteStream(tempDest);
        // @ts-ignore Node fetch body stream compatibility
        await pipeline(Readable.fromWeb(res.body), fileStream);

        // Move to final padded path
        await fs.rename(tempDest, destPadded);

        // Also copy or link to unpadded path for compatibility
        try {
          await fs.copyFile(destPadded, destUnpadded);
        } catch {
          // ignore copy error
        }

        return;
      } catch (err: any) {
        lastError = err;
        if (attempt < retries) {
          await sleep(500 * attempt);
        }
      }
    }
  }

  throw lastError || new Error(`Failed to download audio for reciter ${RECITER_ID} chapter ${chapterId}`);
}

/**
 * Concurrency worker pool
 */
async function runConcurrent<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
) {
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
 * Main function
 */
async function main() {
  console.log(`🎙️ Starting Offline Chapter Audio Downloader for Reciter ${RECITER_ID}...`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const chapters = getChapterList(CHAPTERS_ARG);
  console.log(`Targeting ${chapters.length} chapter(s)...`);

  const startTime = Date.now();
  let completed = 0;
  let skipped = 0;

  await runConcurrent(chapters, CONCURRENCY_LIMIT, async (chapterId) => {
    const padded = formatChapter(chapterId);
    const destPadded = path.join(OUTPUT_DIR, `${padded}.mp3`);

    if (await fileExistsAndValid(destPadded)) {
      skipped++;
      completed++;
      return;
    }

    try {
      await downloadChapterAudio(chapterId);
      completed++;
      if (completed % 10 === 0 || completed === chapters.length) {
        console.log(`  Progress: ${completed}/${chapters.length} chapters (downloaded chapter ${padded})`);
      }
    } catch (err: any) {
      console.error(`  ❌ Error downloading chapter ${chapterId}: ${err.message}`);
    }
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 ✅ Audio download finished in ${durationSec}s! (Completed: ${completed}, Skipped existing: ${skipped})`);
}

main().catch((err) => {
  console.error('Fatal audio download error:', err);
  process.exit(1);
});
