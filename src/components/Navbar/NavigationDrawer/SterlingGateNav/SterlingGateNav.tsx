/* eslint-disable max-lines */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './SterlingGateNav.module.scss';

import ThemeSwitcher from '@/components/Navbar/NavigationDrawer/ThemeSwitcher';
import NavbarLogoWrapper from '@/components/Navbar/Logo/NavbarLogoWrapper';
import ProfileAvatarButton from '@/components/Navbar/NavbarBody/ProfileAvatarButton';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import useAuthData from '@/hooks/auth/useAuthData';
import useGetContinueReadingUrl from '@/hooks/useGetContinueReadingUrl';
import usePreventBodyScrolling from '@/hooks/usePreventBodyScrolling';
import IconApps from '@/icons/apps.svg';
import IconBookmarkFilled from '@/icons/bookmark_filled.svg';
import IconBookOpen from '@/icons/book-open.svg';
import IconChevronRight from '@/icons/chevron-right.svg';
import IconClose from '@/icons/close.svg';
import IconCode from '@/icons/code.svg';
import IconDiamond from '@/icons/diamond.svg';
import IconGlobe from '@/icons/globe.svg';
import IconGraduationCap from '@/icons/graduation-cap.svg';
import IconHeadphonesFilled from '@/icons/headphones-filled.svg';
import IconMoon from '@/icons/moon.svg';
import IconRadio from '@/icons/radio.svg';
import { setIsLanguageDrawerOpen, setIsNavigationDrawerOpen } from '@/redux/slices/navbar';
import Language from '@/types/Language';
import { makeDonatePageUrl } from '@/utils/apiPaths';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { getLocaleName } from '@/utils/locale';
import {
  APPS_URL,
  DEVELOPERS_URL,
  getMyQuranNavigationUrl,
  LEARNING_PLANS_URL,
  RADIO_URL,
  RECITERS_URL,
  ROUTES,
} from '@/utils/navigation';

if (typeof window !== 'undefined') {
  try {
    gsap.registerPlugin(CustomEase);
  } catch (e) {
    // CustomEase fallback to power2
  }
}

const EVENT_NAMES = {
  NAV_DRAWER_LANGUAGE_OPEN: 'navigation_drawer_language_selector_open',
  NAV_DRAWER_DONATE: 'navigation_drawer_donate',
} as const;

interface SterlingGateNavProps {
  isOpen: boolean;
  onClose: () => void;
  isLanguageDrawerOpen?: boolean;
}

