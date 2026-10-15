import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import JumpToAyahButton from './JumpToAyahButton';
import { setIsSearchDrawerOpen } from '@/redux/slices/navbar';

expect.extend(matchers);

const mockDispatch = vi.fn();
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

vi.mock('@/icons/search.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="search-icon" {...props} />,
}));

afterEach(() => {
  cleanup();
});

describe('JumpToAyahButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders jump to ayah button and icon', () => {
    render(<JumpToAyahButton chapterId={18} />);
    const button = screen.getByTestId('surah-jump-button');
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByText('quick-jump')).toBeInTheDocument();
  });

  it('dispatches setIsSearchDrawerOpen(true) on click', () => {
    render(<JumpToAyahButton chapterId="18" />);
    const button = screen.getByTestId('surah-jump-button');
    fireEvent.click(button);
    expect(mockDispatch).toHaveBeenCalledWith(setIsSearchDrawerOpen(true));
  });
});
