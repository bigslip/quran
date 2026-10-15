import React, { useContext } from 'react';

import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import JuzSelection from './JuzSelection';
import PageSelection from './PageSelection';
import SurahSelection from './SurahSelection';
import VerseSelection from './VerseSelection';

import {
  selectLastReadVerseKey,
  setLastReadVerse,
} from '@/redux/slices/QuranReader/readingTracker';
import {
  IsSidebarNavigationVisible,
  NavigationItem,
  setIsSidebarNavigationVisible,
} from '@/redux/slices/QuranReader/sidebarNavigation';
import NavigationItemType from '@/types/NavigationItemType';
import { isMobile } from '@/utils/responsive';
import DataContext from 'src/contexts/DataContext';

type Props = {
  isVisible: IsSidebarNavigationVisible;
  selectedNavigationItem: string;
};

const SidebarNavigationSelections: React.FC<Props> = ({ isVisible, selectedNavigationItem }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const chaptersData = useContext(DataContext);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const isHomePage = router.pathname === '/';
  // we skip requesting any selection list if the drawer is not open.
  if (!isVisible) return <></>;

  const updateReduxStateWithPage = (pageNumber: string) => {
    dispatch(
      setLastReadVerse({
        lastReadVerse: {
          ...lastReadVerseKey,
          page: pageNumber,
          // Clear chapter and verse context when navigating by page
          // to ensure consistent Redux state
          verseKey: null,
          chapterId: null,
        },
        chaptersData,
      }),
    );
  };

  const updateReduxWithChapterOnly = (chapterId: string) => {
    dispatch(
      setLastReadVerse({
        lastReadVerse: {
          ...lastReadVerseKey,
          verseKey: `${chapterId}:1`,
          chapterId,
        },
        chaptersData,
      }),
    );
  };

  const updateReduxStateWithChapter = (chapterId: string) => {
    updateReduxWithChapterOnly(chapterId);
  };

  const onAfterNavigationItemRouted = (itemValue?: string, itemType?: string) => {
    if (isMobile() || isHomePage) {
      dispatch(setIsSidebarNavigationVisible(false));
    }

    if (itemValue) {
      if (itemType === NavigationItemType.PAGE) {
        updateReduxStateWithPage(itemValue);
      } else if (itemType === NavigationItemType.CHAPTER) {
        updateReduxStateWithChapter(itemValue);
      }
    }
  };

  if (selectedNavigationItem === NavigationItem.Surah) {
    return <SurahSelection onAfterNavigationItemRouted={onAfterNavigationItemRouted} />;
  }
  if (selectedNavigationItem === NavigationItem.Juz) {
    return <JuzSelection onAfterNavigationItemRouted={onAfterNavigationItemRouted} />;
  }
  if (selectedNavigationItem === NavigationItem.Verse) {
    return <VerseSelection onAfterNavigationItemRouted={onAfterNavigationItemRouted} />;
  }

  return <PageSelection onAfterNavigationItemRouted={onAfterNavigationItemRouted} />;
};

export default SidebarNavigationSelections;
