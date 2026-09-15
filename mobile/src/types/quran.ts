export interface Chapter {
  id: number;
  slug: string;
  name_simple: string;
  name_arabic: string;
  name_fa: string;
  name_en: string;
  revelation_place: 'makkah' | 'madinah';
  revelation_order: number;
  bismillah_pre: number;
  verses_count: number;
  pages_start: number;
  pages_end: number;
}

export interface Juz {
  juz_number: number;
  page_start: number;
  page_end: number;
  verses_count: number;
  first_chapter_id: number;
  first_verse_key: string;
  first_surah_name_arabic: string;
  first_surah_name_fa: string;
  preview_text: string;
}

export interface Verse {
  id: number;
  chapter_id: number;
  verse_number: number;
  verse_key: string;
  page_number: number;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number?: number;
  manzil_number?: number;
  sajdah_number?: number;
  text_uthmani: string;
  text_imlaei?: string;
  text_indopak?: string;
  translation_fa_makarem?: string;
  translation_fa_ansarian?: string;
  translation_en_saheeh?: string;
  words?: Word[];
}

export interface Word {
  id: number;
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  position: number;
  location: string;
  text_uthmani: string;
  qpc_uthmani_hafs?: string;
  text_indopak?: string;
  text_imlaei_simple?: string;
  translation_fa?: string;
  translation_en?: string;
  audio_url?: string;
  page_number?: number;
  line_number?: number;
}

export interface SearchResult {
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  text_clean_arabic?: string;
  translation_fa?: string;
  translation_en?: string;
  chapter_name_fa?: string;
  chapter_name_arabic?: string;
}

export interface ReadingProgress {
  lastChapterId: number;
  lastVerseNumber: number;
  lastReadTimestamp: number;
  progressPercent: number;
}
