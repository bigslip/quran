/* eslint-disable import/extensions */
import { adaptDatabase, type SQLiteLikeDb } from './ayahInsightsService.ts';

const USER_DB_NAME = 'quran_user.db';
let userDbInstance: SQLiteLikeDb | null = null;
let initPromise: Promise<SQLiteLikeDb> | null = null;
let isInitialized = false;

export const PRESET_TAGS = [
  { id: 'tag-fav', name: 'منتخب', color: '#F59E0B' },
  { id: 'tag-dua', name: 'دعا و نیایش', color: '#10B981' },
  { id: 'tag-peace', name: 'آرامش‌بخش', color: '#14B8A6' },
  { id: 'tag-memorize', name: 'حفظ قرآن', color: '#6366F1' },
  { id: 'tag-reflect', name: 'تدبر و اندیشه', color: '#8B5CF6' },
] as const;

export function setUserDatabase(db: SQLiteLikeDb | any | null): void {
  userDbInstance = db ? adaptDatabase(db) : null;
  initPromise = null;
  isInitialized = false;
}

export function resetUserDatabaseForTesting(): void {
  userDbInstance = null;
  initPromise = null;
  isInitialized = false;
}

async function createBookmarkTables(db: SQLiteLikeDb): Promise<void> {
  await db.run!(`
    CREATE TABLE IF NOT EXISTS user_bookmarks (
      id TEXT PRIMARY KEY,
      verse_key TEXT NOT NULL UNIQUE,
      chapter_id INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      note TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await db.run!(`
    CREATE TABLE IF NOT EXISTS bookmark_tag_map (
      bookmark_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (bookmark_id, tag_id),
      FOREIGN KEY (bookmark_id) REFERENCES user_bookmarks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES user_tags(id) ON DELETE CASCADE
    );
  `);
}

async function createUserAuxTables(db: SQLiteLikeDb): Promise<void> {
  await db.run!(`
    CREATE TABLE IF NOT EXISTS user_tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#10B981',
      is_preset INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  await db.run!(`
    CREATE TABLE IF NOT EXISTS user_reflections (
      verse_key TEXT PRIMARY KEY,
      reflection TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}

async function createIndexes(db: SQLiteLikeDb): Promise<void> {
  await db.run!(`
    CREATE INDEX IF NOT EXISTS idx_user_bookmarks_verse_key ON user_bookmarks (verse_key);
  `);
  await db.run!(`
    CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON user_bookmarks (created_at DESC);
  `);
  await db.run!(`
    CREATE INDEX IF NOT EXISTS idx_user_bookmarks_quran_order ON user_bookmarks (chapter_id ASC, verse_number ASC);
  `);
  await db.run!(`
    CREATE INDEX IF NOT EXISTS idx_bookmark_tag_map_tag ON bookmark_tag_map (tag_id);
  `);
}

async function seedPresetTags(db: SQLiteLikeDb): Promise<void> {
  const existing = await db.getFirst<{ count: number }>('SELECT count(*) as count FROM user_tags;');
  if (!existing || existing.count === 0) {
    const now = Date.now();
    await Promise.all(
      PRESET_TAGS.map((tag) =>
        db.run!(
          'INSERT OR IGNORE INTO user_tags (id, name, color, is_preset, created_at) VALUES (?, ?, ?, 1, ?);',
          [tag.id, tag.name, tag.color, now],
        ),
      ),
    );
  }
}

export async function initUserTables(db: SQLiteLikeDb): Promise<void> {
  if (!db.run) return;
  await createBookmarkTables(db);
  await createUserAuxTables(db);
  await createIndexes(db);
  await seedPresetTags(db);
}

export async function getUserDatabase(): Promise<SQLiteLikeDb> {
  if (userDbInstance) {
    if (!isInitialized) {
      await initUserTables(userDbInstance);
      isInitialized = true;
    }
    return userDbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async (): Promise<SQLiteLikeDb> => {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const SQLite = require('expo-sqlite');
    const rawDb = await SQLite.openDatabaseAsync(USER_DB_NAME);

    // Modern WAL and foreign key configuration
    if (rawDb.execAsync) {
      await rawDb.execAsync('PRAGMA journal_mode = WAL;');
      await rawDb.execAsync('PRAGMA foreign_keys = ON;');
    }

    const adapted = adaptDatabase(rawDb);
    await initUserTables(adapted);
    isInitialized = true;

    userDbInstance = adapted;
    return userDbInstance;
  })();

  return initPromise;
}

export async function closeUserDatabase(): Promise<void> {
  userDbInstance = null;
  initPromise = null;
  isInitialized = false;
}
