import { describe, it, expect } from 'vitest';

import {
  makeUrl,
  getDefaultWordFields,
  getMushafId,
  STATIC_DEDUPING_INTERVAL,
  DYNAMIC_DEDUPING_INTERVAL,
  staticDataSWRConfig,
  dynamicDataSWRConfig,
} from '@/utils/api';
import { Mushaf, MushafLines, QuranFont } from '@/types/QuranReader';

describe('API Utils & SWR Caching Configuration', () => {
  describe('SWR Caching Strategies', () => {
    it('configures staticDataSWRConfig for immutable Quranic content', () => {
      expect(STATIC_DEDUPING_INTERVAL).toBe(60000);
      expect(staticDataSWRConfig).toEqual({
        dedupingInterval: 60000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
      });
    });

    it('configures dynamicDataSWRConfig for mutable/user content', () => {
      expect(DYNAMIC_DEDUPING_INTERVAL).toBe(2000);
      expect(dynamicDataSWRConfig).toEqual({
        dedupingInterval: 2000,
        revalidateOnFocus: true,
        revalidateOnReconnect: false,
      });
    });
  });

  describe('makeUrl', () => {
    it('generates correct url without parameters', () => {
      const url = makeUrl('/chapters');
      expect(url).toContain('/api/qdc/chapters');
    });

    it('generates correct url with decamelized parameters', () => {
      const url = makeUrl('/verses/by_chapter/1', {
        page: 1,
        perPage: 10,
        wordTranslationLanguage: 'en',
      });
      expect(url).toContain('/api/qdc/verses/by_chapter/1?page=1&per_page=10&word_translation_language=en');
    });
  });

  describe('getDefaultWordFields', () => {
    it('returns default word fields for QPCHafs', () => {
      const result = getDefaultWordFields(QuranFont.QPCHafs);
      expect(result.wordFields).toBe(
        'verse_key,verse_id,page_number,location,text_uthmani,text_imlaei_simple,qpc_uthmani_hafs',
      );
    });

    it('includes font-specific fields and fallback for MadaniV1', () => {
      const result = getDefaultWordFields(QuranFont.MadaniV1);
      expect(result.wordFields).toContain('code_v1');
      expect(result.wordFields).toContain('qpc_uthmani_hafs');
    });

    it('handles TajweedV4 mapping to MadaniV2', () => {
      const result = getDefaultWordFields(QuranFont.TajweedV4);
      expect(result.wordFields).toContain('code_v2');
    });
  });

  describe('getMushafId', () => {
    it('returns correct mushaf id for default font', () => {
      const result = getMushafId(QuranFont.QPCHafs);
      expect(result.mushaf).toBe(Mushaf.KFGQPCHAFS);
    });

    it('handles IndoPak with 15 lines', () => {
      const result = getMushafId(QuranFont.IndoPak, MushafLines.FifteenLines);
      expect(result.mushaf).toBe(Mushaf.Indopak15Lines);
    });

    it('handles IndoPak with 16 lines', () => {
      const result = getMushafId(QuranFont.IndoPak, MushafLines.SixteenLines);
      expect(result.mushaf).toBe(Mushaf.Indopak16Lines);
    });
  });
});
