import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useProfilePictureForm from './useProfilePictureForm';
import * as useUpdateUserProfileMock from '@/hooks/auth/useUpdateUserProfile';
import { useToast } from '@/dls/Toast/Toast';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key }),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: vi.fn(),
  ToastStatus: { Error: 'error', Success: 'success' },
}));

vi.mock('@/hooks/auth/useUpdateUserProfile', () => ({
  default: vi.fn(),
}));

// We also need to mock useImageUpload if we can't test its internals easily, but let's try to mock the updateProfile function first.
// Actually, `useImageUpload` handles `handleFileSelect`, etc.
let mockIsLoading = false;
export const setMockIsLoading = (val: boolean) => {
  mockIsLoading = val;
};

vi.mock('../useImageUpload', () => ({
  default: vi.fn(({ uploadFunction, removeFunction, onError }: any) => ({
    get isLoading() { return mockIsLoading; },
    fileInputRef: { current: null },
    handleUploadPicture: vi.fn(),
    handleFileSelect: vi.fn(),
    handleRemovePicture: vi.fn(),
    translationParams: { maxSize: '5', allowedFormats: 'jpg, png' },
    triggerUpload: uploadFunction,
    triggerRemove: removeFunction,
    triggerError: onError,
  })),
}));

import * as useImageUploadMock from '../useImageUpload';

describe('useProfilePictureForm', () => {
  const mockToast = vi.fn();
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockToast);
    (useUpdateUserProfileMock.default as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      updateProfile: mockUpdateProfile,
      isUpdating: false,
    });
  });

  it('handles successful upload', async () => {
    mockUpdateProfile.mockResolvedValueOnce({ success: true });
    
    let triggerUpload: any;
    (useImageUploadMock.default as any).mockImplementationOnce(({ uploadFunction }: any) => {
      triggerUpload = uploadFunction;
      return { isLoading: false };
    });

    renderHook(() => useProfilePictureForm());
    
    await act(async () => {
      await triggerUpload('base64string');
    });

    expect(mockUpdateProfile).toHaveBeenCalledWith({ avatar: 'base64string' });
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('handles upload validation error', async () => {
    mockUpdateProfile.mockResolvedValueOnce({ errors: { avatar: 'Invalid avatar' } });
    
    let triggerUpload: any;
    (useImageUploadMock.default as any).mockImplementationOnce(({ uploadFunction }: any) => {
      triggerUpload = uploadFunction;
      return { isLoading: false };
    });

    renderHook(() => useProfilePictureForm());
    
    await act(async () => {
      await triggerUpload('base64string');
    });

    expect(mockToast).toHaveBeenCalledWith('Invalid avatar', { status: 'error' });
  });

  it('handles remove success', async () => {
    mockUpdateProfile.mockResolvedValueOnce({ success: true });
    
    let triggerRemove: any;
    (useImageUploadMock.default as any).mockImplementationOnce(({ removeFunction }: any) => {
      triggerRemove = removeFunction;
      return { isLoading: false };
    });

    renderHook(() => useProfilePictureForm());
    
    await act(async () => {
      await triggerRemove();
    });

    expect(mockUpdateProfile).toHaveBeenCalledWith({ removeAvatar: true });
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('reflects isLoading from useImageUpload as isProcessing', () => {
    setMockIsLoading(true);
    const { result } = renderHook(() => useProfilePictureForm());
    expect(result.current.isProcessing).toBe(true);
    setMockIsLoading(false);
  });
});
