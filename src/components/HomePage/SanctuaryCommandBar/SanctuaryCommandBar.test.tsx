/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SanctuaryCommandBar from './SanctuaryCommandBar';

import { navbarSlice } from '@/redux/slices/navbar';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, options?: any) => options?.defaultValue || key,
    lang: 'en',
  }),
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="icon-search" />,
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      navbar: navbarSlice.reducer,
    },
  });

describe('SanctuaryCommandBar Component', () => {
  let store: any;

  beforeEach(() => {
    store = createTestStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders command launcher with search icon, placeholder text, and shortcut key', () => {
    render(
      <Provider store={store}>
        <SanctuaryCommandBar />
      </Provider>,
    );

    expect(screen.getByTestId('sanctuary-command-bar')).toBeTruthy();
    expect(screen.getByTestId('icon-search')).toBeTruthy();
    expect(screen.getByText('Search verses, surahs, topics, or jump to ayah...')).toBeTruthy();
    expect(screen.getByText(/⌘K|Ctrl\+K/)).toBeTruthy();
  });

  it('dispatches open search action when clicked', () => {
    render(
      <Provider store={store}>
        <SanctuaryCommandBar />
      </Provider>,
    );

    const button = screen.getByTestId('sanctuary-command-bar');
    fireEvent.click(button);
    expect(store.getState().navbar.isSearchDrawerOpen).toBe(true);
  });
});
