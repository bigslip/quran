import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import ForgotPasswordForm from './ForgotPasswordForm';
import { requestPasswordReset } from '@/utils/auth/authRequests';
import { logFormSubmission } from '@/utils/eventLogger';

// Mock dependencies
vi.mock("/public/icons/west.svg", () => ({ default: () => <svg data-testid="west-icon" /> }));

vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/auth/authRequests', () => ({
  requestPasswordReset: vi.fn(),
}));

vi.mock('@/utils/eventLogger', () => ({
  logFormSubmission: vi.fn(),
  logButtonClick: vi.fn(),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
  ToastStatus: { Success: 'success' },
}));

describe('ForgotPasswordForm', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText('forgot-password-title')).toBeTruthy();
  });

  it('spreads HTMLAttributes to the root element', () => {
    const { container } = render(
      <ForgotPasswordForm data-testid="forgot-password-root" className="custom-class" />
    );
    const rootElement = screen.getByTestId('forgot-password-root');
    expect(rootElement).toBeTruthy();
    expect(rootElement.className).toContain('custom-class');
  });

  it('submits correctly', async () => {
    (requestPasswordReset as any).mockResolvedValue({
      data: { success: true },
    });

    render(<ForgotPasswordForm />);
    
    fireEvent.change(screen.getByPlaceholderText('email-placeholder'), { target: { value: 'john@example.com' } });
    
    const confirmButton = screen.getByRole('button', { name: 'confirm' }) as HTMLButtonElement;
    await waitFor(() => expect(confirmButton.disabled).toBe(false));
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith('john@example.com');
      expect(logFormSubmission).toHaveBeenCalledWith('forgot_password');
    });
  });

  it('shows frontend validation error for invalid email', async () => {
    render(<ForgotPasswordForm />);
    
    fireEvent.change(screen.getByPlaceholderText('email-placeholder'), { target: { value: 'invalid-email' } });
    
    // The FormBuilder evaluates rules and displays the error.
    expect(await screen.findByText('errors.email')).toBeTruthy();
  });

  it('shows API error when submission fails', async () => {
    (requestPasswordReset as any).mockResolvedValue({
      data: { success: false },
      errors: { email: 'errors.email-not-found' }
    });

    render(<ForgotPasswordForm />);
    
    fireEvent.change(screen.getByPlaceholderText('email-placeholder'), { target: { value: 'john@example.com' } });
    
    const confirmButton = screen.getByRole('button', { name: 'confirm' }) as HTMLButtonElement;
    await waitFor(() => expect(confirmButton.disabled).toBe(false));
    fireEvent.click(confirmButton);
    
    // Check if the API error is displayed
    // getFormErrors parses this to `errors.email-not-found` because `t` just returns the key.
    const errorRegion = await screen.findByText('errors.email-not-found');
    expect(errorRegion).toBeTruthy();
  });
});
