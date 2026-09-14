import { useContext, useMemo } from 'react';

import { useSelector } from 'react-redux';

import DataContext from '@/contexts/DataContext';
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { getChapterData } from '@/utils/chapter';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

/**
 * A hook that gets the continue reading URL for the user.
 * It tries multiple sources in order of priority:
 * 1. Most recent reading session
 * 2. Redux lastReadVerse
 * 3. Default to first surah
 *
 * @returns {string} The continue reading URL
 */
const useGetContinueReadingUrl = (): string => {
  const lastReadVerseFromRedux = useSelector(selectLastReadVerseKey);
  const { recentlyReadVerseKeys } = useGetRecentlyReadVerseKeys(false);
  const chaptersData = useContext(DataContext);

  const continueReadingUrl = useMemo(() => {
    const lastReadSession = recentlyReadVerseKeys?.[0];
    if (lastReadSession) {
      const chapterData = getChapterData(chaptersData, String(lastReadSession.surah));
      return getChapterWithStartingVerseUrl(
        `${lastReadSession.surah}:${lastReadSession.ayah}`,
        chapterData?.slug,
      );
    }

    if (lastReadVerseFromRedux?.verseKey) {
      const [chapterId] = getVerseAndChapterNumbersFromKey(lastReadVerseFromRedux.verseKey);
      const chapterData = getChapterData(chaptersData, chapterId);
      return getChapterWithStartingVerseUrl(lastReadVerseFromRedux.verseKey, chapterData?.slug);
    }

    const firstChapterData = getChapterData(chaptersData, '1');
    return getChapterWithStartingVerseUrl('1:1', firstChapterData?.slug || 'al-fatihah');
  }, [recentlyReadVerseKeys, lastReadVerseFromRedux, chaptersData]);

  return continueReadingUrl;
};

export default useGetContinueReadingUrl;
