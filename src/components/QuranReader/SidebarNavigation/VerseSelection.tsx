import { useState, useEffect, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, useDispatch } from 'react-redux';

import styles from './SidebarNavigation.module.scss';
import SurahList from './SurahList';
import VerseList from './VerseList';

import DataContext from '@/contexts/DataContext';
import useChapterIdsByUrlPath from '@/hooks/useChapterId';
import {
  selectLastReadVerseKey,
  setLastReadVerse,
} from '@/redux/slices/QuranReader/readingTracker';

type Props = {
  onAfterNavigationItemRouted?: (itemValue?: string, itemType?: string) => void;
};

const VerseSelection: React.FC<Props> = ({ onAfterNavigationItemRouted }) => {
  const { lang } = useTranslation('common');
  const dispatch = useDispatch();
  const chaptersData = useContext(DataContext);
  const chapterIds = useChapterIdsByUrlPath(lang);
  const urlChapterId = chapterIds && chapterIds.length > 0 ? chapterIds[0] : null;
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);

  // Default to the chapter from URL or last read chapter or chapter 1
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    urlChapterId || lastReadVerseKey.chapterId || '1',
  );

  useEffect(() => {
    // Update selected chapter when URL changes
    if (urlChapterId) {
      setSelectedChapterId(urlChapterId);
    }
  }, [urlChapterId]);

  // Custom handler for chapter selection that updates the selected chapter for verse list without navigating immediately
  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapterId(chapterId);

    // Update the last read verse to the first verse of the selected chapter
    const verseKey = `${chapterId}:1`;
    dispatch(
      setLastReadVerse({
        lastReadVerse: {
          ...lastReadVerseKey,
          verseKey,
          chapterId,
        },
        chaptersData,
      }),
    );
  };

  return (
    <div className={styles.surahBodyContainer}>
      <SurahList
        onAfterNavigationItemRouted={onAfterNavigationItemRouted}
        customChapterSelectHandler={handleChapterSelect}
        shouldDisableNavigation // Disable automatic navigation
        selectedChapterId={selectedChapterId}
      />
      <VerseList
        onAfterNavigationItemRouted={onAfterNavigationItemRouted}
        selectedChapterId={selectedChapterId}
      />
    </div>
  );
};

export default VerseSelection;
