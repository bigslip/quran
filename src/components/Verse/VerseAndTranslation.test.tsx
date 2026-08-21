import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import VerseAndTranslation from './VerseAndTranslation';

// Mock dependencies
vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ lang: 'en', t: (k: string) => k }),
}));

vi.mock('@/hooks/useVerseAndTranslation', () => ({
  default: () => ({
    data: {
      verses: [
        {
          id: 1,
          verseKey: '1:1',
          chapterId: 1,
          verseNumber: 1,
          words: [],
          translations: [{ id: 1, languageId: 38, text: 'In the name' }]
        }
      ]
    },
    error: null,
    mutate: vi.fn(),
    translationFontScale: 3,
    quranTextFontScale: 3,
  }),
}));

vi.mock('@/components/Error', () => ({ default: () => <div data-testid="error" /> }));
vi.mock('@/dls/Spinner/Spinner', () => ({ default: () => <div data-testid="spinner" /> }));
vi.mock('./PlainVerseText', () => ({ default: () => <div data-testid="plain-verse" /> }));
vi.mock('@/components/QuranReader/TranslationView/TranslationText', () => ({ default: () => <div data-testid="translation-text" /> }));
vi.mock('../QuranReader/TranslationView/TranslationText/Reference', () => ({ default: () => <div data-testid="reference" /> }));

describe('VerseAndTranslation', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    render(
      <VerseAndTranslation 
        chapter={1} 
        from={1} 
        to={1} 
        data-testid="verse-and-translation" 
        aria-hidden="true" 
      />
    );
    const el = screen.getByTestId('verse-and-translation');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByTestId('plain-verse')).toBeTruthy();
    expect(screen.getByTestId('translation-text')).toBeTruthy();
  });
});
