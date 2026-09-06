import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Footer.module.scss';

import IconContainer from '@/dls/IconContainer/IconContainer';
import Link from '@/dls/Link/Link';
import NavigateIcon from '@/icons/east.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getSearchQueryNavigationUrl } from '@/utils/navigation';

interface Props {
  searchQuery: string;
  onClose?: () => void;
}

const SearchModalFooter: React.FC<Props> = ({ searchQuery, onClose }) => {
  const { t } = useTranslation('common');

  const onAdvancedSearchClick = () => {
    logButtonClick('search_modal_advanced_search');
    onClose?.();
  };

  return (
    <div className={styles.footerContainer} data-testid="search-modal-footer">
      <div className={styles.shortcuts}>
        <span className={styles.shortcutItem}>
          <span className={styles.kbdGroup}>
            <kbd className={styles.kbd}>↑</kbd>
            <kbd className={styles.kbd}>↓</kbd>
          </span>
          <span className={styles.label}>
            {t('command-bar.navigate', { defaultValue: 'Navigate' })}
          </span>
        </span>
        <span className={styles.shortcutItem}>
          <kbd className={styles.kbd}>↵</kbd>
          <span className={styles.label}>
            {t('command-bar.select', { defaultValue: 'Select' })}
          </span>
        </span>
        <span className={styles.shortcutItem}>
          <kbd className={styles.kbd}>ESC</kbd>
          <span className={styles.label}>{t('command-bar.close', { defaultValue: 'Close' })}</span>
        </span>
      </div>
      <Link
        href={getSearchQueryNavigationUrl(searchQuery)}
        onClick={onAdvancedSearchClick}
        className={styles.advancedSearchLink}
      >
        <span>{t('search.switch-mode')}</span>
        <IconContainer shouldFlipOnRTL icon={<NavigateIcon />} />
      </Link>
    </div>
  );
};

export default SearchModalFooter;
