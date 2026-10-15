import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDispatch, useSelector } from 'react-redux';
import useTranslation from 'next-translate/useTranslation';

import { useToast } from '@/dls/Toast/Toast';
import { addOrUpdateUserPreference } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import PreferenceGroup from 'types/auth/PreferenceGroup';

import usePersistPreferenceGroup from './usePersistPreferenceGroup';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
  shallowEqual: vi.fn(),
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranFont: vi.fn(),
  selectQuranMushafLines: vi.fn(),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: vi.fn(),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: vi.fn(),
  ToastStatus: { Warning: 'warning' },
}));

vi.mock('@/utils/auth/api', () => ({
  addOrUpdateUserPreference: vi.fn(),
  throwIfResponseContainsError: vi.fn(),
}));

vi.mock('@/utils/auth/login', () => ({
  isLoggedIn: vi.fn(),
}));

describe('usePersistPreferenceGroup', () => {
  const mockDispatch = vi.fn();
  const mockUseSelector = vi.mocked(useSelector);
  const mockToast = vi.fn();
  const mockAddOrUpdateUserPreference = vi.mocked(addOrUpdateUserPreference);
  const mockIsLoggedIn = vi.mocked(isLoggedIn);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    mockUseSelector.mockReturnValue('test-value');
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(useTranslation).mockReturnValue({ t: vi.fn((key) => key) } as any);
  });

  describe('onSettingsChange', () => {
    it('dispatches action and calls API when logged in', async () => {
      mockIsLoggedIn.mockReturnValue(true);
      mockAddOrUpdateUserPreference.mockResolvedValue({});

      const { result } = renderHook(() => usePersistPreferenceGroup());

      const action = { type: 'test/action' };
      const undoAction = { type: 'test/undoAction' };
      const successCallback = vi.fn();

      await act(async () => {
        result.current.actions.onSettingsChange(
          'theme',
          'dark',
          action,
          undoAction,
          PreferenceGroup.THEME,
          successCallback,
        );
      });

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(mockAddOrUpdateUserPreference).toHaveBeenCalledWith('theme', 'dark', PreferenceGroup.THEME, undefined);
      
      await waitFor(() => {
        expect(successCallback).toHaveBeenCalled();
      });
    });

    it('only dispatches action when not logged in', async () => {
      mockIsLoggedIn.mockReturnValue(false);

      const { result } = renderHook(() => usePersistPreferenceGroup());

      const action = { type: 'test/action' };
      const undoAction = { type: 'test/undoAction' };
      const successCallback = vi.fn();

      await act(async () => {
        result.current.actions.onSettingsChange(
          'theme',
          'dark',
          action,
          undoAction,
          PreferenceGroup.THEME,
          successCallback,
        );
      });

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(mockAddOrUpdateUserPreference).not.toHaveBeenCalled();
      expect(successCallback).toHaveBeenCalled();
    });

    it('shows toast and does not call success callback if API fails', async () => {
      mockIsLoggedIn.mockReturnValue(true);
      mockAddOrUpdateUserPreference.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => usePersistPreferenceGroup());

      const action = { type: 'test/action' };
      const undoAction = { type: 'test/undoAction' };
      const successCallback = vi.fn();

      await act(async () => {
        result.current.actions.onSettingsChange(
          'theme',
          'dark',
          action,
          undoAction,
          PreferenceGroup.THEME,
          successCallback,
        );
      });

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(mockAddOrUpdateUserPreference).toHaveBeenCalledWith('theme', 'dark', PreferenceGroup.THEME, undefined);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('error.pref-persist-fail', expect.any(Object));
        expect(successCallback).not.toHaveBeenCalled();
      });
    });
  });

  describe('onSettingsChangeWithoutDispatch', () => {
    it('calls API when logged in', async () => {
      mockIsLoggedIn.mockReturnValue(true);
      mockAddOrUpdateUserPreference.mockResolvedValue({});

      const { result } = renderHook(() => usePersistPreferenceGroup());
      const callback = vi.fn();

      await act(async () => {
        result.current.actions.onSettingsChangeWithoutDispatch(
          'theme',
          'dark',
          PreferenceGroup.THEME,
          callback,
        );
      });

      expect(mockAddOrUpdateUserPreference).toHaveBeenCalledWith('theme', 'dark', PreferenceGroup.THEME, undefined);
      await waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  describe('onXstateSettingsChange', () => {
    it('calls action and API when logged in', async () => {
      mockIsLoggedIn.mockReturnValue(true);
      mockAddOrUpdateUserPreference.mockResolvedValue({});

      const { result } = renderHook(() => usePersistPreferenceGroup());
      const action = vi.fn();
      const undoAction = vi.fn();
      const successCallback = vi.fn();

      await act(async () => {
        result.current.actions.onXstateSettingsChange(
          'theme',
          'dark',
          action,
          undoAction,
          PreferenceGroup.THEME,
          successCallback,
        );
      });

      expect(action).toHaveBeenCalled();
      expect(mockAddOrUpdateUserPreference).toHaveBeenCalledWith('theme', 'dark', PreferenceGroup.THEME, undefined);
      await waitFor(() => {
        expect(successCallback).toHaveBeenCalled();
      });
    });
  });
});
