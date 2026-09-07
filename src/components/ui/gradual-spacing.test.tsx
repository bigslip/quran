import React from 'react';

import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { GradualSpacing } from './gradual-spacing';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe('GradualSpacing', () => {
  it('renders text with accessible aria-label', () => {
    render(<GradualSpacing text="Quran.com" />);
    expect(screen.getByLabelText('Quran.com')).toBeInTheDocument();
  });

  it('renders as custom HTML element', () => {
    const { container } = render(<GradualSpacing text="Peace" as="h2" />);
    expect(container.querySelector('h2')).toBeInTheDocument();
  });

  it('handles spaces properly', () => {
    const { container } = render(<GradualSpacing text="Read Reflect" />);
    expect(container.textContent).toContain('Read\u00a0Reflect');
  });
});
