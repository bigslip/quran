import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import {
  getUserDatabase,
  setUserDatabase,
  resetUserDatabaseForTesting,
  closeUserDatabase,
  PRESET_TAGS,
} from './userDatabase.ts';

describe('User Database Layer Tests', () => {
  let memoryDb;

  beforeEach(() => {
    resetUserDatabaseForTesting();
    memoryDb = new DatabaseSync(':memory:');
    setUserDatabase(memoryDb);
  });

  it('should initialize tables for user bookmarks, tags, map, and reflections', async () => {
    const db = await getUserDatabase();

    // Check tables exist
    const tables = db
      .getAll("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC;")
      .map((r) => r.name);

    assert.ok(tables.includes('user_bookmarks'), 'user_bookmarks table must exist');
    assert.ok(tables.includes('user_tags'), 'user_tags table must exist');
    assert.ok(tables.includes('bookmark_tag_map'), 'bookmark_tag_map table must exist');
    assert.ok(tables.includes('user_reflections'), 'user_reflections table must exist');
  });

  it('should seed preset tags on first initialization', async () => {
    const db = await getUserDatabase();
    const tags = db.getAll('SELECT * FROM user_tags ORDER BY is_preset DESC, id ASC;');

    assert.strictEqual(tags.length, PRESET_TAGS.length, 'Must seed all preset tags');
    const tagNames = tags.map((t) => t.name);
    assert.ok(tagNames.includes('منتخب'), 'Must include Favorites tag');
    assert.ok(tagNames.includes('دعا و نیایش'), 'Must include Dua tag');
    assert.ok(tagNames.includes('حفظ قرآن'), 'Must include Memorization tag');
    assert.ok(tagNames.includes('تدبر و اندیشه'), 'Must include Reflection tag');
    assert.ok(
      tagNames.some((n) => n.includes('آرامش')),
      'Must include Peace tag',
    );

    // Verify all preset tags have is_preset = 1
    for (const tag of tags) {
      assert.strictEqual(tag.is_preset, 1);
      assert.ok(tag.color, 'Tag must have a color');
    }
  });

  it('should create required indexes for performance', async () => {
    const db = await getUserDatabase();
    const indexes = db
      .getAll("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name ASC;")
      .map((r) => r.name);

    assert.ok(
      indexes.includes('idx_user_bookmarks_verse_key'),
      'idx_user_bookmarks_verse_key must exist',
    );
    assert.ok(
      indexes.includes('idx_user_bookmarks_created_at'),
      'idx_user_bookmarks_created_at must exist',
    );
    assert.ok(
      indexes.includes('idx_user_bookmarks_quran_order'),
      'idx_user_bookmarks_quran_order must exist',
    );
    assert.ok(indexes.includes('idx_bookmark_tag_map_tag'), 'idx_bookmark_tag_map_tag must exist');
  });

  it('should reset database instance when resetUserDatabaseForTesting or closeUserDatabase is called', async () => {
    const db1 = await getUserDatabase();
    assert.ok(db1);

    await closeUserDatabase();
    // After closing, setting a new memory DB should work cleanly
    const newMemoryDb = new DatabaseSync(':memory:');
    setUserDatabase(newMemoryDb);
    const db2 = await getUserDatabase();
    assert.ok(db2);
    assert.notStrictEqual(db1, db2);
  });
});
