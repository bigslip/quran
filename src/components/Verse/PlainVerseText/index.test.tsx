import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import PlainVerseText from './index';

// Mock Redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn(() => ({ quranFont: 'qpc_uthmani_hafs', quranTextFontScale: 3, mushafLines: '16_lines' })),
  shallowEqual: vi.fn(),
}));

vi.mock('@/components/QuranReader/hooks/useIsFontLoaded', () => ({
  default: () => true,
}));

vi.mock('../SeoTextForVerse', () => ({
  default: () => <div data-testid="seo-text" />,
}));

vi.mock('../TajweedFontPalettes', () => ({
  default: () => <div data-testid="tajweed-palettes" />,
}));

vi.mock('./PlainVerseTextWord', () => ({
  default: ({ children }: any) => <div data-testid="plain-verse-word">{children}</div>,
}));

vi.mock('@/dls/QuranWord/TextWord', () => ({
  default: ({ text, font, charType }: any) => (
    <div data-testid="text-word" data-font={font} data-char-type={charType}>
      {text}
    </div>
  ),
}));

vi.mock('@/dls/QuranWord/GlyphWord', () => ({
  default: ({ font, textCodeV1, qpcUthmaniHafs }: any) => (
    <div data-testid="glyph-word" data-font={font} data-code-v1={textCodeV1}>
      {qpcUthmaniHafs || textCodeV1 || 'A'}
    </div>
  ),
}));

describe('PlainVerseText', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    const words = [
      { id: "1", text: "بسم", charTypeName: "word", verseKey: "1:1", location: "1:1:1", pageNumber: 1 }
    ];
    render(<PlainVerseText words={words as any} data-testid="plain-verse" aria-hidden="true" />);
    const el = screen.getByTestId('plain-verse');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByTestId('seo-text')).toBeTruthy();
    expect(screen.getByTestId('tajweed-palettes')).toBeTruthy();
    expect(screen.getByTestId('plain-verse-word')).toBeTruthy();
  });

  it('renders IndoPak text correctly when quranFont is IndoPak', () => {
    const words = [
      {
        id: "1",
        text: "ﭑ", // QCF code_v1 glyph
        textIndopak: "بِسۡمِ",
        textUthmani: "بِسْمِ",
        charTypeName: "word",
        verseKey: "1:1",
        location: "1:1:1",
        pageNumber: 1,
      }
    ];
    render(
      <PlainVerseText 
        words={words as any} 
        quranFont={'text_indopak' as any} 
        data-testid="plain-verse" 
      />
    );
    const textWord = screen.getByTestId('text-word');
    expect(textWord).toBeTruthy();
    expect(textWord.getAttribute('data-font')).toBe('text_indopak');
    expect(textWord.textContent).toBe('بِسۡمِ');
    expect(textWord.textContent).not.toBe('ﭑ');
  });
});

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: vi.fn(),
}));

