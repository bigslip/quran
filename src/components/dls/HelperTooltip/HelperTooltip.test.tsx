/* eslint-disable i18next/no-literal-string, import/no-extraneous-dependencies */
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import HelperTooltip from './HelperTooltip';

import { ContentSide } from '@/dls/Popover';

expect.extend(matchers);

vi.mock('@/icons/help-circle.svg', () => ({
  default: () => <svg data-testid="help-circle-icon" />,
}));

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
});

const renderHelperTooltip = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
};

describe('HelperTooltip', () => {
  it('renders question mark icon trigger', () => {
    renderHelperTooltip(<HelperTooltip>Help text</HelperTooltip>);
    expect(screen.getByTestId('help-circle-icon')).toBeInTheDocument();
  });

  it('shows help text on hover', async () => {
    renderHelperTooltip(<HelperTooltip>Some advanced configuration</HelperTooltip>);
    const trigger = screen.getByLabelText('Open tooltip');
    await userEvent.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Some advanced configuration').length).toBeGreaterThan(0);
    });
  });

  it('applies custom iconClassName', () => {
    renderHelperTooltip(<HelperTooltip iconClassName="custom-icon-class">Help text</HelperTooltip>);
    const iconContainer = screen.getByTestId('help-circle-icon').parentElement;
    expect(iconContainer).toHaveClass('custom-icon-class');
  });

  it('supports custom contentSide', async () => {
    renderHelperTooltip(
      <HelperTooltip contentSide={ContentSide.RIGHT}>Right tooltip text</HelperTooltip>,
    );
    const trigger = screen.getByLabelText('Open tooltip');
    await userEvent.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Right tooltip text').length).toBeGreaterThan(0);
    });
  });
});
