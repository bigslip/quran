import { describe, it, expect } from 'vitest';

import { getNextChapterNumber, getPreviousChapterNumber, getChapterIdBySlugOrId } from './chapter';
import REVELATION_ORDER from './revelationOrder';

describe('chapter navigation (standard order)', () => {
  it('gets next chapter in standard order', () => {
    expect(getNextChapterNumber(1, false)).toBe(2);
    expect(getNextChapterNumber(114, false)).toBeNull();
  });

  it('gets previous chapter in standard order', () => {
    expect(getPreviousChapterNumber(2, false)).toBe(1);
    expect(getPreviousChapterNumber(1, false)).toBeNull();
  });
});

describe('chapter navigation (revelation order)', () => {
  const first = REVELATION_ORDER[0];
  const second = REVELATION_ORDER[1];
  const last = REVELATION_ORDER[REVELATION_ORDER.length - 1];

  it('gets next chapter in revelation order', () => {
    expect(getNextChapterNumber(first, true)).toBe(second);
    expect(getNextChapterNumber(last, true)).toBeNull();
  });

  it('gets previous chapter in revelation order', () => {
    expect(getPreviousChapterNumber(second, true)).toBe(first);
    expect(getPreviousChapterNumber(first, true)).toBeNull();
  });
});

describe('getChapterIdBySlugOrId', () => {
  const mockChaptersData = {
    '1': { id: 1, slug: 'al-fatihah', transliteratedName: 'Al-Fatihah' } as any,
    '2': { id: 2, slug: 'al-baqarah', transliteratedName: 'Al-Baqarah' } as any,
    '16': { id: 16, slug: 'an-nahl', transliteratedName: 'An-Nahl' } as any,
  };

  it('resolves numeric chapter IDs directly', () => {
    expect(getChapterIdBySlugOrId(mockChaptersData, '16')).toBe('16');
    expect(getChapterIdBySlugOrId(mockChaptersData, '2')).toBe('2');
  });

  it('resolves lowercase and mixed-case chapter slugs in-memory', () => {
    expect(getChapterIdBySlugOrId(mockChaptersData, 'an-nahl')).toBe('16');
    expect(getChapterIdBySlugOrId(mockChaptersData, 'An-Nahl')).toBe('16');
    expect(getChapterIdBySlugOrId(mockChaptersData, 'al-baqarah')).toBe('2');
  });

  it('returns undefined for nonexistent slugs', () => {
    expect(getChapterIdBySlugOrId(mockChaptersData, 'unknown-surah')).toBeUndefined();
  });
});
