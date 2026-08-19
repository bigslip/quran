import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach, vi } from 'vitest';

import Progress from './index';

expect.extend(matchers);

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

afterEach(() => {
  cleanup();
});

describe('Progress', () => {
  it('renders a progress bar', () => {
    render(<Progress value={50} />);
    const pb = screen.getByRole('progressbar');
    expect(pb).toBeInTheDocument();
    expect(pb).toHaveAttribute('aria-valuenow', '50');
  });

  it('restricts value between 0 and 100', () => {
    render(<Progress value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('applies aria-label to the progressbar role when provided', () => {
    render(<Progress value={50} aria-label="Loading something" />);
    const pb = screen.getByRole('progressbar');
    expect(pb).toHaveAttribute('aria-label', 'Loading something');
  });
});
