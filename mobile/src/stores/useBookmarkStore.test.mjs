import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import {
  setUserDatabase,
  resetUserDatabaseForTesting,
  initUserTables,
} from '../services/db/userDatabase.ts';
import { setScriptureDatabase } from '../services/db/bookmarkService.ts';
import { useBookmarkStore, selectFilteredBookmarks } from './useBookmarkStore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QURAN_DB_PATH = path.resolve(__dirname, '../../assets/data/quran.db');

describe('useBookmarkStore Reactive State Tests', () => {
  let userDb;
  const quranDb = new DatabaseSync(QURAN_DB_PATH, { readOnly: true });

  after(() => {
    try {
      quranDb.close();
    } catch {
      // Ignore
    }
  });

  beforeEach(async () => {
    assert.ok(fs.existsSync(QURAN_DB_PATH), `quran.db must exist at ${QURAN_DB_PATH}`);
    resetUserDatabaseForTesting();
    userDb = new DatabaseSync(':memory:');
    setUserDatabase(userDb);
    await initUserTables(userDb);
    setScriptureDatabase(quranDb);

    // Reset store state
    useBookmarkStore.setState({
      bookmarks: [],
      bookmarkedKeys: new Set(),
      tags: [],
      selectedTagId: null,
      searchQuery: '',
      sortBy: 'date_desc',
      loading: false,
      recentlyDeleted: null,
    });
  });

  it('should toggle bookmark optimistically and update bookmarkedKeys set and bookmarks list', async () => {
    assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has('2:255'), false);

    const addResult = await useBookmarkStore.getState().toggleBookmark({
      verse_key: '2:255',
      chapter_id: 2,
      verse_number: 255,
      note: 'آیت الکرسی',
    });

    assert.strictEqual(addResult, true);
    assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has('2:255'), true);
    assert.strictEqual(useBookmarkStore.getState().bookmarks.length, 1);
    assert.strictEqual(useBookmarkStore.getState().bookmarks[0].verse_key, '2:255');
    assert.strictEqual(useBookmarkStore.getState().bookmarks[0].note, 'آیت الکرسی');

    // Toggle again to remove
    const removeResult = await useBookmarkStore.getState().toggleBookmark({
      verse_key: '2:255',
      chapter_id: 2,
      verse_number: 255,
    });

    assert.strictEqual(removeResult, false);
    assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has('2:255'), false);
    assert.strictEqual(useBookmarkStore.getState().bookmarks.length, 0);
  });

  it('should load bookmarks and preset tags', async () => {
    await useBookmarkStore.getState().loadBookmarks();

    const tags = useBookmarkStore.getState().tags;
    assert.ok(tags.length >= 5, 'Must load preset tags');
    const tagNames = tags.map((t) => t.name);
    assert.ok(tagNames.includes('منتخب'));
    assert.ok(tagNames.includes('دعا و نیایش'));
    assert.ok(tagNames.includes('حفظ قرآن'));
    assert.strictEqual(useBookmarkStore.getState().bookmarks.length, 0);
  });

  it('should update note on an existing bookmark', async () => {
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '1:1',
      chapter_id: 1,
      verse_number: 1,
    });

    await useBookmarkStore.getState().updateNote('1:1', 'یادداشت شخصی سوره حمد');
    assert.strictEqual(useBookmarkStore.getState().bookmarks[0].note, 'یادداشت شخصی سوره حمد');

    // Reload from db to ensure persistence
    await useBookmarkStore.getState().loadBookmarks();
    assert.strictEqual(useBookmarkStore.getState().bookmarks[0].note, 'یادداشت شخصی سوره حمد');
  });

  it('should create custom tag and associate tags with bookmark', async () => {
    const newTag = await useBookmarkStore.getState().createTag('حفظ هفتگی', '#3B82F6');
    assert.strictEqual(newTag.name, 'حفظ هفتگی');
    assert.strictEqual(newTag.color, '#3B82F6');
    assert.ok(useBookmarkStore.getState().tags.some((t) => t.id === newTag.id));

    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '2:255',
      chapter_id: 2,
      verse_number: 255,
    });

    const item = useBookmarkStore.getState().bookmarks[0];
    await useBookmarkStore.getState().setTagsForBookmark(item.id, ['tag-fav', newTag.id]);

    const updatedItem = useBookmarkStore.getState().bookmarks[0];
    assert.strictEqual(updatedItem.tags.length, 2);
    const tagIds = updatedItem.tags.map((t) => t.id);
    assert.ok(tagIds.includes('tag-fav'));
    assert.ok(tagIds.includes(newTag.id));
  });

  it('should soft delete bookmark and support undo deletion via recentlyDeleted buffer', async () => {
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '1:1',
      chapter_id: 1,
      verse_number: 1,
    });

    const item = useBookmarkStore.getState().bookmarks[0];
    assert.ok(item);

    await useBookmarkStore.getState().deleteBookmark(item.id);
    assert.strictEqual(useBookmarkStore.getState().bookmarks.length, 0);
    assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has('1:1'), false);
    assert.ok(useBookmarkStore.getState().recentlyDeleted);
    assert.strictEqual(useBookmarkStore.getState().recentlyDeleted.verse_key, '1:1');

    // Undo delete
    await useBookmarkStore.getState().undoDelete();
    assert.strictEqual(useBookmarkStore.getState().bookmarks.length, 1);
    assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has('1:1'), true);
    assert.strictEqual(useBookmarkStore.getState().recentlyDeleted, null);

    // Test clearUndo
    await useBookmarkStore.getState().deleteBookmark(item.id);
    assert.ok(useBookmarkStore.getState().recentlyDeleted);
    useBookmarkStore.getState().clearUndo();
    assert.strictEqual(useBookmarkStore.getState().recentlyDeleted, null);
  });

  it('should filter bookmarks by tag', async () => {
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '1:1',
      chapter_id: 1,
      verse_number: 1,
      tag_ids: ['tag-fav'],
    });
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '2:255',
      chapter_id: 2,
      verse_number: 255,
      tag_ids: ['tag-dua'],
    });

    useBookmarkStore.getState().setSelectedTagId('tag-fav');
    let filtered = useBookmarkStore.getState().getFilteredBookmarks();
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].verse_key, '1:1');

    useBookmarkStore.getState().setSelectedTagId('tag-dua');
    filtered = useBookmarkStore.getState().getFilteredBookmarks();
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].verse_key, '2:255');

    useBookmarkStore.getState().setSelectedTagId(null);
    filtered = useBookmarkStore.getState().getFilteredBookmarks();
    assert.strictEqual(filtered.length, 2);

    // Also test standalone selector
    const selectorFiltered = selectFilteredBookmarks(useBookmarkStore.getState());
    assert.strictEqual(selectorFiltered.length, 2);
  });

  it('should filter bookmarks by search query across Arabic, translation, and note', async () => {
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '1:1',
      chapter_id: 1,
      verse_number: 1,
      note: 'یادداشت آغاز',
    });
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '2:255',
      chapter_id: 2,
      verse_number: 255,
      note: 'یادداشت کرسی',
    });

    // Match by note
    useBookmarkStore.getState().setSearchQuery('آغاز');
    let filtered = useBookmarkStore.getState().getFilteredBookmarks();
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].verse_key, '1:1');

    // Match by verse_key
    useBookmarkStore.getState().setSearchQuery('2:255');
    filtered = useBookmarkStore.getState().getFilteredBookmarks();
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].verse_key, '2:255');

    // Match by Arabic text
    useBookmarkStore.getState().setSearchQuery('الرحیم');
    filtered = useBookmarkStore.getState().getFilteredBookmarks();
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].verse_key, '1:1');

    // Nonexistent query
    useBookmarkStore.getState().setSearchQuery('عبارت_ناموجود');
    filtered = useBookmarkStore.getState().getFilteredBookmarks();
    assert.strictEqual(filtered.length, 0);

    // Empty query resets filter
    useBookmarkStore.getState().setSearchQuery('');
    filtered = useBookmarkStore.getState().getFilteredBookmarks();
    assert.strictEqual(filtered.length, 2);
  });

  it('should change sort order and reload bookmarks', async () => {
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '2:1',
      chapter_id: 2,
      verse_number: 1,
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '1:1',
      chapter_id: 1,
      verse_number: 1,
    });

    // Default date_desc: 1:1 is newer than 2:1
    assert.strictEqual(useBookmarkStore.getState().bookmarks[0].verse_key, '1:1');
    assert.strictEqual(useBookmarkStore.getState().bookmarks[1].verse_key, '2:1');

    // quran_order: 1:1 before 2:1
    await useBookmarkStore.getState().setSortBy('quran_order');
    assert.strictEqual(useBookmarkStore.getState().bookmarks[0].verse_key, '1:1');
    assert.strictEqual(useBookmarkStore.getState().bookmarks[1].verse_key, '2:1');

    // date_asc: 2:1 before 1:1
    await useBookmarkStore.getState().setSortBy('date_asc');
    assert.strictEqual(useBookmarkStore.getState().bookmarks[0].verse_key, '2:1');
    assert.strictEqual(useBookmarkStore.getState().bookmarks[1].verse_key, '1:1');
  });

  it('should handle edge cases: invalid id deletion, empty undo, and tag validation', async () => {
    // Delete non-existent ID
    await useBookmarkStore.getState().deleteBookmark('non-existent-id');
    assert.strictEqual(useBookmarkStore.getState().recentlyDeleted, null);

    // Undo when recentlyDeleted is null
    await useBookmarkStore.getState().undoDelete();
    assert.strictEqual(useBookmarkStore.getState().recentlyDeleted, null);

    // Create tag validation
    await assert.rejects(
      async () => useBookmarkStore.getState().createTag(''),
      /Tag name cannot be empty/,
    );
    await assert.rejects(
      async () => useBookmarkStore.getState().createTag('tag,with,comma'),
      /Tag name cannot contain commas/,
    );
  });

  it('should filter bookmarks simultaneously by tag and search query', async () => {
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '1:1',
      chapter_id: 1,
      verse_number: 1,
      tag_ids: ['tag-fav'],
      note: 'نکته اول',
    });
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '1:2',
      chapter_id: 1,
      verse_number: 2,
      tag_ids: ['tag-fav'],
      note: 'نکته دوم',
    });
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '2:255',
      chapter_id: 2,
      verse_number: 255,
      tag_ids: ['tag-dua'],
      note: 'نکته اول',
    });

    useBookmarkStore.getState().setSelectedTagId('tag-fav');
    useBookmarkStore.getState().setSearchQuery('اول');

    const filtered = useBookmarkStore.getState().getFilteredBookmarks();
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].verse_key, '1:1');
  });

  it('should clear recentlyDeleted when adding a bookmark with the same verse key and sync note updates', async () => {
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '1:1',
      chapter_id: 1,
      verse_number: 1,
      note: 'یادداشت اولیه',
    });

    const item = useBookmarkStore.getState().bookmarks.find((b) => b.verse_key === '1:1');
    assert.ok(item);

    // Delete item into undo buffer
    await useBookmarkStore.getState().deleteBookmark(item.id);
    assert.strictEqual(useBookmarkStore.getState().recentlyDeleted?.verse_key, '1:1');

    // Updating note for 1:1 while in undo buffer should update recentlyDeleted.note
    await useBookmarkStore.getState().updateNote('1:1', 'یادداشت تغییر یافته');
    assert.strictEqual(useBookmarkStore.getState().recentlyDeleted?.note, 'یادداشت تغییر یافته');

    // Re-adding 1:1 should clear recentlyDeleted buffer
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '1:1',
      chapter_id: 1,
      verse_number: 1,
    });
    assert.strictEqual(useBookmarkStore.getState().recentlyDeleted, null);
  });
});
