import React from 'react';

import classNames from 'classnames';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import styles from './ChapterBlock.module.scss';
import ChapterIconContainer from './ChapterIcon/ChapterIconContainer';

import Chapter from 'types/Chapter';
import { toLocalizedNumber } from '@/utils/locale';

type Props = {
  chapter: Chapter;
};

const ChapterBlock: React.FC<Props> = ({ chapter }: Props) => {
  const { t, lang } = useTranslation('common');
  const chapterIdString = String(chapter.id);
  const localizedChapterNumber = toLocalizedNumber(Number(chapter.id), lang);
  const localizedVersesCount = toLocalizedNumber(chapter.versesCount, lang);

  return (
    <div key={chapter.id} className={styles.item}>
      <Link as={`/${chapter.id}`} href="/[chapterId]" passHref className={styles.link}>
        <div className={styles.container}>
          <div className={classNames(styles.leftContainer, styles.sectionContainer)}>
            <div className={styles.surahNumber}>
              <span>{localizedChapterNumber}</span>
            </div>
            <div className={styles.detailsContainer}>
              <div className={styles.nameArabic} translate="no">
                {chapter.transliteratedName}
              </div>
              <div className={styles.nameTranslated} translate="no">
                {chapter.translatedName as string}
              </div>
            </div>
          </div>
          <div className={classNames(styles.rightContainer, styles.sectionContainer)}>
            <div className={styles.chapterIconWrapper}>
              <ChapterIconContainer chapterId={chapterIdString} hasSurahPrefix={false} />
            </div>
            <p className={styles.numberOfVerses}>
              {localizedVersesCount} {t('ayahs')}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ChapterBlock;
