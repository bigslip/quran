import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ProfilePage from './index';

import { useToast } from '@/dls/Toast/Toast';
import * as api from '@/utils/auth/api';
import { updateUserProfile } from '@/utils/auth/authRequests';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('next-translate/Trans', () => ({
  default: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/profile',
    asPath: '/profile',
  }),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: vi.fn(),
  ToastStatus: { Error: 'error', Success: 'success' },
}));

vi.mock('swr', () => ({
  useSWRConfig: () => ({
    mutate: vi.fn(),
  }),
}));

vi.mock('@/hooks/auth/useAuthData', () => ({
  default: () => ({
    userData: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      isPasswordSet: true,
      avatars: { large: 'http://example.com/avatar.jpg' },
    },
  })
}));

vi.mock('@/utils/auth/authRequests', () => ({
  updateUserProfile: vi.fn(),
}));

vi.mock('@/utils/auth/api', () => ({
  deleteAccount: vi.fn(),
}));

// SVGR mocks
vi.mock('@/icons/default-user.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/show.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/hide.svg', () => ({ default: () => <svg /> }));
vi.mock('@/icons/close.svg', () => ({ default: () => <svg /> }));

vi.mock('@/components/HeaderNavigation', () => ({
  default: ({ title }: any) => <div data-testid="header-navigation">{title}</div>
}));
vi.mock('@/components/Auth/withAuth', () => ({
  default: (Component: any) => Component,
}));

vi.mock('@/components/Notifications/hooks/useHeadlessService', () => ({
  HeadlessServiceProvider: ({ children }: any) => <div>{children}</div>,
  useHeadlessService: () => ({
    headlessService: { updateUserPreferences: vi.fn() }
  })
}));
vi.mock('@/hooks/useGetRamadanChallengeStatus', () => ({
  default: () => ({ isEnrolled: false })
}));

describe('ProfilePage', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockToast);
    (updateUserProfile as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders profile sections correctly', () => {
    render(<ProfilePage />);
    expect(screen.getByText('my-profile')).toBeTruthy();
    expect(screen.getByText('personalization')).toBeTruthy();
    expect(screen.getByText('edit-details')).toBeTruthy();
    expect(screen.getByText('change-password')).toBeTruthy();
  });

  it('handles name edits, shows spinner and toast on success', async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (updateUserProfile as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(promise);

    render(<ProfilePage />);
    
    const firstNameInput = screen.getByPlaceholderText('login:first-name-placeholder');
    
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Jane');

    const saveChangesButtons = screen.getAllByRole('button', { name: /save-changes/i });
    const editDetailsSaveButton = saveChangesButtons[0];

    await userEvent.click(editDetailsSaveButton);

    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);

    await waitFor(() => {
      resolvePromise({ data: { success: true } });
    });

    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Jane' }));
      expect(mockToast).toHaveBeenCalledWith('profile:success.details', { status: 'success' });
    });
  });

  it('handles avatar upload interactions with spinner', async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (updateUserProfile as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(promise);

    render(<ProfilePage />);
    
    const fileInput = screen.getByTestId('auth-update-profile-input');
    const file = new File(['mock-image-content'], 'avatar.png', { type: 'image/png' });
    
    await userEvent.upload(fileInput, file);

    // Verify spinner is shown during upload request
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);

    await waitFor(() => {
      resolvePromise({ data: { success: true } });
    });

    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalled();
    });
  });

  it('opens account deletion confirmation modal', async () => {
    render(<ProfilePage />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete-account/i });
    await userEvent.click(deleteButtons[0]);

    expect(screen.getByText('delete-confirmation.title')).toBeTruthy();
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'delete-confirmation.confirmation-text');

    const confirmDeleteButton = screen.getByRole('button', { name: /delete-confirmation.action-text/i });
    expect(confirmDeleteButton).toBeTruthy();

    (api.deleteAccount as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});
    await userEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(api.deleteAccount).toHaveBeenCalled();
    });
  });
});
