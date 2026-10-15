import * as matchers from '@testing-library/jest-dom/matchers'; // eslint-disable-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Skeleton from './Skeleton';

expect.extend(matchers);

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
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <span>Test Content</span>
      </Skeleton>,
    );
    const element = screen.getByTestId('skeleton-with-children');
    expect(element).toBeInTheDocument();
    // eslint-disable-next-line i18next/no-literal-string
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
