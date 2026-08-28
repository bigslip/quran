import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Separator, { SeparatorWeight } from './Separator';

describe('Separator', () => {
  afterEach(cleanup);

  it('renders horizontal separator by default with role separator', () => {
    render(<Separator data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toBeDefined();
    expect(sep.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('renders vertical separator when isVertical is true', () => {
    render(<Separator isVertical data-testid="sep-v" />);
    const sep = screen.getByTestId('sep-v');
    expect(sep.getAttribute('data-orientation')).toBe('vertical');
  });

  it('applies weight and custom classes', () => {
    const { container } = render(
      <Separator weight={SeparatorWeight.Bold} className="custom-class" data-testid="sep-bold" />,
    );
    const sep = screen.getByTestId('sep-bold');
    expect(sep.classList.contains('custom-class')).toBe(true);
    expect(container.firstChild).toBeDefined();
  });

  it('forwards custom HTML attributes and accessibility props', () => {
    render(<Separator id="my-separator" aria-hidden="true" data-testid="sep-custom" />);
    const sep = screen.getByTestId('sep-custom');
    expect(sep.getAttribute('id')).toBe('my-separator');
    expect(sep.getAttribute('aria-hidden')).toBe('true');
  });
});
