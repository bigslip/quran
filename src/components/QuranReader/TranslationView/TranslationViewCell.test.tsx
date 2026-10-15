import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TranslationViewCell from './TranslationViewCell';

vi.mock('@xstate/react', () => ({ useSelector: vi.fn(() => false) }));
vi.mock('react-redux', () => ({ useSelector: vi.fn(() => false) }));

vi.mock('@/components/Onboarding/OnboardingProvider', () => ({ useOnboarding: () => ({ isActive: false }) }));
vi.mock('@/hooks/useNavbarAutoHide', () => ({ default: () => false }));
vi.mock('@/hooks/useObserveElement', () => ({ default: () => false }));
vi.mock('@/hooks/useScrollWithContextMenuOffset', () => ({ default: () => [vi.fn(), { current: null }] }));

vi.mock('./BottomActions', () => ({ default: () => <div data-testid="bottom-actions" /> }));
vi.mock('./TopActions', () => ({ default: () => <div data-testid="top-actions" /> }));
vi.mock('./TranslationText', () => ({ default: () => <div data-testid="translation-text" /> }));
vi.mock('@/components/Verse/VerseText', () => ({ default: () => <div data-testid="verse-text" /> }));
vi.mock('@/dls/Separator/Separator', () => ({ default: () => <div data-testid="separator" /> }));

describe('TranslationViewCell', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    const verse = { id: 1, verseKey: "1:1", verseNumber: 1, chapterId: 1, words: [], translations: [{ id: 1, text: "text", languageId: 1 }] };
    const styles = { quranTextFontScale: 3, quranFont: 'qpc_uthmani_hafs', mushafLines: '16_lines', translationFontScale: 3 };
    render(
      <TranslationViewCell 
        verse={verse as any} 
        quranReaderStyles={styles as any} 
        verseIndex={0} 
        data-testid="translation-view-cell" 
        aria-hidden="true" 
      />
    );
    const el = screen.getByTestId('translation-view-cell');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});

vi.mock('@/redux/slices/AudioPlayer/state', () => ({
  selectEnableAutoScrolling: vi.fn(),
}));
vi.mock('@/redux/slices/QuranReader/studyMode', () => ({
  selectStudyModeIsOpen: vi.fn(),
}));
