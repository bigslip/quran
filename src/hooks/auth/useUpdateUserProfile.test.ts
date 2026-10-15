import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useUpdateUserProfile from './useUpdateUserProfile';
import { useSWRConfig } from 'swr';
import { useToast } from '@/dls/Toast/Toast';
import { updateUserProfile } from '@/utils/auth/authRequests';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key }),
}));

vi.mock('swr', () => ({
  useSWRConfig: vi.fn(),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: vi.fn(),
  ToastStatus: { Error: 'error', Success: 'success' },
}));

vi.mock('@/utils/auth/authRequests', () => ({
  updateUserProfile: vi.fn(),
}));

vi.mock('@/lib/sentry', () => ({
  logErrorToSentry: vi.fn(),
  addSentryBreadcrumb: vi.fn(),
}));

describe('useUpdateUserProfile', () => {
  const mockToast = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockToast);
    (useSWRConfig as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: mockMutate });
  });

  it('handles successful update', async () => {
    (updateUserProfile as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { success: true } });

    const { result } = renderHook(() => useUpdateUserProfile());

    await act(async () => {
      const response = await result.current.updateProfile({ firstName: 'Test' });
      expect(response).toEqual({ success: true });
    });

    expect(updateUserProfile).toHaveBeenCalledWith({ firstName: 'Test' });
    expect(mockToast).toHaveBeenCalledWith('profile:success.details', { status: 'success' });
    expect(mockMutate).toHaveBeenCalled();
  });

  it('handles validation error from api', async () => {
    (updateUserProfile as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: false },
      errors: { firstName: 'Required' },
    });

    const { result } = renderHook(() => useUpdateUserProfile());

    let response;
    await act(async () => {
      response = await result.current.updateProfile({ firstName: '' });
    });

    expect(response).toEqual({ errors: { firstName: 'Required' } });
    expect(mockToast).not.toHaveBeenCalled(); // Handled by caller or generic error
  });

  it('handles exception during update', async () => {
    (updateUserProfile as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUpdateUserProfile());

    let response;
    await act(async () => {
      response = await result.current.updateProfile({ firstName: 'Test' });
    });

    expect(response).toBeUndefined();
    expect(mockToast).toHaveBeenCalledWith('error.general', { status: 'error' });
  });

  it('updates loading state during request', async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (updateUserProfile as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(promise);

    const { result } = renderHook(() => useUpdateUserProfile());

    expect(result.current.isUpdating).toBe(false);

    let updatePromise: any;
    act(() => {
      updatePromise = result.current.updateProfile({ firstName: 'Test' });
    });

    expect(result.current.isUpdating).toBe(true);

    await act(async () => {
      resolvePromise({ data: { success: true } });
      await updatePromise;
    });

    expect(result.current.isUpdating).toBe(false);
  });
});
