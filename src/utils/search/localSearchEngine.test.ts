import { describe, it, expect, beforeEach } from 'vitest';
import {
  handleNavigateQuery,
  handleSearchQuery,
  normalizeArabicText,
  normalizeLatinText,
  normalizeNumerals,
  removeArabicDiacritics,
  highlightText,
  _resetSearchIndexCache,
} from './localSearchEngine';
import { SearchNavigationType } from '@/types/Search/SearchNavigationResult';

describe('Local Search Engine', () => {
  beforeEach(() => {
    _resetSearchIndexCache();
  });

  describe('Text Normalization Utilities', () => {
    it('normalizes Eastern Arabic and Persian numerals to ASCII digits', () => {
      expect(normalizeNumerals('۲:۲۵۵')).toBe('2:255');
      expect(normalizeNumerals('صفحة ٥٠')).toBe('صفحة 50');
      expect(normalizeNumerals('جزء ۲۹')).toBe('جزء 29');
    });

    it('removes Arabic diacritics and tatweel', () => {
      expect(removeArabicDiacritics('الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ')).toBe(
        'الحمد لله رب العالمين',
      );
      expect(removeArabicDiacritics('بِـسْـمِ اللَّـهِ')).toBe('بسم الله');
    });

    it('normalizes Arabic and Persian characters for flexible search', () => {
      expect(normalizeArabicText('إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ')).toBe(
        'ایاک نعبد وایاک نستعین',
      );
      expect(normalizeArabicText('الفاتحة')).toBe('الفاتحه');
      expect(normalizeArabicText('المُلْك')).toBe('الملک');
    });

    it('normalizes Latin text removing extra punctuation and apostrophes', () => {
      expect(normalizeLatinText("Al-Fātiĥah's")).toBe('al fatihahs');
      expect(normalizeLatinText('Surah  Ali `Imran')).toBe('surah ali imran');
    });

    it('highlights matching text with <mark> tags', () => {
      const highlighted = highlightText('In the name of Allah, the Entirely Merciful', 'Allah Merciful');
      expect(highlighted).toContain('<mark>Allah</mark>');
      expect(highlighted).toContain('<mark>Merciful</mark>');
    });
  });

  describe('handleNavigateQuery (Instant Navigation)', () => {
    it('handles exact verse key navigation', async () => {
      const results = await handleNavigateQuery('2:255');
      expect(results.length).toBeGreaterThan(0);
      const ayah = results.find((r) => r.resultType === SearchNavigationType.AYAH && r.key === '2:255');
      expect(ayah).toBeDefined();
      expect(ayah?.name).toContain('Surah Al-Baqarah 2:255');
    });

    it('handles verse range navigation', async () => {
      const results = await handleNavigateQuery('1:1-7');
      expect(results.length).toBeGreaterThan(0);
      const range = results.find((r) => r.resultType === SearchNavigationType.RANGE);
      expect(range).toBeDefined();
      expect(range?.key).toBe('1:1-7');
    });

    it('handles natural language verse search like "surah 2 ayah 255" and "surah baqarah 255"', async () => {
      const res1 = await handleNavigateQuery('surah 2 ayah 255');
      expect(res1.some((r) => r.key === '2:255')).toBe(true);

      const res2 = await handleNavigateQuery('surah baqarah 255');
      expect(res2.some((r) => r.key === '2:255')).toBe(true);

      const res3 = await handleNavigateQuery('chapter 36 verse 58');
      expect(res3.some((r) => r.key === '36:58')).toBe(true);
    });

    it('handles page navigation (e.g. "page 50", "p50", "صفحة 50")', async () => {
      const res1 = await handleNavigateQuery('page 50');
      expect(res1.some((r) => r.resultType === SearchNavigationType.PAGE && r.key === '50')).toBe(true);

      const res2 = await handleNavigateQuery('p50');
      expect(res2.some((r) => r.resultType === SearchNavigationType.PAGE && r.key === '50')).toBe(true);

      const res3 = await handleNavigateQuery('صفحة ۵۰');
      expect(res3.some((r) => r.resultType === SearchNavigationType.PAGE && r.key === '50')).toBe(true);
    });

    it('handles juz navigation (e.g. "juz 29", "j29", "para 30")', async () => {
      const res1 = await handleNavigateQuery('juz 29');
      expect(res1.some((r) => r.resultType === SearchNavigationType.JUZ && r.key === '29')).toBe(true);

      const res2 = await handleNavigateQuery('j29');
      expect(res2.some((r) => r.resultType === SearchNavigationType.JUZ && r.key === '29')).toBe(true);

      const res3 = await handleNavigateQuery('para 30');
      expect(res3.some((r) => r.resultType === SearchNavigationType.JUZ && r.key === '30')).toBe(true);
    });

    it('handles hizb and rub el hizb navigation', async () => {
      const resHizb = await handleNavigateQuery('hizb 10');
      expect(resHizb.some((r) => r.resultType === SearchNavigationType.HIZB && r.key === '10')).toBe(true);

      const resRub = await handleNavigateQuery('rub 15');
      expect(resRub.some((r) => r.resultType === SearchNavigationType.RUB_EL_HIZB && r.key === '15')).toBe(true);
    });

    it('handles popular Ayahs navigation (Ayatul Kursi, Amanar Rasul, Ayat an-Nur, Dua Yunus)', async () => {
      const kursi = await handleNavigateQuery('ayatul kursi');
      expect(kursi.some((r) => r.key === '2:255')).toBe(true);

      const throne = await handleNavigateQuery('throne verse');
      expect(throne.some((r) => r.key === '2:255')).toBe(true);

      const amanar = await handleNavigateQuery('amanar rasul');
      expect(amanar.some((r) => r.key === '2:285')).toBe(true);

      const nur = await handleNavigateQuery('ayat an nur');
      expect(nur.some((r) => r.key === '24:35')).toBe(true);

      const yunus = await handleNavigateQuery('dua yunus');
      expect(yunus.some((r) => r.key === '21:87')).toBe(true);
    });

    it('handles surah name searches in English, Arabic, and translated names', async () => {
      const fatihah = await handleNavigateQuery('fatihah');
      expect(fatihah.some((r) => r.resultType === SearchNavigationType.SURAH && r.key === '1')).toBe(true);

      const baqarah = await handleNavigateQuery('baqarah');
      expect(baqarah.some((r) => r.resultType === SearchNavigationType.SURAH && r.key === '2')).toBe(true);

      const yasin = await handleNavigateQuery('yasin');
      expect(yasin.some((r) => r.resultType === SearchNavigationType.SURAH && r.key === '36')).toBe(true);

      const arabicMulk = await handleNavigateQuery('الملك');
      expect(arabicMulk.some((r) => r.resultType === SearchNavigationType.SURAH && r.key === '67')).toBe(true);

      const translatedOpener = await handleNavigateQuery('The Opener');
      expect(translatedOpener.some((r) => r.resultType === SearchNavigationType.SURAH && r.key === '1')).toBe(true);
    });

    it('handles Eastern Arabic numerals in queries', async () => {
      const res = await handleNavigateQuery('۲:۲۵۵');
      expect(res.some((r) => r.key === '2:255')).toBe(true);
    });

    it('returns empty array for empty query', async () => {
      const res = await handleNavigateQuery('');
      expect(res).toEqual([]);
    });
  });

  describe('handleSearchQuery (Full Search Engine)', () => {
    it('searches by Arabic text and returns matching verses with navigation', async () => {
      const res = await handleSearchQuery({ query: 'الله لا اله الا هو', page: 1, perPage: 10 });
      expect(res).toBeDefined();
      expect(res.result.navigation).toBeDefined();
      expect(res.result.verses.length).toBeGreaterThan(0);
      expect(res.pagination.totalRecords).toBeGreaterThan(0);
      expect(res.result.verses.some((v: any) => v.key === '2:255')).toBe(true);
    });

    it('searches by English translation text', async () => {
      const res = await handleSearchQuery({ query: 'praise be to Allah', page: 1, perPage: 10 });
      expect(res.result.verses.length).toBeGreaterThan(0);
      expect(res.pagination.totalRecords).toBeGreaterThan(0);
      expect(res.result.verses.some((v: any) => v.key === '1:2' || v.key === '27:59')).toBe(true);
    });


    it('supports highlight markup when requested', async () => {
      const res = await handleSearchQuery({
        query: 'praise',
        page: 1,
        perPage: 5,
        highlight: 1,
      });
      expect(res.result.verses.length).toBeGreaterThan(0);
      expect(res.result.verses[0].name).toContain('<mark>');
    });

    it('supports pagination with totalRecords and totalPages', async () => {
      const resPage1 = await handleSearchQuery({ query: 'Allah', page: 1, perPage: 5 });
      expect(resPage1.result.verses).toHaveLength(5);
      expect(resPage1.pagination.currentPage).toBe(1);
      expect(resPage1.pagination.totalPages).toBeGreaterThan(1);
      expect(resPage1.pagination.nextPage).toBe(2);

      const resPage2 = await handleSearchQuery({ query: 'Allah', page: 2, perPage: 5 });
      expect(resPage2.result.verses).toHaveLength(5);
      expect(resPage2.pagination.currentPage).toBe(2);
      expect(resPage2.result.verses[0].key).not.toBe(resPage1.result.verses[0].key);
    });

    it('handles empty or whitespace queries gracefully', async () => {
      const res = await handleSearchQuery({ query: '' });
      expect(res.result.navigation).toEqual([]);
      expect(res.result.verses).toEqual([]);
      expect(res.pagination.totalRecords).toBe(0);
    });
  });
});
