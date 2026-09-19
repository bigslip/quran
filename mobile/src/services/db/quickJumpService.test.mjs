import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

import {
  toAsciiDigits,
  toPersianDigits,
  parseLocalizedNumber,
  formatDestinationPreview,
  cleanSurahNameFa,
} from './quickJumpContracts.ts';

import {
  setQuickJumpDatabase,
  resetQuickJumpDatabaseForTesting,
  resolveAyahDestination,
  resolvePageDestination,
  resolveJuzDestination,
  getAllJuzCards,
} from './quickJumpService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QURAN_DB_PATH = path.resolve(__dirname, '../../../../mobile/assets/data/quran.db');

describe('Quick Jump Service & Navigation Engine', () => {
  let db;

  before(() => {
    assert.ok(fs.existsSync(QURAN_DB_PATH), `Quran database must exist at ${QURAN_DB_PATH}`);
    db = new DatabaseSync(QURAN_DB_PATH, { readOnly: true });
    setQuickJumpDatabase(db);
  });

  after(() => {
    resetQuickJumpDatabaseForTesting();
    try {
      db.close();
    } catch {
      // Ignore
    }
  });

  describe('Numeral Parsing & Typography Contracts', () => {
    it('converts Persian and Arabic numerals to ASCII digits', () => {
      assert.strictEqual(toAsciiDigits('۲۵۵'), '255');
      assert.strictEqual(toAsciiDigits('٤٢'), '42');
      assert.strictEqual(toAsciiDigits('۰۱۲۳۴۵۶۷۸۹'), '0123456789');
      assert.strictEqual(toAsciiDigits('٠١٢٣٤٥٦٧٨٩'), '0123456789');
      assert.strictEqual(toAsciiDigits('Mixed ۱۲3 ٤5'), 'Mixed 123 45');
      assert.strictEqual(toAsciiDigits(''), '');
    });

    it('parses localized numbers with various inputs and rejects non-numeric text', () => {
      assert.strictEqual(parseLocalizedNumber('۲۵۵'), 255);
      assert.strictEqual(parseLocalizedNumber('٤٢'), 42);
      assert.strictEqual(parseLocalizedNumber('  ۱۱۴  '), 114);
      assert.strictEqual(parseLocalizedNumber(286), 286);
      assert.strictEqual(parseLocalizedNumber('0'), 0);
      assert.strictEqual(parseLocalizedNumber('۰'), 0);
      assert.ok(Number.isNaN(parseLocalizedNumber('')));
      assert.ok(Number.isNaN(parseLocalizedNumber('   ')));
      assert.ok(Number.isNaN(parseLocalizedNumber('abc')));
      assert.ok(Number.isNaN(parseLocalizedNumber('12abc')));
      assert.ok(Number.isNaN(parseLocalizedNumber(null)));
      assert.ok(Number.isNaN(parseLocalizedNumber(undefined)));
    });

    it('cleans Persian Surah names by stripping parenthesized descriptions', () => {
      assert.strictEqual(cleanSurahNameFa('بقره (گاو ماده)'), 'بقره');
      assert.strictEqual(cleanSurahNameFa('فاتحه (گشایش)'), 'فاتحه');
      assert.strictEqual(cleanSurahNameFa('سوره کهف'), 'کهف');
      assert.strictEqual(cleanSurahNameFa('یونس'), 'یونس');
      assert.strictEqual(cleanSurahNameFa(''), '');
    });

    it('formats a complete Persian destination preview correctly', () => {
      const dest = {
        chapterId: 2,
        verseNumber: 255,
        pageNumber: 42,
        juzNumber: 3,
        verseKey: '2:255',
        chapterNameArabic: 'البقرة',
        chapterNameFa: 'بقره (گاو ماده)',
        totalVerses: 286,
      };

      const preview = formatDestinationPreview(dest);
      assert.strictEqual(preview, 'سوره بقره • آیه ۲۵۵ • صفحه ۴۲ • جزء ۳');
    });
  });

  describe('Surah:Ayah Destination Resolution', () => {
    it('resolves Al-Fatihah 1:1 correctly', async () => {
      const dest = await resolveAyahDestination(1, 1);
      assert.strictEqual(dest.chapterId, 1);
      assert.strictEqual(dest.verseNumber, 1);
      assert.strictEqual(dest.verseKey, '1:1');
      assert.strictEqual(dest.pageNumber, 1);
      assert.strictEqual(dest.juzNumber, 1);
      assert.strictEqual(dest.totalVerses, 7);
      assert.strictEqual(dest.chapterNameArabic, 'الفاتحة');
      assert.ok(dest.chapterNameFa.includes('فاتحه'));
    });

    it('resolves Al-Baqarah 2:255 (Ayat al-Kursi) to Page 42, Juz 3', async () => {
      const dest = await resolveAyahDestination(2, 255);
      assert.strictEqual(dest.chapterId, 2);
      assert.strictEqual(dest.verseNumber, 255);
      assert.strictEqual(dest.verseKey, '2:255');
      assert.strictEqual(dest.pageNumber, 42);
      assert.strictEqual(dest.juzNumber, 3);
      assert.strictEqual(dest.totalVerses, 286);
      assert.strictEqual(dest.chapterNameArabic, 'البقرة');
    });

    it('resolves An-Nas 114:6 to Page 604, Juz 30', async () => {
      const dest = await resolveAyahDestination(114, 6);
      assert.strictEqual(dest.chapterId, 114);
      assert.strictEqual(dest.verseNumber, 6);
      assert.strictEqual(dest.verseKey, '114:6');
      assert.strictEqual(dest.pageNumber, 604);
      assert.strictEqual(dest.juzNumber, 30);
      assert.strictEqual(dest.totalVerses, 6);
      assert.strictEqual(dest.chapterNameArabic, 'الناس');
    });

    it('clamps out-of-bounds verses (e.g. Al-Kawthar 108:50 clamped to 108:3)', async () => {
      const destHigh = await resolveAyahDestination(108, 50);
      assert.strictEqual(destHigh.chapterId, 108);
      assert.strictEqual(destHigh.verseNumber, 3);
      assert.strictEqual(destHigh.verseKey, '108:3');

      const destLow = await resolveAyahDestination(108, -10);
      assert.strictEqual(destLow.chapterId, 108);
      assert.strictEqual(destLow.verseNumber, 1);
      assert.strictEqual(destLow.verseKey, '108:1');
    });

    it('clamps out-of-bounds chapter IDs to 1..114', async () => {
      const destHigh = await resolveAyahDestination(200, 1);
      assert.strictEqual(destHigh.chapterId, 114);

      const destLow = await resolveAyahDestination(0, 1);
      assert.strictEqual(destLow.chapterId, 1);
    });
  });

  describe('Page Destination Resolution', () => {
    it('resolves Page 1 (Al-Fatihah 1:1)', async () => {
      const dest = await resolvePageDestination(1);
      assert.strictEqual(dest.pageNumber, 1);
      assert.strictEqual(dest.chapterId, 1);
      assert.strictEqual(dest.verseNumber, 1);
      assert.strictEqual(dest.verseKey, '1:1');
    });

    it('resolves Page 42 (Al-Baqarah 2:253)', async () => {
      const dest = await resolvePageDestination(42);
      assert.strictEqual(dest.pageNumber, 42);
      assert.strictEqual(dest.chapterId, 2);
      assert.strictEqual(dest.verseNumber, 253);
      assert.strictEqual(dest.verseKey, '2:253');
    });

    it('resolves Page 293 (first verse 17:105)', async () => {
      const dest = await resolvePageDestination(293);
      assert.strictEqual(dest.pageNumber, 293);
      assert.strictEqual(dest.chapterId, 17);
      assert.strictEqual(dest.verseNumber, 105);
      assert.strictEqual(dest.verseKey, '17:105');
    });

    it('resolves Page 604 (Al-Ikhlas 112:1)', async () => {
      const dest = await resolvePageDestination(604);
      assert.strictEqual(dest.pageNumber, 604);
      assert.strictEqual(dest.chapterId, 112);
      assert.strictEqual(dest.verseNumber, 1);
      assert.strictEqual(dest.verseKey, '112:1');
    });

    it('clamps out-of-bounds page numbers (0 clamped to 1, 700 clamped to 604)', async () => {
      const destLow = await resolvePageDestination(0);
      assert.strictEqual(destLow.pageNumber, 1);

      const destHigh = await resolvePageDestination(700);
      assert.strictEqual(destHigh.pageNumber, 604);
    });
  });

  describe('Juz Destination Resolution', () => {
    it('resolves Juz 1 (Al-Fatihah 1:1, Page 1)', async () => {
      const dest = await resolveJuzDestination(1);
      assert.strictEqual(dest.juzNumber, 1);
      assert.strictEqual(dest.chapterId, 1);
      assert.strictEqual(dest.verseNumber, 1);
      assert.strictEqual(dest.verseKey, '1:1');
      assert.strictEqual(dest.pageNumber, 1);
    });

    it('resolves Juz 30 (An-Naba 78:1, Page 582)', async () => {
      const dest = await resolveJuzDestination(30);
      assert.strictEqual(dest.juzNumber, 30);
      assert.strictEqual(dest.chapterId, 78);
      assert.strictEqual(dest.verseNumber, 1);
      assert.strictEqual(dest.verseKey, '78:1');
      assert.strictEqual(dest.pageNumber, 582);
    });

    it('clamps out-of-bounds Juz numbers (0 clamped to 1, 50 clamped to 30)', async () => {
      const destLow = await resolveJuzDestination(-5);
      assert.strictEqual(destLow.juzNumber, 1);

      const destHigh = await resolveJuzDestination(50);
      assert.strictEqual(destHigh.juzNumber, 30);
    });
  });

  describe('Juz Cards Collection & In-Memory Caching', () => {
    it('returns all 30 Juz cards with accurate starting metadata', async () => {
      const cards = await getAllJuzCards();
      assert.strictEqual(cards.length, 30);

      // Verify Juz 1
      const juz1 = cards[0];
      assert.strictEqual(juz1.juzNumber, 1);
      assert.strictEqual(juz1.startChapterId, 1);
      assert.strictEqual(juz1.startVerseNumber, 1);
      assert.strictEqual(juz1.startPageNumber, 1);
      assert.strictEqual(juz1.verseCount, 148);
      assert.strictEqual(juz1.firstSurahNameArabic, 'الفاتحة');

      // Verify Juz 30
      const juz30 = cards[29];
      assert.strictEqual(juz30.juzNumber, 30);
      assert.strictEqual(juz30.startChapterId, 78);
      assert.strictEqual(juz30.startVerseNumber, 1);
      assert.strictEqual(juz30.startPageNumber, 582);
      assert.strictEqual(juz30.verseCount, 564);
      assert.strictEqual(juz30.firstSurahNameArabic, 'النبإ');
    });

    it('returns cached cards on subsequent calls', async () => {
      const cards1 = await getAllJuzCards();
      const cards2 = await getAllJuzCards();
      assert.strictEqual(cards1, cards2, 'Should return identical cached array reference');
    });
  });
});
