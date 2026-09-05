import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SpiritualPrayerRibbon.module.scss';

import useHasMounted from '@/hooks/useHasMounted';
import { getDailySpiritualData } from '@/utils/spiritualTime';

const SpiritualPrayerRibbon: React.FC = () => {
  const { t, lang } = useTranslation('home');
  const hasMounted = useHasMounted();

  const spiritualData = useMemo(() => {
    if (!hasMounted) return null;
    return getDailySpiritualData(new Date(), lang);
  }, [hasMounted, lang]);

  if (!hasMounted || !spiritualData) {
    return null;
  }

  return (
    <section
      className={styles.ribbonContainer}
      aria-label={t('daily-spiritual-sanctuary', { defaultValue: 'Daily Spiritual Sanctuary' })}
    >
      <div className={styles.plaque}>
        {/* Left: Hijri Date & Status */}
        <div className={styles.dateBlock}>
          <span className={styles.crescentIcon} aria-hidden="true">
            ☪
          </span>
          <div className={styles.dateDetails}>
            <span className={styles.hijriDate}>{spiritualData.hijriDate}</span>
            <span className={styles.gregorianDate}>{spiritualData.gregorianDate}</span>
          </div>
        </div>

        {/* Center: Prayer Times Timeline */}
        <div className={styles.prayerTimeline} role="list">
          {spiritualData.prayerMilestones.map((milestone) => (
            <div
              key={milestone.id}
              role="listitem"
              className={`${styles.prayerPill} ${milestone.isNext ? styles.nextPrayer : ''}`}
            >
              <span className={styles.prayerName}>
                {t(`prayer-${milestone.id}`, { defaultValue: milestone.nameKey })}
              </span>
              <span className={styles.prayerTime}>{milestone.time}</span>
              {milestone.isNext && <span className={styles.nextDot} aria-hidden="true" />}
            </div>
          ))}
        </div>

        {/* Right: Next Prayer Countdown */}
        <div className={styles.countdownBadge}>
          <span className={styles.countdownLabel}>
            {t('next-prayer-prefix', { defaultValue: 'Next' })}:{' '}
            <strong>{spiritualData.nextPrayerName}</strong>
          </span>
          <span className={styles.countdownTimer}>
            {t('in-time', {
              time: spiritualData.nextPrayerRemaining,
              defaultValue: `in ${spiritualData.nextPrayerRemaining}`,
            })}
          </span>
        </div>
      </div>
    </section>
  );
};

export default React.memo(SpiritualPrayerRibbon);
