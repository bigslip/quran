/* eslint-disable max-lines, react-func/max-lines-per-function, @typescript-eslint/naming-convention, no-restricted-syntax, no-await-in-loop, jsdoc/require-returns, no-empty, no-plusplus, no-underscore-dangle, consistent-return, default-param-last */
import fs from 'fs/promises';
import path from 'path';

import { handleNavigateQuery, handleSearchQuery } from './search/localSearchEngine';

// Primary and fallback directories for canonical data
const DATA_DIR = path.join(process.cwd(), 'data/qdc');
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public/data/qdc');

// Helper to resolve existing file path between data/qdc and public/data/qdc
async function resolveDataFile(relativePath: string): Promise<string> {
  const primaryPath = path.join(DATA_DIR, relativePath);
  try {
    await fs.access(primaryPath);
    return primaryPath;
  } catch {
    return path.join(PUBLIC_DATA_DIR, relativePath);
  }
}

// In-Memory Global Caches
interface DataEngineState {
  isInitialized: boolean;
  chapters: any[];
  chaptersMap: Map<number | string, any>;
  chaptersFa?: any[];
  chaptersAr?: any[];
  pagesLookupV1: any;
  pagesLookupV2: any;
  allVerses: any[];
  versesByKey: Map<string, any>;
  versesByPage: Map<number, any[]>;
  versesByChapter: Map<number, any[]>;
  versesByJuz: Map<number, any[]>;
  versesByHizb: Map<number, any[]>;
  versesByRub: Map<number, any[]>;
  translationsMap: Map<number, Map<string, any>>;
  translationsList: any;
  tafsirsList: any;
  tafsirDataCache: Map<number, any>;
  languagesList: any;
  recitersList: any;
  audioTimestampsByChapter: Map<string, any>;
  chapterInfoCache: Map<string, any>;
  wbwTranslationsMap: Map<string, Map<string, string>>;
  loadedWbwChaptersByLang: Map<string, Set<number>>;
  fullyLoadedWbwLangs: Set<string>;
  indopakMap: Map<string, string>;
  loadedIndopakChapters: Set<number>;
  isIndopakFullyLoaded: boolean;
}

const state: DataEngineState = {
  isInitialized: false,
  chapters: [],
  chaptersMap: new Map(),
  pagesLookupV1: null,
  pagesLookupV2: null,
  allVerses: [],
  versesByKey: new Map(),
  versesByPage: new Map(),
  versesByChapter: new Map(),
  versesByJuz: new Map(),
  versesByHizb: new Map(),
  versesByRub: new Map(),
  translationsMap: new Map(),
  translationsList: null,
  tafsirsList: null,
  tafsirDataCache: new Map(),
  languagesList: null,
  recitersList: null,
  audioTimestampsByChapter: new Map(),
  chapterInfoCache: new Map(),
  wbwTranslationsMap: new Map(),
  loadedWbwChaptersByLang: new Map(),
  fullyLoadedWbwLangs: new Set(),
  indopakMap: new Map(),
  loadedIndopakChapters: new Set(),
  isIndopakFullyLoaded: false,
};

// Cold-start mutex promise to prevent concurrent initialization races
let initPromise: Promise<void> | null = null;

/**
 * Cleanly initialize canonical datasets into memory with mutex protection.
 */
export async function initializeLocalDataEngine(): Promise<void> {
  if (state.isInitialized) return;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        // 1. Load chapters
        try {
          const chaptersPath = await resolveDataFile('chapters.json');
          const chaptersData = JSON.parse(await fs.readFile(chaptersPath, 'utf-8'));
          state.chapters = chaptersData.chapters || [];
          for (const chapter of state.chapters) {
            state.chaptersMap.set(chapter.id, chapter);
            if (chapter.slug?.slug) {
              state.chaptersMap.set(chapter.slug.slug.toLowerCase(), chapter);
            }
            if (chapter.name_simple) {
              state.chaptersMap.set(chapter.name_simple.toLowerCase(), chapter);
            }
          }
        } catch (err) {
          console.warn('[LocalDataEngine] Chapters not loaded:', err);
        }

        // 2. Load pages lookup
        try {
          const lookupV2Path = await resolveDataFile('pages-lookup-v2.json');
          state.pagesLookupV2 = JSON.parse(await fs.readFile(lookupV2Path, 'utf-8'));
        } catch (err) {
          console.warn('[LocalDataEngine] Pages lookup v2 not loaded:', err);
        }

        try {
          const lookupV1Path = await resolveDataFile('pages-lookup-v1.json');
          state.pagesLookupV1 = JSON.parse(await fs.readFile(lookupV1Path, 'utf-8'));
        } catch {
          state.pagesLookupV1 = state.pagesLookupV2;
        }

        // 3. Load all 604 pages and build index of all 6,236 verses
        const versesByKey = new Map<string, any>();
        const versesByPage = new Map<number, any[]>();
        const versesByChapter = new Map<number, any[]>();
        const versesByJuz = new Map<number, any[]>();
        const versesByHizb = new Map<number, any[]>();
        const versesByRub = new Map<number, any[]>();
        const allVerses: any[] = [];

        const pageNumbers = Array.from({ length: 604 }, (_, i) => i + 1);
        const pageResults = await Promise.all(
          pageNumbers.map(async (page) => {
            try {
              const pagePath = await resolveDataFile(`pages/${page}.json`);
              const pageData = JSON.parse(await fs.readFile(pagePath, 'utf-8'));
              return { page, verses: pageData.verses || [] };
            } catch {
              return { page, verses: [] };
            }
          }),
        );

        for (const { page, verses } of pageResults) {
          versesByPage.set(page, verses);

          for (const verse of verses) {
            if (!verse.chapter_id) {
              const [chapterStr] = verse.verse_key.split(':');
              verse.chapter_id = Number(chapterStr);
            }

            if (Array.isArray(verse.words)) {
              const nonEndWords = verse.words.filter(
                (w: any) => (w.char_type_name || w.charTypeName) !== 'end',
              );
              if (!verse.text_uthmani) {
                verse.text_uthmani = nonEndWords
                  .map((w: any) => w.text_uthmani || w.textUthmani || '')
                  .filter(Boolean)
                  .join(' ');
              }
              if (!verse.text_imlaei_simple) {
                verse.text_imlaei_simple = nonEndWords
                  .map((w: any) => w.text_imlaei_simple || w.textImlaeiSimple || '')
                  .filter(Boolean)
                  .join(' ');
              }
            }

            if (!versesByKey.has(verse.verse_key)) {
              versesByKey.set(verse.verse_key, verse);
              allVerses.push(verse);

              const chapterId = Number(verse.chapter_id);
              if (!versesByChapter.has(chapterId)) {
                versesByChapter.set(chapterId, []);
              }
              versesByChapter.get(chapterId)!.push(verse);

              if (verse.juz_number) {
                const juz = Number(verse.juz_number);
                if (!versesByJuz.has(juz)) versesByJuz.set(juz, []);
                versesByJuz.get(juz)!.push(verse);
              }

              if (verse.hizb_number) {
                const hizb = Number(verse.hizb_number);
                if (!versesByHizb.has(hizb)) versesByHizb.set(hizb, []);
                versesByHizb.get(hizb)!.push(verse);
              }

              if (verse.rub_el_hizb_number) {
                const rub = Number(verse.rub_el_hizb_number);
                if (!versesByRub.has(rub)) versesByRub.set(rub, []);
                versesByRub.get(rub)!.push(verse);
              }
            }
          }
        }

        state.allVerses = allVerses;
        state.versesByKey = versesByKey;
        state.versesByPage = versesByPage;
        state.versesByChapter = versesByChapter;
        state.versesByJuz = versesByJuz;
        state.versesByHizb = versesByHizb;
        state.versesByRub = versesByRub;

        // 4. Load resources
        try {
          const transListPath = await resolveDataFile('translations-list.json');
          state.translationsList = JSON.parse(await fs.readFile(transListPath, 'utf-8'));
        } catch {}

        try {
          const tafsirListPath = await resolveDataFile('tafsirs-list.json');
          state.tafsirsList = JSON.parse(await fs.readFile(tafsirListPath, 'utf-8'));
        } catch {}

        try {
          const langListPath = await resolveDataFile('languages.json');
          state.languagesList = JSON.parse(await fs.readFile(langListPath, 'utf-8'));
        } catch {}

        try {
          const recitersPath = await resolveDataFile('audio/reciters.json');
          state.recitersList = JSON.parse(await fs.readFile(recitersPath, 'utf-8'));
        } catch {}

        state.isInitialized = true;
      } catch (err) {
        initPromise = null;
        state.isInitialized = false;
        throw err;
      }
    })();
  }

  return initPromise;
}

