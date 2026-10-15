import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import SignInForm from './SignInForm';
import { signIn } from '@/utils/auth/authRequests';
import useAuthRedirect from '@/hooks/auth/useAuthRedirect';
import { logFormSubmission } from '@/utils/eventLogger';

// Mock dependencies
vi.mock("/public/icons/show.svg", () => ({
  default: () => <svg data-testid="show-icon" />
}));
vi.mock("/public/icons/hide.svg", () => ({
  default: () => <svg data-testid="hide-icon" />
}));

vi.mock("next/router", () => ({
  useRouter: () => ({
    route: "/",
    pathname: "",
    query: "",
    asPath: "",
    push: vi.fn(),
    replace: vi.fn(),
    locale: "en",
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/auth/authRequests', () => ({
  signIn: vi.fn(),
}));

vi.mock('@/hooks/auth/useAuthRedirect', () => ({
  default: vi.fn(),
}));

vi.mock('@/utils/eventLogger', () => ({
  logFormSubmission: vi.fn(),
}));

describe('SignInForm', () => {
  const mockRedirectWithToken = vi.fn();

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthRedirect as any).mockReturnValue({
      redirectWithToken: mockRedirectWithToken,
    });
  });

  it('renders correctly', () => {
    render(<SignInForm />);
    expect(screen.getByPlaceholderText('email-placeholder')).toBeTruthy();
    expect(screen.getByPlaceholderText('password-placeholder')).toBeTruthy();
    expect(screen.getByText('sign-in')).toBeTruthy();
  });

  it('spreads HTMLAttributes to the root element', () => {
    render(<SignInForm data-testid="signin-form-root" className="custom-class" />);
    const rootElement = screen.getByTestId('signin-form-root');
    expect(rootElement).toBeTruthy();
    expect(rootElement.className).toContain('custom-class');
  });

  it('handles form submission and redirects on success', async () => {
    (signIn as any).mockResolvedValue({
      data: { success: true, token: 'fake-token' },
    });

    render(<SignInForm redirect="/home" />);
    
    fireEvent.change(screen.getByPlaceholderText('email-placeholder'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('password-placeholder'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByText('sign-in'));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(logFormSubmission).toHaveBeenCalledWith('sign_in');
      expect(mockRedirectWithToken).toHaveBeenCalledWith('/home', 'fake-token');
    });
  });

  it('displays error on failed submission', async () => {
    (signIn as any).mockResolvedValue({
      data: { success: false },
      errors: { email: ['Invalid email'] },
    });

    render(<SignInForm />);
    
    fireEvent.change(screen.getByPlaceholderText('email-placeholder'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('password-placeholder'), { target: { value: 'wrong-password' } });
    
    fireEvent.click(screen.getByText('sign-in'));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('test@example.com', 'wrong-password');
    });

    expect(await screen.findByText('Invalid email')).toBeTruthy();
  });
});
