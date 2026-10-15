import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import QuranWord from './QuranWord';
import { QuranFont } from 'types/QuranReader';
import { CharType } from 'types/Word';

// Mock XState and Redux
vi.mock('@xstate/react', () => ({ useSelector: vi.fn(() => false) }));
vi.mock('react-redux', () => ({
  useSelector: vi.fn((fn) => {
    try {
      return fn({ 
        audioPlayerState: { showTooltipWhenPlayingAudio: false }, 
        readingPreferences: { 
          inlineWordByWordPreference: [], 
          readingPreference: 'translation', 
          tooltipContentType: [], 
          wordClickFunctionality: 'play-audio' 
        },
        quranReaderStyles: { quranTextFontScale: 3, mushafLines: '16_lines' }
      });
    } catch { return false; }
  }),
  useDispatch: vi.fn(() => vi.fn()),
  shallowEqual: vi.fn(),
}));

vi.mock('src/xstate/AudioPlayerMachineContext', () => ({
  AudioPlayerMachineContext: {
    useActorRef: vi.fn(() => ({
      getSnapshot: () => ({ matches: () => false, context: {} }),
      send: vi.fn(),
    })),
  },
}));

// Mock slices
vi.mock('@/redux/slices/AudioPlayer/state', () => ({ selectShowTooltipWhenPlayingAudio: vi.fn(() => false) }));
vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectInlineDisplayWordByWordPreferences: vi.fn(() => ({ showWordByWordTranslation: true, showWordByWordTransliteration: false })),
  selectReadingPreference: vi.fn(() => 'translation'),
  selectTooltipContentType: vi.fn(() => []),
  selectWordClickFunctionality: vi.fn(() => 'play-audio'),
}));
vi.mock('@/redux/slices/QuranReader/readingViewVerse', () => ({ setReadingViewHoveredVerseKey: vi.fn() }));
vi.mock('@/redux/slices/QuranReader/studyMode', () => ({ openStudyMode: vi.fn() }));
vi.mock('src/xstate/actors/audioPlayer/selectors', () => ({ selectIsAudioPlayerVisible: vi.fn(() => false) }));

// Mock internal components
vi.mock('./GlyphWord', () => ({
  default: ({ font, textCodeV1, qpcUthmaniHafs }: any) => (
    <div data-testid="glyph-word" data-font={font} data-code-v1={textCodeV1}>
      {qpcUthmaniHafs || textCodeV1 || 'A'}
    </div>
  ),
}));
vi.mock('./TextWord', () => ({
  default: ({ text, font, charType }: any) => (
    <div data-testid="text-word" data-font={font} data-char-type={charType}>
      {text}
    </div>
  ),
}));
vi.mock('./ReadingModeWordHoverActions', () => ({ default: () => <div data-testid="hover-actions" /> }));
vi.mock('../InlineWordByWord', () => ({ default: () => <div data-testid="inline-word-by-word" /> }));
vi.mock('@/dls/Popover/HoverablePopover', () => ({ default: ({ children }: any) => <div data-testid="popover">{children}</div> }));

const mockWord = {
  id: '1',
  position: 1,
  audioUrl: 'url',
  charTypeName: 'word',
  charType: CharType.Word,
  textUthmani: 'بِسْمِ',
  textIndopak: 'بِسۡمِ',
  qpcUthmaniHafs: 'بِسۡمِ',
  pageNumber: 1,
  lineNumber: 1,
  text: 'ﭑ',
  codeV1: 'ﭑ',
  codeV2: 'ﱁ',
  translation: { text: 'In the name', languageName: 'english' },
  transliteration: { text: 'Bism', languageName: 'english' },
  verseKey: '1:1',
  location: '1:1:1',
};

