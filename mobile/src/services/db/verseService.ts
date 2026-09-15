import { getDatabase } from './database';
import { Verse, Word } from '@/types/quran';

/**
 * Fetches verses for a given Surah, with optional word-by-word data.
 */
export async function getVersesByChapter(
  chapterId: number,
  options: { includeWords?: boolean; limit?: number; offset?: number } = {}
): Promise<Verse[]> {
  const db = await getDatabase();
  const { includeWords = true, limit = 300, offset = 0 } = options;

  const query = `
    SELECT * FROM verses
    WHERE chapter_id = ?
    ORDER BY verse_number ASC
    LIMIT ? OFFSET ?;
  `;
  const verses = await db.getAllAsync<Verse>(query, [chapterId, limit, offset]);

  if (includeWords && verses.length > 0) {
    const wordsQuery = `
      SELECT * FROM words
      WHERE chapter_id = ?
      ORDER BY verse_number ASC, position ASC;
    `;
    const allWords = await db.getAllAsync<Word>(wordsQuery, [chapterId]);

    const wordsByVerse = new Map<string, Word[]>();
    for (const w of allWords) {
      if (!wordsByVerse.has(w.verse_key)) {
        wordsByVerse.set(w.verse_key, []);
      }
      wordsByVerse.get(w.verse_key)!.push(w);
    }

    for (const v of verses) {
      v.words = wordsByVerse.get(v.verse_key) || [];
    }
  }

  return verses;
}

/**
 * Fetches a single Ayah by verse_key (e.g. "1:1").
 */
export async function getAyahByKey(verseKey: string): Promise<Verse | null> {
  const db = await getDatabase();
  const query = `SELECT * FROM verses WHERE verse_key = ? LIMIT 1;`;
  const verse = await db.getFirstAsync<Verse>(query, [verseKey]);

  if (verse) {
    const wordsQuery = `
      SELECT * FROM words
      WHERE verse_key = ?
      ORDER BY position ASC;
    `;
    verse.words = await db.getAllAsync<Word>(wordsQuery, [verseKey]);
  }

  return verse || null;
}
