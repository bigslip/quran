import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectReadingPreference: vi.fn(() => 'reading'),
  selectInlineDisplayWordByWordPreferences: vi.fn(() => ({
    showWordByWordTranslation: false,
    showWordByWordTransliteration: false,
  })),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn((fn) => {
    try {
      return fn({
        readingPreferences: {
          readingPreference: 'reading',
          inlineWordByWordPreference: {
            showWordByWordTranslation: false,
            showWordByWordTransliteration: false,
          },
        },
      });
    } catch {
      return false;
    }
  }),
  shallowEqual: vi.fn(),
}));

vi.mock('@/components/chapters/ChapterHeader', () => ({
  default: () => <div data-testid="chapter-header" />,
}));
vi.mock('@/components/QuranReader/hooks/useIsFontLoaded', () => ({ default: () => true }));
vi.mock('./Line', () => ({ default: () => <div data-testid="line" /> }));
vi.mock('./PageFooter', () => ({ default: () => <div data-testid="page-footer" /> }));
vi.mock('./TranslationPage', () => ({ default: () => <div data-testid="translation-page" /> }));
vi.mock('./groupLinesByVerses', () => ({ default: () => ({ line1: [] }) }));

import Page from './Page';

describe('Page', () => {
  afterEach(cleanup);

  it('renders reading page with region landmark and spreads props', () => {
    const verses = [{ id: 1, verseNumber: 1, chapterId: 1 }];
    const styles = {
      quranTextFontScale: 3,
      quranFont: 'qpc_uthmani_hafs',
      mushafLines: '16_lines',
    };
    render(
      <Page
        verses={verses as any}
        pageNumber={1}
        quranReaderStyles={styles as any}
        pageIndex={0}
        bookmarksRangeUrl={null}
        lang="en"
        data-testid="page"
        aria-hidden="true"
      />,
    );
    const el = screen.getByTestId('page');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-label')).toBe('Page 1');
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByTestId('chapter-header')).toBeTruthy();
    expect(screen.getByTestId('line')).toBeTruthy();
    expect(screen.getByTestId('page-footer')).toBeTruthy();
  });
});
