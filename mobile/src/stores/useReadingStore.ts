import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { readingStorage } from './readingStorage.ts';
import type { AppTheme } from '../theme/colors.ts';

export interface ReadingState {
  lastReadChapterId: number;
  lastReadVerseNumber: number;
  lastReadChapterNameFa: string;
  lastReadSurah?: number;
  lastReadAyah?: number;
  lastReadPage?: number;
  lastReadJuz?: number;
  lastReadTimestamp?: number;
  fontScale: number;
  /** Active reading theme across the application: 'dark' | 'emerald' | 'sepia' | 'light'. */
  theme: AppTheme;
  /** Text encoding / orthography standard: 'uthmani' (Madani Uthmani script) vs 'indopak' (Indo-Pakistani script encoding). */
  quranScript: 'uthmani' | 'indopak';
  selectedReciterId: number;
  showWordByWord: boolean;
  showTranslation: boolean;

  // Dual-mode reading engine state
  viewMode: 'continuous' | 'mushaf';
  /** Display typeface / rendering font: 'hafs' (Madani QPC Hafs font) vs 'indopak' (IndoPak Nastaliq font). */
  quranFont: 'hafs' | 'indopak';
  activeVerseKey: string | null;
  isPlaying: boolean;
  activeTranslation: 'makarem' | 'ansarian' | 'both';

  // Reciter, multi-translation, and word-by-word linguistics state
  selectedTranslationIds: number[];
  wordByWordLocale: 'fa' | 'en';
  wordByWordDisplay: 'inline' | 'tooltip';
  wordByWordContentType: ('translation' | 'transliteration')[];

  // Tafsir offline usage nudge state
  tafsirOpenCount: number;
  isTafsirNudgeDismissed: boolean;

  setLastRead: (
    chapterId: number,
    verseNumber: number,
    chapterNameFa: string,
    pageNumber?: number,
    juzNumber?: number,
  ) => void;
  setFontScale: (scale: number) => void;
  setTheme: (theme: AppTheme) => void;
  /** Updates the Quran text encoding standard ('uthmani' vs 'indopak') and synchronizes display typeface. */
  setQuranScript: (script: 'uthmani' | 'indopak') => void;
  setSelectedReciterId: (id: number) => void;
  toggleWordByWord: () => void;
  toggleTranslation: () => void;

