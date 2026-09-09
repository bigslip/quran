import React, { useCallback, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './HomePageHero.module.scss';
import SanctuaryCommandBar from './SanctuaryCommandBar';

import { GradualSpacing } from '@/components/ui/gradual-spacing';
import Link from '@/dls/Link/Link';
import useGetContinueReadingUrl from '@/hooks/useGetContinueReadingUrl';
import useHasMounted from '@/hooks/useHasMounted';
import IconBookmarkFilled from '@/icons/bookmark_filled.svg';
import IconBookOpen from '@/icons/book-open.svg';
import Logo from '@/icons/logo_main.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getTimeOfDayPeriod, isFriday, isNightTime } from '@/utils/spiritualTime';

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
  const hasMounted = useHasMounted();
  const continueReadingUrl = useGetContinueReadingUrl();

  const isFridayToday = hasMounted && isFriday();
  const isNightNow = hasMounted && isNightTime();

  const greetingInfo = useMemo(() => {
    if (!hasMounted) {
      return {
        title: t('greeting', { defaultValue: 'Assalamu Alaikum' }),
        subtitle: t('hero-tagline', { defaultValue: 'Read · Recite · Reflect' }),
      };
    }
    if (isFridayToday) {
      return {
        title: t('greeting-friday', { defaultValue: "Jumu'ah Mubarak · Blessed Friday" }),
        subtitle: t('greeting-sub-friday', {
          defaultValue: 'Read Surah Al-Kahf for light between Fridays',
        }),
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
        };
      case 'afternoon':
        return {
          title: t('greeting-afternoon', { defaultValue: 'Assalamu Alaikum · Blessed Afternoon' }),
          subtitle: t('greeting-sub-afternoon', {
            defaultValue: 'A pause for remembrance amidst the day',
          }),
        };
      case 'evening':
        return {
          title: t('greeting-evening', { defaultValue: 'Assalamu Alaikum · Serene Evening' }),
          subtitle: t('greeting-sub-evening', {
            defaultValue: 'Serenity and reflection as dusk settles',
          }),
        };
      case 'night':
      default:
        return {
          title: t('greeting-night', { defaultValue: 'Assalamu Alaikum · Peaceful Night' }),
          subtitle: t('greeting-sub-night', {
            defaultValue: 'Peace and stillness in the words of Allah',
          }),
        };
    }
  }, [hasMounted, isFridayToday, t]);

  const onQuickJumpClick = useCallback((itemKey: string) => {
    logButtonClick('homepage_hero_quick_jump', { surah: itemKey });
  }, []);

  const onContinueReadingClick = useCallback(() => {
    logButtonClick('homepage_hero_continue_reading');
  }, []);

  const onExploreSurahsClick = useCallback(() => {
    logButtonClick('homepage_hero_explore_surahs');
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
    <div className={styles.outerContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.greetingCapsule}>
          <span className={styles.greetingBadge} suppressHydrationWarning>
            <span className={styles.greetingPulse} aria-hidden="true" />
            <span className={styles.greetingText} suppressHydrationWarning>
              {greetingInfo.title}
            </span>
          </span>
        </div>
        <div className={styles.logoContainer} role="img" aria-label="Quran.ir">
          <Logo aria-hidden="true" />
          <h1 className="sr-only">
            {t('hero-tagline', { defaultValue: 'The Noble Quran · Read, Listen & Reflect' })}
          </h1>
        </div>
        <GradualSpacing
          key={greetingInfo.subtitle}
          text={greetingInfo.subtitle}
          as="p"
          containerClassName={styles.heroSubtitle}
          duration={0.45}
          delayMultiple={0.02}
        />
        <SanctuaryCommandBar />
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
        <div className={styles.heroActionDock}>
          <Link
            href={continueReadingUrl}
            className={styles.continueReadingButton}
            onClick={onContinueReadingClick}
            data-testid="hero-continue-reading-btn"
          >
            <span className={styles.actionIcon} aria-hidden="true">
              <IconBookOpen />
            </span>
            <span>{t('continue-read', { defaultValue: 'Continue Reading' })}</span>
          </Link>
          <Link
            href="#chapter-and-juz-list"
            className={styles.exploreSurahsButton}
            onClick={onExploreSurahsClick}
            data-testid="hero-explore-surahs-btn"
          >
            <span className={styles.actionIcon} aria-hidden="true">
              <IconBookmarkFilled />
            </span>
            <span>{t('explore-surahs', { defaultValue: 'Explore 114 Surahs' })}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HomePageHero);
