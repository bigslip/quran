import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonType } from '@/dls/Button/Button';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { getChapterData, isFirstSurah, isLastSurah } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { getSurahNavigationUrl, getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { isLastVerseOfSurah as isLastVerse } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
import Verse from 'types/Verse';

interface Props {
  lastVerse: Verse;
}

const VerseControls: React.FC<Props> = ({ lastVerse }) => {
  const { t } = useTranslation('quran-reader');
  const chaptersData = useContext(DataContext);
  const { chapterId, verseNumber, verseKey } = lastVerse;
  const chapterNumber = Number(chapterId);
  const isLastVerseOfSurah = isLastVerse(chaptersData, String(chapterId), verseNumber);

  const currentChapterData = getChapterData(chaptersData, String(chapterNumber));
  const prevChapterData = getChapterData(chaptersData, String(chapterNumber - 1));
  const nextChapterData = getChapterData(chaptersData, String(chapterNumber + 1));

  return (
    <>
      {isLastVerseOfSurah && !isFirstSurah(chapterNumber) && (
        <Button
          type={ButtonType.Secondary}
          prefix={<ChevronLeftIcon />}
          href={getSurahNavigationUrl(prevChapterData?.slug || chapterNumber - 1)}
          onClick={() => {
            logButtonClick('verse_control_prev_chapter');
          }}
          data-testid="previous-surah-button"
        >
          {t('prev-surah')}
        </Button>
      )}
      {!isLastVerseOfSurah && (
        <>
          <Button
            type={ButtonType.Secondary}
            href={getSurahNavigationUrl(currentChapterData?.slug || chapterNumber)}
            onClick={() => {
              logButtonClick('verse_control_full_chapter');
            }}
          >
            {t('full-surah-cta')}
          </Button>
          <Button
            href={getChapterWithStartingVerseUrl(verseKey)}
            onClick={() => {
              logButtonClick('verse_control_continue');
            }}
          >
            {t('common:continue')}
          </Button>
        </>
      )}
      {isLastVerseOfSurah && (
        <Button
          type={ButtonType.Secondary}
          href={getSurahNavigationUrl(currentChapterData?.slug || chapterNumber)}
          onClick={() => {
            logButtonClick('verse_control_chapter_beginning');
          }}
          data-testid="chapter-beginning-button"
        >
          {t('surah-beginning')}
        </Button>
      )}
      {isLastVerseOfSurah && !isLastSurah(chapterNumber) && (
        <Button
          type={ButtonType.Secondary}
          suffix={<ChevronRightIcon />}
          href={getSurahNavigationUrl(nextChapterData?.slug || chapterNumber + 1)}
          onClick={() => {
            logButtonClick('verse_control_next_chapter');
          }}
          data-testid="next-surah-button"
        >
          {t('next-surah')}
        </Button>
      )}
    </>
  );
};

export default VerseControls;
