import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ChapterAndJuzList from './ChapterAndJuzList';
import Chapter from 'types/Chapter';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (key === 'home:all-surahs') return `All (${params?.count ?? 0})`;
      if (key === 'home:makki') return `Makki (${params?.count ?? 0})`;
      if (key === 'home:madani') return `Madani (${params?.count ?? 0})`;
      if (key === 'home:search-surah') return 'Search Surah (e.g. Kahf or 18)...';
      if (key === 'home:no-surahs-found') return 'No Surahs found matching your search';
      if (key === 'home:clear-filters') return 'Clear filters';
      if (key === 'common:input.clear') return 'Clear';
      if (key === 'common:surah') return 'Surah';
      if (key === 'common:juz') return 'Juz';
      if (key === 'common:revelation_order') return 'Revelation Order';
      if (key === 'common:sort.by') return 'Sort by';
      if (key === 'common:sort.ascending') return 'Ascending';
      if (key === 'common:sort.descending') return 'Descending';
      if (key === 'common:ayahs') return 'Ayahs';
      return key;
    },
    lang: 'en',
  }),
}));

vi.mock('next/dynamic', () => ({
  default: () => {
    const Component = ({ isDescending, ...props }: any) => (
      <div data-testid="dynamic-component" {...props} />
    );
    return Component;
  },
}));

vi.mock('@/icons/caret-down.svg', () => ({ default: () => <svg data-testid="caret-down-icon" /> }));
vi.mock('@/icons/close.svg', () => ({ default: () => <svg data-testid="close-icon" /> }));
vi.mock('@/icons/search.svg', () => ({ default: () => <svg data-testid="search-icon" /> }));

const mockChapters: Chapter[] = [
  {
    id: 1,
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
    id: 2,
    revelationOrder: 87,
    revelationPlace: 'madinah',
    nameComplex: 'Al-Baqarah',
    nameSimple: 'Al-Baqarah',
    transliteratedName: 'Al-Baqarah',
    nameArabic: 'البقرة',
    versesCount: 286,
    translatedName: 'The Cow',
    pages: [2, 49],
    bismillahPre: true,
    defaultSlug: 'al-baqarah',
  },
  {
    id: 18,
    revelationOrder: 69,
    revelationPlace: 'makkah',
    nameComplex: 'Al-Kahf',
    nameSimple: 'Al-Kahf',
    transliteratedName: 'Al-Kahf',
    nameArabic: 'الكهف',
    versesCount: 110,
    translatedName: 'The Cave',
    pages: [293, 304],
    bismillahPre: true,
    defaultSlug: 'al-kahf',
  },
];

