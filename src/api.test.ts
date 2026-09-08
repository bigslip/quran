import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  fetcher,
  OFFLINE_ERROR,
  STATIC_DEDUPING_INTERVAL,
  DYNAMIC_DEDUPING_INTERVAL,
  staticDataSWRConfig,
  dynamicDataSWRConfig,
  getChapterVerses,
  getAvailableTranslations,
  getTafsirs,
} from '@/api';
import { QURAN_READER_SWR_CONFIG } from '@/components/QuranReader/api';

vi.mock('@/redux/defaultSettings/util', () => ({
  getTranslationsInitialState: () => ({
    selectedTranslations: [131],
  }),
  getReadingPreferencesInitialState: () => ({
    selectedWordByWordLocale: 'en',
    selectedReflectionLanguages: ['en'],
    selectedLessonLanguages: ['en'],
  }),
  getTafsirsInitialState: () => ({
    selectedTafsirs: ['en-tafsir'],
  }),
  getQuranReaderStylesInitialState: () => ({
    quranFont: 'qpc_uthmani_hafs',
    mushafLines: '16_lines',
  }),
}));

describe('API & SWR Caching Module', () => {
  describe('SWR Caching Constants and Configurations', () => {
    it('exports STATIC_DEDUPING_INTERVAL as 60000ms', () => {
      expect(STATIC_DEDUPING_INTERVAL).toBe(60000);
    });

    it('exports DYNAMIC_DEDUPING_INTERVAL as 2000ms', () => {
      expect(DYNAMIC_DEDUPING_INTERVAL).toBe(2000);
    });

    it('exports staticDataSWRConfig with focus/reconnect disabled and 60s deduping', () => {
      expect(staticDataSWRConfig).toEqual({
        dedupingInterval: 60000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
      });
    });

    it('exports dynamicDataSWRConfig with focus revalidation and 2s deduping', () => {
      expect(dynamicDataSWRConfig).toEqual({
        dedupingInterval: 2000,
        revalidateOnFocus: true,
        revalidateOnReconnect: false,
      });
    });

    it('exports QURAN_READER_SWR_CONFIG with 60s deduping and immutable settings', () => {
      expect(QURAN_READER_SWR_CONFIG.dedupingInterval).toBe(60000);
      expect(QURAN_READER_SWR_CONFIG.revalidateOnFocus).toBe(false);
      expect(QURAN_READER_SWR_CONFIG.revalidateOnReconnect).toBe(false);
      expect(QURAN_READER_SWR_CONFIG.revalidateIfStale).toBe(false);
    });
  });

  describe('fetcher', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('fetches and returns camelized JSON data on 200 OK', async () => {
      const mockData = {
        chapter_id: 1,
        verse_count: 7,
        translated_name: {
          name: 'The Opener',
          language_name: 'english',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response);

      const result = await fetcher<any>('https://api.qurancdn.com/api/qdc/chapters/1');

      expect(result).toEqual({
        chapterId: 1,
        verseCount: 7,
        translatedName: {
          name: 'The Opener',
          languageName: 'english',
        },
      });
    });

    it('returns raw Response object when fullResponse is true', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
      } as Response;

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await fetcher('https://api.qurancdn.com/api/qdc/chapters/1', {}, true);
      expect(result).toBe(mockResponse);
    });

    it('throws HTTP error on 404 or 500 status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(fetcher('https://api.qurancdn.com/api/qdc/not-found')).rejects.toThrow(
        'Request failed with status 404: Not Found',
      );
    });

    it('throws OFFLINE error when navigator.onLine is false in browser', async () => {
      const originalOnLine = window.navigator.onLine;
      Object.defineProperty(window.navigator, 'onLine', {
        value: false,
        configurable: true,
      });

      await expect(fetcher('https://api.qurancdn.com/api/qdc/chapters')).rejects.toThrow(
        OFFLINE_ERROR,
      );

      Object.defineProperty(window.navigator, 'onLine', {
        value: originalOnLine,
        configurable: true,
      });
    });
  });

  describe('API Endpoints', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('getChapterVerses calls verses endpoint', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ verses: [{ id: 1, verse_key: '1:1' }] }),
      } as Response);

      const res = await getChapterVerses(1, 'en');
      expect(res.verses).toHaveLength(1);
      expect(res.verses[0].verseKey).toBe('1:1');
    });

    it('getAvailableTranslations calls translations endpoint', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ translations: [{ id: 131, name: 'Dr. Mustafa Khattab' }] }),
      } as Response);

      const res = await getAvailableTranslations('en');
      expect(res.translations).toHaveLength(1);
      expect(res.translations[0].name).toBe('Dr. Mustafa Khattab');
    });

    it('getTafsirs calls tafsirs endpoint', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ tafsirs: [{ id: 16, name: 'Tafsir Ibn Kathir' }] }),
      } as Response);

      const res = await getTafsirs('en');
      expect(res.tafsirs).toHaveLength(1);
      expect(res.tafsirs[0].name).toBe('Tafsir Ibn Kathir');
    });
  });
});
