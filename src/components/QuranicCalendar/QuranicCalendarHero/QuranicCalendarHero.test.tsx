import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import umalqura from '@umalqura/core';
import QuranicCalendarHero from './index';

// Mock dependencies
vi.mock('next/router', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

vi.mock('@/hooks/auth/useIsLoggedIn', () => ({
  default: () => ({ isLoggedIn: false }),
}));

vi.mock('@/hooks/auth/useGetUserQuranProgramEnrollment', () => ({
  default: () => ({
    isSubscribed: false,
    isLoading: false,
    mutate: vi.fn(),
  }),
}));

vi.mock('@/icons/background.svg', () => ({
  default: () => <svg data-testid="background-svg" />,
}));
vi.mock('@/icons/close.svg', () => ({ default: () => <svg /> }));
vi.mock('/public/icons/email.svg', () => ({ default: () => <svg /> }));
vi.mock('/public/icons/telegram.svg', () => ({ default: () => <svg /> }));
vi.mock('/public/icons/whatsapp.svg', () => ({ default: () => <svg /> }));
vi.mock('/public/icons/facebook.svg', () => ({ default: () => <svg /> }));
vi.mock('/public/icons/twitter.svg', () => ({ default: () => <svg /> }));
vi.mock('/public/icons/copy.svg', () => ({ default: () => <svg /> }));

describe('QuranicCalendarHero', () => {
  afterEach(() => {
    cleanup();
  });

  it('spreads HTMLAttributes to the container', () => {
    const mockHijriDate = umalqura(new Date());
    render(
      <QuranicCalendarHero
        currentQuranicCalendarWeek={5}
        currentHijriDate={mockHijriDate}
        data-testid="hero-container"
        aria-label="Calendar Hero"
        className="test-class"
      />
    );
    
    const container = screen.getByTestId('hero-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-label', 'Calendar Hero');
    expect(container).toHaveClass('test-class');
  });

  it('renders week and hijri date information', () => {
    const mockHijriDate = umalqura(new Date());
    render(
      <QuranicCalendarHero
        currentQuranicCalendarWeek={5}
        currentHijriDate={mockHijriDate}
      />
    );
    
    expect(screen.getByText('quranic-calendar')).toBeInTheDocument();
    expect(screen.getByText('week')).toBeInTheDocument();
  });
});
