import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SelectionList from './index';

// Mock next-translate
vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
  }),
}));

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

// Mock SVGs
vi.mock('@/icons/check.svg', () => ({
  default: () => <svg data-testid="check-icon" />,
}));
vi.mock('@/icons/chevron-select.svg', () => ({
  default: () => <svg data-testid="chevron-select-icon" />,
}));

// Mock PopoverMenu to always render children and trigger so we can test SelectionList logic
vi.mock('../PopoverMenu/PopoverMenu', () => {
  const PopoverMenu = ({ children, trigger }: any) => (
    <div data-testid="popover-menu-mock">
      {trigger}
      <div>{children}</div>
    </div>
  );
  PopoverMenu.Item = ({ children, onClick, isSelected }: any) => (
    <div onClick={onClick} data-selected={isSelected} data-testid="popover-item">
      {children}
    </div>
  );
  return { default: PopoverMenu };
});

describe('SelectionList', () => {
  afterEach(cleanup);

  const mockItems = [
    { id: '1', label: 'Item 1', value: 'item1' },
    { id: '2', label: 'Item 2', value: 'item2' },
  ];

  it('renders trigger button with title when no selection', () => {
    render(
      <SelectionList
        id="test-list"
        title="My List"
        items={mockItems}
        selectedValues={[]}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /My List/i })).toBeTruthy();
  });

  it('renders correctly with single selection', () => {
    render(
      <SelectionList
        id="test-list"
        items={mockItems}
        selectedValues={['item1']}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /Item 1/i })).toBeTruthy();
  });

  it('renders correctly with multiple selection', () => {
    render(
      <SelectionList
        id="test-list"
        items={mockItems}
        selectedValues={['item1', 'item2']}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /2 selected/i })).toBeTruthy();
  });

  it('handles onChange correctly when selecting an item', () => {
    const onChange = vi.fn();
    render(
      <SelectionList
        id="test-list"
        items={mockItems}
        selectedValues={[]}
        onChange={onChange}
      />
    );
    
    // Click item directly since it's always rendered in mock
    fireEvent.click(screen.getByText('Item 1'));
    
    expect(onChange).toHaveBeenCalledWith(['item1']);
  });
});
