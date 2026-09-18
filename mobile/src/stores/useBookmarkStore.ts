/* eslint-disable import/extensions, @typescript-eslint/naming-convention, max-lines, react-func/max-lines-per-function, no-console */
import { create } from 'zustand';

import * as bookmarkService from '../services/db/bookmarkService.ts';
import { normalizeSearchQuery } from '../services/db/searchService.ts';
import type { HydratedBookmark, Tag } from '../types/bookmark.ts';

export interface BookmarkState {
  bookmarks: HydratedBookmark[];
  bookmarkedKeys: Set<string>;
  tags: Tag[];
  selectedTagId: string | null;
  searchQuery: string;
  sortBy: 'date_desc' | 'date_asc' | 'quran_order';
  loading: boolean;
  recentlyDeleted: HydratedBookmark | null;

  // Actions
  loadBookmarks: () => Promise<void>;
  toggleBookmark: (verse: {
    verse_key: string;
    chapter_id: number;
    verse_number: number;
    note?: string;
    tag_ids?: string[];
  }) => Promise<boolean>;
  updateNote: (verseKey: string, note: string) => Promise<void>;
  setTagsForBookmark: (bookmarkId: string, tagIds: string[]) => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag>;
  deleteBookmark: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  clearUndo: () => void;
  setSelectedTagId: (tagId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'date_desc' | 'date_asc' | 'quran_order') => Promise<void>;
  getFilteredBookmarks: () => HydratedBookmark[];
}

