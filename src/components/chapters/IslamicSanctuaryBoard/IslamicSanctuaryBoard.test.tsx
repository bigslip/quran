import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import IslamicSanctuaryBoard from './IslamicSanctuaryBoard';
import Chapter from 'types/Chapter';

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, params?: { defaultValue?: string }) => {
      if (key === 'common:ayahs') return params?.defaultValue || 'Ayahs';
      if (key === 'common:makkah-short') return params?.defaultValue || 'Makki';
      if (key === 'common:madinah-short') return params?.defaultValue || 'Madani';
      return params?.defaultValue || key;
    },
    lang: 'en',
  }),
}));

const createMockChapter = (id: number): Chapter => ({
  id,
  transliteratedName: `Surah-${id}`,
  translatedName: `The Chapter ${id}`,
  versesCount: 10 + id,
  revelationPlace: id % 2 === 0 ? 'madinah' : 'makkah',
  revelationOrder: id,
  bismillahPre: id !== 9,
  nameSimple: `Surah-${id}`,
  nameComplex: `Surah-${id}`,
  nameArabic: `سورة ${id}`,
  pages: [1, 1],
  defaultSlug: `surah-${id}`,
  slug: `surah-${id}`,
});

const mockChapters: Chapter[] = Array.from({ length: 7 }, (_, i) => createMockChapter(i + 1));

describe('IslamicSanctuaryBoard', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the sanctuary board with top and bottom crests', () => {
    render(<IslamicSanctuaryBoard chapters={mockChapters} />);
    expect(screen.getByTestId('islamic-sanctuary-board')).toBeInTheDocument();
    expect(screen.getByTestId('sanctuary-top-crest')).toBeInTheDocument();
    expect(screen.getByTestId('sanctuary-bottom-crest')).toBeInTheDocument();
  });

  it('renders chapters in honeycomb rows alternating 4 then 3', () => {
    render(<IslamicSanctuaryBoard chapters={mockChapters} />);
    const row0 = screen.getByTestId('honeycomb-row-0');
    const row1 = screen.getByTestId('honeycomb-row-1');

    expect(row0).toBeInTheDocument();
    expect(row1).toBeInTheDocument();

    // Row 0 has 4 cards, Row 1 has 3 cards
    expect(row0.querySelectorAll('[data-testid^="surah-petal-card-"]')).toHaveLength(4);
    expect(row1.querySelectorAll('[data-testid^="surah-petal-card-"]')).toHaveLength(3);
  });

  it('renders all petal cards for each chapter', () => {
    render(<IslamicSanctuaryBoard chapters={mockChapters} />);
    for (let i = 1; i <= 7; i += 1) {
      expect(screen.getByTestId(`surah-petal-card-${i}`)).toBeInTheDocument();
      expect(screen.getByText(`Surah-${i}`)).toBeInTheDocument();
      expect(screen.getByText(`00${i}`)).toBeInTheDocument();
    }
  });

  it('handles empty chapters array gracefully without throwing', () => {
    render(<IslamicSanctuaryBoard chapters={[]} />);
    expect(screen.getByTestId('islamic-sanctuary-board')).toBeInTheDocument();
    expect(screen.queryByTestId('honeycomb-row-0')).not.toBeInTheDocument();
  });
});
