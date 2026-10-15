# Specification & Design: Persistent Bookmarks & Reader Deep-Linking

**Author:** Antigravity Engineering  
**Date:** September 18, 2026  
**Status:** Approved for Implementation  
**Target:** Quran.ir Mobile App (`mobile/`)

---

## 1. Executive Summary & Goals

This document specifies the architecture, data models, state synchronization, and UI components for
the **Persistent Bookmarks System** and **Reader Deep-Linking** in the Quran.ir mobile application.

### Key Objectives

1. **Durable, Loss-Immune Persistence**: Decouple mutable user data (bookmarks, reflections, tags)
   into an isolated `quran_user.db` database, ensuring app asset updates and `quran.db` refreshes
   never delete user data.
2. **Instant $O(1)$ Reactive State**: Maintain a memory-cached `Set<string>` of bookmarked verse
   keys in `useBookmarkStore` for instant 60fps rendering in virtualized reader lists.
3. **Deep-Linking & Auto-Scroll**: Support navigating to `/surah/[id]?verse=[verseNumber]` from
   search or bookmarks, automatically setting the correct Mushaf page or scrolling the continuous
   list to the verse with a visual golden aura highlight.
4. **Comprehensive Bookmarks Tab (`bookmarks.tsx`)**: Replace the static empty placeholder with a
   rich, searchable, tag-filtered list of saved verses featuring audio recitation, quick notes, and
   undo deletion.

---

## 2. Architecture & Data Model

### 2.1 Database Separation (`quran.db` vs `quran_user.db`)

```
┌─────────────────────────────────────────────────────────────┐
│                       Mobile Client                         │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │       quran.db       │        │    quran_user.db     │
    │  (Immutable Scripture)│       │  (Mutable User Data) │
    ├──────────────────────┤        ├──────────────────────┤
    │ • chapters (114)     │        │ • user_bookmarks     │
    │ • verses (6,236)     │        │ • user_tags          │
    │ • words (77,430)     │        │ • bookmark_tag_map   │
    │ • search_fts         │        │ • user_reflections   │
    └──────────────────────┘        └──────────────────────┘
         Read-Only                       Read-Write (WAL)
         Bundled Asset                   Device Protected
```

### 2.2 SQLite Schema (`quran_user.db`)

```sql
-- 1. Bookmarks Table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id TEXT PRIMARY KEY,
  verse_key TEXT NOT NULL UNIQUE,
  chapter_id INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 2. Categorization Tags Table
CREATE TABLE IF NOT EXISTS user_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#10B981',
  is_preset INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- 3. Many-to-Many Join Table
CREATE TABLE IF NOT EXISTS bookmark_tag_map (
  bookmark_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (bookmark_id, tag_id),
  FOREIGN KEY (bookmark_id) REFERENCES user_bookmarks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES user_tags(id) ON DELETE CASCADE
);

-- 4. User Reflections Table (Migrated from quran.db)
CREATE TABLE IF NOT EXISTS user_reflections (
  verse_key TEXT PRIMARY KEY,
  reflection TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_verse_key ON user_bookmarks (verse_key);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON user_bookmarks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_quran_order ON user_bookmarks (chapter_id ASC, verse_number ASC);
CREATE INDEX IF NOT EXISTS idx_bookmark_tag_map_tag ON bookmark_tag_map (tag_id);
```

### 2.3 Preset Tags Seed

On first initialization of `quran_user.db`, seed the following curated tags:

- `منتخب` (Favorites) - Gold (`#F59E0B`)
- `دعا و نیایش` (Supplications) - Emerald (`#10B981`)
- `آرامش‌بخش` (Comfort) - Teal (`#14B8A6`)
- `حفظ قرآن` (Memorization) - Indigo (`#6366F1`)
- `تدبر و اندیشه` (Reflection) - Purple (`#8B5CF6`)

---

## 3. Hydration & Cross-Database Queries

To display complete bookmark cards with Uthmani text, Surah names, and translations without copying
scripture into the user database:

1. **Step 1**: Retrieve bookmarks and mapped tags from `quran_user.db`:
   ```sql
   SELECT
     b.id, b.verse_key, b.chapter_id, b.verse_number, b.note, b.created_at, b.updated_at,
     GROUP_CONCAT(t.id) AS tag_ids,
     GROUP_CONCAT(t.name) AS tag_names,
     GROUP_CONCAT(t.color) AS tag_colors
   FROM user_bookmarks b
   LEFT JOIN bookmark_tag_map m ON m.bookmark_id = b.id
   LEFT JOIN user_tags t ON t.id = m.tag_id
   GROUP BY b.id
   ORDER BY b.created_at DESC;
   ```
2. **Step 2**: Query scripture text from `quran.db`:
   ```sql
   SELECT
     v.verse_key, v.text_uthmani, v.text_indopak,
     v.translation_fa_makarem, v.translation_fa_ansarian, v.translation_en_saheeh,
     v.page_number, v.juz_number,
     c.name_fa AS chapter_name_fa, c.name_arabic AS chapter_name_arabic
   FROM verses v
   JOIN chapters c ON c.id = v.chapter_id
   WHERE v.verse_key IN (?, ?, ...);
   ```
