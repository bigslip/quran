import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ChapterBadgesRow from './ChapterBadgesRow';
import Chapter from 'types/Chapter';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (params?.number !== undefined) return `Surah ${params.number}`;
      if (params?.count !== undefined) return `${params.count} Ayahs`;
      if (key === 'makkah-short') return 'Makki';
      if (key === 'madani-short') return 'Madani';
      if (key === 'surah') return 'Surah';
      if (key === 'ayahs') return 'Ayahs';
      if (key === 'juz') return 'Juz';
      return key;
    },
    lang: 'en',
  }),
}));

const mockChapterMakkah: Chapter = {
  id: 18,
  transliteratedName: 'Al-Kahf',
  translatedName: 'The Cave',
  versesCount: 110,
  revelationPlace: 'makkah',
  revelationOrder: 69,
  bismillahPre: true,
  nameSimple: 'Al-Kahf',
  nameArabic: 'الكهف',
  nameComplex: 'Al-Kahf',
  pages: [293, 304],
  slug: 'al-kahf',
  defaultSlug: 'al-kahf',
};

const mockChapterMadinah: Chapter = {
  id: 2,
  transliteratedName: 'Al-Baqarah',
  translatedName: 'The Cow',
  versesCount: 286,
  revelationPlace: 'madinah',
  revelationOrder: 87,
  bismillahPre: true,
  nameSimple: 'Al-Baqarah',
  nameArabic: 'البقرة',
  nameComplex: 'Al-Baqarah',
  pages: [2, 49],
  slug: 'al-baqarah',
  defaultSlug: 'al-baqarah',
};

describe('ChapterBadgesRow', () => {
  it('renders Makki revelation badge, surah number badge, ayah count, and juz badge', () => {
    render(<ChapterBadgesRow chapter={mockChapterMakkah} juzNumber={15} />);

    expect(screen.getByTestId('chapter-badges-row')).toBeInTheDocument();
    expect(screen.getByText('Makki')).toBeInTheDocument();
    expect(screen.getByText('🕌')).toBeInTheDocument();
    expect(screen.getByText(/Surah 18/i)).toBeInTheDocument();
    expect(screen.getByText(/110 Ayahs/i)).toBeInTheDocument();
    expect(screen.getByText(/Juz 15/i)).toBeInTheDocument();
  });

  it('renders Madani revelation badge and does not render juz badge when omitted', () => {
    render(<ChapterBadgesRow chapter={mockChapterMadinah} />);

    expect(screen.getByText('Madani')).toBeInTheDocument();
    expect(screen.getByText('🌴')).toBeInTheDocument();
    expect(screen.getByText(/Surah 2/i)).toBeInTheDocument();
    expect(screen.getByText(/286 Ayahs/i)).toBeInTheDocument();
    expect(screen.queryByText(/Juz/i)).not.toBeInTheDocument();
  });
});
