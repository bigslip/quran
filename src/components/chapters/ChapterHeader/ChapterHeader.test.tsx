import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ChapterHeader from './index';
import DataContext from '@/contexts/DataContext';
import Chapter from 'types/Chapter';

expect.extend(matchers);

vi.mock('@/icons/info.svg', () => ({
  default: () => <svg data-testid="info-icon" />,
}));

vi.mock('/public/icons/info.svg', () => ({
  default: () => <svg data-testid="info-icon" />,
}));

vi.mock('/public/bismillah.svg', () => ({
  default: () => <svg data-testid="bismillah-svg" />,
}));

vi.mock('@/icons/bismillah.svg', () => ({
  default: () => <svg data-testid="bismillah-svg" />,
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (params?.chapterName) return `Read and listen to Surah ${params.chapterName}`;
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
  useRouter: () => ({ pathname: '/[chapterId]', asPath: '/2', locale: 'en' }),
}));

vi.mock('@/components/QuranReader/PlayChapterAudioButton', () => ({
  default: () => <button data-testid="listen-button">Listen</button>,
}));

vi.mock('./components/TranslationSettingsButton', () => ({
  default: () => <button data-testid="translation-settings-button">Translation</button>,
}));

vi.mock('./ReadingModeActions', () => ({
  default: () => <button data-testid="reading-mode-actions">Reading Mode</button>,
}));

const mockChapters: Record<string, Chapter> = {
  '2': {
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
  },
};

afterEach(() => {
  cleanup();
});

describe('ChapterHeader (Quran.com design)', () => {
  it('renders headerCard with title, calligraphy icon, seo intro, play button, and controls', () => {
    render(
      <DataContext.Provider value={mockChapters}>
        <ChapterHeader chapterId="2" isTranslationView />
      </DataContext.Provider>,
    );

    expect(screen.getByTestId('chapter-header-card')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-title')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Al-Baqarah/i);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/The Cow/i);
    expect(screen.getByText(/Read and listen to Surah Al-Baqarah/i)).toBeInTheDocument();
    expect(screen.getByTestId('chapter-header-top-controls')).toBeInTheDocument();
    expect(screen.getByTestId('listen-button')).toBeInTheDocument();
    expect(screen.getByTestId('surah-info-button')).toBeInTheDocument();
    expect(screen.getByTestId('translation-settings-button')).toBeInTheDocument();
    expect(screen.getByTestId('bismillah-section')).toBeInTheDocument();
  });
});
