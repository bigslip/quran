import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import QuranReciterListHero from './QuranReciterListHero';

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
  'reciter:sanctuary-badge': 'Holy Quran Audio Sanctuary',
  'reciter:hero-title': 'Quran Reciters & Masters',
  'reciter:hero-subtitle': 'Listen to soulful recitations',
  'reciter:search-placeholder': 'Search by reciter name...',
  'reciter:filter-all': 'All Reciters',
  'reciter:filter-available': 'Available Audio',
  'reciter:filter-murattal': 'Murattal',
  'reciter:filter-mujawwad': 'Mujawwad',
  'common:clear': 'Clear',
};

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => mockTranslations[key] || key,
    lang: 'en',
  }),
}));

describe('QuranReciterListHero', () => {
  it('renders and spreads HTML attributes', () => {
    render(
      <QuranReciterListHero
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        data-testid="reciter-hero"
        aria-label="Hero"
      />,
    );

    const root = screen.getByTestId('reciter-hero');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-label', 'Hero');
    expect(screen.getByText('Quran Reciters & Masters')).toBeInTheDocument();
  });

  it('handles search input changes and clear button', () => {
    const onSearchQueryChange = vi.fn();
    const { rerender } = render(
      <QuranReciterListHero
        searchQuery=""
        onSearchQueryChange={onSearchQueryChange}
      />,
    );

    const input = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(input, { target: { value: 'Parhizgar' } });
    expect(onSearchQueryChange).toHaveBeenCalledWith('Parhizgar');

    // Rerender with searchQuery to show clear button
    rerender(
      <QuranReciterListHero
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
      <QuranReciterListHero
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        activeFilter="all"
        onFilterChange={onFilterChange}
        availableCount={4}
        totalCount={20}
      />,
    );

    expect(screen.getByText('All Reciters')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Available Audio')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    const availablePill = screen.getByRole('tab', { name: /available audio/i });
    fireEvent.click(availablePill);
    expect(onFilterChange).toHaveBeenCalledWith('available');
  });
});

