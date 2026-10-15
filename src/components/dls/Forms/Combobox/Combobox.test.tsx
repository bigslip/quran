import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Combobox from './index';

vi.mock('@/icons/close.svg', () => ({
  default: () => <span data-testid="clear-icon" />,
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <span data-testid="search-icon" />,
}));

vi.mock('@/icons/caret-down.svg', () => ({
  default: () => <span data-testid="caret-icon" />,
}));

describe('Combobox', () => {
  afterEach(cleanup);

  const mockItems = [
    { id: '1', name: 'Item 1', value: 'item1', label: 'Item 1' },
    { id: '2', name: 'Item 2', value: 'item2', label: 'Item 2' },
  ];

  it('renders combobox input with placeholder', () => {
    render(<Combobox id="test-combobox" items={mockItems} placeholder="Search items..." />);

    const input = screen.getByPlaceholderText('Search items...');
    expect(input).toBeDefined();
  });

  it('filters items when user types in search', () => {
    render(<Combobox id="test-combobox" items={mockItems} placeholder="Search items..." />);

    const input = screen.getByPlaceholderText('Search items...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Item 1' } });

    expect(screen.getByText('Item 1')).toBeDefined();
  });
});
