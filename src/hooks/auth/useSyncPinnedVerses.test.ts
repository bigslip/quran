import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSelector, useDispatch } from 'react-redux';

import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import { selectPinnedVerses, setPinnedVerses, setServerIds } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getPinnedItems, syncPinnedItems } from '@/utils/auth/api';

import useSyncPinnedVerses from './useSyncPinnedVerses';
import * as userDataSyncUtils from '@/utils/auth/userDataSync';
import { PinnedItemTargetType } from 'types/PinnedItem';

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(() => ({
    state: { user: { id: 'test-user-123' } },
  })),
}));

vi.mock('@/hooks/auth/useIsLoggedIn', () => ({
  default: vi.fn(() => ({ isLoggedIn: true })),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn((selector) => selector()),
  useDispatch: vi.fn(),
  shallowEqual: vi.fn(),
}));

vi.mock('@/utils/auth/userDataSync', () => ({
  getLastSyncAt: vi.fn(),
}));

vi.mock('@/redux/slices/persistGateHydration', () => ({
  selectIsPersistGateHydrationComplete: vi.fn(),
}));

vi.mock('@/redux/slices/QuranReader/pinnedVerses', () => ({
  selectPinnedVerses: vi.fn(),
  setPinnedVerses: vi.fn((payload) => ({ type: 'pinnedVerses/setPinnedVerses', payload })),
  setServerIds: vi.fn((payload) => ({ type: 'pinnedVerses/setServerIds', payload })),
}));

vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: vi.fn(),
}));

vi.mock('@/utils/auth/api', () => ({
  getPinnedItems: vi.fn(),
  syncPinnedItems: vi.fn(),
}));

describe('useSyncPinnedVerses', () => {
  const mockGetLastSyncAt = vi.mocked(userDataSyncUtils.getLastSyncAt);
  const mockGetPinnedItems = vi.mocked(getPinnedItems);
  const mockSyncPinnedItems = vi.mocked(syncPinnedItems);
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    mockGetPinnedItems.mockResolvedValue({ data: { data: [] } } as any);
  });

  it('does not trigger sync if not hydrated', () => {
    vi.mocked(selectIsPersistGateHydrationComplete).mockReturnValue(false);
    vi.mocked(selectPinnedVerses).mockReturnValue([]);
    vi.mocked(selectQuranReaderStyles).mockReturnValue({ quranFont: 'v1', mushafLines: 15 } as any);
    
    mockGetLastSyncAt.mockReturnValue(null);

    renderHook(() => useSyncPinnedVerses());

    expect(mockGetPinnedItems).not.toHaveBeenCalled();
  });

  it('triggers sync, merges local pinned verses with remote, handles conflicting data (remote wins)', async () => {
    vi.mocked(selectIsPersistGateHydrationComplete).mockReturnValue(true);
    
    // Local has 1:1 and 2:2
    const localPinned = [
      { verseKey: '1:1', chapterNumber: 1, verseNumber: 1, timestamp: 1000 },
      { verseKey: '2:2', chapterNumber: 2, verseNumber: 2, timestamp: 2000 },
    ];
    vi.mocked(selectPinnedVerses).mockReturnValue(localPinned as any);
    vi.mocked(selectQuranReaderStyles).mockReturnValue({ quranFont: 'v1', mushafLines: 15 } as any);
    
    // Remote has 2:2 (conflict) and 3:3 (new from remote)
    mockGetPinnedItems.mockResolvedValue({
      data: {
        data: [
          {
            id: 'server-id-2-2',
            targetId: '2:2', // conflict with local
            metadata: { chapterNumber: 2, verseNumber: 2 },
            createdAt: new Date(3000).toISOString(),
          },
          {
            id: 'server-id-3-3',
            targetId: '3:3', // remote only
            metadata: { chapterNumber: 3, verseNumber: 3 },
            createdAt: new Date(4000).toISOString(),
          },
        ],
      },
    } as any);

    mockGetLastSyncAt.mockReturnValueOnce(null).mockReturnValue(new Date().toISOString());

    renderHook(() => useSyncPinnedVerses());

    // It should sync local-only items (1:1) to server
    await waitFor(() => {
      expect(mockSyncPinnedItems).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ targetId: '1:1' })
        ])
      );
    });

    // Verify it dispatches the merged result back to Redux
    // Remote wins for 2:2 (gets serverId), local 1:1 is kept, remote 3:3 is added
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        setPinnedVerses(
          expect.arrayContaining([
            expect.objectContaining({ verseKey: '1:1' }),
            expect.objectContaining({ verseKey: '2:2', serverId: 'server-id-2-2' }), // remote wins conflict
            expect.objectContaining({ verseKey: '3:3', serverId: 'server-id-3-3' }),
          ])
        )
      );
    });
    
    // Verify serverIds are updated
    expect(mockDispatch).toHaveBeenCalledWith(
      setServerIds({
        '2:2': 'server-id-2-2',
        '3:3': 'server-id-3-3',
      })
    );
  });
});
