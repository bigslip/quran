/* eslint-disable react-func/max-lines-per-function, max-lines */
import { describe, it, expect } from 'vitest';

import {
  getDefaultOgImageUrl,
  getAboutTheQuranImageUrl,
  getLearningPlansImageUrl,
  getEmbedOgImageUrl,
  getMediaGeneratorOgImageUrl,
  getPreparingForRamadanOgImageUrl,
  getBeyondRamadanOgImageUrl,
  getRamadanChallengeOgImageUrl,
  getRamadan2026OgImageUrl,
  getChapterOgImageUrl,
  getWhatIsRamadanOgImageUrl,
  getExploreAnswersOgImageUrl,
  getQuranicCalendarOgImageUrl,
} from './og';

describe('OG Image Utilities', () => {
  const BASE_URL = '';

  describe('getDefaultOgImageUrl', () => {
    it('generates correct URL with default and custom locale', () => {
      expect(getDefaultOgImageUrl({ locale: 'en' })).toBe(`${BASE_URL}/api/og?lang=en`);
      expect(getDefaultOgImageUrl({ locale: 'ar' })).toBe(`${BASE_URL}/api/og?lang=ar`);
      expect(getDefaultOgImageUrl({ locale: 'id' })).toBe(`${BASE_URL}/api/og?lang=id`);
    });

    it('falls back to default locale when locale is empty or undefined', () => {
      expect(getDefaultOgImageUrl({ locale: '' })).toBe(`${BASE_URL}/api/og?lang=en`);
      expect(getDefaultOgImageUrl({ locale: undefined as unknown as string })).toBe(
        `${BASE_URL}/api/og?lang=en`,
      );
      expect(getDefaultOgImageUrl()).toBe(`${BASE_URL}/api/og?lang=en`);
    });
  });

  describe('getChapterOgImageUrl', () => {
    it('generates chapter-only OG image URL', () => {
      expect(getChapterOgImageUrl({ chapterId: 1, locale: 'en' })).toBe(
        `${BASE_URL}/api/og/chapter/1?lang=en`,
      );
      expect(getChapterOgImageUrl({ chapterId: '114', locale: 'ar' })).toBe(
        `${BASE_URL}/api/og/chapter/114?lang=ar`,
      );
    });

    it('generates chapter and verse OG image URL', () => {
      expect(getChapterOgImageUrl({ chapterId: 2, verseNumber: 255, locale: 'en' })).toBe(
        `${BASE_URL}/api/og/chapter/2?lang=en&verse=255`,
      );
      expect(getChapterOgImageUrl({ chapterId: '36', verseNumber: '1', locale: 'fa' })).toBe(
        `${BASE_URL}/api/og/chapter/36?lang=fa&verse=1`,
      );
    });

    it('handles default locale fallback when not supplied', () => {
      expect(getChapterOgImageUrl({ chapterId: 1 })).toBe(`${BASE_URL}/api/og/chapter/1?lang=en`);
    });
  });

  describe('static page OG image URLs', () => {
    it('getAboutTheQuranImageUrl', () => {
      expect(getAboutTheQuranImageUrl({ locale: 'en' })).toBe(
        `${BASE_URL}/api/og/about-the-quran?lang=en`,
      );
      expect(getAboutTheQuranImageUrl()).toBe(`${BASE_URL}/api/og/about-the-quran?lang=en`);
    });

    it('getLearningPlansImageUrl', () => {
      expect(getLearningPlansImageUrl({ locale: 'ar' })).toBe(
        `${BASE_URL}/api/og/learning-plans?lang=ar`,
      );
      expect(getLearningPlansImageUrl()).toBe(`${BASE_URL}/api/og/learning-plans?lang=en`);
    });

    it('getEmbedOgImageUrl', () => {
      expect(getEmbedOgImageUrl({ locale: 'en' })).toBe(`${BASE_URL}/api/og/embed?lang=en`);
      expect(getEmbedOgImageUrl()).toBe(`${BASE_URL}/api/og/embed?lang=en`);
    });

    it('getMediaGeneratorOgImageUrl', () => {
      expect(getMediaGeneratorOgImageUrl({ locale: 'fr' })).toBe(
        `${BASE_URL}/api/og/media?lang=fr`,
      );
      expect(getMediaGeneratorOgImageUrl()).toBe(`${BASE_URL}/api/og/media?lang=en`);
    });

    it('getPreparingForRamadanOgImageUrl', () => {
      expect(getPreparingForRamadanOgImageUrl({ locale: 'en' })).toBe(
        `${BASE_URL}/api/og/preparing-for-ramadan?lang=en`,
      );
      expect(getPreparingForRamadanOgImageUrl()).toBe(
        `${BASE_URL}/api/og/preparing-for-ramadan?lang=en`,
      );
    });

    it('getBeyondRamadanOgImageUrl', () => {
      expect(getBeyondRamadanOgImageUrl({ locale: 'id' })).toBe(
        `${BASE_URL}/api/og/beyond-ramadan?lang=id`,
      );
      expect(getBeyondRamadanOgImageUrl()).toBe(`${BASE_URL}/api/og/beyond-ramadan?lang=en`);
    });

    it('getRamadanChallengeOgImageUrl', () => {
      expect(getRamadanChallengeOgImageUrl({ locale: 'tr' })).toBe(
        `${BASE_URL}/api/og/ramadanchallenge?lang=tr`,
      );
      expect(getRamadanChallengeOgImageUrl()).toBe(`${BASE_URL}/api/og/ramadanchallenge?lang=en`);
    });

    it('getRamadan2026OgImageUrl', () => {
      expect(getRamadan2026OgImageUrl({ locale: 'en' })).toBe(
        `${BASE_URL}/api/og/ramadan2026?lang=en`,
      );
      expect(getRamadan2026OgImageUrl()).toBe(`${BASE_URL}/api/og/ramadan2026?lang=en`);
    });

    it('getWhatIsRamadanOgImageUrl', () => {
      expect(getWhatIsRamadanOgImageUrl({ locale: 'ru' })).toBe(
        `${BASE_URL}/api/og/what-is-ramadan?lang=ru`,
      );
      expect(getWhatIsRamadanOgImageUrl()).toBe(`${BASE_URL}/api/og/what-is-ramadan?lang=en`);
    });

    it('getExploreAnswersOgImageUrl', () => {
      expect(getExploreAnswersOgImageUrl({ locale: 'ur' })).toBe(
        `${BASE_URL}/api/og/explore-answers?lang=ur`,
      );
      expect(getExploreAnswersOgImageUrl()).toBe(`${BASE_URL}/api/og/explore-answers?lang=en`);
    });

    it('getQuranicCalendarOgImageUrl', () => {
      expect(getQuranicCalendarOgImageUrl({ locale: 'en' })).toBe(
        `${BASE_URL}/api/og/calendar?lang=en`,
      );
      expect(getQuranicCalendarOgImageUrl()).toBe(`${BASE_URL}/api/og/calendar?lang=en`);
    });
  });
});
