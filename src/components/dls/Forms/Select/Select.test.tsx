import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Select from './index';

vi.mock('@/icons/caret-down.svg', () => ({
  default: () => <span data-testid="caret-icon" />,
}));

describe('Select', () => {
  afterEach(cleanup);

  const mockOptions = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3', disabled: true },
  ];

  it('renders select with options and default placeholder', () => {
    render(
      <Select
        id="test-select"
        name="test"
        options={mockOptions}
        placeholder="Choose an option"
      />,
    );

    expect(screen.getByText('Choose an option')).toBeDefined();
    expect(screen.getByText('Option 1')).toBeDefined();
    expect(screen.getByText('Option 2')).toBeDefined();
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(
      <Select
        id="test-select"
        name="test"
        options={mockOptions}
        onChange={handleChange}
      />,
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'opt2' } });
    expect(handleChange).toHaveBeenCalledWith('opt2');
  });

  it('disables the select element when disabled prop is true', () => {
    render(
      <Select
        id="test-select"
        name="test"
        options={mockOptions}
        disabled
      />,
    );

    const select = screen.getByRole('combobox');
    expect((select as HTMLSelectElement).disabled).toBe(true);
  });
});
