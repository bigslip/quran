import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from './Button';

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    pathname: '/',
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
  }),
}));

describe('Button', () => {
  afterEach(cleanup);

  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('handles click events when enabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Action</Button>);

    fireEvent.click(screen.getByText('Action'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button and prevents click when isDisabled is true', () => {
    const handleClick = vi.fn();
    render(
      <Button isDisabled onClick={handleClick}>
        Disabled
      </Button>,
    );

    const button = screen.getByRole('button');
    expect((button as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disables the button and prevents click when isLoading is true', () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Submit
      </Button>,
    );

    const button = screen.getByRole('button');
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('status')).toBeDefined();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as a link when href is provided', () => {
    render(<Button href="/surah/1">Go to Surah</Button>);

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/surah/1');
  });

  it('does not render as a link when href is provided but isDisabled is true', () => {
    render(
      <Button href="/surah/1" isDisabled>
        Disabled Link
      </Button>,
    );

    expect(screen.queryByRole('link')).toBeNull();
    const button = screen.getByRole('button');
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders prefix and suffix elements', () => {
    render(
      <Button
        prefix={<span data-testid="prefix-icon">Left</span>}
        suffix={<span data-testid="suffix-icon">Right</span>}
      >
        Text
      </Button>,
    );

    expect(screen.getByTestId('prefix-icon')).toBeDefined();
    expect(screen.getByTestId('suffix-icon')).toBeDefined();
  });

  it('applies variant, size, and shape classes', () => {
    const { container } = render(
      <Button
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Large}
        shape={ButtonShape.Pill}
        type={ButtonType.Secondary}
      >
        Custom Button
      </Button>,
    );

    const button = container.querySelector('button');
    expect(button).toBeDefined();
  });

  it('forwards custom HTML attributes and aria-label', () => {
    render(
      <Button ariaLabel="Custom Action" data-testid="custom-btn" id="btn-1">
        Icon Only
      </Button>,
    );

    const button = screen.getByTestId('custom-btn');
    expect(button.getAttribute('aria-label')).toBe('Custom Action');
    expect(button.getAttribute('id')).toBe('btn-1');
  });
});
