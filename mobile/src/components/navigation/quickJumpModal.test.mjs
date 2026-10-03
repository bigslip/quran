import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

import {
  toPersianDigits,
  formatDestinationPreview,
  QUICK_JUMP_TABS,
  QUICK_JUMP_MODAL_CONTRACTS,
} from '../../services/db/quickJumpContracts.ts';

import {
  setQuickJumpDatabase,
  resetQuickJumpDatabaseForTesting,
  resolveAyahDestination,
  resolvePageDestination,
  resolveJuzDestination,
} from '../../services/db/quickJumpService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate quran.db across common relative execution paths
const possibleDbPaths = [
  path.resolve(__dirname, '../../../assets/data/quran.db'),
  path.resolve(__dirname, '../../../../mobile/assets/data/quran.db'),
  path.resolve(process.cwd(), 'assets/data/quran.db'),
  path.resolve(process.cwd(), 'mobile/assets/data/quran.db'),
];

const QURAN_DB_PATH = possibleDbPaths.find((p) => fs.existsSync(p));

describe('QuickJumpModal Architecture, Contracts & Integration Tests', () => {
  let db;

  before(() => {
    assert.ok(
      QURAN_DB_PATH && fs.existsSync(QURAN_DB_PATH),
      `quran.db database file must exist (searched: ${possibleDbPaths.join(', ')})`,
    );
    db = new DatabaseSync(QURAN_DB_PATH, { readOnly: true });
    setQuickJumpDatabase(db);
  });

  after(() => {
    resetQuickJumpDatabaseForTesting();
    try {
      if (db) db.close();
    } catch {
      // Ignore
    }
  });

  describe('Tab Definitions & Contract Verification', () => {
    it('defines exactly 3 segmented tabs with correct IDs and Persian labels', () => {
      assert.strictEqual(QUICK_JUMP_TABS.length, 3);

      const tabIds = QUICK_JUMP_TABS.map((t) => t.id);
      assert.deepStrictEqual(tabIds, ['surah_ayah', 'page', 'juz']);

      const surahTab = QUICK_JUMP_TABS.find((t) => t.id === 'surah_ayah');
      assert.ok(surahTab, 'surah_ayah tab must exist');
      assert.strictEqual(surahTab.label, 'سوره و آیه');

      const pageTab = QUICK_JUMP_TABS.find((t) => t.id === 'page');
      assert.ok(pageTab, 'page tab must exist');
      assert.strictEqual(pageTab.label, 'صفحه');

      const juzTab = QUICK_JUMP_TABS.find((t) => t.id === 'juz');
      assert.ok(juzTab, 'juz tab must exist');
      assert.strictEqual(juzTab.label, 'جزء');
    });

    it('defines modal contract dimensions conforming to WCAG standards', () => {
      assert.ok(
        QUICK_JUMP_MODAL_CONTRACTS.minTouchTarget >= 44,
        'minTouchTarget must be at least 44px for WCAG compliance',
      );
      assert.strictEqual(QUICK_JUMP_MODAL_CONTRACTS.minTouchTarget, 44);

      assert.ok(
        QUICK_JUMP_MODAL_CONTRACTS.buttonMinHeight >= 48,
        'Primary action button minHeight must be at least 48px',
      );
      assert.strictEqual(QUICK_JUMP_MODAL_CONTRACTS.buttonMinHeight, 48);

      assert.strictEqual(QUICK_JUMP_MODAL_CONTRACTS.closeButtonSize, 44);
      assert.strictEqual(QUICK_JUMP_MODAL_CONTRACTS.modalTitle, 'پرش سریع به متن قرآن');
      assert.strictEqual(QUICK_JUMP_MODAL_CONTRACTS.actionButtonLabel, 'مشاهده و شروع تلاوت');
    });
  });

  describe('Initial Destination Resolution & Milestone Verification', () => {
    it('resolves Surah 1:1 (Al-Fatihah) initial destination correctly', async () => {
      const dest = await resolveAyahDestination(1, 1);
      assert.strictEqual(dest.chapterId, 1);
      assert.strictEqual(dest.verseNumber, 1);
      assert.strictEqual(dest.pageNumber, 1);
      assert.strictEqual(dest.juzNumber, 1);
      assert.strictEqual(dest.verseKey, '1:1');
      assert.ok(dest.chapterNameFa.includes('فاتحه'));

      const preview = formatDestinationPreview(dest);
      assert.strictEqual(preview, 'سوره فاتحه • آیه ۱ • صفحه ۱ • جزء ۱');
    });

    it('resolves Surah 2:255 (Ayat al-Kursi) destination on Page 42, Juz 3', async () => {
      const dest = await resolveAyahDestination(2, 255);
      assert.strictEqual(dest.chapterId, 2);
      assert.strictEqual(dest.verseNumber, 255);
      assert.strictEqual(dest.pageNumber, 42);
      assert.strictEqual(dest.juzNumber, 3);
      assert.strictEqual(dest.verseKey, '2:255');
      assert.ok(dest.chapterNameFa.includes('بقره'));

      const preview = formatDestinationPreview(dest);
      assert.strictEqual(preview, 'سوره بقره • آیه ۲۵۵ • صفحه ۴۲ • جزء ۳');
    });

    it('resolves Page 42 destination (first verse 2:253, Juz 3)', async () => {
      const dest = await resolvePageDestination(42);
      assert.strictEqual(dest.chapterId, 2);
      assert.strictEqual(dest.verseNumber, 253);
      assert.strictEqual(dest.pageNumber, 42);
      assert.strictEqual(dest.juzNumber, 3);

      const preview = formatDestinationPreview(dest);
      assert.strictEqual(preview, 'سوره بقره • آیه ۲۵۳ • صفحه ۴۲ • جزء ۳');
    });

    it('resolves Page 293 destination (first verse 17:105, Juz 15, Surah Al-Isra)', async () => {
      const dest = await resolvePageDestination(293);
      assert.strictEqual(dest.chapterId, 17);
      assert.strictEqual(dest.verseNumber, 105);
      assert.strictEqual(dest.pageNumber, 293);
      assert.strictEqual(dest.juzNumber, 15);

      const preview = formatDestinationPreview(dest);
      assert.strictEqual(preview, 'سوره اسراء • آیه ۱۰۵ • صفحه ۲۹۳ • جزء ۱۵');
    });

    it('resolves Juz 30 destination (Surah 78:1 An-Naba, Page 582)', async () => {
      const dest = await resolveJuzDestination(30);
      assert.strictEqual(dest.chapterId, 78);
      assert.strictEqual(dest.verseNumber, 1);
      assert.strictEqual(dest.pageNumber, 582);
      assert.strictEqual(dest.juzNumber, 30);

      const preview = formatDestinationPreview(dest);
      assert.strictEqual(preview, 'سوره نبأ • آیه ۱ • صفحه ۵۸۲ • جزء ۳۰');
    });
  });

  describe('Bounds Clamping Integration with Service Layer', () => {
    it('clamps out-of-bounds Ayah requests (e.g. Surah 108:999 -> 108:3)', async () => {
      const dest = await resolveAyahDestination(108, 999);
      assert.strictEqual(dest.chapterId, 108);
      assert.strictEqual(dest.verseNumber, 3);
      assert.strictEqual(dest.totalVerses, 3);
      assert.strictEqual(dest.pageNumber, 602);
      assert.strictEqual(dest.juzNumber, 30);
    });

    it('clamps zero or negative Ayah requests to verse 1', async () => {
      const dest = await resolveAyahDestination(1, 0);
      assert.strictEqual(dest.verseNumber, 1);
    });

    it('clamps out-of-bounds Page requests (page < 1 -> 1, page > 604 -> 604)', async () => {
      const destMin = await resolvePageDestination(0);
      assert.strictEqual(destMin.pageNumber, 1);
      assert.strictEqual(destMin.chapterId, 1);

      const destMax = await resolvePageDestination(700);
      assert.strictEqual(destMax.pageNumber, 604);
      assert.strictEqual(destMax.chapterId, 112);
    });

    it('clamps out-of-bounds Juz requests (juz < 1 -> 1, juz > 30 -> 30)', async () => {
      const destMin = await resolveJuzDestination(-5);
      assert.strictEqual(destMin.juzNumber, 1);
      assert.strictEqual(destMin.chapterId, 1);

      const destMax = await resolveJuzDestination(50);
      assert.strictEqual(destMax.juzNumber, 30);
      assert.strictEqual(destMax.chapterId, 78);
    });
  });

  describe('Component Architecture & Source File Integrity', () => {
    const modalSource = fs.readFileSync(path.resolve(__dirname, 'QuickJumpModal.tsx'), 'utf8');
    const indexSource = fs.readFileSync(path.resolve(__dirname, 'index.ts'), 'utf8');

    it('contains KeyboardAvoidingView with iOS padding behavior', () => {
      assert.ok(
        modalSource.includes('KeyboardAvoidingView'),
        'QuickJumpModal must use KeyboardAvoidingView',
      );
      assert.ok(
        modalSource.includes("behavior={Platform.OS === 'ios' ? 'padding' : undefined}"),
        'QuickJumpModal must use Platform.OS === ios ? padding : undefined',
      );
    });

    it('renders Header with title and close button touch target', () => {
      assert.ok(
        modalSource.includes('QUICK_JUMP_MODAL_CONTRACTS.modalTitle') ||
          modalSource.includes('پرش سریع به متن قرآن'),
      );
      assert.ok(modalSource.includes('closeButton'));
      assert.ok(modalSource.includes('hitSlop'));
    });

    it('integrates all three sub-tab components', () => {
      assert.ok(modalSource.includes('<SurahAyahJumpTab'));
      assert.ok(modalSource.includes('<PageJumpTab'));
      assert.ok(modalSource.includes('<JuzJumpTab'));
    });

    it('renders dynamic destination preview banner and primary action button', () => {
      assert.ok(modalSource.includes('previewBanner'));
      assert.ok(modalSource.includes('formatDestinationPreview'));
      assert.ok(modalSource.includes('actionButton'));
      assert.ok(
        modalSource.includes('QUICK_JUMP_MODAL_CONTRACTS.actionButtonLabel') ||
          modalSource.includes('مشاهده و شروع تلاوت'),
      );
    });

    it('exports all navigation components and contracts in index.ts', () => {
      assert.ok(indexSource.includes('QuickJumpModal'));
      assert.ok(indexSource.includes('QuickJumpModalProps'));
      assert.ok(indexSource.includes('QuickJumpTabId'));
      assert.ok(indexSource.includes('SurahAyahJumpTab'));
      assert.ok(indexSource.includes('SurahAyahJumpTabProps'));
      assert.ok(indexSource.includes('PageJumpTab'));
      assert.ok(indexSource.includes('PageJumpTabProps'));
      assert.ok(indexSource.includes('JuzJumpTab'));
      assert.ok(indexSource.includes('JuzJumpTabProps'));
    });
  });

  describe('SurahAyahJumpTab Surah-First Browsing Architecture', () => {
    const surahTabSource = fs.readFileSync(path.resolve(__dirname, 'SurahAyahJumpTab.tsx'), 'utf8');

    it('renders search bar at the top for instant filtering', () => {
      assert.ok(surahTabSource.includes('testID="quick-jump-surah-search-input"'));
      assert.ok(surahTabSource.includes('searchBarContainer'));
    });

    it('renders hero 114 Surahs FlatList directly without modal sub-screens', () => {
      assert.ok(surahTabSource.includes('styles.surahListFull'));
      assert.ok(surahTabSource.includes('quick-jump-surah-item-'));
      assert.ok(surahTabSource.includes('FlatList'));
      // No two-phase isSelectingSurah hiding the list
      assert.ok(!surahTabSource.includes('isSelectingSurah'));
    });

    it('defaults verse to 1 on Surah selection and opens immediately on single tap', () => {
      assert.ok(
        surahTabSource.includes('onSelectVerse(1)'),
        'Must default to Ayah 1 (beginning) when switching Surahs',
      );
      assert.ok(
        surahTabSource.includes('onConfirmJump(chapter.id, 1)'),
        'Must trigger direct open on single tap',
      );
    });

    it('provides compact active Surah & Ayah tuning toolbar', () => {
      assert.ok(surahTabSource.includes('activeSurahBar'));
      assert.ok(surahTabSource.includes('compactAyahControls'));
      assert.ok(surahTabSource.includes('quickAyahChips'));
      assert.ok(surahTabSource.includes('testID="quick-jump-confirm-ayah-btn"'));
    });

    it('enables long press on Surah item to activate Ayah tuning', () => {
      assert.ok(surahTabSource.includes('onLongPress'));
      assert.ok(surahTabSource.includes('handleSurahLongPress'));
      assert.ok(surahTabSource.includes('delayLongPress'));
      assert.ok(surahTabSource.includes('setIsAyahTuningOpen(true)'));
    });

    it('renders educational gesture guidance banner for discoverability', () => {
      assert.ok(surahTabSource.includes('testID="quick-jump-gesture-hint"'));
      assert.ok(surahTabSource.includes('gestureHintBanner'));
      assert.ok(surahTabSource.includes('showGestureHint'));
      assert.ok(surahTabSource.includes('Sparkles'));
    });
  });
});
