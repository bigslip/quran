import { describe, it, expect } from 'vitest';

import {
  getSurahNavigationUrl,
  getVerseNavigationUrl,
  getVerseNavigationUrlByVerseKey,
  getSurahRangeNavigationUrlByVerseKey,
  getChapterWithStartingVerseUrl,
  getRangesNavigationUrl,
  getVerseTafsirNavigationUrl,
  getCanonicalUrl,
  getPreviousSurahNavigationUrl,
  getNextSurahNavigationUrl,
} from './navigation';
import { getBasePath } from './url';

describe('Navigation SEO Utilities', () => {
  it('generates slug-based chapter URLs', () => {
    expect(getSurahNavigationUrl('al-baqarah')).toBe('/al-baqarah');
    expect(getSurahNavigationUrl(2)).toBe('/2');
    expect(getSurahNavigationUrl('2')).toBe('/2');
  });

  it('generates slug-based verse URLs', () => {
    expect(getVerseNavigationUrl('al-baqarah', '255')).toBe('/al-baqarah/255');
    expect(getVerseNavigationUrl('2', '255')).toBe('/2/255');
    expect(getVerseNavigationUrlByVerseKey('2:255', 'al-baqarah')).toBe('/al-baqarah/255');
    expect(getVerseNavigationUrlByVerseKey('2:255')).toBe('/2/255');
    expect(getSurahRangeNavigationUrlByVerseKey('2:255-256', 'al-baqarah')).toBe('/al-baqarah/255-256');
    expect(getSurahRangeNavigationUrlByVerseKey('2:255-256')).toBe('/2/255-256');
    expect(getChapterWithStartingVerseUrl('2:255', 'al-baqarah')).toBe('/al-baqarah?startingVerse=255');
    expect(getChapterWithStartingVerseUrl('2:255')).toBe('/2?startingVerse=255');
  });

  it('generates range navigation URLs correctly', () => {
    expect(getRangesNavigationUrl('2:1', '2:10')).toBe('/2:1-2:10');
    expect(getVerseTafsirNavigationUrl('al-baqarah', 255)).toBe('/al-baqarah/255/tafsirs');
    expect(getVerseTafsirNavigationUrl('al-baqarah', 255, '169')).toBe(
      '/al-baqarah/255/tafsirs?tafsirId=169',
    );
  });

  it('generates canonical URLs correctly', () => {
    const basePath = getBasePath();
    expect(getCanonicalUrl('en', '/al-baqarah')).toBe(`${basePath}/al-baqarah`);
    expect(getCanonicalUrl('fa', '/al-baqarah')).toBe(`${basePath}/fa/al-baqarah`);
    expect(getCanonicalUrl('ar', '/al-baqarah')).toBe(`${basePath}/ar/al-baqarah`);
    expect(getCanonicalUrl('ur', '/al-baqarah/255')).toBe(`${basePath}/ur/al-baqarah/255`);
  });

  it('generates previous and next surah navigation URLs', () => {
    expect(getPreviousSurahNavigationUrl(2)).toBe('/1');
    expect(getNextSurahNavigationUrl(2)).toBe('/3');
  });
});

