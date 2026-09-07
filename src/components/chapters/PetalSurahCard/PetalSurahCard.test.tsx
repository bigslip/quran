import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import PetalSurahCard from './PetalSurahCard';
import Chapter from 'types/Chapter';
import { logButtonClick } from '@/utils/eventLogger';

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

const mockChapter: Chapter = {
  id: 1,
  transliteratedName: 'Al-Fatihah',
  translatedName: 'The Opener',
  versesCount: 7,
  revelationPlace: 'makkah',
  revelationOrder: 5,
  bismillahPre: false,
  nameSimple: 'Al-Fatihah',
  nameComplex: 'Al-Fātihah',
  nameArabic: 'الفاتحة',
  pages: [1, 1],
  defaultSlug: 'al-fatihah',
  slug: 'al-fatihah',
};

const mockMadinahChapter: Chapter = {
  id: 2,
  transliteratedName: 'Al-Baqarah',
  translatedName: 'The Cow',
  versesCount: 286,
  revelationPlace: 'madinah',
  revelationOrder: 87,
  bismillahPre: true,
  nameSimple: 'Al-Baqarah',
  nameComplex: 'Al-Baqarah',
  nameArabic: 'البقرة',
  pages: [2, 49],
  defaultSlug: 'al-baqarah',
  slug: 'al-baqarah',
};

describe('PetalSurahCard', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders Surah number, transliterated name, Ayah count, and revelation tag', () => {
    render(<PetalSurahCard chapter={mockChapter} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Al-Fatihah')).toBeInTheDocument();
    expect(screen.getByText('001')).toBeInTheDocument();
    expect(screen.getByText(/7 Ayahs/i)).toBeInTheDocument();
    expect(screen.getByText(/Makki/i)).toBeInTheDocument();
  });

  it('renders Madani revelation tag for Madani surahs', () => {
    render(<PetalSurahCard chapter={mockMadinahChapter} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Al-Baqarah')).toBeInTheDocument();
    expect(screen.getByText('002')).toBeInTheDocument();
    expect(screen.getByText(/286 Ayahs/i)).toBeInTheDocument();
    expect(screen.getByText(/Madani/i)).toBeInTheDocument();
  });

  it('links to /1 with prefetch when isPreload is true', () => {
    render(<PetalSurahCard chapter={mockChapter} isPreload />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/1');
  });

  it('logs button click on card click', () => {
    render(<PetalSurahCard chapter={mockChapter} />);
    const link = screen.getByRole('link');
    fireEvent.click(link);
    expect(logButtonClick).toHaveBeenCalledWith('homepage_surah_card_1');
  });
});
