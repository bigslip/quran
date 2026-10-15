import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import CompleteSignupForm from './CompleteSignupForm';
import { updateUserProfile } from '@/utils/auth/authRequests';
import { handleResendVerificationCode } from '@/utils/auth/verification';
import { useSWRConfig } from 'swr';

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string, values?: any) => key + (values ? JSON.stringify(values) : '') }),
}));

vi.mock('swr', () => ({
  useSWRConfig: vi.fn(),
}));

vi.mock('@/utils/auth/authRequests', () => ({
  updateUserProfile: vi.fn(),
}));

vi.mock('@/utils/auth/verification', () => ({
  handleResendVerificationCode: vi.fn(),
  handleVerificationCodeSubmit: vi.fn(),
}));

// Mock AuthHeader since we are only testing the form
vi.mock('./AuthHeader', () => ({
  default: () => <div data-testid="auth-header">AuthHeader</div>
}));

// Mock VerificationCodeForm
vi.mock('./VerificationCode/VerificationCodeForm', () => ({
  default: (props: any) => (
    <div data-testid="verification-code-form">
      VerificationCodeForm
      <button onClick={() => props.onBack()}>Back</button>
    </div>
  )
}));

import type UserProfile from '@/types/auth/UserProfile';

describe('CompleteSignupForm', () => {
  const mockMutate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useSWRConfig as any).mockReturnValue({ mutate: mockMutate });
  });

  afterEach(() => {
    cleanup();
  });

  const baseUserData: UserProfile = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
  } as UserProfile;

  it('spreads HTML attributes to the root element', () => {
    render(
      <CompleteSignupForm
        userData={baseUserData}
        data-testid="complete-signup-root"
        aria-describedby="desc"
        className="custom-class"
      />
    );
    
    const root = screen.getByTestId('complete-signup-root');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-describedby', 'desc');
    expect(root).toHaveClass('custom-class');
  });

  it('shows validation errors when submitting with empty fields', async () => {
    const emptyUserData = { ...baseUserData, firstName: '' };
    render(<CompleteSignupForm userData={emptyUserData} />);
    
    const submitBtn = screen.getByText('continue');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/errors\.required/)).toBeInTheDocument();
    });
  });

  it('submits successfully and calls onSuccess', async () => {
    (updateUserProfile as any).mockResolvedValue({ data: { success: true }, errors: null });
    const onSuccess = vi.fn();

    render(<CompleteSignupForm userData={baseUserData} onSuccess={onSuccess} />);
    
    const submitBtn = screen.getByText('continue');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows verification form when email is added for the first time', async () => {
    const noEmailUserData = { ...baseUserData, email: undefined };
    (updateUserProfile as any).mockResolvedValue({ data: { success: true }, errors: null });
    (handleResendVerificationCode as any).mockResolvedValue({});

    render(<CompleteSignupForm userData={noEmailUserData} />);
    
    const emailField = document.getElementById('email') as HTMLInputElement;
    fireEvent.change(emailField, { target: { value: 'new@example.com' } });

    const submitBtn = screen.getByText('continue');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalled();
      expect(handleResendVerificationCode).toHaveBeenCalledWith('new@example.com');
      expect(screen.getByTestId('verification-code-form')).toBeInTheDocument();
    });
  });
});
