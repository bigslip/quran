import React, { useCallback, useMemo, useState } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import NavigationButton from './HeroButtons/NavigationButton';
import PopularButton from './HeroButtons/PopularButton';
import styles from './HomePageHero.module.scss';

import Link from '@/dls/Link/Link';
import useHasMounted from '@/hooks/useHasMounted';
import Background from '@/icons/background.svg';
import Logo from '@/icons/logo_main.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getTimeOfDayPeriod, isFriday, isNightTime } from '@/utils/spiritualTime';

const PopularDropdown = dynamic(() => import('@/components/HomePage/PopularDropdown'), {
  ssr: false,
});

const QUICK_JUMP_PILLS = [
  {
    label: 'Surah Yaseen (36)',
    href: '/36',
    key: 'yaseen',
    subKey: 'quick-jump-yaseen',
    defaultSub: 'Heart of the Quran',
  },
  {
    label: 'Surah Al-Mulk (67)',
    href: '/67',
    key: 'mulk',
    subKey: 'quick-jump-mulk',
    defaultSub: 'Protection',
  },
  {
    label: 'Surah Al-Kahf (18)',
    href: '/18',
    key: 'kahf',
    subKey: 'quick-jump-kahf',
    defaultSub: 'Friday Sunnah',
  },
  {
    label: 'Ayah Al-Kursi (2:255)',
    href: '/2/255',
    key: 'kursi',
    subKey: 'quick-jump-kursi',
    defaultSub: 'Greatest Ayah',
  },
  {
    label: 'Juz 30 (Amma)',
    href: '/juz/30',
    key: 'juz30',
    subKey: 'quick-jump-juz30',
    defaultSub: '37 Surahs',
  },
];

const HomePageHero: React.FC = () => {
  const { t } = useTranslation('home');
  const [isPopularDropdownOpen, setIsPopularDropdownOpen] = useState(false);
  const hasMounted = useHasMounted();

  const isFridayToday = hasMounted && isFriday();
  const isNightNow = hasMounted && isNightTime();

  const greetingInfo = useMemo(() => {
    if (!hasMounted) {
      return {
        title: t('greeting', { defaultValue: 'Assalamu Alaikum' }),
        subtitle: t('hero-tagline', { defaultValue: 'Read · Recite · Reflect' }),
        auraClass: styles.morningAura,
      };
    }
    if (isFridayToday) {
      return {
        title: t('greeting-friday', { defaultValue: 'Jumu\'ah Mubarak · Blessed Friday' }),
        subtitle: t('greeting-sub-friday', {
          defaultValue: 'Read Surah Al-Kahf for light between Fridays',
        }),
        auraClass: styles.fridayAura,
      };
    }
    const period = getTimeOfDayPeriod();
    switch (period) {
      case 'morning':
        return {
          title: t('greeting-morning', { defaultValue: 'Assalamu Alaikum · Blessed Morning' }),
          subtitle: t('greeting-sub-morning', {
            defaultValue: 'Begin your day with the divine light of the Quran',
          }),
          auraClass: styles.morningAura,
        };
      case 'afternoon':
        return {
          title: t('greeting-afternoon', { defaultValue: 'Assalamu Alaikum · Blessed Afternoon' }),
          subtitle: t('greeting-sub-afternoon', {
            defaultValue: 'A pause for remembrance amidst the day',
          }),
          auraClass: styles.afternoonAura,
        };
      case 'evening':
        return {
          title: t('greeting-evening', { defaultValue: 'Assalamu Alaikum · Serene Evening' }),
          subtitle: t('greeting-sub-evening', {
            defaultValue: 'Serenity and reflection as dusk settles',
          }),
          auraClass: styles.eveningAura,
        };
      case 'night':
      default:
        return {
          title: t('greeting-night', { defaultValue: 'Assalamu Alaikum · Peaceful Night' }),
          subtitle: t('greeting-sub-night', {
            defaultValue: 'Peace and stillness in the words of Allah',
          }),
          auraClass: styles.nightAura,
        };
    }
  }, [hasMounted, isFridayToday, t]);

  const handlePopularClick = useCallback(() => {
    setIsPopularDropdownOpen((prev) => !prev);
  }, []);

  const handleDropdownClose = useCallback(() => {
    setIsPopularDropdownOpen(false);
  }, []);

  const onQuickJumpClick = useCallback((itemKey: string) => {
    logButtonClick('homepage_hero_quick_jump', { surah: itemKey });
  }, []);

  const getPillBadge = useCallback(
    (key: string) => {
      if (key === 'kahf' && isFridayToday) {
        return {
          badgeText: `✦ ${t('friday-sunnah', { defaultValue: 'Friday Sunnah' })}`,
          className: styles.fridayBadge,
          pillClassName: styles.fridayPill,
        };
      }
      if (key === 'mulk' && isNightNow) {
        return {
          badgeText: `☾ ${t('night-recitation', { defaultValue: 'Night Recitation' })}`,
          className: styles.nightBadge,
          pillClassName: styles.nightPill,
        };
      }
      return null;
    },
    [isFridayToday, isNightNow, t],
  );

  return (
    <div className={classNames(styles.outerContainer, greetingInfo.auraClass)}>
      <Head>
        <link rel="preload" as="image" href="/images/background.png" />
      </Head>
      <div className={styles.backgroundImage}>
        <Background />
      </div>
      <div>
        <div className={styles.innerContainer}>
          <div className={styles.greetingCapsule}>
            <span className={styles.greetingBadge}>
              <span className={styles.greetingPulse} aria-hidden="true" />
              <span className={styles.greetingText}>{greetingInfo.title}</span>
            </span>
          </div>
          <div className={styles.logoContainer}>
            <Logo />
          </div>
          <p className={styles.heroSubtitle}>{greetingInfo.subtitle}</p>
          <div className={styles.commandDeck}>
            <div className={styles.quickJumpContainer}>
              <div className={styles.quickJumpList}>
                {QUICK_JUMP_PILLS.map((pill) => {
                  const badgeInfo = getPillBadge(pill.key);
                  return (
                    <Link
                      key={pill.href}
                      href={pill.href}
                      className={classNames(styles.quickJumpPill, {
                        [badgeInfo?.pillClassName]: !!badgeInfo,
                      })}
                      onClick={() => onQuickJumpClick(pill.key)}
                    >
                      <span className={styles.pillText}>{pill.label}</span>
                      <span className={styles.pillSubText}>
                        {t(pill.subKey, { defaultValue: pill.defaultSub })}
                      </span>
                      {badgeInfo && (
                        <span className={classNames(styles.pillBadge, badgeInfo.className)}>
                          {badgeInfo.badgeText}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            {!isPopularDropdownOpen && (
              <div className={styles.buttonsContainer}>
                <NavigationButton />
                <PopularButton onClick={handlePopularClick} />
              </div>
            )}
          </div>
          {isPopularDropdownOpen && (
            <PopularDropdown isOpen={isPopularDropdownOpen} onClose={handleDropdownClose} />
          )}
        </div>
      </div>
    </div>
  );
};
export default React.memo(HomePageHero);
