import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import VerseText from './VerseText';
import StartingVerseHighlightContext from '@/contexts/StartingVerseHighlightContext';

// Mock Redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn((fn) => {
    try {
      return fn({ 
        quranReaderStyles: { quranFont: 'qpc_uthmani_hafs', quranTextFontScale: 3, mushafLines: '16_lines' },
        readingPreferences: { inlineWordByWordPreference: [] },
        readingViewVerse: { selectedVerseKey: null, hoveredVerseKey: null },
      });
    } catch { return false; }
  }),
  shallowEqual: vi.fn(),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ query: {} }),
}));

vi.mock('@/components/QuranReader/hooks/useIsFontLoaded', () => ({
  default: () => true,
}));

vi.mock('./SeoTextForVerse', () => ({
  default: () => <div data-testid="seo-text" />,
}));

vi.mock('./TajweedFontPalettes', () => ({
  default: () => <div data-testid="tajweed-palettes" />,
}));

vi.mock('@/dls/QuranWord/QuranWord', () => ({
  default: () => <div data-testid="quran-word">Word</div>,
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: vi.fn(() => ({ quranFont: 'qpc_uthmani_hafs', quranTextFontScale: 3, mushafLines: '16_lines' })),
}));
vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectInlineDisplayWordByWordPreferences: vi.fn(() => ({ showWordByWordTranslation: false, showWordByWordTransliteration: false })),
}));
vi.mock('@/redux/slices/QuranReader/readingViewVerse', () => ({
  selectReadingViewSelectedVerseKey: vi.fn(),
  selectReadingViewHoveredVerseKey: vi.fn(),
  selectIsVerseHovered: vi.fn(() => vi.fn(() => false)),
  selectIsVerseSelected: vi.fn(() => vi.fn(() => false)),
}));

describe('VerseText', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    const words = [
      { id: "1", text: "بسم", charTypeName: "word", verseKey: "1:1", location: "1:1:1", pageNumber: 1, lineNumber: 1 }
    ];
    render(
      <StartingVerseHighlightContext.Provider value={{ verseKey: null }}>
        <VerseText words={words as any} aria-hidden="true" />
      </StartingVerseHighlightContext.Provider>
    );
    const el = screen.getByTestId('verse-arabic-1:1');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByTestId('seo-text')).toBeTruthy();
    expect(screen.getByTestId('tajweed-palettes')).toBeTruthy();
    expect(screen.getByTestId('quran-word')).toBeTruthy();
  });
});