describe('ChapterAndJuzList', () => {
  it('renders quick search input and filter pills with correct counts', () => {
    render(<ChapterAndJuzList chapters={mockChapters} />);

    const searchInput = screen.getByTestId('surah-search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search Surah (e.g. Kahf or 18)...');

    const pillAll = screen.getByTestId('filter-pill-all');
    const pillMakki = screen.getByTestId('filter-pill-makki');
    const pillMadani = screen.getByTestId('filter-pill-madani');

    expect(pillAll).toHaveTextContent('All (3)');
    expect(pillMakki).toHaveTextContent('Makki (2)');
    expect(pillMadani).toHaveTextContent('Madani (1)');
    expect(pillAll).toHaveAttribute('aria-pressed', 'true');
  });

  it('filters chapters in real-time by Surah name (e.g. "Kahf")', () => {
    render(<ChapterAndJuzList chapters={mockChapters} />);

    const searchInput = screen.getByTestId('surah-search-input');
    fireEvent.change(searchInput, { target: { value: 'Kahf' } });

    expect(screen.getByTestId('chapter-18-container')).toBeInTheDocument();
    expect(screen.queryByTestId('chapter-1-container')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chapter-2-container')).not.toBeInTheDocument();
  });

  it('filters chapters in real-time by Surah number (e.g. "18")', () => {
    render(<ChapterAndJuzList chapters={mockChapters} />);

    const searchInput = screen.getByTestId('surah-search-input');
    fireEvent.change(searchInput, { target: { value: '18' } });

    expect(screen.getByTestId('chapter-18-container')).toBeInTheDocument();
    expect(screen.queryByTestId('chapter-1-container')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chapter-2-container')).not.toBeInTheDocument();
  });

  it('filters chapters by Makki and Madani filter pills', () => {
    render(<ChapterAndJuzList chapters={mockChapters} />);

    const pillMakki = screen.getByTestId('filter-pill-makki');
    fireEvent.click(pillMakki);

    expect(pillMakki).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('chapter-1-container')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-18-container')).toBeInTheDocument();
    expect(screen.queryByTestId('chapter-2-container')).not.toBeInTheDocument();

    const pillMadani = screen.getByTestId('filter-pill-madani');
    fireEvent.click(pillMadani);

    expect(pillMadani).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('chapter-2-container')).toBeInTheDocument();
    expect(screen.queryByTestId('chapter-1-container')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chapter-18-container')).not.toBeInTheDocument();
  });

  it('shows clear button and clears search when tapped', () => {
    render(<ChapterAndJuzList chapters={mockChapters} />);

    const searchInput = screen.getByTestId('surah-search-input');
    fireEvent.change(searchInput, { target: { value: 'Kahf' } });

    const clearButton = screen.getByTestId('clear-surah-search');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
    expect(screen.getByTestId('chapter-1-container')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-2-container')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-18-container')).toBeInTheDocument();
  });

  it('renders clean zero-result empty state when no Surah matches and allows reset', () => {
    render(<ChapterAndJuzList chapters={mockChapters} />);

    const searchInput = screen.getByTestId('surah-search-input');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });

    const emptyState = screen.getByTestId('no-surahs-found');
    expect(emptyState).toBeInTheDocument();
    expect(screen.getByText('No Surahs found matching your search')).toBeInTheDocument();

    const resetButton = screen.getByTestId('reset-surah-filters');
    fireEvent.click(resetButton);

    expect(searchInput).toHaveValue('');
    expect(screen.getByTestId('chapter-1-container')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-2-container')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-18-container')).toBeInTheDocument();
  });

  it('maintains sort order toggle between ascending and descending', () => {
    render(<ChapterAndJuzList chapters={mockChapters} />);

    const sorter = screen.getByRole('button', { name: /ascending/i });
    fireEvent.click(sorter);

    const chapterContainers = screen.getAllByTestId(/chapter-\d+-container/);
    expect(chapterContainers[0]).toHaveAttribute('data-testid', 'chapter-18-container');
    expect(chapterContainers[1]).toHaveAttribute('data-testid', 'chapter-2-container');
    expect(chapterContainers[2]).toHaveAttribute('data-testid', 'chapter-1-container');
  });

  it('filters chapters by translated name (e.g. "The Cow")', () => {
    render(<ChapterAndJuzList chapters={mockChapters} />);

    const searchInput = screen.getByTestId('surah-search-input');
    fireEvent.change(searchInput, { target: { value: 'The Cow' } });

    expect(screen.getByTestId('chapter-2-container')).toBeInTheDocument();
    expect(screen.queryByTestId('chapter-1-container')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chapter-18-container')).not.toBeInTheDocument();
  });

  it('filters chapters with diacritics / accents normalized (e.g. "fatihah")', () => {
    render(<ChapterAndJuzList chapters={mockChapters} />);

    const searchInput = screen.getByTestId('surah-search-input');
    fireEvent.change(searchInput, { target: { value: 'fatihah' } });

    expect(screen.getByTestId('chapter-1-container')).toBeInTheDocument();
    expect(screen.queryByTestId('chapter-2-container')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chapter-18-container')).not.toBeInTheDocument();
  });

  it('switches between Surah, Juz, and RevelationOrder tabs', () => {
    render(<ChapterAndJuzList chapters={mockChapters} />);

    // Initially on Surah tab
    expect(screen.getByTestId('surah-search-input')).toBeInTheDocument();

    // Click on Juz tab
    const juzTab = screen.getByRole('tab', { name: /juz/i });
    fireEvent.mouseDown(juzTab);
    fireEvent.click(juzTab);

    // Search bar should not be displayed in Juz tab
    expect(screen.queryByTestId('surah-search-input')).not.toBeInTheDocument();
  });
});
