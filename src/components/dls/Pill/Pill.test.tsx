/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Pill from './Pill';

describe('Pill', () => {
  it('renders the children correctly', () => {
    render(<Pill>Test Pill</Pill>);
    expect(screen.getByText('Test Pill')).toBeDefined();
  });

  it('spreads remaining props to the root element', () => {
    render(
      <Pill data-testid="custom-pill" aria-label="Custom Pill" className="custom-class">
        Test Pill
      </Pill>
    );
    const pillElement = screen.getByTestId('custom-pill');
    expect(pillElement).toBeDefined();
    expect(pillElement.getAttribute('aria-label')).toBe('Custom Pill');
    expect(pillElement.className).toContain('custom-class');
  });
});
