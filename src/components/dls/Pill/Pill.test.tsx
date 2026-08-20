/* eslint-disable i18next/no-literal-string */
// eslint-disable-next-line import/no-extraneous-dependencies
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Pill from './Pill';

expect.extend(matchers);

describe('Pill', () => {
  it('renders the children correctly', () => {
    render(<Pill>Test Pill</Pill>);
    expect(screen.getByText('Test Pill')).toBeInTheDocument();
  });

  it('spreads remaining props to the root element', () => {
    render(
      <Pill data-testid="custom-pill" aria-label="Custom Pill">
        Test Pill
      </Pill>
    );
    const pillElement = screen.getByTestId('custom-pill');
    expect(pillElement).toBeInTheDocument();
    expect(pillElement).toHaveAttribute('aria-label', 'Custom Pill');
  });
});
