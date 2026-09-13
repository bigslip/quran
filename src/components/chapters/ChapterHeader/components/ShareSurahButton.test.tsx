import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ShareSurahButton from './ShareSurahButton';
import copyTextToClipboard from '@/utils/clipboard';

expect.extend(matchers);

const mockToast = vi.fn();
vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => mockToast,
  ToastStatus: {
    Success: 'success',
    Error: 'error',
    Warning: 'warning',
  },
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

vi.mock('@/utils/clipboard', () => ({
  default: vi.fn(),
  copyTextToClipboard: vi.fn(),
}));

vi.mock('@/icons/share.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="share-icon" {...props} />,
}));

afterEach(() => {
  cleanup();
});

describe('ShareSurahButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders share button and icon', () => {
    render(<ShareSurahButton chapterId={18} chapterName="Al-Kahf" />);
    const button = screen.getByTestId('surah-share-button');
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('share-icon')).toBeInTheDocument();
    expect(screen.getByText('share')).toBeInTheDocument();
  });

  it('uses navigator.share when available', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      configurable: true,
      writable: true,
    });

    render(<ShareSurahButton chapterId={18} chapterName="Al-Kahf" />);
    const button = screen.getByTestId('surah-share-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Surah Al-Kahf - Quran.ir',
          url: expect.stringContaining('/18'),
        }),
      );
    });
  });

  it('falls back to copyTextToClipboard when navigator.share is not available', async () => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    vi.mocked(copyTextToClipboard).mockResolvedValue(undefined);

    render(<ShareSurahButton chapterId="18" chapterName="Al-Kahf" />);
    const button = screen.getByTestId('surah-share-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(copyTextToClipboard).toHaveBeenCalledWith(expect.stringContaining('/18'));
      expect(mockToast).toHaveBeenCalledWith('copied-to-clipboard', {
        status: 'success',
      });
    });
  });

  it('shows error toast when copyTextToClipboard fails', async () => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    vi.mocked(copyTextToClipboard).mockRejectedValue(new Error('Failed'));

    render(<ShareSurahButton chapterId="18" chapterName="Al-Kahf" />);
    const button = screen.getByTestId('surah-share-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('error.general', {
        status: 'error',
      });
    });
  });
});
