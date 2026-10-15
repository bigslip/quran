import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import ResetPasswordForm from './ResetPasswordForm';
import { resetPassword } from '@/utils/auth/authRequests';

vi.mock("/public/icons/show.svg", () => ({
  default: () => <svg data-testid="show-icon" />
}));
vi.mock("/public/icons/hide.svg", () => ({
  default: () => <svg data-testid="hide-icon" />
}));
vi.mock("/public/icons/checkmark-icon.svg", () => ({
  default: () => <svg data-testid="checkmark-icon" />
}));
vi.mock("/public/icons/close-icon.svg", () => ({
  default: () => <svg data-testid="close-icon" />
}));
vi.mock("/public/icons/west.svg", () => ({ default: () => <svg data-testid="west-icon" /> }));

vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    query: { token: 'mock-token' },
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/auth/authRequests', () => ({
  resetPassword: vi.fn(),
}));

vi.mock('@/utils/eventLogger', () => ({
  logFormSubmission: vi.fn(),
  logButtonClick: vi.fn(),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
  ToastStatus: { Success: 'success' },
}));

describe('ResetPasswordForm', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ResetPasswordForm />);
    expect(screen.getByText('set-new-password')).toBeTruthy();
  });

  it('spreads HTMLAttributes to the root element', () => {
    render(
      <ResetPasswordForm data-testid="reset-password-root" className="custom-class" />
    );
    const rootElement = screen.getByTestId('reset-password-root');
    expect(rootElement).toBeTruthy();
    expect(rootElement.className).toContain('custom-class');
  });

  it('shows error when passwords do not match', async () => {
    render(<ResetPasswordForm />);
    
    fireEvent.change(screen.getByPlaceholderText('new-password-placeholder'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('confirm-new-password-placeholder'), { target: { value: 'Password321!' } });
    
    const confirmButton = screen.getByRole('button', { name: 'confirm' }) as HTMLButtonElement;
    await waitFor(() => expect(confirmButton.disabled).toBe(false));
    fireEvent.click(confirmButton);
    
    expect(await screen.findByText('errors.confirm')).toBeTruthy();
  });

  it('shows API error and has aria-live on error region', async () => {
    (resetPassword as any).mockResolvedValue({
      data: { success: false },
      errors: { token: 'invalid' }
    });

    render(<ResetPasswordForm />);
    
    fireEvent.change(screen.getByPlaceholderText('new-password-placeholder'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('confirm-new-password-placeholder'), { target: { value: 'Password123!' } });
    
    const confirmButton = screen.getByRole('button', { name: 'confirm' }) as HTMLButtonElement;
    await waitFor(() => expect(confirmButton.disabled).toBe(false));
    fireEvent.click(confirmButton);
    
    const errorRegion = await screen.findByText('errors.expiredRequest');
    expect(errorRegion).toBeTruthy();
    
    // Check if error region or a parent has aria-live="polite"
    const liveRegion = screen.getByText('errors.expiredRequest');
    // We expect the implementer to add aria-live="polite" to the error container
    expect(liveRegion.closest('[aria-live="polite"]') || liveRegion.getAttribute('aria-live')).toBeTruthy();
  });
});
