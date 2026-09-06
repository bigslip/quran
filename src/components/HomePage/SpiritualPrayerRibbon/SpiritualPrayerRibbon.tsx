import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import PrayerArchCard, { PrayerArchData } from './PrayerArchCard';
import styles from './SpiritualPrayerRibbon.module.scss';

import useHasMounted from '@/hooks/useHasMounted';
import { getDailySpiritualData } from '@/utils/spiritualTime';

const PRAYER_METADATA = [
  {
    id: 'fajr' as const,
    nameKey: 'Fajr',
    arabicName: 'الفجر',
    subKey: 'fajr-sub',
    descKey: 'fajr-desc',
    defaultSub: 'DAWN',
    defaultDesc: 'Dawn prayer before morning sunrise',
  },
  {
    id: 'dhuhr' as const,
    nameKey: 'Dhuhr',
    arabicName: 'الظهر',
    subKey: 'dhuhr-sub',
    descKey: 'dhuhr-desc',
    defaultSub: 'MIDDAY',
    defaultDesc: 'Noon prayer as sun passes zenith',
  },
  {
    id: 'asr' as const,
    nameKey: 'Asr',
    arabicName: 'العصر',
    subKey: 'asr-sub',
    descKey: 'asr-desc',
    defaultSub: 'AFTERNOON',
    defaultDesc: 'Late afternoon prayer of remembrance',
  },
  {
    id: 'maghrib' as const,
    nameKey: 'Maghrib',
    arabicName: 'المغرب',
    subKey: 'maghrib-sub',
    descKey: 'maghrib-desc',
    defaultSub: 'SUNSET',
    defaultDesc: 'Sunset prayer immediately after dusk',
  },
  {
    id: 'isha' as const,
    nameKey: 'Isha',
    arabicName: 'العشاء',
    subKey: 'isha-sub',
    descKey: 'isha-desc',
    defaultSub: 'NIGHT',
    defaultDesc: 'Night prayer before resting in peace',
  },
];

const SpiritualPrayerRibbon: React.FC = () => {
  const { t, lang } = useTranslation('home');
  const hasMounted = useHasMounted();

  const spiritualData = useMemo(() => {
    if (!hasMounted) return null;
    return getDailySpiritualData(new Date(), lang);
  }, [hasMounted, lang]);

  const prayers: PrayerArchData[] = useMemo(() => {
    if (!spiritualData) return [];

    const milestonesMap = new Map(
      spiritualData.prayerMilestones.map((m) => [m.id, m]),
    );

    return PRAYER_METADATA.map((meta) => {
      const milestone = milestonesMap.get(meta.id);
      const isNext = milestone?.isNext ?? false;

      return {
        ...meta,
        time: milestone ? `${milestone.time}` : '--:--',
        isNext,
        remaining: isNext ? spiritualData.nextPrayerRemaining : undefined,
      };
    });
  }, [spiritualData]);

  if (!hasMounted || !spiritualData) {
    return null;
  }

  return (
    <section
      className={styles.ribbonContainer}
      aria-label={t('daily-spiritual-sanctuary', { defaultValue: 'Daily Spiritual Sanctuary' })}
    >
      {/* Upper Atmospheric Header Plaque */}
      <div className={styles.headerPlaque}>
        <div className={styles.dateBlock}>
          <span className={styles.crescentIcon} aria-hidden="true">
            ☪
          </span>
          <div className={styles.dateDetails}>
            <span className={styles.hijriDate}>{spiritualData.hijriDate}</span>
            <span className={styles.gregorianDate}>{spiritualData.gregorianDate}</span>
          </div>
        </div>

        <div className={styles.titleBlock}>
          <h2 className={styles.sanctuaryHeading}>
            {t('prayer-sanctuary-title', { defaultValue: 'Daily Prayer Sanctuary' })}
          </h2>
        </div>

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

      {/* 5-Arch Islamic Prayer Grid inspired by namaz.png */}
      <div className={styles.archGrid} role="list">
        {prayers.map((prayer, index) => (
          <PrayerArchCard
            key={prayer.id}
            prayer={prayer}
            isStaggered={index % 2 === 1}
          />
        ))}
      </div>
    </section>
  );
};

export default React.memo(SpiritualPrayerRibbon);
