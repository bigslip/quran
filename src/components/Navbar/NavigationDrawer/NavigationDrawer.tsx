/* eslint-disable react/no-multi-comp */
import React, { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import { shallowEqual, useSelector } from 'react-redux';

import Drawer, { DrawerSide, DrawerType } from '../Drawer';
import NavbarLogoWrapper from '../Logo/NavbarLogoWrapper';
import ProfileAvatarButton from '../NavbarBody/ProfileAvatarButton';

import styles from './NavigationDrawer.module.scss';
import NavigationDrawerBodySkeleton from './NavigationDrawerBodySkeleton';

import useAuthData from '@/hooks/auth/useAuthData';
import { selectNavbar } from '@/redux/slices/navbar';

const NavigationDrawerBody = dynamic(() => import('./NavigationDrawerBody'), {
  ssr: false,
  loading: () => <NavigationDrawerBodySkeleton />,
});

const NavigationDrawer = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isNavigationDrawerOpen, isLanguageDrawerOpen } = useSelector(selectNavbar, shallowEqual);
  const { isAuthenticated } = useAuthData();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isUserLoggedIn = isMounted && isAuthenticated;

  return (
    <Drawer
      id="navigation-drawer"
      data-testid="navigation-drawer"
      type={DrawerType.Navigation}
      side={DrawerSide.Right}
      header={
        <div className={styles.centerVertically}>
          <div className={styles.leftCTA}>
            <NavbarLogoWrapper />
            {!isUserLoggedIn && <ProfileAvatarButton isPopoverPortalled={false} />}
          </div>
        </div>
      }
      canCloseDrawer={!isLanguageDrawerOpen}
    >
      {isNavigationDrawerOpen && (
        <NavigationDrawerBody isLanguageDrawerOpen={isLanguageDrawerOpen} />
      )}
    </Drawer>
  );
};

export default NavigationDrawer;
