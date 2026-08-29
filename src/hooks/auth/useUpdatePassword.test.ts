import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useUpdatePassword from './useUpdatePassword';
import { updatePassword } from '@/utils/auth/authRequests';

const mockToast = vi.fn();
vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => mockToast,
  ToastStatus: { Success: 'success', Error: 'error' },
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key }),
}));

vi.mock('@/lib/sentry', () => ({
  addSentryBreadcrumb: vi.fn(),
  logErrorToSentry: vi.fn(),
}));

vi.mock('@/utils/auth/authRequests', () => ({
  updatePassword: vi.fn(),
}));

describe('useUpdatePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleData = {
    currentPassword: 'OldPassword123!',
    newPassword: 'NewPassword123!',
    confirmPassword: 'NewPassword123!',
  };

  it('updates password successfully and displays success toast', async () => {
    (updatePassword as any).mockResolvedValue({
      data: { success: true },
      errors: undefined,
    });

    const { result } = renderHook(() => useUpdatePassword());

    let response;
    await act(async () => {
      response = await result.current.updatePassword(sampleData);
    });

    expect(response).toEqual({ success: true });
    expect(mockToast).toHaveBeenCalledWith('profile:success.password', { status: 'success' });
    expect(result.current.isUpdating).toBe(false);
  });

  it('returns validation errors when update fails with validation errors', async () => {
    const mockErrors = { newPassword: 'Password is too short' };
    (updatePassword as any).mockResolvedValue({
      data: { success: false },
      errors: mockErrors,
    });

    const { result } = renderHook(() => useUpdatePassword());

    let response;
    await act(async () => {
      response = await result.current.updatePassword(sampleData);
    });

    expect(response).toEqual({ errors: mockErrors });
    expect(mockToast).not.toHaveBeenCalled();
    expect(result.current.isUpdating).toBe(false);
  });

  it('shows error toast when API throws an unexpected exception', async () => {
    (updatePassword as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUpdatePassword());

    let response;
    await act(async () => {
      response = await result.current.updatePassword(sampleData);
    });

    expect(response).toBeUndefined();
    expect(mockToast).toHaveBeenCalledWith('error.general', { status: 'error' });
    expect(result.current.isUpdating).toBe(false);
  });
});
