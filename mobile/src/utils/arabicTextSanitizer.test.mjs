import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeQuranArabic, INCORRECT_SUKUN_REGEX } from './arabicTextSanitizer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Arabic Text Sanitizer & Typography Normalization Tests', () => {
  it('normalizes U+06DF (small high rounded zero) to standard sukun U+0652', () => {
    // 3:7 snippet containing silent waw and silent alif
    const rawSnippet = 'أُو۟لُوا۟';
    const normalized = normalizeQuranArabic(rawSnippet);

    assert.strictEqual(normalized, 'أُوْلُواْ');
    assert.strictEqual(normalized.includes('\u06DF'), false);
    assert.strictEqual(normalized.includes('\u0652'), true);
  });

  it('normalizes all problematic sukun and zero variants', () => {
    const rawText = '\u06DF\u06E3\u06EB\u06EE\u06EF';
    const normalized = normalizeQuranArabic(rawText);
    assert.strictEqual(normalized, '\u0652\u0652\u0652\u0652\u0652');
  });

  it('gracefully handles null, undefined, and empty string', () => {
    assert.strictEqual(normalizeQuranArabic(null), '');
    assert.strictEqual(normalizeQuranArabic(undefined), '');
    assert.strictEqual(normalizeQuranArabic(''), '');
  });

  it('leaves clean Arabic text without problematic characters untouched', () => {
    const cleanText = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
    assert.strictEqual(normalizeQuranArabic(cleanText), cleanText);
  });

  it('verifies translationText has textAlign: "justify" across all reader card styles', () => {
    const cardStylesSource = fs.readFileSync(
      path.resolve(__dirname, '../components/reader/ContinuousVerseCard.styles.ts'),
      'utf8',
    );
    assert.ok(
      cardStylesSource.includes("textAlign: 'justify'"),
      'ContinuousVerseCard translationText must be justified',
    );

    const previewSource = fs.readFileSync(
      path.resolve(__dirname, '../components/insights/AyahScripturePreviewCard.tsx'),
      'utf8',
    );
    assert.ok(
      previewSource.includes("textAlign: 'justify'"),
      'AyahScripturePreviewCard translationText must be justified',
    );

    const bookmarkSource = fs.readFileSync(
      path.resolve(__dirname, '../components/bookmarks/BookmarkVerseCard.tsx'),
      'utf8',
    );
    assert.ok(
      bookmarkSource.includes("textAlign: 'justify'"),
      'BookmarkVerseCard translationText must be justified',
    );
  });

  it('verifies UthmanicHafs.ttf binary font has glyph 249 advance=0 and points to sukun (glyph 108)', () => {
    const fontPath = path.resolve(__dirname, '../../assets/fonts/UthmanicHafs.ttf');
    const data = fs.readFileSync(fontPath);

    // Read hmtx offset
    const numTables = data.readUInt16BE(4);
    let hmtxOffset = null;
    let locaOffset = null;
    let glyfOffset = null;

    for (let i = 0; i < numTables; i++) {
      const tag = data.subarray(12 + i * 16, 12 + i * 16 + 4).toString('latin1');
      const offset = data.readUInt32BE(12 + i * 16 + 8);
      if (tag === 'hmtx') hmtxOffset = offset;
      if (tag === 'loca') locaOffset = offset;
      if (tag === 'glyf') glyfOffset = offset;
    }

    assert.ok(hmtxOffset && locaOffset && glyfOffset, 'Required tables must exist');

    // Check glyph 249 advance width in hmtx
    const adv249 = data.readUInt16BE(hmtxOffset + 249 * 4);
    assert.strictEqual(adv249, 0, 'Glyph 249 must have advance width 0');

    // Check glyph 249 composite component in glyf
    const off249 = data.readUInt32BE(locaOffset + 249 * 4);
    const compGid = data.readUInt16BE(glyfOffset + off249 + 12);
    assert.strictEqual(compGid, 108, 'Glyph 249 must point to glyph 108 (sukun)');
  });
});
