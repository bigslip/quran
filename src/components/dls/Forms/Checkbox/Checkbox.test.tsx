import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Checkbox from './Checkbox';

vi.mock('@/icons/tick.svg', () => ({
  default: () => <span data-testid="tick-icon" />,
}));

vi.mock('@/icons/divider-horizontal.svg', () => ({
  default: () => <span data-testid="dash-icon" />,
}));

describe('Checkbox', () => {
  afterEach(cleanup);

  it('renders checkbox and associated label', () => {
    render(<Checkbox id="terms" label="Accept terms" onChange={vi.fn()} />);

    expect(screen.getByRole('checkbox')).toBeDefined();
    expect(screen.getByText('Accept terms')).toBeDefined();
  });

  it('calls onChange when toggled', () => {
    const handleChange = vi.fn();
    render(<Checkbox id="notifications" label="Enable notifications" onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Checkbox id="disabled-cb" label="Disabled" disabled onChange={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox');
    expect((checkbox as HTMLButtonElement).disabled).toBe(true);
  });
});