describe('QuranWord', () => {
  afterEach(cleanup);
  
  it('renders a GlyphWord when font is QCF MadaniV1', () => {
    render(<QuranWord word={mockWord as any} font={QuranFont.MadaniV1} />);
    const glyph = screen.getByTestId('glyph-word');
    expect(glyph).toBeTruthy();
    expect(glyph.getAttribute('data-font')).toBe(QuranFont.MadaniV1);
  });

  it('renders TextWord with authentic IndoPak text instead of QCF glyph codes when font is IndoPak', () => {
    render(<QuranWord word={mockWord as any} font={QuranFont.IndoPak} />);
    const textWord = screen.getByTestId('text-word');
    expect(textWord).toBeTruthy();
    expect(textWord.getAttribute('data-font')).toBe(QuranFont.IndoPak);
    // MUST render authentic Nastaleeq Arabic text, NOT the QCF code_v1 glyph "ﭑ"
    expect(textWord.textContent).toBe('بِسۡمِ');
    expect(textWord.textContent).not.toBe('ﭑ');
  });

  it('falls back to textUthmani or qpcUthmaniHafs when textIndopak is missing for IndoPak font', () => {
    const wordWithoutIndopak = {
      ...mockWord,
      textIndopak: undefined,
      text_indopak: undefined,
      textUthmani: 'بِسْمِ',
      text: 'ﭑ', // QCF glyph code
    };
    render(<QuranWord word={wordWithoutIndopak as any} font={QuranFont.IndoPak} />);
    const textWord = screen.getByTestId('text-word');
    expect(textWord.textContent).toBe('بِسْمِ');
  });

  it('renders TextWord with qpcUthmaniHafs when font is QPCHafs', () => {
    render(<QuranWord word={mockWord as any} font={QuranFont.QPCHafs} />);
    const textWord = screen.getByTestId('text-word');
    expect(textWord).toBeTruthy();
    expect(textWord.getAttribute('data-font')).toBe(QuranFont.QPCHafs);
    expect(textWord.textContent).toBe('بِسۡمِ');
  });

  it('detects IndoPak stop signs and applies spacing class', () => {
    const wordWithStopSign = {
      ...mockWord,
      textIndopak: 'الٓمّٓۚ‏',
    };
    const { container } = render(
      <QuranWord word={wordWithStopSign as any} font={QuranFont.IndoPak} />
    );
    const wordElement = container.querySelector('[data-word-location="1:1:1"]');
    expect(wordElement).toBeTruthy();
    expect(wordElement?.className).toContain('additionalStopSignGap');
  });

  it('handles keyboard navigation with Enter key', () => {
    const { container } = render(
      <QuranWord word={mockWord as any} font={QuranFont.MadaniV1} />,
    );
    const wordElement = container.querySelector('[role="button"]') || container.firstChild;
    expect(wordElement).toBeTruthy();
    if (wordElement) {
      fireEvent.keyDown(wordElement, { key: 'Enter' });
    }
  });

  it('handles keyboard navigation with Space key and prevents scroll', () => {
    const { container } = render(
      <QuranWord word={mockWord as any} font={QuranFont.MadaniV1} />,
    );
    const wordElement = container.querySelector('[role="button"]') || container.firstChild;
    if (wordElement) {
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
      wordElement.dispatchEvent(spaceEvent);
    }
  });

  it('renders correctly when isWordInteractionDisabled is true', () => {
    const { container } = render(
      <QuranWord 
        word={mockWord as any} 
        font={QuranFont.MadaniV1} 
        isWordInteractionDisabled={true} 
      />,
    );
    expect(container.querySelector('[role="button"]')).toBeNull();
  });

  it('applies highlighted class when isHighlighted is true', () => {
    const { container } = render(
      <QuranWord 
        word={mockWord as any} 
        font={QuranFont.MadaniV1} 
        isHighlighted={true} 
      />,
    );
    const wordElement = container.querySelector('[data-word-location="1:1:1"]');
    expect(wordElement).toBeTruthy();
    expect(wordElement?.className).toContain('highlighted');
  });

  it('respects isAudioHighlightingAllowed=false prop', () => {
    const { container } = render(
      <QuranWord 
        word={mockWord as any} 
        font={QuranFont.MadaniV1} 
        isAudioHighlightingAllowed={false}
        isHighlighted={false}
      />,
    );
    const wordElement = container.querySelector('[data-word-location="1:1:1"]');
    expect(wordElement).toBeTruthy();
    expect(wordElement?.className).not.toContain('highlighted');
  });
});
