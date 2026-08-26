import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EnrollmentCount from './EnrollmentCount';
import useSWR from 'swr';

vi.mock('swr', () => ({
  default: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

describe('EnrollmentCount', () => {
  it('renders skeleton when data is loading', () => {
    (useSWR as any).mockReturnValue({ data: undefined });
    const { container } = render(<EnrollmentCount />);
    expect(container.querySelector('p[aria-busy="true"]')).not.toBeNull();
  });

  it('renders nothing when count is below MINIMUM_ENROLLMENT_COUNT', () => {
    (useSWR as any).mockReturnValue({ data: { data: { count: 499 } } });
    const { container } = render(<EnrollmentCount />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when count is not a number', () => {
    (useSWR as any).mockReturnValue({ data: { data: { count: 'abc' } } });
    const { container } = render(<EnrollmentCount />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the count when count is >= MINIMUM_ENROLLMENT_COUNT', () => {
    (useSWR as any).mockReturnValue({ data: { data: { count: 501 } } });
    render(<EnrollmentCount />);
    expect(screen.getByText('501+')).toBeDefined();
    expect(screen.getByText(/people around the world have joined the challenge!/)).toBeDefined();
  });

  it('forwards HTMLAttributes correctly', () => {
    (useSWR as any).mockReturnValue({ data: { data: { count: 501 } } });
    render(<EnrollmentCount data-testid="enrollment-count" aria-hidden="true" />);
    const el = screen.getByTestId('enrollment-count');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});