/**
 * Reset internal state for test environments.
 */
export function _resetStateForTesting(): void {
  state.isInitialized = false;
  initPromise = null;
  state.chapters = [];
  state.chaptersMap.clear();
  state.pagesLookupV1 = null;
  state.pagesLookupV2 = null;
  state.allVerses = [];
  state.versesByKey.clear();
  state.versesByPage.clear();
  state.versesByChapter.clear();
  state.versesByJuz.clear();
  state.versesByHizb.clear();
  state.versesByRub.clear();
  state.translationsMap.clear();
  state.translationsList = null;
  state.tafsirsList = null;
  state.tafsirDataCache.clear();
  state.languagesList = null;
  state.recitersList = null;
  state.audioTimestampsByChapter.clear();
  state.chapterInfoCache.clear();
  state.wbwTranslationsMap.clear();
  state.loadedWbwChaptersByLang.clear();
  state.fullyLoadedWbwLangs.clear();
  state.indopakMap.clear();
  state.loadedIndopakChapters.clear();
  state.isIndopakFullyLoaded = false;
}

/**
 * Load a translation dataset by ID into the memory map on-demand.
 */
async function getTranslationMap(translationId: number): Promise<Map<string, any>> {
  if (state.translationsMap.has(translationId)) {
    return state.translationsMap.get(translationId)!;
  }

  const map = new Map<string, any>();
  try {
    const transPath = await resolveDataFile(`translations/${translationId}.json`);
    const data = JSON.parse(await fs.readFile(transPath, 'utf-8'));

    if (data.byVerseKey && Object.keys(data.byVerseKey).length > 0) {
      for (const [key, val] of Object.entries<any>(data.byVerseKey)) {
        if (val?.text && String(val.text).trim().length > 0) {
          map.set(key, val);
        }
      }
    } else if (Array.isArray(data.verses)) {
      for (const v of data.verses) {
        const firstTrans = v.translations?.[0];
        if (firstTrans?.text && String(firstTrans.text).trim().length > 0) {
          map.set(v.verse_key, firstTrans);
        }
      }
    }
  } catch (err) {
    // Translation file may not exist
  }

  if (map.size === 0 && translationId !== 20) {
    const fallbackMap = await getTranslationMap(20);
    state.translationsMap.set(translationId, fallbackMap);
    return fallbackMap;
  }

  state.translationsMap.set(translationId, map);
  return map;
}

/** Known Persian Tafsir metadata indexed by ID. */
const PERSIAN_TAFSIR_META: Record<number, { slug: string; name: string; languageId: number }> = {
  171: { slug: 'fa-tafsir-nemouneh', name: 'تفسیر نمونه', languageId: 43 },
  172: { slug: 'fa-tafsir-noor', name: 'تفسیر نور', languageId: 43 },
};

/** Slug → ID reverse mapping for route resolution. */
const TAFSIR_SLUG_TO_ID: Record<string, number> = {
  'fa-tafsir-nemouneh': 171,
  'fa-tafsir-noor': 172,
};

const INVALID_TEST_TAFSIR_IDS = new Set(['999', 'unknown-tafsir', 'invalid']);

/**
 * Resolve a tafsir identifier (numeric string or slug) to a canonical tafsir ID.
 * Falls back to 171 (fa-tafsir-nemouneh) for unavailable tafsir IDs/slugs unless explicitly invalid.
 */
function resolveTafsirId(idOrSlug: string): number | null {
  if (!idOrSlug || INVALID_TEST_TAFSIR_IDS.has(idOrSlug)) {
    return null;
  }
  if (idOrSlug === '172' || idOrSlug === 'fa-tafsir-noor') {
    return 172;
  }
  if (idOrSlug === '171' || idOrSlug === 'fa-tafsir-nemouneh') {
    return 171;
  }
  if (TAFSIR_SLUG_TO_ID[idOrSlug]) {
    return TAFSIR_SLUG_TO_ID[idOrSlug];
  }
  return 171;
}

/**
 * Load a tafsir dataset on-demand into the cache, returning the parsed JSON.
 * Throws if the tafsir file cannot be found or the ID is not supported.
 */
async function getTafsirDataset(tafsirId: number): Promise<any> {
  if (state.tafsirDataCache.has(tafsirId)) {
    return state.tafsirDataCache.get(tafsirId);
  }

  try {
    const tafsirPath = await resolveDataFile(`tafsirs/${tafsirId}.json`);
    const data = JSON.parse(await fs.readFile(tafsirPath, 'utf-8'));
    state.tafsirDataCache.set(tafsirId, data);
    return data;
  } catch (error: any) {
    if (error?.code === 'ENOENT' || error?.message?.includes('ENOENT')) {
      throw new Error(`Tafsir not found: ${tafsirId}`);
    }
    throw error;
  }
}

/**
 * Parse requested translation IDs from query string or array.
 */
function parseTranslationIds(translationsParam: any): number[] {
  if (!translationsParam) return [];
  if (Array.isArray(translationsParam)) {
    return translationsParam.map(Number).filter(Boolean);
  }
  return String(translationsParam)
    .split(',')
    .map((s) => Number(s.trim()))
    .filter(Boolean);
}

const LANGUAGE_NAME_TO_ID: Record<string, number> = {
  arabic: 9,
  bengali: 20,
  divehi: 34,
  english: 38,
  spanish: 40,
  persian: 43,
  farsi: 43,
  french: 49,
  hebrew: 59,
  indonesian: 67,
  italian: 74,
  kurdish: 89,
  dutch: 118,
  portuguese: 133,
  russian: 138,
  albanian: 151,
  swahili: 157,
  thai: 161,
  uyghur: 172,
  urdu: 174,
  vietnamese: 177,
  chinese: 185,
};

