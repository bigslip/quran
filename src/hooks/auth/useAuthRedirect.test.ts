import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import useAuthRedirect from './useAuthRedirect';
import useAuthData from './useAuthData';

import QueryParam from '@/types/QueryParam';
import { ROUTES } from '@/utils/navigation';

vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/utils/auth/constants', () => ({
  SSO_ENABLED: true,
}));

vi.mock('./useAuthData', () => ({
  default: vi.fn(),
}));

describe('useAuthRedirect', () => {
  const replaceMock = vi.fn();
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      replace: replaceMock,
      push: pushMock,
      pathname: '/',
      asPath: '/',
      query: {},
    } as any);
    
    vi.mocked(useAuthData).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      profileLoaded: false,
      error: null,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects via push when no token is provided', () => {
    const { result } = renderHook(() => useAuthRedirect());
    result.current.redirectWithToken('/profile', '');
    
    expect(pushMock).toHaveBeenCalledWith('/profile');
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('redirects via replace to ROUTES.AUTH when token is provided and SSO_ENABLED is true', () => {
    const { result } = renderHook(() => useAuthRedirect());
    result.current.redirectWithToken('/profile', 'fake-token');
    
    expect(replaceMock).toHaveBeenCalledWith(
      `${ROUTES.AUTH}?${QueryParam.TOKEN}=fake-token&${QueryParam.REDIRECT_TO}=/profile`
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
  
  it('redirects unauthenticated users from /profile to /login?r=%2Fprofile', () => {
    vi.mocked(useRouter).mockReturnValue({
      replace: replaceMock,
      push: pushMock,
      pathname: '/profile',
      asPath: '/profile',
      query: {},
    } as any);

    renderHook(() => useAuthRedirect());
    expect(replaceMock).toHaveBeenCalledWith('/login?r=%2Fprofile');
  });

  it('redirects authenticated users from /login to /', () => {
    vi.mocked(useRouter).mockReturnValue({
      replace: replaceMock,
      push: pushMock,
      pathname: ROUTES.LOGIN,
      asPath: ROUTES.LOGIN,
      query: {},
    } as any);
    
    vi.mocked(useAuthData).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      profileLoaded: true,
      error: null,
    } as any);

    renderHook(() => useAuthRedirect());
    expect(replaceMock).toHaveBeenCalledWith('/');
  });
});
