import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import RevelationOrderView from './RevelationOrderView';
import Chapter from 'types/Chapter';

expect.extend(matchers);

const mockPush = vi.fn();
const mockDispatch = vi.fn();
const mockOnSettingsChange = vi.fn((key, val, successAction, undoAction, group, cb) => {
  if (cb) cb();
});

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    locale: 'en',
  }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: vi.fn(),
}));

vi.mock('@/hooks/auth/usePersistPreferenceGroup', () => ({
  default: () => ({
    actions: {
      onSettingsChange: mockOnSettingsChange,
    },
    isLoading: false,
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => {
      if (key === 'common:ayahs') return 'Ayahs';
      if (key === 'common:makkah-short') return 'Makki';
      if (key === 'common:madinah-short') return 'Madani';
      return key;
    },
    lang: 'en',
  }),
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
  logValueChange: vi.fn(),
}));

const mockChapters: Chapter[] = [
  {
    id: 1, // Revelation order 5
    revelationOrder: 5,
    revelationPlace: 'makkah',
    nameComplex: 'Al-Fātihah',
    nameSimple: 'Al-Fatihah',
    transliteratedName: 'Al-Fatihah',
    nameArabic: 'الفاتحة',
    versesCount: 7,
    translatedName: 'The Opener',
    pages: [1, 1],
    bismillahPre: false,
    defaultSlug: 'al-fatihah',
  },
  {
    id: 68, // Revelation order 2
    revelationOrder: 2,
    revelationPlace: 'makkah',
    nameComplex: 'Al-Qalam',
    nameSimple: 'Al-Qalam',
    transliteratedName: 'Al-Qalam',
    nameArabic: 'القلم',
    versesCount: 52,
    translatedName: 'The Pen',
    pages: [564, 566],
    bismillahPre: true,
    defaultSlug: 'al-qalam',
  },
  {
    id: 96, // Revelation order 1
    revelationOrder: 1,
    revelationPlace: 'makkah',
    nameComplex: 'Al-\'Alaq',
    nameSimple: 'Al-Alaq',
    transliteratedName: 'Al-\'Alaq',
    nameArabic: 'العلق',
    versesCount: 19,
    translatedName: 'The Clot',
    pages: [597, 597],
    bismillahPre: true,
    defaultSlug: 'al-alaq',
  },
  {
    id: 110, // Revelation order 114
    revelationOrder: 114,
    revelationPlace: 'madinah',
    nameComplex: 'An-Nasr',
    nameSimple: 'An-Nasr',
    transliteratedName: 'An-Nasr',
    nameArabic: 'النصر',
    versesCount: 3,
    translatedName: 'The Divine Support',
    pages: [603, 603],
    bismillahPre: true,
    defaultSlug: 'an-nasr',
  },
];

describe('RevelationOrderView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders chapters ordered by chronological revelation order (Surah 96 first, then 68, 1, 110)', () => {
    render(<RevelationOrderView isDescending={false} chapters={mockChapters} />);

    expect(screen.getByTestId('islamic-sanctuary-board')).toBeInTheDocument();

    const cards = screen.getAllByTestId(/surah-petal-card-\d+/);
    expect(cards).toHaveLength(4);

    // Surah 96 is 1st in revelation order (Order #1)
    expect(cards[0]).toHaveAttribute('data-testid', 'surah-petal-card-96');
    expect(cards[0]).toHaveTextContent('1');
    expect(cards[0]).toHaveTextContent('Al-\'Alaq');

    // Surah 68 is 2nd in revelation order (Order #2)
    expect(cards[1]).toHaveAttribute('data-testid', 'surah-petal-card-68');
    expect(cards[1]).toHaveTextContent('2');
    expect(cards[1]).toHaveTextContent('Al-Qalam');

    // Surah 1 is 5th in revelation order (Order #5)
    expect(cards[2]).toHaveAttribute('data-testid', 'surah-petal-card-1');
    expect(cards[2]).toHaveTextContent('5');
    expect(cards[2]).toHaveTextContent('Al-Fatihah');

    // Surah 110 is 114th in revelation order (Order #114)
    expect(cards[3]).toHaveAttribute('data-testid', 'surah-petal-card-110');
    expect(cards[3]).toHaveTextContent('114');
    expect(cards[3]).toHaveTextContent('An-Nasr');
  });

  it('renders descending revelation order when isDescending is true (Surah 110 first)', () => {
    render(<RevelationOrderView isDescending={true} chapters={mockChapters} />);

    const cards = screen.getAllByTestId(/surah-petal-card-\d+/);
    expect(cards).toHaveLength(4);

    // Surah 110 comes first in descending
    expect(cards[0]).toHaveAttribute('data-testid', 'surah-petal-card-110');
    expect(cards[0]).toHaveTextContent('114');

    // Surah 1 comes second in this subset
    expect(cards[1]).toHaveAttribute('data-testid', 'surah-petal-card-1');
    expect(cards[1]).toHaveTextContent('5');

    // Surah 68 comes third in this subset
    expect(cards[2]).toHaveAttribute('data-testid', 'surah-petal-card-68');
    expect(cards[2]).toHaveTextContent('2');

    // Surah 96 comes last in descending
    expect(cards[3]).toHaveAttribute('data-testid', 'surah-petal-card-96');
    expect(cards[3]).toHaveTextContent('1');
  });

  it('sets reading by revelation order in redux and navigates to the surah on click', () => {
    render(<RevelationOrderView isDescending={false} chapters={mockChapters} />);

    const card96 = screen.getByTestId('surah-petal-card-96');
    fireEvent.click(card96);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'revelationOrder/setIsReadingByRevelationOrder',
      payload: true,
    });
    expect(mockPush).toHaveBeenCalledWith('/96');
  });
});
