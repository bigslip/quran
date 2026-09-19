/* eslint-disable import/extensions, @typescript-eslint/naming-convention, no-restricted-syntax, no-await-in-loop, max-lines, react-func/max-lines-per-function, prefer-template */
import type { Tag, BookmarkRow, HydratedBookmark } from '../../types/bookmark.ts';

import { adaptDatabase, type SQLiteLikeDb } from './ayahInsightsService.ts';
import { getUserDatabase } from './userDatabase.ts';

let customScriptureDb: SQLiteLikeDb | null = null;

export function setScriptureDatabase(db: any): void {
  customScriptureDb = db ? adaptDatabase(db) : null;
}

function generateId(): string {
  return `bm_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
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
    count: Number(r.count) || 0,
  }));
}

export async function createCustomTag(name: string, color = '#10B981'): Promise<Tag> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Tag name cannot be empty');
  }
  if (trimmed.includes(',')) {
    throw new Error('Tag name cannot contain commas');
  }

  const userDb = await getUserDatabase();
  const existing = await userDb.getFirst<{
    id: string;
    name: string;
    color: string;
    is_preset: number;
  }>('SELECT id, name, color, is_preset FROM user_tags WHERE name = ?;', [trimmed]);
  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      color: existing.color,
      is_preset: Boolean(existing.is_preset),
      count: 0,
    };
  }

  const id = `tag_${Date.now().toString(36)}`;
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

export async function deleteBookmarkByVerseKey(verseKey: string): Promise<boolean> {
  const userDb = await getUserDatabase();
  if (userDb.run) {
    const bm = await userDb.getFirst<{ id: string }>(
      'SELECT id FROM user_bookmarks WHERE verse_key = ?;',
      [verseKey],
    );
    if (bm) {
      await userDb.run('DELETE FROM bookmark_tag_map WHERE bookmark_id = ?;', [bm.id]);
      await userDb.run('DELETE FROM user_bookmarks WHERE id = ?;', [bm.id]);
      return true;
    }
  }
  return false;
}

export async function deleteBookmark(id: string): Promise<boolean> {
  const userDb = await getUserDatabase();
  if (userDb.run) {
    await userDb.run('DELETE FROM bookmark_tag_map WHERE bookmark_id = ?;', [id]);
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

function parseBookmarkTags(
  tagIds?: string | null,
  tagNames?: string | null,
  tagColors?: string | null,
): Tag[] {
  const tags: Tag[] = [];
  if (tagIds && tagNames) {
    const ids = tagIds.split(',');
    const names = tagNames.split(',');
    const colors = (tagColors || '').split(',');
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
  return tags;
}

async function resolveQuranDatabase(): Promise<SQLiteLikeDb> {
  if (customScriptureDb) {
    return customScriptureDb;
  }
  const dbModule = await import('./database.ts');
  const expoDb = await dbModule.getDatabase();
  return adaptDatabase(expoDb);
}

export async function getAllHydratedBookmarks(
  sortBy: 'date_desc' | 'date_asc' | 'quran_order' = 'date_desc',
): Promise<HydratedBookmark[]> {
  const userDb = await getUserDatabase();

  let orderBy = 'b.created_at DESC, b.id DESC';
  if (sortBy === 'date_asc') orderBy = 'b.created_at ASC, b.id ASC';
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

  const quranDb = await resolveQuranDatabase();
  const verseKeys = bookmarkRows.map((b) => b.verse_key);
  const scriptureMap = new Map<string, any>();
  const CHUNK_SIZE = 500;

  for (let i = 0; i < verseKeys.length; i += CHUNK_SIZE) {
    const chunk = verseKeys.slice(i, i + CHUNK_SIZE);
    const placeholders = chunk.map(() => '?').join(',');
    const scriptureRows = await quranDb.getAll(
      `SELECT 
        v.verse_key, v.text_uthmani, v.text_indopak,
        v.translation_fa_makarem, v.translation_fa_ansarian, v.translation_en_saheeh,
        v.page_number, v.juz_number,
        c.name_fa AS chapter_name_fa, c.name_arabic AS chapter_name_arabic
      FROM verses v
      JOIN chapters c ON c.id = v.chapter_id
      WHERE v.verse_key IN (${placeholders});`,
      chunk,
    );

    for (const row of scriptureRows) {
      scriptureMap.set(row.verse_key, row);
    }
  }

  return bookmarkRows.map((b) => {
    const sc = scriptureMap.get(b.verse_key) || {};
    const tags = parseBookmarkTags(b.tag_ids, b.tag_names, b.tag_colors);

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

export async function addBookmark(params: {
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  note?: string;
  tag_ids?: string[];
}): Promise<HydratedBookmark> {
  const userDb = await getUserDatabase();
  const now = Date.now();

  const existing = await userDb.getFirst<{ id: string; created_at: number; note?: string | null }>(
    'SELECT id, created_at, note FROM user_bookmarks WHERE verse_key = ?;',
    [params.verse_key],
  );

  const id = existing ? existing.id : generateId();
  const createdAt = existing ? existing.created_at : now;
  const noteToSave =
    params.note !== undefined ? params.note.trim() || null : existing?.note || null;

  if (userDb.run) {
    if (existing) {
      await userDb.run(
        'UPDATE user_bookmarks SET chapter_id = ?, verse_number = ?, note = ?, updated_at = ? WHERE id = ?;',
        [params.chapter_id, params.verse_number, noteToSave, now, id],
      );
    } else {
      await userDb.run(
        `INSERT INTO user_bookmarks (id, verse_key, chapter_id, verse_number, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [id, params.verse_key, params.chapter_id, params.verse_number, noteToSave, createdAt, now],
      );
    }

    if (params.tag_ids !== undefined) {
      await userDb.run('DELETE FROM bookmark_tag_map WHERE bookmark_id = ?;', [id]);
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
