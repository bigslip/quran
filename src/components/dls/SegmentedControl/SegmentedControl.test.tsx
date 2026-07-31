import * as matchers from '@testing-library/jest-dom/matchers';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SegmentedControl from './SegmentedControl';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe('SegmentedControl', () => {
  it('renders options and calls onChange', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={[
          { label: 'Map', value: 'map' },
          { label: 'List', value: 'list' },
        ]}
        value="map"
        onChange={onChange}
      />
    );
    
    expect(screen.getByRole('tab', { name: 'Map' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'List' })).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('tab', { name: 'List' }));
    expect(onChange).toHaveBeenCalledWith('list');
  });
});
