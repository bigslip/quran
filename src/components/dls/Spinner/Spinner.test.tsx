import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import Spinner, { SpinnerSize } from './Spinner';

describe('Spinner', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with role="status"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).not.toBeNull();
  });

  it('contains visually hidden text for screen readers', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading...')).not.toBeNull();
  });

  it('applies the correct size class', () => {
    const { container } = render(<Spinner size={SpinnerSize.Large} />);
    expect((container.firstChild as HTMLElement).className).toContain('large');
  });

  it('applies delayed visibility class when shouldDelayVisibility is true', () => {
    const { container } = render(<Spinner shouldDelayVisibility />);
    expect((container.firstChild as HTMLElement).className).toContain('delayVisibility');
  });
});
