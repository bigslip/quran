import { chromium, type Browser, type Page } from '@playwright/test';

export interface AcousticInfo {
  id: string;
  durationMs: number;
  speechStart: number;
  speechEnd: number;
  pauses: Array<{ from: number; to: number; duration: number }>;
}

export interface SpeechInterval {
  from: number;
  to: number;
}

export interface WordIntervalGroup {
  interval: SpeechInterval;
  words: Array<{ word: string; index: number; weight: number }>;
}

export class AcousticAligner {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private mutex: Promise<void> = Promise.resolve();

  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({ channel: 'chrome', headless: true });
      this.page = await this.browser.newPage();
      await this.page.goto('about:blank');
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Analyze a batch of Ayah MP3 audio buffers and return acoustic bounds & pauses
   */
  async analyzeBatch(
    items: Array<{ id: string; buffer: Buffer }>,
  ): Promise<Record<string, AcousticInfo>> {
    await this.init();
    if (!this.page) throw new Error('AcousticAligner page not initialized');

    const map: Record<string, AcousticInfo> = {};
    if (items.length === 0) return map;

    // Process under mutex lock in chunks of 20 items
    const CHUNK_SIZE = 20;

    await (this.mutex = this.mutex.then(async () => {
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const payload = chunk.map((item) => ({
          id: item.id,
          b64: item.buffer.toString('base64'),
        }));

        const rawResults = await this.page!.evaluate(async (audioList) => {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const results: AcousticInfo[] = [];

          for (const item of audioList) {
            try {
              const bin = atob(item.b64);
              const u8 = new Uint8Array(bin.length);
              for (let b = 0; b < bin.length; b++) {
                u8[b] = bin.charCodeAt(b);
              }

              const audioBuffer = await audioCtx.decodeAudioData(u8.buffer);
              const channelData = audioBuffer.getChannelData(0);
              const sr = audioBuffer.sampleRate;
              const durationMs = Math.round(audioBuffer.duration * 1000);

              // 20ms analysis window with 10ms hop
              const winSize = Math.floor(sr * 0.02);
              const hopSize = Math.floor(sr * 0.01);
              let maxRms = 0;
              const frames: Array<{ timeMs: number; rms: number }> = [];

              for (let j = 0; j + winSize <= channelData.length; j += hopSize) {
                let sum = 0;
                for (let k = 0; k < winSize; k++) {
                  const s = channelData[j + k];
                  sum += s * s;
                }
                const rms = Math.sqrt(sum / winSize);
                if (rms > maxRms) maxRms = rms;
                frames.push({ timeMs: Math.round((j / sr) * 1000), rms });
              }

              // Dynamic thresholds:
              // Speech onset/offset threshold: 8% of max RMS (baseline 0.010)
              const speechThresh = Math.max(0.010, maxRms * 0.08);
              // Mid-verse breathing pause threshold: 11% of max RMS (baseline 0.016)
              const pauseThresh = Math.max(0.016, maxRms * 0.11);

              // Find speech start
              let speechStart = 0;
              for (const f of frames) {
                if (f.rms >= speechThresh) {
                  speechStart = Math.max(0, f.timeMs - 20); // 20ms lead-in margin for soft consonants
                  break;
                }
              }

              // Find speech end
              let speechEnd = durationMs;
              for (let j = frames.length - 1; j >= 0; j--) {
                if (frames[j].rms >= speechThresh) {
                  speechEnd = Math.min(durationMs, frames[j].timeMs + 40); // 40ms trailing margin for decay
                  break;
                }
              }

              if (speechEnd <= speechStart) {
                speechStart = 0;
                speechEnd = durationMs;
              }

              // Find internal breathing pauses (silence >= 180ms within active speech)
              const pauses: Array<{ from: number; to: number; duration: number }> = [];
              let inSilence = false;
              let silStart = 0;

              for (const f of frames) {
                if (f.timeMs < speechStart || f.timeMs > speechEnd) continue;
                const isSil = f.rms < pauseThresh;
                if (isSil && !inSilence) {
                  inSilence = true;
                  silStart = f.timeMs;
                } else if (!isSil && inSilence) {
                  inSilence = false;
                  const dur = f.timeMs - silStart;
                  if (dur >= 180) {
                    pauses.push({ from: silStart, to: f.timeMs, duration: dur });
                  }
                }
              }

              results.push({
                id: item.id,
                durationMs,
                speechStart,
                speechEnd,
                pauses,
              });
            } catch {
              results.push({
                id: item.id,
                durationMs: 0,
                speechStart: 0,
                speechEnd: 0,
                pauses: [],
              });
            }
          }

          return results;
        }, payload);

        for (const res of rawResults) {
          map[res.id] = res;
        }
      }
    }));

    return map;
  }
}

/**
 * Calculate phonetic Tajweed weight for a Quranic word
 */
export function calculateWordWeight(wordText: string, isLastWord: boolean): number {
  if (!wordText) return 1;

  // Base letter count (Arabic letters only)
  const baseLetters = wordText.replace(/[^\u0621-\u064A\u0671]/g, '').length;
  let weight = Math.max(1.5, baseLetters);

  // Extra weight for Shaddah (doubled consonant)
  const shaddahs = (wordText.match(/\u0651/g) || []).length;
  weight += shaddahs * 1.0;

  // Extra weight for Dagger Alif (ـٰ / ٰ) or Alif with Madd (آ)
  const daggerAlifs = (wordText.match(/[\u0670\u0622]/g) || []).length;
  weight += daggerAlifs * 1.5;

  // Extra weight for Long Madd signs (Madd Lazim, Muttasil, Munfasil ~ ۤ / ٓ)
  const longMadds = (wordText.match(/[\u0653\u06E6\u06E7]/g) || []).length;
  weight += longMadds * 4.0;

  // Extra weight for Tanween (Ghunnah nasalization)
  const tanweens = (wordText.match(/[\u064B\u064C\u064D]/g) || []).length;
  weight += tanweens * 0.8;

  // Last word of an Ayah in Murattal recitation has Waqf & Madd 'Arid lis-Sukoon
  if (isLastWord) {
    weight += 2.0;
  }

  return weight;
}

