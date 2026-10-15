import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import VerificationCodeForm from './VerificationCodeForm';
import { signUp } from '@/utils/auth/authRequests';

vi.mock("/public/icons/west.svg", () => ({ default: () => <svg data-testid="west-icon" /> }));

vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    query: {},
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string, options?: any) => key + (options ? JSON.stringify(options) : '') }),
}));

vi.mock('next-translate/Trans', () => ({
  default: ({ i18nKey }: any) => <span>{i18nKey}</span>,
}));

vi.mock('@/utils/auth/authRequests', () => ({
  signUp: vi.fn(),
}));

vi.mock('@/hooks/auth/useAuthRedirect', () => ({
  default: () => ({ redirectWithToken: vi.fn() }),
}));

vi.mock('@/utils/eventLogger', () => ({
  logFormSubmission: vi.fn(),
  logButtonClick: vi.fn(),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
}));

describe('VerificationCodeForm', () => {
  const defaultProps = {
    email: 'test@example.com',
    onBack: vi.fn(),
    onResendCode: vi.fn(),
    signUpData: {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
    } as any,
    onSuccess: vi.fn(),
  };

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<VerificationCodeForm {...defaultProps} />);
    expect(screen.getByTestId('verification-code')).toBeTruthy();
  });

  it('spreads HTMLAttributes to the root element', () => {
    render(
      <VerificationCodeForm {...defaultProps} data-testid="verification-code-root" className="custom-class" />
    );
    const rootElement = screen.getByTestId('verification-code-root');
    expect(rootElement).toBeTruthy();
    expect(rootElement.className).toContain('custom-class');
  });

  it('handles invalid code and displays error with aria-live', async () => {
    (signUp as any).mockResolvedValue({
      data: { success: false },
      errors: { verificationCode: 'Invalid code' }
    });

    const { container } = render(<VerificationCodeForm {...defaultProps} />);
    
    const input = container.querySelector('input');
    if (!input) throw new Error('input not found');
    
    fireEvent.change(input, { target: { value: '123456' } });
    
    const errorMsg = await screen.findByText('errors.verification-code-invalid');
    expect(errorMsg).toBeTruthy();
    
    const liveRegion = screen.getByText('errors.verification-code-invalid');
    expect(liveRegion.closest('[aria-live="polite"]') || liveRegion.getAttribute('aria-live')).toBeTruthy();
  });

  it('handles expired OTP code specifically', async () => {
    (signUp as any).mockResolvedValue({
      data: { success: false },
      errors: { verificationCode: 'Code expired' } // The base component catches error and maps to 'errors.verification-code-invalid' or similar, but the form handles the error thrown.
    });

    const { container } = render(<VerificationCodeForm {...defaultProps} />);
    
    const input = container.querySelector('input');
    if (!input) throw new Error('input not found');
    
    fireEvent.change(input, { target: { value: '654321' } });
    
    const errorMsg = await screen.findByText('errors.verification-code-invalid');
    expect(errorMsg).toBeTruthy();
  });

  it('handles rate limiting and resend timers correctly', async () => {
    vi.useFakeTimers();
    const mockOnResendCode = vi.fn().mockResolvedValue(undefined);
    const props = { ...defaultProps, onResendCode: mockOnResendCode };
    
    render(<VerificationCodeForm {...props} />);
    
    // Initially, button is disabled because of the 60 seconds cooldown
    const resendButton = screen.getByRole('button', { name: /verification-code-resend/ }) as HTMLButtonElement;
    expect(resendButton.disabled).toBe(true);
    expect(screen.getByText(/verification-code-resend-countdown/)).toBeTruthy();
    
    // Fast-forward 60 seconds
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    
    // Now button should be enabled
    expect(resendButton.disabled).toBe(false);
    expect(screen.getByText('verification-code-resend')).toBeTruthy();
    
    // Click resend
    await act(async () => {
      fireEvent.click(resendButton);
    });
    expect(mockOnResendCode).toHaveBeenCalledTimes(1);
    
    // Timer should reset and button disabled again
    expect(resendButton.disabled).toBe(true);
    expect(screen.getByText(/verification-code-resend-countdown/)).toBeTruthy();
    
    vi.useRealTimers();
  });
});
