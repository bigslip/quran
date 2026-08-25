import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useUpdateEmailNotificationPreferences from './useUpdateEmailNotificationPreferences';
import { useHeadlessService } from '@/components/Notifications/hooks/useHeadlessService';
import { useToast } from '@/dls/Toast/Toast';
import { ChannelTypeEnum } from '@novu/headless';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/Notifications/hooks/useHeadlessService', () => ({
  useHeadlessService: vi.fn(),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: vi.fn(),
  ToastStatus: { Error: 'error', Success: 'success' },
}));

vi.mock('@/lib/sentry', () => ({
  logErrorToSentry: vi.fn(),
}));

vi.mock('@/utils/eventLogger', () => ({
  logValueChange: vi.fn(),
}));

describe('useUpdateEmailNotificationPreferences', () => {
  const mockToast = vi.fn();
  const mockUpdateUserPreferences = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockToast);
    (useHeadlessService as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      headlessService: {
        updateUserPreferences: mockUpdateUserPreferences,
      },
    });
  });

  it('handles successful preference update', async () => {
    mockUpdateUserPreferences.mockImplementationOnce(({ onSuccess }: any) => {
      onSuccess();
    });

    const { result } = renderHook(() => useUpdateEmailNotificationPreferences());
    const preference = { template: { _id: 'template1', name: 'Test Template' } } as any;

    await act(async () => {
      await result.current.updatePreference(preference, true);
    });

    expect(mockUpdateUserPreferences).toHaveBeenCalledWith(expect.objectContaining({
      templateId: 'template1',
      checked: true,
      channelType: ChannelTypeEnum.EMAIL,
    }));
    expect(mockToast).toHaveBeenCalledWith('profile:success.notifications', { status: 'success' });
  });

  it('handles failed preference update', async () => {
    mockUpdateUserPreferences.mockImplementationOnce(({ onError }: any) => {
      onError(new Error('Failed'));
    });

    const { result } = renderHook(() => useUpdateEmailNotificationPreferences());
    const preference = { template: { _id: 'template1', name: 'Test Template' } } as any;

    await expect(result.current.updatePreference(preference, true)).rejects.toThrow('Failed');
    expect(mockToast).toHaveBeenCalledWith('error.general', { status: 'error' });
  });
});
