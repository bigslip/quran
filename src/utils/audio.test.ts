import { describe, expect, it } from 'vitest';
import {
  getChapterAudioUrl,
  getWordByWordAudioUrl,
  getWordByWordCdnAudioUrl,
  LOCAL_WBW_AUDIO_BASE_URL,
  QURANCDN_AUDIO_BASE_URL,
} from './audio';

describe('Word-by-word Audio Utils', () => {
  it('generates local project audio URLs by default', () => {
    const url = getWordByWordAudioUrl(1, 1, 1);
    expect(url).toBe(`${LOCAL_WBW_AUDIO_BASE_URL}001_001_001.mp3`);
  });

  it('generates padded local audio URLs for multidigit chapters, verses, and words', () => {
    const url = getWordByWordAudioUrl(2, 255, 12);
    expect(url).toBe(`${LOCAL_WBW_AUDIO_BASE_URL}002_255_012.mp3`);
  });

  it('generates remote CDN audio URLs when preferLocal is false', () => {
    const url = getWordByWordAudioUrl(1, 1, 1, false);
    expect(url).toBe(`${QURANCDN_AUDIO_BASE_URL}wbw/001_001_001.mp3`);
  });

  it('generates CDN URLs via getWordByWordCdnAudioUrl helper', () => {
    const url = getWordByWordCdnAudioUrl(36, 1, 1);
    expect(url).toBe(`${QURANCDN_AUDIO_BASE_URL}wbw/036_001_001.mp3`);
  });

  it('generates chapter audio URLs for default and custom reciter', () => {
    expect(getChapterAudioUrl(2)).toBe('https://quran.ir/audio/reciters/7/002.mp3');
    expect(getChapterAudioUrl(114, 2)).toBe('https://quran.ir/audio/reciters/2/114.mp3');
  });
});
