import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';

import LoadingState from './LoadingState';

describe('LoadingState Component', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders with default label', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders custom label and different variants without errors', () => {
    const { rerender } = render(<LoadingState label="Loading Surah..." variant="Drive" />);
    expect(screen.getByText('Loading Surah...')).toBeTruthy();

    rerender(<LoadingState label="Loading Juz..." variant="Dots" />);
    expect(screen.getByText('Loading Juz...')).toBeTruthy();

    rerender(<LoadingState label="Loading Page..." variant="Orbit" />);
    expect(screen.getByText('Loading Page...')).toBeTruthy();
  });

  it('renders accessible status role and does not render timer counter', () => {
    render(<LoadingState label="Reciting" />);
    const statusEl = screen.getByRole('status');
    expect(statusEl.getAttribute('aria-live')).toBe('polite');
    // Ensure seconds counter is absent
    expect(screen.queryByText(/^[0-9]+(\.[0-9]+)?s$/)).toBeNull();
  });
});
