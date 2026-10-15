import React from 'react';

import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ReadingSection from './index';

import BookmarkType from '@/types/BookmarkType';

vi.mock('swr', () => ({
  default: (key: any) => {
    if (!key) return { data: undefined };
    if (typeof key === 'string' && key.startsWith('first-verse-')) {
      return { data: (globalThis as any).mockSWRFirstVerse };
    }
    if (typeof key === 'string' && key.startsWith('verse-to-page-')) {
      return { data: (globalThis as any).mockSWRPage };
    }
    if (typeof key === 'string' && key.startsWith('reading-bookmark')) {
      return { data: (globalThis as any).mockReadingBookmark };
    }
    return { data: undefined };
  },
}));

vi.mock('next-translate/useTranslation', () => ({ default: () => ({ t: (k: string) => k }) }));

vi.mock('@/components/HomePage/ReadingSection/SanctuaryResumeCard', () => ({
  default: ({ pageNumber, surahNumber, verseNumber, isContinueReading }: any) => (
    <div
      data-testid="sanctuary-resume-action"
      data-page-number={pageNumber ?? ''}
      data-surah={surahNumber}
      data-verse={verseNumber ?? ''}
      data-continue={isContinueReading ? 'true' : 'false'}
    />
  ),
}));

vi.mock('@/components/HomePage/ReadingSection/SpiritualHabitWidget', () => ({
  default: ({ streak, goal }: any) => (
    <div data-testid="spiritual-habit-widget" data-streak={streak ?? ''} data-goal={goal ?? ''} />
  ),
}));

vi.mock('@/components/HomePage/ReadingSection/AnnouncementPill', () => ({
  default: () => <div data-testid="announcement-pill" />,
}));

vi.mock('@/hooks/auth/useGetRecentlyReadVerseKeys', () => ({
  default: () => ({ recentlyReadVerseKeys: [] }),
}));

vi.mock('@/hooks/auth/useGetStreakWithMetadata', () => ({
  default: () => ({ goal: null, streak: 5, currentActivityDay: null }),
}));

vi.mock('@/redux/slices/session', () => ({ selectUserState: (s: any) => s.session }));
vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: (s: any) => s.quranReaderStyles,
}));
vi.mock('react-redux', () => {
  const defaultState = {
    session: { isGuest: true, isFirstTimeGuest: false },
    quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
    guestBookmark: { readingBookmark: 'page:2:1:1' },
  } as any;
  return {
    useSelector: (selector: (s: any) => any) =>
      selector((globalThis as any).mockState?.current || defaultState),
  };
});
vi.mock('@/utils/verse', () => ({
  getVersePageNumber: vi.fn(async () => 3),
  getPageFirstVerseKey: vi.fn(async () => ({ surahNumber: 2, verseNumber: 255 })),
}));
vi.mock('@/utils/auth/api', () => ({
  getReadingBookmark: vi.fn(async () => (globalThis as any).mockReadingBookmark),
}));
vi.mock('@/hooks/auth/useGlobalReadingBookmark', () => ({
  default: () => ({ readingBookmark: (globalThis as any).mockReadingBookmark }),
}));
vi.mock('@/hooks/useMappedBookmark', () => ({
  default: ({ bookmark }: any) => ({
    needsMapping: false,
    effectivePageNumber: bookmark?.type === 'page' ? bookmark?.key : null,
    effectiveAyahVerseKey:
      bookmark?.type === 'ayah'
        ? { surahNumber: bookmark?.key, verseNumber: bookmark?.verseNumber }
        : null,
    isLoading: false,
    bookmarkMushafId: bookmark?.mushafId || 1,
  }),
}));

describe('ReadingSection Sanctuary Ribbon', () => {
  beforeEach(() => cleanup());

  it('renders SanctuaryResumeCard with resolved page from extended bookmark', async () => {
    (globalThis as any).mockSWRFirstVerse = { surahNumber: 1, verseNumber: 1 };
    (globalThis as any).mockState = {
      current: {
        session: { isGuest: true, isFirstTimeGuest: false },
        quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
        guestBookmark: {
          readingBookmark: {
            key: 2,
            type: BookmarkType.Page,
            mushafId: 1,
            createdAt: new Date().toISOString(),
          },
        },
      },
    };
    render(<ReadingSection />);
    await waitFor(() => {
      const el = screen.getByTestId('sanctuary-resume-action');
      expect(el.getAttribute('data-page-number')).toBe('2');
      expect(el.getAttribute('data-surah')).toBe('1');
      expect(el.getAttribute('data-verse')).toBe('1');
      expect(el.getAttribute('data-continue')).toBe('true');
    });
    expect(screen.getByTestId('spiritual-habit-widget')).toBeTruthy();
    expect(screen.getByTestId('announcement-pill')).toBeTruthy();
  });

  it('renders SanctuaryResumeCard linking to verse for ayah bookmark', async () => {
    (globalThis as any).mockState = {
      current: {
        session: { isGuest: true, isFirstTimeGuest: false },
        quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
        guestBookmark: {
          readingBookmark: {
            key: 60,
            type: BookmarkType.Ayah,
            verseNumber: 3,
            mushafId: 1,
            createdAt: new Date().toISOString(),
          },
        },
      },
    };
    render(<ReadingSection />);
    await waitFor(() => {
      const el = screen.getByTestId('sanctuary-resume-action');
      expect(el.getAttribute('data-page-number')).toBe('');
      expect(el.getAttribute('data-surah')).toBe('60');
      expect(el.getAttribute('data-verse')).toBe('3');
      expect(el.getAttribute('data-continue')).toBe('true');
    });
  });

  it('uses logged-in user reading bookmark over guest bookmark', async () => {
    (globalThis as any).mockReadingBookmark = {
      key: 60,
      type: BookmarkType.Ayah,
      verseNumber: 3,
    };
    (globalThis as any).mockState = {
      current: {
        session: { isGuest: false, isFirstTimeGuest: false },
        quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 },
        guestBookmark: {
          readingBookmark: {
            key: 2,
            type: BookmarkType.Page,
            mushafId: 1,
            createdAt: new Date().toISOString(),
          },
        },
      },
    };
    render(<ReadingSection />);
    await waitFor(() => {
      const el = screen.getByTestId('sanctuary-resume-action');
      expect(el.getAttribute('data-page-number')).toBe('');
      expect(el.getAttribute('data-surah')).toBe('60');
      expect(el.getAttribute('data-verse')).toBe('3');
      expect(el.getAttribute('data-continue')).toBe('true');
    });
  });
});
