import * as matchers from '@testing-library/jest-dom/matchers';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TabSwitcher from './TabSwitcher';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe('TabSwitcher', () => {
  it('renders options and calls onChange', () => {
    const onChange = vi.fn();
    render(
      <TabSwitcher
        options={[
          { label: 'Map', value: 'map' },
          { label: 'List', value: 'list' },
        ]}
        value="map"
        onChange={onChange}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Map' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(onChange).toHaveBeenCalledWith('list');
  });
});
