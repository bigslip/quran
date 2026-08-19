import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

import Skeleton from './Skeleton';

describe('Skeleton', () => {
  it('renders a skeleton with aria-hidden="true"', () => {
    render(<Skeleton data-testid="skeleton" />);
    const element = screen.getByTestId('skeleton');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders children and wraps them in a hidden content block', () => {
    render(
      <Skeleton data-testid="skeleton-with-children">
        <span>Test Content</span>
      </Skeleton>,
    );
    const element = screen.getByTestId('skeleton-with-children');
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
