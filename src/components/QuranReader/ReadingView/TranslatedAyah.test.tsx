import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TranslatedAyah from './TranslatedAyah';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(() => false),
}));

vi.mock('@/lib/sentry', () => ({ logErrorToSentry: vi.fn() }));
vi.mock('@/redux/slices/QuranReader/studyMode', () => ({ openStudyMode: vi.fn(), selectStudyModeIsOpen: vi.fn(() => false), selectStudyModeVerseKey: vi.fn() }));
vi.mock('@/utils/eventLogger', () => ({ logButtonClick: vi.fn() }));
vi.mock('src/api', () => ({ getFootnote: vi.fn() }));

vi.mock('./InlineFootnote', () => ({ default: () => <div data-testid="inline-footnote" /> }));

describe('TranslatedAyah', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    const verse = { id: 1, verseKey: "1:1", verseNumber: 1, chapterId: 1, words: [], translations: [] };
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
});
