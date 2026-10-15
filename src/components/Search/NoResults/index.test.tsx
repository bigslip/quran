import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import NoResults from './index';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string, params?: any) => (params?.searchQuery ? `${key} ${params.searchQuery}` : key), lang: 'en' }),
}));

vi.mock('@/icons/search.svg', () => ({ default: () => <svg data-testid="search-icon" /> }));

describe('NoResults', () => {
  afterEach(cleanup);

  it('renders default no-results message and icon', () => {
    render(<NoResults searchQuery="unknown query" />);

    expect(screen.getByText('search.no-results')).toBeTruthy();
    expect(screen.getByTestId('search-icon')).toBeTruthy();
  });

  it('renders search-for link when shouldSuggestFullSearchWhenNoResults is true', () => {
    render(
      <NoResults
        searchQuery="unknown query"
        shouldSuggestFullSearchWhenNoResults={true}
      />,
    );

    expect(screen.getByText(/search-for unknown query/)).toBeTruthy();
  });
});
