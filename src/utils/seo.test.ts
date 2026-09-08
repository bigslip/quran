/* eslint-disable react-func/max-lines-per-function, max-lines */
import { describe, it, expect, afterEach } from 'vitest';

import { createSEOConfig, getPageOrJuzMetaDescription, config } from './seo';

import { VersesResponse } from 'types/ApiResponses';

describe('SEO Utilities', () => {
  const originalEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;

  afterEach(() => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = originalEnv;
  });

  describe('config constants', () => {
    it('contains valid site branding and social identifiers', () => {
      expect(config.siteName).toBe('Quran.ir');
      expect(config.twitterHandle).toBe('@app_quran');
      expect(config.twitterCardType).toBe('summary_large_image');
      expect(config.facebookApp).toBe('342185219529773');
      expect(config.facebookPage).toBe('603289706669016');
      expect(config.appleAppId).toBe('1118663303');
      expect(config.androidPackage).toBe('com.quran.labs.androidquran');
    });
  });

  describe('createSEOConfig', () => {
    it('returns expected default configuration when called with no arguments', () => {
      const seo = createSEOConfig();

      expect(seo.title).toBe('');
      expect(seo.titleTemplate).toBe('%s - Quran.ir');
      expect(seo.defaultTitle).toBe('Quran.ir');
      expect(seo.canonical).toBeUndefined();
      expect(seo.description).toBeUndefined();
      expect(seo.openGraph?.type).toBe('website');
      expect(seo.openGraph?.site_name).toBe('Quran.ir');
      expect(seo.openGraph?.title).toBe('');
      expect(seo.openGraph?.description).toBeUndefined();
      expect(seo.openGraph?.locale).toBe('en_US');
      expect(seo.openGraph?.images).toEqual([
        {
          url: 'https://og.qurancdn.com/api/og?lang=en',
          width: 1200,
          height: 630,
          alt: 'Quran.ir',
        },
      ]);
      expect(seo.facebook?.appId).toBe('342185219529773');
      expect(seo.twitter?.handle).toBe('@app_quran');
      expect(seo.twitter?.site).toBe('@app_quran');
      expect(seo.twitter?.cardType).toBe('summary_large_image');
      expect(seo.additionalMetaTags).toEqual(
        expect.arrayContaining([
          { property: 'fb:pages', content: '603289706669016' },
          { name: 'Charset', content: 'UTF-8' },
          { name: 'Distribution', content: 'Global' },
          { name: 'Rating', content: 'General' },
          { name: 'theme-color', content: '#fff' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
        ]),
      );
    });

    it('customizes title, description, canonicalUrl, and locale correctly', () => {
      const seo = createSEOConfig({
        title: 'Al-Fatihah',
        description: 'The Opener - Surah 1 of the Holy Quran',
        canonicalUrl: 'https://quran.ir/1',
        locale: 'ar',
      });

      expect(seo.title).toBe('Al-Fatihah');
      expect(seo.description).toBe('The Opener - Surah 1 of the Holy Quran');
      expect(seo.canonical).toBe('https://quran.ir/1');
      expect(seo.openGraph?.title).toBe('Al-Fatihah');
      expect(seo.openGraph?.description).toBe('The Opener - Surah 1 of the Holy Quran');
      expect(seo.openGraph?.url).toBe('https://quran.ir/1');
      expect(seo.openGraph?.locale).toBe('ar_EG');
      expect(seo.openGraph?.images?.[0]?.url).toBe('https://og.qurancdn.com/api/og?lang=ar');
    });

    it('maps various locales to their corresponding OpenGraph locale format', () => {
      const localesToTest: Record<string, string> = {
        en: 'en_US',
        ar: 'ar_EG',
        id: 'id_ID',
        fr: 'fr_FR',
        ru: 'ru_RU',
        tr: 'tr_TR',
        ur: 'ur_PK',
      };

      Object.entries(localesToTest).forEach(([locale, expectedOgLocale]) => {
        const seo = createSEOConfig({ locale });
        expect(seo.openGraph?.locale).toBe(expectedOgLocale);
        expect(seo.openGraph?.images?.[0]?.url).toBe(
          `https://og.qurancdn.com/api/og?lang=${locale}`,
        );
      });
    });

    it('falls back gracefully to en_US and lang=en when locale is undefined or empty', () => {
      const seoEmpty = createSEOConfig({ locale: '' });
      expect(seoEmpty.openGraph?.locale).toBe('en_US');
      expect(seoEmpty.openGraph?.images?.[0]?.url).toBe('https://og.qurancdn.com/api/og?lang=en');

      const seoUndefined = createSEOConfig({ locale: undefined });
      expect(seoUndefined.openGraph?.locale).toBe('en_US');
      expect(seoUndefined.openGraph?.images?.[0]?.url).toBe(
        'https://og.qurancdn.com/api/og?lang=en',
      );
    });

    describe('production vs non-production indexing flags', () => {
      it('allows indexing and following in production environment', () => {
        process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
        const seo = createSEOConfig();
        expect(seo.dangerouslySetAllPagesToNoIndex).toBe(false);
        expect(seo.dangerouslySetAllPagesToNoFollow).toBe(false);
      });

      it('disallows indexing and following in preview environment', () => {
        process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview';
        const seo = createSEOConfig();
        expect(seo.dangerouslySetAllPagesToNoIndex).toBe(true);
        expect(seo.dangerouslySetAllPagesToNoFollow).toBe(true);
      });

      it('disallows indexing and following in development or unset environment', () => {
        delete process.env.NEXT_PUBLIC_VERCEL_ENV;
        const seo = createSEOConfig();
        expect(seo.dangerouslySetAllPagesToNoIndex).toBe(true);
        expect(seo.dangerouslySetAllPagesToNoFollow).toBe(true);
      });
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
});
