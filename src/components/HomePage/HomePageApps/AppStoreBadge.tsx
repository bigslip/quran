import React from 'react';

import classNames from 'classnames';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import styles from '../HomePageApps.module.scss';

import AppleIcon from '@/icons/apple.svg';
import GoogleIcon from '@/icons/google.svg';

interface AppStoreBadgeProps {
  platform: 'ios' | 'android';
  href: string;
  onClick: () => void;
}

const AppStoreBadge: React.FC<AppStoreBadgeProps> = ({ platform, href, onClick }) => {
  const { t } = useTranslation('home');
  const isIos = platform === 'ios';

  return (
    <Link
      href={href}
      className={classNames(styles.storeButton, isIos ? styles.iosButton : styles.androidButton)}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
    >
      {isIos ? (
        <AppleIcon className={styles.storeIcon} />
      ) : (
        <GoogleIcon className={styles.storeIcon} />
      )}
      <div className={styles.storeText}>
        <span className={styles.storeSubtext}>
          {isIos
            ? t('download-on', { defaultValue: 'Download on the' })
            : t('get-it-on', { defaultValue: 'Get it on' })}
        </span>
        <span className={styles.storeTitle}>
          {isIos
            ? t('app-store', { defaultValue: 'App Store' })
            : t('google-play', { defaultValue: 'Google Play' })}
        </span>
      </div>
    </Link>
  );
};

export default React.memo(AppStoreBadge);
