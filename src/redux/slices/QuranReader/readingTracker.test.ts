import { describe, it, expect } from 'vitest';

import readingTrackerReducer, {
  clearReadingTracker,
  setLastReadVerse,
  ReadingTracker,
} from './readingTracker';

import ChaptersData from '@/types/ChaptersData';

describe('readingTracker slice', () => {
  const initialState: ReadingTracker = {
    lastReadVerse: { verseKey: null, chapterId: null, page: null, hizb: null },
    recentReadingSessions: {},
  };

  const mockChaptersData: ChaptersData = {
    '1': {
      id: '1',
      transliteratedName: 'Al-Fatihah',
      versesCount: 7,
    } as any,
    '2': {
      id: '2',
      transliteratedName: 'Al-Baqarah',
      versesCount: 286,
    } as any,
    '3': {
      id: '3',
      transliteratedName: 'Ali \'Imran',
      versesCount: 200,
    } as any,
  };

  describe('setLastReadVerse', () => {
    it('sets the initial last read verse and session timestamp', () => {
      const result = readingTrackerReducer(
        initialState,
        setLastReadVerse({
          lastReadVerse: { verseKey: '1:1', chapterId: '1', page: '1', hizb: '1' },
          chaptersData: mockChaptersData,
          timestamp: 1000,
        }),
      );

      expect(result.lastReadVerse.verseKey).toBe('1:1');
      expect(result.recentReadingSessions['1:1']).toBe(1000);
    });

    it('updates existing verse key session to the top with new timestamp', () => {
      const stateWithSessions: ReadingTracker = {
        lastReadVerse: { verseKey: '1:1', chapterId: '1', page: '1', hizb: '1' },
        recentReadingSessions: {
          '2:1': 500,
          '1:1': 200,
        },
      };

      const result = readingTrackerReducer(
        stateWithSessions,
        setLastReadVerse({
          lastReadVerse: { verseKey: '1:1', chapterId: '1', page: '1', hizb: '1' },
          chaptersData: mockChaptersData,
          timestamp: 1500,
        }),
      );

      expect(result.recentReadingSessions['1:1']).toBe(1500);
      const keys = Object.keys(result.recentReadingSessions);
      expect(keys[0]).toBe('1:1');
    });

    it('replaces close adjacent verse within session boundary (same session)', () => {
      const stateWithSessions: ReadingTracker = {
        lastReadVerse: { verseKey: '2:1', chapterId: '2', page: '2', hizb: '1' },
        recentReadingSessions: {
          '2:1': 1000,
        },
      };

      const result = readingTrackerReducer(
        stateWithSessions,
        setLastReadVerse({
          lastReadVerse: { verseKey: '2:3', chapterId: '2', page: '2', hizb: '1' },
          chaptersData: mockChaptersData,
          timestamp: 1100,
        }),
      );

      expect(result.recentReadingSessions['2:1']).toBeUndefined();
      expect(result.recentReadingSessions['2:3']).toBe(1100);
    });
  });

  describe('clearReadingTracker', () => {
    it('should reset reading tracker to initial state when data exists', () => {
      const stateWithData: ReadingTracker = {
        lastReadVerse: { verseKey: '2:255', chapterId: '2', page: '42', hizb: '3' },
        recentReadingSessions: {
          '1:1': 1234567890,
          '2:255': 1234567891,
          '36:1': 1234567892,
        },
      };

      const result = readingTrackerReducer(stateWithData, clearReadingTracker());

      expect(result).toEqual(initialState);
      expect(result.lastReadVerse.verseKey).toBeNull();
      expect(result.recentReadingSessions).toEqual({});
    });

    it('should return initial state when already empty', () => {
      const result = readingTrackerReducer(initialState, clearReadingTracker());

      expect(result).toEqual(initialState);
    });

    it('should clear all reading sessions', () => {
      const stateWithSessions: ReadingTracker = {
        lastReadVerse: { verseKey: null, chapterId: null, page: null, hizb: null },
        recentReadingSessions: {
          '1:1': 1000,
          '2:1': 2000,
          '3:1': 3000,
        },
      };

      const result = readingTrackerReducer(stateWithSessions, clearReadingTracker());

      expect(Object.keys(result.recentReadingSessions)).toHaveLength(0);
    });
  });
});
