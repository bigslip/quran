import { useState } from 'react';

import Head from 'next/head';

import NavigationButton from './HeroButtons/NavigationButton';
import PopularButton from './HeroButtons/PopularButton';
import styles from './HomePageHero.module.scss';

import PopularDropdown from '@/components/HomePage/PopularDropdown';
import Link from '@/dls/Link/Link';
import Background from '@/icons/background.svg';
import Logo from '@/icons/logo_main.svg';
import { logButtonClick } from '@/utils/eventLogger';

const QUICK_JUMP_PILLS = [
  { label: 'Surah Yaseen (36)', href: '/36', key: 'yaseen' },
  { label: 'Surah Al-Mulk (67)', href: '/67', key: 'mulk' },
  { label: 'Surah Al-Kahf (18)', href: '/18', key: 'kahf' },
  { label: 'Ayah Al-Kursi (2:255)', href: '/2/255', key: 'kursi' },
  { label: 'Juz 30 (Amma)', href: '/juz/30', key: 'juz30' },
];

const HomePageHero = () => {
  const [isPopularDropdownOpen, setIsPopularDropdownOpen] = useState(false);

  const handlePopularClick = () => {
    setIsPopularDropdownOpen((prev) => !prev);
  };

  const handleDropdownClose = () => {
    setIsPopularDropdownOpen(false);
  };

  const onQuickJumpClick = (itemKey: string) => {
    logButtonClick('homepage_hero_quick_jump', { surah: itemKey });
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
              <span className={styles.greetingText}>Assalamu Alaikum</span>
            </span>
          </div>
          <div className={styles.logoContainer}>
            <Logo />
          </div>
          <div className={styles.quickJumpContainer}>
            <div className={styles.quickJumpList}>
              {QUICK_JUMP_PILLS.map((pill) => (
                <Link
                  key={pill.href}
                  href={pill.href}
                  className={styles.quickJumpPill}
                  onClick={() => onQuickJumpClick(pill.key)}
                >
                  <span className={styles.pillText}>{pill.label}</span>
                </Link>
              ))}
            </div>
          </div>
          {!isPopularDropdownOpen && (
            <div className={styles.buttonsContainer}>
              <NavigationButton />
              <PopularButton onClick={handlePopularClick} />
            </div>
          )}
          <PopularDropdown isOpen={isPopularDropdownOpen} onClose={handleDropdownClose} />
        </div>
      </div>
    </div>
  );
};
export default HomePageHero;

