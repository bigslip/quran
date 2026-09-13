import React, { useCallback, useMemo } from 'react';

import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import AppStoreBadge from './HomePageApps/AppStoreBadge';
import CompanionAppCard, { AppItem } from './HomePageApps/CompanionAppCard';
import styles from './HomePageApps.module.scss';

import ArrowIcon from '@/icons/arrow.svg';
import MobileIcon from '@/icons/mobile.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { APPS_URL } from '@/utils/navigation';

const IOS_APP_URL = 'https://apps.apple.com/us/app/quran-by-quran-com-قرآن/id1118663303';
const ANDROID_APP_URL = 'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran';

const HomePageApps: React.FC = () => {
  const { t } = useTranslation('home');

  const handleAppClick = useCallback((appId: string) => {
    logButtonClick(`home_apps_${appId.replaceAll('-', '_')}`);
  }, []);

  const companionApps: AppItem[] = useMemo(
    () => [
      {
        id: 'quranreflect',
        name: t('apps.quranreflect.name'),
        description: t('apps.quranreflect.description'),
        iconSrc: '/images/app-portal/icon_web_optimized.png',
        iconAlt: t('apps.quranreflect.name'),
        href: 'https://quranreflect.com/apps',
      },
      {
        id: 'qariah',
        name: t('apps.qariah.name'),
        description: t('apps.qariah.description'),
        iconSrc: '/images/app-portal/featured/qaariah-icon.webp',
        iconAlt: t('apps.qariah.name'),
        href: 'https://qariah.app/',
      },
      {
        id: 'quran-space',
        name: t('apps.quran-space.name'),
        description: t('apps.quran-space.description'),
        iconSrc: '/images/app-portal/quran-space-100.jpg',
        iconAlt: t('apps.quran-space.name'),
        href: 'https://quran.space/',
      },
    ],
    [t],
  );

  return (
    <section className={styles.container} aria-label={t('apps.title')}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>{t('apps.title')}</h2>
          <p className={styles.subtitle}>{t('apps.description')}</p>
        </div>
        <Link
          href={APPS_URL}
          className={styles.seeMoreLink}
          onClick={() => logButtonClick('home_apps_see_more')}
        >
          <span>{t('apps.see-more')}</span>
          <ArrowIcon className={styles.linkArrow} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.sanctuaryCard}>
        <div className={styles.sanctuaryGlow} aria-hidden="true" />
        <div className={styles.sanctuaryContent}>
          <div className={styles.sanctuaryMeta}>
            <div className={styles.companionBadge}>
              <MobileIcon className={styles.mobileBadgeIcon} aria-hidden="true" />
              <span>{t('sanctuary-companion', { defaultValue: 'Mobile Companion' })}</span>
            </div>
            <h3 className={styles.sanctuaryTitle}>
              {t('companion-title', { defaultValue: 'Carry the Quran Everywhere' })}
            </h3>
            <p className={styles.sanctuaryDescription}>
              {t('companion-desc', {
                defaultValue:
                  'Read offline, listen to 30+ reciters, set custom goals, and sync your reading seamlessly across all your devices.',
              })}
            </p>

            <div className={styles.storeBadges}>
              <AppStoreBadge
                platform="ios"
                href={IOS_APP_URL}
                onClick={() => handleAppClick('quran-ios')}
              />
              <AppStoreBadge
                platform="android"
                href={ANDROID_APP_URL}
                onClick={() => handleAppClick('quran-android')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.companionGrid}>
        <div className={styles.ecosystemHeader}>
          <span className={styles.ecosystemTitle}>{t('apps.featured-apps')}</span>
        </div>
        <div className={styles.apps}>
          {companionApps.map((app) => (
            <CompanionAppCard key={app.id} app={app} onClick={handleAppClick} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(HomePageApps);
