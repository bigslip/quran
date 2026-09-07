import React, { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './PetalSurahCard.module.scss';

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
        {/* 8-Lobed Scalloped Petal SVG Silhouette */}
        <svg className={styles.petalSvgBg} viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <linearGradient id={`petalGrad-${chapter.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffef5" />
              <stop offset="55%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <path
            d="M 100,6 C 110,20 122,26 136,26 C 150,26 160,36 160,50 C 174,50 180,62 188,72 C 196,82 196,96 196,100 C 196,104 196,118 188,128 C 180,138 174,150 160,150 C 160,164 150,174 136,174 C 122,174 110,180 100,194 C 90,180 78,174 64,174 C 50,174 40,164 40,150 C 26,150 20,138 12,128 C 4,118 4,104 4,100 C 4,96 4,82 12,72 C 20,62 26,50 40,50 C 40,36 50,26 64,26 C 78,26 90,20 100,6 Z"
            fill={`url(#petalGrad-${chapter.id})`}
            className={styles.petalPath}
          />
        </svg>

        <div className={styles.cardContent}>
          <div className={styles.surahNumberBadge}>
            <span>{localizedSurahNumber}</span>
          </div>

          <div className={styles.arabicTitle} translate="no">
            {chapter.nameArabic}
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
