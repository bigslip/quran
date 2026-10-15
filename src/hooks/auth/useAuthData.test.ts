import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useSWR from 'swr';
import useAuthData from './useAuthData';
import { AuthState } from '@/types/auth/AuthState';

const dispatchMock = vi.fn();
const stateMock: AuthState = {
  user: undefined,
  isProfileComplete: true,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  profileLoaded: false,
};

vi.mock('swr', () => ({
  default: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => ({
    state: stateMock,
    dispatch: dispatchMock,
  }),
}));

vi.mock('./useIsLoggedIn', () => ({
  default: () => ({ isLoggedIn: true }),
}));

vi.mock('@/utils/auth/api', () => ({
  getUserProfile: vi.fn(),
  isTokenRefreshInProgress: vi.fn().mockReturnValue(false),
}));

vi.mock('@/lib/sentry', () => ({
  logErrorToSentry: vi.fn(),
  addSentryBreadcrumb: vi.fn(),
}));

describe('useAuthData', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { isTokenRefreshInProgress } = await import('@/utils/auth/api');
    vi.mocked(isTokenRefreshInProgress).mockReturnValue(false);
    
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: false,
      mutate: vi.fn(),
    } as any);
  });

  it('dispatches SET_USER_DATA when data is fetched', async () => {
    vi.mocked(useSWR).mockReturnValue({
      data: { id: '1', firstName: 'Test' },
      error: undefined,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    renderHook(() => useAuthData());

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'SET_USER_DATA',
        payload: { id: '1', firstName: 'Test' },
      });
    });
  });

  it('handles 401 unauthorized errors', async () => {
    const error401 = { status: 401 };
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: error401,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    renderHook(() => useAuthData());

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'SET_AUTHENTICATED',
        payload: false,
      });
    });
  });

  it('skips error handling when token refresh is in progress', async () => {
    const error401 = { status: 401 };
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: error401,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    const { isTokenRefreshInProgress } = await import('@/utils/auth/api');
    vi.mocked(isTokenRefreshInProgress).mockReturnValue(true);

    renderHook(() => useAuthData());

    await waitFor(() => {
      // The error handling logic is skipped, so dispatch is not called with false.
      // But it might be called with SET_LOADING because !userData.
      expect(dispatchMock).not.toHaveBeenCalledWith({
        type: 'SET_AUTHENTICATED',
        payload: false,
      });
    });
  });
});
