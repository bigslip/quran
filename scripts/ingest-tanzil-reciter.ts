import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

// CLI options
const args = process.argv.slice(2);
const getArg = (name: string, defaultValue: string) => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  if (arg) return arg.split('=')[1];
  return defaultValue;
};
const hasFlag = (name: string) => args.includes(`--${name}`);

const RECITER_KEY = getArg('reciter', 'parhizgar');
const RECITER_ID = parseInt(getArg('id', '201'), 10);
const RECITER_NAME = getArg('name', 'Shahriar Parhizgar');
const RECITER_STYLE = getArg('style', 'Murattal');
const CHAPTERS_ARG = getArg('chapters', 'all');
const CHAPTER_CONCURRENCY = parseInt(getArg('chapter_concurrency', '6'), 10);
const AYAH_CONCURRENCY = parseInt(getArg('ayah_concurrency', '10'), 10);
const FORCE = hasFlag('force');

const DATA_DIR = path.join(process.cwd(), 'data/qdc');
const AUDIO_OUTPUT_DIR = path.join(process.cwd(), `public/audio/reciters/${RECITER_ID}`);
const TIMESTAMPS_OUTPUT_DIR = path.join(DATA_DIR, `audio/reciters/${RECITER_ID}`);

/**
 * Format 3-digit padded string
 */
const pad3 = (num: number) => String(num).padStart(3, '0');

/**
 * Check if file exists and has valid size
 */
async function fileExistsAndValid(filePath: string, minBytes = 100): Promise<boolean> {
  if (FORCE) return false;
  try {
    const stat = await fs.stat(filePath);
    return stat.size > minBytes;
  } catch {
    return false;
  }
}

/**
 * Sleep helper
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
 * MPEG audio frame header parser & extractor.
 */
function parseMp3Frames(buffer: Buffer): { durationMs: number; audioData: Buffer; sampleRate: number } {
  const bitrateMap: Record<string, number[]> = {
    '1': [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    '2': [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  };
  const sampleRateMap: Record<string, number[]> = {
    '1': [44100, 48000, 32000],
    '2': [22050, 24000, 16000],
    '2.5': [11025, 12000, 8000],
  };

  let offset = 0;
  if (buffer.length > 10 && buffer.toString('ascii', 0, 3) === 'ID3') {
    const size =
      ((buffer[6] & 0x7f) << 21) |
      ((buffer[7] & 0x7f) << 14) |
      ((buffer[8] & 0x7f) << 7) |
      (buffer[9] & 0x7f);
    offset = 10 + size;
  }

  const audioStart = offset;
  let totalDurationMs = 0;
  let audioEnd = offset;
  let detectedSampleRate = 44100;

  while (offset < buffer.length - 4) {
    if (buffer[offset] === 0xff && (buffer[offset + 1] & 0xe0) === 0xe0) {
      const b1 = buffer[offset + 1];
      const b2 = buffer[offset + 2];

      const versionBits = (b1 >> 3) & 0x03;
      const layerBits = (b1 >> 1) & 0x03;
      const bitrateIdx = (b2 >> 4) & 0x0f;
      const sampleRateIdx = (b2 >> 2) & 0x03;
      const padding = (b2 >> 1) & 0x01;

      let version = '1';
      let samplesPerFrame = 1152;
      if (versionBits === 3) version = '1';
      else if (versionBits === 2) {
        version = '2';
        samplesPerFrame = 576;
      } else if (versionBits === 0) {
        version = '2.5';
        samplesPerFrame = 576;
      } else {
        offset++;
        continue;
      }

      if (layerBits !== 1) {
        offset++;
        continue;
      }

      const bitrates = bitrateMap[version === '1' ? '1' : '2'];
      const sampleRates = sampleRateMap[version];
      if (!bitrates || !sampleRates) {
        offset++;
        continue;
      }

      const bitrate = bitrates[bitrateIdx] * 1000;
      const sampleRate = sampleRates[sampleRateIdx];
      if (!bitrate || !sampleRate) {
        offset++;
        continue;
      }

      detectedSampleRate = sampleRate;

      let frameLength = 0;
      if (version === '1') {
        frameLength = Math.floor((144 * bitrate) / sampleRate) + padding;
      } else {
        frameLength = Math.floor((72 * bitrate) / sampleRate) + padding;
      }

      if (frameLength <= 4 || offset + frameLength > buffer.length) {
        offset++;
        continue;
      }

      const frameDurationMs = (samplesPerFrame / sampleRate) * 1000;
      totalDurationMs += frameDurationMs;
      offset += frameLength;
      audioEnd = offset;
    } else {
      offset++;
    }
  }

  const audioData = buffer.subarray(audioStart, audioEnd > audioStart ? audioEnd : buffer.length);
  return {
    durationMs: Math.round(totalDurationMs),
    audioData,
    sampleRate: detectedSampleRate,
  };
}

/**
 * Fetch Ayah audio with retries and fallback
 */
async function fetchAyahBuffer(chapterId: number, verseNumber: number, retries = 3): Promise<Buffer> {
  const fileName = `${pad3(chapterId)}${pad3(verseNumber)}.mp3`;
  const urls = [
    `https://tanzil.net/res/audio/${RECITER_KEY}/${fileName}`,
    `http://everyayah.com/data/Parhizgar_48kbps/${fileName}`,
    `https://everyayah.com/data/Parhizgar_48kbps/${fileName}`,
    `https://tanzil.ir/res/audio/${RECITER_KEY}/${fileName}`,
  ];

  let lastError: Error | null = null;
  for (const url of urls) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(10000),
          headers: { 'User-Agent': 'Mozilla/5.0 (Quran.ir Audio Pipeline)' },
        });
        if (!res.ok) {
          if (res.status === 404) break;
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const arrayBuf = await res.arrayBuffer();
        if (arrayBuf.byteLength < 500) throw new Error('Audio buffer too small');
        return Buffer.from(arrayBuf);
      } catch (err: any) {
        lastError = err;
        if (attempt < retries) await sleep(200 * attempt);
      }
    }
  }

  throw lastError || new Error(`Failed to fetch Ayah audio: ${chapterId}:${verseNumber}`);
}

