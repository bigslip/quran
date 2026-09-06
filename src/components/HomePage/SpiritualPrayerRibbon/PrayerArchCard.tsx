import React, { useState, useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './SpiritualPrayerRibbon.module.scss';

export interface PrayerArchData {
  id: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  nameKey: string;
  arabicName: string;
  subKey: string;
  descKey: string;
  defaultSub: string;
  defaultDesc: string;
  time: string;
  isNext?: boolean;
  remaining?: string;
}

interface PrayerArchCardProps {
  prayer: PrayerArchData;
  isStaggered?: boolean;
}

const PrayerArchCard: React.FC<PrayerArchCardProps> = ({ prayer, isStaggered }) => {
  const { t, lang } = useTranslation('home');
  const [showVirtue, setShowVirtue] = useState(false);
  const isArabic = lang === 'ar';

  const toggleVirtue = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setShowVirtue((prev) => !prev);
  }, []);

  return (
    <div
      className={classNames(styles.archCardWrapper, {
        [styles.staggered]: isStaggered,
        [styles.isNextPrayer]: prayer.isNext,
        [styles.showingVirtue]: showVirtue,
      })}
      role="listitem"
    >
      {/* Authentic Islamic Multi-foil Arch SVG Silhouette */}
      <svg
        className={styles.archSilhouette}
        viewBox="0 0 200 360"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M 10 90 C 10 75, 20 70, 30 70 C 20 60, 20 45, 35 40 C 35 25, 55 15, 75 18 C 85 8, 95 0, 100 0 C 105 0, 115 8, 125 18 C 145 15, 165 25, 165 40 C 180 45, 180 60, 170 70 C 180 70, 190 75, 190 90 L 190 270 C 190 285, 180 290, 170 290 C 180 300, 180 315, 165 320 C 165 335, 145 345, 125 342 C 115 352, 105 360, 100 360 C 95 360, 85 352, 75 342 C 55 345, 35 335, 35 320 C 20 315, 20 300, 30 290 C 20 290, 10 285, 10 270 Z"
          className={styles.archPath}
        />
      </svg>

      <div className={styles.archContent}>
        {/* Top: Sacred Emblem */}
        <div className={styles.topEmblem} aria-hidden="true">
          ﷲ
        </div>

        {/* Header: Prayer Name & Arabic Script */}
        <div className={styles.archHeader}>
          <h3 className={styles.archTitle}>
            {t(`prayer-${prayer.id}`, { defaultValue: prayer.nameKey })}
          </h3>
          {!isArabic && (
            <span className={styles.archSub}>
              (
              {t(`prayer-${prayer.id}-sub`, {
                defaultValue: prayer.defaultSub,
              })}
              )
            </span>
          )}
          {!isArabic && <span className={styles.archArabic}>{prayer.arabicName}</span>}
        </div>

        {/* Center: Golden Medallion from namaz.png */}
        <div className={styles.medallionWrapper}>
          <div className={styles.goldMedallion}>
            <span className={styles.medallionSparkle} aria-hidden="true">
              ✦
            </span>
            <span className={styles.medallionTime}>{prayer.time}</span>
          </div>
          {prayer.isNext && (
            <span className={styles.nextPillBadge}>
              {t('next-prayer-prefix', { defaultValue: 'NEXT' })}
            </span>
          )}
        </div>

        {/* Bottom: Devotional Description & Countdown */}
        <div className={styles.archFooter}>
          {showVirtue ? (
            <div className={styles.virtueBox}>
              <p className={styles.virtueText}>
                &ldquo;{t(`prayer-virtue-${prayer.id}`)}&rdquo;
              </p>
              <span className={styles.virtueSource}>
                [{t(`prayer-virtue-source-${prayer.id}`)}]
              </span>
            </div>
          ) : (
            <p className={styles.archDesc}>
              {t(`prayer-${prayer.id}-desc`, {
                defaultValue: prayer.defaultDesc,
              })}
            </p>
          )}

          <div className={styles.footerActions}>
            {prayer.isNext && prayer.remaining && (
              <span className={styles.activeCountdownBadge}>
                {t('in-time', {
                  time: prayer.remaining,
                  defaultValue: `in ${prayer.remaining}`,
                })}
              </span>
            )}

            <button
              type="button"
              className={styles.virtueTrigger}
              onClick={toggleVirtue}
              aria-expanded={showVirtue}
              aria-label={t('virtue-pill', { defaultValue: 'Virtue' })}
            >
              <span>✦</span>
              <span>{showVirtue ? t('common:close', { defaultValue: 'Close' }) : t('virtue-pill', { defaultValue: 'Virtue' })}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PrayerArchCard);