  // Dual-mode reading engine setters
  setViewMode: (mode: 'continuous' | 'mushaf') => void;
  /** Updates the Quran display typeface ('hafs' vs 'indopak') and synchronizes script standard. */
  setQuranFont: (font: 'hafs' | 'indopak') => void;
  setActiveVerseKey: (key: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setActiveTranslation: (translation: 'makarem' | 'ansarian' | 'both') => void;

  // Reciter, multi-translation, and word-by-word setters
  setSelectedTranslationIds: (ids: number[]) => void;
  toggleSelectedTranslationId: (id: number) => void;
  setWordByWordLocale: (locale: 'fa' | 'en') => void;
  setWordByWordDisplay: (display: 'inline' | 'tooltip') => void;
  setWordByWordContentType: (types: ('translation' | 'transliteration')[]) => void;

  // Tafsir offline usage nudge actions
  incrementTafsirOpenCount: () => void;
  dismissTafsirNudge: () => void;
  resetTafsirNudge: () => void;
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set) => ({
      lastReadChapterId: 1,
      lastReadVerseNumber: 1,
      lastReadChapterNameFa: 'فاتحه (گشایش)',
      lastReadSurah: 1,
      lastReadAyah: 1,
      lastReadPage: 1,
      lastReadJuz: 1,
      lastReadTimestamp: Date.now(),
      fontScale: 1.0,
      theme: 'emerald',
      quranScript: 'uthmani',
      selectedReciterId: 201, // Shahriar Parhizgar default
      showWordByWord: true,
      showTranslation: true,

      // Dual-mode reading engine defaults
      viewMode: 'continuous',
      quranFont: 'hafs',
      activeVerseKey: null,
      isPlaying: false,
      activeTranslation: 'makarem',

      // Reciter, multi-translation, and word-by-word linguistics defaults
      selectedTranslationIds: [841], // Makarem default
      wordByWordLocale: 'fa',
      wordByWordDisplay: 'inline',
      wordByWordContentType: ['translation'],

      // Tafsir offline usage nudge defaults
      tafsirOpenCount: 0,
      isTafsirNudgeDismissed: false,

      setLastRead: (chapterId, verseNumber, chapterNameFa, pageNumber, juzNumber) =>
        set((state) => ({
          lastReadChapterId: chapterId,
          lastReadSurah: chapterId,
          lastReadVerseNumber: verseNumber,
          lastReadAyah: verseNumber,
          lastReadChapterNameFa: chapterNameFa,
          lastReadPage: pageNumber ?? state.lastReadPage ?? 1,
          lastReadJuz: juzNumber ?? state.lastReadJuz ?? 1,
          lastReadTimestamp: Date.now(),
        })),

      setFontScale: (scale) => set({ fontScale: Math.max(0.8, Math.min(1.6, scale)) }),
      setTheme: (theme) => set({ theme }),

      setQuranScript: (script) =>
        set({
          quranScript: script,
          quranFont: script === 'indopak' ? 'indopak' : 'hafs',
        }),

      setSelectedReciterId: (id) => set({ selectedReciterId: id }),
      toggleWordByWord: () => set((state) => ({ showWordByWord: !state.showWordByWord })),
      toggleTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),

      // Dual-mode reading engine actions
      setViewMode: (viewMode) => set({ viewMode }),

      setQuranFont: (quranFont) =>
        set({
          quranFont,
          quranScript: quranFont === 'indopak' ? 'indopak' : 'uthmani',
        }),

      setActiveVerseKey: (activeVerseKey) => set({ activeVerseKey }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setActiveTranslation: (activeTranslation) => set({ activeTranslation }),

      // Reciter, multi-translation, and word-by-word actions
      setSelectedTranslationIds: (ids) =>
        set({ selectedTranslationIds: Array.isArray(ids) && ids.length > 0 ? ids : [841] }),

      toggleSelectedTranslationId: (id) =>
        set((state) => {
          const exists = state.selectedTranslationIds.includes(id);
          // Invariant: keep at least one translation selected
          if (exists && state.selectedTranslationIds.length <= 1) {
            return state;
          }
          return {
            selectedTranslationIds: exists
              ? state.selectedTranslationIds.filter((tId) => tId !== id)
              : [...state.selectedTranslationIds, id],
          };
        }),

      setWordByWordLocale: (locale) => set({ wordByWordLocale: locale }),
      setWordByWordDisplay: (display) => set({ wordByWordDisplay: display }),
      setWordByWordContentType: (types) => set({ wordByWordContentType: types }),

      // Tafsir offline usage nudge actions
      incrementTafsirOpenCount: () =>
        set((state) => ({ tafsirOpenCount: (state.tafsirOpenCount || 0) + 1 })),
      dismissTafsirNudge: () => set({ isTafsirNudgeDismissed: true }),
      resetTafsirNudge: () => set({ tafsirOpenCount: 0, isTafsirNudgeDismissed: false }),
    }),
    {
      name: 'quran-reading-store',
      storage: createJSONStorage(() => readingStorage),
      // Only persist reading progress and user preferences; exclude active playback state
      partialize: (state) => ({
        lastReadChapterId: state.lastReadChapterId,
        lastReadVerseNumber: state.lastReadVerseNumber,
        lastReadChapterNameFa: state.lastReadChapterNameFa,
        lastReadSurah: state.lastReadSurah,
        lastReadAyah: state.lastReadAyah,
        lastReadPage: state.lastReadPage,
        lastReadJuz: state.lastReadJuz,
        lastReadTimestamp: state.lastReadTimestamp,
        fontScale: state.fontScale,
        theme: state.theme,
        quranScript: state.quranScript,
        selectedReciterId: state.selectedReciterId,
        showWordByWord: state.showWordByWord,
        showTranslation: state.showTranslation,
        viewMode: state.viewMode,
        quranFont: state.quranFont,
        activeTranslation: state.activeTranslation,
        selectedTranslationIds: state.selectedTranslationIds,
        wordByWordLocale: state.wordByWordLocale,
        wordByWordDisplay: state.wordByWordDisplay,
        wordByWordContentType: state.wordByWordContentType,
        tafsirOpenCount: state.tafsirOpenCount,
        isTafsirNudgeDismissed: state.isTafsirNudgeDismissed,
      }),
    },
  ),
);
