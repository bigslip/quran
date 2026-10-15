import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { getLocalApiResponse } from '@/utils/localDataEngine';
import { QuranFont } from '@/types/QuranReader';
import { getWordTextFieldNameByFont } from '@/utils/word';

describe('IndoPak Font & Script Regression Guard', () => {
  describe('Dataset Integrity (All 114 Surahs)', () => {
    it('ensures data/qdc/indopak.json exists and contains complete Quran words', () => {
      const unifiedPath = path.join(process.cwd(), 'data/qdc/indopak.json');
      expect(fs.existsSync(unifiedPath)).toBe(true);

      const raw = fs.readFileSync(unifiedPath, 'utf-8');
      const data = JSON.parse(raw);
      const keys = Object.keys(data);
      // Full Quran has over 77,000 words (83,665 including stop markers/end tokens)
      expect(keys.length).toBeGreaterThan(77000);
      expect(data['1:1:1']).toBe('بِسۡمِ');
      expect(data['2:1:1']).toBe('الٓمّٓۚ‏');
      expect(data['114:6:3'].startsWith('وَالنَّاسِ')).toBe(true);
    });

    it('ensures every single chapter shard 1..114 exists in data/qdc/indopak/ with valid structure', () => {
      const dirPath = path.join(process.cwd(), 'data/qdc/indopak');
      expect(fs.existsSync(dirPath)).toBe(true);

      for (let ch = 1; ch <= 114; ch++) {
        const shardPath = path.join(dirPath, `${ch}.json`);
        expect(fs.existsSync(shardPath), `Missing IndoPak shard for Surah ${ch}`).toBe(true);

        const content = JSON.parse(fs.readFileSync(shardPath, 'utf-8'));
        expect(content.chapterId).toBe(ch);
        expect(content.mushaf).toBe(7);
        expect(content.words).toBeDefined();
        expect(Object.keys(content.words).length).toBeGreaterThan(0);
        // First word of first verse in chapter must be non-empty string
        const firstKey = Object.keys(content.words)[0];
        expect(typeof content.words[firstKey]).toBe('string');
        expect(content.words[firstKey].length).toBeGreaterThan(0);
      }
    });
  });

  describe('LocalDataEngine Integration across All Verse Endpoints', () => {
    it('serves text_indopak and textIndopak on /verses/by_chapter', async () => {
      const res = await getLocalApiResponse('/verses/by_chapter/1', { words: 'true' });
      expect(res.verses).toBeDefined();
      expect(res.verses.length).toBe(7);
      for (const verse of res.verses) {
        for (const word of verse.words) {
          expect(word.text_indopak).toBeDefined();
          expect(word.text_indopak.length).toBeGreaterThan(0);
          expect(word.textIndopak).toBe(word.text_indopak);
        }
      }
    });

    it('serves text_indopak on /verses/by_page', async () => {
      const res = await getLocalApiResponse('/verses/by_page/1', { words: 'true' });
      expect(res.verses.length).toBeGreaterThan(0);
      for (const verse of res.verses) {
        for (const word of verse.words) {
          expect(word.text_indopak).toBeDefined();
          expect(word.text_indopak.length).toBeGreaterThan(0);
        }
      }
    });

    it('serves text_indopak on /verses/by_juz', async () => {
      const res = await getLocalApiResponse('/verses/by_juz/1', { words: 'true', per_page: 5 });
      expect(res.verses.length).toBe(5);
      for (const verse of res.verses) {
        for (const word of verse.words) {
          expect(word.text_indopak).toBeDefined();
          expect(word.text_indopak.length).toBeGreaterThan(0);
        }
      }
    });

    it('serves text_indopak on /verses/by_range', async () => {
      const res = await getLocalApiResponse('/verses/by_range', {
        from: '1:1',
        to: '1:3',
        words: 'true',
        per_page: 'all',
      });
      expect(res.verses.length).toBe(3);
      for (const verse of res.verses) {
        for (const word of verse.words) {
          expect(word.text_indopak).toBeDefined();
          expect(word.text_indopak.length).toBeGreaterThan(0);
        }
      }
    });

    it('serves text_indopak on /verses/by_key', async () => {
      const res = await getLocalApiResponse('/verses/by_key/2:255', { words: 'true' });
      expect(res.verse).toBeDefined();
      expect(res.verse.words.length).toBeGreaterThan(0);
      for (const word of res.verse.words) {
        expect(word.text_indopak).toBeDefined();
        expect(word.text_indopak.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Word Text Field Name Helper', () => {
    it('maps QuranFont.IndoPak to textIndopak', () => {
      expect(getWordTextFieldNameByFont(QuranFont.IndoPak)).toBe('textIndopak');
    });

    it('maps other fonts to textUthmani', () => {
      expect(getWordTextFieldNameByFont(QuranFont.QPCHafs)).toBe('textUthmani');
      expect(getWordTextFieldNameByFont(QuranFont.MadaniV1)).toBe('textUthmani');
    });
  });
});
