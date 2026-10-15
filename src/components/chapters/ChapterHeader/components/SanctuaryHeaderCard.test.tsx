import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import SanctuaryHeaderCard from './SanctuaryHeaderCard';
import DataContext from '@/contexts/DataContext';
import Chapter from 'types/Chapter';

expect.extend(matchers);

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (params?.number !== undefined) return `Surah ${params.number}`;
      if (params?.count !== undefined) return `${params.count} Ayahs`;
      return key;
    },
    lang: 'en',
  }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: () => ({}),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/[chapterId]', asPath: '/18', locale: 'en' }),
}));

vi.mock('@/icons/share.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="share-icon" {...props} />,
}));

vi.mock('@/icons/info.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="info-icon" {...props} />,
}));

vi.mock('@/icons/search.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="search-icon" {...props} />,
}));


const mockChapters: Record<string, Chapter> = {
  '18': {
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
  },
};

afterEach(() => {
  cleanup();
});

describe('SanctuaryHeaderCard', () => {
  it('renders hero card with badges, title, calligraphy, and action bar', () => {
    render(
      <DataContext.Provider value={mockChapters}>
        <SanctuaryHeaderCard chapterId="18" />
      </DataContext.Provider>,
    );

    expect(screen.getByTestId('sanctuary-header-card')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-badges-row')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-action-bar')).toBeInTheDocument();
    expect(screen.getByText('Al-Kahf')).toBeInTheDocument();
    expect(screen.getByText('The Cave')).toBeInTheDocument();
  });

  it('renders with juz number when provided', () => {
    render(
      <DataContext.Provider value={mockChapters}>
        <SanctuaryHeaderCard chapterId="18" juzNumber={15} />
      </DataContext.Provider>,
    );

    expect(screen.getByText(/15/i)).toBeInTheDocument();
  });

  it('returns null if chapter is not found in DataContext', () => {
    const { container } = render(
      <DataContext.Provider value={mockChapters}>
        <SanctuaryHeaderCard chapterId="999" />
      </DataContext.Provider>,
    );

    expect(container.firstChild).toBeNull();
  });
});
