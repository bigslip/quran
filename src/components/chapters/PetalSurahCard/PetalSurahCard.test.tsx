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

  it('renders Surah number, transliterated name with Makkah class, and Ayah count', () => {
    render(<PetalSurahCard chapter={mockChapter} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    const title = screen.getByText('Al-Fatihah');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass(/makkahTitle/);
    expect(screen.getByText('001')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders Madani class on title for Madani surahs', () => {
    render(<PetalSurahCard chapter={mockMadinahChapter} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    const title = screen.getByText('Al-Baqarah');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass(/madinahTitle/);
    expect(screen.getByText('002')).toBeInTheDocument();
    expect(screen.getByText('286')).toBeInTheDocument();
  });

  it('links to /al-fatihah with prefetch when isPreload is true', () => {
    render(<PetalSurahCard chapter={mockChapter} isPreload />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/al-fatihah');
  });

  it('logs button click on card click', () => {
    render(<PetalSurahCard chapter={mockChapter} />);
    const link = screen.getByRole('link');
    fireEvent.click(link);
    expect(logButtonClick).toHaveBeenCalledWith('homepage_surah_card_1');
  });
});
