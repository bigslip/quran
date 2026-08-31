import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPalette.module.scss';

const FooterShortcuts: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.footer}>
      <div className={styles.footerShortcuts}>
        <span className={styles.shortcutItem}>
          <kbd className={styles.kbd}>↑</kbd>
          <kbd className={styles.kbd}>↓</kbd>
          <span>{t('command-bar.navigate') || 'Navigate'}</span>
        </span>
        <span className={styles.shortcutItem}>
          <kbd className={styles.kbd}>↵</kbd>
          <span>{t('command-bar.select') || 'Select'}</span>
        </span>
        <span className={styles.shortcutItem}>
          <kbd className={styles.kbd}>Tab</kbd>
          <span>{t('command-bar.filter') || 'Filter'}</span>
        </span>
        <span className={styles.shortcutItem}>
          <kbd className={styles.kbd}>Esc</kbd>
          <span>{t('command-bar.close') || 'Close'}</span>
        </span>
      </div>
    </div>
  );
};

export default FooterShortcuts;
