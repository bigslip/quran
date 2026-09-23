/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs';
import path from 'path';

import { describe, it, expect } from 'vitest';

describe('Tafsir Ingestion & Canonical Datasets', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const tafsir171Path = path.join(rootDir, 'data/qdc/tafsirs/171.json');
  const tafsir172Path = path.join(rootDir, 'data/qdc/tafsirs/172.json');
  const tafsirsListPath = path.join(rootDir, 'data/qdc/tafsirs-list.json');
  const tafsirsListNestedPath = path.join(rootDir, 'data/qdc/tafsirs/tafsirs-list.json');

  it('should verify tafsirs-list.json registers Nemouneh (171) and Noor (172)', () => {
    expect(fs.existsSync(tafsirsListPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(tafsirsListPath, 'utf8'));
    const tafsirs = content.tafsirs || [];

    const nemouneh = tafsirs.find((t: any) => t.id === 171);
    expect(nemouneh).toBeDefined();
    expect(nemouneh.slug).toBe('fa-tafsir-nemouneh');
    expect(nemouneh.name).toBe('تفسیر نمونه');
    expect(nemouneh.author_name).toBe('آیت‌الله ناصر مکارم شیرازی');
    expect(nemouneh.language_name).toBe('persian');
    expect(nemouneh.translated_name).toEqual({
      name: 'تفسیر نمونه',
      language_name: 'persian',
    });

    const noor = tafsirs.find((t: any) => t.id === 172);
    expect(noor).toBeDefined();
    expect(noor.slug).toBe('fa-tafsir-noor');
    expect(noor.name).toBe('تفسیر نور');
    expect(noor.author_name).toBe('حجت‌الاسلام محسن قرائتی');
    expect(noor.language_name).toBe('persian');
    expect(noor.translated_name).toEqual({
      name: 'تفسیر نور',
      language_name: 'persian',
    });

    if (fs.existsSync(tafsirsListNestedPath)) {
      const nestedContent = JSON.parse(fs.readFileSync(tafsirsListNestedPath, 'utf8'));
      const nestedTafsirs = nestedContent.tafsirs || [];
      expect(nestedTafsirs.some((t: any) => t.id === 171)).toBe(true);
      expect(nestedTafsirs.some((t: any) => t.id === 172)).toBe(true);
    }
  });

  it('should verify data/qdc/tafsirs/171.json exists and contains all 6236 verses for Nemouneh', () => {
    expect(fs.existsSync(tafsir171Path)).toBe(true);
    const nemounehData = JSON.parse(fs.readFileSync(tafsir171Path, 'utf8'));

    expect(nemounehData.tafsirId).toBe(171);
    expect(nemounehData.slug).toBe('fa-tafsir-nemouneh');
    expect(nemounehData.name).toBe('تفسیر نمونه');
    expect(nemounehData.author_name).toBe('آیت‌الله ناصر مکارم شیرازی');
    expect(nemounehData.language_name).toBe('persian');
    expect(nemounehData.totalVerses).toBe(6236);

    const keys = Object.keys(nemounehData.byVerseKey || {});
    expect(keys.length).toBe(6236);

    // Verify benchmark verse 1:1
    const verseOneOne = nemounehData.byVerseKey['1:1'];
    expect(verseOneOne).toBeDefined();
    expect(verseOneOne.verse_key).toBe('1:1');
    expect(verseOneOne.verse_number).toBe(1);
    expect(verseOneOne.chapter_id).toBe(1);
    expect(typeof verseOneOne.text).toBe('string');
    expect(verseOneOne.text.length).toBeGreaterThan(0);
    expect(Array.isArray(verseOneOne.points)).toBe(true);
    expect(verseOneOne.points.length).toBeGreaterThan(0);

    // Verify benchmark verse 18:28
    const verseEighteenTwentyEight = nemounehData.byVerseKey['18:28'];
    expect(verseEighteenTwentyEight).toBeDefined();
    expect(verseEighteenTwentyEight.verse_key).toBe('18:28');
    expect(verseEighteenTwentyEight.verse_number).toBe(28);
    expect(verseEighteenTwentyEight.chapter_id).toBe(18);
    expect(verseEighteenTwentyEight.text).toContain('شکیبایی');
    expect(verseEighteenTwentyEight.points.length).toBeGreaterThanOrEqual(2);
  });

  it('should verify data/qdc/tafsirs/172.json exists and contains all 6236 verses for Noor', () => {
    expect(fs.existsSync(tafsir172Path)).toBe(true);
    const noorData = JSON.parse(fs.readFileSync(tafsir172Path, 'utf8'));

    expect(noorData.tafsirId).toBe(172);
    expect(noorData.slug).toBe('fa-tafsir-noor');
    expect(noorData.name).toBe('تفسیر نور');
    expect(noorData.author_name).toBe('حجت‌الاسلام محسن قرائتی');
    expect(noorData.language_name).toBe('persian');
    expect(noorData.totalVerses).toBe(6236);

    const keys = Object.keys(noorData.byVerseKey || {});
    expect(keys.length).toBe(6236);

    // Verify benchmark verse 1:1
    const verseOneOne = noorData.byVerseKey['1:1'];
    expect(verseOneOne).toBeDefined();
    expect(verseOneOne.verse_key).toBe('1:1');
    expect(verseOneOne.verse_number).toBe(1);
    expect(verseOneOne.chapter_id).toBe(1);
    expect(typeof verseOneOne.text).toBe('string');
    expect(verseOneOne.text.length).toBeGreaterThan(0);
    expect(Array.isArray(verseOneOne.points)).toBe(true);
    expect(verseOneOne.points.length).toBeGreaterThan(0);

    // Verify benchmark verse 18:28
    const verseEighteenTwentyEight = noorData.byVerseKey['18:28'];
    expect(verseEighteenTwentyEight).toBeDefined();
    expect(verseEighteenTwentyEight.verse_key).toBe('18:28');
    expect(verseEighteenTwentyEight.verse_number).toBe(28);
    expect(verseEighteenTwentyEight.chapter_id).toBe(18);
    expect(verseEighteenTwentyEight.text).toContain('ارزش همنشین');
    expect(verseEighteenTwentyEight.points.length).toBeGreaterThanOrEqual(2);
  });
});
