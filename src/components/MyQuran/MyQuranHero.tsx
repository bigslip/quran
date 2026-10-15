import React, { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './MyQuranHero.module.scss';
import MyQuranTab from './tabs';

import BookmarkIcon from '@/icons/bookmark.svg';
import EditIcon from '@/icons/edit.svg';
import HistoryIcon from '@/icons/history.svg';

export type MyQuranHeroProps = {
  selectedTab: MyQuranTab;
  onTabChange: (tab: MyQuranTab) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const MyQuranHero: React.FC<MyQuranHeroProps> = ({
  selectedTab,
  onTabChange,
  className,
  ...props
}) => {
  const { t } = useTranslation('my-quran');

  const tabs = useMemo(
    () => [
      {
        value: MyQuranTab.SAVED,
        label: t('saved'),
        icon: BookmarkIcon,
      },
      {
        value: MyQuranTab.RECENT,
        label: t('recent'),
        icon: HistoryIcon,
      },
      {
        value: MyQuranTab.NOTES_AND_REFLECTIONS,
        label: t('notes-and-reflections'),
        icon: EditIcon,
      },
    ],
    [t],
  );

  return (
    <div className={classNames(styles.outerContainer, className)} {...props}>
      <div className={styles.ambientGlow} aria-hidden="true" />
      <div className={styles.innerContainer}>
        {/* Sanctuary Badge */}
        <div className={styles.greetingCapsule}>
          <div className={styles.greetingBadge}>
            <span className={styles.greetingPulse} aria-hidden="true" />
            <span className={styles.greetingText}>{t('sanctuary-badge')}</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className={styles.heroTitle}>{t('hero-title')}</h1>
        <p className={styles.heroSubtitle}>{t('hero-subtitle')}</p>

        {/* Tab Switcher */}
        <div className={styles.tabSwitcherContainer} role="tablist" aria-label={t('tabs-aria')}>
          {tabs.map((tab) => {
            const isSelected = selectedTab === tab.value;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                id={`tab-${tab.value}`}
                aria-controls={`tabpanel-${tab.value}`}
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={classNames(styles.tabPill, {
                  [styles.activeTabPill]: isSelected,
                })}
                onClick={() => onTabChange(tab.value)}
              >
                <span className={styles.tabIcon} aria-hidden="true">
                  {typeof IconComponent === 'function' ? <IconComponent /> : null}
                </span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MyQuranHero);
