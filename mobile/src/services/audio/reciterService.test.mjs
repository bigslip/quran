import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  AVAILABLE_RECITERS,
  DEFAULT_RECITER_ID,
  getReciterById,
  searchReciters,
  formatVerseAudioFilename,
  getVerseAudioUrl,
} from './reciterService.ts';

describe('Reciter Catalog Service Tests', () => {
  it('should provide a rich list of at least 15 curated Quran reciters', () => {
    assert.ok(Array.isArray(AVAILABLE_RECITERS));
    assert.ok(AVAILABLE_RECITERS.length >= 15);
  });

  it('should include prominent Iranian reciters with Persian names and styles', () => {
    const parhizgar = getReciterById(201);
    assert.strictEqual(parhizgar.id, 201);
    assert.strictEqual(parhizgar.nameFa, 'استاد شهریار پرهیزگار');
    assert.strictEqual(parhizgar.style, 'Murattal');
    assert.strictEqual(parhizgar.styleFa, 'ترتیل');

    const mansouri = getReciterById(203);
    assert.strictEqual(mansouri.id, 203);
    assert.strictEqual(mansouri.nameFa, 'استاد کریم منصوری');
    assert.strictEqual(mansouri.style, 'Mujawwad');
    assert.strictEqual(mansouri.styleFa, 'تحقیق');

    const shakernejad = getReciterById(204);
    assert.strictEqual(shakernejad.id, 204);
    assert.strictEqual(shakernejad.nameFa, 'استاد حامد شاکرنژاد');
    assert.strictEqual(shakernejad.style, 'Mujawwad');
  });

  it('should include world-famous international reciters', () => {
    const afasy = getReciterById(7);
    assert.strictEqual(afasy.id, 7);
    assert.strictEqual(afasy.nameFa, 'مشاری راشد العفاسی');

    const minshawi = getReciterById(9);
    assert.strictEqual(minshawi.id, 9);
    assert.strictEqual(minshawi.nameFa, 'محمد صدیق منشاوی');

    const husary = getReciterById(202);
    assert.strictEqual(husary.id, 202);
    assert.strictEqual(husary.nameFa, 'محمود خلیل الحصری');
  });

  it('should fallback gracefully to default reciter (Parhizgar) for invalid ID', () => {
    const fallback = getReciterById(999999);
    assert.strictEqual(fallback.id, 201);
  });

  it('should filter reciters by query and recitation style', () => {
    const searchParhizgar = searchReciters('پرهیزگار');
    assert.strictEqual(searchParhizgar.length, 1);
    assert.strictEqual(searchParhizgar[0].id, 201);

    const searchAfasyEn = searchReciters('afasy');
    assert.strictEqual(searchAfasyEn.length, 1);
    assert.strictEqual(searchAfasyEn[0].id, 7);

    const murattalOnly = searchReciters('', 'Murattal');
    assert.ok(murattalOnly.every((r) => r.style === 'Murattal'));

    const mujawwadOnly = searchReciters('', 'Mujawwad');
    assert.ok(mujawwadOnly.every((r) => r.style === 'Mujawwad'));
    assert.ok(mujawwadOnly.some((r) => r.id === 203)); // Karim Mansouri
  });

  it('should correctly format verse audio filename with 3-digit padding', () => {
    assert.strictEqual(formatVerseAudioFilename(1, 1), '001001.mp3');
    assert.strictEqual(formatVerseAudioFilename(1, 7), '001007.mp3');
    assert.strictEqual(formatVerseAudioFilename(18, 28), '018028.mp3');
    assert.strictEqual(formatVerseAudioFilename(114, 6), '114006.mp3');
  });

  it('should generate valid audio streaming URLs for various reciters', () => {
    // Parhizgar (201)
    const parhizgarUrl = getVerseAudioUrl(201, 1, 1);
    assert.strictEqual(parhizgarUrl, 'https://everyayah.com/data/Parhizgar_48kbps/001001.mp3');

    // Alafasy (7)
    const afasyUrl = getVerseAudioUrl(7, 18, 28);
    assert.strictEqual(afasyUrl, 'https://everyayah.com/data/Alafasy_128kbps/018028.mp3');

    // Minshawi (9)
    const minshawiUrl = getVerseAudioUrl(9, 114, 1);
    assert.strictEqual(minshawiUrl, 'https://everyayah.com/data/Minshawy_Murattal_128kbps/114001.mp3');

    // Karim Mansouri (203)
    const mansouriUrl = getVerseAudioUrl(203, 1, 1);
    assert.strictEqual(mansouriUrl, 'https://everyayah.com/data/Karim_Mansoori_40kbps/001001.mp3');

    // Unknown reciter falls back to Parhizgar
    const fallbackUrl = getVerseAudioUrl(99999, 1, 1);
    assert.strictEqual(fallbackUrl, 'https://everyayah.com/data/Parhizgar_48kbps/001001.mp3');
  });
});

