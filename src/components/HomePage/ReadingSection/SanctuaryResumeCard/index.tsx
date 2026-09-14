import React, { useCallback, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SanctuaryResumeCard.module.scss';

import DataContext from '@/contexts/DataContext';
import ArrowIcon from '@/icons/arrow.svg';
import PlayIcon from '@/icons/play-arrow.svg';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl, getPageNavigationUrl } from '@/utils/navigation';

type Props = {
  surahNumber: number;
  verseNumber?: number;
  pageNumber?: number;
  isContinueReading?: boolean;
};

const SanctuaryResumeCard: React.FC<Props> = ({
  surahNumber,
  verseNumber = 1,
  pageNumber = 0,
  isContinueReading = false,
}) => {
  const { t, lang } = useTranslation('home');
  const chaptersData = useContext(DataContext);
  const surahNumberString = surahNumber.toString();
  const chapterData = getChapterData(chaptersData, surahNumberString);

  const link = pageNumber
    ? getPageNavigationUrl(pageNumber)
    : getChapterWithStartingVerseUrl(`${surahNumber}:${verseNumber}`, chapterData?.slug);

  const handleClick = useCallback(() => {
    logButtonClick(isContinueReading ? 'resume_reading_ribbon_click' : 'begin_reading_ribbon_click');
  }, [isContinueReading]);

  return (
    <a
      href={link}
      onClick={handleClick}
      className={styles.resumeContainer}
      data-testid="sanctuary-resume-action"
    >
      <div className={styles.surahMedallion}>
        <span>{toLocalizedNumber(surahNumber, lang)}</span>
      </div>
      <div className={styles.surahDetails}>
        <div className={styles.nameRow}>
          <span className={styles.transliteratedName} translate="no">
            {chapterData?.transliteratedName || 'Al-Fatihah'}
          </span>
          <span className={styles.arabicName} translate="no">
            {surahNumberString.padStart(3, '0')}
          </span>
        </div>
        <div className={styles.verseReference}>
          {isContinueReading ? (
            <span>
              {t('common:verse')} {toLocalizedNumber(verseNumber, lang)}
              {pageNumber ? ` (${t('common:page')} ${toLocalizedNumber(pageNumber, lang)})` : ''}
            </span>
          ) : (
            <span>{t('begin')}</span>
          )}
        </div>
      </div>
      <div className={styles.resumeCtaBadge}>
        {isContinueReading ? <PlayIcon /> : <ArrowIcon />}
        <span className={styles.ctaText}>
          {isContinueReading ? t('continue-read') : t('start-read')}
        </span>
      </div>
    </a>
  );
};

export default React.memo(SanctuaryResumeCard);
