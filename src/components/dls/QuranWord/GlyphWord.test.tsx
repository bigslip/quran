import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import GlyphWord from './GlyphWord';
import { QuranFont } from 'types/QuranReader';

// Mock react-redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  shallowEqual: vi.fn(),
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: vi.fn(),
  selectQuranMushafLines: vi.fn(),
  selectQuranTextFontScale: vi.fn(),
}));

describe('GlyphWord', () => {
  afterEach(cleanup);

  it('renders glyph and spreads props when font is loaded', () => {
    render(
      <GlyphWord 
        font={QuranFont.QPCHafs} 
        qpcUthmaniHafs="A" 
        textCodeV2="A" 
        pageNumber={1} 
        isFontLoaded={true}
        data-testid="glyph-word" 
        aria-hidden="true" 
      />
    );
    const el = screen.getByTestId('glyph-word');
    expect(el.textContent).toBe('A');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders fallback qpcUthmaniHafs glyph when font is not loaded', () => {
    render(
      <GlyphWord 
        font={QuranFont.MadaniV2} 
        qpcUthmaniHafs="FALLBACK_GLYPH" 
        textCodeV2="V2_GLYPH" 
        pageNumber={1} 
        isFontLoaded={false}
        data-testid="glyph-word" 
      />
    );
    const el = screen.getByTestId('glyph-word');
    expect(el.textContent).toBe('FALLBACK_GLYPH');
  });

  it('renders textCodeV1 for MadaniV1 font when loaded', () => {
    render(
      <GlyphWord 
        font={QuranFont.MadaniV1} 
        qpcUthmaniHafs="FALLBACK"
        textCodeV1="V1_GLYPH" 
        textCodeV2="V2_GLYPH" 
        pageNumber={1} 
        isFontLoaded={true}
        data-testid="glyph-word" 
      />
    );
    const el = screen.getByTestId('glyph-word');
    expect(el.textContent).toBe('V1_GLYPH');
  });
});