/**
 * Cache of verse words loaded from data/qdc/pages
 */
let verseWordsMap: Record<string, number> | null = null;

function loadVerseWordsCountMap(): Record<string, number> {
  if (verseWordsMap) return verseWordsMap;
  verseWordsMap = {};

  const pagesDir = path.join(DATA_DIR, 'pages');
  for (let page = 1; page <= 604; page++) {
    const pagePath = path.join(pagesDir, `${page}.json`);
    if (fsSync.existsSync(pagePath)) {
      try {
        const data = JSON.parse(fsSync.readFileSync(pagePath, 'utf8'));
        if (data.verses) {
          for (const v of data.verses) {
            const spokenWords = (v.words || []).filter((w: any) => w.char_type_name === 'word');
            verseWordsMap[v.verse_key] = spokenWords.length;
          }
        }
      } catch {}
    }
  }

  return verseWordsMap;
}

/**
 * Generate word-by-word segment boundaries for an Ayah
 */
function generateWordSegments(
  verseKey: string,
  ayahDurationMs: number,
  wordsCountMap: Record<string, number>,
): Array<[number, number, number]> {
  const numWords = wordsCountMap[verseKey] || 4;
  if (numWords <= 1) {
    return [[1, 0, ayahDurationMs]];
  }

  const segments: Array<[number, number, number]> = [];
  const wordDuration = Math.floor(ayahDurationMs / numWords);

  let currentStart = 0;
  for (let w = 1; w <= numWords; w++) {
    const isLast = w === numWords;
    const end = isLast ? ayahDurationMs : currentStart + wordDuration;
    segments.push([w, currentStart, end]);
    currentStart = end;
  }

  return segments;
}

/**
 * Process a single chapter
 */
async function processChapter(
  chapterId: number,
  verseCount: number,
  wordsCountMap: Record<string, number>,
) {
  const paddedChapter = pad3(chapterId);
  const destAudioPadded = path.join(AUDIO_OUTPUT_DIR, `${paddedChapter}.mp3`);
  const destAudioUnpadded = path.join(AUDIO_OUTPUT_DIR, `${chapterId}.mp3`);
  const destTimings = path.join(TIMESTAMPS_OUTPUT_DIR, `${chapterId}.json`);

  if ((await fileExistsAndValid(destAudioPadded)) && (await fileExistsAndValid(destTimings))) {
    return;
  }

  const verses = Array.from({ length: verseCount }, (_, i) => i + 1);
  const parsedVerses: Array<{ verseNumber: number; audioData: Buffer; durationMs: number }> = new Array(
    verseCount,
  );

  // Concurrently fetch all verses for this chapter
  await runConcurrent(verses, AYAH_CONCURRENCY, async (verseNumber) => {
    const ayahBuf = await fetchAyahBuffer(chapterId, verseNumber);
    const parsed = parseMp3Frames(ayahBuf);
    parsedVerses[verseNumber - 1] = {
      verseNumber,
      audioData: parsed.audioData,
      durationMs: parsed.durationMs,
    };
  });

  const ayahBuffers: Buffer[] = [];
  const verseTimings: any[] = [];
  let cumulativeMs = 0;

  for (let i = 0; i < verseCount; i++) {
    const pv = parsedVerses[i];
    if (!pv) throw new Error(`Missing verse ${i + 1} for chapter ${chapterId}`);

    ayahBuffers.push(pv.audioData);

    const from = cumulativeMs;
    const to = cumulativeMs + pv.durationMs;
    const verseKey = `${chapterId}:${pv.verseNumber}`;

    const segments = generateWordSegments(verseKey, pv.durationMs, wordsCountMap);

    verseTimings.push({
      verse_key: verseKey,
      timestamp_from: from,
      timestamp_to: to,
      duration: pv.durationMs,
      segments,
    });

    cumulativeMs = to;
  }

  const concatenatedAudio = Buffer.concat(ayahBuffers);

  await fs.writeFile(destAudioPadded, concatenatedAudio);
  try {
    await fs.writeFile(destAudioUnpadded, concatenatedAudio);
  } catch {}

  const timingData = {
    audio_files: [
      {
        id: RECITER_ID,
        chapter_id: chapterId,
        file_size: concatenatedAudio.length,
        format: 'mp3',
        audio_url: `/audio/reciters/${RECITER_ID}/${paddedChapter}.mp3`,
        duration: cumulativeMs,
        verse_timings: verseTimings,
      },
    ],
  };

  await fs.writeFile(destTimings, JSON.stringify(timingData, null, 2));
}