export function selectFilteredBookmarks(
  state: Pick<BookmarkState, 'bookmarks' | 'selectedTagId' | 'searchQuery'>,
): HydratedBookmark[] {
  const { bookmarks, selectedTagId, searchQuery } = state;
  let result = bookmarks;

  if (selectedTagId) {
    result = result.filter((b) => b.tags && b.tags.some((t) => t.id === selectedTagId));
  }

  const rawQuery = searchQuery?.trim();
  if (rawQuery) {
    const lowerQuery = rawQuery.toLowerCase();
    const normQuery = normalizeSearchQuery(rawQuery).toLowerCase();

    result = result.filter((b) => {
      // Direct match
      if (
        b.verse_key.toLowerCase().includes(lowerQuery) ||
        (b.chapter_name_fa && b.chapter_name_fa.toLowerCase().includes(lowerQuery)) ||
        (b.chapter_name_arabic && b.chapter_name_arabic.toLowerCase().includes(lowerQuery)) ||
        (b.text_uthmani && b.text_uthmani.toLowerCase().includes(lowerQuery)) ||
        (b.text_indopak && b.text_indopak.toLowerCase().includes(lowerQuery)) ||
        (b.translation_fa_makarem && b.translation_fa_makarem.toLowerCase().includes(lowerQuery)) ||
        (b.translation_fa_ansarian &&
          b.translation_fa_ansarian.toLowerCase().includes(lowerQuery)) ||
        (b.translation_en_saheeh && b.translation_en_saheeh.toLowerCase().includes(lowerQuery)) ||
        (b.note && b.note.toLowerCase().includes(lowerQuery))
      ) {
        return true;
      }

      // Normalized match for Arabic and Persian text
      if (normQuery) {
        if (
          (b.chapter_name_fa &&
            normalizeSearchQuery(b.chapter_name_fa).toLowerCase().includes(normQuery)) ||
          (b.chapter_name_arabic &&
            normalizeSearchQuery(b.chapter_name_arabic).toLowerCase().includes(normQuery)) ||
          (b.text_uthmani &&
            normalizeSearchQuery(b.text_uthmani).toLowerCase().includes(normQuery)) ||
          (b.text_indopak &&
            normalizeSearchQuery(b.text_indopak).toLowerCase().includes(normQuery)) ||
          (b.translation_fa_makarem &&
            normalizeSearchQuery(b.translation_fa_makarem).toLowerCase().includes(normQuery)) ||
          (b.translation_fa_ansarian &&
            normalizeSearchQuery(b.translation_fa_ansarian).toLowerCase().includes(normQuery)) ||
          (b.note && normalizeSearchQuery(b.note).toLowerCase().includes(normQuery))
        ) {
          return true;
        }
      }

      return false;
    });
  }

  return result;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  bookmarkedKeys: new Set(),
  tags: [],
  selectedTagId: null,
  searchQuery: '',
  sortBy: 'date_desc',
  loading: false,
  recentlyDeleted: null,

  loadBookmarks: async () => {
    set({ loading: true });
    try {
      const [items, tags] = await Promise.all([
        bookmarkService.getAllHydratedBookmarks(get().sortBy),
        bookmarkService.getAllTags(),
      ]);
      const keys = new Set(items.map((b) => b.verse_key));
      set({ bookmarks: items, bookmarkedKeys: keys, tags, loading: false });
    } catch (err) {
      console.warn('[BookmarkStore] loadBookmarks failed:', err);
      set({ loading: false });
    }
  },

  toggleBookmark: async (verse) => {
    const isBookmarked = get().bookmarkedKeys.has(verse.verse_key);
    const nextKeys = new Set(get().bookmarkedKeys);

    if (isBookmarked) {
      // Optimistic delete
      nextKeys.delete(verse.verse_key);
      set({
        bookmarkedKeys: nextKeys,
        bookmarks: get().bookmarks.filter((b) => b.verse_key !== verse.verse_key),
      });
      try {
        await bookmarkService.deleteBookmarkByVerseKey(verse.verse_key);
        const tags = await bookmarkService.getAllTags();
        set({ tags });
      } catch (err) {
        console.warn('[BookmarkStore] delete failed, rolling back:', err);
        await get().loadBookmarks();
      }
      return get().bookmarkedKeys.has(verse.verse_key);
    }
    // Optimistic add
    nextKeys.add(verse.verse_key);
    set({ bookmarkedKeys: nextKeys });
    try {
      await bookmarkService.addBookmark(verse);
      await get().loadBookmarks();
    } catch (err) {
      console.warn('[BookmarkStore] add failed, rolling back:', err);
      await get().loadBookmarks();
    }
    return get().bookmarkedKeys.has(verse.verse_key);
  },

  updateNote: async (verseKey, note) => {
    set({
      bookmarks: get().bookmarks.map((b) =>
        b.verse_key === verseKey ? { ...b, note: note.trim() || undefined } : b,
      ),
    });
    try {
      await bookmarkService.updateBookmarkNote(verseKey, note);
    } catch (err) {
      console.warn('[BookmarkStore] updateNote failed:', err);
      await get().loadBookmarks();
    }
  },

  setTagsForBookmark: async (bookmarkId, tagIds) => {
    try {
      await bookmarkService.setBookmarkTags(bookmarkId, tagIds);
      await get().loadBookmarks();
    } catch (err) {
      console.warn('[BookmarkStore] setTagsForBookmark failed:', err);
    }
  },

  createTag: async (name, color) => {
    const newTag = await bookmarkService.createCustomTag(name, color);
    set({ tags: [...get().tags, newTag] });
    return newTag;
  },

  deleteBookmark: async (id) => {
    const target = get().bookmarks.find((b) => b.id === id);
    if (!target) return;

    const nextKeys = new Set(get().bookmarkedKeys);
    nextKeys.delete(target.verse_key);

    set({
      recentlyDeleted: target,
      bookmarks: get().bookmarks.filter((b) => b.id !== id),
      bookmarkedKeys: nextKeys,
    });

    try {
      await bookmarkService.deleteBookmark(id);
      const tags = await bookmarkService.getAllTags();
      set({ tags });
    } catch (err) {
      console.warn('[BookmarkStore] deleteBookmark failed:', err);
      await get().loadBookmarks();
    }
  },

  undoDelete: async () => {
    const { recentlyDeleted } = get();
    if (!recentlyDeleted) return;

    try {
      await bookmarkService.restoreBookmark(recentlyDeleted);
      set({ recentlyDeleted: null });
      await get().loadBookmarks();
    } catch (err) {
      console.warn('[BookmarkStore] undoDelete failed:', err);
    }
  },

  clearUndo: () => set({ recentlyDeleted: null }),

  setSelectedTagId: (selectedTagId) => set({ selectedTagId }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSortBy: async (sortBy) => {
    set({ sortBy });
    await get().loadBookmarks();
  },

  getFilteredBookmarks: () => selectFilteredBookmarks(get()),
}));
