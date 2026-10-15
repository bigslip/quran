/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import SearchModal from './SearchModal';

import { navbarSlice } from '@/redux/slices/navbar';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    push: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

vi.mock('@/redux/slices/QuranReader/translations', () => ({
  selectSelectedTranslations: () => [131],
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="icon-search" />,
}));

vi.mock('@/icons/close.svg', () => ({
  default: () => <svg data-testid="icon-close" />,
}));

vi.mock('@/icons/east.svg', () => ({
  default: () => <svg data-testid="icon-east" />,
}));

vi.mock('@/components/Search/SearchBodyContainer', () => ({
  default: ({ searchQuery }: { searchQuery: string }) => (
    <div data-testid="search-body-mock">Search Body: {searchQuery}</div>
  ),
}));

vi.mock('@/components/Search/VoiceSearch', () => ({
  default: () => <div data-testid="voice-search-mock" />,
}));

const createTestStore = (initialOpen = true) =>
  configureStore({
    reducer: {
      navbar: navbarSlice.reducer,
      microphone: () => ({ isMicrophoneActive: false }),
    },
    preloadedState: {
      navbar: {
        isVisible: true,
        isNavigationDrawerOpen: false,
        isSearchDrawerOpen: initialOpen,
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

describe('SearchModal', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders search modal with header, input, and shortcuts footer when open', () => {
    render(
      <Provider store={store}>
        <SearchModal />
      </Provider>,
    );

    expect(screen.getByTestId('search-modal-container')).toBeTruthy();
    expect(screen.getByTestId('search-modal-header')).toBeTruthy();
    expect(screen.getByTestId('search-modal-footer')).toBeTruthy();
    expect(screen.getByPlaceholderText('search.title')).toBeTruthy();
  });

  it('dispatches close when close button is clicked', () => {
    render(
      <Provider store={store}>
        <SearchModal />
      </Provider>,
    );

    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);

    const state = store.getState();
    expect(state.navbar.isSearchDrawerOpen).toBe(false);
  });

  it('updates search query when typed in input', () => {
    render(
      <Provider store={store}>
        <SearchModal />
      </Provider>,
    );

    const input = screen.getByPlaceholderText('search.title');
    fireEvent.change(input, { target: { value: 'Kahf' } });

    expect((input as HTMLInputElement).value).toBe('Kahf');
    expect(screen.getByLabelText('input.clear')).toBeTruthy();
  });
});
