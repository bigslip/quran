import { describe, it, expect } from 'vitest';

import { parseDirectAyahJump } from './directJumpParser';

import Chapter from 'types/Chapter';
import ChaptersData from 'types/ChaptersData';

const mockChaptersData: ChaptersData = {
  '1': {
    id: 1,
    versesCount: 7,
    bismillahPre: false,
    revelationOrder: 5,
    revelationPlace: 'makkah',
    pages: [1],
    nameComplex: 'Al-Fātihah',
    nameSimple: 'Al-Fatihah',
    transliteratedName: 'Al-Fatihah',
    nameArabic: 'الفاتحة',
    translatedName: 'The Opener',
    defaultSlug: 'al-fatihah',
  } as Chapter,
  '2': {
    id: 2,
    versesCount: 286,
    bismillahPre: true,
    revelationOrder: 87,
    revelationPlace: 'madinah',
    pages: [2, 49],
    nameComplex: 'Al-Baqarah',
    nameSimple: 'Al-Baqarah',
    transliteratedName: 'Al-Baqarah',
    nameArabic: 'البقرة',
    translatedName: 'The Cow',
    defaultSlug: 'al-baqarah',
  } as Chapter,
  '18': {
    id: 18,
    versesCount: 110,
    bismillahPre: true,
    revelationOrder: 69,
    revelationPlace: 'makkah',
    pages: [293, 304],
    nameComplex: 'Al-Kahf',
    nameSimple: 'Al-Kahf',
    transliteratedName: 'Al-Kahf',
    nameArabic: 'الكهف',
    translatedName: 'The Cave',
    defaultSlug: 'al-kahf',
  } as Chapter,
};

describe('parseDirectAyahJump', () => {
  it('parses standard "2:255" pattern and detects Ayat Al-Kursi', () => {
    const result = parseDirectAyahJump('2:255', mockChaptersData);
    expect(result).not.toBeNull();
    expect(result?.surahNumber).toBe(2);
    expect(result?.verseNumber).toBe(255);
    expect(result?.chapter.transliteratedName).toBe('Al-Baqarah');
    expect(result?.famousName).toContain('Ayat Al-Kursi');
    expect(result?.url).toBe('/2?startingVerse=255');
  });

  it('parses "18:10" pattern for Surah Al-Kahf', () => {
    const result = parseDirectAyahJump('18:10', mockChaptersData);
    expect(result).not.toBeNull();
    expect(result?.surahNumber).toBe(18);
    expect(result?.verseNumber).toBe(10);
    expect(result?.url).toBe('/18?startingVerse=10');
  });

  it('parses "2 255" space separated pattern', () => {
    const result = parseDirectAyahJump('2 255', mockChaptersData);
    expect(result).not.toBeNull();
    expect(result?.surahNumber).toBe(2);
    expect(result?.verseNumber).toBe(255);
  });

  it('parses "surah 2 ayah 255" textual pattern', () => {
    const result = parseDirectAyahJump('surah 2 ayah 255', mockChaptersData);
    expect(result).not.toBeNull();
    expect(result?.surahNumber).toBe(2);
    expect(result?.verseNumber).toBe(255);
  });

  it('parses "chapter 18 verse 10" textual pattern', () => {
    const result = parseDirectAyahJump('chapter 18 verse 10', mockChaptersData);
    expect(result).not.toBeNull();
    expect(result?.surahNumber).toBe(18);
    expect(result?.verseNumber).toBe(10);
  });

  it('returns null for invalid verse number exceeding chapter count (e.g. 1:10 when Al-Fatihah only has 7 verses)', () => {
    const result = parseDirectAyahJump('1:10', mockChaptersData);
    expect(result).toBeNull();
  });

  it('returns null for non-existent chapter (e.g. 115:1)', () => {
    const result = parseDirectAyahJump('115:1', mockChaptersData);
    expect(result).toBeNull();
  });

  it('returns null for random non-numeric query text', () => {
    const result = parseDirectAyahJump('musa pharaoh prayer', mockChaptersData);
    expect(result).toBeNull();
  });
});
