import React, { useCallback } from 'react';

import classNames from 'classnames';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import styles from './Footer.module.scss';

import AppleIcon from '@/icons/apple.svg';
import GoogleIcon from '@/icons/google.svg';
import { logButtonClick } from '@/utils/eventLogger';

interface AppStoreBadgeProps {
  platform: 'ios' | 'android';
  href: string;
  className?: string;
  onClick?: () => void;
}

const AppStoreBadge: React.FC<AppStoreBadgeProps> = ({ platform, href, className, onClick }) => {
  const { t } = useTranslation('common');
  const isIos = platform === 'ios';

  const handleClick = useCallback(() => {
    logButtonClick(isIos ? 'footer_app_store' : 'footer_google_play');
    if (onClick) {
      onClick();
    }
  }, [isIos, onClick]);

  return (
    <Link
      href={href}
      className={classNames(styles.appBadge, isIos ? styles.iosBadge : styles.androidBadge, className)}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        isIos
          ? `${t('footer.download-on', { defaultValue: 'Download on the' })} ${t('footer.app-store', { defaultValue: 'App Store' })}`
          : `${t('footer.get-it-on', { defaultValue: 'Get it on' })} ${t('footer.google-play', { defaultValue: 'Google Play' })}`
      }
    >
      <span className={styles.badgeIconWrapper}>
        {isIos ? (
          <AppleIcon className={styles.badgeIcon} aria-hidden="true" />
        ) : (
          <GoogleIcon className={styles.badgeIcon} aria-hidden="true" />
        )}
      </span>
      <span className={styles.badgeText}>
        <span className={styles.badgeSubtext}>
          {isIos
            ? t('footer.download-on', { defaultValue: 'Download on the' })
            : t('footer.get-it-on', { defaultValue: 'Get it on' })}
        </span>
        <span className={styles.badgeTitle}>
          {isIos
            ? t('footer.app-store', { defaultValue: 'App Store' })
            : t('footer.google-play', { defaultValue: 'Google Play' })}
        </span>
      </span>
    </Link>
  );
};

export default React.memo(AppStoreBadge);
