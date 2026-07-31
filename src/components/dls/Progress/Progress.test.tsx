/* eslint-disable import/no-extraneous-dependencies */
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';

import Progress from './index';

expect.extend(matchers);

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
});
