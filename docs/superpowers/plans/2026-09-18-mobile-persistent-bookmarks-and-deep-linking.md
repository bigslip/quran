# Persistent Bookmarks & Reader Deep-Linking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, loss-immune Persistent Bookmarks system and Reader Deep-Linking navigation
for Quran.ir Mobile, replacing the static placeholder with a full-featured, tag-filtered, searchable
bookmarks experience.

**Architecture:** User data is isolated in a dedicated `quran_user.db` SQLite database with WAL and
foreign keys (preventing data loss during asset updates of `quran.db`). A reactive Zustand store
(`useBookmarkStore`) maintains an in-memory `Set<string>` of bookmarked verse keys for $O(1)$ lookup
in 286-verse virtualized lists, while cross-database queries hydrate complete Uthmani text and
translations in under 2ms. Deep-linking to `/surah/[id]?verse=[verseNumber]` executes two-pass
auto-scrolling and page alignment with a 2.5s aura pulse.

**Tech Stack:** React Native 0.86, Expo SDK 57, Expo Router, Expo SQLite, Zustand 5, Lucide React
Native, Node.js Test Runner.

## Global Constraints

- **Language:** All user communications, commit messages, and PR documentation must strictly be in
  **English**.
- **Persian Localization:** All UI-facing labels, tags, digits, and counts must use authentic
  Persian typography (`toPersianDigits`, Vazirmatn).
- **Zero Native Failure:** All SQLite operations must support Node.js in-memory fallbacks so
  `yarn --cwd mobile test` runs cleanly in pure Node.js environments.
- **WCAG Compliance:** Touch targets must be at least 44x44 points.
- **Type Safety:** `yarn --cwd mobile typecheck` must pass with 0 errors after each task.

---

### Task 1: Dedicated User Database Layer (`userDatabase.ts`)

**Files:**

- Create: `mobile/src/services/db/userDatabase.ts`
- Test: `mobile/src/services/db/userDatabase.test.mjs`

**Interfaces:**

- Produces:

  - `getUserDatabase(): Promise<SQLiteLikeDb>`
  - `setUserDatabase(db: SQLiteLikeDb | null): void`
  - `closeUserDatabase(): Promise<void>`
  - `resetUserDatabaseForTesting(): void`

- [ ] **Step 1: Write the failing test for `userDatabase`**

Create `mobile/src/services/db/userDatabase.test.mjs`:

```javascript
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import { getUserDatabase, setUserDatabase, resetUserDatabaseForTesting } from './userDatabase.ts';

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

    assert.ok(tags.length >= 5, 'Must seed at least 5 preset tags');
    const tagNames = tags.map((t) => t.name);
    assert.ok(tagNames.includes('منتخب'), 'Must include Favorites tag');
    assert.ok(tagNames.includes('دعا و نیایش'), 'Must include Dua tag');
    assert.ok(tagNames.includes('حفظ قرآن'), 'Must include Memorization tag');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/services/db/userDatabase.test.mjs`  
Expected: FAIL with module not found or functions not defined.

- [ ] **Step 3: Implement `userDatabase.ts`**

Create `mobile/src/services/db/userDatabase.ts`:

