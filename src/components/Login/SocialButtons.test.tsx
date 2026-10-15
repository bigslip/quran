import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import SocialButtons from './SocialButtons';

import { logButtonClick } from '@/utils/eventLogger';
import AuthType from 'types/auth/AuthType';

vi.mock('@/icons/google.svg', () => ({ default: () => <svg data-testid="google-icon" /> }));
vi.mock('@/icons/facebook.svg', () => ({ default: () => <svg data-testid="facebook-icon" /> }));
vi.mock('@/icons/apple.svg', () => ({ default: () => <svg data-testid="apple-icon" /> }));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key })
}));

describe('SocialButtons', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders Google, Facebook, and Apple login buttons', () => {
    render(<SocialButtons />);
    expect(screen.getByTestId('google-login-button')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-login-button')).toBeInTheDocument();
    expect(screen.getByTestId('apple-login-button')).toBeInTheDocument();
  });

  it('calls logButtonClick with correct AuthType when buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<SocialButtons />);

    await user.click(screen.getByTestId('google-login-button'));
    expect(logButtonClick).toHaveBeenCalledWith(AuthType.Google);

    await user.click(screen.getByTestId('facebook-login-button'));
    expect(logButtonClick).toHaveBeenCalledWith(AuthType.Facebook);

    await user.click(screen.getByTestId('apple-login-button'));
    expect(logButtonClick).toHaveBeenCalledWith(AuthType.Apple);
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<SocialButtons />);

    await user.tab();
    expect(screen.getByTestId('google-login-button').closest('a')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('facebook-login-button').closest('a')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('apple-login-button').closest('a')).toHaveFocus();
  });

  it('forwards HTMLAttributes to the container', () => {
    const { container } = render(<SocialButtons aria-label="Social Login Options" data-custom="test" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveAttribute('aria-label', 'Social Login Options');
    expect(div).toHaveAttribute('data-custom', 'test');
  });
});