3. Merge in memory to produce `HydratedBookmark[]`. For $N \le 100$ bookmarks, this completes in
   under $2\text{ms}$.

---

## 4. State Management (`useBookmarkStore.ts`)

```typescript
export interface HydratedBookmark {
  id: string;
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  note?: string;
  tags: Tag[];
  created_at: number;
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

export interface BookmarkStore {
  bookmarks: HydratedBookmark[];
  bookmarkedKeys: Set<string>;
  tags: Tag[];
  selectedTagId: string | null;
  searchQuery: string;
  sortBy: 'date_desc' | 'date_asc' | 'quran_order';
  loading: boolean;
  recentlyDeleted: HydratedBookmark | null;

  init: () => Promise<void>;
  toggleBookmark: (verseKey: string, chapterId: number, verseNumber: number) => Promise<boolean>;
  updateBookmarkNote: (verseKey: string, note: string) => Promise<void>;
  setBookmarkTags: (bookmarkId: string, tagIds: string[]) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  setSelectedTagId: (tagId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'date_desc' | 'date_asc' | 'quran_order') => void;
}
```

- **Optimistic UI Updates**: Toggling a bookmark updates `bookmarkedKeys` immediately in memory,
  then writes asynchronously to SQLite.
- **Node.js Test Fallback**: When running in `node --test` environments, all operations seamlessly
  fallback to in-memory maps, guaranteeing fast, hermetic test execution.

---

## 5. Surah Reader Deep-Linking & Auto-Scroll

### 5.1 Route Navigation

When tapping any bookmark in `bookmarks.tsx` or a search result in `search.tsx`:

```typescript
router.push({
  pathname: '/surah/[id]',
  params: { id: item.chapter_id, verse: item.verse_number },
});
```

### 5.2 Handling in `mobile/src/app/surah/[id].tsx`

1. Read URL parameters:
   ```typescript
   const { id, verse } = useLocalSearchParams<{ id: string; verse?: string }>();
   const targetVerseNum = verse ? parseInt(verse, 10) : null;
   ```
2. **Mushaf Mode Handling**: When chapter verses are loaded, lookup `targetVerse.page_number` and
   immediately set `setCurrentPage(targetVerse.page_number)`.
3. **Continuous Mode Two-Pass Scroll**:
   ```typescript
   useEffect(() => {
     if (!loading && targetVerseNum && verses.length > 0) {
       const index = verses.findIndex((v) => v.verse_number === targetVerseNum);
       if (index >= 0) {
         setHighlightedVerseKey(`${chapterId}:${targetVerseNum}`);
         setTimeout(() => {
           flatListRef.current?.scrollToIndex({
             index,
             animated: true,
             viewPosition: 0.15,
           });
         }, 180);
       }
     }
   }, [loading, targetVerseNum, verses]);
   ```
4. **Visual Aura Pulse**: The targeted verse card displays an emerald-gold glowing border for 2.5
   seconds, then fades back to normal.

---

## 6. Bookmarks Screen UI/UX (`bookmarks.tsx`)

1. **Header & Search**:
   - Screen title with Persian count: `نشانه‌ها و یادداشت‌ها (۱۲ آیه ذخیره شده)`
   - Search bar filtering across Arabic text, Persian translations, notes, and Surah names.
   - Sort modal selector (`جدیدترین`, `قدیمی‌ترین`, `به ترتیب سوره و آیه`).
2. **Horizontal Filter Chips**:
   - `همه (۱۲)`
   - Tag chips with color badges and count (`منتخب (۵)`, `دعا و نیایش (۳)`, etc.).
3. **Card Component (`BookmarkVerseCard`)**:
   - Chapter badge with rosette Ayah number.
   - Uthmani script with selected font scale.
   - Persian translation (Makarem/Ansarian according to reading settings).
   - Expandable user note input with live update.
   - Tag selector button.
   - Action bar: Audio recitation play button, Go to Surah reader button, and Delete button.
4. **Undo Snackbar**:
   - 4-second floating notification allowing users to undo accidental deletions.
5. **Empty State**:
   - Geometric floral watermark, spiritual Persian guide text, and a prominent button to explore the
     Surah catalog.

---

## 7. Verification & Testing Strategy

1. **Unit Tests (`userDatabase.test.mjs`, `bookmarkService.test.mjs`,
   `useBookmarkStore.test.mjs`)**:
   - Verify table creation, indices, and foreign key constraints.
   - Test bookmark addition, duplicate prevention (UPSERT/ignore), deletion, and tag associations.
   - Test sorting by `date_desc`, `date_asc`, and `quran_order`.
   - Test undo deletion restoration.
2. **Reader Integration Tests (`surahReader.test.mjs`)**:
   - Test deep-link param parsing (`id` + `verse`).
   - Test Mushaf page alignment for targeted verses (e.g. Ayah 255 on Page 42).
3. **TypeScript Validation**:
   - `yarn --cwd mobile typecheck` with 0 errors.
