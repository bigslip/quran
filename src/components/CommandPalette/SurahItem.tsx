import React, { forwardRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPalette.module.scss';

import { toLocalizedNumber } from '@/utils/locale';
import Chapter from 'types/Chapter';

interface Props {
  chapter: Chapter;
  isActive: boolean;
  onSelect: () => void;
  onMouseEnter?: () => void;
}

const SurahItem = forwardRef<HTMLLIElement, Props>(
  ({ chapter, isActive, onSelect, onMouseEnter }, ref) => {
    const { t, lang } = useTranslation('common');
    const chapterIdStr = String(chapter.id);
    const chapterNum = Number(chapter.id);
    const localizedId = toLocalizedNumber(chapterNum, lang);
    const localizedVerses = toLocalizedNumber(chapter.versesCount, lang);
    const revelationType =
      chapter.revelationPlace === 'makkah'
        ? t('makkah') || 'Meccan'
        : t('madinah') || 'Madinan';

    return (
      <li
        ref={ref}
        role="option"
        aria-selected={isActive}
        className={classNames(styles.listItem, {
          [styles.itemActive]: isActive,
        })}
        onClick={onSelect}
        onMouseEnter={onMouseEnter}
      >
        <div className={styles.itemLeading}>
          <div className={styles.itemBadge}>{localizedId}</div>
          <div className={styles.itemInfo}>
            <div className={styles.itemTitleRow}>
              <span className={styles.itemTitle} translate="no">
                {chapter.transliteratedName}
              </span>
              <span className={styles.itemTranslatedName} translate="no">
                {chapter.translatedName}
              </span>
            </div>
            <div className={styles.itemMetaRow}>
              <span>{`${localizedVerses} ${t('ayahs') || 'Ayahs'}`}</span>
              <span className={styles.itemDot}>•</span>
              <span>{revelationType}</span>
            </div>
          </div>
        </div>
        <div className={styles.itemTrailing}>
          <span className={styles.surahArabicIcon} translate="no">
            {chapterIdStr.padStart(3, '0')}
          </span>
        </div>
      </li>
    );
  },
);

SurahItem.displayName = 'SurahItem';

export default SurahItem;
