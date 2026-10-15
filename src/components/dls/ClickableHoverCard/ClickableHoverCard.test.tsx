/* eslint-disable i18next/no-literal-string, import/no-extraneous-dependencies */
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import ClickableHoverCard from './index';

expect.extend(matchers);

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

describe('ClickableHoverCard', () => {
  it('behaves as a popover on click', async () => {
    render(
      <ClickableHoverCard content={<div>Hidden Info</div>}>
        <button type="button">Action</button>
      </ClickableHoverCard>,
    );

    expect(screen.queryByText('Hidden Info')).not.toBeInTheDocument();

    // Click should open it
    await userEvent.click(screen.getByRole('button', { name: 'Action' }));
    await waitFor(() => {
      expect(screen.getByText('Hidden Info')).toBeInTheDocument();
    });
  });

  it('supports body prop as an alias for content', async () => {
    render(
      <ClickableHoverCard body={<div>Body Info</div>}>
        <button type="button">Action Body</button>
      </ClickableHoverCard>,
    );

    expect(screen.queryByText('Body Info')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Action Body' }));
    await waitFor(() => {
      expect(screen.getByText('Body Info')).toBeInTheDocument();
    });
  });
});
