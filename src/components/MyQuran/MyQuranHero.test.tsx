import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import MyQuranHero from './MyQuranHero';
import MyQuranTab from './tabs';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

vi.mock('@/icons/bookmark.svg', () => ({
  default: () => <svg data-testid="bookmark-icon" />,
}));

vi.mock('@/icons/history.svg', () => ({
  default: () => <svg data-testid="history-icon" />,
}));

vi.mock('@/icons/edit.svg', () => ({
  default: () => <svg data-testid="edit-icon" />,
}));

const mockTranslations: Record<string, string> = {
  'sanctuary-badge': 'Personal Spiritual Sanctuary',
  'hero-title': 'My Quran',
  'hero-subtitle': 'Your personal space for saved verses, recitation history, and reflections.',
  'tabs-aria': 'My Quran navigation tabs',
  'saved': 'Saved & Collections',
  'recent': 'Recent History',
  'notes-and-reflections': 'Notes & Reflections',
};

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => mockTranslations[key] || key,
    lang: 'en',
  }),
}));

describe('MyQuranHero', () => {
  it('renders sanctuary badge, hero title, subtitle and tabs', () => {
    render(
      <MyQuranHero
        selectedTab={MyQuranTab.SAVED}
        onTabChange={vi.fn()}
        data-testid="my-quran-hero"
        aria-label="My Quran Hero"
      />,
    );

    const root = screen.getByTestId('my-quran-hero');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-label', 'My Quran Hero');

    expect(screen.getByText('Personal Spiritual Sanctuary')).toBeInTheDocument();
    expect(screen.getByText('My Quran')).toBeInTheDocument();
    expect(
      screen.getByText('Your personal space for saved verses, recitation history, and reflections.'),
    ).toBeInTheDocument();

    const tablist = screen.getByRole('tablist', { name: /my quran navigation tabs/i });
    expect(tablist).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: /saved & collections/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /recent history/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /notes & reflections/i })).toBeInTheDocument();
  });

  it('highlights the selected tab properly and has correct aria attributes', () => {
    render(<MyQuranHero selectedTab={MyQuranTab.RECENT} onTabChange={vi.fn()} />);

    const savedTab = screen.getByRole('tab', { name: /saved & collections/i });
    const recentTab = screen.getByRole('tab', { name: /recent history/i });
    const notesTab = screen.getByRole('tab', { name: /notes & reflections/i });

    expect(savedTab).toHaveAttribute('aria-selected', 'false');
    expect(recentTab).toHaveAttribute('aria-selected', 'true');
    expect(notesTab).toHaveAttribute('aria-selected', 'false');
  });

  it('triggers onTabChange when a tab pill is clicked', () => {
    const onTabChange = vi.fn();
    render(<MyQuranHero selectedTab={MyQuranTab.SAVED} onTabChange={onTabChange} />);

    const recentTab = screen.getByRole('tab', { name: /recent history/i });
    fireEvent.click(recentTab);
    expect(onTabChange).toHaveBeenCalledWith(MyQuranTab.RECENT);

    const notesTab = screen.getByRole('tab', { name: /notes & reflections/i });
    fireEvent.click(notesTab);
    expect(onTabChange).toHaveBeenCalledWith(MyQuranTab.NOTES_AND_REFLECTIONS);
  });
});
