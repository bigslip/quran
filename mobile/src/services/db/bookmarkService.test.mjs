import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { setUserDatabase, resetUserDatabaseForTesting, initUserTables } from './userDatabase.ts';
import {
  addBookmark,
  deleteBookmarkByVerseKey,
  deleteBookmark,
  restoreBookmark,
  updateBookmarkNote,
  setBookmarkTags,
  getAllTags,
  createCustomTag,
  getAllHydratedBookmarks,
  getBookmarkedKeys,
  setScriptureDatabase,
} from './bookmarkService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QURAN_DB_PATH = path.resolve(__dirname, '../../../assets/data/quran.db');

describe('Bookmark Service Layer Tests', () => {
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
  });

  it('should add a bookmark, prevent duplicate verse_key, and return hydrated record', async () => {
    const bookmark = await addBookmark({
      verse_key: '2:255',
      chapter_id: 2,
      verse_number: 255,
      note: 'آیة الکرسی',
      tag_ids: ['tag-fav'],
    });

    assert.strictEqual(bookmark.verse_key, '2:255');
    assert.strictEqual(bookmark.chapter_id, 2);
    assert.strictEqual(bookmark.verse_number, 255);
    assert.strictEqual(bookmark.note, 'آیة الکرسی');
    assert.ok(bookmark.text_uthmani.includes('ٱللَّهُ'));
    assert.ok(bookmark.text_uthmani.includes('ٱلْقَيُّومُ'));
    assert.strictEqual(bookmark.chapter_name_fa, 'بقره (گاو ماده)');
    assert.strictEqual(bookmark.page_number, 42);
    assert.strictEqual(bookmark.tags.length, 1);
    assert.strictEqual(bookmark.tags[0].id, 'tag-fav');

    const keys = await getBookmarkedKeys();
    assert.strictEqual(keys.has('2:255'), true);

    // Re-adding with different note should update rather than crash
    const updated = await addBookmark({
      verse_key: '2:255',
      chapter_id: 2,
      verse_number: 255,
      note: 'یادداشت جدید',
    });
    assert.strictEqual(updated.note, 'یادداشت جدید');
    const all = await getAllHydratedBookmarks();
    assert.strictEqual(all.filter((b) => b.verse_key === '2:255').length, 1);
  });

  it('should delete a bookmark by verse_key and update keys set', async () => {
    await addBookmark({ verse_key: '1:1', chapter_id: 1, verse_number: 1 });
    assert.strictEqual((await getBookmarkedKeys()).has('1:1'), true);

    const deleted = await deleteBookmarkByVerseKey('1:1');
    assert.strictEqual(deleted, true);
    assert.strictEqual((await getBookmarkedKeys()).has('1:1'), false);
  });

  it('should delete a bookmark by id and support restoring it', async () => {
    const created = await addBookmark({
      verse_key: '1:2',
      chapter_id: 1,
      verse_number: 2,
      note: 'الحمد لله رب العالمين',
      tag_ids: ['tag-dua'],
    });

    const deleted = await deleteBookmark(created.id);
    assert.strictEqual(deleted, true);
    assert.strictEqual((await getBookmarkedKeys()).has('1:2'), false);

    // Restore
    await restoreBookmark(created);
    assert.strictEqual((await getBookmarkedKeys()).has('1:2'), true);
    const restoredList = await getAllHydratedBookmarks();
    const restored = restoredList.find((b) => b.verse_key === '1:2');
    assert.ok(restored);
    assert.strictEqual(restored.note, 'الحمد لله رب العالمين');
    assert.strictEqual(restored.tags.length, 1);
    assert.strictEqual(restored.tags[0].id, 'tag-dua');
  });

  it('should update note and tags on an existing bookmark', async () => {
    const b = await addBookmark({ verse_key: '1:1', chapter_id: 1, verse_number: 1 });
    await updateBookmarkNote('1:1', 'یادداشت بسم الله');
    await setBookmarkTags(b.id, ['tag-dua', 'tag-fav']);

    const list = await getAllHydratedBookmarks();
    assert.strictEqual(list[0].note, 'یادداشت بسم الله');
    assert.strictEqual(list[0].tags.length, 2);
    const tagIds = list[0].tags.map((t) => t.id);
    assert.ok(tagIds.includes('tag-dua'));
    assert.ok(tagIds.includes('tag-fav'));
  });

  it('should manage custom tags and return tags with counts', async () => {
    const customTag = await createCustomTag('موضوعی', '#3B82F6');
    assert.strictEqual(customTag.name, 'موضوعی');
    assert.strictEqual(customTag.color, '#3B82F6');
    assert.strictEqual(customTag.is_preset, false);

    const b = await addBookmark({
      verse_key: '1:1',
      chapter_id: 1,
      verse_number: 1,
      tag_ids: [customTag.id],
    });

    const tags = await getAllTags();
    const foundCustom = tags.find((t) => t.id === customTag.id);
    assert.ok(foundCustom);
    assert.strictEqual(foundCustom.count, 1);
  });

  it('should sort bookmarks by date_desc, date_asc, and quran_order', async () => {
    await addBookmark({ verse_key: '2:1', chapter_id: 2, verse_number: 1 });
    // slight delay to ensure distinct timestamp if necessary
    await new Promise((resolve) => setTimeout(resolve, 10));
    await addBookmark({ verse_key: '1:1', chapter_id: 1, verse_number: 1 });

    const quranSorted = await getAllHydratedBookmarks('quran_order');
    assert.strictEqual(quranSorted[0].verse_key, '1:1');
    assert.strictEqual(quranSorted[1].verse_key, '2:1');

    const descSorted = await getAllHydratedBookmarks('date_desc');
    assert.strictEqual(descSorted[0].verse_key, '1:1');
    assert.strictEqual(descSorted[1].verse_key, '2:1');

    const ascSorted = await getAllHydratedBookmarks('date_asc');
    assert.strictEqual(ascSorted[0].verse_key, '2:1');
    assert.strictEqual(ascSorted[1].verse_key, '1:1');
  });

  it('should return existing tag when createCustomTag is called with duplicate name', async () => {
    const tag1 = await createCustomTag('اخلاق', '#10B981');
    const tag2 = await createCustomTag('اخلاق', '#EF4444');
    assert.strictEqual(tag1.id, tag2.id);
    assert.strictEqual(tag2.name, 'اخلاق');
  });

  it('should clean up bookmark_tag_map when deleting by verse_key or id', async () => {
    const created = await addBookmark({
      verse_key: '2:1',
      chapter_id: 2,
      verse_number: 1,
      tag_ids: ['tag-fav', 'tag-dua'],
    });

    const mapRowsBefore = userDb
      .prepare('SELECT count(*) as count FROM bookmark_tag_map WHERE bookmark_id = ?;')
      .get(created.id);
    assert.strictEqual(mapRowsBefore.count, 2);

    await deleteBookmarkByVerseKey('2:1');

    const mapRowsAfter = userDb
      .prepare('SELECT count(*) as count FROM bookmark_tag_map WHERE bookmark_id = ?;')
      .get(created.id);
    assert.strictEqual(mapRowsAfter.count, 0);
  });
});
