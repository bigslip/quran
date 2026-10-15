import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TranslationText from './index';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('@/utils/eventLogger', () => ({ logButtonClick: vi.fn() }));
vi.mock('src/api', () => ({ getFootnote: vi.fn() }));

vi.mock('./FootnoteAndSubFootnote', () => ({ default: () => <div data-testid="footnote" /> }));
vi.mock('./TranslationAndReference', () => ({ default: () => <div data-testid="translation-and-reference" /> }));

describe('TranslationText', () => {
  afterEach(cleanup);
  it('renders correctly and spreads props', () => {
    render(
      <TranslationText 
        translationFontScale={3} 
        text="text" 
        languageId={38} 
        data-testid="translation-text" 
        aria-hidden="true" 
      />
    );
    const el = screen.getByTestId('translation-text');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});
