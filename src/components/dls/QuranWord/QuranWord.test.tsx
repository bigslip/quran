import { render, screen, cleanup } from '@testing-library/react';
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
  useDispatch: vi.fn(),
  shallowEqual: vi.fn(),
}));

vi.mock('next-translate/useTranslation', () => ({ default: () => ({ t: (k: string) => k }) }));
vi.mock('src/xstate/AudioPlayerMachineContext', () => ({ AudioPlayerMachineContext: { useActorRef: vi.fn() } }));

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
vi.mock('./GlyphWord', () => ({ default: () => <div data-testid="glyph-word">A</div> }));
vi.mock('./TextWord', () => ({ default: () => <div data-testid="text-word">بسم</div> }));
vi.mock('./ReadingModeWordHoverActions', () => ({ default: () => <div data-testid="hover-actions" /> }));
vi.mock('../InlineWordByWord', () => ({ default: () => <div data-testid="inline-word-by-word" /> }));
vi.mock('@/dls/Popover/HoverablePopover', () => ({ default: ({ children }: any) => <div data-testid="popover">{children}</div> }));

const mockWord = {
  id: "1",
  position: 1,
  audioUrl: "url",
  charTypeName: "word",
  charType: CharType.Word,
  textUthmani: "بسم",
  qpcUthmaniHafs: "A",
  pageNumber: 1,
  lineNumber: 1,
  text: "بسم",
  translation: { text: "In the name", languageName: "english" },
  transliteration: { text: "Bism", languageName: "english" },
  verseKey: "1:1",
  location: "1:1:1",
};

describe('QuranWord', () => {
  afterEach(cleanup);
  
  it('renders a GlyphWord when font is QPCUthmani', () => {
    render(<QuranWord word={mockWord as any} font={QuranFont.MadaniV1} />);
    expect(screen.getByTestId('glyph-word')).toBeTruthy();
  });

  it('renders a TextWord when font is Tajweed', () => {
    render(<QuranWord word={mockWord as any} font={QuranFont.Tajweed} />);
    expect(screen.getByTestId('text-word')).toBeTruthy();
  });
});
