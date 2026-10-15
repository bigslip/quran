import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TranslatedAyah from './TranslatedAyah';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';

const mockDispatch = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: vi.fn(() => false),
}));

vi.mock('@/lib/sentry', () => ({ logErrorToSentry: vi.fn() }));
vi.mock('@/redux/slices/QuranReader/studyMode', () => ({ 
  openStudyMode: vi.fn((payload) => ({ type: 'studyMode/openStudyMode', payload })), 
  selectStudyModeIsOpen: vi.fn(() => false), 
  selectStudyModeVerseKey: vi.fn() 
}));
vi.mock('@/utils/eventLogger', () => ({ logButtonClick: vi.fn() }));
vi.mock('src/api', () => ({ getFootnote: vi.fn() }));

vi.mock('./InlineFootnote', () => ({ default: () => <div data-testid="inline-footnote" /> }));

describe('TranslatedAyah', () => {
  afterEach(() => {
    cleanup();
    mockDispatch.mockClear();
  });

  it('renders correctly and spreads props', () => {
    const verse = { id: 1, verseKey: '1:1', verseNumber: 1, chapterId: 1, words: [], translations: [] };
    render(
      <TranslatedAyah 
        verse={verse as any} 
        translationHtml="In the name of Allah" 
        languageId={38} 
        lang="en" 
        data-testid="translated-ayah" 
        aria-hidden="true" 
      />
    );
    const el = screen.getByTestId('translated-ayah');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.innerHTML).toContain('In the name of Allah');
  });

  it('dispatches openStudyMode on click', () => {
    const verse = { id: 1, verseKey: '1:1', verseNumber: 1, chapterId: 1, words: [], translations: [] };
    render(
      <TranslatedAyah 
        verse={verse as any} 
        translationHtml="In the name of Allah" 
        languageId={38} 
        lang="en" 
        data-testid="translated-ayah" 
      />
    );
    const el = screen.getByTestId('translated-ayah');
    fireEvent.click(el);
    expect(mockDispatch).toHaveBeenCalledWith(openStudyMode({ verseKey: '1:1' }));
  });

  it('dispatches openStudyMode on Enter key press', () => {
    const verse = { id: 1, verseKey: '1:1', verseNumber: 1, chapterId: 1, words: [], translations: [] };
    render(
      <TranslatedAyah 
        verse={verse as any} 
        translationHtml="In the name of Allah" 
        languageId={38} 
        lang="en" 
        data-testid="translated-ayah" 
      />
    );
    const el = screen.getByTestId('translated-ayah');
    fireEvent.keyDown(el, { key: 'Enter' });
    expect(mockDispatch).toHaveBeenCalledWith(openStudyMode({ verseKey: '1:1' }));
  });
});
