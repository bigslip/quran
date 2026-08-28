import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Input, { InputType } from './index';

vi.mock('@/icons/close.svg', () => ({
  default: () => <span data-testid="clear-icon" />,
}));

vi.mock('@/hooks/useDirection', () => ({
  default: () => 'ltr',
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    pathname: '/',
  }),
}));

describe('Input', () => {
  afterEach(cleanup);

  it('renders input with label connected by htmlFor and id', () => {
    render(<Input id="email-field" label="Email Address" placeholder="you@example.com" />);

    const label = screen.getByText('Email Address');
    expect(label.getAttribute('for')).toBe('email-field');

    const input = screen.getByPlaceholderText('you@example.com');
    expect(input.getAttribute('id')).toBe('email-field');
  });

  it('calls onChange when user types', () => {
    const handleChange = vi.fn();
    render(<Input id="test-input" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'testing' } });
    expect(handleChange).toHaveBeenCalledWith('testing');
  });

  it('sets aria-invalid="true" when type is Error', () => {
    render(<Input id="error-input" type={InputType.Error} />);

    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders clearable button and calls onClearClicked', () => {
    const handleClear = vi.fn();
    render(
      <Input
        id="clearable-input"
        clearable
        value="has value"
        onClearClicked={handleClear}
      />,
    );

    const clearBtn = screen.getByRole('button');
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalled();
  });
});
