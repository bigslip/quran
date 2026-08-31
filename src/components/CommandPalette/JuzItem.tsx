import React, { forwardRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPalette.module.scss';

import { toLocalizedNumber } from '@/utils/locale';

interface Props {
  juzNumber: number;
  isActive: boolean;
  onSelect: () => void;
  onMouseEnter?: () => void;
}

const JuzItem = forwardRef<HTMLLIElement, Props>(
  ({ juzNumber, isActive, onSelect, onMouseEnter }, ref) => {
    const { t, lang } = useTranslation('common');
    const localizedJuz = toLocalizedNumber(juzNumber, lang);

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
          <div className={styles.itemBadge}>{localizedJuz}</div>
          <div className={styles.itemInfo}>
            <div className={styles.itemTitleRow}>
              <span className={styles.itemTitle}>{`${t('juz') || 'Juz'} ${localizedJuz}`}</span>
            </div>
          </div>
        </div>
      </li>
    );
  },
);

JuzItem.displayName = 'JuzItem';

export default JuzItem;
