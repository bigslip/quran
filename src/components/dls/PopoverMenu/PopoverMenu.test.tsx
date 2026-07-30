/* eslint-disable i18next/no-literal-string, import/no-extraneous-dependencies */
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, afterEach, vi, beforeAll } from 'vitest';

import { PopoverMenu, PopoverMenuItem, PopoverMenuDivider } from './PopoverMenu';

expect.extend(matchers);

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

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    defaultLocale: 'en',
    pathname: '/',
  }),
}));

describe('PopoverMenu', () => {
  it('renders a menu that opens on click', async () => {
    render(
      <PopoverMenu trigger={<button type="button">Open Menu</button>}>
        <PopoverMenuItem onClick={() => {}}>Item 1</PopoverMenuItem>
        <PopoverMenuItem onClick={() => {}}>Item 2</PopoverMenuItem>
      </PopoverMenu>,
    );

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Open Menu' }));

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });

  it('fires onClick on menu items', async () => {
    const onClick = vi.fn();
    render(
      <PopoverMenu trigger={<button type="button">Open Menu</button>}>
        <PopoverMenuItem onClick={onClick}>Clickable</PopoverMenuItem>
      </PopoverMenu>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => expect(screen.getByText('Clickable')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Clickable'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports compound components PopoverMenu.Item and PopoverMenu.Divider', async () => {
    const onItemClick = vi.fn();
    render(
      <PopoverMenu trigger={<button type="button">Actions</button>}>
        <PopoverMenu.Item onClick={onItemClick}>Option 1</PopoverMenu.Item>
        <PopoverMenu.Divider />
        <PopoverMenuDivider />
        <PopoverMenu.Item disabled>Option 2 (Disabled)</PopoverMenu.Item>
      </PopoverMenu>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(screen.getByText('Option 1')).toBeInTheDocument());

    expect(screen.getByText('Option 2 (Disabled)')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Option 1'));
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick for disabled menu items', async () => {
    const onClick = vi.fn();
    render(
      <PopoverMenu trigger={<button type="button">Open Menu</button>}>
        <PopoverMenuItem disabled onClick={onClick}>
          Disabled Item
        </PopoverMenuItem>
      </PopoverMenu>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => expect(screen.getByText('Disabled Item')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Disabled Item'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('synchronizes internal state when controlled isOpen prop changes dynamically', async () => {
    const { rerender } = render(
      <PopoverMenu isOpen={false} trigger={<button type="button">Controlled Menu</button>}>
        <PopoverMenuItem onClick={() => {}}>Controlled Item</PopoverMenuItem>
      </PopoverMenu>,
    );

    expect(screen.queryByText('Controlled Item')).not.toBeInTheDocument();

    rerender(
      <PopoverMenu isOpen={true} trigger={<button type="button">Controlled Menu</button>}>
        <PopoverMenuItem onClick={() => {}}>Controlled Item</PopoverMenuItem>
      </PopoverMenu>,
    );

    await waitFor(() => expect(screen.getByText('Controlled Item')).toBeInTheDocument());

    rerender(
      <PopoverMenu isOpen={false} trigger={<button type="button">Controlled Menu</button>}>
        <PopoverMenuItem onClick={() => {}}>Controlled Item</PopoverMenuItem>
      </PopoverMenu>,
    );

    await waitFor(() => expect(screen.queryByText('Controlled Item')).not.toBeInTheDocument());
  });
});
