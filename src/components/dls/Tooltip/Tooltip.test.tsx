import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Tooltip, { ContentSide } from './index';

describe('Tooltip', () => {
  beforeEach(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
  });

  it('renders children trigger without overwriting accessible name', () => {
    render(
      <RadixTooltip.Provider>
        <Tooltip text="Help text">
          <button type="button">Action Button</button>
        </Tooltip>
      </RadixTooltip.Provider>,
    );

    const button = screen.getByRole('button', { name: 'Action Button' });
    expect(button).toBeDefined();
    expect(button.getAttribute('aria-label')).toBeNull();
  });

  it('renders tooltip text when open is true', () => {
    render(
      <RadixTooltip.Provider>
        <Tooltip text="Tooltip info message" open contentSide={ContentSide.TOP}>
          <span>Hover me</span>
        </Tooltip>
      </RadixTooltip.Provider>,
    );

    expect(screen.getAllByText('Tooltip info message').length).toBeGreaterThan(0);
  });
});
