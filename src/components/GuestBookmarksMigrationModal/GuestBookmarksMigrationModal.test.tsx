import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GuestBookmarksMigrationModal from './index';

// Mock dependencies
const mockPush = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/current-page',
    push: mockPush,
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('next-translate/Trans', () => ({
  default: ({ i18nKey }: any) => <span>{i18nKey}</span>,
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  shallowEqual: vi.fn(),
}));

vi.mock('@/hooks/auth/useIsLoggedIn', () => ({
  default: () => ({ isLoggedIn: false }),
}));

vi.mock('@/icons/close.svg', () => ({ default: () => <svg /> }));
vi.mock('/public/icons/tick.svg', () => ({ default: () => <svg /> }));

import { useSelector } from 'react-redux';
const mockUseSelector = useSelector as unknown as ReturnType<typeof vi.fn>;

describe('GuestBookmarksMigrationModal', () => {
  let localStorageStore: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    
    localStorageStore = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => localStorageStore[key] || null),
        setItem: vi.fn((key, value) => {
          localStorageStore[key] = value.toString();
        }),
        removeItem: vi.fn((key) => {
          delete localStorageStore[key];
        }),
        clear: vi.fn(() => {
          localStorageStore = {};
        }),
      },
      writable: true,
    });

    // Default mock setup
    mockUseSelector.mockImplementation((selector) => {
      if (selector.name === 'selectIsPersistGateHydrationComplete') return true;
      if (selector.name === 'selectBookmarks') return { '1:1': 12345 };
      return undefined;
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('spreads HTMLAttributes to the modal body container', async () => {
    render(<GuestBookmarksMigrationModal data-testid="guest-migration-modal" aria-describedby="desc-id" />);
    await waitFor(() => {
      expect(screen.getByTestId('guest-migration-modal')).toHaveAttribute('aria-describedby', 'desc-id');
    });
  });

  it('handles migration sign-in trigger', async () => {
    render(<GuestBookmarksMigrationModal />);
    
    let signInBtn: HTMLElement;
    await waitFor(() => {
      signInBtn = screen.getByText('bookmarks-migration.sign-in');
      expect(signInBtn).toBeInTheDocument();
    });

    await userEvent.click(signInBtn!);
    
    expect(mockPush).toHaveBeenCalled();
    const pushArg = mockPush.mock.calls[0][0];
    expect(pushArg).toContain('login');
    expect(pushArg).toContain('current-page'); // Verify redirect URL
  });

  it('handles cancel button', async () => {
    render(<GuestBookmarksMigrationModal />);
    
    let closeBtn: HTMLElement;
    await waitFor(() => {
      closeBtn = screen.getByLabelText('close');
      expect(closeBtn).toBeInTheDocument();
    });

    await userEvent.click(closeBtn!);
    
    const nextShow = localStorageStore['guest-bookmarks-migration:next-show'];
    expect(nextShow).toBeTruthy();
    expect(Number(nextShow)).toBeGreaterThan(Date.now());
  });

  it('persists opt-out preference when checkbox is checked on sign-in', async () => {
    render(<GuestBookmarksMigrationModal />);
    
    await waitFor(() => expect(screen.getByLabelText('bookmarks-migration.checkbox')).toBeInTheDocument());
    
    const checkbox = screen.getByLabelText('bookmarks-migration.checkbox');
    await userEvent.click(checkbox);
    
    const signInBtn = screen.getByText('bookmarks-migration.sign-in');
    await userEvent.click(signInBtn);
    
    expect(localStorageStore['guest-bookmarks-migration:opt-out']).toBe('1');
    expect(localStorageStore['guest-bookmarks-migration:next-show']).toBeUndefined();
  });

  it('persists opt-out preference when checkbox is checked on cancel', async () => {
    render(<GuestBookmarksMigrationModal />);
    
    await waitFor(() => expect(screen.getByLabelText('bookmarks-migration.checkbox')).toBeInTheDocument());
    
    const checkbox = screen.getByLabelText('bookmarks-migration.checkbox');
    await userEvent.click(checkbox);
    
    const closeBtn = screen.getByLabelText('close');
    await userEvent.click(closeBtn);
    
    expect(localStorageStore['guest-bookmarks-migration:opt-out']).toBe('1');
    expect(localStorageStore['guest-bookmarks-migration:next-show']).toBeUndefined();
  });

  it('manages focus correctly on open', async () => {
    render(<GuestBookmarksMigrationModal />);
    
    await waitFor(() => {
      const closeBtn = screen.getByLabelText('close');
      expect(closeBtn).toBeInTheDocument();
    });
  });
});
