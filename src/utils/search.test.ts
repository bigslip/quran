import { describe, it, expect } from 'vitest';
import {
  sanitizeSearchHighlight,
  getTranslationsByLanguages,
  getSearchNavigationResult,
  getResultType,
} from './search';
import { SearchNavigationType } from 'types/Search/SearchNavigationResult';

describe('search utilities', () => {
  describe('sanitizeSearchHighlight', () => {
    it('allows safe inline markup tags (mark, em, strong, b)', () => {
      const input = 'This is <mark>highlighted</mark> and <em>emphasized</em> and <strong>strong</strong>';
      expect(sanitizeSearchHighlight(input)).toBe(input);
    });

    it('strips dangerous tags and attributes (XSS prevention)', () => {
      const input = 'Search for: <img src=x onerror="alert(1)"> <script>alert(1)</script><mark class="xss">quran</mark>';
      expect(sanitizeSearchHighlight(input)).toBe('Search for:  <mark>quran</mark>');
    });

    it('handles empty or null input safely', () => {
      expect(sanitizeSearchHighlight('')).toBe('');
      expect(sanitizeSearchHighlight(null as any)).toBe('');
    });
  });

  describe('getTranslationsByLanguages', () => {
    it('groups translations by lowercase language name', () => {
      const translations = [
        { id: 1, languageName: 'English', authorName: 'Sahih' },
        { id: 2, languageName: 'english', authorName: 'Pickthall' },
        { id: 3, languageName: 'Arabic', authorName: 'Muyassar' },
      ];

      const grouped = getTranslationsByLanguages(translations as any);
      expect(Object.keys(grouped)).toEqual(['english', 'arabic']);
      expect(grouped.english.length).toBe(2);
      expect(grouped.arabic.length).toBe(1);
    });
  });

  describe('getResultType', () => {
    it('returns proper navigation type based on flags', () => {
      expect(getResultType({ resultType: SearchNavigationType.SURAH } as any)).toBe(
        SearchNavigationType.SURAH,
      );
      expect(
        getResultType({
          resultType: SearchNavigationType.AYAH,
          isArabic: true,
        } as any),
      ).toBe(SearchNavigationType.AYAH);
      expect(
        getResultType({
          resultType: SearchNavigationType.AYAH,
          isTransliteration: true,
        } as any),
      ).toBe(SearchNavigationType.TRANSLITERATION);
      expect(
        getResultType({
          resultType: SearchNavigationType.AYAH,
          isArabic: false,
          isTransliteration: false,
        } as any),
      ).toBe(SearchNavigationType.TRANSLATION);
    });
  });
});
