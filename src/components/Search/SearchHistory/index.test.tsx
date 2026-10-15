import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import SearchHistory from './index';
import { removeSearchHistoryRecord } from '@/redux/slices/Search/search';
import SearchQuerySource from '@/types/SearchQuerySource';
import { useSelector, useDispatch } from 'react-redux';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

vi.mock('@/redux/slices/Search/search', () => ({
  selectSearchHistory: vi.fn(),
  removeSearchHistoryRecord: Object.assign(
    vi.fn((payload) => ({ type: 'search/removeSearchHistoryRecord', payload })),
    { type: 'search/removeSearchHistoryRecord' }
  ),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

vi.mock('@/components/Search/PreInput/SearchQuerySuggestion', () => ({
  default: ({ searchQuery, onRemoveSearchQueryClicked }: any) => (
    <div data-testid={`suggestion-${searchQuery}`}>
      <span>{searchQuery}</span>
      <button 
        data-testid={`remove-${searchQuery}`} 
        onClick={() => onRemoveSearchQueryClicked(searchQuery)}
      >
        Remove
      </button>
    </div>
  ),
}));

describe('SearchHistory', () => {
  const dispatchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useDispatch as any).mockReturnValue(dispatchMock);
  });

  afterEach(() => {
    cleanup();
  });


  it('renders suggestions based on selectSearchHistory', () => {
    (useSelector as any).mockReturnValue(['first search', 'second search']);
    
    render(
      <SearchHistory 
        onSearchKeywordClicked={vi.fn()} 
        source={SearchQuerySource.SearchPage} 
      />
    );

    expect(screen.getByTestId('suggestion-first search')).toBeDefined();
    expect(screen.getByTestId('suggestion-second search')).toBeDefined();
    expect(screen.getByText('search.recent')).toBeDefined();
  });

  it('dispatches removeSearchHistoryRecord when remove button is clicked', () => {
    (useSelector as any).mockReturnValue(['first search']);
    
    render(
      <SearchHistory 
        onSearchKeywordClicked={vi.fn()} 
        source={SearchQuerySource.SearchPage} 
      />
    );

    const removeButton = screen.getByTestId('remove-first search');
    fireEvent.click(removeButton);

    expect(dispatchMock).toHaveBeenCalledWith({
      type: removeSearchHistoryRecord.type,
      payload: 'first search'
    });
  });

  it('spreads HTMLAttributes (e.g. data-testid) to its root element', () => {
    (useSelector as any).mockReturnValue(['first search']);
    
    render(
      <SearchHistory 
        onSearchKeywordClicked={vi.fn()} 
        source={SearchQuerySource.SearchPage} 
        data-testid="search-history-container" 
      />
    );

    expect(screen.getByTestId('search-history-container')).toBeDefined();
  });

  it('preserves HTMLAttributes even when search history is empty', () => {
    (useSelector as any).mockReturnValue([]);
    
    render(
      <SearchHistory 
        onSearchKeywordClicked={vi.fn()} 
        source={SearchQuerySource.SearchPage} 
        data-testid="empty-history-container" 
      />
    );

    expect(screen.getByTestId('empty-history-container')).toBeDefined();
  });
});
