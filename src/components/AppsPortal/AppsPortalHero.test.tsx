import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import AppsPortalHero from './AppsPortalHero';

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
  'sanctuary-badge': 'Connected Quran Ecosystem',
  'hero.title': 'Connected Quran Apps',
  'hero.description': 'Explore unique apps powered by Quran Foundation',
  'search-placeholder': 'Search Quran apps and tools...',
  'filter-apps-aria': 'Filter apps by category',
  clear: 'Clear',
};

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => mockTranslations[key] || key,
    lang: 'en',
  }),
}));

describe('AppsPortalHero', () => {
  const mockFilters = [
    { label: 'All Apps', value: 'all', count: 10 },
    { label: 'Study Tools', value: 'study-tools', count: 4 },
    { label: 'Popular', value: 'popular', count: 6 },
  ];

  it('renders title, badge, description and spreads HTML attributes', () => {
    render(
      <AppsPortalHero
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        filters={mockFilters}
        data-testid="apps-portal-hero"
        aria-label="Apps Portal Hero"
      />,
    );

    const root = screen.getByTestId('apps-portal-hero');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-label', 'Apps Portal Hero');
    expect(screen.getByText('Connected Quran Ecosystem')).toBeInTheDocument();
    expect(screen.getByText('Connected Quran Apps')).toBeInTheDocument();
    expect(
      screen.getByText('Explore unique apps powered by Quran Foundation'),
    ).toBeInTheDocument();
  });

  it('handles search input change and clear button', () => {
    const onSearchQueryChange = vi.fn();
    const { rerender } = render(
      <AppsPortalHero
        searchQuery=""
        onSearchQueryChange={onSearchQueryChange}
        filters={mockFilters}
      />,
    );

    const input = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(input, { target: { value: 'QuranReflect' } });
    expect(onSearchQueryChange).toHaveBeenCalledWith('QuranReflect');

    rerender(
      <AppsPortalHero
        searchQuery="QuranReflect"
        onSearchQueryChange={onSearchQueryChange}
        filters={mockFilters}
      />,
    );

    const clearButton = screen.getByTestId('close-icon').closest('button');
    expect(clearButton).toBeInTheDocument();
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(onSearchQueryChange).toHaveBeenCalledWith('');
    }
  });

  it('triggers onFilterChange when category pills are clicked', () => {
    const onFilterChange = vi.fn();
    render(
      <AppsPortalHero
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        activeFilter="all"
        onFilterChange={onFilterChange}
        filters={mockFilters}
      />,
    );

    expect(screen.getByText('All Apps')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Study Tools')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    const studyToolsPill = screen.getByRole('tab', { name: /study tools/i });
    fireEvent.click(studyToolsPill);
    expect(onFilterChange).toHaveBeenCalledWith('study-tools');
  });

  it('clears search input when Escape is pressed', () => {
    const onSearchQueryChange = vi.fn();
    render(
      <AppsPortalHero
        searchQuery="QuranReflect"
        onSearchQueryChange={onSearchQueryChange}
        filters={mockFilters}
      />,
    );

    const input = screen.getByRole('textbox', { name: /search/i });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onSearchQueryChange).toHaveBeenCalledWith('');
  });

  it('focuses search input when Cmd+K shortcut is pressed', () => {
    render(
      <AppsPortalHero
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        filters={mockFilters}
      />,
    );

    const input = screen.getByRole('textbox', { name: /search/i });
    const focusSpy = vi.spyOn(input, 'focus');

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(focusSpy).toHaveBeenCalled();
  });
});
