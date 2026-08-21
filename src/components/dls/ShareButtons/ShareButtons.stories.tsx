import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import ShareButtons from './index';

// Mock dependencies for storybook
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

const mockStore = configureStore({
  reducer: (state = {
    ayahWidget: { overrides: {} },
    quranReaderStyles: { quranFont: 'v1' },
    quranReaderTranslations: { selectedTranslations: [] },
  }) => state,
});

const meta: Meta<typeof ShareButtons> = {
  title: 'dls/ShareButtons',
  component: ShareButtons,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <div style={{ maxWidth: '400px', border: '1px solid var(--color-borders-hairline)', borderRadius: 'var(--border-radius-default)', padding: 'var(--spacing-medium)' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
  args: {
    url: 'https://quran.com/1',
    title: 'Surah Al-Fatihah',
    analyticsContext: 'storybook',
  },
};

export default meta;

type Story = StoryObj<typeof ShareButtons>;

export const Default: Story = {};

export const WithVerse: Story = {
  args: {
    verse: {
      chapterId: '1',
      verseNumber: 1,
    },
  },
};

export const HideVideoGeneration: Story = {
  args: {
    verse: {
      chapterId: '1',
      verseNumber: 1,
    },
    hideVideoGeneration: true,
  },
};
