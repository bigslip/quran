import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import RadioHero from './RadioHero';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="search-icon" />,
}));

vi.mock('@/icons/close.svg', () => ({
  default: () => <svg data-testid="close-icon" />,
}));

const mockTranslations: Record<string, string> = {
  'radio:sanctuary-badge': 'Holy Quran Continuous Radio Sanctuary',
  'radio:hero-title': 'Quran Radio & Live Stations',
  'radio:hero-subtitle': 'Continuous soulful Quran recitations',
  'radio:search-placeholder': 'Search stations or reciters...',
  'radio:filter-all': 'All Stations',
  'radio:filter-available': 'Available Live',
  'radio:filter-curated': 'Curated Stations',
  'radio:filter-reciters': 'Reciter Stations',
  'common:clear': 'Clear',
};

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => mockTranslations[key] || key,
    lang: 'en',
  }),
}));

describe('RadioHero', () => {
  it('renders and spreads HTML attributes', () => {
    render(
      <RadioHero
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        data-testid="radio-hero"
        aria-label="Radio Hero"
      />,
    );

    const root = screen.getByTestId('radio-hero');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-label', 'Radio Hero');
    expect(screen.getByText('Quran Radio & Live Stations')).toBeInTheDocument();
  });

  it('handles search input change and clear button', () => {
    const onSearchQueryChange = vi.fn();
    const { rerender } = render(
      <RadioHero
        searchQuery=""
        onSearchQueryChange={onSearchQueryChange}
      />,
    );

    const input = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(input, { target: { value: 'Parhizgar' } });
    expect(onSearchQueryChange).toHaveBeenCalledWith('Parhizgar');

    rerender(
      <RadioHero
        searchQuery="Parhizgar"
        onSearchQueryChange={onSearchQueryChange}
      />,
    );

    const clearButton = screen.getByTestId('close-icon').closest('button');
    expect(clearButton).toBeInTheDocument();
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(onSearchQueryChange).toHaveBeenCalledWith('');
    }
  });

  it('triggers onFilterChange when filter pills are clicked', () => {
    const onFilterChange = vi.fn();
    render(
      <RadioHero
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        activeFilter="all"
        onFilterChange={onFilterChange}
        availableCount={5}
        totalCount={25}
      />,
    );

    expect(screen.getByText('All Stations')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Available Live')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    const availablePill = screen.getByRole('tab', { name: /available live/i });
    fireEvent.click(availablePill);
    expect(onFilterChange).toHaveBeenCalledWith('available');
  });

  it('clears search input when Escape is pressed', () => {
    const onSearchQueryChange = vi.fn();
    render(
      <RadioHero
        searchQuery="Parhizgar"
        onSearchQueryChange={onSearchQueryChange}
      />,
    );

    const input = screen.getByRole('textbox', { name: /search/i });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onSearchQueryChange).toHaveBeenCalledWith('');
  });
});
