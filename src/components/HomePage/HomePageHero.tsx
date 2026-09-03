import { useState } from 'react';

import classNames from 'classnames';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import NavigationButton from './HeroButtons/NavigationButton';
import PopularButton from './HeroButtons/PopularButton';
import styles from './HomePageHero.module.scss';

import PopularDropdown from '@/components/HomePage/PopularDropdown';
import Link from '@/dls/Link/Link';
import useHasMounted from '@/hooks/useHasMounted';
import Background from '@/icons/background.svg';
import Logo from '@/icons/logo_main.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { isFriday, isNightTime } from '@/utils/spiritualTime';

const QUICK_JUMP_PILLS = [
  { label: 'Surah Yaseen (36)', href: '/36', key: 'yaseen' },
  { label: 'Surah Al-Mulk (67)', href: '/67', key: 'mulk' },
  { label: 'Surah Al-Kahf (18)', href: '/18', key: 'kahf' },
  { label: 'Ayah Al-Kursi (2:255)', href: '/2/255', key: 'kursi' },
  { label: 'Juz 30 (Amma)', href: '/juz/30', key: 'juz30' },
];

const HomePageHero = () => {
  const { t } = useTranslation('home');
  const [isPopularDropdownOpen, setIsPopularDropdownOpen] = useState(false);
  const hasMounted = useHasMounted();

  const isFridayToday = hasMounted && isFriday();
  const isNightNow = hasMounted && isNightTime();

  const handlePopularClick = () => {
    setIsPopularDropdownOpen((prev) => !prev);
  };

  const handleDropdownClose = () => {
    setIsPopularDropdownOpen(false);
  };

  const onQuickJumpClick = (itemKey: string) => {
    logButtonClick('homepage_hero_quick_jump', { surah: itemKey });
  };

  const getPillBadge = (key: string) => {
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
  };

  return (
    <div className={styles.outerContainer}>
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
              <span className={styles.greetingPulse} />
              <span className={styles.greetingText}>
                {t('greeting', { defaultValue: 'Assalamu Alaikum' })}
              </span>
            </span>
          </div>
          <div className={styles.logoContainer}>
            <Logo />
          </div>
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
          <PopularDropdown isOpen={isPopularDropdownOpen} onClose={handleDropdownClose} />
        </div>
      </div>
    </div>
  );
};
export default HomePageHero;
