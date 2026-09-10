import { describe, it, expect } from 'vitest';
import { getLocalApiResponse, initializeLocalDataEngine } from './localDataEngine';

describe('Local Data Query Engine', () => {
  it('initializes cleanly without errors', async () => {
    await expect(initializeLocalDataEngine()).resolves.toBeUndefined();
  });

  describe('Chapters Endpoints', () => {
    it('serves chapters list in english', async () => {
      const res = await getLocalApiResponse('/chapters', { language: 'en' });
      expect(res).toBeDefined();
      expect(res.chapters).toHaveLength(114);
      expect(res.chapters[0].id).toBe(1);
      expect(res.chapters[0].name_simple).toBe('Al-Fatihah');
    });

    it('serves chapters list in persian/arabic if requested', async () => {
      const resFa = await getLocalApiResponse('/chapters', { language: 'fa' });
      expect(resFa.chapters).toHaveLength(114);

      const resAr = await getLocalApiResponse('/chapters', { language: 'ar' });
      expect(resAr.chapters).toHaveLength(114);
    });

    it('serves single chapter by numeric id', async () => {
      const res = await getLocalApiResponse('/chapters/1');
      expect(res).toBeDefined();
      expect(res.chapter).toBeDefined();
      expect(res.chapter.id).toBe(1);
      expect(res.chapter.name_simple).toBe('Al-Fatihah');
      expect(res.chapter.verses_count).toBe(7);
    });

    it('serves single chapter by slug', async () => {
      const res = await getLocalApiResponse('/chapters/al-fatihah');
      expect(res).toBeDefined();
      expect(res.chapter.id).toBe(1);
    });

    it('serves chapter info correctly', async () => {
      const res = await getLocalApiResponse('/chapters/1/info', { language: 'en' });
      expect(res).toBeDefined();
      expect(res.chapter_info).toBeDefined();
      expect(res.chapter_info.chapter_id).toBe(1);
      expect(res.chapter_info.text).toContain('Al-Fatihah');
    });
  });

  describe('Pages Lookup Endpoint', () => {
    it('serves full 604 pages lookup for Mushaf 2', async () => {
      const res = await getLocalApiResponse('/pages/lookup', { mushaf: 2 });
      expect(res).toBeDefined();
      expect(res.total_page || res.totalPage).toBe(604);
      expect(res.pages['1']).toBeDefined();
      expect(res.pages['1'].first_verse_key).toBe('1:1');
      expect(res.pages['1'].last_verse_key).toBe('1:7');
    });

    it('serves pages lookup for Mushaf 1', async () => {
      const res = await getLocalApiResponse('/pages/lookup', { mushaf: 1 });
      expect(res).toBeDefined();
      expect(res.pages['604']).toBeDefined();
    });

    it('filters lookup pages by chapter_number', async () => {
      const res = await getLocalApiResponse('/pages/lookup', { chapter_number: 1, mushaf: 2 });
      expect(res).toBeDefined();
      expect(Object.keys(res.pages)).toEqual(['1']);
    });
  });

  describe('Verses by Page Endpoint', () => {
    it('serves page 1 verses with full word glyphs', async () => {
      const res = await getLocalApiResponse('/verses/by_page/1', { words: 'true', mushaf: 2 });
      expect(res).toBeDefined();
      expect(res.verses).toHaveLength(7);
      expect(res.verses[0].words).toBeDefined();
      expect(res.verses[0].words[0].code_v1 || res.verses[0].words[0].codeV1).toBeDefined();
      expect(res.verses[0].words[0].text_uthmani).toBe('بِسْمِ');
    });

    it('dynamically stitches single translation when translations param is present', async () => {
      const res = await getLocalApiResponse('/verses/by_page/1', { translations: '20' });
      expect(res.verses).toHaveLength(7);
      expect(res.verses[0].translations).toBeDefined();
      expect(res.verses[0].translations).toHaveLength(1);
      expect(res.verses[0].translations[0].resource_id).toBe(20);
      expect(res.verses[0].translations[0].text).toContain('name of Allāh');
    });

    it('dynamically stitches multiple translations when comma-separated translations param is present', async () => {
      const res = await getLocalApiResponse('/verses/by_page/1', { translations: '20,136' });
      expect(res.verses[0].translations).toHaveLength(2);
      expect(res.verses[0].translations[0].resource_id).toBe(20);
      expect(res.verses[0].translations[1].resource_id).toBe(136);
    });
  });

  describe('Verses by Chapter Endpoint', () => {
    it('serves verses by chapter with default pagination', async () => {
      const res = await getLocalApiResponse('/verses/by_chapter/1', {});
      expect(res).toBeDefined();
      expect(res.verses).toHaveLength(7);
      expect(res.pagination.total_records).toBe(7);
      expect(res.pagination.current_page).toBe(1);
    });

    it('supports custom per_page and page slicing', async () => {
      const res = await getLocalApiResponse('/verses/by_chapter/1', { per_page: 3, page: 2 });
      expect(res.verses).toHaveLength(3);
      expect(res.verses[0].verse_key).toBe('1:4');
      expect(res.pagination.current_page).toBe(2);
      expect(res.pagination.total_pages).toBe(3);
      expect(res.pagination.next_page).toBe(3);
    });

    it('supports from and to verse slicing within chapter', async () => {
      const res = await getLocalApiResponse('/verses/by_chapter/1', { from: '1:2', to: '1:5', per_page: 'all' });
      expect(res.verses).toHaveLength(4);
      expect(res.verses[0].verse_key).toBe('1:2');
      expect(res.verses[3].verse_key).toBe('1:5');
    });

    it('stitches translations in chapter verses query', async () => {
      const res = await getLocalApiResponse('/verses/by_chapter/1', { translations: 20, per_page: 'all' });
      expect(res.verses[0].translations[0].resource_id).toBe(20);
      expect(res.verses[0].translations[0].text).toContain('name of Allāh');
    });
  });

  describe('Verses by Juz, Hizb, Rub el Hizb, Range, Key', () => {
    it('serves verses by juz', async () => {
      const res = await getLocalApiResponse('/verses/by_juz/1', { per_page: 5, page: 1 });
      expect(res.verses).toHaveLength(5);
      expect(res.pagination.total_records).toBeGreaterThan(100);
      expect(res.verses[0].juz_number).toBe(1);
    });

    it('serves verses by hizb', async () => {
      const res = await getLocalApiResponse('/verses/by_hizb/1', { per_page: 5 });
      expect(res.verses).toHaveLength(5);
      expect(res.verses[0].hizb_number).toBe(1);
    });

    it('serves verses by rub el hizb', async () => {
      const res = await getLocalApiResponse('/verses/by_rub_el_hizb/1', { per_page: 5 });
      expect(res.verses).toHaveLength(5);
      expect(res.verses[0].rub_el_hizb_number).toBe(1);
    });

    it('serves verses by range', async () => {
      const res = await getLocalApiResponse('/verses/by_range', { from: '1:1', to: '1:7', per_page: 'all' });
      expect(res.verses).toHaveLength(7);
      expect(res.verses[0].verse_key).toBe('1:1');
      expect(res.verses[6].verse_key).toBe('1:7');
    });

    it('serves verse by single key', async () => {
      const res = await getLocalApiResponse('/verses/by_key/1:1', { translations: '20' });
      expect(res.verse).toBeDefined();
      expect(res.verse.verse_key).toBe('1:1');
      expect(res.verse.translations[0].resource_id).toBe(20);
    });
  });

  describe('Verses Filter Endpoint', () => {
    it('returns verse metadata and page numbers for given filters', async () => {
      const res = await getLocalApiResponse('/verses/filter', { filters: '1:1,1:2' });
      expect(res.verses).toHaveLength(2);
      expect(res.verses[0].verse_key).toBe('1:1');
      expect(res.verses[0].page_number).toBe(1);
      expect(res.verses[1].verse_key).toBe('1:2');
    });
  });

  describe('Resources Endpoints', () => {
    it('serves available translations list', async () => {
      const res = await getLocalApiResponse('/resources/translations');
      expect(res.translations).toBeDefined();
      expect(res.translations.length).toBeGreaterThan(0);
    });

    it('filters translations list by requested IDs', async () => {
      const res = await getLocalApiResponse('/resources/translations/filter', { translations: '20,84' });
      expect(res.translations).toHaveLength(2);
      const ids = res.translations.map((t: any) => t.id);
      expect(ids).toContain(20);
      expect(ids).toContain(84);
    });

    it('serves tafsirs, languages, and word-by-word translations', async () => {
      const tafsirs = await getLocalApiResponse('/resources/tafsirs');
      expect(tafsirs.tafsirs).toBeDefined();

      const languages = await getLocalApiResponse('/resources/languages');
      expect(languages.languages).toBeDefined();

      const wbw = await getLocalApiResponse('/resources/word_by_word_translations');
      expect(wbw.word_by_word_translations).toHaveLength(3);
    });
  });

  describe('Audio Endpoints', () => {
    it('serves available reciters', async () => {
      const res = await getLocalApiResponse('/audio/reciters');
      expect(res.reciters).toBeDefined();
      expect(res.reciters.length).toBeGreaterThan(0);
    });

    it('serves single reciter details', async () => {
      const res = await getLocalApiResponse('/audio/reciters/7');
      expect(res.reciter).toBeDefined();
      expect(res.reciter.id).toBe(7);
      expect(res.reciter.name).toContain('Mishari');
    });

    it('serves chapter audio files with timing segments', async () => {
      const res = await getLocalApiResponse('/audio/reciters/7/audio_files', { chapter: 1, segments: true });
      expect(res.audio_files).toBeDefined();
      expect(res.audio_files[0].chapter_id).toBe(1);
      expect(res.audio_files[0].audio_url).toBe('/audio/reciters/7/001.mp3');
      expect(res.audio_files[0].verse_timings).toBeDefined();
    });

    it('serves verse timestamp lookup', async () => {
      const res = await getLocalApiResponse('/audio/reciters/7/timestamp', { verse_key: '1:1' });
      expect(res.result).toBeDefined();
      expect(res.result.timestamp_from).toBe(0);
      expect(res.result.timestamp_to).toBe(6090);
    });
  });

  describe('Advanced Copy & Footnotes', () => {
    it('serves advanced copy text for range', async () => {
      const res = await getLocalApiResponse('/verses/advanced_copy', { from: '1:1', to: '1:3' });
      expect(res.result).toBeDefined();
      expect(res.result).toContain('1:1');
      expect(res.result).toContain('1:3');
    });

    it('serves footnote fallback cleanly', async () => {
      const res = await getLocalApiResponse('/foot_notes/195932');
      expect(res.foot_note).toBeDefined();
      expect(res.foot_note.id).toBe(195932);
    });
  });
});
