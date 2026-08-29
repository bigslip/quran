import { describe, it, expect, vi } from 'vitest';
import { CacheAction, invalidateCache } from './cache';

describe('invalidateCache', () => {
  const mockMutate = vi.fn();
  const baseVerseRange = ['1:1', '1:2', '1:3'];

  it('handles missing cache keys without throwing TypeError', () => {
    const emptyCache = {} as any;

    expect(() => {
      invalidateCache({
        mutate: mockMutate,
        cache: emptyCache,
        verseKeys: baseVerseRange,
        note: { id: '1', body: 'Test note', ranges: ['1:1-1:3'] } as any,
        action: CacheAction.CREATE,
      });
    }).not.toThrow();

    expect(mockMutate).toHaveBeenCalled();
  });

  it('invalidates matching infinite cache keys when cache keys are present', () => {
    const mockCache = {
      keys: () => [
        '$inf$/api/v1/notes',
        '$inf$/api/v1/notes?page=1',
        'unrelated-key',
      ],
    } as any;

    invalidateCache({
      mutate: mockMutate,
      cache: mockCache,
      verseKeys: baseVerseRange,
      note: { id: '1', body: 'Test note', ranges: ['1:1-1:3'] } as any,
      action: CacheAction.UPDATE,
    });

    expect(mockMutate).toHaveBeenCalled();
  });
});
