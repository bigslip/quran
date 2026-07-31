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

  it('supports ArrowRight and ArrowLeft keyboard navigation and roving focus', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={[
          { label: 'Map', value: 'map' },
          { label: 'List', value: 'list' },
          { label: 'Grid', value: 'grid' },
        ]}
        value="map"
        onChange={onChange}
      />
    );
    
    const mapTab = screen.getByRole('tab', { name: 'Map' });
    const listTab = screen.getByRole('tab', { name: 'List' });
    const gridTab = screen.getByRole('tab', { name: 'Grid' });

    mapTab.focus();
    expect(mapTab).toHaveFocus();

    // ArrowRight: Map -> List
    fireEvent.keyDown(mapTab, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('list');
    expect(listTab).toHaveFocus();

    // ArrowRight: List -> Grid
    fireEvent.keyDown(listTab, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('grid');
    expect(gridTab).toHaveFocus();

    // ArrowRight: Grid -> Map (wrap around)
    fireEvent.keyDown(gridTab, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('map');
    expect(mapTab).toHaveFocus();

    // ArrowLeft: Map -> Grid (wrap around)
    fireEvent.keyDown(mapTab, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('grid');
    expect(gridTab).toHaveFocus();

    // ArrowLeft: Grid -> List
    fireEvent.keyDown(gridTab, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('list');
    expect(listTab).toHaveFocus();
  });
});
