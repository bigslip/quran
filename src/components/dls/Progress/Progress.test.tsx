import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';

import Progress from './index';

afterEach(() => {
  cleanup();
});

describe('Progress', () => {
  it('renders a progress bar', () => {
    render(<Progress value={50} />);
    const pb = screen.getByRole('progressbar');
    expect(pb).toBeTruthy();
    expect(pb.getAttribute('aria-valuenow')).toBe('50');
  });

  it('restricts value between 0 and 100', () => {
    render(<Progress value={150} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
  });
});
