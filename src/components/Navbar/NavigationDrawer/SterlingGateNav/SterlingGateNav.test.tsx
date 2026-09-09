import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SterlingGateNav from './SterlingGateNav';

import { navbarSlice } from '@/redux/slices/navbar';
import themeReducer from '@/redux/slices/theme';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    asPath: '/',
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}));

vi.mock('@/hooks/auth/useAuthData', () => ({
  default: () => ({
    isAuthenticated: false,
    userData: null,
  }),
}));

vi.mock('@/hooks/useGetContinueReadingUrl', () => ({
  default: () => '/1',
}));

vi.mock('@/components/Navbar/Logo/NavbarLogoWrapper', () => ({
  default: () => <div data-testid="navbar-logo-wrapper" />,
}));

vi.mock('@/components/Navbar/NavbarBody/ProfileAvatarButton', () => ({
  default: () => <div data-testid="profile-avatar-button-mock" />,
}));

vi.mock('@/components/Navbar/NavigationDrawer/ThemeSwitcher', () => ({
  default: () => <div data-testid="theme-switcher-mock" />,
}));

vi.mock('@/components/Fundraising/FundraisingBanner', () => ({
  default: () => <div data-testid="fundraising-banner-mock" />,
}));

vi.mock('@/icons/close.svg', () => ({
  default: () => <svg data-testid="icon-close" />,
}));
vi.mock('@/icons/globe.svg', () => ({
  default: () => <svg data-testid="icon-globe" />,
}));
vi.mock('@/icons/diamond.svg', () => ({
  default: () => <svg data-testid="icon-diamond" />,
}));
vi.mock('@/icons/chevron-right.svg', () => ({
  default: () => <svg data-testid="icon-chevron-right" />,
}));
vi.mock('@/icons/home.svg', () => ({
  default: () => <svg data-testid="icon-home" />,
}));
vi.mock('@/icons/school.svg', () => ({
  default: () => <svg data-testid="icon-school" />,
}));
vi.mock('@/icons/bookmark_filled.svg', () => ({
  default: () => <svg data-testid="icon-bookmark" />,
}));
vi.mock('@/icons/headphones-filled.svg', () => ({
  default: () => <svg data-testid="icon-headphones" />,
}));
vi.mock('@/icons/apps.svg', () => ({
  default: () => <svg data-testid="icon-apps" />,
}));
vi.mock('@/icons/code.svg', () => ({
  default: () => <svg data-testid="icon-code" />,
}));
vi.mock('@/icons/caret-down.svg', () => ({
  default: () => <svg data-testid="icon-caret-down" />,
}));
vi.mock('@/icons/square-more.svg', () => ({
  default: () => <svg data-testid="icon-square-more" />,
}));

const createTestStore = (initialOpen = true) =>
  configureStore({
    reducer: {
      navbar: navbarSlice.reducer,
      theme: themeReducer,
    },
    preloadedState: {
      navbar: {
        isVisible: true,
        isNavigationDrawerOpen: initialOpen,
        isSearchDrawerOpen: false,
        isSettingsDrawerOpen: false,
        isLanguageDrawerOpen: false,
        settingsView: 'body' as any,
        lastSettingsView: 'body' as any,
        lastSettingsTab: 'arabic' as any,
        disableSearchDrawerTransition: false,
        lockVisibilityState: false,
      },
    },
  });

describe('SterlingGateNav Component', () => {
  let store: any;

  beforeEach(() => {
    store = createTestStore(true);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders closed state without crashing', () => {
    render(
      <Provider store={createTestStore(false)}>
        <SterlingGateNav isOpen={false} onClose={vi.fn()} />
      </Provider>,
    );

    const menuElement = screen.getByLabelText('menu');
    expect(menuElement).toBeTruthy();
  });

  it('renders primary menu links when open', () => {
    render(
      <Provider store={store}>
        <SterlingGateNav isOpen={true} onClose={vi.fn()} />
      </Provider>,
    );

    expect(screen.getByText('read')).toBeTruthy();
    expect(screen.getByText('learn')).toBeTruthy();
    expect(screen.getByText('my-quran')).toBeTruthy();
    expect(screen.getByText('quran-radio')).toBeTruthy();
    expect(screen.getByText('reciters')).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Provider store={store}>
        <SterlingGateNav isOpen={true} onClose={handleClose} />
      </Provider>,
    );

    const closeBtn = screen.getByTestId('sterling-gate-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
