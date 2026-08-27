import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UnauthEnrollButton from './UnauthEnrollButton';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useRamadanChallengeStatus from '@/hooks/useGetRamadanChallengeStatus';

vi.mock('@/hooks/auth/useIsLoggedIn', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/useGetRamadanChallengeStatus', () => ({
  default: vi.fn(),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/test', locale: 'en' }),
}));

vi.mock('./EnrollButtonNotification', () => ({
  default: () => <div data-testid="mock-enroll-button-notification" />,
}));

vi.mock('../Notifications/hooks/useHeadlessService', () => ({
  HeadlessServiceProvider: ({ children }: any) => <div>{children}</div>,
}));

afterEach(() => {
  cleanup();
});

describe('UnauthEnrollButton', () => {
  it('renders spinner when loading', () => {
    (useIsLoggedIn as any).mockReturnValue({ isLoggedIn: false });
    (useRamadanChallengeStatus as any).mockReturnValue({ isLoading: true });

    const { container } = render(<UnauthEnrollButton section="test" />);
    expect(screen.getByRole('status')).not.toBeNull();
  });

  it('renders EnrollButtonNotification when logged in', () => {
    (useIsLoggedIn as any).mockReturnValue({ isLoggedIn: true });
    (useRamadanChallengeStatus as any).mockReturnValue({ isLoading: false, isEnrolled: false, mutate: vi.fn() });

    render(<UnauthEnrollButton section="test" />);
    expect(screen.getByTestId('mock-enroll-button-notification')).toBeInTheDocument();
  });

  it('renders Button with login url when not logged in', () => {
    (useIsLoggedIn as any).mockReturnValue({ isLoggedIn: false });
    (useRamadanChallengeStatus as any).mockReturnValue({ isLoading: false, isEnrolled: false, mutate: vi.fn() });

    render(<UnauthEnrollButton section="test" />);
    const link = screen.getByRole('link', { name: /Join the Surah Al-Mulk Challenge/i });
    expect(link.getAttribute('href')).toContain('login');
  });

  it('forwards HTMLAttributes correctly', () => {
    (useIsLoggedIn as any).mockReturnValue({ isLoggedIn: false });
    (useRamadanChallengeStatus as any).mockReturnValue({ isLoading: false, isEnrolled: false, mutate: vi.fn() });

    render(<UnauthEnrollButton section="test" data-testid="unauth-btn" aria-hidden="true" />);
    const btn = screen.getByTestId('unauth-btn');
    expect(btn.getAttribute('aria-hidden')).toBe('true');
  });
});
