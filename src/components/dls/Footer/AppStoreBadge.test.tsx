import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import AppStoreBadge from './AppStoreBadge';
import { logButtonClick } from '@/utils/eventLogger';

expect.extend(matchers);

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, _opts?: any) => {
      const map: Record<string, string> = {
        'footer.download-on': 'Download on the',
        'footer.get-it-on': 'Get it on',
        'footer.app-store': 'App Store',
        'footer.google-play': 'Google Play',
      };
      return map[key] || key;
    },
    lang: 'en',
  }),
}));

vi.mock('@/icons/apple.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="apple-icon" {...props} />,
}));

vi.mock('@/icons/google.svg', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="google-icon" {...props} />,
}));

afterEach(() => {
  cleanup();
});

describe('AppStoreBadge in Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders iOS badge with Apple icon and correct text', () => {
    render(
      <AppStoreBadge
        platform="ios"
        href="https://apps.apple.com/us/app/quran-by-quran-com-قرآن/id1118663303"
      />,
    );

    expect(screen.getByTestId('apple-icon')).toBeInTheDocument();
    expect(screen.getByText('Download on the')).toBeInTheDocument();
    expect(screen.getByText('App Store')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      'https://apps.apple.com/us/app/quran-by-quran-com-قرآن/id1118663303',
    );
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders Android badge with Google icon and correct text', () => {
    render(
      <AppStoreBadge
        platform="android"
        href="https://play.google.com/store/apps/details?id=com.quran.labs.androidquran"
      />,
    );

    expect(screen.getByTestId('google-icon')).toBeInTheDocument();
    expect(screen.getByText('Get it on')).toBeInTheDocument();
    expect(screen.getByText('Google Play')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran',
    );
  });

  it('logs analytics event on click', () => {
    render(<AppStoreBadge platform="ios" href="https://apps.apple.com" />);
    const link = screen.getByRole('link');
    fireEvent.click(link);
    expect(logButtonClick).toHaveBeenCalledWith('footer_app_store');
  });
});
