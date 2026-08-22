import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TranslationView from './index';

vi.mock('next/dynamic', () => ({
  default: () => () => <div data-testid="dynamic-component" />
}));

vi.mock('@/hooks/useGetQueryParamOrReduxValue', () => ({
  default: () => ({ value: 1, isQueryParamDifferent: false })
}));
vi.mock('@/hooks/useGetQueryParamOrXstateValue', () => ({
  default: () => ({ value: 1, isQueryParamDifferent: false })
}));

vi.mock('./hooks/useGetVersesCount', () => ({ default: () => 1 }));
vi.mock('./hooks/useScrollToVirtualizedVerse', () => ({ default: vi.fn() }));
vi.mock('@/hooks/useQcfFont', () => ({ default: vi.fn() }));

vi.mock('../contexts/BottomActionsExpandContext', () => ({
  BottomActionsExpandProvider: ({ children }: any) => <div>{children}</div>
}));
vi.mock('react-virtuoso', () => ({
  Virtuoso: () => <div data-testid="virtuoso" />
}));

describe('TranslationView', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    const initialData = { verses: [{ id: 1, verseNumber: 1, chapterId: 1, words: [], translations: [] }], pagination: { perPage: 1 } };
    const styles = { quranTextFontScale: 3, quranFont: 'qpc_uthmani_hafs', mushafLines: '16_lines' };
    render(
      <TranslationView 
        quranReaderStyles={styles as any} 
        quranReaderDataType={"chapter" as any} 
        initialData={initialData as any} 
        resourceId={1} 
        data-testid="translation-view" 
        aria-hidden="true" 
      />
    );
    const el = screen.getByTestId('translation-view');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});

vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectReadingPreference: vi.fn(),
  selectInlineDisplayWordByWordPreferences: vi.fn(),
}));
vi.mock('@/redux/slices/QuranReader/translations', () => ({
  selectSelectedTranslations: vi.fn(),
}));

vi.mock('../QueryParamMessage', () => ({ default: () => <div data-testid="query-param-message" /> }));

vi.mock('./TranslationViewVerse', () => ({ default: () => <div data-testid="translation-view-verse" /> }));

vi.mock('../onCopyQuranWords', () => ({ default: vi.fn() }));
vi.mock('@/redux/defaultSettings/util', () => ({
  getTranslationsInitialState: vi.fn(() => ({ selectedTranslations: [] })),
  getReadingPreferencesInitialState: vi.fn(() => ({})),
}));
