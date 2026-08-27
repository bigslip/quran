import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchResults from './index';
import SearchQuerySource from '@/types/SearchQuerySource';
import { SearchResponse } from 'types/ApiResponses';
import SearchService from 'types/Search/SearchService';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, values?: Record<string, any>) => 
      values?.count ? `${key} ${values.count}` : key,
    lang: 'en'
  })
}));

vi.mock('./SearchResultItem', () => ({
  default: ({ result }: { result: any }) => <div data-testid="search-result-item">{result.key}</div>
}));

vi.mock('./SearchResultsHeader', () => ({
  default: () => <div data-testid="search-results-header">Header</div>
}));

vi.mock('@/dls/Pagination/Pagination', () => ({
  default: () => <div data-testid="pagination">Pagination</div>
}));

vi.mock('@/hooks/useScrollToTop', () => ({
  default: () => vi.fn()
}));

const mockSearchResult: SearchResponse = {
  service: SearchService.QDC,
  pagination: {
    perPage: 10,
    currentPage: 1,
    nextPage: null,
    totalRecords: 2,
    totalPages: 1
  },
  result: {
    navigation: [{ key: 'nav-1' } as any],
    verses: [{ key: 'verse-1' } as any],
  }
};

describe('SearchResults', () => {
  it('renders a list of SearchResultItems', () => {
    render(
      <SearchResults 
        searchResult={mockSearchResult}
        searchQuery="test query"
        source={SearchQuerySource.SearchPage}
      />
    );
    
    const items = screen.getAllByTestId('search-result-item');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe('nav-1');
    expect(items[1].textContent).toBe('verse-1');
  });

  it('spreads HTMLAttributes to the root element', () => {
    render(
      <SearchResults 
        searchResult={mockSearchResult}
        searchQuery="test query"
        source={SearchQuerySource.SearchPage}
        data-testid="root-element"
        className="custom-class"
      />
    );
    
    const rootElement = screen.getByTestId('root-element');
    expect(rootElement).toBeTruthy();
    expect(rootElement.className).toContain('custom-class');
  });
});
