import React from 'react';

import styles from '../ChapterHeader.module.scss';

import JumpToAyahButton from './JumpToAyahButton';
import ShareSurahButton from './ShareSurahButton';
import SurahInfoButton from './SurahInfoButton';

interface ChapterActionBarProps {
  chapterId: string;
  chapterName: string;
}

const ChapterActionBar: React.FC<ChapterActionBarProps> = ({ chapterId, chapterName }) => {
  return (
    <div
      className={styles.actionBar}
      role="toolbar"
      aria-label="Surah Actions"
      data-testid="chapter-action-bar"
    >
      <SurahInfoButton chapterId={chapterId} />
      <ShareSurahButton chapterId={chapterId} chapterName={chapterName} />
      <JumpToAyahButton chapterId={chapterId} />
    </div>
  );
};

export default React.memo(ChapterActionBar);