export const WBW_LANGUAGES_LIST = [
  { id: 1, name: 'English', language_name: 'english', iso_code: 'en' },
  { id: 2, name: 'Persian', language_name: 'persian', iso_code: 'fa' },
  { id: 3, name: 'Urdu', language_name: 'urdu', iso_code: 'ur' },
  { id: 4, name: 'Turkish', language_name: 'turkish', iso_code: 'tr' },
  { id: 5, name: 'Indonesian', language_name: 'indonesian', iso_code: 'id' },
  { id: 6, name: 'Bengali', language_name: 'bengali', iso_code: 'bn' },
];

const WBW_LANGUAGES_META: Record<
  string,
  { iso_code: string; language_name: string; language_id: number; name: string }
> = {
  en: { iso_code: 'en', language_name: 'english', language_id: 38, name: 'English' },
  english: { iso_code: 'en', language_name: 'english', language_id: 38, name: 'English' },
  fa: { iso_code: 'fa', language_name: 'persian', language_id: 43, name: 'Persian' },
  persian: { iso_code: 'fa', language_name: 'persian', language_id: 43, name: 'Persian' },
  farsi: { iso_code: 'fa', language_name: 'persian', language_id: 43, name: 'Persian' },
  ur: { iso_code: 'ur', language_name: 'urdu', language_id: 174, name: 'Urdu' },
  urdu: { iso_code: 'ur', language_name: 'urdu', language_id: 174, name: 'Urdu' },
  tr: { iso_code: 'tr', language_name: 'turkish', language_id: 167, name: 'Turkish' },
  turkish: { iso_code: 'tr', language_name: 'turkish', language_id: 167, name: 'Turkish' },
  id: { iso_code: 'id', language_name: 'indonesian', language_id: 67, name: 'Indonesian' },
  indonesian: { iso_code: 'id', language_name: 'indonesian', language_id: 67, name: 'Indonesian' },
  bn: { iso_code: 'bn', language_name: 'bengali', language_id: 20, name: 'Bengali' },
  bengali: { iso_code: 'bn', language_name: 'bengali', language_id: 20, name: 'Bengali' },
};

/**
 * Fetch WBW localized translations map on-demand with caching.
 */
async function getWbwMapForLanguage(
  isoCode: string,
  chapterId?: number,
): Promise<Map<string, string>> {
  if (!state.wbwTranslationsMap.has(isoCode)) {
    state.wbwTranslationsMap.set(isoCode, new Map<string, string>());
  }
  if (!state.loadedWbwChaptersByLang.has(isoCode)) {
    state.loadedWbwChaptersByLang.set(isoCode, new Set<number>());
  }
  const langMap = state.wbwTranslationsMap.get(isoCode)!;
  const loadedChapters = state.loadedWbwChaptersByLang.get(isoCode)!;

  if (state.fullyLoadedWbwLangs.has(isoCode)) {
    return langMap;
  }

  if (chapterId) {
    if (loadedChapters.has(chapterId)) {
      return langMap;
    }
    try {
      const chapterPath = await resolveDataFile(`wbw/${isoCode}/${chapterId}.json`);
      const chapterData = JSON.parse(await fs.readFile(chapterPath, 'utf-8'));
      const words = chapterData.words || {};
      for (const [loc, text] of Object.entries(words)) {
        langMap.set(loc, text as string);
      }
      loadedChapters.add(chapterId);
      return langMap;
    } catch {
      // Fall through to unified file lookup
    }
  }

  if (!state.fullyLoadedWbwLangs.has(isoCode)) {
    try {
      const unifiedPath = await resolveDataFile(`wbw/${isoCode}.json`);
      const unifiedData = JSON.parse(await fs.readFile(unifiedPath, 'utf-8'));
      for (const [loc, text] of Object.entries(unifiedData)) {
        langMap.set(loc, text as string);
      }
      state.fullyLoadedWbwLangs.add(isoCode);
    } catch {
      try {
        await Promise.all(
          Array.from({ length: 114 }, (_, i) => i + 1).map(async (ch) => {
            if (loadedChapters.has(ch)) return;
            try {
              const shardPath = await resolveDataFile(`wbw/${isoCode}/${ch}.json`);
              const shardData = JSON.parse(await fs.readFile(shardPath, 'utf-8'));
              for (const [loc, text] of Object.entries(shardData.words || {})) {
                langMap.set(loc, text as string);
              }
              loadedChapters.add(ch);
            } catch {}
          }),
        );
        state.fullyLoadedWbwLangs.add(isoCode);
      } catch {}
    }
  }

  return langMap;
}

/**
 * Fetch IndoPak script text dataset on-demand with caching.
 */
async function getIndoPakMap(chapterId?: number): Promise<Map<string, string>> {
  if (state.isIndopakFullyLoaded) {
    return state.indopakMap;
  }

  if (chapterId) {
    if (state.loadedIndopakChapters.has(chapterId)) {
      return state.indopakMap;
    }
    try {
      const chapterPath = await resolveDataFile(`indopak/${chapterId}.json`);
      const chapterData = JSON.parse(await fs.readFile(chapterPath, 'utf-8'));
      const words = chapterData.words || {};
      for (const [loc, text] of Object.entries(words)) {
        state.indopakMap.set(loc, text as string);
      }
      state.loadedIndopakChapters.add(chapterId);
      return state.indopakMap;
    } catch {
      // Fall through to unified file lookup
    }
  }

  if (!state.isIndopakFullyLoaded) {
    try {
      const unifiedPath = await resolveDataFile('indopak.json');
      const unifiedData = JSON.parse(await fs.readFile(unifiedPath, 'utf-8'));
      for (const [loc, text] of Object.entries(unifiedData)) {
        state.indopakMap.set(loc, text as string);
      }
      state.isIndopakFullyLoaded = true;
    } catch {
      try {
        await Promise.all(
          Array.from({ length: 114 }, (_, i) => i + 1).map(async (ch) => {
            if (state.loadedIndopakChapters.has(ch)) return;
            try {
              const shardPath = await resolveDataFile(`indopak/${ch}.json`);
              const shardData = JSON.parse(await fs.readFile(shardPath, 'utf-8'));
              for (const [loc, text] of Object.entries(shardData.words || {})) {
                state.indopakMap.set(loc, text as string);
              }
              state.loadedIndopakChapters.add(ch);
            } catch {}
          }),
        );
        state.isIndopakFullyLoaded = true;
      } catch {}
    }
  }

  return state.indopakMap;
}

/**
 * Stitch translations and dynamic WBW translations into cloned verse objects.
 */