```typescript
import { adaptDatabase, SQLiteLikeDb } from './ayahInsightsService';

const USER_DB_NAME = 'quran_user.db';
let userDbInstance: SQLiteLikeDb | null = null;
let initPromise: Promise<SQLiteLikeDb> | null = null;

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
}

export function resetUserDatabaseForTesting(): void {
  userDbInstance = null;
  initPromise = null;
}

export async function getUserDatabase(): Promise<SQLiteLikeDb> {
  if (userDbInstance) {
    return userDbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async (): Promise<SQLiteLikeDb> => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SQLite = require('expo-sqlite');
    const rawDb = await SQLite.openDatabaseAsync(USER_DB_NAME);

    // Modern WAL and foreign key configuration
    if (rawDb.execAsync) {
      await rawDb.execAsync('PRAGMA journal_mode = WAL;');
      await rawDb.execAsync('PRAGMA foreign_keys = ON;');
    }

    const adapted = adaptDatabase(rawDb);
    await initUserTables(adapted);

    userDbInstance = adapted;
    return userDbInstance;
  })();

  return initPromise;
}

export async function initUserTables(db: SQLiteLikeDb): Promise<void> {
  if (!db.run) return;

  await db.run(`
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

  await db.run(`
    CREATE TABLE IF NOT EXISTS user_tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#10B981',
      is_preset INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS bookmark_tag_map (
      bookmark_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (bookmark_id, tag_id),
      FOREIGN KEY (bookmark_id) REFERENCES user_bookmarks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES user_tags(id) ON DELETE CASCADE
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS user_reflections (
      verse_key TEXT PRIMARY KEY,
      reflection TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_user_bookmarks_verse_key ON user_bookmarks (verse_key);
  `);
  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON user_bookmarks (created_at DESC);
  `);
  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_user_bookmarks_quran_order ON user_bookmarks (chapter_id ASC, verse_number ASC);
  `);
  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_bookmark_tag_map_tag ON bookmark_tag_map (tag_id);
  `);

  // Seed preset tags
  const existing = await db.getFirst<{ count: number }>('SELECT count(*) as count FROM user_tags;');
  if (!existing || existing.count === 0) {
    const now = Date.now();
    for (const tag of PRESET_TAGS) {
      await db.run(
        'INSERT OR IGNORE INTO user_tags (id, name, color, is_preset, created_at) VALUES (?, ?, ?, 1, ?);',
        [tag.id, tag.name, tag.color, now],
      );
    }
  }
}

export async function closeUserDatabase(): Promise<void> {
  userDbInstance = null;
  initPromise = null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/services/db/userDatabase.test.mjs`  
Expected: PASS with 2 passing tests.

- [ ] **Step 5: Commit Task 1**

```bash
git add mobile/src/services/db/userDatabase.ts mobile/src/services/db/userDatabase.test.mjs
git commit -m "feat(mobile): create dedicated quran_user.db database service layer"
```

---

### Task 2: Bookmark Types & Service Layer (`bookmarkService.ts`)

**Files:**

- Create: `mobile/src/types/bookmark.ts`
- Create: `mobile/src/services/db/bookmarkService.ts`
- Test: `mobile/src/services/db/bookmarkService.test.mjs`

**Interfaces:**

- Produces:

  - `Tag`, `HydratedBookmark`, `BookmarkRow` types
  - `addBookmark(params: { verse_key: string; chapter_id: number; verse_number: number; note?: string; tag_ids?: string[] }): Promise<HydratedBookmark>`
  - `deleteBookmarkByVerseKey(verseKey: string): Promise<boolean>`
  - `deleteBookmark(id: string): Promise<boolean>`
  - `restoreBookmark(bookmark: HydratedBookmark): Promise<void>`
  - `updateBookmarkNote(verseKey: string, note: string): Promise<void>`
  - `setBookmarkTags(bookmarkId: string, tagIds: string[]): Promise<void>`
  - `getAllTags(): Promise<Tag[]>`
  - `createCustomTag(name: string, color?: string): Promise<Tag>`
  - `getAllHydratedBookmarks(sortBy?: 'date_desc' | 'date_asc' | 'quran_order'): Promise<HydratedBookmark[]>`
  - `getBookmarkedKeys(): Promise<Set<string>>`

- [ ] **Step 1: Create `mobile/src/types/bookmark.ts`**

```typescript
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
```

- [ ] **Step 2: Write failing tests for `bookmarkService`**

Create `mobile/src/services/db/bookmarkService.test.mjs`:

