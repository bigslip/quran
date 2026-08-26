import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import QuranReciterListHero from './QuranReciterListHero';

expect.extend(matchers);

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="search-icon" />,
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

describe('QuranReciterListHero', () => {
  it('renders and spreads HTML attributes', () => {
    render(
      <QuranReciterListHero
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        data-testid="reciter-hero"
        aria-label="Hero"
      />
    );

    const root = screen.getByTestId('reciter-hero');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-label', 'Hero');
  });
});
