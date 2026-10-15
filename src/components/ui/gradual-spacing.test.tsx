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
    render(<GradualSpacing text="Quran.ir" />);
    expect(screen.getByLabelText('Quran.ir')).toBeInTheDocument();
  });

  it('renders as custom HTML element', () => {
    const { container } = render(<GradualSpacing text="Peace" as="h2" />);
    expect(container.querySelector('h2')).toBeInTheDocument();
  });

  it('handles spaces properly', () => {
    const { container } = render(<GradualSpacing text="Read Reflect" />);
    expect(container.textContent).toContain('Read\u00a0Reflect');
  });

  it('renders cursive Persian/Arabic script as connected whole words without splitting letters', () => {
    const { container } = render(<GradualSpacing text="فضای اوقات شرعی و نماز" />);
    expect(screen.getByLabelText('فضای اوقات شرعی و نماز')).toBeInTheDocument();
    expect(container.textContent).toContain('فضای\u00a0اوقات\u00a0شرعی\u00a0و\u00a0نماز');
    // Verify each word is an indivisible span
    const words = screen.getAllByTestId('gradual-word');
    expect(words.length).toBe(5);
    expect(words[0].textContent).toBe('فضای');
    expect(words[1].textContent).toBe('اوقات');
    expect(words[2].textContent).toBe('شرعی');
    expect(words[3].textContent).toBe('و');
    expect(words[4].textContent).toBe('نماز');
  });
});
