import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import { useAuthContext } from '@/contexts/AuthContext';
import { removeLastSyncAt } from '@/utils/auth/userDataSync';
import { clearBookmarks } from '@/redux/slices/QuranReader/bookmarks';
import { clearReadingTracker } from '@/redux/slices/QuranReader/readingTracker';
import { ROUTES, PROTECTED_ROUTES } from '@/utils/navigation';
import { logButtonClick } from '@/utils/eventLogger';
import { removeUserIdCookie } from '@/utils/auth/login';

import useLogout from './useLogout';

vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('@/utils/auth/userDataSync', () => ({
  removeLastSyncAt: vi.fn(),
}));

vi.mock('@/redux/slices/QuranReader/bookmarks', () => ({
  clearBookmarks: vi.fn(() => ({ type: 'bookmarks/clearBookmarks' })),
}));

vi.mock('@/redux/slices/QuranReader/readingTracker', () => ({
  clearReadingTracker: vi.fn(() => ({ type: 'readingTracker/clearReadingTracker' })),
}));

vi.mock('@/utils/eventLogger', () => ({
  logButtonClick: vi.fn(),
}));

vi.mock('@/utils/auth/login', () => ({
  removeUserIdCookie: vi.fn(),
}));

describe('useLogout', () => {
  const mockReplace = vi.fn();
  const mockDispatch = vi.fn();
  const mockAuthContextLogout = vi.fn();
  const mockRemoveLastSyncAt = vi.mocked(removeLastSyncAt);
  const mockClearBookmarks = vi.mocked(clearBookmarks);
  const mockClearReadingTracker = vi.mocked(clearReadingTracker);
  const mockLogButtonClick = vi.mocked(logButtonClick);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      replace: mockReplace,
      pathname: '/',
      asPath: '/',
    } as any);
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useAuthContext).mockReturnValue({
      logout: mockAuthContextLogout,
      state: { user: { id: 'user-123' } },
    } as any);
  });

  it('performs local state clearance on logout', async () => {
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockAuthContextLogout).toHaveBeenCalled();
    expect(mockRemoveLastSyncAt).toHaveBeenCalled();
    expect(mockClearBookmarks).toHaveBeenCalled();
    expect(mockClearReadingTracker).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'bookmarks/clearBookmarks' });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'readingTracker/clearReadingTracker' });
  });

  it('redirects correctly based on current route', async () => {
    vi.mocked(useRouter).mockReturnValue({
      replace: mockReplace,
      pathname: PROTECTED_ROUTES[0], // e.g., /profile
      asPath: PROTECTED_ROUTES[0],
    } as any);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockReplace).toHaveBeenCalledWith(`${ROUTES.LOGOUT}?r=${ROUTES.HOME}`);
  });

  it('redirects to the current un-protected route if applicable', async () => {
    vi.mocked(useRouter).mockReturnValue({
      replace: mockReplace,
      pathname: '/about',
      asPath: '/about',
    } as any);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockReplace).toHaveBeenCalledWith(`${ROUTES.LOGOUT}?r=/about`);
  });

  it('logs event name if provided', async () => {
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current({ eventName: 'test_logout' });
    });

    expect(mockLogButtonClick).toHaveBeenCalledWith('test_logout');
  });

  it('does not redirect if redirectToLogin is true (allows manual redirect)', async () => {
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current({ redirectToLogin: true });
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
