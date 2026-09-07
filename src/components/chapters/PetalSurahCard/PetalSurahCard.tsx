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
        {/* Authentic Islamic Diamond 8-Scalloped Rosette SVG */}
        <svg className={styles.petalSvgBg} viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <linearGradient id={`petalGrad-${chapter.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffef7" />
              <stop offset="60%" stopColor="#fef9c3" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
          </defs>
          <path
            d="M 100,4 C 108,16 118,22 128,18 C 138,14 146,24 144,36 C 142,48 148,58 160,62 C 172,66 174,78 168,88 C 180,92 192,94 196,100 C 192,106 180,108 168,112 C 174,122 172,134 160,138 C 148,142 142,152 144,164 C 146,176 138,186 128,182 C 118,178 108,184 100,196 C 92,184 82,178 72,182 C 62,186 54,176 56,164 C 58,152 52,142 40,138 C 28,134 26,122 32,112 C 20,108 8,106 4,100 C 8,94 20,92 32,88 C 26,78 28,66 40,62 C 52,58 58,48 56,36 C 54,24 62,14 72,18 C 82,22 92,16 100,4 Z"
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
