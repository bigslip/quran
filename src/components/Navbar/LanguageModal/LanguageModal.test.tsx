/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen, fireEvent, render, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import LanguageModal from './LanguageModal';

import { navbarSlice } from '@/redux/slices/navbar';

const mockRouterEvents = {
  on: vi.fn(),
  off: vi.fn(),
};

vi.mock('next/router', () => ({
  useRouter: () => ({
    events: mockRouterEvents,
    pathname: '/',
    asPath: '/',
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key,
    lang: 'en',
  }),
}));

const mockOnLanguageChange = vi.fn();
vi.mock('@/hooks/useLanguageChange', () => ({
  default: () => ({
    isChangingLanguage: false,
    changingLocale: null,
    onLanguageChange: mockOnLanguageChange,
  }),
}));

vi.mock('@/icons/globe.svg', () => ({
  default: () => <svg data-testid="icon-globe" />,
}));
vi.mock('@/icons/close.svg', () => ({
  default: () => <svg data-testid="icon-close" />,
}));
vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="icon-search" />,
}));
vi.mock('@/icons/check.svg', () => ({
  default: () => <svg data-testid="icon-check" />,
}));

const createTestStore = (initialOpen = true) =>
  configureStore({
    reducer: {
      navbar: navbarSlice.reducer,
    },
    preloadedState: {
      navbar: {
        isLanguageDrawerOpen: initialOpen,
        isSearchDrawerOpen: false,
        isNavigationDrawerOpen: false,
        isSettingsDrawerOpen: false,
        isVisible: true,
        lockVisibilityState: false,
        settingsView: 'body' as any,
        lastSettingsView: 'body' as any,
        disableSearchDrawerTransition: false,
        lastSettingsTab: 'theme' as any,
      },
    },
  });

const renderWithStore = (initialOpen = true) => {
  const store = createTestStore(initialOpen);
  return {
    store,
    ...render(
      <Provider store={store}>
        <LanguageModal />
      </Provider>,
    ),
  };
};

describe('LanguageModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders language modal when open in redux', () => {
    renderWithStore(true);

    expect(screen.getByTestId('language-modal-container')).toBeTruthy();
    expect(screen.getByText('العربية')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
  });

  it('filters languages when searching in filter input', () => {
    renderWithStore(true);

    const searchInput = screen.getByPlaceholderText('Search languages...');
    fireEvent.change(searchInput, { target: { value: 'Turkish' } });

    expect(screen.getByText('Türkçe')).toBeTruthy();
    expect(screen.queryByText('العربية')).toBeNull();
  });

  it('calls onLanguageChange when selecting a new language', () => {
    renderWithStore(true);

    const arabicCard = screen.getByTestId('language-card-ar');
    fireEvent.click(arabicCard);

    expect(mockOnLanguageChange).toHaveBeenCalledWith('ar', expect.any(Function));
  });

  it('dispatches setIsLanguageModalOpen(false) when close button is clicked', () => {
    const { store } = renderWithStore(true);

    const closeBtn = screen.getByLabelText('close');
    fireEvent.click(closeBtn);

    const state = store.getState();
    expect(state.navbar.isLanguageDrawerOpen).toBe(false);
  });
});
