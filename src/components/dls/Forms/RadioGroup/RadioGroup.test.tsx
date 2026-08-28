import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RadioGroup from './RadioGroup';

vi.mock('@/hooks/useDirection', () => ({
  default: () => 'ltr',
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    pathname: '/',
  }),
}));

describe('RadioGroup', () => {
  afterEach(cleanup);

  const mockItems = [
    { id: 'opt1', value: 'opt1', label: 'Option 1' },
    { id: 'opt2', value: 'opt2', label: 'Option 2' },
    { id: 'opt3', value: 'opt3', label: 'Option 3', disabled: true },
  ];

  it('renders radio group with items and labels', () => {
    render(<RadioGroup items={mockItems} ariaLabel="Test group" />);

    expect(screen.getByRole('radiogroup')).toBeDefined();
    expect(screen.getByText('Option 1')).toBeDefined();
    expect(screen.getByText('Option 2')).toBeDefined();
  });

  it('calls onChange when an option is selected', () => {
    const handleChange = vi.fn();
    render(<RadioGroup items={mockItems} onChange={handleChange} ariaLabel="Test group" />);

    const radio2 = screen.getByLabelText('Option 2');
    fireEvent.click(radio2);
    expect(handleChange).toHaveBeenCalledWith('opt2');
  });

  it('disables item when disabled is set', () => {
    render(<RadioGroup items={mockItems} ariaLabel="Test group" />);

    const radio3 = screen.getByLabelText('Option 3');
    expect((radio3 as HTMLButtonElement).disabled).toBe(true);
  });
});
