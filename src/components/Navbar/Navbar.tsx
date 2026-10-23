import React, { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import MobileStickyItemsBar from './MobileStickyItemsBar';
import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import Spinner from '@/dls/Spinner/Spinner';
import useDebounceNavbarVisibility from '@/hooks/useDebounceNavbarVisibility';
import {
  selectIsLanguageDrawerOpen,
  selectIsNavigationDrawerOpen,
  selectIsSettingsDrawerOpen,
  selectNavbar,
} from '@/redux/slices/navbar';
import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import {
  selectIsSidebarNavigationVisible,
  setIsSidebarNavigationVisible,
} from '@/redux/slices/QuranReader/sidebarNavigation';
import { getSidebarTransitionDurationFromCss } from '@/utils/css';
import { isQuranReaderRoutePathname } from '@/utils/routes';

const SidebarNavigation = dynamic(
  () => import('@/components/QuranReader/SidebarNavigation/SidebarNavigation'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);

const SearchModal = dynamic(() => import('./SearchModal/SearchModal'), {
  ssr: false,
});

const LanguageModal = dynamic(() => import('./LanguageModal/LanguageModal'), {
  ssr: false,
});

const SettingsDrawer = dynamic(() => import('./SettingsDrawer/SettingsDrawer'), {
  ssr: false,
});

const NavigationDrawer = dynamic(() => import('./NavigationDrawer/NavigationDrawer'), {
  ssr: false,
});

const Navbar = () => {
  const { isActive } = useOnboarding();
  const dispatch = useDispatch();
  const router = useRouter();
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const isNavigationDrawerOpen = useSelector(selectIsNavigationDrawerOpen);
  const isSettingsDrawerOpen = useSelector(selectIsSettingsDrawerOpen);
  const isLanguageDrawerOpen = useSelector(selectIsLanguageDrawerOpen);
  // Use the shared hook to debounce navbar visibility changes
  const showNavbar = useDebounceNavbarVisibility(isNavbarVisible, isActive);

  const isQuranReaderRoute = isQuranReaderRoutePathname(router.pathname);
  const normalizedPathname = router.asPath.split(/[?#]/)[0];
  const isSidebarNavigationVisible = useSelector(selectIsSidebarNavigationVisible);
  const isPersistHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);
  const hasResetSidebarAfterHydration = useRef(false);
  const [isSidebarClosing, setIsSidebarClosing] = useState(false);
  const sidebarVisibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousSidebarVisibilityRef = useRef(isSidebarNavigationVisible);
  const wasSidebarVisible = previousSidebarVisibilityRef.current;
  const isTransitioningToClose = wasSidebarVisible && !isSidebarNavigationVisible;
  const sidebarTransitionDuration = getSidebarTransitionDurationFromCss();

  useEffect(() => {
    if (isQuranReaderRoute) return;
    // Disable the sidebar when not on any Quran reader route
    dispatch(setIsSidebarNavigationVisible(false));
  }, [dispatch, isQuranReaderRoute, normalizedPathname]);

  const shouldRenderSidebarNavigation =
    isQuranReaderRoute || isSidebarNavigationVisible || isSidebarClosing || isTransitioningToClose;

  useEffect(() => {
    if (isSidebarNavigationVisible) {
      setIsSidebarClosing(false);
      if (sidebarVisibilityTimeoutRef.current) {
        clearTimeout(sidebarVisibilityTimeoutRef.current);
        sidebarVisibilityTimeoutRef.current = null;
      }
    } else if (previousSidebarVisibilityRef.current) {
      setIsSidebarClosing(true);
      sidebarVisibilityTimeoutRef.current = setTimeout(() => {
        setIsSidebarClosing(false);
        sidebarVisibilityTimeoutRef.current = null;
      }, sidebarTransitionDuration);
    }

    previousSidebarVisibilityRef.current = isSidebarNavigationVisible;

    return () => {
      if (sidebarVisibilityTimeoutRef.current) {
        clearTimeout(sidebarVisibilityTimeoutRef.current);
        sidebarVisibilityTimeoutRef.current = null;
      }
    };
  }, [isSidebarNavigationVisible, sidebarTransitionDuration]);

  useEffect(() => {
    if (hasResetSidebarAfterHydration.current) return;
    if (!isPersistHydrationComplete) return;
    hasResetSidebarAfterHydration.current = true;
    if (isQuranReaderRoute) return;
    dispatch(setIsSidebarNavigationVisible(false));
  }, [dispatch, isPersistHydrationComplete, isQuranReaderRoute]);

  return (
    <>
      <MobileStickyItemsBar />
      <div className={styles.emptySpacePlaceholder} />
      <nav
        className={classNames(styles.container, {
          [styles.hiddenNav]: !showNavbar,
          [styles.dimmed]: isNavigationDrawerOpen || isSettingsDrawerOpen || isLanguageDrawerOpen,
        })}
        data-testid="navbar"
        data-isvisible={showNavbar}
      >
        <NavbarBody />
      </nav>
      {/* Modals and Drawers rendered outside nav to avoid transform containment issues */}
      {shouldRenderSidebarNavigation && <SidebarNavigation />}
      <SearchModal />
      <LanguageModal />
      <SettingsDrawer />
      <NavigationDrawer />
    </>
  );
};

export default Navbar;
