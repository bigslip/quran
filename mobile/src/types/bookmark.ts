/* eslint-disable @typescript-eslint/naming-convention */
export interface Tag {
  id: string;
  name: string;
  color: string;
  is_preset: boolean;
  count?: number;
}

export interface BookmarkRow {
  id: string;
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  note?: string | null;
  created_at: number;
  updated_at: number;
  tag_ids?: string | null;
  tag_names?: string | null;
  tag_colors?: string | null;
}

export interface HydratedBookmark {
  id: string;
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  note?: string;
  tags: Tag[];
  created_at: number;
  updated_at: number;
  text_uthmani: string;
  text_indopak?: string;
  translation_fa_makarem?: string;
  translation_fa_ansarian?: string;
  translation_en_saheeh?: string;
  page_number: number;
  juz_number: number;
  chapter_name_fa: string;
  chapter_name_arabic: string;
}