/**
 * Register reciter metadata
 */
async function registerReciterMetadata() {
  const infoPath = path.join(TIMESTAMPS_OUTPUT_DIR, 'info.json');
  const reciterInfo = {
    reciter: {
      id: RECITER_ID,
      reciter_id: RECITER_ID,
      name: RECITER_NAME,
      translated_name: {
        name: RECITER_NAME,
        language_name: 'english',
      },
      style: {
        name: RECITER_STYLE,
        language_name: 'english',
        description: `${RECITER_STYLE} is Quranic recitation at a measured pace, used for study and practice.`,
      },
      qirat: {
        name: 'Hafs',
        language_name: 'english',
      },
    },
  };
  await fs.writeFile(infoPath, JSON.stringify(reciterInfo, null, 2));

  const recitersPath = path.join(DATA_DIR, 'audio/reciters.json');
  if (fsSync.existsSync(recitersPath)) {
    const data = JSON.parse(await fs.readFile(recitersPath, 'utf8'));
    if (data.reciters) {
      const existingIdx = data.reciters.findIndex((r: any) => r.id === RECITER_ID);
      if (existingIdx !== -1) {
        data.reciters[existingIdx] = reciterInfo.reciter;
      } else {
        data.reciters.push(reciterInfo.reciter);
      }
      await fs.writeFile(recitersPath, JSON.stringify(data, null, 2));
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`🎙️ Starting Tanzil Audio & Timing Generator Pipeline for: ${RECITER_NAME} (ID: ${RECITER_ID})`);
  console.log(`Output Directories:\n  Audio: ${AUDIO_OUTPUT_DIR}\n  Timings: ${TIMESTAMPS_OUTPUT_DIR}`);

  await fs.mkdir(AUDIO_OUTPUT_DIR, { recursive: true });
  await fs.mkdir(TIMESTAMPS_OUTPUT_DIR, { recursive: true });

  await registerReciterMetadata();

  const chaptersJsonPath = path.join(DATA_DIR, 'chapters.json');
  const chaptersData = JSON.parse(await fs.readFile(chaptersJsonPath, 'utf8'));
  const chaptersList = chaptersData.chapters || [];

  const wordsCountMap = loadVerseWordsCountMap();

  let targetChapters = chaptersList;
  if (CHAPTERS_ARG !== 'all') {
    if (CHAPTERS_ARG.includes('-')) {
      const [start, end] = CHAPTERS_ARG.split('-').map(Number);
      targetChapters = chaptersList.filter((c: any) => c.id >= start && c.id <= end);
    } else {
      const ids = CHAPTERS_ARG.split(',').map(Number);
      targetChapters = chaptersList.filter((c: any) => ids.includes(c.id));
    }
  }

  console.log(`Targeting ${targetChapters.length} chapter(s)...`);

  const startTime = Date.now();
  let doneCount = 0;

  await runConcurrent(targetChapters, CHAPTER_CONCURRENCY, async (chap: any) => {
    try {
      await processChapter(chap.id, chap.verses_count, wordsCountMap);
      doneCount++;
      if (doneCount % 10 === 0 || doneCount === targetChapters.length) {
        console.log(`  Progress: ${doneCount}/${targetChapters.length} chapters processed (finished Surah ${chap.id}: ${chap.name_simple})`);
      }
    } catch (err: any) {
      console.error(`  ❌ Failed chapter ${chap.id} (${chap.name_simple}): ${err.message}`);
    }
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 ✅ Tanzil Reciter Ingestion & Timing Segments complete in ${durationSec}s!`);
}

main().catch((err) => {
  console.error('Fatal pipeline error:', err);
  process.exit(1);
});
