/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HomePageHero from './HomePageHero';

import { navbarSlice } from '@/redux/slices/navbar';
import { sidebarNavigationSlice } from '@/redux/slices/QuranReader/sidebarNavigation';
import { logButtonClick } from '@/utils/eventLogger';
import { isFriday, isNightTime } from '@/utils/spiritualTime';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, options?: any) => options?.defaultValue || key,
    lang: 'en',
  }),
}));

vi.mock('@/hooks/useGetContinueReadingUrl', () => ({
  default: () => '/1',
}));

vi.mock('@/hooks/useHasMounted', () => ({
  default: () => true,
}));

vi.mock('@/icons/logo_main.svg', () => ({
  default: () => <svg data-testid="hero-logo-mock" />,
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="icon-search" />,
}));

vi.mock('@/icons/book-open.svg', () => ({
  default: () => <svg data-testid="icon-book-open" />,
}));

vi.mock('@/icons/bookmark_filled.svg', () => ({
  default: () => <svg data-testid="icon-bookmark-filled" />,
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
  logValueChange: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock('@/utils/spiritualTime', () => ({
  getTimeOfDayPeriod: vi.fn(() => 'morning'),
  isFriday: vi.fn(() => false),
  isNightTime: vi.fn(() => false),
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      navbar: navbarSlice.reducer,
      sidebarNavigation: sidebarNavigationSlice.reducer,
    },
  });

describe('HomePageHero Component', () => {
  let store: any;

  beforeEach(() => {
    store = createTestStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders greeting capsule, logo, command bar, quick jump pills, and action dock CTAs', () => {
    render(
      <Provider store={store}>
        <HomePageHero />
      </Provider>,
    );

    expect(screen.getByTestId('hero-logo-mock')).toBeTruthy();
    expect(screen.getByTestId('sanctuary-command-bar')).toBeTruthy();
    expect(screen.getByText('Surah Yaseen (36)')).toBeTruthy();
    expect(screen.getByText('Surah Al-Mulk (67)')).toBeTruthy();
    expect(screen.getByText('Surah Al-Kahf (18)')).toBeTruthy();
    expect(screen.getByText('Ayah Al-Kursi (2:255)')).toBeTruthy();
    expect(screen.getByText('Juz 30 (Amma)')).toBeTruthy();

    const continueBtn = screen.getByTestId('hero-continue-reading-btn');
    expect(continueBtn).toBeTruthy();
    expect(continueBtn.getAttribute('href')).toBe('/1');
    expect(screen.getByText('Continue Reading')).toBeTruthy();

    const exploreBtn = screen.getByTestId('hero-explore-surahs-btn');
    expect(exploreBtn).toBeTruthy();
    expect(screen.getByText('Explore 114 Surahs')).toBeTruthy();
  });

  it('handles quick jump pill clicks and logs analytics events', () => {
    render(
      <Provider store={store}>
        <HomePageHero />
      </Provider>,
    );

    const yaseenPill = screen.getByText('Surah Yaseen (36)');
    fireEvent.click(yaseenPill);
    expect(logButtonClick).toHaveBeenCalledWith('homepage_hero_quick_jump', { surah: 'yaseen' });
  });

  it('handles continue reading button click and logs event', () => {
    render(
      <Provider store={store}>
        <HomePageHero />
      </Provider>,
    );

    const continueBtn = screen.getByTestId('hero-continue-reading-btn');
    fireEvent.click(continueBtn);
    expect(logButtonClick).toHaveBeenCalledWith('homepage_hero_continue_reading');
  });

  it('handles explore surahs button click, opens surah navigation sidebar, and logs event', () => {
    render(
      <Provider store={store}>
        <HomePageHero />
      </Provider>,
    );

    expect(store.getState().sidebarNavigation.isVisible).toBe(false);

    const exploreBtn = screen.getByTestId('hero-explore-surahs-btn');
    fireEvent.click(exploreBtn);

    expect(logButtonClick).toHaveBeenCalledWith('homepage_hero_explore_surahs');
    expect(store.getState().sidebarNavigation.isVisible).toBe(true);
  });

  it('displays Friday Sunnah badge when isFriday returns true', () => {
    vi.mocked(isFriday).mockReturnValue(true);

    render(
      <Provider store={store}>
        <HomePageHero />
      </Provider>,
    );

    expect(screen.getByText('✦ Friday Sunnah')).toBeTruthy();
  });

  it('displays Night Recitation badge when isNightTime returns true', () => {
    vi.mocked(isFriday).mockReturnValue(false);
    vi.mocked(isNightTime).mockReturnValue(true);

    render(
      <Provider store={store}>
        <HomePageHero />
      </Provider>,
    );

    expect(screen.getByText('☾ Night Recitation')).toBeTruthy();
  });
});
