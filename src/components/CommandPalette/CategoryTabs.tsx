import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPalette.module.scss';
import { CommandPaletteTab } from './types';

interface Props {
  activeTab: CommandPaletteTab;
  onSelectTab: (tab: CommandPaletteTab) => void;
}

const CategoryTabs: React.FC<Props> = ({ activeTab, onSelectTab }) => {
  const { t } = useTranslation('common');

  const tabs = [
    { id: CommandPaletteTab.All, label: t('all') || 'All', icon: '✦' },
    { id: CommandPaletteTab.Surahs, label: `${t('surahs') || 'Surahs'} (114)`, icon: '📖' },
    { id: CommandPaletteTab.Juz, label: `${t('juz') || 'Juz'} (30)`, icon: '📑' },
    { id: CommandPaletteTab.Pages, label: `${t('pages') || 'Pages'} (604)`, icon: '📄' },
  ];

  return (
    <div className={styles.tabsContainer} role="tablist" aria-label="Navigation filters">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={classNames(styles.tabButton, {
              [styles.tabActive]: isActive,
            })}
            onClick={() => onSelectTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
