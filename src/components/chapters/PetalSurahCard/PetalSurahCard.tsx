import React, { useMemo, useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './PetalSurahCard.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import Link from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import Chapter from 'types/Chapter';

type PetalSurahCardProps = {
  chapter: Chapter;
  isPreload?: boolean;
};

const PetalSurahCard: React.FC<PetalSurahCardProps> = ({ chapter, isPreload = false }) => {
  const { t, lang } = useTranslation('common');

  // Derive localized strings efficiently with primitive dependencies (rerender-derived-state)
  const localizedSurahNumber = useMemo(
    () => toLocalizedNumber(Number(chapter.id), lang),
    [chapter.id, lang],
  );
  const localizedAyahCount = useMemo(
    () => toLocalizedNumber(chapter.versesCount, lang),
    [chapter.versesCount, lang],
  );

  const isMakkah = chapter.revelationPlace === 'makkah';

  // Stabilize event handler callback to prevent unnecessary child re-renders (rerender-memo)
  const handleCardClick = useCallback(() => {
    logButtonClick(`homepage_surah_card_${chapter.id}`);
  }, [chapter.id]);

  const revelationPlaceLabel = isMakkah
    ? t('common:makkah-short', { defaultValue: 'Makki' })
    : t('common:madinah-short', { defaultValue: 'Madani' });

  const cardAriaLabel = `${localizedSurahNumber}. Surah ${chapter.transliteratedName}, ${localizedAyahCount} ${t('common:ayahs', { defaultValue: 'Ayahs' })}, ${revelationPlaceLabel}`;

  return (
    <Link
      href={`/${chapter.id}`}
      shouldPrefetch={isPreload}
      className={styles.cardLink}
      onClick={handleCardClick}
      aria-label={cardAriaLabel}
      data-testid={`surah-petal-card-${chapter.id}`}
    >
      <div className={styles.petalCard}>
        {/* Base Petal Rosette Layer using shared hoisted SVG def (rendering-hoist-jsx) */}
        <svg
          className={styles.petalSvgBg}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 571 568"
          aria-hidden="true"
        >
          <use href="#muezzin-petal-path" />
        </svg>

        {/* Hover Petal Rosette Layer using shared hoisted SVG def (rendering-hoist-jsx) */}
        <svg
          className={styles.petalSvgHover}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 571 568"
          aria-hidden="true"
        >
          <use href="#muezzin-petal-path" />
        </svg>

        <div className={styles.cardContent}>
          <div className={styles.surahNumberBadge}>
            <span className={styles.badgeNumberText}>{localizedSurahNumber}</span>
          </div>

          <div className={styles.arabicTitle} translate="no">
            <ChapterIconContainer
              chapterId={chapter.id ? chapter.id.toString() : ''}
              hasSurahPrefix={false}
              size={ChapterIconsSize.Large}
            />
          </div>

          <div
            className={classNames(
              styles.transliteratedTitle,
              isMakkah ? styles.makkahTitle : styles.madinahTitle,
            )}
            translate="no"
          >
            {chapter.transliteratedName}
          </div>

          <div className={styles.ayahContainer}>
            <span className={styles.ayahTag}>{localizedAyahCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(PetalSurahCard);

