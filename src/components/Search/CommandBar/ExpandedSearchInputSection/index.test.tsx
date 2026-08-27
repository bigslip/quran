import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DataContext from '@/contexts/DataContext';
import ExpandedSearchInputSection from './index';

// Mock dependencies
vi.mock('@/api', () => ({
  getNewSearchResults: vi.fn(() => Promise.resolve({ result: { navigation: [] } })),
  OFFLINE_ERROR: 'OFFLINE_ERROR',
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

vi.mock('@/components/Search/SearchResults/SearchResultItemIcon', () => ({
  default: () => <div data-testid="icon" />,
}));

vi.mock('@/components/Search/SearchResults/SearchResultsHeader', () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn((selector) => {
    // Return empty arrays for both recent navigations and selected translations
    return [];
  }),
  useDispatch: vi.fn(() => vi.fn()),
}));

vi.mock('@/redux/slices/QuranReader/translations', () => ({
  selectSelectedTranslations: vi.fn(),
}));

vi.mock('@/redux/slices/CommandBar/state', () => ({
  selectRecentNavigations: vi.fn(),
}));


const chaptersData = {
  '1': { id: '1', transliteratedName: 'Al-Fatihah', translatedName: 'The Opener' },
  '36': { id: '36', transliteratedName: 'Ya-Sin', translatedName: 'Ya Sin' },
} as any;

vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    pathname: '',
    query: {},
    asPath: '',
  })),
}));

describe('ExpandedSearchInputSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Surah suggestion immediately using Fuse.js when query matches Surah name', async () => {
    render(
      <DataContext.Provider value={chaptersData}>
        <ExpandedSearchInputSection searchQuery="Yasin" />
      </DataContext.Provider>
    );

    // Should render Surah Ya-Sin immediately based on client-side search
    expect(await screen.findByText(/36. Ya-Sin/)).toBeDefined();
  });
});

