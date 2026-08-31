import React, { forwardRef } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPalette.module.scss';

import { toLocalizedNumber } from '@/utils/locale';

interface Props {
  pageNumber: number;
  isActive: boolean;
  onSelect: () => void;
  onMouseEnter?: () => void;
}

const PageItem = forwardRef<HTMLLIElement, Props>(
  ({ pageNumber, isActive, onSelect, onMouseEnter }, ref) => {
    const { t, lang } = useTranslation('common');
    const localizedPage = toLocalizedNumber(pageNumber, lang);

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
          <div className={styles.itemBadge}>{localizedPage}</div>
          <div className={styles.itemInfo}>
            <div className={styles.itemTitleRow}>
              <span className={styles.itemTitle}>{`${t('page') || 'Page'} ${localizedPage}`}</span>
            </div>
          </div>
        </div>
      </li>
    );
  },
);

PageItem.displayName = 'PageItem';

export default PageItem;
