import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProgressPageGoalWidget from '@/components/ReadingProgressPage/ProgressPageGoalWidget';
import { GoalType } from '@/types/auth/Goal';

// Mock dependencies
vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('@/hooks/useIsMobile', () => ({
  default: () => false,
}));

vi.mock('@/hooks/useGetMushaf', () => ({
  default: () => 2,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ locale: 'en', push: vi.fn() }),
}));

vi.mock('@/icons/circles.svg', () => ({ default: () => <svg data-testid="circles-icon" /> }));
vi.mock('@/icons/arrow.svg', () => ({ default: () => <svg data-testid="arrow-icon" /> }));
vi.mock('@/icons/close.svg', () => ({ default: () => <svg data-testid="close-icon" /> }));
vi.mock('@/icons/caret-down.svg', () => ({ default: () => <svg /> }));

vi.mock('@/components/ReadingProgressPage/ReadingProgressPage.module.scss', () => ({
  default: { emptyWidget: 'emptyWidget' },
}));

vi.mock('@/hooks/useGetContinueReadingUrl', () => ({
  default: () => '/read',
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
  logValueChange: vi.fn(),
  logFormSubmission: vi.fn(),
}));

vi.mock('@/utils/locale', () => ({
  toLocalizedNumber: (num: number) => num.toString(),
  getDir: () => 'ltr',
}));

vi.mock('@/utils/datetime', () => ({
  secondsToReadableFormat: () => '1 hour',
}));

vi.mock('@/utils/auth/api', () => ({
  updateReadingGoal: vi.fn().mockResolvedValue({}),
}));

vi.mock('swr', () => ({
  useSWRConfig: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
  ToastStatus: { Success: 'success', Error: 'error', Warning: 'warning' },
}));

describe('ProgressPageGoalWidget', () => {
  const defaultProps = {
    isLoading: false,
    currentActivityDay: {
      date: '2023-10-01',
      pagesRead: 0,
      secondsRead: 0,
      ranges: [],
      remainingDailyTargetRanges: [],
      progress: 0,
    },
  };

  it('renders loading state correctly', () => {
    const { container } = render(<ProgressPageGoalWidget {...defaultProps} isLoading={true} />);
    expect(container.querySelector('.emptyWidget')).toBeTruthy();
  });

  it('renders empty state when no goal', () => {
    render(<ProgressPageGoalWidget {...defaultProps} />);
    expect(screen.getByText('achieve-quran-goals')).toBeTruthy();
  });

  it('renders goal progress and allows interaction (incrementing progress/completing)', async () => {
    const goal = {
      id: '1',
      type: GoalType.PAGES,
      targetAmount: '10',
      duration: 30,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      isCompleted: false,
      progress: {
        percent: 50,
        amountLeft: 5,
        daysLeft: 15,
        nextVerseToRead: '1:1',
      },
    };

    render(<ProgressPageGoalWidget {...defaultProps} goal={goal} />);
    
    // Test that the progress is shown
    expect(screen.getByText('50%')).toBeTruthy();
    
    // Verify interactions like updating goal
    const updateButtons = screen.getAllByText('edit-goal.action');
    fireEvent.click(updateButtons[0]);

    // Wait for modal to open and show edit title
    await waitFor(() => {
      expect(screen.getByText('edit-goal.title')).toBeTruthy();
    });

    // Find the pages input (since type is PAGES)
    // The input has an id of 'pages' and is associated with label 'goal-types.pages.title'
    const pagesInput = screen.getByLabelText('goal-types.pages.title');
    fireEvent.change(pagesInput, { target: { value: '20' } });

    // Submit the form using the button inside the modal
    const modalSubmitButton = screen.getAllByText('edit-goal.action')[1];
    fireEvent.click(modalSubmitButton);

    const { updateReadingGoal } = await import('@/utils/auth/api');
    await waitFor(() => {
      expect(updateReadingGoal).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GoalType.PAGES,
          amount: 20,
        })
      );
    });
  });
  
  it('spreads HTML attributes correctly', () => {
    const { container } = render(
      <ProgressPageGoalWidget {...defaultProps} data-testid="goal-widget" />
    );
    expect(container.querySelector('[data-testid="goal-widget"]')).toBeTruthy();
  });
});
