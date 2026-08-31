import { DirectAyahJumpResult } from '../types';

import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import Chapter from 'types/Chapter';
import ChaptersData from 'types/ChaptersData';

const FAMOUS_AYAH_NAMES: Record<string, string> = {
  '2:255': 'Ayat Al-Kursi (The Throne Verse)',
  '2:285': 'Amanar Rasul',
  '2:286': 'End of Al-Baqarah',
  '3:18': 'Shahidallahu',
  '24:35': 'Ayat An-Nur (The Light Verse)',
  '36:1': 'Ya-Sin',
  '55:1': 'Surah Ar-Rahman',
  '59:22': 'End of Al-Hashr',
  '67:1': 'Surah Al-Mulk',
  '112:1': 'Surah Al-Ikhlas',
};

/**
 * Parses user input query to detect direct Ayah references (e.g. 2:255, 18:10, 36:1, surah 2 ayah 255).
 * Returns a DirectAyahJumpResult if valid, or null otherwise.
 */
export const parseDirectAyahJump = (
  query: string,
  chaptersData: ChaptersData,
): DirectAyahJumpResult | null => {
  if (!query || !chaptersData) return null;

  const trimmed = query.trim().toLowerCase();
  let surahNum: number | null = null;
  let verseNum: number | null = null;

  // Pattern 1: e.g. "2:255", "2/255", "2-255", "2.255", "2 255"
  const standardMatch = trimmed.match(/^(\d{1,3})\s*[:\/\.,\s-]\s*(\d{1,3})$/);
  if (standardMatch) {
    surahNum = Number(standardMatch[1]);
    verseNum = Number(standardMatch[2]);
  } else {
    // Pattern 2: e.g. "surah 2 ayah 255", "sura 18 verse 10", "chapter 36 v 1"
    const textMatch = trimmed.match(
      /^(?:surah|sura|chapter|s)\s*(\d{1,3})\s*(?:ayah|verse|aya|v|a|:|\/|-|\s)\s*(\d{1,3})$/,
    );
    if (textMatch) {
      surahNum = Number(textMatch[1]);
      verseNum = Number(textMatch[2]);
    } else {
      // Pattern 3: e.g. "2 ayah 255", "18 verse 10", "2v255", "2a255"
      const shortMatch = trimmed.match(/^(\d{1,3})\s*(?:ayah|verse|aya|v|a)\s*(\d{1,3})$/);
      if (shortMatch) {
        surahNum = Number(shortMatch[1]);
        verseNum = Number(shortMatch[2]);
      }
    }
  }

  if (surahNum === null || verseNum === null) {
    return null;
  }

  if (surahNum < 1 || surahNum > 114) {
    return null;
  }

  const chapter = chaptersData[surahNum.toString()] as Chapter;
  if (!chapter) {
    return null;
  }

  if (verseNum < 1 || verseNum > chapter.versesCount) {
    return null;
  }

  const verseKey = `${surahNum}:${verseNum}`;
  const famousName = FAMOUS_AYAH_NAMES[verseKey];
  const url = getChapterWithStartingVerseUrl(verseKey);

  return {
    surahNumber: surahNum,
    verseNumber: verseNum,
    chapter,
    famousName,
    url,
  };
};
