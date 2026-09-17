import type { AudioDriver } from './audioDriver.ts';
import { getDefaultAudioDriver } from './audioDriver.ts';
import { getVerseAudioUrl } from './reciterService.ts';

export interface PlayingVerseInfo {
  reciterId: number;
  chapterId: number;
  verseNumber: number;
  verseKey: string;
}

/**
 * AudioPlayerService provides a high-level Quran recitation audio engine.
 *
 * Responsibilities:
 * - Resolves verse audio CDN streaming URLs based on reciter and verse identifiers.
 * - Manages playback lifecycle (play, pause, resume, stop).
 * - Tracks active verse info and state.
 * - Handles playback completion callbacks for continuous recitation and repeat loops.
 */
class AudioPlayerService {
  private driver: AudioDriver;
  private currentVerse: PlayingVerseInfo | null = null;

  constructor(driver?: AudioDriver) {
    this.driver = driver || getDefaultAudioDriver();
  }

  public setDriver(driver: AudioDriver): void {
    this.driver = driver;
  }

  public getDriver(): AudioDriver {
    return this.driver;
  }

  public async playVerse(
    reciterId: number,
    chapterId: number,
    verseNumber: number,
    onFinish?: () => void,
    onError?: (err: Error) => void
  ): Promise<void> {
    const url = getVerseAudioUrl(reciterId, chapterId, verseNumber);
    this.currentVerse = {
      reciterId,
      chapterId,
      verseNumber,
      verseKey: `${chapterId}:${verseNumber}`,
    };

    await this.driver.playSound(
      url,
      () => {
        onFinish?.();
      },
      (err) => {
        onError?.(err);
      }
    );
  }

  public async pause(): Promise<void> {
    await this.driver.pauseSound();
  }

  public async resume(): Promise<void> {
    await this.driver.resumeSound();
  }

  public async stop(): Promise<void> {
    this.currentVerse = null;
    await this.driver.stopSound();
  }

  public isPlaying(): boolean {
    return this.driver.isPlaying();
  }

  public getCurrentlyPlayingVerse(): PlayingVerseInfo | null {
    return this.currentVerse;
  }
}

export const audioPlayerService = new AudioPlayerService();
