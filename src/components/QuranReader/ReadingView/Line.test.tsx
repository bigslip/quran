import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Line from './Line';

// Mock dependencies
vi.mock('@xstate/react', () => ({
  useSelector: vi.fn(() => false),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn((fn) => {
    try {
      return fn({
        audioPlayerState: { enableAutoScrolling: false },
        readingPreferences: { inlineWordByWordPreference: [] },
        studyMode: { isOpen: false },
      });
    } catch { return false; }
  }),
  shallowEqual: vi.fn(),
}));

vi.mock('src/xstate/actors/audioPlayer/selectors', () => ({
  selectIsAudioPlayerVisible: vi.fn(() => false),
}));

vi.mock('@/hooks/useNavbarAutoHide', () => ({ default: () => false }));
vi.mock('@/hooks/useObserveElement', () => ({ default: () => vi.fn() }));
vi.mock('@/hooks/useScrollToElement', () => ({ default: () => [vi.fn(), { current: null }], SMOOTH_SCROLL_TO_CENTER: 'SMOOTH_SCROLL_TO_CENTER' }));
vi.mock('@/components/Onboarding/OnboardingProvider', () => ({ useOnboarding: () => ({ isActive: false }) }));
vi.mock('@/components/chapters/ChapterHeader', () => ({ default: () => <div data-testid="chapter-header" /> }));
vi.mock('@/components/Verse/VerseText', () => ({ default: () => <div data-testid="verse-text" /> }));

describe('Line', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    const words = [
      { id: "1", text: "بسم", charTypeName: "word", verseKey: "1:1", location: "1:1:1", pageNumber: 1, lineNumber: 1 }
    ];
    render(
      <Line 
        lineKey="line-1" 
        words={words as any} 
        isBigTextLayout={false} 
        quranReaderStyles={{} as any} 
        pageIndex={0} 
        lineIndex={0} 
        bookmarksRangeUrl={null} 
        data-testid="line-container" 
        aria-hidden="true" 
      />
    );
    const el = screen.getByTestId('line-container');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByTestId('verse-text')).toBeTruthy();
  });
});

vi.mock('@/redux/slices/AudioPlayer/state', () => ({
  selectEnableAutoScrolling: vi.fn(),
}));
vi.mock('@/redux/slices/QuranReader/readingPreferences', () => ({
  selectInlineDisplayWordByWordPreferences: vi.fn(() => ({ showWordByWordTranslation: false, showWordByWordTransliteration: false })),
}));
vi.mock('@/redux/slices/QuranReader/studyMode', () => ({
  selectStudyModeIsOpen: vi.fn(),
}));
