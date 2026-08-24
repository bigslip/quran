import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import SignUpForm from './SignUpForm';
import { signUp } from '@/utils/auth/authRequests';
import { logFormSubmission } from '@/utils/eventLogger';

// Mock dependencies
vi.mock("/public/icons/show.svg", () => ({
  default: () => <svg data-testid="show-icon" />
}));
vi.mock("/public/icons/checkmark-icon.svg", () => ({
  default: () => <svg data-testid="checkmark-icon" />
}));

vi.mock("/public/icons/close-icon.svg", () => ({
  default: () => <svg data-testid="close-icon" />
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
  signUp: vi.fn(),
}));

vi.mock('@/utils/eventLogger', () => ({
  logFormSubmission: vi.fn(),
}));

describe('SignUpForm', () => {
  const mockOnSuccess = vi.fn();

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<SignUpForm onSuccess={mockOnSuccess} />);
    expect(screen.getByTestId('signup-submit-button')).toBeTruthy();
  });

  it('spreads HTMLAttributes to the root element', () => {
    const { container } = render(
      <SignUpForm onSuccess={mockOnSuccess} data-testid="signup-form-root" className="custom-class" />
    );
    const rootElement = screen.getByTestId('signup-form-root');
    expect(rootElement).toBeTruthy();
    expect(rootElement.className).toContain('custom-class');
  });

  it('shows error when passwords do not match', async () => {
    render(<SignUpForm onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('first-name-placeholder'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('last-name-placeholder'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('email-placeholder'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('username-placeholder'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('password-placeholder'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('confirm-password-placeholder'), { target: { value: 'password321' } });
    
    fireEvent.click(screen.getByTestId('signup-submit-button'));
    
    expect(await screen.findByText('errors.confirm')).toBeTruthy();
  });

  it('handles form submission and calls onSuccess', async () => {
    (signUp as any).mockResolvedValue({
      data: { success: true },
    });

    render(<SignUpForm onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('first-name-placeholder'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('last-name-placeholder'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('email-placeholder'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('username-placeholder'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('password-placeholder'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('confirm-password-placeholder'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByTestId('signup-submit-button'));
    
    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(mockOnSuccess).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });
  });
});
