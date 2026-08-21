import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import IconContainer, { IconSize, IconColor } from './IconContainer';

// Mock useDirection
vi.mock('@/hooks/useDirection', () => ({
  default: () => 'ltr',
}));

describe('IconContainer', () => {
  afterEach(cleanup);

  it('renders wrapper with icon', () => {
    render(<IconContainer icon={<svg data-testid="test-svg" />} data-testid="icon-container" />);
    expect(screen.getByTestId('test-svg')).toBeTruthy();
    expect(screen.getByTestId('icon-container')).toBeTruthy();
  });

  it('applies size classes', () => {
    render(
      <IconContainer
        icon={<svg />}
        size={IconSize.Large}
        data-testid="icon-container"
      />
    );
    const container = screen.getByTestId('icon-container');
    expect(container.className).toContain('largeIcon');
  });

  it('applies color classes', () => {
    render(
      <IconContainer
        icon={<svg />}
        color={IconColor.secondary}
        data-testid="icon-container"
      />
    );
    const container = screen.getByTestId('icon-container');
    expect(container.className).toContain('secondaryColor');
  });

  it('spreads remaining props to the root span element', () => {
    render(
      <IconContainer
        icon={<svg />}
        aria-hidden="true"
        data-testid="icon-container"
      />
    );
    const container = screen.getByTestId('icon-container');
    expect(container.getAttribute('aria-hidden')).toBe('true');
  });
});