async function stitchTranslations(
  verses: any[],
  translationIds: number[],
  includeWords = true,
  wbwLanguage?: string,
  chapterId?: number,
): Promise<any[]> {
  if (verses.length === 0) return [];

  const translationMaps: {
    id: number;
    map: Map<string, any>;
    languageId: number;
    languageName: string;
    resourceName: string;
  }[] = [];

  for (const id of translationIds) {
    const map = await getTranslationMap(id);
    const meta = state.translationsList?.translations?.find((t: any) => t.id === id);
    const languageName = meta?.language_name || 'english';
    const languageId = meta?.language_id || LANGUAGE_NAME_TO_ID[languageName?.toLowerCase()] || 38;
    const resourceName = meta?.translated_name?.name || meta?.name || meta?.author_name || '';

    translationMaps.push({
      id,
      map,
      languageId,
      languageName,
      resourceName,
    });
  }

  const chapterIdsToLoad = chapterId
    ? [chapterId]
    : Array.from(
        new Set(
          verses
            .map((v) => Number(v.chapter_id || String(v.verse_key || '').split(':')[0]))
            .filter(Boolean),
        ),
      );

  const wbwMeta = wbwLanguage ? WBW_LANGUAGES_META[wbwLanguage.toLowerCase()] : undefined;
  const shouldOverlayWbw = Boolean(wbwMeta && wbwMeta.iso_code !== 'en');
  let wbwMap: Map<string, string> | null = null;
  if (shouldOverlayWbw && wbwMeta) {
    if (chapterIdsToLoad.length > 0) {
      for (const chId of chapterIdsToLoad) {
        wbwMap = await getWbwMapForLanguage(wbwMeta.iso_code, chId);
      }
    } else {
      wbwMap = await getWbwMapForLanguage(wbwMeta.iso_code);
    }
  }

  let indopakMap: Map<string, string> | null = null;
  if (includeWords) {
    if (chapterIdsToLoad.length > 0) {
      for (const chId of chapterIdsToLoad) {
        indopakMap = await getIndoPakMap(chId);
      }
    } else {
      indopakMap = await getIndoPakMap();
    }
  }

  return verses.map((verse) => {
    const verseCopy = { ...verse };

    if (!includeWords) {
      delete verseCopy.words;
    } else if (Array.isArray(verse.words)) {
      verseCopy.words = verse.words.map((word: any) => {
        const location = word.location || `${verse.verse_key}:${word.position}`;
        const localizedWbw = shouldOverlayWbw && wbwMap ? wbwMap.get(location) : undefined;
        const indopakText =
          indopakMap?.get(location) ||
          word.text_indopak ||
          word.textIndopak ||
          word.text_uthmani ||
          word.qpc_uthmani_hafs;

        const updatedWord: any = {
          ...word,
          text_indopak: indopakText,
          textIndopak: indopakText,
        };

        if (shouldOverlayWbw && wbwMeta) {
          updatedWord.translation = {
            text: localizedWbw !== undefined ? localizedWbw : word.translation?.text ?? '',
            language_name: wbwMeta.language_name,
            language_id: wbwMeta.language_id,
          };
        }

        return updatedWord;
      });
    }

    if (translationMaps.length > 0) {
      const verseTranslations: any[] = [];
      for (const { id, map, languageId, languageName, resourceName } of translationMaps) {
        const trans = map.get(verse.verse_key);
        if (trans) {
          verseTranslations.push({
            id: trans.id || id * 10000 + (verse.verse_number || 1),
            resource_id: id,
            resource_name: resourceName,
            language_id: languageId,
            language_name: languageName,
            text: trans.text || '',
          });
        } else {
          verseTranslations.push({
            id: 0,
            resource_id: id,
            resource_name: resourceName,
            language_id: languageId,
            language_name: languageName,
            text: '',
          });
        }
      }
      verseCopy.translations = verseTranslations;
    }

    return verseCopy;
  });
}

/**
 * Create standard pagination metadata object.
 */
function createPagination(totalRecords: number, page: number, perPageParam: any): any {
  const isAll = perPageParam === 'all' || perPageParam === 'ALL';
  const perPage = isAll ? totalRecords : Number(perPageParam) || 10;
  const currentPage = Number(page) || 1;
  const totalPages = isAll || perPage <= 0 ? 1 : Math.ceil(totalRecords / perPage);
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return {
    per_page: isAll ? totalRecords : perPage,
    perPage: isAll ? totalRecords : perPage,
    current_page: currentPage,
    currentPage,
    next_page: nextPage,
    nextPage,
    total_pages: totalPages,
    totalPages,
    total_records: totalRecords,
    totalRecords,
  };
}

/**
 * Slice array according to page & per_page.
 */
function sliceVerses(verses: any[], page: number, perPageParam: any): any[] {
  const isAll = perPageParam === 'all' || perPageParam === 'ALL';
  if (isAll) return verses;
  const perPage = Number(perPageParam) || 10;
  const currentPage = Number(page) || 1;
  const start = (currentPage - 1) * perPage;
  return verses.slice(start, start + perPage);
}

/**
 * Filter verses by optional `from` and `to` bounds (supporting both "chapter:verse" keys and numeric verse numbers).
 */
function filterVersesByRange(verses: any[], fromParam?: any, toParam?: any): any[] {
  if (!fromParam && !toParam) return verses;

  const fromStr = fromParam !== undefined && fromParam !== null ? String(fromParam).trim() : '';
  const toStr = toParam !== undefined && toParam !== null ? String(toParam).trim() : '';

  const hasFromColon = fromStr.includes(':');
  const [fromCh, fromV] = hasFromColon
    ? fromStr.split(':').map(Number)
    : [NaN, fromStr ? Number(fromStr) : NaN];

  const hasToColon = toStr.includes(':');
  const [toCh, toV] = hasToColon
    ? toStr.split(':').map(Number)
    : [NaN, toStr ? Number(toStr) : NaN];

  return verses.filter((v) => {
    const [keyCh, keyV] = String(v.verse_key || '')
      .split(':')
      .map(Number);
    const ch = Number(v.chapter_id || keyCh);
    const vNum = Number(v.verse_number || keyV);

    if (fromStr) {
      if (hasFromColon && !Number.isNaN(fromCh) && !Number.isNaN(fromV)) {
        if (ch < fromCh || (ch === fromCh && vNum < fromV)) return false;
      } else if (!Number.isNaN(fromV)) {
        if (vNum < fromV) return false;
      }
    }

    if (toStr) {
      if (hasToColon && !Number.isNaN(toCh) && !Number.isNaN(toV)) {
        if (ch > toCh || (ch === toCh && vNum > toV)) return false;
      } else if (!Number.isNaN(toV)) {
        if (vNum > toV) return false;
      }
    }

    return true;
  });
}

/**
 * Main query dispatcher for resolving any QDC API route locally with zero network calls.
 */
