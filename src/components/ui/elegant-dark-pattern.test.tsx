import React from 'react';

import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { ElegantDarkPattern, DarkGradientBg } from './elegant-dark-pattern';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe('ElegantDarkPattern (DarkGradientBg)', () => {
  it('renders children correctly', () => {
    render(
      <ElegantDarkPattern>
        <div data-testid="test-child">Hello Quran.com</div>
      </ElegantDarkPattern>,
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Hello Quran.com')).toBeInTheDocument();
  });

  it('renders with DarkGradientBg alias', () => {
    render(
      <DarkGradientBg>
        <div data-testid="alias-child">Alias Content</div>
      </DarkGradientBg>,
    );
    expect(screen.getByTestId('alias-child')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    const { container } = render(
      <ElegantDarkPattern className="custom-container" contentClassName="custom-content">
        <span>Content</span>
      </ElegantDarkPattern>,
    );
    expect(container.querySelector('.custom-container')).toBeInTheDocument();
    expect(container.querySelector('.custom-content')).toBeInTheDocument();
  });
});
