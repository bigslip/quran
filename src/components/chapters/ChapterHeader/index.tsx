/* eslint-disable i18next/no-literal-string */
import React, { useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './ChapterHeader.module.scss';
import BismillahSection from './components/BismillahSection';
import ChapterEvent from './components/ChapterEvent';
import ChapterIcon from './components/ChapterIcon';
import SurahInfoButton from './components/SurahInfoButton';
import TranslationSettingsButton from './components/TranslationSettingsButton';
import ReadingModeActions from './ReadingModeActions';

import { ChapterIconsSize } from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import PlayChapterAudioButton from '@/components/QuranReader/PlayChapterAudioButton';
import DataContext from '@/contexts/DataContext';
import useChapterEvent from '@/hooks/useChapterEvent';
import useDirection from '@/hooks/useDirection';
import useIsMobile from '@/hooks/useIsMobile';
import { selectReadingPreference } from '@/redux/slices/QuranReader/readingPreferences';
import Language from '@/types/Language';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber } from '@/utils/locale';
import isInReadingMode from '@/utils/readingPreference';

interface ChapterHeaderProps {
  chapterId: string;
  isTranslationView: boolean;
  className?: string;
}

/**
 * The ChapterHeader component that is shown at the top of the chapter page.
 * Directly inspired by Quran.com headerCard design.
 *
 * @param {ChapterHeaderProps} props
 * @returns {JSX.Element}
 */
const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  chapterId,
  isTranslationView,
  className,
}) => {
  const { t, lang } = useTranslation('quran-reader');
  const { t: tCommon } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId);
  const isArabic = lang === Language.AR;
  const direction = useDirection();
  const isMobile = useIsMobile();
  const readingPreference = useSelector(selectReadingPreference);
  const { showEvent, title, description, ctaText, ctaLink } = useChapterEvent(chapterId);

  // Check if we're in Reading mode (Arabic or Translation)
  const isReadingMode = isInReadingMode(readingPreference);

  const localizedChapterNumber = toLocalizedNumber(Number(chapterId), lang);
  const transliteratedName = chapterData?.transliteratedName || '';
  const translatedName = chapterData?.translatedName || '';
  const arabicName = chapterData?.nameArabic || '';

  return (
    <div dir={direction} className={styles.containerWrapper}>
      {showEvent && (
        <ChapterEvent title={title} description={description} ctaText={ctaText} ctaLink={ctaLink} />
      )}

      <div className={classNames(styles.container, className)}>
        {/* Main Header Card inspired by Quran.com */}
        <div className={styles.headerCard} data-testid="chapter-header-card">
          <div className={styles.titleContainer} data-testid="chapter-title">
            <div className={styles.titleTextContainer}>
              <div className={styles.titleRow}>
                <h1 className={styles.transliteratedName}>
                  {localizedChapterNumber}. {tCommon('surah')} {transliteratedName}
                </h1>
                <h2 className={styles.translatedName}>
                  {isArabic ? arabicName : translatedName}
                </h2>
              </div>
              <p className={styles.seoIntro}>
                {t('chapter-header-intro', {
                  chapterName: transliteratedName,
                  defaultValue: `Read and listen to Surah ${transliteratedName} with translation, tafsir, audio recitation, word-by-word meaning, and transliteration.`,
                })}
              </p>
            </div>

            <div aria-hidden="true" className={styles.arabicSurahNameContainer}>
              <div className={styles.header}>
                <div className={styles.chapterIconContainer}>
                  <ChapterIcon
                    chapterId={chapterId}
                    size={isMobile ? ChapterIconsSize.XMega : ChapterIconsSize.Massive}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className={classNames(styles.topControls, {
              [styles.isVerseByVerseMode]: isTranslationView,
            })}
            data-testid="chapter-header-top-controls"
          >
            <div className={styles.primaryActions}>
              <div className={styles.headerPlayButton}>
                <PlayChapterAudioButton chapterId={Number(chapterId)} />
              </div>
              <SurahInfoButton chapterId={chapterId} />
            </div>

            <div className={styles.secondaryActions}>
              {isReadingMode ? <ReadingModeActions /> : <TranslationSettingsButton />}
            </div>
          </div>
        </div>

        {/* Bismillah section */}
        <BismillahSection
          chapterId={chapterId}
          showTranslation={!isArabic}
          isTranslationView={isTranslationView}
        />
      </div>
    </div>
  );
};

export default React.memo(ChapterHeader);

