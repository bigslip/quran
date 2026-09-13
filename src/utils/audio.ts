import VerseTiming from 'types/VerseTiming';

export const getVerseTimingByVerseKey = (verseKey: string, verseTimings: VerseTiming[]) => {
  return verseTimings.find((verseTiming) => verseTiming.verseKey === verseKey);
};

// format the number to match the the mp3 file name structure
// e.g formatNumber(3) => '003'
//     formatNumber(10) => '010'
const formatNumber = (num: number) => num.toString().padStart(3, '0');
export const QURANCDN_AUDIO_BASE_URL = '/audio/';
export const LOCAL_WBW_AUDIO_BASE_URL = '/audio/wbw/';

/**
 * Given chapter, verse, and wordLocation. Get the mp3 audio url
 * Resolves to the local static audio path (`/audio/wbw/001_002_001.mp3`)
 * with fallback support to CDN.
 *
 * @param {number} chapter the chapterId
 * @param {number} verse the verse number
 * @param {number} wordLocation the location of the word within a verse
 * @param {boolean} preferLocal whether to resolve locally from /audio/wbw/
 * @returns {string} audio url
 */
export const getWordByWordAudioUrl = (
  chapter: number,
  verse: number,
  wordLocation: number,
  preferLocal: boolean = true,
) => {
  const formattedChapter = formatNumber(chapter);
  const formattedVerse = formatNumber(verse);
  const formattedWordLocation = formatNumber(wordLocation);
  const fileName = `${formattedChapter}_${formattedVerse}_${formattedWordLocation}.mp3`;

  if (preferLocal) {
    return `${LOCAL_WBW_AUDIO_BASE_URL}${fileName}`;
  }

  return `${QURANCDN_AUDIO_BASE_URL}wbw/${fileName}`;
};

export const getWordByWordCdnAudioUrl = (
  chapter: number,
  verse: number,
  wordLocation: number,
) => {
  return getWordByWordAudioUrl(chapter, verse, wordLocation, false);
};

/**
 * Given a chapter ID and reciter ID, get the chapter-level mp3 audio URL.
 *
 * @param {number} chapter the chapter ID
 * @param {number} reciterId the reciter ID (defaults to 7 - Mishari Rashid al-Afasy)
 * @returns {string} full audio URL
 */
export const getChapterAudioUrl = (chapter: number, reciterId: number = 7): string => {
  const formattedChapter = formatNumber(chapter);
  return `https://quran.ir/audio/reciters/${reciterId}/${formattedChapter}.mp3`;
};
