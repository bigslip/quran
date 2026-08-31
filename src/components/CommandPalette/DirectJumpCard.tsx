import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPalette.module.scss';
import { DirectAyahJumpResult } from './types';

import { toLocalizedNumber } from '@/utils/locale';

interface Props {
  result: DirectAyahJumpResult;
  isActive: boolean;
  onSelect: () => void;
}

const DirectJumpCard: React.FC<Props> = ({ result, isActive, onSelect }) => {
  const { t, lang } = useTranslation('common');
  const localizedSurah = toLocalizedNumber(result.surahNumber, lang);
  const localizedAyah = toLocalizedNumber(result.verseNumber, lang);

  const title = `Surah ${result.chapter.transliteratedName}, Ayah ${localizedAyah}`;
  const subtitle = result.famousName
    ? `${result.famousName} • Surah ${localizedSurah} : ${localizedAyah}`
    : `${result.chapter.translatedName} • Surah ${localizedSurah} : ${localizedAyah}`;

  return (
    <div
      role="option"
      aria-selected={isActive}
      className={classNames(styles.directJumpCard, {
        [styles.itemActive]: isActive,
      })}
      onClick={onSelect}
    >
      <div className={styles.directJumpLeading}>
        <div className={styles.directJumpIconWrapper}>⚡</div>
        <div className={styles.directJumpText}>
          <span className={styles.directJumpTitle}>{title}</span>
          <span className={styles.directJumpSubtitle}>{subtitle}</span>
        </div>
      </div>
      <div className={styles.directJumpKeyHint}>
        <span>{t('command-bar.direct-jump-hint') || 'Press ↵ to go'}</span>
      </div>
    </div>
  );
};

export default DirectJumpCard;
