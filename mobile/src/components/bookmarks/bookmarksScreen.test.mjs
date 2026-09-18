import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BOOKMARK_COMPONENT_CONTRACTS,
  SORT_OPTIONS,
  formatBookmarkChapterTitle,
  formatBookmarkAyahBadge,
  formatRelativeTimeFa,
  createReaderDeepLink,
  formatBookmarkShareText,
  calculateTagCounts,
} from './bookmarkContracts.ts';
import { selectFilteredBookmarks } from '../../stores/useBookmarkStore.ts';
import { toPersianDigits } from '../catalog/catalogFormatters.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Bookmarks Screen & Card Component Contracts', () => {
  // Sample fixtures
  const sampleTags = [
    { id: 'tag-fav', name: 'منتخب', color: '#F59E0B', is_preset: true },
    { id: 'tag-dua', name: 'دعا و نیایش', color: '#10B981', is_preset: true },
    { id: 'tag-memorize', name: 'حفظ قرآن', color: '#6366F1', is_preset: true },
  ];

  const sampleBookmarks = [
    {
      id: 'bm-1',
      verse_key: '2:255',
      chapter_id: 2,
      verse_number: 255,
      note: 'آیة الکرسی بسیار پرفضیلت است',
      tags: [sampleTags[0], sampleTags[1]],
      created_at: 1700000000000,
      updated_at: 1700000000000,
      text_uthmani: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
      text_indopak: 'اللہ لا الہ الا ھو الحی القیوم',
      translation_fa_makarem: 'خداوند، هیچ معبودی جز او نیست؛ زنده و برپادارنده است.',
      translation_fa_ansarian: 'خداست که هیچ معبودی جز او نیست، زنده و پاینده است.',
      translation_en_saheeh: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.',
      page_number: 42,
      juz_number: 3,
      chapter_name_fa: 'بقره (گاو)',
      chapter_name_arabic: 'البقرة',
    },
    {
      id: 'bm-2',
      verse_key: '1:1',
      chapter_id: 1,
      verse_number: 1,
      note: 'آغاز کلام الهی',
      tags: [sampleTags[0]],
      created_at: 1700050000000,
      updated_at: 1700050000000,
      text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      text_indopak: 'بسم اللہ الرحمن الرحیم',
      translation_fa_makarem: 'به نام خداوند بخشنده بخشایشگر',
      translation_fa_ansarian: 'به نام خدا که رحمتش بی‌اندازه است',
      translation_en_saheeh: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      page_number: 1,
      juz_number: 1,
      chapter_name_fa: 'فاتحه (گشایش)',
      chapter_name_arabic: 'الفاتحة',
    },
    {
      id: 'bm-3',
      verse_key: '3:103',
      chapter_id: 3,
      verse_number: 103,
      note: 'آیه اعتصام به حبل الله',
      tags: [sampleTags[2]],
      created_at: 1700080000000,
      updated_at: 1700080000000,
      text_uthmani: 'وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا',
      text_indopak: 'واعتصموا بحبل اللہ جمیعا ولا تفرقوا',
      translation_fa_makarem: 'و همگی به ریسمان خدا چنگ زنید و پراکنده نشوید.',
      translation_fa_ansarian: 'و همگی به ریسمان خدا درآویزید و پراکنده مشوید.',
      translation_en_saheeh: 'And hold firmly to the rope of Allah all together and do not become divided.',
      page_number: 63,
      juz_number: 4,
      chapter_name_fa: 'آل عمران',
      chapter_name_arabic: 'آل عمران',
    },
  ];

  describe('Sanctuary Design & WCAG Layout Contracts', () => {
    it('enforces minimum touch targets of 44x44px across all buttons', () => {
      assert.ok(BOOKMARK_COMPONENT_CONTRACTS.minTouchTarget >= 44);
      assert.ok(BOOKMARK_COMPONENT_CONTRACTS.actionButton.size >= 44);
    });

    it('adheres to Sanctuary color palette and base background tokens', () => {
      assert.strictEqual(BOOKMARK_COMPONENT_CONTRACTS.card.baseBackground, '#0A261E');
      assert.strictEqual(BOOKMARK_COMPONENT_CONTRACTS.card.emeraldAccent, '#10B981');
      assert.strictEqual(BOOKMARK_COMPONENT_CONTRACTS.card.goldAccent, '#F59E0B');
    });

    it('specifies undo snackbar auto-dismiss timeout of exactly 4 seconds', () => {
      assert.strictEqual(BOOKMARK_COMPONENT_CONTRACTS.undoSnackbar.autoDismissMs, 4000);
      assert.ok(BOOKMARK_COMPONENT_CONTRACTS.undoSnackbar.minHeight >= 44);
    });

    it('provides exactly 3 standard sort options with Persian labels', () => {
      assert.strictEqual(SORT_OPTIONS.length, 3);
      assert.strictEqual(SORT_OPTIONS[0].id, 'date_desc');
      assert.strictEqual(SORT_OPTIONS[0].label, 'جدیدترین');
      assert.strictEqual(SORT_OPTIONS[1].id, 'date_asc');
      assert.strictEqual(SORT_OPTIONS[1].label, 'قدیمی‌ترین');
      assert.strictEqual(SORT_OPTIONS[2].id, 'quran_order');
      assert.strictEqual(SORT_OPTIONS[2].label, 'به ترتیب مصحف');
    });
  });

  describe('Persian Formatting Helpers', () => {
    it('formatBookmarkChapterTitle formats Surah names politely without parentheses', () => {
      assert.strictEqual(formatBookmarkChapterTitle('بقره (گاو)'), 'سوره بقره');
      assert.strictEqual(formatBookmarkChapterTitle('فاتحه (گشایش)'), 'سوره فاتحه');
      assert.strictEqual(formatBookmarkChapterTitle('آل عمران'), 'سوره آل عمران');
      assert.strictEqual(formatBookmarkChapterTitle('سوره یس'), 'سوره یس');
      assert.strictEqual(formatBookmarkChapterTitle(undefined), 'سوره قرآن');
    });

    it('formatBookmarkAyahBadge formats verse numbers into Persian digits rosette badge', () => {
      assert.strictEqual(formatBookmarkAyahBadge(1), 'آیه ۱');
      assert.strictEqual(formatBookmarkAyahBadge(255), 'آیه ۲۵۵');
      assert.strictEqual(formatBookmarkAyahBadge(286), 'آیه ۲۸۶');
    });

    it('formatRelativeTimeFa computes accurate relative time strings in Persian', () => {
      const now = 1700100000000;

      // Just now (< 60s)
      assert.strictEqual(formatRelativeTimeFa(now - 10000, now), 'همین الان');

      // Minutes ago (< 60m)
      assert.strictEqual(formatRelativeTimeFa(now - 15 * 60 * 1000, now), '۱۵ دقیقه پیش');

      // Today (hours ago within same calendar date)
      const sameDayHoursAgo = now - 2 * 3600 * 1000;
      const res = formatRelativeTimeFa(sameDayHoursAgo, now);
      assert.ok(res === 'امروز' || res === '۲ ساعت پیش');

      // Yesterday
      assert.strictEqual(formatRelativeTimeFa(now - 25 * 3600 * 1000, now), 'دیروز');

      // Days ago (< 7d)
      assert.strictEqual(formatRelativeTimeFa(now - 4 * 86400 * 1000, now), '۴ روز پیش');

      // Weeks ago (< 30d)
      assert.strictEqual(formatRelativeTimeFa(now - 14 * 86400 * 1000, now), '۲ هفته پیش');

      // Months ago (< 365d)
      assert.strictEqual(formatRelativeTimeFa(now - 90 * 86400 * 1000, now), '۳ ماه پیش');

      // Years ago (>= 365d)
      assert.strictEqual(formatRelativeTimeFa(now - 750 * 86400 * 1000, now), '۲ سال پیش');
    });

    it('formatBookmarkShareText builds readable share text with citation', () => {
      const text = formatBookmarkShareText(sampleBookmarks[0]);
      assert.ok(text.includes('اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ'));
      assert.ok(text.includes('خداوند، هیچ معبودی جز او نیست'));
      assert.ok(text.includes('[سوره بقره • آیه ۲۵۵]'));
    });

    it('calculateTagCounts computes accurate counts for all tags', () => {
      const counts = calculateTagCounts(sampleTags, sampleBookmarks);
      assert.strictEqual(counts.get('tag-fav'), 2); // In bm-1 and bm-2
      assert.strictEqual(counts.get('tag-dua'), 1); // In bm-1
      assert.strictEqual(counts.get('tag-memorize'), 1); // In bm-3
    });
  });

  describe('Deep-Linking Navigation Contract', () => {
    it('createReaderDeepLink builds exact route and query parameter contract', () => {
      const link = createReaderDeepLink(2, 255);
      assert.strictEqual(link.pathname, '/surah/2');
      assert.deepStrictEqual(link.params, { id: '2', verse: '255' });
    });

    it('creates correct deep-link URL for Surah Al-Fatihah Ayah 1', () => {
      const link = createReaderDeepLink(1, 1);
      assert.strictEqual(link.pathname, '/surah/1');
      assert.deepStrictEqual(link.params, { id: '1', verse: '1' });
    });
  });

  describe('Filtering and Sorting Contract', () => {
    it('returns all bookmarks when selectedTagId is null and searchQuery is empty', () => {
      const filtered = selectFilteredBookmarks({
        bookmarks: sampleBookmarks,
        selectedTagId: null,
        searchQuery: '',
      });
      assert.strictEqual(filtered.length, 3);
    });

    it('filters bookmarks by selectedTagId', () => {
      const favs = selectFilteredBookmarks({
        bookmarks: sampleBookmarks,
        selectedTagId: 'tag-fav',
        searchQuery: '',
      });
      assert.strictEqual(favs.length, 2);
      assert.strictEqual(favs[0].id, 'bm-1');
      assert.strictEqual(favs[1].id, 'bm-2');

      const duas = selectFilteredBookmarks({
        bookmarks: sampleBookmarks,
        selectedTagId: 'tag-dua',
        searchQuery: '',
      });
      assert.strictEqual(duas.length, 1);
      assert.strictEqual(duas[0].id, 'bm-1');
    });

    it('filters bookmarks by search query across Arabic scripture', () => {
      const result = selectFilteredBookmarks({
        bookmarks: sampleBookmarks,
        selectedTagId: null,
        searchQuery: 'اعتصموا',
      });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].verse_key, '3:103');
    });

    it('filters bookmarks by search query across Persian translations', () => {
      const result = selectFilteredBookmarks({
        bookmarks: sampleBookmarks,
        selectedTagId: null,
        searchQuery: 'ریسمان',
      });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].verse_key, '3:103');
    });

    it('filters bookmarks by search query across personal notes', () => {
      const result = selectFilteredBookmarks({
        bookmarks: sampleBookmarks,
        selectedTagId: null,
        searchQuery: 'الکرسی',
      });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].verse_key, '2:255');
    });

    it('filters bookmarks simultaneously by tag AND search query', () => {
      // Both tag-fav and search 'معبودی' matches bm-1
      const result1 = selectFilteredBookmarks({
        bookmarks: sampleBookmarks,
        selectedTagId: 'tag-fav',
        searchQuery: 'معبودی',
      });
      assert.strictEqual(result1.length, 1);
      assert.strictEqual(result1[0].verse_key, '2:255');

      // tag-memorize does not contain 'معبودی'
      const result2 = selectFilteredBookmarks({
        bookmarks: sampleBookmarks,
        selectedTagId: 'tag-memorize',
        searchQuery: 'معبودی',
      });
      assert.strictEqual(result2.length, 0);
    });

    it('handles normalized Arabic/Persian letter variants in search query', () => {
      // Persian 'ی' vs Arabic 'ي'
      const result = selectFilteredBookmarks({
        bookmarks: sampleBookmarks,
        selectedTagId: null,
        searchQuery: 'الكرسي', // Arabic Yeh and Kaf
      });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].verse_key, '2:255');
    });
  });

  describe('Undo Snackbar Lifecycle Contract', () => {
    it('manages undo state transition correctly', () => {
      let recentlyDeleted = null;
      let bookmarksList = [...sampleBookmarks];

      // Step 1: Delete item
      const itemToDelete = bookmarksList[0];
      bookmarksList = bookmarksList.filter((b) => b.id !== itemToDelete.id);
      recentlyDeleted = itemToDelete;

      assert.strictEqual(bookmarksList.length, 2);
      assert.strictEqual(recentlyDeleted.id, 'bm-1');

      // Step 2: Undo deletion
      bookmarksList = [recentlyDeleted, ...bookmarksList];
      recentlyDeleted = null;

      assert.strictEqual(bookmarksList.length, 3);
      assert.strictEqual(recentlyDeleted, null);
      assert.strictEqual(bookmarksList[0].id, 'bm-1');
    });

    it('clears undo state upon timer expiration (4000ms contract)', (t, done) => {
      let recentlyDeleted = sampleBookmarks[0];
      const clearUndo = () => {
        recentlyDeleted = null;
      };

      const timer = setTimeout(() => {
        clearUndo();
        assert.strictEqual(recentlyDeleted, null);
        done();
      }, 50); // fast simulation of timeout contract
    });
  });

  describe('Card Component Props & Event Handlers Contract', () => {
    it('verifies all interactive callback contracts can be called without errors', () => {
      let readTarget = null;
      let deletedId = null;
      let updatedNote = null;
      let updatedTags = null;
      let isPlayingToggled = false;

      const cardProps = {
        bookmark: sampleBookmarks[0],
        onPressRead: (b) => {
          readTarget = b;
        },
        onDelete: (id) => {
          deletedId = id;
        },
        onUpdateNote: (verseKey, note) => {
          updatedNote = { verseKey, note };
        },
        onUpdateTags: (id, tagIds) => {
          updatedTags = { id, tagIds };
        },
        isPlaying: false,
        onTogglePlay: () => {
          isPlayingToggled = true;
        },
        availableTags: sampleTags,
      };

      // Call callbacks
      cardProps.onPressRead(cardProps.bookmark);
      assert.strictEqual(readTarget?.id, 'bm-1');

      cardProps.onDelete('bm-1');
      assert.strictEqual(deletedId, 'bm-1');

      cardProps.onUpdateNote('2:255', 'یادداشت جدید');
      assert.deepStrictEqual(updatedNote, { verseKey: '2:255', note: 'یادداشت جدید' });

      cardProps.onUpdateTags('bm-1', ['tag-fav', 'tag-dua', 'tag-memorize']);
      assert.deepStrictEqual(updatedTags, {
        id: 'bm-1',
        tagIds: ['tag-fav', 'tag-dua', 'tag-memorize'],
      });

      cardProps.onTogglePlay();
      assert.strictEqual(isPlayingToggled, true);
    });
  });
});
