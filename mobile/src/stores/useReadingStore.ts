import { create } from 'zustand';

interface ReadingState {
  lastReadChapterId: number;
  lastReadVerseNumber: number;
  lastReadChapterNameFa: string;
  fontScale: number;
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

  setLastRead: (chapterId: number, verseNumber: number, chapterNameFa: string) => void;
  setFontScale: (scale: number) => void;
  /** Updates the Quran text encoding standard ('uthmani' vs 'indopak'). */
  setQuranScript: (script: 'uthmani' | 'indopak') => void;
  setSelectedReciterId: (id: number) => void;
  toggleWordByWord: () => void;
  toggleTranslation: () => void;

  // Dual-mode reading engine setters
  setViewMode: (mode: 'continuous' | 'mushaf') => void;
  /** Updates the Quran display typeface ('hafs' vs 'indopak'). */
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
}

export const useReadingStore = create<ReadingState>((set) => ({
  lastReadChapterId: 1,
  lastReadVerseNumber: 1,
  lastReadChapterNameFa: 'فاتحه (گشایش)',
  fontScale: 1.0,
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

  setLastRead: (chapterId, verseNumber, chapterNameFa) =>
    set({
      lastReadChapterId: chapterId,
      lastReadVerseNumber: verseNumber,
      lastReadChapterNameFa: chapterNameFa,
    }),

  setFontScale: (scale) => set({ fontScale: Math.max(0.8, Math.min(1.6, scale)) }),
  setQuranScript: (script) => set({ quranScript: script }),
  setSelectedReciterId: (id) => set({ selectedReciterId: id }),
  toggleWordByWord: () => set((state) => ({ showWordByWord: !state.showWordByWord })),
  toggleTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),

  // Dual-mode reading engine actions
  setViewMode: (viewMode) => set({ viewMode }),
  setQuranFont: (quranFont) => set({ quranFont }),
  setActiveVerseKey: (activeVerseKey) => set({ activeVerseKey }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setActiveTranslation: (activeTranslation) => set({ activeTranslation }),

  // Reciter, multi-translation, and word-by-word actions
  setSelectedTranslationIds: (ids) => set({ selectedTranslationIds: ids }),
  toggleSelectedTranslationId: (id) =>
    set((state) => ({
      selectedTranslationIds: state.selectedTranslationIds.includes(id)
        ? state.selectedTranslationIds.filter((tId) => tId !== id)
        : [...state.selectedTranslationIds, id],
    })),
  setWordByWordLocale: (locale) => set({ wordByWordLocale: locale }),
  setWordByWordDisplay: (display) => set({ wordByWordDisplay: display }),
  setWordByWordContentType: (types) => set({ wordByWordContentType: types }),
}));
