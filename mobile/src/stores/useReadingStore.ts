import { create } from 'zustand';

interface ReadingState {
  lastReadChapterId: number;
  lastReadVerseNumber: number;
  lastReadChapterNameFa: string;
  fontScale: number;
  quranScript: 'uthmani' | 'indopak';
  selectedReciterId: number;
  showWordByWord: boolean;
  showTranslation: boolean;

  // Dual-mode reading engine state
  viewMode: 'continuous' | 'mushaf';
  quranFont: 'hafs' | 'indopak';
  activeVerseKey: string | null;
  isPlaying: boolean;
  activeTranslation: 'makarem' | 'ansarian' | 'both';

  setLastRead: (chapterId: number, verseNumber: number, chapterNameFa: string) => void;
  setFontScale: (scale: number) => void;
  setQuranScript: (script: 'uthmani' | 'indopak') => void;
  setSelectedReciterId: (id: number) => void;
  toggleWordByWord: () => void;
  toggleTranslation: () => void;

  // Dual-mode reading engine setters
  setViewMode: (mode: 'continuous' | 'mushaf') => void;
  setQuranFont: (font: 'hafs' | 'indopak') => void;
  setActiveVerseKey: (key: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setActiveTranslation: (translation: 'makarem' | 'ansarian' | 'both') => void;
}

export const useReadingStore = create<ReadingState>((set) => ({
  lastReadChapterId: 1,
  lastReadVerseNumber: 1,
  lastReadChapterNameFa: 'فاتحه (گشایش)',
  fontScale: 1.0,
  quranScript: 'uthmani',
  selectedReciterId: 7,
  showWordByWord: true,
  showTranslation: true,

  // Dual-mode reading engine defaults
  viewMode: 'continuous',
  quranFont: 'hafs',
  activeVerseKey: null,
  isPlaying: false,
  activeTranslation: 'makarem',

  setLastRead: (chapterId, verseNumber, chapterNameFa) =>
    set({
      lastReadChapterId: chapterId,
      lastReadVerseNumber: verseNumber,
      lastReadChapterNameFa: chapterNameFa,
    }),

  setFontScale: (scale) => set({ fontScale: Math.max(0.8, Math.min(1.8, scale)) }),
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
}));
