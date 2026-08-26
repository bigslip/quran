import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import InlineLink from './InlineLink';
import { logButtonClick } from '@/utils/eventLogger';

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

describe('InlineLink', () => {
  it('renders correctly', () => {
    render(<InlineLink href="https://example.com" text="Example" />);
    expect(screen.getByText('Example')).toBeDefined();
    const link = screen.getByText('Example').closest('a');
    expect(link).toHaveProperty('href', 'https://example.com/');
  });

  it('logs click event', () => {
    render(<InlineLink href="https://example.com" text="Example" />);
    fireEvent.click(screen.getByText('Example'));
    expect(logButtonClick).toHaveBeenCalledWith('ramadan_activities_link', { href: 'https://example.com' });
  });

  it('forwards HTMLAttributes correctly', () => {
    render(
      <InlineLink
        href="https://example.com"
        text="Example"
        aria-label="example link"
        data-testid="inline-link"
      />
    );
    const link = screen.getByTestId('inline-link');
    expect(link.getAttribute('aria-label')).toBe('example link');
  });
});
