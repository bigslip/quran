import React, { useCallback } from 'react';

import dynamic from 'next/dynamic';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import NavigationDrawerBodySkeleton from './NavigationDrawerBodySkeleton';

import { selectNavbar, setIsNavigationDrawerOpen } from '@/redux/slices/navbar';

const SterlingGateNav = dynamic(() => import('./SterlingGateNav'), {
  ssr: false,
  loading: () => <NavigationDrawerBodySkeleton />,
});

const NavigationDrawer = () => {
  const dispatch = useDispatch();
  const { isNavigationDrawerOpen, isLanguageDrawerOpen } = useSelector(selectNavbar, shallowEqual);

  const handleClose = useCallback(() => {
    if (!isLanguageDrawerOpen) {
      dispatch(setIsNavigationDrawerOpen(false));
    }
  }, [dispatch, isLanguageDrawerOpen]);

  return (
    <SterlingGateNav
      isOpen={isNavigationDrawerOpen}
      onClose={handleClose}
      isLanguageDrawerOpen={isLanguageDrawerOpen}
    />
  );
};

export default NavigationDrawer;
