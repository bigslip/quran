import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

import {
  toPersianDigits,
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

// Helper representing the universal quick jump route generation contract
function buildQuickJumpRoute(destination) {
  return `/surah/${destination.chapterId}?verse=${destination.verseNumber}&page=${destination.pageNumber}`;
}

describe('Universal Quick Jump Navigation Contracts & Screen Integration', () => {
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

  describe('Route Generation Format Contracts', () => {
    it('generates correct route format for Ayat al-Kursi (Al-Baqarah 2:255)', async () => {
      const dest = await resolveAyahDestination(2, 255);
      assert.strictEqual(dest.chapterId, 2);
      assert.strictEqual(dest.verseNumber, 255);
      assert.strictEqual(dest.pageNumber, 42);

      const route = buildQuickJumpRoute(dest);
      assert.strictEqual(route, '/surah/2?verse=255&page=42');
    });

    it('generates correct route format for Al-Kahf 18:1 (page 293)', async () => {
      const destAyah = await resolveAyahDestination(18, 1);
      assert.strictEqual(destAyah.chapterId, 18);
      assert.strictEqual(destAyah.verseNumber, 1);
      assert.strictEqual(destAyah.pageNumber, 293);

      const routeAyah = buildQuickJumpRoute(destAyah);
      assert.strictEqual(routeAyah, '/surah/18?verse=1&page=293');

      // Page 293 begins at 17:105 and also contains 18:1
      const destPage = await resolvePageDestination(293);
      assert.strictEqual(destPage.chapterId, 17);
      assert.strictEqual(destPage.verseNumber, 105);
      assert.strictEqual(destPage.pageNumber, 293);

      const routePage = buildQuickJumpRoute(destPage);
      assert.strictEqual(routePage, '/surah/17?verse=105&page=293');
    });

    it('generates correct route format for Juz 30 (An-Naba 78:1, page 582)', async () => {
      const destJuz = await resolveJuzDestination(30);
      assert.strictEqual(destJuz.chapterId, 78);
      assert.strictEqual(destJuz.verseNumber, 1);
      assert.strictEqual(destJuz.pageNumber, 582);

      const routeJuz = buildQuickJumpRoute(destJuz);
      assert.strictEqual(routeJuz, '/surah/78?verse=1&page=582');
    });

    it('generates correct route format for Quran boundaries: Al-Fatihah 1:1 and Al-Ikhlas 112:1', async () => {
      const destFatihah = await resolveAyahDestination(1, 1);
      assert.strictEqual(destFatihah.chapterId, 1);
      assert.strictEqual(destFatihah.verseNumber, 1);
      assert.strictEqual(destFatihah.pageNumber, 1);
      assert.strictEqual(buildQuickJumpRoute(destFatihah), '/surah/1?verse=1&page=1');

      const destIkhlas = await resolveAyahDestination(112, 1);
      assert.strictEqual(destIkhlas.chapterId, 112);
      assert.strictEqual(destIkhlas.verseNumber, 1);
      assert.strictEqual(destIkhlas.pageNumber, 604);
      assert.strictEqual(buildQuickJumpRoute(destIkhlas), '/surah/112?verse=1&page=604');
    });
  });

  describe('Touch Target Dimensions and Accessibility Role Contracts', () => {
    it('verifies WCAG AAA compliant minTouchTarget from QUICK_JUMP_MODAL_CONTRACTS', () => {
      assert.ok(
        QUICK_JUMP_MODAL_CONTRACTS.minTouchTarget >= 44,
        'Universal minTouchTarget must be at least 44px',
      );
      assert.strictEqual(QUICK_JUMP_MODAL_CONTRACTS.minTouchTarget, 44);
    });

    it('verifies modal action button meets or exceeds 48px tactile height requirement', () => {
      assert.ok(
        QUICK_JUMP_MODAL_CONTRACTS.buttonMinHeight >= 48,
        'Action button minHeight must be >= 48px',
      );
      assert.strictEqual(QUICK_JUMP_MODAL_CONTRACTS.buttonMinHeight, 48);
    });

    it('verifies modal close button touch target is at least 44px', () => {
      assert.strictEqual(QUICK_JUMP_MODAL_CONTRACTS.closeButtonSize, 44);
    });
  });

  describe('Home Screen (index.tsx) Code Contract Verification', () => {
    const indexPath = path.resolve(__dirname, '../../app/(tabs)/index.tsx');
    let indexSource;

    before(() => {
      assert.ok(fs.existsSync(indexPath), `index.tsx must exist at ${indexPath}`);
      indexSource = fs.readFileSync(indexPath, 'utf8');
    });

    it('imports QuickJumpModal and JumpDestination', () => {
      assert.ok(
        indexSource.includes("import { QuickJumpModal } from '@/components/navigation';"),
        'index.tsx must import QuickJumpModal from @/components/navigation',
      );
      assert.ok(
        indexSource.includes("import { JumpDestination } from '@/services/db/quickJumpContracts';"),
        'index.tsx must import JumpDestination',
      );
    });

    it('declares isQuickJumpOpen state and handleQuickJump callback', () => {
      assert.ok(
        indexSource.includes('const [isQuickJumpOpen, setIsQuickJumpOpen] = useState(false);'),
        'index.tsx must declare isQuickJumpOpen state',
      );
      assert.ok(
        indexSource.includes('const handleQuickJump = useCallback('),
        'index.tsx must declare handleQuickJump callback',
      );
      assert.ok(
        indexSource.includes('setIsQuickJumpOpen(false);'),
        'handleQuickJump must close the modal',
      );
      assert.ok(
        indexSource.includes(
          '`/surah/${destination.chapterId}?verse=${destination.verseNumber}&page=${destination.pageNumber}`',
        ),
        'handleQuickJump must push canonical route with chapterId, verse, and page parameters',
      );
    });

    it('renders a prominent Quick Jump action card with Compass icon and Persian labels', () => {
      assert.ok(
        indexSource.includes('testID="home-quick-jump-button"'),
        'Home screen must have trigger button with testID="home-quick-jump-button"',
      );
      assert.ok(
        indexSource.includes('activeOpacity={0.8}'),
        'Home screen trigger must have activeOpacity={0.8}',
      );
      assert.ok(
        indexSource.includes('accessibilityRole="button"'),
        'Home screen trigger must have accessibilityRole="button"',
      );
      assert.ok(
        indexSource.includes('accessibilityLabel="پرش سریع به متن قرآن"'),
        'Home screen trigger must have accessibilityLabel="پرش سریع به متن قرآن"',
      );
      assert.ok(
        indexSource.includes('setIsQuickJumpOpen(true)'),
        'Home screen trigger onPress must set isQuickJumpOpen to true',
      );
      assert.ok(
        indexSource.includes('Compass size={24} color={colors.goldAccent}'),
        'Home screen trigger must feature gold Compass icon',
      );
      assert.ok(
        indexSource.includes('پرش سریع به متن قرآن'),
        'Home screen trigger must contain title "پرش سریع به متن قرآن"',
      );
      assert.ok(
        indexSource.includes('انتقال مستقیم به سوره، آیه، شماره صفحه یا جزء'),
        'Home screen trigger must contain subtitle "انتقال مستقیم به سوره، آیه، شماره صفحه یا جزء"',
      );
    });

    it('mounts QuickJumpModal with required props and testID="home-quick-jump-modal"', () => {
      assert.ok(indexSource.includes('<QuickJumpModal'), 'index.tsx must render QuickJumpModal');
      assert.ok(
        indexSource.includes('visible={isQuickJumpOpen}'),
        'QuickJumpModal visible prop must bind to isQuickJumpOpen',
      );
      assert.ok(
        indexSource.includes('onClose={() => setIsQuickJumpOpen(false)}'),
        'QuickJumpModal onClose prop must close the modal',
      );
      assert.ok(
        indexSource.includes('onJump={handleQuickJump}'),
        'QuickJumpModal onJump prop must bind to handleQuickJump',
      );
      assert.ok(
        indexSource.includes('initialChapterId={lastReadChapterId || 1}'),
        'QuickJumpModal initialChapterId must use lastReadChapterId fallback to 1',
      );
      assert.ok(
        indexSource.includes('initialVerseNumber={lastReadVerseNumber || 1}'),
        'QuickJumpModal initialVerseNumber must use lastReadVerseNumber fallback to 1',
      );
      assert.ok(
        indexSource.includes('testID="home-quick-jump-modal"'),
        'QuickJumpModal must have testID="home-quick-jump-modal"',
      );
    });

    it('defines styles satisfying touch target >= 44x44px', () => {
      assert.ok(
        indexSource.includes('quickJumpButton: {'),
        'index.tsx styles must include quickJumpButton',
      );
      assert.ok(
        indexSource.includes('minHeight: 44'),
        'quickJumpButton must define minHeight: 44 for WCAG compliance',
      );
      assert.ok(
        indexSource.includes('width: 44,') && indexSource.includes('height: 44,'),
        'quickJumpIconContainer must have 44x44 dimensions',
      );
    });
  });

  describe('Catalog Screen (surahs.tsx) Code Contract Verification', () => {
    const surahsPath = path.resolve(__dirname, '../../app/(tabs)/surahs.tsx');
    let surahsSource;

    before(() => {
      assert.ok(fs.existsSync(surahsPath), `surahs.tsx must exist at ${surahsPath}`);
      surahsSource = fs.readFileSync(surahsPath, 'utf8');
    });

    it('imports Compass, QuickJumpModal, and JumpDestination', () => {
      assert.ok(
        surahsSource.includes("import { Compass } from 'lucide-react-native';"),
        'surahs.tsx must import Compass icon',
      );
      assert.ok(
        surahsSource.includes("import { QuickJumpModal } from '@/components/navigation';"),
        'surahs.tsx must import QuickJumpModal',
      );
      assert.ok(
        surahsSource.includes(
          "import { JumpDestination } from '@/services/db/quickJumpContracts';",
        ),
        'surahs.tsx must import JumpDestination',
      );
    });

    it('declares isQuickJumpOpen state and handleQuickJump callback', () => {
      assert.ok(
        surahsSource.includes('const [isQuickJumpOpen, setIsQuickJumpOpen] = useState(false);'),
        'surahs.tsx must declare isQuickJumpOpen state',
      );
      assert.ok(
        surahsSource.includes('const handleQuickJump = useCallback('),
        'surahs.tsx must declare handleQuickJump callback',
      );
      assert.ok(
        surahsSource.includes('setIsQuickJumpOpen(false);'),
        'handleQuickJump must close the modal',
      );
      assert.ok(
        surahsSource.includes(
          '`/surah/${destination.chapterId}?verse=${destination.verseNumber}&page=${destination.pageNumber}`',
        ),
        'handleQuickJump must push canonical route with chapterId, verse, and page parameters',
      );
    });

    it('renders Quick Jump button in Catalog header with Compass icon and Persian label', () => {
      assert.ok(
        surahsSource.includes('testID="catalog-quick-jump-button"'),
        'Catalog header must render trigger button with testID="catalog-quick-jump-button"',
      );
      assert.ok(
        surahsSource.includes('accessibilityRole="button"'),
        'Catalog trigger must specify accessibilityRole="button"',
      );
      assert.ok(
        surahsSource.includes('accessibilityLabel="پرش سریع"'),
        'Catalog trigger must have Persian accessibilityLabel',
      );
      assert.ok(
        surahsSource.includes('setIsQuickJumpOpen(true)'),
        'Catalog trigger must set isQuickJumpOpen to true on tap',
      );
      assert.ok(
        surahsSource.includes('Compass size={16} color={colors.goldAccent}'),
        'Catalog trigger must include gold Compass icon',
      );
      assert.ok(surahsSource.includes('پرش سریع'), 'Catalog trigger must display "پرش سریع" label');
    });

    it('mounts QuickJumpModal with testID="catalog-quick-jump-modal"', () => {
      assert.ok(surahsSource.includes('<QuickJumpModal'), 'surahs.tsx must render QuickJumpModal');
      assert.ok(
        surahsSource.includes('visible={isQuickJumpOpen}'),
        'QuickJumpModal visible prop must bind to isQuickJumpOpen',
      );
      assert.ok(
        surahsSource.includes('onClose={() => setIsQuickJumpOpen(false)}'),
        'QuickJumpModal onClose prop must close the modal',
      );
      assert.ok(
        surahsSource.includes('onJump={handleQuickJump}'),
        'QuickJumpModal onJump prop must bind to handleQuickJump',
      );
      assert.ok(
        surahsSource.includes('initialChapterId={1}'),
        'QuickJumpModal initialChapterId must default to 1',
      );
      assert.ok(
        surahsSource.includes('initialVerseNumber={1}'),
        'QuickJumpModal initialVerseNumber must default to 1',
      );
      assert.ok(
        surahsSource.includes('testID="catalog-quick-jump-modal"'),
        'QuickJumpModal must have testID="catalog-quick-jump-modal"',
      );
    });

    it('defines styles ensuring touch target >= 44x44px for catalog trigger', () => {
      assert.ok(
        surahsSource.includes('minHeight: 44'),
        'Catalog quickJumpButton must define minHeight: 44',
      );
      assert.ok(
        surahsSource.includes('minWidth: 44'),
        'Catalog quickJumpButton must define minWidth: 44',
      );
    });
  });

  describe('Reader Screen (surah/[id].tsx) Code Contract Verification', () => {
    const readerPath = path.resolve(__dirname, '../../app/surah/[id].tsx');
    let readerSource;

    before(() => {
      assert.ok(fs.existsSync(readerPath), `surah/[id].tsx must exist at ${readerPath}`);
      readerSource = fs.readFileSync(readerPath, 'utf8');
    });

    it('imports QuickJumpModal, JumpDestination, and Compass', () => {
      assert.ok(readerSource.includes('QuickJumpModal'), 'Reader must import QuickJumpModal');
      assert.ok(readerSource.includes('JumpDestination'), 'Reader must import JumpDestination');
      assert.ok(readerSource.includes('Compass'), 'Reader must import Compass icon');
    });

    it('has isQuickJumpOpen state and handles both in-place jump and cross-Surah navigation', () => {
      assert.ok(
        readerSource.includes('isQuickJumpOpen'),
        'Reader must declare isQuickJumpOpen state',
      );
      assert.ok(
        readerSource.includes('handleJumpToDestination'),
        'Reader must declare handleJumpToDestination callback',
      );
      assert.ok(
        readerSource.includes('destination.chapterId === chapterId'),
        'Reader must branch on in-place jump vs cross-Surah navigation',
      );
      assert.ok(
        readerSource.includes(
          '`/surah/${destination.chapterId}?verse=${destination.verseNumber}&page=${destination.pageNumber}`',
        ),
        'Cross-Surah jump must push canonical destination route',
      );
    });

    it('renders Quick Jump top bar trigger and mounts QuickJumpModal with testID="reader-quick-jump-modal"', () => {
      assert.ok(
        readerSource.includes('testID="reader-quick-jump-button"'),
        'Reader top bar must feature trigger button with testID="reader-quick-jump-button"',
      );
      assert.ok(
        readerSource.includes('testID="reader-quick-jump-modal"'),
        'Reader must mount QuickJumpModal with testID="reader-quick-jump-modal"',
      );
    });
  });
});