```javascript
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { setUserDatabase, resetUserDatabaseForTesting, initUserTables } from './userDatabase.ts';
import { setAyahDatabase } from './ayahInsightsService.ts';
import {
  addBookmark,
  deleteBookmarkByVerseKey,
  updateBookmarkNote,
  setBookmarkTags,
  getAllTags,
  createCustomTag,
  getAllHydratedBookmarks,
  getBookmarkedKeys,
} from './bookmarkService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QURAN_DB_PATH = path.resolve(__dirname, '../../../../mobile/assets/data/quran.db');

describe('Bookmark Service Layer Tests', () => {
  let userDb;
  let quranDb;

  beforeEach(async () => {
    resetUserDatabaseForTesting();
    userDb = new DatabaseSync(':memory:');
    setUserDatabase(userDb);
    await initUserTables(userDb);

    quranDb = new DatabaseSync(QURAN_DB_PATH, { readOnly: true });
    setAyahDatabase(quranDb);
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
    assert.ok(bookmark.text_uthmani.includes('اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ'));
    assert.strictEqual(bookmark.chapter_name_fa, 'بقره (گاو)');
    assert.strictEqual(bookmark.page_number, 42);

    const keys = await getBookmarkedKeys();
    assert.strictEqual(keys.has('2:255'), true);
  });

  it('should delete a bookmark by verse_key and update keys set', async () => {
    await addBookmark({ verse_key: '1:1', chapter_id: 1, verse_number: 1 });
    assert.strictEqual((await getBookmarkedKeys()).has('1:1'), true);

    const deleted = await deleteBookmarkByVerseKey('1:1');
    assert.strictEqual(deleted, true);
    assert.strictEqual((await getBookmarkedKeys()).has('1:1'), false);
  });

  it('should update note and tags on an existing bookmark', async () => {
    const b = await addBookmark({ verse_key: '1:1', chapter_id: 1, verse_number: 1 });
    await updateBookmarkNote('1:1', 'یادداشت بسم الله');
    await setBookmarkTags(b.id, ['tag-dua', 'tag-fav']);

    const list = await getAllHydratedBookmarks();
    assert.strictEqual(list[0].note, 'یادداشت بسم الله');
    assert.strictEqual(list[0].tags.length, 2);
  });

  it('should sort bookmarks by date_desc, date_asc, and quran_order', async () => {
    await addBookmark({ verse_key: '2:1', chapter_id: 2, verse_number: 1 });
    await addBookmark({ verse_key: '1:1', chapter_id: 1, verse_number: 1 });

    const quranSorted = await getAllHydratedBookmarks('quran_order');
    assert.strictEqual(quranSorted[0].verse_key, '1:1');
    assert.strictEqual(quranSorted[1].verse_key, '2:1');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test mobile/src/services/db/bookmarkService.test.mjs`  
Expected: FAIL with module not found.

- [ ] **Step 4: Implement `bookmarkService.ts`**

Create `mobile/src/services/db/bookmarkService.ts`:

```typescript
import { getUserDatabase } from './userDatabase';
import { getDatabase } from './database';
import { getActiveDb } from './ayahInsightsService';
import type { Tag, BookmarkRow, HydratedBookmark } from '../types/bookmark';

function generateId(): string {
  return 'bm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

export async function getAllTags(): Promise<Tag[]> {
  const userDb = await getUserDatabase();
  const rows = await userDb.getAll<any>(`
    SELECT t.*, count(m.bookmark_id) as count
    FROM user_tags t
    LEFT JOIN bookmark_tag_map m ON m.tag_id = t.id
    GROUP BY t.id
    ORDER BY t.is_preset DESC, t.name ASC;
  `);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    is_preset: Boolean(r.is_preset),
    count: r.count || 0,
  }));
}

export async function createCustomTag(name: string, color = '#10B981'): Promise<Tag> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Tag name cannot be empty');

  const userDb = await getUserDatabase();
  const id = 'tag_' + Date.now().toString(36);
  if (userDb.run) {
    await userDb.run(
      'INSERT INTO user_tags (id, name, color, is_preset, created_at) VALUES (?, ?, ?, 0, ?);',
      [id, trimmed, color, Date.now()],
    );
  }
  return { id, name: trimmed, color, is_preset: false, count: 0 };
}

export async function getBookmarkedKeys(): Promise<Set<string>> {
  const userDb = await getUserDatabase();
  const rows = await userDb.getAll<{ verse_key: string }>('SELECT verse_key FROM user_bookmarks;');
  return new Set(rows.map((r) => r.verse_key));
}

export async function addBookmark(params: {
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  note?: string;
  tag_ids?: string[];
}): Promise<HydratedBookmark> {
  const userDb = await getUserDatabase();
  const id = generateId();
  const now = Date.now();

  if (userDb.run) {
    await userDb.run(
      `INSERT OR REPLACE INTO user_bookmarks (id, verse_key, chapter_id, verse_number, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        params.verse_key,
        params.chapter_id,
        params.verse_number,
        params.note?.trim() || null,
        now,
        now,
      ],
    );

    if (params.tag_ids && params.tag_ids.length > 0) {
      for (const tagId of params.tag_ids) {
        await userDb.run(
          'INSERT OR IGNORE INTO bookmark_tag_map (bookmark_id, tag_id) VALUES (?, ?);',
          [id, tagId],
        );
      }
    }
  }

  const items = await getAllHydratedBookmarks('date_desc');
  const found = items.find((b) => b.verse_key === params.verse_key);
  if (!found) {
    throw new Error('Failed to retrieve newly inserted bookmark');
  }
  return found;
}

