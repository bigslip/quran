import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CommandPaletteModal from './CommandPaletteModal';
import DataContext from '@/contexts/DataContext';
import Chapter from 'types/Chapter';
import ChaptersData from 'types/ChaptersData';

const mockPush = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

const mockDispatch = vi.fn();
let mockIsSearchDrawerOpen = true;
let mockActiveTab = 'all';

vi.mock('react-redux', () => ({
  useSelector: (selector: any) => {
    const state = {
      navbar: {
        isSearchDrawerOpen: mockIsSearchDrawerOpen,
        commandPaletteTab: mockActiveTab,
      },
    };
    return selector(state);
  },
  useDispatch: () => mockDispatch,
  shallowEqual: (a: any, b: any) => a === b,
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="search-icon" />,
}));

vi.mock('@/components/Search/VoiceSearch', () => ({
  default: () => <div data-testid="voice-search" />,
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
}));

const mockChaptersData: ChaptersData = {
  '1': {
    id: 1,
    versesCount: 7,
    bismillahPre: false,
    revelationOrder: 5,
    revelationPlace: 'makkah',
    pages: [1],
    nameComplex: 'Al-Fātihah',
    nameSimple: 'Al-Fatihah',
    transliteratedName: 'Al-Fatihah',
    nameArabic: 'الفاتحة',
    translatedName: 'The Opener',
    defaultSlug: 'al-fatihah',
  } as Chapter,
  '2': {
    id: 2,
    versesCount: 286,
    bismillahPre: true,
    revelationOrder: 87,
    revelationPlace: 'madinah',
    pages: [2, 49],
    nameComplex: 'Al-Baqarah',
    nameSimple: 'Al-Baqarah',
    transliteratedName: 'Al-Baqarah',
    nameArabic: 'البقرة',
    translatedName: 'The Cow',
    defaultSlug: 'al-baqarah',
  } as Chapter,
  '18': {
    id: 18,
    versesCount: 110,
    bismillahPre: true,
    revelationOrder: 69,
    revelationPlace: 'makkah',
    pages: [293, 304],
    nameComplex: 'Al-Kahf',
    nameSimple: 'Al-Kahf',
    transliteratedName: 'Al-Kahf',
    nameArabic: 'الكهف',
    translatedName: 'The Cave',
    defaultSlug: 'al-kahf',
  } as Chapter,
};

describe('CommandPaletteModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSearchDrawerOpen = true;
    mockActiveTab = 'all';
  });

  it('renders command palette dialog when open', () => {
    render(
      <DataContext.Provider value={mockChaptersData}>
        <CommandPaletteModal />
      </DataContext.Provider>,
    );

    expect(screen.getByTestId('search-drawer-container')).toBeDefined();
    expect(screen.getByTestId('search-drawer-header')).toBeDefined();
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('renders filter tabs correctly', () => {
    render(
      <DataContext.Provider value={mockChaptersData}>
        <CommandPaletteModal />
      </DataContext.Provider>,
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(4);
  });

  it('displays prominent direct jump card when user types a valid verse reference e.g. 2:255', async () => {
    render(
      <DataContext.Provider value={mockChaptersData}>
        <CommandPaletteModal />
      </DataContext.Provider>,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '2:255' } });

    expect(await screen.findByText(/Surah Al-Baqarah, Ayah 255/)).toBeDefined();
    expect(await screen.findByText(/Ayat Al-Kursi/)).toBeDefined();
  });

  it('navigates when clicking a Surah item', async () => {
    render(
      <DataContext.Provider value={mockChaptersData}>
        <CommandPaletteModal />
      </DataContext.Provider>,
    );

    const surahItem = document.querySelector('li[role="option"]');
    expect(surahItem).not.toBeNull();
    if (surahItem) {
      fireEvent.click(surahItem);
      expect(mockPush).toHaveBeenCalledWith('/1');
    }
  });
});
