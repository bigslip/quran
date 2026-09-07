import React, { useMemo } from 'react';

import { useSelector } from 'react-redux';
import useSWR from 'swr';

import AnnouncementPill from './AnnouncementPill';
import styles from './ReadingSection.module.scss';
import SanctuaryResumeCard from './SanctuaryResumeCard';
import SpiritualHabitWidget from './SpiritualHabitWidget';

import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import useGlobalReadingBookmark from '@/hooks/auth/useGlobalReadingBookmark';
import useMappedBookmark from '@/hooks/useMappedBookmark';
import { selectGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectUserState } from '@/redux/slices/session';
import BookmarkType from '@/types/BookmarkType';
import { getMushafId } from '@/utils/api';
import { GuestReadingBookmark } from '@/utils/bookmark';
import { getPageFirstVerseKey } from '@/utils/verse';

const ReadingSection: React.FC = () => {
  const { isGuest } = useSelector(selectUserState);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  // Use global reading bookmark hook
  const { readingBookmark: readingBookmarkData } = useGlobalReadingBookmark(mushafId);

  // Fetch recently read verses as fallback
  const { recentlyReadVerseKeys } = useGetRecentlyReadVerseKeys(false);

  // Get effective bookmark data
  const effectiveBookmark: GuestReadingBookmark | null = useMemo(() => {
    if (isGuest) {
      return guestReadingBookmark;
    }
    if (!readingBookmarkData) return null;
    return {
      key: readingBookmarkData.key,
      type: readingBookmarkData.type,
      verseNumber: readingBookmarkData.verseNumber,
      mushafId,
      createdAt:
        'createdAt' in readingBookmarkData
          ? (readingBookmarkData.createdAt as string)
          : new Date().toISOString(),
    };
  }, [isGuest, guestReadingBookmark, readingBookmarkData, mushafId]);

  const {
    needsMapping: needsCrossMushafMapping,
    effectivePageNumber,
    effectiveAyahVerseKey,
    mappedPageData,
    bookmarkMushafId,
  } = useMappedBookmark({
    bookmark: effectiveBookmark,
    currentMushafId: mushafId,
    swrKeyPrefix: 'map-bookmark-home',
  });

  const isPageBookmark = effectiveBookmark?.type === BookmarkType.Page;
  const storedPageNumber = isPageBookmark ? effectiveBookmark?.key : undefined;
  const needsPageMapping = isPageBookmark && storedPageNumber && needsCrossMushafMapping;
  const isMappingReady = !needsPageMapping || !!mappedPageData;

  const { data: firstVerseOfStoredPage } = useSWR(
    storedPageNumber && isMappingReady
      ? `first-verse-${storedPageNumber}-${bookmarkMushafId}`
      : null,
    async () => {
      if (mappedPageData?.firstVerseKey) {
        const [surah, verse] = mappedPageData.firstVerseKey.split(':');
        return { surahNumber: Number(surah), verseNumber: Number(verse) };
      }
      if (!storedPageNumber) return null;
      return getPageFirstVerseKey(storedPageNumber, bookmarkMushafId);
    },
  );

  const effectiveSurahNumber =
    effectiveAyahVerseKey?.surahNumber ??
    firstVerseOfStoredPage?.surahNumber ??
    recentlyReadVerseKeys?.[0]?.surah ??
    1;
  const effectiveVerseNumber =
    effectiveAyahVerseKey?.verseNumber ??
    firstVerseOfStoredPage?.verseNumber ??
    recentlyReadVerseKeys?.[0]?.ayah;

  const hasReadingSessions = Boolean(
    effectiveBookmark || (recentlyReadVerseKeys && recentlyReadVerseKeys.length > 0),
  );

  const surahNumber = Number(effectiveSurahNumber);
  const verseNumber = effectiveVerseNumber ? Number(effectiveVerseNumber) : undefined;
  const pageNumber = isPageBookmark ? effectivePageNumber ?? undefined : undefined;

  const { goal, streak, currentActivityDay } = useGetStreakWithMetadata({
    showDayName: true,
  });

  return (
    <section className={styles.ribbonWrapper} aria-label="Reading ribbon" data-testid="reading-ribbon-section">
      <div className={styles.sanctuaryRibbon}>
        <SanctuaryResumeCard
          surahNumber={surahNumber}
          verseNumber={verseNumber}
          pageNumber={pageNumber}
          isContinueReading={hasReadingSessions}
        />
        <div className={styles.actionsGroup}>
          <SpiritualHabitWidget
            streak={streak}
            goal={goal}
            currentActivityDay={currentActivityDay}
          />
          <AnnouncementPill />
        </div>
      </div>
    </section>
  );
};

export default React.memo(ReadingSection);
