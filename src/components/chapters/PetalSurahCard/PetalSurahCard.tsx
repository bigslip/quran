import React, { useMemo } from 'react';

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
  const localizedSurahNumber = useMemo(
    () => toLocalizedNumber(Number(chapter.id), lang),
    [chapter.id, lang],
  );
  const localizedAyahCount = useMemo(
    () => toLocalizedNumber(chapter.versesCount, lang),
    [chapter.versesCount, lang],
  );

  const isMakkah = chapter.revelationPlace === 'makkah';

  return (
    <Link
      href={`/${chapter.id}`}
      shouldPrefetch={isPreload}
      className={styles.cardLink}
      onClick={() => logButtonClick(`homepage_surah_card_${chapter.id}`)}
      data-testid={`surah-petal-card-${chapter.id}`}
    >
      <div className={styles.petalCard}>
        {/* Authentic Islamic Diamond 8-Scalloped Rosette SVG from surah.jpeg */}
        <svg className={styles.petalSvgBg} viewBox="0 0 160 160" aria-hidden="true">
          <defs>
            <linearGradient id={`petalGrad-${chapter.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffef7" />
              <stop offset="45%" stopColor="#fdf7db" />
              <stop offset="100%" stopColor="#fcf0b0" />
            </linearGradient>
          </defs>
          <path
            d="M 80,6 C 84,15 89,21 97,25 C 107,29 115,27 123,37 C 133,45 131,53 135,63 C 139,71 145,76 154,80 C 145,84 139,89 135,97 C 131,107 133,115 123,123 C 115,133 107,131 97,135 C 89,139 84,145 80,154 C 76,145 71,139 63,135 C 53,131 45,133 37,123 C 27,115 29,107 25,97 C 21,89 15,84 6,80 C 15,76 21,71 25,63 C 29,53 27,45 37,37 C 45,27 53,29 63,25 C 71,21 76,15 80,6 Z"
            fill={`url(#petalGrad-${chapter.id})`}
            className={styles.petalPath}
          />
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

          <div className={styles.transliteratedTitle} translate="no">
            {chapter.transliteratedName}
          </div>

          <div className={styles.metaRow}>
            <span className={styles.ayahTag}>
              {localizedAyahCount} {t('common:ayahs', { defaultValue: 'Ayahs' })}
            </span>
            <span
              className={classNames(
                styles.revelationTag,
                isMakkah ? styles.makkah : styles.madinah,
              )}
            >
              {isMakkah
                ? t('common:makkah-short', { defaultValue: 'Makki' })
                : t('common:madinah-short', { defaultValue: 'Madani' })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(PetalSurahCard);
