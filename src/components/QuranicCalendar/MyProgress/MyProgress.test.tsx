import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MyProgress from './index';

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

vi.mock('@/hooks/auth/useGetUserQuranProgramEnrollment', () => ({
  default: () => ({
    subscriptionData: null,
    isLoading: false,
  }),
}));

vi.mock('@/utils/auth/login', () => ({
  isLoggedIn: () => false,
}));

vi.mock('./useMonthsData', () => ({
  default: () => ({
    monthRows: [[ { id: 1, name: 'Month 1', weeks: [
      { globalWeekNumber: 1, isCompleted: false, data: { ranges: 'test' } },
      { globalWeekNumber: 2, isCompleted: false, data: { ranges: 'test' } }
    ] } ]],
    monthSlides: [],
  }),
}));

vi.mock('@/utils/responsive', () => ({
  isMobile: () => false,
}));

// Mock window.scrollTo since we use it in MonthCard
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });

describe('MyProgress', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('spreads HTMLAttributes to the container', () => {
    render(
      <MyProgress
        onWeekSelect={vi.fn()}
        data-testid="my-progress-container"
        aria-label="Progress tracking"
        className="test-class"
      />
    );
    
    const container = screen.getByTestId('my-progress-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-label', 'Progress tracking');
  });

  it('handles selecting weeks and scrolls to top', async () => {
    const onWeekSelectMock = vi.fn();
    render(
      <MyProgress
        onWeekSelect={onWeekSelectMock}
      />
    );
    
    // Month 1 week 1 is rendered (because we mocked it to have weeks 1 and 2)
    const week1Button = screen.getByText('1');
    expect(week1Button).toBeInTheDocument();
    
    await userEvent.click(week1Button);
    
    expect(onWeekSelectMock).toHaveBeenCalledWith(1);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it('handles keyboard navigation (Enter key) on weeks', async () => {
    const onWeekSelectMock = vi.fn();
    render(
      <MyProgress
        onWeekSelect={onWeekSelectMock}
      />
    );
    
    const week2Button = screen.getByText('2');
    week2Button.focus();
    
    await userEvent.keyboard('{Enter}');
    
    expect(onWeekSelectMock).toHaveBeenCalledWith(2);
  });
});
