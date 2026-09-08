import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RamadanChallengePage from '@/pages/ramadanchallenge';
import { logButtonClick } from '@/utils/eventLogger';

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    push: vi.fn(),
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

// We only need to mock SWR if the test renders something that fetches, but UnauthEnrollButton and EnrollmentCount do.
vi.mock('swr', () => ({
  default: vi.fn(() => ({ data: { data: { count: 1234 } } })),
}));

// Mock icons
vi.mock('@/icons/telegram.svg', () => ({ default: () => <svg data-testid="telegram-icon" /> }));
vi.mock('@/icons/whatsapp.svg', () => ({ default: () => <svg data-testid="whatsapp-icon" /> }));

// Mock Next.js Head stuff
vi.mock('next/head', () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => {
      return <>{children}</>;
    },
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('RamadanChallengePage', () => {
  it('renders the page and asserts expected UI elements', () => {
    render(<RamadanChallengePage />);
    
    // Check main title
    expect(screen.getByText('Take the Meaningful Memorization Challenge This Ramadan')).toBeInTheDocument();

    // Check EnrollmentCount renders using mocked SWR data
    expect(screen.getByText(/people around the world have joined the challenge!/)).toBeInTheDocument();

    // Check Enroll Buttons exist (there are 2 UnauthEnrollButton components which render as links when not logged in)
    const enrollButtons = screen.getAllByRole('link', { name: /Join the Surah Al-Mulk Challenge/i });
    expect(enrollButtons.length).toBe(2);
  });

  it('triggers logButtonClick when social join buttons are clicked', () => {
    render(<RamadanChallengePage />);
    
    // Find Whatsapp button
    const whatsappBtn = screen.getByRole('link', { name: /Join our Whatsapp/i });
    fireEvent.click(whatsappBtn);
    expect(logButtonClick).toHaveBeenCalledWith('ramadan_challenge_join_whatsapp');

    // Find Telegram button
    const telegramBtn = screen.getByRole('link', { name: /Join our Telegram/i });
    fireEvent.click(telegramBtn);
    expect(logButtonClick).toHaveBeenCalledWith('ramadan_challenge_join_telegram');
  });
});
