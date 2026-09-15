import { memo, useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './TajweedBar.module.scss';

import useThemeDetector from '@/hooks/useThemeDetector';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import {
  selectIsTajweedBarExpanded,
  setIsTajweedBarExpanded,
} from '@/redux/slices/QuranReader/contextMenu';
import { selectIsSidebarNavigationVisible } from '@/redux/slices/QuranReader/sidebarNavigation';
import { logEvent } from '@/utils/eventLogger';

const TAJWEED_RULES = [
  'edgham',
  'mad-2',
  'mad-2-4-6',
  'mad-4-5',
  'mad-6',
  'ekhfa',
  'qalqala',
  'tafkhim',
] as const;

const TajweedColors = () => {
  const { t } = useTranslation('quran-reader');
  const dispatch = useDispatch();

  const showTajweedBar = useSelector(selectIsTajweedBarExpanded);
  const isSidebarNavigationVisible = useSelector(selectIsSidebarNavigationVisible);
  const { themeVariant } = useThemeDetector();

  const toggle = useCallback(() => {
    const nextState = !showTajweedBar;
    dispatch(setIsTajweedBarExpanded(nextState));
    logEvent(nextState ? 'tajweed_bar_opened' : 'tajweed_bar_closed');
  }, [dispatch, showTajweedBar]);

  return (
    <aside
      aria-label={t('tajweed-colors')}
      className={classNames(styles.container, {
        [styles.withSidebarNavigation]: isSidebarNavigationVisible,
      })}
    >
      <div
        className={classNames(styles.drawerWrapper, {
          [styles.drawerExpanded]: showTajweedBar,
          [styles.drawerCollapsed]: !showTajweedBar,
        })}
        aria-hidden={!showTajweedBar}
      >
        <div className={styles.rulesCard}>
          <div className={styles.rulesGrid}>
            {TAJWEED_RULES.map((rule) => (
              <span className={styles.ruleChip} key={rule}>
                <span
                  className={classNames(styles.pip, styles[`${themeVariant}-${rule}`])}
                  aria-hidden="true"
                />
                <span className={styles.ruleLabel}>{t(rule)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        className={classNames(styles.switcher, {
          [styles.switcherActive]: showTajweedBar,
        })}
        onClick={toggle}
        aria-expanded={showTajweedBar}
        aria-label={t('tajweed-colors')}
      >
        <span className={styles.switcherText}>{t('tajweed-colors')}</span>
        <span
          className={classNames(styles.chevronIconContainer, {
            [styles.rotate180]: showTajweedBar,
          })}
        >
          <ChevronDownIcon className={styles.chevronIcon} />
        </span>
      </button>
    </aside>
  );
};

export default memo(TajweedColors);

