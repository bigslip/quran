import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import PageContainer from './PageContainer';

vi.mock('react-redux', () => ({
  useSelector: vi.fn((fn) => {
    try { return fn({ persistGateHydration: { isHydrationComplete: true } }); } catch { return true; }
  }),
}));

vi.mock('swr/immutable', () => ({
  default: () => ({ data: { verses: [{ id: 1, verseNumber: 1, chapterId: 1 }] } })
}));

vi.mock('@/hooks/auth/useIsLoggedIn', () => ({ default: () => ({ isLoggedIn: false }) }));
vi.mock('@/hooks/useIsUsingDefaultSettings', () => ({ default: () => false }));
vi.mock('@/redux/defaultSettings/util', () => ({ getTranslationsInitialState: () => ({ selectedTranslations: [] }) }));

vi.mock('./Page', () => ({ default: (props: any) => <div data-testid="page" aria-hidden={props['aria-hidden']} /> }));
vi.mock('./ReadingViewSkeleton', () => ({ default: () => <div data-testid="skeleton" /> }));

describe('PageContainer', () => {
  afterEach(cleanup);
  it('renders page correctly and spreads props', () => {
    const pagesVersesRange = { 1: { firstVerseKey: '1:1', lastVerseKey: '1:1', versesCount: 1 } };
    const styles = { quranFont: 'qpc_uthmani_hafs', mushafLines: '16_lines' };
    const initialData = { verses: [{ id: 1, verseNumber: 1, chapterId: 1, words: [], translations: [] }] };
    render(
      <PageContainer 
        pagesVersesRange={pagesVersesRange as any}
        quranReaderStyles={styles as any}
        reciterId={7}
        lang="en"
        wordByWordLocale="en"
        pageIndex={0}
        setMushafPageToVersesMap={vi.fn()}
        initialData={initialData as any}
        readingPreference={"reading" as any}
        data-testid="page-container" 
        aria-hidden="true" 
      />
    );
    const el = screen.getByTestId('page');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});

vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectValidatedReadingTranslation: vi.fn(),
}));
vi.mock('@/redux/slices/QuranReader/translations', () => ({
  selectSelectedTranslations: vi.fn(),
}));
