import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useEmailNotificationSettings from './useEmailNotificationSettings';
import useFetchUserPreferences from '@/components/Notifications/hooks/useFetchUserPreferences';
import { ChannelTypeEnum } from '@novu/headless';

const mockMutate = vi.fn();
vi.mock('@/components/Notifications/hooks/useFetchUserPreferences', () => ({
  default: vi.fn(),
}));

const mockUpdatePreference = vi.fn();
vi.mock('./useUpdateEmailNotificationPreferences', () => ({
  default: () => ({
    updatePreference: mockUpdatePreference,
  }),
}));

const mockUserPreferences = [
  {
    template: {
      _id: 'template-1',
      critical: false,
      tags: ['QDC', 'daily-verse'],
    },
    preference: {
      channels: {
        [ChannelTypeEnum.EMAIL]: true,
      },
    },
  },
  {
    template: {
      _id: 'template-2',
      critical: false,
      tags: ['QDC', 'reminders'],
    },
    preference: {
      channels: {
        [ChannelTypeEnum.EMAIL]: false,
      },
    },
  },
];

describe('useEmailNotificationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useFetchUserPreferences as any).mockReturnValue({
      mutate: mockMutate,
      isMutating: false,
      error: null,
      userPreferences: mockUserPreferences,
      status: 'success',
    });
  });

  it('initializes and returns flattened preferences', () => {
    const { result } = renderHook(() => useEmailNotificationSettings());

    expect(mockMutate).toHaveBeenCalledWith(false);
    expect(result.current.preferences.length).toBe(2);
    expect(result.current.hasChanges).toBe(false);
  });

  it('tracks local changes and marks hasChanges as true when toggled', () => {
    const { result } = renderHook(() => useEmailNotificationSettings());

    act(() => {
      result.current.handleToggle(mockUserPreferences[0] as any, false);
    });

    expect(result.current.hasChanges).toBe(true);
  });

  it('saves updated preferences when handleSave is called', async () => {
    mockUpdatePreference.mockResolvedValue(undefined);
    const { result } = renderHook(() => useEmailNotificationSettings());

    act(() => {
      result.current.handleToggle(mockUserPreferences[0] as any, false);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockUpdatePreference).toHaveBeenCalledWith(
      expect.objectContaining({
        template: expect.objectContaining({ _id: 'template-1' }),
      }),
      false,
    );
  });
});
