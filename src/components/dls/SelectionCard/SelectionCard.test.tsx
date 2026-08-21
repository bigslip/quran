import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SelectionCard from './SelectionCard';

vi.mock('@/icons/chevron-right.svg', () => ({
  default: () => <svg data-testid="chevron-right" />,
}));

describe('SelectionCard', () => {
  afterEach(cleanup);

  it('renders label and value', () => {
    render(<SelectionCard label="Language" value="English" data-testid="sc1" />);
    expect(screen.getByText('Language')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(<SelectionCard label="Language" value="English" onClick={onClick} data-testid="sc2" />);
    const card = screen.getByTestId('sc2');
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard enter events', () => {
    const onClick = vi.fn();
    render(<SelectionCard label="Language" value="English" onClick={onClick} data-testid="sc3" />);
    const card = screen.getByTestId('sc3');
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('spreads remaining props to the root element', () => {
    render(
      <SelectionCard
        label="Language"
        value="English"
        aria-label="Select Language"
        aria-expanded="false"
      />
    );
    const card = screen.getByLabelText('Select Language');
    expect(card.getAttribute('aria-expanded')).toBe('false');
    expect(card.getAttribute('role')).toBe('button');
    expect(card.getAttribute('tabindex')).toBe('0');
  });
});
