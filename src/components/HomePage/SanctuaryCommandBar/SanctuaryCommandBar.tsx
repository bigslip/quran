import React, { useCallback, useEffect, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './SanctuaryCommandBar.module.scss';

import SearchIcon from '@/icons/search.svg';
import { setIsSearchDrawerOpen } from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';

const SanctuaryCommandBar: React.FC = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMacPlatform =
        // @ts-ignore
        navigator.userAgentData?.platform === 'macOS' ||
        /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform);
      setIsMac(isMacPlatform);
    }
  }, []);

  const handleClick = useCallback(() => {
    dispatch(setIsSearchDrawerOpen(true));
    logButtonClick('homepage_hero_command_bar');
  }, [dispatch]);

  return (
    <button
      type="button"
      className={styles.commandBar}
      onClick={handleClick}
      aria-label={t('search.title', { defaultValue: 'Search Quran' })}
      data-testid="sanctuary-command-bar"
    >
      <div className={styles.leftGroup}>
        <span className={styles.searchIcon} aria-hidden="true">
          <SearchIcon />
        </span>
        <span className={styles.placeholderText}>
          {t('search.placeholder', {
            defaultValue: 'Search verses, surahs, topics, or jump to ayah...',
          })}
        </span>
      </div>
      <div className={styles.shortcutBadge} aria-hidden="true">
        <span>{isMac ? '⌘K' : 'Ctrl+K'}</span>
      </div>
    </button>
  );
};

export default SanctuaryCommandBar;
