import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReadingGoalOnboarding from './index';

vi.mock('@/pages/index.module.scss', () => ({
  default: { flowItem: 'flowItem' },
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('swr', () => ({
  useSWRConfig: () => ({ cache: { delete: vi.fn() } }),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
  ToastStatus: { Success: 'success', Error: 'error', Warning: 'warning' },
}));

vi.mock('@/utils/eventLogger', () => ({
  logFormSubmission: vi.fn(),
  logTabClick: vi.fn(),
  logTabInputChange: vi.fn(),
  logTabNextClick: vi.fn(),
  logButtonClick: vi.fn(),
  logValueChange: vi.fn(),
}));

vi.mock('@/utils/auth/login', () => ({
  isLoggedIn: () => true,
}));

vi.mock('@/utils/auth/api', () => ({
  addReadingGoal: vi.fn().mockResolvedValue({}),
  privateFetcher: vi.fn().mockResolvedValue({ data: { week: [] }, week: [] }),
}));

vi.mock('@/hooks/useGetMushaf', () => ({
  default: () => 2,
}));

vi.mock('src/redux/defaultSettings/util', () => ({
  getLocaleInitialStateByKey: vi.fn(),
  getQuranReaderStylesInitialState: vi.fn().mockReturnValue({}),
  getReadingPreferencesInitialState: vi.fn().mockReturnValue({}),
  getTranslationsInitialState: vi.fn().mockReturnValue({}),
  getThemeInitialState: vi.fn().mockReturnValue({}),
  getTafsirInitialState: vi.fn().mockReturnValue({}),
  default: {},
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn().mockReturnValue('mocked'),
  shallowEqual: vi.fn(),
}));

vi.mock('@/icons/chevron-left.svg', () => ({ default: () => <svg data-testid="chevron-left" /> }));
vi.mock('@/icons/chevron-right.svg', () => ({ default: () => <svg data-testid="chevron-right" /> }));
vi.mock('@/icons/clock.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/calendar.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/book.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/settings-stroke.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/repeat.svg', () => ({ default: () => <svg /> }));
vi.mock('@/public/images/moon-illustration.svg', () => ({ default: () => <svg /> }));

describe('ReadingGoalOnboarding Wizard', () => {
  it('renders and navigates through all tabs (custom goal) and submits', async () => {
    render(<ReadingGoalOnboarding initialExampleKey={null} />);
    
    // Select custom option
    fireEvent.click(screen.getByText('examples.custom.title'));
    
    // Go to next tab (ContinuityTab)
    fireEvent.click(screen.getByText('common:next'));
    
    // Should be on ContinuityTab
    await waitFor(() => expect(screen.getByText('frequency-tab.title')).toBeTruthy());
    
    // Go to next tab (TypeTab)
    fireEvent.click(screen.getByText('common:next'));
    
    // Should be on TypeTab
    await waitFor(() => expect(screen.getByText('goal-type.title')).toBeTruthy());
    
    // Go to next tab (AmountTab)
    fireEvent.click(screen.getByText('common:next'));
    
    // Should be on AmountTab
    await waitFor(() => expect(screen.getByText('goal-target.title')).toBeTruthy());
    
    // Go to next tab (PreviewTab)
    fireEvent.click(screen.getByText('common:next'));
    
    // Should be on PreviewTab
    await waitFor(() => expect(screen.getByText('start-journey')).toBeTruthy());
    
    // Submit the form
    fireEvent.click(screen.getByText('start-journey'));
    
    const { addReadingGoal } = await import('@/utils/auth/api');
    await waitFor(() => {
      expect(addReadingGoal).toHaveBeenCalled();
    });
  });

  it('spreads HTML attributes correctly on the container', () => {
    const { container } = render(
      <ReadingGoalOnboarding initialExampleKey={null} data-testid="wizard-container" />
    );
    expect(container.querySelector('[data-testid="wizard-container"]')).toBeTruthy();
  });
});
