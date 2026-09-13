import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ChapterActionBar from './ChapterActionBar';

expect.extend(matchers);

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: () => ({}),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/[chapterId]', asPath: '/18', locale: 'en' }),
}));

vi.mock('@/icons/share.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="share-icon" {...props} />,
}));

vi.mock('@/icons/search.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="search-icon" {...props} />,
}));

afterEach(() => {
  cleanup();
});

describe('ChapterActionBar', () => {
  it('renders toolbar container with correct accessibility attributes', () => {
    render(<ChapterActionBar chapterId="18" chapterName="Al-Kahf" />);
    const toolbar = screen.getByTestId('chapter-action-bar');
    expect(toolbar).toBeInTheDocument();
    expect(toolbar).toHaveAttribute('role', 'toolbar');
    expect(toolbar).toHaveAttribute('aria-label', 'Surah Actions');
  });

  it('renders all three quick actions: info, share, and jump buttons', () => {
    render(<ChapterActionBar chapterId="18" chapterName="Al-Kahf" />);
    expect(screen.getByTestId('surah-info-button')).toBeInTheDocument();
    expect(screen.getByTestId('surah-share-button')).toBeInTheDocument();
    expect(screen.getByTestId('surah-jump-button')).toBeInTheDocument();
  });
});
