import { describe, it, expect } from 'vitest';
import { getPageOrJuzMetaDescription, getSurahSeoTitle, isAyatulKursi } from './seo';
import { VersesResponse } from 'types/ApiResponses';

const mockChapter = {
  id: 2,
  transliteratedName: 'Al-Baqarah',
  translatedName: 'The Cow',
  nameArabic: 'البقرة',
  versesCount: 286,
  revelationPlace: 'madinah',
  slug: 'al-baqarah',
};

describe('isAyatulKursi', () => {
  it('returns true for chapter 2 verse 255', () => {
    expect(isAyatulKursi('2', 255)).toBe(true);
    expect(isAyatulKursi(2, '255')).toBe(true);
  });

  it('returns false for other chapters or verses', () => {
    expect(isAyatulKursi('2', 254)).toBe(false);
    expect(isAyatulKursi('3', 255)).toBe(false);
  });
});

describe('getPageOrJuzMetaDescription', () => {
  it('joins the text of the first 4 verses with hyphen separator', () => {
    const response = {
      verses: [
        { textImlaeiSimple: 'Verse 1' },
        { textImlaeiSimple: 'Verse 2' },
        { textImlaeiSimple: 'Verse 3' },
        { textImlaeiSimple: 'Verse 4' },
        { textImlaeiSimple: 'Verse 5' },
      ],
    } as unknown as VersesResponse;

    expect(getPageOrJuzMetaDescription(response)).toBe('Verse 1 - Verse 2 - Verse 3 - Verse 4');
  });

  it('handles responses with fewer than 4 verses', () => {
    const response = {
      verses: [{ textImlaeiSimple: 'Verse 1' }, { textImlaeiSimple: 'Verse 2' }],
    } as unknown as VersesResponse;

    expect(getPageOrJuzMetaDescription(response)).toBe('Verse 1 - Verse 2');
  });

  it('returns empty string if verses array is empty', () => {
    const response = {
      verses: [],
    } as unknown as VersesResponse;

    expect(getPageOrJuzMetaDescription(response)).toBe('');
  });

  it('handles undefined or null response gracefully', () => {
    expect(getPageOrJuzMetaDescription(undefined as unknown as VersesResponse)).toBe('');
    expect(getPageOrJuzMetaDescription(null as unknown as VersesResponse)).toBe('');
    expect(getPageOrJuzMetaDescription({} as unknown as VersesResponse)).toBe('');
  });
});

describe('Surah SEO Title Generator', () => {
  describe('Persian (fa)', () => {
    it('generates high-intent Persian title for Surah page with parentheses in translatedName', () => {
      const title = getSurahSeoTitle({
        chapter: { ...mockChapter, translatedName: 'بقره (گاو ماده)' },
        lang: 'fa',
        isChapter: true,
      });
      expect(title).toBe('سوره بقره (Al-Baqarah) - متن، ترجمه و صوت | قرآن کریم');
    });

    it('generates high-intent Persian title for single verse page', () => {
      const title = getSurahSeoTitle({
        chapter: { ...mockChapter, translatedName: 'بقره (گاو ماده)' },
        lang: 'fa',
        isChapter: false,
        verseNumber: 1,
      });
      expect(title).toBe('آیه ۱ سوره بقره (Al-Baqarah) - متن و ترجمه | قرآن کریم');
    });

    it('generates high-intent Persian title for Ayatul Kursi', () => {
      const title = getSurahSeoTitle({
        chapter: mockChapter,
        lang: 'fa',
        isChapter: false,
        verseNumber: 255,
        isAyatulKursi: true,
      });
      expect(title).toBe('آیت الکرسی (آیه ۲۵۵ سوره بقره) - متن، ترجمه و صوت | قرآن کریم');
    });
  });

  describe('Arabic (ar)', () => {
    it('generates high-intent Arabic title for Surah page', () => {
      const title = getSurahSeoTitle({
        chapter: mockChapter,
        lang: 'ar',
        isChapter: true,
      });
      expect(title).toBe('سورة البقرة - قراءة واستماع وتفسير | القرآن الكريم');
    });

    it('generates high-intent Arabic title for single verse page', () => {
      const title = getSurahSeoTitle({
        chapter: mockChapter,
        lang: 'ar',
        isChapter: false,
        verseNumber: 1,
      });
      expect(title).toBe('سورة البقرة آية ١ - قراءة وتفسير | القرآن الكريم');
    });

    it('generates high-intent Arabic title for Ayatul Kursi', () => {
      const title = getSurahSeoTitle({
        chapter: mockChapter,
        lang: 'ar',
        isChapter: false,
        verseNumber: 255,
        isAyatulKursi: true,
      });
      expect(title).toBe('آية الكرسي (سورة البقرة آية ۲۵۵) - قراءة وتفسير | القرآن الكريم');
    });
  });

  describe('English (en)', () => {
    it('generates high-intent English title for Surah page', () => {
      const title = getSurahSeoTitle({
        chapter: mockChapter,
        lang: 'en',
        isChapter: true,
      });
      expect(title).toBe('Surah Al-Baqarah (The Cow) - Read, Translation & Audio | Quran.ir');
    });

    it('generates high-intent English title for Surah page without translatedName', () => {
      const title = getSurahSeoTitle({
        chapter: { ...mockChapter, translatedName: '' },
        lang: 'en',
        isChapter: true,
      });
      expect(title).toBe('Surah Al-Baqarah - Read, Translation & Audio | Quran.ir');
    });

    it('generates high-intent English title for single verse page', () => {
      const title = getSurahSeoTitle({
        chapter: mockChapter,
        lang: 'en',
        isChapter: false,
        verseNumber: 255,
      });
      expect(title).toBe('Surah Al-Baqarah - Verse 255 - Translation & Tafsir | Quran.ir');
    });

    it('generates high-intent English title for Ayatul Kursi', () => {
      const title = getSurahSeoTitle({
        chapter: mockChapter,
        lang: 'en',
        isChapter: false,
        verseNumber: 255,
        isAyatulKursi: true,
      });
      expect(title).toBe('Ayatul Kursi (Surah Al-Baqarah - Verse 255) - Translation & Audio | Quran.ir');
    });
  });

  describe('Other locales', () => {
    it('generates fallback title for other locale', () => {
      const title = getSurahSeoTitle({
        chapter: { ...mockChapter, translatedName: 'La Vache' },
        lang: 'fr',
        isChapter: true,
      });
      expect(title).toBe('Surah Al-Baqarah (La Vache) - Read, Translation & Audio | Quran.ir');
    });

    it('generates fallback single verse title for other locale', () => {
      const title = getSurahSeoTitle({
        chapter: mockChapter,
        lang: 'fr',
        isChapter: false,
        verseNumber: 5,
      });
      expect(title).toBe('Surah Al-Baqarah - Verse 5 - Translation & Tafsir | Quran.ir');
    });
  });
});