export async function deleteBookmarkByVerseKey(verseKey: string): Promise<boolean> {
  const userDb = await getUserDatabase();
  if (userDb.run) {
    await userDb.run('DELETE FROM user_bookmarks WHERE verse_key = ?;', [verseKey]);
    return true;
  }
  return false;
}

export async function deleteBookmark(id: string): Promise<boolean> {
  const userDb = await getUserDatabase();
  if (userDb.run) {
    await userDb.run('DELETE FROM user_bookmarks WHERE id = ?;', [id]);
    return true;
  }
  return false;
}

export async function restoreBookmark(bookmark: HydratedBookmark): Promise<void> {
  const userDb = await getUserDatabase();
  if (userDb.run) {
    await userDb.run(
      `INSERT OR REPLACE INTO user_bookmarks (id, verse_key, chapter_id, verse_number, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        bookmark.id,
        bookmark.verse_key,
        bookmark.chapter_id,
        bookmark.verse_number,
        bookmark.note?.trim() || null,
        bookmark.created_at,
        Date.now(),
      ],
    );

    if (bookmark.tags && bookmark.tags.length > 0) {
      for (const tag of bookmark.tags) {
        await userDb.run(
          'INSERT OR IGNORE INTO bookmark_tag_map (bookmark_id, tag_id) VALUES (?, ?);',
          [bookmark.id, tag.id],
        );
      }
    }
  }
}

export async function updateBookmarkNote(verseKey: string, note: string): Promise<void> {
  const userDb = await getUserDatabase();
  if (userDb.run) {
    await userDb.run('UPDATE user_bookmarks SET note = ?, updated_at = ? WHERE verse_key = ?;', [
      note.trim() || null,
      Date.now(),
      verseKey,
    ]);
  }
}

export async function setBookmarkTags(bookmarkId: string, tagIds: string[]): Promise<void> {
  const userDb = await getUserDatabase();
  if (userDb.run) {
    await userDb.run('DELETE FROM bookmark_tag_map WHERE bookmark_id = ?;', [bookmarkId]);
    for (const tagId of tagIds) {
      await userDb.run(
        'INSERT OR IGNORE INTO bookmark_tag_map (bookmark_id, tag_id) VALUES (?, ?);',
        [bookmarkId, tagId],
      );
    }
  }
}

export async function getAllHydratedBookmarks(
  sortBy: 'date_desc' | 'date_asc' | 'quran_order' = 'date_desc',
): Promise<HydratedBookmark[]> {
  const userDb = await getUserDatabase();

  let orderBy = 'b.created_at DESC';
  if (sortBy === 'date_asc') orderBy = 'b.created_at ASC';
  if (sortBy === 'quran_order') orderBy = 'b.chapter_id ASC, b.verse_number ASC';

  const bookmarkRows = await userDb.getAll<BookmarkRow>(`
    SELECT 
      b.id, b.verse_key, b.chapter_id, b.verse_number, b.note, b.created_at, b.updated_at,
      GROUP_CONCAT(t.id) AS tag_ids,
      GROUP_CONCAT(t.name) AS tag_names,
      GROUP_CONCAT(t.color) AS tag_colors
    FROM user_bookmarks b
    LEFT JOIN bookmark_tag_map m ON m.bookmark_id = b.id
    LEFT JOIN user_tags t ON t.id = m.tag_id
    GROUP BY b.id
    ORDER BY ${orderBy};
  `);

  if (bookmarkRows.length === 0) {
    return [];
  }

  // Cross-Database Hydration from quran.db
  let quranDb: any;
  try {
    quranDb = await getActiveDb();
  } catch {
    quranDb = await getDatabase();
  }

  const placeholders = bookmarkRows.map(() => '?').join(',');
  const verseKeys = bookmarkRows.map((b) => b.verse_key);

  const scriptureRows = await quranDb.getAll<any>(
    `SELECT 
      v.verse_key, v.text_uthmani, v.text_indopak,
      v.translation_fa_makarem, v.translation_fa_ansarian, v.translation_en_saheeh,
      v.page_number, v.juz_number,
      c.name_fa AS chapter_name_fa, c.name_arabic AS chapter_name_arabic
    FROM verses v
    JOIN chapters c ON c.id = v.chapter_id
    WHERE v.verse_key IN (${placeholders});`,
    verseKeys,
  );

  const scriptureMap = new Map<string, any>(scriptureRows.map((s: any) => [s.verse_key, s]));

  return bookmarkRows.map((b) => {
    const sc = scriptureMap.get(b.verse_key) || {};

    // Parse concatenated tags
    const tags: Tag[] = [];
    if (b.tag_ids && b.tag_names) {
      const ids = b.tag_ids.split(',');
      const names = b.tag_names.split(',');
      const colors = (b.tag_colors || '').split(',');
      ids.forEach((id, index) => {
        if (id && names[index]) {
          tags.push({
            id,
            name: names[index],
            color: colors[index] || '#10B981',
            is_preset: id.startsWith('tag-'),
          });
        }
      });
    }

    return {
      id: b.id,
      verse_key: b.verse_key,
      chapter_id: b.chapter_id,
      verse_number: b.verse_number,
      note: b.note || undefined,
      tags,
      created_at: b.created_at,
      updated_at: b.updated_at,
      text_uthmani: sc.text_uthmani || '',
      text_indopak: sc.text_indopak || undefined,
      translation_fa_makarem: sc.translation_fa_makarem || '',
      translation_fa_ansarian: sc.translation_fa_ansarian || '',
      translation_en_saheeh: sc.translation_en_saheeh || '',
      page_number: sc.page_number || 1,
      juz_number: sc.juz_number || 1,
      chapter_name_fa: sc.chapter_name_fa || '',
      chapter_name_arabic: sc.chapter_name_arabic || '',
    };
  });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test mobile/src/services/db/bookmarkService.test.mjs`  
Expected: PASS with all 4 tests green.

- [ ] **Step 6: Commit Task 2**

```bash
git add mobile/src/types/bookmark.ts mobile/src/services/db/bookmarkService.ts mobile/src/services/db/bookmarkService.test.mjs
git commit -m "feat(mobile): implement cross-database bookmark service with tag support"
```

---

### Task 3: Reactive Bookmark Zustand Store (`useBookmarkStore.ts`)

**Files:**

- Create: `mobile/src/stores/useBookmarkStore.ts`
- Test: `mobile/src/stores/useBookmarkStore.test.mjs`

**Interfaces:**

- Produces:

  - `useBookmarkStore` Zustand hook with reactive state:
    - `bookmarks`, `bookmarkedKeys: Set<string>`, `tags`, `selectedTagId`, `searchQuery`, `sortBy`,
      `loading`, `recentlyDeleted`
    - `loadBookmarks()`, `toggleBookmark()`, `updateNote()`, `setTagsForBookmark()`,
      `deleteBookmark()`, `undoDelete()`

- [ ] **Step 1: Write the failing tests for `useBookmarkStore`**

Create `mobile/src/stores/useBookmarkStore.test.mjs`:

```javascript
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  setUserDatabase,
  resetUserDatabaseForTesting,
  initUserTables,
} from '../services/db/userDatabase.ts';
import { setAyahDatabase } from '../services/db/ayahInsightsService.ts';
import { useBookmarkStore } from './useBookmarkStore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QURAN_DB_PATH = path.resolve(__dirname, '../../../../mobile/assets/data/quran.db');

describe('useBookmarkStore Reactive State Tests', () => {
  beforeEach(async () => {
    resetUserDatabaseForTesting();
    const userDb = new DatabaseSync(':memory:');
    setUserDatabase(userDb);
    await initUserTables(userDb);

    const quranDb = new DatabaseSync(QURAN_DB_PATH, { readOnly: true });
    setAyahDatabase(quranDb);

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

  it('should toggle bookmark optimistically and persist', async () => {
    assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has('2:255'), false);

    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '2:255',
      chapter_id: 2,
      verse_number: 255,
    });

    assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has('2:255'), true);
    assert.strictEqual(useBookmarkStore.getState().bookmarks.length, 1);

    // Toggle again to remove
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '2:255',
      chapter_id: 2,
      verse_number: 255,
    });

    assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has('2:255'), false);
    assert.strictEqual(useBookmarkStore.getState().bookmarks.length, 0);
  });

  it('should support deleting bookmark and undoing deletion via buffer', async () => {
    await useBookmarkStore.getState().toggleBookmark({
      verse_key: '1:1',
      chapter_id: 1,
      verse_number: 1,
    });

    const item = useBookmarkStore.getState().bookmarks[0];
    assert.ok(item);

    await useBookmarkStore.getState().deleteBookmark(item.id);
    assert.strictEqual(useBookmarkStore.getState().bookmarks.length, 0);
    assert.ok(useBookmarkStore.getState().recentlyDeleted);

    // Undo delete
    await useBookmarkStore.getState().undoDelete();
    assert.strictEqual(useBookmarkStore.getState().bookmarks.length, 1);
    assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has('1:1'), true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/stores/useBookmarkStore.test.mjs`  
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `useBookmarkStore.ts`**

Create `mobile/src/stores/useBookmarkStore.ts`:

```typescript
import { create } from 'zustand';
import * as bookmarkService from '../services/db/bookmarkService';
import type { HydratedBookmark, Tag } from '../types/bookmark';

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
  setSortBy: (sort: 'date_desc' | 'date_asc' | 'quran_order') => void;
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
      } catch (err) {
        console.warn('[BookmarkStore] delete failed, rolling back:', err);
        await get().loadBookmarks();
      }
      return false;
    } else {
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
      return true;
    }
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

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().loadBookmarks();
  },
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/stores/useBookmarkStore.test.mjs`  
Expected: PASS with all tests green.

- [ ] **Step 5: Commit Task 3**

```bash
git add mobile/src/stores/useBookmarkStore.ts mobile/src/stores/useBookmarkStore.test.mjs
git commit -m "feat(mobile): add reactive useBookmarkStore with optimistic updates and undo buffer"
```

---

### Task 4: Surah Reader Deep-Linking & Bookmark Synchronization

**Files:**

- Modify: `mobile/src/app/surah/[id].tsx`
- Modify: `mobile/src/components/reader/ContinuousVerseCard.tsx`
- Modify: `mobile/src/app/(tabs)/search.tsx`

- [ ] **Step 1: Wire `useBookmarkStore` in `ContinuousVerseCard.tsx`**

Update `ContinuousVerseCard.tsx` to support `isHighlighted` (golden aura pulse) prop and pass
`onToggleBookmark` directly connected to `useBookmarkStore`.

- [ ] **Step 2: Update `surah/[id].tsx` for deep-linking & auto-scroll**

In `surah/[id].tsx`:

1. Read URL params: `const { id, verse } = useLocalSearchParams<{ id: string; verse?: string }>();`
2. Subscribe to `useBookmarkStore`:
   `const { bookmarkedKeys, toggleBookmark: toggleStoreBookmark, loadBookmarks } = useBookmarkStore();`
   Run `loadBookmarks()` once on mount if empty.
3. Replace local `setBookmarkedKeys` with
   `toggleStoreBookmark({ verse_key: verse.verse_key, chapter_id: ch.id, verse_number: verse.verse_number })`.
4. In `loadChapterData`: if `verse` query param is present:
   - In **Mushaf mode**: lookup `targetVerse.page_number` and set
     `setCurrentPage(targetVerse.page_number)`.
   - In **Continuous mode**: set
     `highlightedVerseKey = `${chapterId}:${targetVerseNum}``and call`scrollToIndex`after FlatList mounts with`onScrollToIndexFailed`
     safety.
   - Set 2.5-second timer to clear `highlightedVerseKey`.

- [ ] **Step 3: Update `(tabs)/search.tsx` to pass verse param**

In `search.tsx`: Change:
`router.push(`/surah/${item.chapter_id}` as any)`
To:
`router.push(`/surah/${item.chapter_id}?verse=${item.verse_number}` as any)`

- [ ] **Step 4: Verify typecheck & tests**

Run: `yarn --cwd mobile typecheck`  
Expected: 0 errors.

- [ ] **Step 5: Commit Task 4**

```bash
git add mobile/src/app/surah/[id].tsx mobile/src/components/reader/ContinuousVerseCard.tsx mobile/src/app/(tabs)/search.tsx
git commit -m "feat(mobile): wire bookmark store into reader and enable verse deep-linking"
```

---

### Task 5: Full Bookmarks Tab Screen & Card Component

**Files:**

- Create: `mobile/src/components/bookmarks/BookmarkVerseCard.tsx`
- Rewrite: `mobile/src/app/(tabs)/bookmarks.tsx`

**Features:**

- Header with Persian count badge and sort selector (`جدیدترین`, `قدیمی‌ترین`, `به ترتیب قرآن`).
- Search input filtering Arabic text, Persian translations, and personal notes.
- Tag filter chips horizontally scrollable with counts.
- `BookmarkVerseCard`:
  - Surah name & Ayah badge (`سوره فاتحه • آیه ۲`).
  - Uthmani text with user font scale.
  - Persian translation according to active reading store setting.
  - Personal note editor with expand/collapse.
  - Action row: Play audio recitation (`AudioPlayerService`), Deep-link to reader
    (`/surah/[id]?verse=[verseNumber]`), Tag selector, Delete.
- Floating Undo snackbar.
- Spiritual empty state when no bookmarks match query/filter.

- [ ] **Step 1: Create `BookmarkVerseCard.tsx`**

Create `mobile/src/components/bookmarks/BookmarkVerseCard.tsx` with full Persian formatting, audio
preview, note editing, and deep-link navigation.

- [ ] **Step 2: Implement renewed `bookmarks.tsx`**

Rewrite `mobile/src/app/(tabs)/bookmarks.tsx` connecting directly to `useBookmarkStore`, providing
live tag filtering, search, and sorting.

- [ ] **Step 3: Verify typecheck & unit tests**

Run: `yarn --cwd mobile typecheck`  
Run: `yarn --cwd mobile test`  
Expected: All tests pass, 0 typecheck errors.

- [ ] **Step 4: Commit Task 5**

```bash
git add mobile/src/components/bookmarks/BookmarkVerseCard.tsx mobile/src/app/(tabs)/bookmarks.tsx
git commit -m "feat(mobile): build production-grade bookmarks screen with tag filters and search"
```

---

### Task 6: Final Verification & Standards Check

- [ ] **Step 1: Run full mobile test suite**

Run: `yarn --cwd mobile test`  
Expected: 240+ tests pass with 0 failures.

- [ ] **Step 2: Run TypeScript typecheck**

Run: `yarn --cwd mobile typecheck`  
Expected: 0 errors.

- [ ] **Step 3: Run agent check**

Run: `yarn --ignore-engines ai:check`  
Expected: 51/51 symlinks verified, all standards intact.
