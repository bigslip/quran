import React, { useContext } from 'react';

import classNames from 'classnames';

import styles from '../ChapterHeader.module.scss';

import ChapterActionBar from './ChapterActionBar';
import ChapterBadgesRow from './ChapterBadgesRow';
import ChapterIcon from './ChapterIcon';

import DataContext from '@/contexts/DataContext';
import { getChapterData } from '@/utils/chapter';

interface SanctuaryHeaderCardProps {
  chapterId: string;
  juzNumber?: number;
  className?: string;
}

/**
 * SanctuaryHeaderCard component displays the central hero card for a chapter.
 * It contains metadata badges (Makki/Madani, Surah number, verses, Juz),
 * Arabic calligraphy icon, transliterated and translated titles,
 * and an interactive action bar (Surah Info, Share, Jump).
 *
 * @param {SanctuaryHeaderCardProps} props
 * @returns {JSX.Element | null}
 */
const SanctuaryHeaderCard: React.FC<SanctuaryHeaderCardProps> = ({
  chapterId,
  juzNumber,
  className,
}) => {
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId);

  if (!chapterData) {
    return null;
  }

  return (
    <div
      className={classNames(styles.sanctuaryCard, className)}
      data-testid="sanctuary-header-card"
    >
      <div className={styles.centralHeroSection}>
        <ChapterBadgesRow chapter={chapterData} juzNumber={juzNumber} />
        <ChapterIcon chapterId={chapterId} />
        <div className={styles.titlesBlock}>
          <h1 className={styles.sanctuaryTitle}>{chapterData.transliteratedName}</h1>
          <p className={styles.sanctuarySubtitle}>{chapterData.translatedName}</p>
        </div>
      </div>
      <ChapterActionBar chapterId={chapterId} chapterName={chapterData.transliteratedName} />
    </div>
  );
};

export default React.memo(SanctuaryHeaderCard);
