import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi } from 'vitest';
import Notes from './Notes';
import notesReducer from '@/redux/slices/QuranReader/notes';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, opts?: any) => opts?.defaultValue || key,
    lang: 'en',
  }),
}));

const createMockStore = (isVisible = false) =>
  configureStore({
    reducer: {
      notes: notesReducer,
    },
    preloadedState: {
      notes: {
        isVisible,
      },
    },
  });

describe('QuranReader Notes Component', () => {
  it('renders correctly and dispatches close on button click', () => {
    const store = createMockStore(true);
    render(
      <Provider store={store}>
        <Notes />
      </Provider>,
    );

    expect(screen.getByText('Use this space to save general notes, or to write a reflection.')).toBeTruthy();
    const closeBtn = screen.getByRole('button', { name: 'common:close' });
    expect(closeBtn).toBeTruthy();

    fireEvent.click(closeBtn);
    expect(store.getState().notes.isVisible).toBe(false);
  });
});
