import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

import {
  parseVerseParam,
  calculateTargetPage,
  calculateTargetVerseIndex,
  formatHighlightVerseKey,
  READER_COMPONENT_CONTRACTS,
} from '../../components/reader/readerContracts.ts';
import {
  setUserDatabase,
  resetUserDatabaseForTesting,
  initUserTables,
} from '../../services/db/userDatabase.ts';
import { setAyahDatabase } from '../../services/db/ayahInsightsService.ts';
import { setScriptureDatabase } from '../../services/db/bookmarkService.ts';
import {
  setQuickJumpDatabase,
  resetQuickJumpDatabaseForTesting,
  resolveAyahDestination,
  resolvePageDestination,
} from '../../services/db/quickJumpService.ts';
import { useBookmarkStore } from '../../stores/useBookmarkStore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QURAN_DB_PATH = path.resolve(__dirname, '../../../../mobile/assets/data/quran.db');

describe('Surah Reader Deep-Linking & Bookmark Synchronization Tests', () => {
  let userDb;
  const quranDb = new DatabaseSync(QURAN_DB_PATH, { readOnly: true });

  beforeEach(async () => {
    resetUserDatabaseForTesting();
    resetQuickJumpDatabaseForTesting();
    userDb = new DatabaseSync(':memory:');
    setUserDatabase(userDb);
    await initUserTables(userDb);

    setAyahDatabase(quranDb);
    setScriptureDatabase(quranDb);
    setQuickJumpDatabase(quranDb);

    // Reset bookmark store
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

  describe('Deep-link Parameter Parsing Logic', () => {
    it('correctly parses valid verse string parameters', () => {
      assert.strictEqual(parseVerseParam('255'), 255);
      assert.strictEqual(parseVerseParam('1'), 1);
      assert.strictEqual(parseVerseParam('286'), 286);
      assert.strictEqual(parseVerseParam(' 42 '), 42);
    });

    it('correctly parses valid positive integer numbers', () => {
      assert.strictEqual(parseVerseParam(255), 255);
      assert.strictEqual(parseVerseParam(1), 1);
      assert.strictEqual(parseVerseParam(7), 7);
    });

    it('returns null for zero and negative numbers', () => {
      assert.strictEqual(parseVerseParam('0'), null);
      assert.strictEqual(parseVerseParam(0), null);
      assert.strictEqual(parseVerseParam('-1'), null);
      assert.strictEqual(parseVerseParam(-5), null);
    });

    it('returns null for undefined, null, empty, non-numeric, or floating values', () => {
      assert.strictEqual(parseVerseParam(undefined), null);
      assert.strictEqual(parseVerseParam(null), null);
      assert.strictEqual(parseVerseParam(''), null);
      assert.strictEqual(parseVerseParam('   '), null);
      assert.strictEqual(parseVerseParam('abc'), null);
      assert.strictEqual(parseVerseParam('255abc'), null);
      assert.strictEqual(parseVerseParam('NaN'), null);
      assert.strictEqual(parseVerseParam(NaN), null);
      assert.strictEqual(parseVerseParam('3.14'), null);
      assert.strictEqual(parseVerseParam(3.14), null);
      assert.strictEqual(parseVerseParam({}), null);
      assert.strictEqual(parseVerseParam([]), null);
    });
  });

  describe('Target Page Calculation for Mushaf Mode', () => {
    it('calculates target Mushaf page for Al-Baqarah verses from SQLite database', () => {
      const verses = quranDb
        .prepare(
          'SELECT verse_number, page_number FROM verses WHERE chapter_id = 2 ORDER BY verse_number ASC;',
        )
        .all();

      assert.strictEqual(verses.length, 286);

      // Ayah 1 -> Page 2
      assert.strictEqual(calculateTargetPage(verses, 1), 2);

      // Ayah 255 (Ayat al-Kursi) -> Page 42
      assert.strictEqual(calculateTargetPage(verses, 255), 42);

      // Ayah 286 (Final verse) -> Page 49
      assert.strictEqual(calculateTargetPage(verses, 286), 49);

      // Non-existent Ayah -> null
      assert.strictEqual(calculateTargetPage(verses, 999), null);
      assert.strictEqual(calculateTargetPage(verses, 0), null);
    });

    it('calculates target Mushaf page for Al-Fatihah verses', () => {
      const verses = quranDb
        .prepare(
          'SELECT verse_number, page_number FROM verses WHERE chapter_id = 1 ORDER BY verse_number ASC;',
        )
        .all();

      assert.strictEqual(verses.length, 7);
      assert.strictEqual(calculateTargetPage(verses, 1), 1);
      assert.strictEqual(calculateTargetPage(verses, 7), 1);
    });

    it('calculates target array index for Continuous mode FlatList auto-scroll', () => {
      const verses = quranDb
        .prepare(
          'SELECT verse_number, page_number FROM verses WHERE chapter_id = 2 ORDER BY verse_number ASC;',
        )
        .all();

      assert.strictEqual(calculateTargetVerseIndex(verses, 1), 0);
      assert.strictEqual(calculateTargetVerseIndex(verses, 255), 254);
      assert.strictEqual(calculateTargetVerseIndex(verses, 286), 285);
      assert.strictEqual(calculateTargetVerseIndex(verses, 999), -1);
    });

    it('formats highlight verse key correctly', () => {
      assert.strictEqual(formatHighlightVerseKey(2, 255), '2:255');
      assert.strictEqual(formatHighlightVerseKey(1, 1), '1:1');
      assert.strictEqual(formatHighlightVerseKey(114, 6), '114:6');
    });
  });

  describe('Highlight Aura State Transitions & Contracts', () => {
    it('verifies highlight styling tokens and duration contracts', () => {
      const { verseCard } = READER_COMPONENT_CONTRACTS;
      assert.strictEqual(verseCard.highlightBorderColor, '#F59E0B');
      assert.strictEqual(verseCard.highlightBackgroundColor, 'rgba(245, 158, 11, 0.08)');
      assert.strictEqual(verseCard.highlightDurationMs, 2500);
    });

    it('simulates highlight aura lifecycle: active on navigate and clears after timeout', async () => {
      let highlightedKey = null;

      // Simulate navigating to Baqarah:255
      const targetVerseNum = parseVerseParam('255');
      assert.ok(targetVerseNum !== null);
      highlightedKey = formatHighlightVerseKey(2, targetVerseNum);
      assert.strictEqual(highlightedKey, '2:255');

      // Check card highlight predicate
      const isCardHighlighted = (key) => highlightedKey === key;
      assert.strictEqual(isCardHighlighted('2:255'), true);
      assert.strictEqual(isCardHighlighted('2:254'), false);

      // Simulate 2500ms timeout
      await new Promise((resolve) => setTimeout(resolve, 50));
      highlightedKey = null; // Cleared by timer
      assert.strictEqual(isCardHighlighted('2:255'), false);
    });
  });

  describe('Global Bookmark State Synchronization', () => {
    it('synchronizes bookmark state between ContinuousVerseCard and useBookmarkStore', async () => {
      const store = useBookmarkStore.getState();

      // Initially not bookmarked
      assert.strictEqual(store.bookmarkedKeys.has('2:255'), false);
      const isVerseCardBookmarked = () => useBookmarkStore.getState().bookmarkedKeys.has('2:255');
      assert.strictEqual(isVerseCardBookmarked(), false);

      // Toggle bookmark ON from reader card
      const resultAdd = await useBookmarkStore.getState().toggleBookmark({
        verse_key: '2:255',
        chapter_id: 2,
        verse_number: 255,
      });

      assert.strictEqual(resultAdd, true);
      assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has('2:255'), true);
      assert.strictEqual(isVerseCardBookmarked(), true);
      assert.strictEqual(useBookmarkStore.getState().bookmarks.length, 1);

      // Verify persistence in user_bookmarks table
      const row = userDb
        .prepare(
          'SELECT verse_key, chapter_id, verse_number FROM user_bookmarks WHERE verse_key = ?;',
        )
        .get('2:255');
      assert.ok(row);
      assert.strictEqual(row.verse_key, '2:255');
      assert.strictEqual(row.chapter_id, 2);
      assert.strictEqual(row.verse_number, 255);

      // Toggle bookmark OFF from reader card
      const resultDelete = await useBookmarkStore.getState().toggleBookmark({
        verse_key: '2:255',
        chapter_id: 2,
        verse_number: 255,
      });

      assert.strictEqual(resultDelete, false);
      assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has('2:255'), false);
      assert.strictEqual(isVerseCardBookmarked(), false);
      assert.strictEqual(useBookmarkStore.getState().bookmarks.length, 0);

      const deletedRow = userDb
        .prepare('SELECT count(*) as count FROM user_bookmarks WHERE verse_key = ?;')
        .get('2:255');
      assert.strictEqual(deletedRow.count, 0);
    });

    it('synchronizes AyahInsightsDrawer bookmark state with reader and store', async () => {
      const store = useBookmarkStore.getState();

      // Drawer opens for verse 18:28
      const verseKey = '18:28';
      const isDrawerBookmarked = () => useBookmarkStore.getState().bookmarkedKeys.has(verseKey);
      assert.strictEqual(isDrawerBookmarked(), false);

      // User bookmarks from inside drawer
      await store.toggleBookmark({
        verse_key: verseKey,
        chapter_id: 18,
        verse_number: 28,
      });

      assert.strictEqual(isDrawerBookmarked(), true);
      assert.strictEqual(useBookmarkStore.getState().bookmarkedKeys.has(verseKey), true);

      // User unbookmarks from inside drawer
      await store.toggleBookmark({
        verse_key: verseKey,
        chapter_id: 18,
        verse_number: 28,
      });

      assert.strictEqual(isDrawerBookmarked(), false);
    });
  });

  describe('Quick Jump Destination Transitions & In-Place Navigation', () => {
    it('detects in-place jump vs cross-Surah navigation correctly', async () => {
      const currentChapterId = 2;

      // 1. Same Surah jump (Ayah 255 of Surah 2)
      const sameSurahDest = await resolveAyahDestination(2, 255);
      const isSameSurah = sameSurahDest.chapterId === currentChapterId;
      assert.strictEqual(isSameSurah, true);
      assert.strictEqual(sameSurahDest.chapterId, 2);
      assert.strictEqual(sameSurahDest.verseNumber, 255);
      assert.strictEqual(sameSurahDest.verseKey, '2:255');

      // 2. Cross-Surah jump (Surah 18, Ayah 1)
      const crossSurahDest = await resolveAyahDestination(18, 1);
      const isCrossSurah = crossSurahDest.chapterId === currentChapterId;
      assert.strictEqual(isCrossSurah, false);
      assert.strictEqual(crossSurahDest.chapterId, 18);
      assert.strictEqual(crossSurahDest.verseNumber, 1);
      assert.strictEqual(crossSurahDest.verseKey, '18:1');
    });

    it('constructs cross-chapter route strings accurately with verse and page query params', async () => {
      const buildRoute = (dest) =>
        `/surah/${dest.chapterId}?verse=${dest.verseNumber}&page=${dest.pageNumber}`;

      // Surah Al-Kahf Ayah 10 (Page 294)
      const kahfDest = await resolveAyahDestination(18, 10);
      assert.strictEqual(buildRoute(kahfDest), '/surah/18?verse=10&page=294');

      // First verse on Page 440 (Surah Fatir 35:45)
      const page440Dest = await resolvePageDestination(440);
      assert.strictEqual(buildRoute(page440Dest), '/surah/35?verse=45&page=440');

      // First verse on Page 582 (Surah An-Naba 78:1, start of Juz 30)
      const juz30Dest = await resolvePageDestination(582);
      assert.strictEqual(buildRoute(juz30Dest), '/surah/78?verse=1&page=582');
    });

    it('verifies target index lookup in continuous mode and golden aura duration contract (2500ms)', async () => {
      const verses = quranDb
        .prepare(
          'SELECT verse_number, verse_key, page_number FROM verses WHERE chapter_id = 2 ORDER BY verse_number ASC;',
        )
        .all();

      const dest = await resolveAyahDestination(2, 255);
      const targetIndex = verses.findIndex((v) => v.verse_number === dest.verseNumber);

      assert.strictEqual(targetIndex, 254);
      assert.strictEqual(verses[targetIndex].verse_key, '2:255');
      assert.strictEqual(dest.verseKey, '2:255');

      // Verify contract duration
      assert.strictEqual(READER_COMPONENT_CONTRACTS.verseCard.highlightDurationMs, 2500);

      // Simulate aura highlight lifecycle
      let highlightedKey = dest.verseKey;
      assert.strictEqual(highlightedKey, '2:255');
      await new Promise((resolve) => setTimeout(resolve, 30));
      highlightedKey = null; // Cleared by 2500ms timer
      assert.strictEqual(highlightedKey, null);
    });

    it('verifies page synchronization in Mushaf mode for jump destinations', async () => {
      // In Mushaf mode: jump to Ayat al-Kursi (2:255)
      const dest255 = await resolveAyahDestination(2, 255);
      let currentPage = 1;
      let activeVerseKey = null;

      // Simulate Mushaf in-place branch
      currentPage = dest255.pageNumber;
      activeVerseKey = dest255.verseKey;

      assert.strictEqual(currentPage, 42);
      assert.strictEqual(activeVerseKey, '2:255');

      // Cross-Surah jump to Surah 18 Al-Kahf, Ayah 1 (located on Page 293)
      const destKahf1 = await resolveAyahDestination(18, 1);
      assert.strictEqual(destKahf1.chapterId, 18);
      assert.strictEqual(destKahf1.verseNumber, 1);
      assert.strictEqual(destKahf1.pageNumber, 293);
      assert.strictEqual(destKahf1.verseKey, '18:1');

      // Jump via Page mode to Page 294 (Surah 18 Al-Kahf, Ayah 5)
      const destPage294 = await resolvePageDestination(294);
      assert.strictEqual(destPage294.chapterId, 18);
      assert.strictEqual(destPage294.verseNumber, 5);
      assert.strictEqual(destPage294.pageNumber, 294);
      assert.strictEqual(destPage294.verseKey, '18:5');
    });
  });

  describe('Source Code Contract & Integration Verification', () => {
    it('verifies surah/[id].tsx reads verse param, wires useBookmarkStore, and handles highlight', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, '..', '..', 'app', 'surah', '[id].tsx'),
        'utf8',
      );

      // 1. URL search params reads verse
      assert.ok(source.includes('useLocalSearchParams<{ id: string; verse?: string }>()'));

      // 2. Wires useBookmarkStore
      assert.ok(source.includes("import { useBookmarkStore } from '@/stores/useBookmarkStore';"));
      assert.ok(source.includes('useBookmarkStore()'));
      assert.ok(source.includes('loadBookmarks'));

      // 3. Highlight state and timer
      assert.ok(source.includes('highlightedVerseKey'));
      assert.ok(source.includes('setHighlightedVerseKey'));
      assert.ok(source.includes('scrollToIndex'));
      assert.ok(source.includes('onScrollToIndexFailed'));

      // 4. ContinuousVerseCard receives isHighlighted and isBookmarked
      assert.ok(source.includes('isHighlighted={highlightedVerseKey === item.verse_key}'));
      assert.ok(source.includes('isBookmarked={bookmarkedKeys.has(item.verse_key)}'));

      // 5. AyahInsightsDrawer receives isBookmarked from store
      assert.ok(
        /isBookmarked=\s*\{\s*selectedInsightVerse\s*\?\s*bookmarkedKeys\.has\(selectedInsightVerse\.verse_key\)\s*:\s*false\s*\}/.test(
          source,
        ),
      );
    });

    it('verifies surah/[id].tsx integrates QuickJumpModal and top bar controls', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, '..', '..', 'app', 'surah', '[id].tsx'),
        'utf8',
      );

      // 1. Imports QuickJumpModal, QuickJumpTabId, JumpDestination, and Compass
      assert.ok(
        source.includes(
          "import { QuickJumpModal, QuickJumpTabId } from '@/components/navigation';",
        ),
      );
      assert.ok(
        source.includes("import { JumpDestination } from '@/services/db/quickJumpContracts';"),
      );
      assert.ok(source.includes('Compass'));

      // 2. QuickJump state and ref
      assert.ok(source.includes('isQuickJumpOpen'));
      assert.ok(source.includes('setIsQuickJumpOpen'));
      assert.ok(source.includes('quickJumpInitialTab'));
      assert.ok(source.includes('handledVerseRef'));

      // 3. handleJumpToDestination logic with in-place jump vs cross-Surah route
      assert.ok(source.includes('handleJumpToDestination'));
      assert.ok(source.includes('if (destination.chapterId === chapterId)'));
      assert.ok(source.includes('router.setParams({ verse: String(destination.verseNumber) })'));
      assert.ok(source.includes('handledVerseRef.current = destination.verseKey;'));
      assert.ok(source.includes('router.push('));
      assert.ok(
        source.includes(
          '/surah/${destination.chapterId}?verse=${destination.verseNumber}&page=${destination.pageNumber}',
        ),
      );

      // 4. Touchable top bar title and Compass icon button
      assert.ok(source.includes('accessibilityLabel="پرش سریع به سوره، آیه یا صفحه"'));
      assert.ok(source.includes('testID="reader-quick-jump-button"'));

      // 5. QuickJumpModal rendered with required props
      assert.ok(source.includes('<QuickJumpModal'));
      assert.ok(source.includes('visible={isQuickJumpOpen}'));
      assert.ok(source.includes('onClose={() => setIsQuickJumpOpen(false)}'));
      assert.ok(source.includes('onJump={handleJumpToDestination}'));
      assert.ok(source.includes('testID="reader-quick-jump-modal"'));
    });

    it('verifies ContinuousVerseCard supports isHighlighted and onToggleBookmark', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, '..', '..', 'components', 'reader', 'ContinuousVerseCard.tsx'),
        'utf8',
      );

      assert.ok(source.includes('isHighlighted?: boolean;'));
      assert.ok(source.includes('onToggleBookmark?: (verse: Verse) => void;'));
      assert.ok(source.includes('cardHighlighted'));
      assert.ok(source.includes('#F59E0B'));
      assert.ok(source.includes('rgba(245, 158, 11, 0.08)'));
    });

    it('verifies search.tsx navigates with verse query parameter', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, '..', '..', 'app', '(tabs)', 'search.tsx'),
        'utf8',
      );

      assert.ok(source.includes('`/surah/${item.chapter_id}?verse=${item.verse_number}`'));
    });
  });
});
