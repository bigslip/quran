import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EnrollButton from './EnrollButton';
import { addReadingGoal } from '@/utils/auth/api';

afterEach(() => {
  cleanup();
});

vi.mock('@/utils/auth/api', () => ({
  addReadingGoal: vi.fn(),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
  ToastStatus: { Success: 'success', Error: 'error' },
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    push: vi.fn(),
  }),
}));

describe('EnrollButton', () => {
  it('renders correctly when not enrolled', () => {
    render(
      <EnrollButton
        section="test"
        subscribedText="Subscribed"
        enrollText="Enroll"
        isEnrolled={false}
        isLoading={false}
        mutate={vi.fn()}
      />
    );
    expect(screen.getByText('Enroll')).toBeDefined();
  });

  it('renders correctly when enrolled', () => {
    render(
      <EnrollButton
        section="test"
        subscribedText="Subscribed"
        enrollText="Enroll"
        isEnrolled={true}
        isLoading={false}
        mutate={vi.fn()}
      />
    );
    expect(screen.getByText('Subscribed')).toBeDefined();
  });

  it('shows loading spinner when isLoading is true', () => {
    const { container } = render(
      <EnrollButton
        section="test"
        subscribedText="Subscribed"
        enrollText="Enroll"
        isEnrolled={false}
        isLoading={true}
        mutate={vi.fn()}
      />
    );
    expect(screen.getByRole('status')).not.toBeNull();
  });

  it('calls addReadingGoal and mutate on click when not enrolled', async () => {
    const mutate = vi.fn().mockResolvedValue(undefined);
    (addReadingGoal as any).mockResolvedValue({});

    render(
      <EnrollButton
        section="test"
        subscribedText="Subscribed"
        enrollText="Enroll"
        isEnrolled={false}
        isLoading={false}
        mutate={mutate}
      />
    );

    fireEvent.click(screen.getByText('Enroll'));

    await waitFor(() => {
      expect(addReadingGoal).toHaveBeenCalled();
      expect(mutate).toHaveBeenCalled();
    });
  });

  it('forwards HTMLAttributes correctly', () => {
    render(
      <EnrollButton
        section="test"
        subscribedText="Subscribed"
        enrollText="Enroll"
        isEnrolled={false}
        isLoading={false}
        mutate={vi.fn()}
        aria-label="enroll button"
        data-testid="enroll-btn"
      />
    );
    const btn = screen.getByTestId('enroll-btn');
    expect(btn.getAttribute('aria-label')).toBe('enroll button');
  });
});