const SterlingGateNav: React.FC<SterlingGateNavProps> = ({
  isOpen,
  onClose,
  isLanguageDrawerOpen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const router = useRouter();
  const continueReadingUrl = useGetContinueReadingUrl();
  const { isAuthenticated } = useAuthData();
  const [isMounted, setIsMounted] = useState(false);

  usePreventBodyScrolling(isOpen);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isUserLoggedIn = isMounted && isAuthenticated;

  // Setup GSAP CustomEase and Shape hover listeners
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      if (!gsap.parseEase('main')) {
        CustomEase.create('main', '0.65, 0.01, 0.05, 0.99');
        gsap.defaults({ ease: 'main', duration: 0.6 });
      }
    } catch (e) {
      gsap.defaults({ ease: 'power2.out', duration: 0.6 });
    }

    const ctx = gsap.context(() => {
      const menuItems = containerRef.current!.querySelectorAll('[data-shape]');
      const shapesContainer = containerRef.current!.querySelector(`.${styles.ambientBackgroundShapes}`);

      menuItems.forEach((item) => {
        const shapeIndex = item.getAttribute('data-shape');
        const shape = shapesContainer?.querySelector(`.${styles.bgShape}-${shapeIndex}`);
        if (!shape) return;

        const shapeEls = shape.querySelectorAll(`.${styles.shapeElement}`);

        const onEnter = () => {
          shapesContainer?.querySelectorAll(`.${styles.bgShape}`).forEach((s) => s.classList.remove(styles.active));
          shape.classList.add(styles.active);
          gsap.fromTo(
            shapeEls,
            { scale: 0.6, opacity: 0, rotation: -8 },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.5,
              stagger: 0.06,
              ease: 'back.out(1.5)',
              overwrite: 'auto',
            },
          );
        };

        const onLeave = () => {
          gsap.to(shapeEls, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => shape.classList.remove(styles.active),
            overwrite: 'auto',
          });
        };

        item.addEventListener('mouseenter', onEnter);
        item.addEventListener('mouseleave', onLeave);

        (item as any)._cleanup = () => {
          item.removeEventListener('mouseenter', onEnter);
          item.removeEventListener('mouseleave', onLeave);
        };
      });
    }, containerRef);

    return () => {
      ctx.revert();
      if (containerRef.current) {
        const items = containerRef.current.querySelectorAll('[data-shape]');
        items.forEach((item: any) => item._cleanup && item._cleanup());
      }
    };
  }, []);

  // GSAP Reveal Animation on Open / Close
  useEffect(() => {
    if (!containerRef.current) return;

    const isRtl = document.documentElement.dir === 'rtl';
    const slideDirection = isRtl ? 100 : -100;

    const ctx = gsap.context(() => {
      const navWrap = containerRef.current!.querySelector(`.${styles.navOverlayWrapper}`);
      const menu = containerRef.current!.querySelector(`.${styles.menuContent}`);
      const overlay = containerRef.current!.querySelector(`.${styles.overlay}`);
      const bgPanels = containerRef.current!.querySelectorAll(`.${styles.backdropLayer}`);
      const menuLinks = containerRef.current!.querySelectorAll(`.${styles.navLink}`);
      const closeIcon = containerRef.current!.querySelector(`.${styles.closeIconWrap}`);

      const tl = gsap.timeline();

      if (isOpen) {
        tl.set(navWrap, { display: 'block' })
          .set(menu, { xPercent: 0 }, '<')
          .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, '<')
          .fromTo(
            bgPanels,
            { xPercent: slideDirection },
            { xPercent: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out' },
            '<',
          )
          .fromTo(
            menuLinks,
            { yPercent: 60, opacity: 0 },
            { yPercent: 0, opacity: 1, stagger: 0.03, duration: 0.4, ease: 'power2.out' },
            '<+=0.2',
          )
          .fromTo(closeIcon, { rotate: 0 }, { rotate: 180, duration: 0.4 }, '<');
      } else {
        tl.to(overlay, { autoAlpha: 0, duration: 0.25 })
          .to(bgPanels, { xPercent: slideDirection, stagger: 0.04, duration: 0.35, ease: 'power2.in' }, '<')
          .to(closeIcon, { rotate: 0, duration: 0.25 }, '<')
          .set(navWrap, { display: 'none' });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLanguageDrawerOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isLanguageDrawerOpen, onClose]);

  // Close on route change
  useEffect(() => {
    const handleRouteChange = () => {
      if (isOpen) {
        onClose();
      }
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [isOpen, onClose, router.events]);

  const onLanguageButtonClick = useCallback(() => {
    dispatch(setIsLanguageDrawerOpen(true));
    logEvent(EVENT_NAMES.NAV_DRAWER_LANGUAGE_OPEN);
  }, [dispatch]);

  const onDonateClick = useCallback(() => {
    logButtonClick(EVENT_NAMES.NAV_DRAWER_DONATE);
  }, []);

  const handleItemClick = useCallback(
    (eventName: string) => {
      dispatch(setIsNavigationDrawerOpen(false));
      logButtonClick(eventName);
    },
    [dispatch],
  );

  const PRIMARY_ITEMS = [
    {
      title: 'Ramadan 2026',
      icon: <IconMoon />,
      href: ROUTES.RAMADAN_2026,
      eventName: 'navigation_drawer_ramadan2026',
      isEvent: true,
      locale: Language.EN,
      shape: '1',
    },
    {
      title: t('read'),
      icon: <IconBookOpen />,
      href: continueReadingUrl,
      eventName: 'navigation_drawer_read',
      shape: '2',
    },
    {
      title: t('learn'),
      icon: <IconGraduationCap />,
      href: LEARNING_PLANS_URL,
      eventName: 'navigation_drawer_learn',
      shape: '3',
    },
    {
      title: t('my-quran'),
      icon: <IconBookmarkFilled />,
      href: getMyQuranNavigationUrl(),
      eventName: 'navigation_drawer_my_quran',
      shape: '4',
    },
    {
      title: t('quran-radio'),
      icon: <IconRadio />,
      href: RADIO_URL,
      eventName: 'navigation_drawer_quran_radio',
      shape: '5',
    },
    {
      title: t('reciters'),
      icon: <IconHeadphonesFilled />,
      href: RECITERS_URL,
      eventName: 'navigation_drawer_reciters',
      shape: '1',
    },
    {
      title: t('quran-apps'),
      icon: <IconApps />,
      href: APPS_URL,
      eventName: 'navigation_drawer_quran_apps',
      shape: '2',
    },
    {
      title: t('developers'),
      icon: <IconCode />,
      href: DEVELOPERS_URL,
      eventName: 'navigation_drawer_developers',
      shape: '3',
    },
  ];

  return (
    <div ref={containerRef} className={classNames(styles.fullscreenMenuContainer, { [styles.isOpen]: isOpen })}>
      <div className={styles.navOverlayWrapper} data-nav={isOpen ? 'open' : 'closed'}>
        <div className={styles.overlay} onClick={onClose} aria-label={t('close')} />

        <nav className={styles.menuContent} aria-label={t('menu')}>
          <div className={styles.menuBg}>
            <div className={classNames(styles.backdropLayer, styles.first)} />
            <div className={classNames(styles.backdropLayer, styles.second)} />
            <div className={classNames(styles.backdropLayer, styles.third)} />

            <div className={styles.ambientBackgroundShapes}>
              {/* Shape 1: Subtle Emerald Orbs */}
              <svg className={classNames(styles.bgShape, `${styles.bgShape}-1`)} viewBox="0 0 400 400" fill="none">
                <circle className={styles.shapeElement} cx="80" cy="120" r="50" fill="rgba(16, 185, 129, 0.12)" />
                <circle className={styles.shapeElement} cx="320" cy="90" r="70" fill="rgba(217, 119, 6, 0.08)" />
                <circle className={styles.shapeElement} cx="220" cy="320" r="90" fill="rgba(16, 185, 129, 0.09)" />
              </svg>

              {/* Shape 2: Islamic Arabesque Wave */}
              <svg className={classNames(styles.bgShape, `${styles.bgShape}-2`)} viewBox="0 0 400 400" fill="none">
                <path
                  className={styles.shapeElement}
                  d="M0 180 Q100 80, 200 180 T 400 180"
                  stroke="rgba(16, 185, 129, 0.16)"
                  strokeWidth="48"
                  fill="none"
                />
                <path
                  className={styles.shapeElement}
                  d="M0 260 Q100 160, 200 260 T 400 260"
                  stroke="rgba(217, 119, 6, 0.12)"
                  strokeWidth="32"
                  fill="none"
                />
              </svg>

              {/* Shape 3: Geometric Star Points */}
              <svg className={classNames(styles.bgShape, `${styles.bgShape}-3`)} viewBox="0 0 400 400" fill="none">
                <circle className={styles.shapeElement} cx="60" cy="60" r="7" fill="rgba(16, 185, 129, 0.25)" />
                <circle className={styles.shapeElement} cx="160" cy="60" r="7" fill="rgba(217, 119, 6, 0.25)" />
                <circle className={styles.shapeElement} cx="260" cy="60" r="7" fill="rgba(16, 185, 129, 0.25)" />
                <circle className={styles.shapeElement} cx="360" cy="60" r="7" fill="rgba(217, 119, 6, 0.25)" />
                <circle className={styles.shapeElement} cx="110" cy="160" r="10" fill="rgba(16, 185, 129, 0.2)" />
                <circle className={styles.shapeElement} cx="210" cy="160" r="10" fill="rgba(217, 119, 6, 0.2)" />
                <circle className={styles.shapeElement} cx="310" cy="160" r="10" fill="rgba(16, 185, 129, 0.2)" />
                <circle className={styles.shapeElement} cx="60" cy="260" r="8" fill="rgba(217, 119, 6, 0.25)" />
                <circle className={styles.shapeElement} cx="160" cy="260" r="8" fill="rgba(16, 185, 129, 0.25)" />
                <circle className={styles.shapeElement} cx="260" cy="260" r="8" fill="rgba(217, 119, 6, 0.25)" />
              </svg>

              {/* Shape 4: Sacred Geometry Crest */}
              <svg className={classNames(styles.bgShape, `${styles.bgShape}-4`)} viewBox="0 0 400 400" fill="none">
                <rect
                  className={styles.shapeElement}
                  x="120"
                  y="120"
                  width="160"
                  height="160"
                  rx="30"
                  stroke="rgba(16, 185, 129, 0.14)"
                  strokeWidth="8"
                  transform="rotate(45 200 200)"
                />
                <circle className={styles.shapeElement} cx="200" cy="200" r="60" fill="rgba(217, 119, 6, 0.08)" />
              </svg>

              {/* Shape 5: Light Beam Rays */}
              <svg className={classNames(styles.bgShape, `${styles.bgShape}-5`)} viewBox="0 0 400 400" fill="none">
                <line
                  className={styles.shapeElement}
                  x1="0"
                  y1="80"
                  x2="320"
                  y2="400"
                  stroke="rgba(16, 185, 129, 0.12)"
                  strokeWidth="24"
                />
                <line
                  className={styles.shapeElement}
                  x1="120"
                  y1="0"
                  x2="400"
                  y2="280"
                  stroke="rgba(217, 119, 6, 0.1)"
                  strokeWidth="18"
                />
              </svg>
            </div>
          </div>

          <div className={styles.menuInner}>
            <header className={styles.headerRow}>
              <div className={styles.headerLeft}>
                <NavbarLogoWrapper />
                {!isUserLoggedIn && <ProfileAvatarButton isPopoverPortalled={false} />}
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={onClose}
                aria-label={t('close')}
                data-testid="sterling-gate-close-btn"
              >
                <span>{t('close')}</span>
                <div className={styles.closeIconWrap}>
                  <IconClose />
                </div>
              </button>
            </header>

            <ul className={styles.primaryMenuList}>
              {PRIMARY_ITEMS.map((item) => {
                if (item.locale && lang !== item.locale) {
                  return null;
                }
                return (
                  <li key={item.eventName} className={styles.menuListItem} data-shape={item.shape}>
                    <Link
                      href={item.href}
                      className={styles.navLink}
                      onClick={() => handleItemClick(item.eventName)}
                    >
                      <div className={styles.navLinkLeft}>
                        <span className={styles.navLinkIcon}>{item.icon}</span>
                        <p className={styles.navLinkText}>{item.title}</p>
                        {item.isEvent && <span className={styles.eventBadge}>2026</span>}
                      </div>
                      <span className={styles.navLinkArrow}>
                        <IconChevronRight />
                      </span>
                      <div className={styles.navLinkHoverBg} />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <footer className={styles.footerCtaContainer}>
              <div className={styles.footerRow}>
                <Button
                  prefix={<IconGlobe />}
                  variant={ButtonVariant.Ghost}
                  size={ButtonSize.Small}
                  shape={ButtonShape.Pill}
                  onClick={onLanguageButtonClick}
                  data-testid="language-selector-button"
                >
                  {getLocaleName(lang) || lang}
                </Button>
                <ThemeSwitcher />
              </div>
              <Button
                href={makeDonatePageUrl(false, true)}
                isNewTab
                prefix={<IconDiamond />}
                className={styles.donateButton}
                size={ButtonSize.Small}
                variant={ButtonVariant.Accent}
                shape={ButtonShape.Pill}
                onClick={onDonateClick}
              >
                {t('fundraising.title')}
              </Button>
            </footer>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SterlingGateNav;
