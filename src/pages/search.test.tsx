import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchPage from './search';
import { getNewSearchResults } from '@/api';

// Mock dependencies
vi.mock('@/api', () => ({
  getNewSearchResults: vi.fn(),
  getAvailableLanguages: vi.fn().mockResolvedValue({ languages: [] }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn().mockReturnValue([]),
}));

vi.mock('@/redux/slices/QuranReader/translations', () => ({
  selectSelectedTranslations: vi.fn(),
}));

const mockRouter = {
  query: { query: 'test' },
  isReady: true,
};

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/components/Search/SearchBodyContainer', () => ({
  default: () => <div data-testid="search-body-container">SearchBodyContainer</div>,
}));

vi.mock('@/components/Search/SearchInput', () => ({
  default: () => <div data-testid="search-input">SearchInput</div>,
}));

// Provide some basic mock chapters data since it's expected as a prop
const mockChaptersData = {
  1: { id: 1, nameSimple: 'Al-Fatihah' }
};

describe('SearchPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getNewSearchResults as any).mockResolvedValue({
      pagination: { totalRecords: 1, perPage: 10, currentPage: 1, totalPages: 1 },
      result: { navigation: [], verses: [] },
    });
  });

  it('fetches data and renders SearchBodyContainer when query is present in URL', async () => {
    render(<SearchPage chaptersData={mockChaptersData as any} languages={[]} />);
    
    await waitFor(() => {
      expect(getNewSearchResults).toHaveBeenCalled();
    });
    
    const container = await screen.findByTestId('search-body-container');
    expect(container).toBeTruthy();
  });
});
