import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import AppsPage from '@/pages/apps';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

const mockTranslations: Record<string, string> = {
  'sanctuary-badge': 'Connected Quran Ecosystem',
  'hero.title': 'Connected Quran Apps',
  'hero.description': 'Explore unique apps powered by Quran Foundation',
  'search-placeholder': 'Search Quran apps and tools...',
  'filter-all': 'All Apps',
  'filter-study-tools': 'Study Tools',
  'filter-reflections': 'Reflections',
  'filter-popular': 'Popular',
  'filter-quran-reader': 'Quran & Reciters',
  'filter-community': 'Community',
  'filter-hadith-sunnah': 'Hadith & Sunnah',
  'filter-apps-aria': 'Filter apps by category',
  'featured.title': 'Featured Apps',
  'featured.view-all': 'View all',
  'featured.apps.qariah.name': 'Qariah',
  'featured.apps.qariah.tagline': 'Women Quran Reciters',
  'featured.apps.qariah.headline': 'Listen to 60+ women reciters',
  'featured.apps.quran-space.name': 'Quran Space',
  'featured.apps.quran-space.tagline': 'Live Quran Meeting Space',
  'featured.apps.quran-space.headline': 'Connect with teachers and students in real time',
  'browse.title': 'Browse All Apps',
  'browse.apps.quran_android.title': 'Quran for Android',
  'browse.apps.quran_android.tagline': 'Free Android app',
  'browse.apps.quran_android.description': 'Madani-style pages, audio, translations',
  'browse.apps.quran_ios.title': 'Quran for iOS',
  'browse.apps.quran_ios.tagline': 'Ad-free iOS app',
  'browse.apps.quran_ios.description': 'Read and memorize Quran on iOS',
  'browse.apps.quranreflect.title': 'QuranReflect',
  'browse.apps.quranreflect.tagline': 'Read & Share Reflections',
  'browse.apps.quranreflect.description': 'Social platform for Quran reflection',
  'cta.google-play': 'Get it on Google Play',
  'cta.app-store': 'Download on App Store',
  'cta.visit': 'Visit Website',
  'no-results-heading': 'No apps found',
  'no-results-message': 'Try adjusting your search query or selecting a different category.',
  'clear-filters': 'Clear Filters',
  clear: 'Clear',
};

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => mockTranslations[key] || key,
    lang: 'en',
  }),
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="search-icon" />,
}));

vi.mock('@/icons/close.svg', () => ({
  default: () => <svg data-testid="close-icon" />,
}));

vi.mock('@/icons/globe.svg', () => ({
  default: () => <svg data-testid="globe-icon" />,
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
  logTextSearchQuery: vi.fn(),
}));

describe('AppsPage', () => {
  it('renders hero, featured apps, and browse all apps sections', () => {
    render(<AppsPage />);

    expect(screen.getByText('Connected Quran Ecosystem')).toBeInTheDocument();
    expect(screen.getByText('Connected Quran Apps')).toBeInTheDocument();
    expect(screen.getByText('Featured Apps')).toBeInTheDocument();
    expect(screen.getByText('Browse All Apps')).toBeInTheDocument();
    expect(screen.getAllByText('Qariah').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Quran for Android').length).toBeGreaterThan(0);
  });

  it('filters apps by search query and shows matching results', () => {
    render(<AppsPage />);

    const searchInput = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(searchInput, { target: { value: 'Android' } });

    expect(screen.getByText('Quran for Android')).toBeInTheDocument();
    // Featured section is hidden during active filter/search
    expect(screen.queryByText('Featured Apps')).not.toBeInTheDocument();
  });

  it('filters apps when a category tab is clicked', () => {
    render(<AppsPage />);

    const reflectionsTab = screen.getByRole('tab', { name: /reflections/i });
    fireEvent.click(reflectionsTab);

    expect(screen.getByText('QuranReflect')).toBeInTheDocument();
    expect(screen.queryByText('Featured Apps')).not.toBeInTheDocument();
  });

  it('displays empty state when no apps match search and resets on button click', () => {
    render(<AppsPage />);

    const searchInput = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(searchInput, { target: { value: 'nonexistent-app-xyz' } });

    expect(screen.getByText('No apps found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your search query or selecting a different category.'),
    ).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    fireEvent.click(clearButton);

    expect(screen.getByText('Featured Apps')).toBeInTheDocument();
    expect(screen.getByText('Browse All Apps')).toBeInTheDocument();
  });
});