/**
 * Partition words into speech intervals based on proportional Tajweed weights
 */
export function partitionWordsIntoIntervals(
  words: string[],
  speechIntervals: SpeechInterval[],
): WordIntervalGroup[] {
  const numWords = words.length;
  const numIntervals = speechIntervals.length;

  if (numIntervals === 1 || numWords <= numIntervals) {
    return [
      {
        interval: speechIntervals[0],
        words: words.map((w, i) => ({
          word: w,
          index: i + 1,
          weight: calculateWordWeight(w, i === numWords - 1),
        })),
      },
    ];
  }

  const wordWeights = words.map((w, idx) => calculateWordWeight(w, idx === numWords - 1));
  const totalWeight = wordWeights.reduce((a, b) => a + b, 0) || 1;
  const totalSpeechDuration = speechIntervals.reduce(
    (sum, int) => sum + Math.max(0, int.to - int.from),
    0,
  ) || 1;

  const result: WordIntervalGroup[] = [];
  let currentWordIdx = 0;
  let cumDuration = 0;

  for (let k = 0; k < numIntervals; k++) {
    const interval = speechIntervals[k];
    const isLastInterval = k === numIntervals - 1;
    cumDuration += Math.max(0, interval.to - interval.from);

    if (isLastInterval) {
      const assignedWords = [];
      for (let i = currentWordIdx; i < numWords; i++) {
        assignedWords.push({ word: words[i], index: i + 1, weight: wordWeights[i] });
      }
      result.push({ interval, words: assignedWords });
      break;
    }

    const targetFraction = cumDuration / totalSpeechDuration;
    const targetWeight = targetFraction * totalWeight;

    // Find best word cutoff that minimizes the error against target cumulative weight
    let currentCumWeight = 0;
    for (let i = 0; i < currentWordIdx; i++) currentCumWeight += wordWeights[i];

    let bestCutoff = currentWordIdx + 1;
    let minDiff = Infinity;

    // Ensure at least 1 word per remaining interval
    const maxCutoff = numWords - (numIntervals - 1 - k);
    for (let i = currentWordIdx; i < maxCutoff; i++) {
      currentCumWeight += wordWeights[i];
      const diff = Math.abs(currentCumWeight - targetWeight);
      if (diff < minDiff) {
        minDiff = diff;
        bestCutoff = i + 1;
      }
    }

    const assignedWords = [];
    for (let i = currentWordIdx; i < bestCutoff; i++) {
      assignedWords.push({ word: words[i], index: i + 1, weight: wordWeights[i] });
    }
    result.push({ interval, words: assignedWords });
    currentWordIdx = bestCutoff;
  }

  return result;
}

/**
 * Generate high-precision word segments from acoustic analysis
 */
export function generateAcousticWordSegments(
  words: string[],
  baseTimestampFrom: number,
  acousticInfo: AcousticInfo,
): Array<[number, number, number]> {
  const numWords = words.length;
  if (numWords === 0) return [];

  const { speechStart, speechEnd, pauses, durationMs } = acousticInfo;
  const effectiveEnd = speechEnd > speechStart ? speechEnd : durationMs;

  if (numWords === 1) {
    return [[1, baseTimestampFrom + speechStart, baseTimestampFrom + effectiveEnd]];
  }

  // Construct non-silent speech intervals
  const speechIntervals: SpeechInterval[] = [];
  if (!pauses || pauses.length === 0) {
    speechIntervals.push({ from: speechStart, to: effectiveEnd });
  } else {
    let lastFrom = speechStart;
    for (const p of pauses) {
      if (p.from > lastFrom + 80) {
        speechIntervals.push({ from: lastFrom, to: p.from });
      }
      lastFrom = p.to;
    }
    if (effectiveEnd > lastFrom + 80) {
      speechIntervals.push({ from: lastFrom, to: effectiveEnd });
    }
  }

  if (speechIntervals.length === 0) {
    speechIntervals.push({ from: speechStart, to: effectiveEnd });
  }

  const groups = partitionWordsIntoIntervals(words, speechIntervals);
  const segments: Array<[number, number, number]> = [];

  for (const group of groups) {
    const groupWords = group.words;
    if (groupWords.length === 0) continue;

    const groupInterval = group.interval;
    const groupDur = Math.max(50, groupInterval.to - groupInterval.from);
    const totalWeight = groupWords.reduce((sum, w) => sum + w.weight, 0) || 1;

    let currentStart = groupInterval.from;
    for (let i = 0; i < groupWords.length; i++) {
      const isLastInGroup = i === groupWords.length - 1;
      const wordDur = Math.round((groupWords[i].weight / totalWeight) * groupDur);
      const end = isLastInGroup ? groupInterval.to : currentStart + wordDur;
      segments.push([groupWords[i].index, baseTimestampFrom + currentStart, baseTimestampFrom + end]);
      currentStart = end;
    }
  }

  return segments;
}
