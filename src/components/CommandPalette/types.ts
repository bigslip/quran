import Chapter from 'types/Chapter';

export enum CommandPaletteTab {
  All = 'all',
  Surahs = 'surahs',
  Juz = 'juz',
  Pages = 'pages',
}

export interface DirectAyahJumpResult {
  surahNumber: number;
  verseNumber: number;
  chapter: Chapter;
  famousName?: string;
  url: string;
}

export interface NavigationOption {
  id: string;
  type: 'direct_jump' | 'surah' | 'juz' | 'page' | 'recent' | 'search_page';
  title: string;
  subtitle?: string;
  badge?: string | number;
  arabicName?: string;
  chapterId?: string;
  url: string;
  onSelect: () => void;
}
