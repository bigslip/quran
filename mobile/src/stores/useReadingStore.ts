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

  setLastRead: (chapterId: number, verseNumber: number, chapterNameFa: string) => void;
  setFontScale: (scale: number) => void;
  setQuranScript: (script: 'uthmani' | 'indopak') => void;
  setSelectedReciterId: (id: number) => void;
  toggleWordByWord: () => void;
  toggleTranslation: () => void;
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
}));
