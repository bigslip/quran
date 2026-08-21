import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import GlyphWord from './GlyphWord';
import { QuranFont } from 'types/QuranReader';

// Mock react-redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn(() => ({
    quranTextFontScale: 3,
    mushafLines: '16_lines',
  })),
  shallowEqual: vi.fn(),
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: vi.fn(),
}));

describe('GlyphWord', () => {
  afterEach(cleanup);
  it('renders glyph and spreads props', () => {
    render(
      <GlyphWord 
        font={QuranFont.QPCHafs} 
        qpcUthmaniHafs="A" textCodeV2="A" 
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
});
