import { describe, it, expect } from 'vitest';

import {
  getSurahNavigationUrl,
  getVerseNavigationUrl,
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
  });

  it('generates canonical URLs correctly', () => {
    const basePath = getBasePath();
    expect(getCanonicalUrl('en', '/al-baqarah')).toBe(`${basePath}/al-baqarah`);
    expect(getCanonicalUrl('fa', '/al-baqarah')).toBe(`${basePath}/fa/al-baqarah`);
    expect(getCanonicalUrl('ar', '/al-baqarah')).toBe(`${basePath}/ar/al-baqarah`);
  });

  it('generates previous and next surah navigation URLs', () => {
    expect(getPreviousSurahNavigationUrl(2)).toBe('/1');
    expect(getNextSurahNavigationUrl(2)).toBe('/3');
  });
});
