import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CommandsList, { Command } from './index';
import { SearchNavigationType } from 'types/Search/SearchNavigationResult';

const mockPush = vi.fn(() => Promise.resolve());
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockDispatch = vi.fn();
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
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
vi.mock('@/icons/close.svg', () => ({ default: () => <svg /> }));

vi.mock('@/hooks/useGetChaptersData', () => ({
  default: () => ({
    1: { id: 1, transliteratedName: 'Al-Fatihah' },
    2: { id: 2, transliteratedName: 'Al-Baqarah' },
  }),
}));

vi.mock('@/hooks/useScrollToElement', () => ({
  default: () => [vi.fn(), { current: null }],
  SMOOTH_SCROLL_TO_CENTER: {},
}));

describe('CommandsList', () => {
  afterEach(() => {
    cleanup();
    mockPush.mockClear();
    mockDispatch.mockClear();
  });

  const mockCommands: Command[] = [
    {
      name: 'Surah Al-Fatihah',
      key: '1',
      resultType: SearchNavigationType.SURAH,
      group: 'Surahs',
      index: 0,
    },
    {
      name: 'Surah Al-Baqarah',
      key: '2',
      resultType: SearchNavigationType.SURAH,
      group: 'Surahs',
      index: 1,
    },
  ];

  it('renders command list items correctly', () => {
    render(
      <CommandsList
        commandGroups={{
          groups: { Surahs: mockCommands },
          numberOfCommands: 2,
        }}
        searchQuery="fatihah"
      />,
    );

    expect(screen.getByText(/Surah Al-Fatihah/)).toBeTruthy();
    expect(screen.getByText(/Surah Al-Baqarah/)).toBeTruthy();
  });

  it('navigates to link when command item is clicked', () => {
    render(
      <CommandsList
        commandGroups={{
          groups: { Surahs: mockCommands },
          numberOfCommands: 2,
        }}
        searchQuery="fatihah"
      />,
    );

    const firstCommand = screen.getByText(/Surah Al-Fatihah/);
    fireEvent.click(firstCommand);

    expect(mockPush).toHaveBeenCalledWith('/1');
  });

  it('renders empty message when numberOfCommands is 0', () => {
    render(
      <CommandsList
        commandGroups={{
          groups: {},
          numberOfCommands: 0,
        }}
        searchQuery="unknown"
      />,
    );

    expect(screen.getByText('command-bar.no-nav-results')).toBeTruthy();
  });
});
