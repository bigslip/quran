import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SearchResultItem from './index';
import DataContext from '@/contexts/DataContext';
import SearchQuerySource from '@/types/SearchQuerySource';
import SearchService from '@/types/Search/SearchService';
import { SearchNavigationType } from '@/types/Search/SearchNavigationResult';

const mockPush = vi.fn(() => Promise.resolve());
vi.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/search?query=test',
    pathname: '/search',
    push: mockPush,
    replace: vi.fn(() => Promise.resolve()),
    query: {},
  }),
}));

const mockDispatch = vi.fn();
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string, params?: any) => key, lang: 'en' }),
}));

vi.mock('@/icons/search/surah.svg', () => ({ default: () => <svg data-testid="surah-icon" /> }));
vi.mock('@/icons/search/ayah-range.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/search/arabic.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/search/juz.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/search/page.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/search/translation.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/search/transliteration.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/search.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/east.svg', () => ({ default: () => <svg /> }));

const mockChaptersData = {
  1: { id: 1, transliteratedName: 'Al-Fatihah' },
};

vi.mock('@/hooks/useGetChaptersData', () => ({
  default: () => mockChaptersData,
}));

describe('SearchResultItem', () => {
  afterEach(() => {
    cleanup();
    mockPush.mockClear();
    mockDispatch.mockClear();
  });

  const mockSurahResult = {
    name: 'Al-Fatihah',
    key: '1',
    resultType: SearchNavigationType.SURAH,
  };

  it('renders surah search result correctly', () => {
    render(
      <DataContext.Provider value={mockChaptersData as any}>
        <SearchResultItem
          source={SearchQuerySource.SearchPage}
          service={SearchService.QDC}
          result={mockSurahResult}
        />
      </DataContext.Provider>,
    );

    expect(screen.getByText(/Al-Fatihah/)).toBeTruthy();
  });

  it('dispatches microphone and navigation closure on result click', () => {
    render(
      <DataContext.Provider value={mockChaptersData as any}>
        <SearchResultItem
          source={SearchQuerySource.SearchPage}
          service={SearchService.QDC}
          result={mockSurahResult}
        />
      </DataContext.Provider>,
    );

    const link = screen.getByRole('link');
    fireEvent.click(link);

    expect(mockDispatch).toHaveBeenCalled();
  });
});