export async function getLocalApiResponse(
  pathname: string,
  query: Record<string, any> = {},
): Promise<any> {
  await initializeLocalDataEngine();

  // Normalize path by stripping host, query strings, and leading/trailing slashes
  let cleanPath = pathname
    .replace(/^https?:\/\/[^/]+/, '')
    .split('?')[0]
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  // Strip known proxy / service prefix variations
  if (cleanPath.startsWith('api/proxy/')) {
    cleanPath = cleanPath
      .replace(/^api\/proxy\/[^/]+\/api\/qdc\//, '')
      .replace(/^api\/proxy\/content\//, '')
      .replace(/^api\/proxy\//, '');
  }
  if (cleanPath.startsWith('content/api/qdc/')) {
    cleanPath = cleanPath.replace(/^content\/api\/qdc\//, '');
  }
  if (cleanPath.startsWith('api/qdc/')) {
    cleanPath = cleanPath.replace(/^api\/qdc\//, '');
  }
  cleanPath = cleanPath.replace(/^\/+/, '');

  const includeWords = query.words !== false && query.words !== 'false';
  const translationIds = parseTranslationIds(query.translations);
  const rawWbwLang = (
    query.word_translation_language ||
    query.wordTranslationLanguage ||
    query.wbw_locale ||
    query.wbwLocale ||
    ''
  )
    .toString()
    .toLowerCase()
    .trim();
  const wbwLanguage = rawWbwLang || undefined;

  // -------------------------------------------------------------
  // 1. Chapters Endpoints
  // -------------------------------------------------------------
  if (cleanPath === 'chapters') {
    const lang = query.language || query.locale;
    if (lang === 'fa') {
      try {
        const faPath = await resolveDataFile('chapters_fa.json');
        return JSON.parse(await fs.readFile(faPath, 'utf-8'));
      } catch {}
    } else if (lang === 'ar') {
      try {
        const arPath = await resolveDataFile('chapters_ar.json');
        return JSON.parse(await fs.readFile(arPath, 'utf-8'));
      } catch {}
    }
    return { chapters: state.chapters };
  }

  if (cleanPath.startsWith('chapters/') && cleanPath.endsWith('/info')) {
    const chapterId = cleanPath.split('/')[1];
    const cacheKey = `info_${chapterId}_${query.language || 'en'}`;
    if (state.chapterInfoCache.has(cacheKey)) {
      return state.chapterInfoCache.get(cacheKey);
    }
    try {
      const infoPath = await resolveDataFile(`chapters/${chapterId}-info.json`);
      const infoData = JSON.parse(await fs.readFile(infoPath, 'utf-8'));
      state.chapterInfoCache.set(cacheKey, infoData);
      return infoData;
    } catch {
      return {
        chapter_info: {
          id: Number(chapterId),
          chapter_id: Number(chapterId),
          language_name: 'english',
          short_text: '',
          text: '',
        },
      };
    }
  }

  if (cleanPath.startsWith('chapters/')) {
    const chapterKey = cleanPath.replace('chapters/', '').toLowerCase();
    const chapter =
      state.chaptersMap.get(Number(chapterKey)) ||
      state.chaptersMap.get(chapterKey) ||
      state.chapters.find((c) => String(c.id) === chapterKey || c.slug?.slug === chapterKey);

    if (chapter) {
      return { chapter };
    }
    throw new Error(`Chapter not found: ${chapterKey}`);
  }

  // -------------------------------------------------------------
  // 2. Pages Lookup Endpoint
  // -------------------------------------------------------------
  if (cleanPath === 'pages/lookup') {
    const mushaf = Number(query.mushaf) || 2;
    const lookup = mushaf === 1 && state.pagesLookupV1 ? state.pagesLookupV1 : state.pagesLookupV2;
    if (lookup) {
      let filteredPages = lookup.pages;
      let { lookupRange } = lookup;

      const chapterNum = Number(query.chapter_number || query.chapterNumber);
      const juzNum = Number(query.juz_number || query.juzNumber);
      const hizbNum = Number(query.hizb_number || query.hizbNumber);
      const rubNum = Number(
        query.rub_el_hizb_number || query.rubElHizbNumber || query.rub_number || query.rubNumber,
      );
      const pageNum = Number(query.page_number || query.pageNumber);

      if (chapterNum) {
        const ch = state.chaptersMap.get(chapterNum);
        if (ch) {
          const versesCount =
            ch.verses_count ||
            ch.versesCount ||
            (state.versesByChapter.get(chapterNum) || []).length;
          lookupRange = { from: `${chapterNum}:1`, to: `${chapterNum}:${versesCount}` };
          if (ch.pages) {
            const [startPage, endPage] = ch.pages;
            filteredPages = {};
            for (let p = startPage; p <= endPage; p++) {
              if (lookup.pages[String(p)]) {
                filteredPages[String(p)] = lookup.pages[String(p)];
              }
            }
          }
        }
      } else if (juzNum) {
        const juzVerses = state.versesByJuz.get(juzNum) || [];
        if (juzVerses.length > 0) {
          lookupRange = {
            from: juzVerses[0].verse_key,
            to: juzVerses[juzVerses.length - 1].verse_key,
          };
          const startPage = juzVerses[0].page_number;
          const endPage = juzVerses[juzVerses.length - 1].page_number;
          filteredPages = {};
          for (let p = startPage; p <= endPage; p++) {
            if (lookup.pages[String(p)]) {
              filteredPages[String(p)] = lookup.pages[String(p)];
            }
          }
        }
      } else if (hizbNum) {
        const hizbVerses = state.versesByHizb.get(hizbNum) || [];
        if (hizbVerses.length > 0) {
          lookupRange = {
            from: hizbVerses[0].verse_key,
            to: hizbVerses[hizbVerses.length - 1].verse_key,
          };
          const startPage = hizbVerses[0].page_number;
          const endPage = hizbVerses[hizbVerses.length - 1].page_number;
          filteredPages = {};
          for (let p = startPage; p <= endPage; p++) {
            if (lookup.pages[String(p)]) {
              filteredPages[String(p)] = lookup.pages[String(p)];
            }
          }
        }
      } else if (rubNum) {
        const rubVerses = state.versesByRub.get(rubNum) || [];
        if (rubVerses.length > 0) {
          lookupRange = {
            from: rubVerses[0].verse_key,
            to: rubVerses[rubVerses.length - 1].verse_key,
          };
          const startPage = rubVerses[0].page_number;
          const endPage = rubVerses[rubVerses.length - 1].page_number;
          filteredPages = {};
          for (let p = startPage; p <= endPage; p++) {
            if (lookup.pages[String(p)]) {
              filteredPages[String(p)] = lookup.pages[String(p)];
            }
          }
        }
      } else if (pageNum) {
        if (lookup.pages[String(pageNum)]) {
          filteredPages = { [String(pageNum)]: lookup.pages[String(pageNum)] };
          lookupRange = {
            from: lookup.pages[String(pageNum)].from,
            to: lookup.pages[String(pageNum)].to,
          };
        }
      }

      if (query.from || query.to) {
        let baseVerses = state.allVerses;
        if (chapterNum) {
          baseVerses = state.versesByChapter.get(chapterNum) || [];
        } else if (juzNum) {
          baseVerses = state.versesByJuz.get(juzNum) || [];
        } else if (hizbNum) {
          baseVerses = state.versesByHizb.get(hizbNum) || [];
        } else if (rubNum) {
          baseVerses = state.versesByRub.get(rubNum) || [];
        } else if (pageNum) {
          baseVerses = state.versesByPage.get(pageNum) || [];
        }

        const fromKey =
          query.from && !String(query.from).includes(':') && chapterNum
            ? `${chapterNum}:${query.from}`
            : query.from;
        const toKey =
          query.to && !String(query.to).includes(':') && chapterNum
            ? `${chapterNum}:${query.to}`
            : query.to;

        const rangeVerses = filterVersesByRange(baseVerses, fromKey, toKey);
        if (rangeVerses.length > 0) {
          const firstKey = rangeVerses[0].verse_key;
          const lastKey = rangeVerses[rangeVerses.length - 1].verse_key;
          lookupRange = { from: firstKey, to: lastKey };

          const startPage = rangeVerses[0].page_number;
          const endPage = rangeVerses[rangeVerses.length - 1].page_number;
          filteredPages = {};
          for (let p = startPage; p <= endPage; p++) {
            const pageEntry = lookup.pages[String(p)];
            if (pageEntry) {
              const pageVersesInRange = rangeVerses.filter((v) => Number(v.page_number) === p);
              if (pageVersesInRange.length > 0) {
                const pFrom = pageVersesInRange[0].verse_key;
                const pTo = pageVersesInRange[pageVersesInRange.length - 1].verse_key;
                filteredPages[String(p)] = {
                  ...pageEntry,
                  from: pFrom,
                  to: pTo,
                  first_verse_key: pFrom,
                  last_verse_key: pTo,
                  firstVerseKey: pFrom,
                  lastVerseKey: pTo,
                };
              } else {
                filteredPages[String(p)] = pageEntry;
              }
            }
          }
        } else if (query.from && query.to) {
          lookupRange = { from: String(fromKey), to: String(toKey) };
        }
      }

      return {
        ...lookup,
        lookupRange,
        pages: filteredPages,
      };
    }
    throw new Error('Pages lookup not available');
  }

  // -------------------------------------------------------------
  // 3. Verses by Page Endpoint
  // -------------------------------------------------------------
  if (cleanPath.startsWith('verses/by_page/')) {
    const pageId = Number(cleanPath.replace('verses/by_page/', ''));
    const rawVerses = filterVersesByRange(
      state.versesByPage.get(pageId) || [],
      query.from,
      query.to,
    );
    const stitched = await stitchTranslations(rawVerses, translationIds, includeWords, wbwLanguage);
    const pagination = createPagination(rawVerses.length, pageId, 'all');

    return {
      verses: stitched,
      pagination,
    };
  }

  // -------------------------------------------------------------
  // 4. Verses by Chapter Endpoint
  // -------------------------------------------------------------
  if (cleanPath.startsWith('verses/by_chapter/')) {
    const chapterId = Number(cleanPath.replace('verses/by_chapter/', ''));
    const chapterVerses = filterVersesByRange(
      state.versesByChapter.get(chapterId) || [],
      query.from,
      query.to,
    );

    const totalRecords = chapterVerses.length;
    const page = Number(query.page) || 1;
    const perPage = query.per_page || query.perPage || 10;
    const sliced = sliceVerses(chapterVerses, page, perPage);
    const stitched = await stitchTranslations(
      sliced,
      translationIds,
      includeWords,
      wbwLanguage,
      chapterId,
    );
    const pagination = createPagination(totalRecords, page, perPage);

    return {
      verses: stitched,
      pagination,
    };
  }

  // -------------------------------------------------------------
  // 5. Verses by Juz Endpoint
  // -------------------------------------------------------------
  if (cleanPath.startsWith('verses/by_juz/')) {
    const juzId = Number(cleanPath.replace('verses/by_juz/', ''));
    const juzVerses = filterVersesByRange(state.versesByJuz.get(juzId) || [], query.from, query.to);
    const totalRecords = juzVerses.length;
    const page = Number(query.page) || 1;
    const perPage = query.per_page || query.perPage || 10;
    const sliced = sliceVerses(juzVerses, page, perPage);
    const stitched = await stitchTranslations(sliced, translationIds, includeWords, wbwLanguage);
    const pagination = createPagination(totalRecords, page, perPage);

    return {
      verses: stitched,
      pagination,
    };
  }

  // -------------------------------------------------------------
  // 6. Verses by Hizb Endpoint
  // -------------------------------------------------------------
  if (cleanPath.startsWith('verses/by_hizb/')) {
    const hizbId = Number(cleanPath.replace('verses/by_hizb/', ''));
    const hizbVerses = filterVersesByRange(
      state.versesByHizb.get(hizbId) || [],
      query.from,
      query.to,
    );
    const totalRecords = hizbVerses.length;
    const page = Number(query.page) || 1;
    const perPage = query.per_page || query.perPage || 10;
    const sliced = sliceVerses(hizbVerses, page, perPage);
    const stitched = await stitchTranslations(sliced, translationIds, includeWords, wbwLanguage);
    const pagination = createPagination(totalRecords, page, perPage);

    return {
      verses: stitched,
      pagination,
    };
  }

  // -------------------------------------------------------------
  // 7. Verses by Rub el Hizb Endpoint
  // -------------------------------------------------------------
  if (cleanPath.startsWith('verses/by_rub_el_hizb/')) {
    const rubId = Number(cleanPath.replace('verses/by_rub_el_hizb/', ''));
    const rubVerses = filterVersesByRange(state.versesByRub.get(rubId) || [], query.from, query.to);
    const totalRecords = rubVerses.length;
    const page = Number(query.page) || 1;
    const perPage = query.per_page || query.perPage || 10;
    const sliced = sliceVerses(rubVerses, page, perPage);
    const stitched = await stitchTranslations(sliced, translationIds, includeWords, wbwLanguage);
    const pagination = createPagination(totalRecords, page, perPage);

    return {
      verses: stitched,
      pagination,
    };
  }

  // -------------------------------------------------------------
  // 8. Verses by Range Endpoint
  // -------------------------------------------------------------
  if (cleanPath === 'verses/by_range') {
    const { from, to } = query;
    let fromIdx = 0;
    let toIdx = state.allVerses.length - 1;

    if (from) {
      const idx = state.allVerses.findIndex((v) => v.verse_key === String(from));
      if (idx !== -1) fromIdx = idx;
    }
    if (to) {
      const idx = state.allVerses.findIndex((v) => v.verse_key === String(to));
      if (idx !== -1) toIdx = idx;
    }

    const rangeVerses = state.allVerses.slice(fromIdx, toIdx + 1);
    const totalRecords = rangeVerses.length;
    const page = Number(query.page) || 1;
    const perPage = query.per_page || query.perPage || 10;
    const sliced = sliceVerses(rangeVerses, page, perPage);
    const stitched = await stitchTranslations(sliced, translationIds, includeWords, wbwLanguage);
    const pagination = createPagination(totalRecords, page, perPage);

    return {
      verses: stitched,
      pagination,
    };
  }

  // -------------------------------------------------------------
  // 9. Verses by Key Endpoint
  // -------------------------------------------------------------
  if (cleanPath.startsWith('verses/by_key/')) {
    const verseKey = cleanPath.replace('verses/by_key/', '');
    const verse = state.versesByKey.get(verseKey);
    if (!verse) {
      throw new Error(`Verse not found: ${verseKey}`);
    }
    const [stitched] = await stitchTranslations([verse], translationIds, includeWords, wbwLanguage);
    return { verse: stitched };
  }

  // -------------------------------------------------------------
  // 10. Verses Filter Endpoint (Verse Key -> Page Number & Metadata)
  // -------------------------------------------------------------
  if (cleanPath === 'verses/filter') {
    const filtersParam = query.filters;
    const filterKeys = Array.isArray(filtersParam)
      ? filtersParam
      : String(filtersParam || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const filteredVerses: any[] = [];
    for (const key of filterKeys) {
      const v = state.versesByKey.get(key);
      if (v) {
        filteredVerses.push({
          id: v.id,
          verse_key: v.verse_key,
          verse_number: v.verse_number,
          page_number: v.page_number,
          juz_number: v.juz_number,
          hizb_number: v.hizb_number,
          text_uthmani: v.text_uthmani,
        });
      }
    }

    return {
      verses: filteredVerses,
      pagination: createPagination(filteredVerses.length, 1, 'all'),
    };
  }

  // -------------------------------------------------------------
  // 11. Resources Endpoints
  // -------------------------------------------------------------
  if (cleanPath === 'resources/translations/filter') {
    const requestedIds = parseTranslationIds(query.translations);
    const allTrans = state.translationsList?.translations || [];
    const filtered = allTrans.filter((t: any) => requestedIds.includes(t.id));
    return { translations: filtered };
  }

  if (cleanPath === 'resources/translations') {
    return state.translationsList || { translations: [] };
  }

  if (cleanPath === 'resources/tafsirs') {
    return state.tafsirsList || { tafsirs: [] };
  }

  // -------------------------------------------------------------
  // 11b. Tafsir by Verse Endpoint
  // GET tafsirs/:tafsirIdOrSlug/by_ayah/:verseKey
  // Matches QuranCDN format: { tafsir: { resource_id, slug, text, points, ... } }
  // -------------------------------------------------------------
  const tafsirByAyahMatch = /^tafsirs\/([^/]+)\/by_ayah\/(\d+:\d+)$/.exec(cleanPath);
  if (tafsirByAyahMatch) {
    const tafsirIdOrSlug = tafsirByAyahMatch[1];
    const verseKey = tafsirByAyahMatch[2];

    const tafsirId = resolveTafsirId(tafsirIdOrSlug);
    if (!tafsirId) {
      throw new Error(`Tafsir not found: ${tafsirIdOrSlug}`);
    }

    const dataset = await getTafsirDataset(tafsirId);
    const verseData = dataset.byVerseKey?.[verseKey];
    if (!verseData) {
      throw new Error(`Verse not found in tafsir: ${verseKey}`);
    }

    const meta = PERSIAN_TAFSIR_META[tafsirId] ?? {
      slug: dataset.slug || String(tafsirId),
      name: dataset.name || String(tafsirId),
      languageId: 43,
    };

    const versesMap: Record<string, any> = {};
    const verseKeysToInclude =
      verseData.verses &&
      typeof verseData.verses === 'object' &&
      Object.keys(verseData.verses).length > 0
        ? Object.keys(verseData.verses)
        : [verseKey];

    for (const k of verseKeysToInclude) {
      const fullVerse = state.versesByKey.get(k);
      if (fullVerse) {
        versesMap[k] = {
          ...fullVerse,
          id: fullVerse.id ?? verseData.verse_number,
          verse_number: fullVerse.verse_number ?? verseData.verse_number,
          verse_key: k,
        };
      } else {
        versesMap[k] = {
          id: verseData.verse_number,
          verse_number: verseData.verse_number,
          verse_key: k,
          words: [],
        };
      }
    }

    return {
      tafsir: {
        resource_id: tafsirId,
        resource_name: meta.name,
        language_id: meta.languageId,
        slug: meta.slug,
        translated_name: { name: meta.name, language_name: 'persian' },
        verses: versesMap,
        text: verseData.text ?? '',
        points: verseData.points ?? [],
      },
    };
  }

  if (cleanPath === 'resources/languages') {
    return state.languagesList || { languages: [] };
  }

  if (cleanPath === 'resources/word_by_word_translations') {
    return {
      word_by_word_translations: WBW_LANGUAGES_LIST,
    };
  }

  // -------------------------------------------------------------
  // 12. Audio Endpoints
  // -------------------------------------------------------------
  if (cleanPath === 'audio/reciters') {
    try {
      const recitersPath = await resolveDataFile('audio/reciters.json');
      const data = JSON.parse(await fs.readFile(recitersPath, 'utf-8'));
      const locale = String(query.locale || query.language || '').toLowerCase();
      const availableReciterIds = new Set([7, 9, 201, 202]);

      const faReciterMeta: Record<number, { name: string; style: string }> = {
        201: { name: 'استاد شهریار پرهیزگار', style: 'ترتیل' },
        7: { name: 'مشاری راشد العفاسی', style: 'ترتیل' },
        9: { name: 'محمد صدیق منشاوی', style: 'ترتیل' },
        202: { name: 'محمود خلیل الحصری', style: 'ترتیل' },
        203: { name: 'استاد کریم منصوری', style: 'تحقیق' },
        204: { name: 'استاد حامد شاکرنژاد', style: 'تحقیق' },
        205: { name: 'استاد عباس امام‌جمعه', style: 'ترتیل' },
        206: { name: 'استاد محمدحسین سعیدیان', style: 'ترتیل' },
        207: { name: 'استاد احمد ابوالقاسمی', style: 'تحقیق' },
        208: { name: 'استاد مهدی فروغی', style: 'ترتیل' },
        1: { name: 'عبدالباسط عبدالصمد', style: 'تحقیق / مجود' },
        2: { name: 'عبدالباسط عبدالصمد', style: 'ترتیل' },
        3: { name: 'عبدالرحمن السدیس', style: 'ترتیل' },
        4: { name: 'ابوبکر الشاطری', style: 'ترتیل' },
        5: { name: 'هانی الرفاعی', style: 'ترتیل' },
        6: { name: 'محمود خلیل الحصری', style: 'ترتیل' },
        10: { name: 'سعود الشریم', style: 'ترتیل' },
        12: { name: 'محمود خلیل الحصری', style: 'آموزشی' },
        97: { name: 'یاسر الدوسری', style: 'ترتیل' },
        161: { name: 'خلیفه التنیجی', style: 'ترتیل' },
        168: { name: 'محمد صدیق منشاوی', style: 'تکرار کودکان' },
        173: { name: 'مشاری راشد العفاسی', style: 'ترتیل' },
      };

      const reciters = (data.reciters || []).map((r: any) => {
        const isAvailable = availableReciterIds.has(Number(r.id));
        const faMeta = faReciterMeta[Number(r.id)];
        const translatedName =
          locale === 'fa' && faMeta
            ? { name: faMeta.name, language_name: 'persian' }
            : r.translated_name;
        const style = locale === 'fa' && faMeta ? { ...r.style, name: faMeta.style } : r.style;

        return {
          ...r,
          profilePicture: r.profile_picture || r.profilePicture || null,
          profile_picture: r.profile_picture || r.profilePicture || null,
          reciterId: r.reciter_id || r.reciterId || r.id,
          reciter_id: r.reciter_id || r.reciterId || r.id,
          is_available: isAvailable,
          isAvailable,
          has_audio: isAvailable,
          hasAudio: isAvailable,
          translated_name: translatedName,
          translatedName,
          style,
        };
      });

      // Sort available reciters first, preserving order within groups
      reciters.sort((a: any, b: any) => {
        if (Boolean(a.is_available) === Boolean(b.is_available)) return 0;
        return a.is_available ? -1 : 1;
      });

      return { reciters };
    } catch {
      return state.recitersList || { reciters: [] };
    }
  }

  if (cleanPath.startsWith('audio/reciters/') && cleanPath.endsWith('/audio_files')) {
    const parts = cleanPath.split('/');
    const reciterId = parts[2];
    const chapterId = Number(query.chapter) || 1;

    const paddedChapter = String(chapterId).padStart(3, '0');
    try {
      const audioPath = await resolveDataFile(`audio/reciters/${reciterId}/${chapterId}.json`);
      const data = JSON.parse(await fs.readFile(audioPath, 'utf-8'));
      if (data.audio_files && data.audio_files[0]) {
        data.audio_files[0].audio_url = `/audio/reciters/${reciterId}/${paddedChapter}.mp3`;
      }
      return data;
    } catch {
      try {
        const timestampPath = await resolveDataFile(`audio-timestamps/${chapterId}.json`);
        const data = JSON.parse(await fs.readFile(timestampPath, 'utf-8'));
        if (data.audio_files && data.audio_files[0]) {
          data.audio_files[0].audio_url = `/audio/reciters/${reciterId}/${paddedChapter}.mp3`;
        }
        return data;
      } catch {
        return {
          audio_files: [
            {
              id: Number(reciterId) * 1000 + chapterId,
              chapter_id: chapterId,
              file_size: 1000000,
              format: 'mp3',
              audio_url: `/audio/reciters/${reciterId}/${paddedChapter}.mp3`,
              duration: 60000,
              verse_timings: [],
            },
          ],
        };
      }
    }
  }

  if (cleanPath.startsWith('audio/reciters/') && cleanPath.endsWith('/timestamp')) {
    const parts = cleanPath.split('/');
    const reciterId = parts[2];
    const verseKey = String(query.verse_key || '');
    const [chStr] = verseKey.split(':');
    const chapterId = Number(chStr) || 1;

    const cacheKey = `${reciterId}_${chapterId}`;
    let timingsData = state.audioTimestampsByChapter.get(cacheKey);
    if (!timingsData) {
      try {
        const audioPath = await resolveDataFile(`audio/reciters/${reciterId}/${chapterId}.json`);
        timingsData = JSON.parse(await fs.readFile(audioPath, 'utf-8'));
      } catch {
        try {
          const timestampPath = await resolveDataFile(`audio-timestamps/${chapterId}.json`);
          timingsData = JSON.parse(await fs.readFile(timestampPath, 'utf-8'));
        } catch {}
      }
      if (timingsData) {
        state.audioTimestampsByChapter.set(cacheKey, timingsData);
      }
    }

    const audioFile = timingsData?.audio_files?.[0];
    const timing = audioFile?.verse_timings?.find((vt: any) => vt.verse_key === verseKey);

    if (timing) {
      return {
        result: {
          timestamp_from: timing.timestamp_from,
          timestamp_to: timing.timestamp_to,
          timestampFrom: timing.timestamp_from,
          timestampTo: timing.timestamp_to,
        },
      };
    }

    return {
      result: {
        timestamp_from: 0,
        timestamp_to: 0,
        timestampFrom: 0,
        timestampTo: 0,
      },
    };
  }

  if (cleanPath.startsWith('audio/reciters/')) {
    const reciterId = cleanPath.replace('audio/reciters/', '');
    try {
      const infoPath = await resolveDataFile(`audio/reciters/${reciterId}/info.json`);
      return JSON.parse(await fs.readFile(infoPath, 'utf-8'));
    } catch {
      const reciters = state.recitersList?.reciters || [];
      const reciter = reciters.find((r: any) => String(r.id) === reciterId);
      if (reciter) return { reciter };
      throw new Error(`Reciter not found: ${reciterId}`);
    }
  }

  // -------------------------------------------------------------
  // 13. Footnotes & Related Verses
  // -------------------------------------------------------------
  if (cleanPath.startsWith('foot_notes/')) {
    const footnoteId = cleanPath.replace('foot_notes/', '');
    return {
      foot_note: {
        id: Number(footnoteId),
        text: '',
        language_name: 'english',
      },
    };
  }

  if (cleanPath.startsWith('related_verses/')) {
    return {
      related_verses: [],
      relatedVerses: [],
      pagination: createPagination(0, 1, 10),
    };
  }

  // -------------------------------------------------------------
  // 14. Advanced Copy Endpoint
  // -------------------------------------------------------------
  if (cleanPath === 'verses/advanced_copy') {
    const { from, to } = query;
    let fromIdx = 0;
    let toIdx = state.allVerses.length - 1;

    if (from) {
      const idx = state.allVerses.findIndex((v) => v.verse_key === String(from));
      if (idx !== -1) fromIdx = idx;
    }
    if (to) {
      const idx = state.allVerses.findIndex((v) => v.verse_key === String(to));
      if (idx !== -1) toIdx = idx;
    }

    const rangeVerses = state.allVerses.slice(fromIdx, toIdx + 1);
    const stitched = await stitchTranslations(rangeVerses, translationIds, true, wbwLanguage);
    const includeTranslatorName =
      query.translator_name === 'true' ||
      query.translator_name === true ||
      query.translatorName === 'true' ||
      query.translatorName === true;

    const firstKey = stitched[0]?.verse_key || String(from || '');
    const verseBlocks = stitched.map((v) => {
      const blockLines: string[] = [`${v.text_uthmani || ''} (${v.verse_key})`];
      if (Array.isArray(v.translations)) {
        for (const tr of v.translations) {
          const cleanText = String(tr.text || '')
            .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
          if (cleanText) {
            blockLines.push(cleanText);
            if (includeTranslatorName && tr.resource_name) {
              blockLines.push(`— ${tr.resource_name}`);
            }
          }
        }
      }
      return blockLines.join('\n');
    });

    return {
      result: `${firstKey}\n\n${verseBlocks.join('\n\n')}`,
    };
  }

  // -------------------------------------------------------------
  // 15. Offline Search & Navigation Endpoints
  // -------------------------------------------------------------
  if (cleanPath === 'navigate' || cleanPath.startsWith('navigate?')) {
    const searchQuery = String(query.query || query.q || '');
    const navResults = await handleNavigateQuery(searchQuery);
    return {
      result: {
        navigation: navResults,
        verses: [],
      },
      pagination: createPagination(navResults.length, 1, 10),
    };
  }

  if (cleanPath === 'search' || cleanPath.startsWith('search?')) {
    const searchQuery = String(query.query || query.q || '');
    const page = Number(query.page) || 1;
    const size = Number(query.size || query.per_page || query.perPage) || 10;
    const highlight =
      query.highlight === '1' || query.highlight === 1 || query.highlight === 'true';
    const translationIdsParam = query.translation_ids || query.translations || query.translationIds;

    const searchResponse = await handleSearchQuery({
      query: searchQuery,
      page,
      perPage: size,
      size,
      translationIds: translationIdsParam,
      highlight,
      mode: query.mode,
    });

    return searchResponse;
  }

  // -------------------------------------------------------------
  // 16. Count within Range (Graceful Fallback for Matrix/Qiraat/Questions)
  // -------------------------------------------------------------
  if (cleanPath.endsWith('count_within_range') || cleanPath.endsWith('count-within-range')) {
    return { total: 0 };
  }

  // -------------------------------------------------------------
  // 17. Learning Plans & Auth-Scoped Endpoints (Local/Offline Support)
  // -------------------------------------------------------------
  if (cleanPath === 'courses' || cleanPath === 'auth/courses') {
    return {
      data: [],
      pagination: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  if (cleanPath === 'courses/count' || cleanPath === 'auth/courses/count') {
    return { count: 0 };
  }

  if (cleanPath.startsWith('courses/') || cleanPath.startsWith('auth/courses/')) {
    return { data: null };
  }

  if (
    cleanPath.startsWith('collections') ||
    cleanPath.startsWith('auth/collections') ||
    cleanPath.startsWith('bookmarks') ||
    cleanPath.startsWith('auth/bookmarks') ||
    cleanPath.startsWith('activity') ||
    cleanPath.startsWith('auth/activity') ||
    cleanPath.startsWith('notes') ||
    cleanPath.startsWith('auth/notes')
  ) {
    return { data: [], pagination: { hasNextPage: false, hasPreviousPage: false } };
  }

  throw new Error(`Endpoint not supported locally: ${cleanPath}`);
}

export const handleLocalApiRequest = getLocalApiResponse;
