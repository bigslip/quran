import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Spinner, { SpinnerSize } from './Spinner';

describe('Spinner', () => {
  it('renders with role="status"', () => {
    const { unmount } = render(<Spinner />);
    expect(screen.getByRole('status')).toBeDefined();
    unmount();
  });

  it('contains visually hidden text for screen readers', () => {
    const { unmount } = render(<Spinner />);
    expect(screen.getByText('Loading...')).toBeDefined();
    unmount();
  });

  it('applies the correct size class', () => {
    const { container, unmount } = render(<Spinner size={SpinnerSize.Large} />);
    expect((container.firstChild as HTMLElement).className).toContain('large');
    unmount();
  });

  it('applies delayed visibility class when shouldDelayVisibility is true', () => {
    const { container, unmount } = render(<Spinner shouldDelayVisibility />);
    expect((container.firstChild as HTMLElement).className).toContain('delayVisibility');
    unmount();
  });
});
