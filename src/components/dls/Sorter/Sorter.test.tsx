import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Sorter, { ArrowDirection } from './Sorter';
import useTranslation from 'next-translate/useTranslation';

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
vi.mock('@/icons/arrows-vertical.svg', () => ({
  default: () => <svg data-testid="arrows-vertical-icon" />,
}));
vi.mock('@/icons/arrow-right.svg', () => ({
  default: () => <svg data-testid="arrow-right-icon" />,
}));

// Mock PopoverMenu to always render children and trigger
vi.mock('@/dls/PopoverMenu/PopoverMenu', () => {
  const PopoverMenu = ({ children, trigger }: any) => (
    <div data-testid="popover-menu-mock">
      {trigger}
      <div>{children}</div>
    </div>
  );
  PopoverMenu.Item = ({ children, onClick, isSelected, dataTestId }: any) => (
    <div onClick={onClick} data-selected={isSelected} data-testid={dataTestId}>
      {children}
    </div>
  );
  return { 
    default: PopoverMenu,
    PopoverMenuAlign: { START: 'start', END: 'end' } 
  };
});
// Mock IconContainer
vi.mock('@/dls/IconContainer/IconContainer', () => {
  const IconContainer = ({ icon }: any) => <div>{icon}</div>;
  return {
    default: IconContainer,
    IconSize: { Custom: 'custom' }
  };
});


describe('Sorter', () => {
  afterEach(cleanup);

  const mockOptions = [
    { id: 'date', label: 'Date', direction: ArrowDirection.Down },
    { id: 'alphabetical', label: 'Alphabetical', direction: ArrowDirection.Up },
  ];

  it('renders sorter trigger', () => {
    render(
      <Sorter
        options={mockOptions}
        selectedOptionId="date"
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /sort\.sort/i })).toBeTruthy();
  });

  it('spreads props to the trigger button', () => {
    render(
      <Sorter
        options={mockOptions}
        selectedOptionId="date"
        onChange={() => {}}
        aria-label="Sort options"
        data-testid="sorter-trigger"
      />
    );
    const trigger = screen.getByTestId('sorter-trigger');
    expect(trigger.getAttribute('aria-label')).toBe('Sort options');
  });

  it('renders options correctly and handles click', () => {
    const onChange = vi.fn();
    render(
      <Sorter
        options={mockOptions}
        selectedOptionId="date"
        onChange={onChange}
        dataTestPrefix="test-sorter"
      />
    );
    
    // Check if options are rendered
    const dateOption = screen.getByTestId('test-sorter-option-date');
    const alphaOption = screen.getByTestId('test-sorter-option-alphabetical');
    
    expect(dateOption).toBeTruthy();
    expect(alphaOption).toBeTruthy();
    
    // Check selected state
    expect(dateOption.getAttribute('data-selected')).toBe('true');
    expect(alphaOption.getAttribute('data-selected')).toBe('false');
    
    // Click unselected option
    fireEvent.click(alphaOption);
    expect(onChange).toHaveBeenCalledWith('alphabetical');
  });
});
