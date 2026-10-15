import React from 'react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import styles from '../ChapterHeader.module.scss';
import { toLocalizedNumber } from '@/utils/locale';
import Chapter from 'types/Chapter';

interface ChapterBadgesRowProps {
  chapter: Chapter;
  juzNumber?: number;
}

const ChapterBadgesRow: React.FC<ChapterBadgesRowProps> = ({ chapter, juzNumber }) => {
  const { t, lang } = useTranslation('common');
  const isMakkah = chapter.revelationPlace === 'makkah';

  const localizedChapterId = toLocalizedNumber(Number(chapter.id), lang);
  const localizedVersesCount = toLocalizedNumber(chapter.versesCount, lang);
  const localizedJuzNumber = juzNumber ? toLocalizedNumber(juzNumber, lang) : null;

  return (
    <div
      className={styles.badgesRow}
      data-testid="chapter-badges-row"
      role="group"
      aria-label={t('chapter-details', { defaultValue: 'Chapter Details' })}
    >
      <span
        className={classNames(
          styles.badgeChip,
          isMakkah ? styles.makkahBadge : styles.madinahBadge,
        )}
      >
        <span className={styles.badgeIcon} aria-hidden="true">
          {isMakkah ? '🕌' : '🌴'}
        </span>
        <span>{isMakkah ? t('makkah-short', { defaultValue: 'Makki' }) : t('madani-short', { defaultValue: 'Madani' })}</span>
      </span>

      <span className={styles.badgeChip}>
        <span>{t('surah')} {localizedChapterId}</span>
      </span>

      <span className={styles.badgeChip}>
        <span>{localizedVersesCount} {t('ayahs')}</span>
      </span>

      {localizedJuzNumber && (
        <span className={styles.badgeChip}>
          <span>{t('juz')} {localizedJuzNumber}</span>
        </span>
      )}
    </div>
  );
};

export default React.memo(ChapterBadgesRow);
