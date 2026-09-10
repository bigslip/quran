import fs from 'fs/promises';
import path from 'path';

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
  languagesList: any;
  recitersList: any;
  audioTimestampsByChapter: Map<number, any>;
  chapterInfoCache: Map<string, any>;
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
  languagesList: null,
  recitersList: null,
  audioTimestampsByChapter: new Map(),
  chapterInfoCache: new Map(),
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

        for (let page = 1; page <= 604; page++) {
          try {
            const pagePath = await resolveDataFile(`pages/${page}.json`);
            const pageData = JSON.parse(await fs.readFile(pagePath, 'utf-8'));
            const verses = pageData.verses || [];
            versesByPage.set(page, verses);

            for (const verse of verses) {
              if (!versesByKey.has(verse.verse_key)) {
                versesByKey.set(verse.verse_key, verse);
                allVerses.push(verse);

                const [chapterStr] = verse.verse_key.split(':');
                const chapterId = Number(chapterStr);
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
          } catch (err) {
            // If some pages aren't found, continue
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
  state.languagesList = null;
  state.recitersList = null;
  state.audioTimestampsByChapter.clear();
  state.chapterInfoCache.clear();
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
      for (const [key, val] of Object.entries(data.byVerseKey)) {
        map.set(key, val);
      }
    } else if (Array.isArray(data.verses)) {
      for (const v of data.verses) {
        if (v.translations && v.translations.length > 0) {
          map.set(v.verse_key, v.translations[0]);
        }
      }
    }
  } catch (err) {
    // Translation file may not exist
  }

  state.translationsMap.set(translationId, map);
  return map;
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

/**
 * Stitch translations into cloned verse objects.
 */
async function stitchTranslations(verses: any[], translationIds: number[], includeWords = true): Promise<any[]> {
  if (verses.length === 0) return [];

  const translationMaps: { id: number; map: Map<string, any> }[] = [];
  for (const id of translationIds) {
    const map = await getTranslationMap(id);
    translationMaps.push({ id, map });
  }

  return verses.map((verse) => {
    const verseCopy = { ...verse };

    if (!includeWords) {
      delete verseCopy.words;
    }

    if (translationMaps.length > 0) {
      const verseTranslations: any[] = [];
      for (const { id, map } of translationMaps) {
        const trans = map.get(verse.verse_key);
        if (trans) {
          verseTranslations.push(trans);
        } else {
          verseTranslations.push({
            id: 0,
            resource_id: id,
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
 * Main query dispatcher for resolving any QDC API route locally with zero network calls.
 */
export async function getLocalApiResponse(pathname: string, query: Record<string, any> = {}): Promise<any> {
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
      if (query.chapter_number) {
        const ch = state.chaptersMap.get(Number(query.chapter_number));
        if (ch && ch.pages) {
          const [startPage, endPage] = ch.pages;
          const filteredPages: Record<string, any> = {};
          for (let p = startPage; p <= endPage; p++) {
            if (lookup.pages[String(p)]) {
              filteredPages[String(p)] = lookup.pages[String(p)];
            }
          }
          return {
            ...lookup,
            pages: filteredPages,
          };
        }
      }
      return lookup;
    }
    throw new Error('Pages lookup not available');
  }

  // -------------------------------------------------------------
  // 3. Verses by Page Endpoint
  // -------------------------------------------------------------
  if (cleanPath.startsWith('verses/by_page/')) {
    const pageId = Number(cleanPath.replace('verses/by_page/', ''));
    const rawVerses = state.versesByPage.get(pageId) || [];
    const stitched = await stitchTranslations(rawVerses, translationIds, includeWords);
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
    let chapterVerses = state.versesByChapter.get(chapterId) || [];

    // Filter by from / to if present
    if (query.from || query.to) {
      const fromNum = query.from ? (String(query.from).includes(':') ? Number(String(query.from).split(':')[1]) : Number(query.from)) : 1;
      const toNum = query.to ? (String(query.to).includes(':') ? Number(String(query.to).split(':')[1]) : Number(query.to)) : chapterVerses.length;

      chapterVerses = chapterVerses.filter((v) => {
        const vNum = v.verse_number || Number(v.verse_key.split(':')[1]);
        return vNum >= fromNum && vNum <= toNum;
      });
    }

    const totalRecords = chapterVerses.length;
    const page = Number(query.page) || 1;
    const perPage = query.per_page || query.perPage || 10;
    const sliced = sliceVerses(chapterVerses, page, perPage);
    const stitched = await stitchTranslations(sliced, translationIds, includeWords);
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
    const juzVerses = state.versesByJuz.get(juzId) || [];
    const totalRecords = juzVerses.length;
    const page = Number(query.page) || 1;
    const perPage = query.per_page || query.perPage || 10;
    const sliced = sliceVerses(juzVerses, page, perPage);
    const stitched = await stitchTranslations(sliced, translationIds, includeWords);
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
    const hizbVerses = state.versesByHizb.get(hizbId) || [];
    const totalRecords = hizbVerses.length;
    const page = Number(query.page) || 1;
    const perPage = query.per_page || query.perPage || 10;
    const sliced = sliceVerses(hizbVerses, page, perPage);
    const stitched = await stitchTranslations(sliced, translationIds, includeWords);
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
    const rubVerses = state.versesByRub.get(rubId) || [];
    const totalRecords = rubVerses.length;
    const page = Number(query.page) || 1;
    const perPage = query.per_page || query.perPage || 10;
    const sliced = sliceVerses(rubVerses, page, perPage);
    const stitched = await stitchTranslations(sliced, translationIds, includeWords);
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
    const stitched = await stitchTranslations(sliced, translationIds, includeWords);
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
    const [stitched] = await stitchTranslations([verse], translationIds, includeWords);
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

  if (cleanPath === 'resources/languages') {
    return state.languagesList || { languages: [] };
  }

  if (cleanPath === 'resources/word_by_word_translations') {
    return {
      word_by_word_translations: [
        { id: 1, name: 'English', language_name: 'english', iso_code: 'en' },
        { id: 2, name: 'Persian', language_name: 'persian', iso_code: 'fa' },
        { id: 3, name: 'Urdu', language_name: 'urdu', iso_code: 'ur' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 12. Audio Endpoints
  // -------------------------------------------------------------
  if (cleanPath === 'audio/reciters') {
    return state.recitersList || { reciters: [] };
  }

  if (cleanPath.startsWith('audio/reciters/') && cleanPath.endsWith('/audio_files')) {
    const parts = cleanPath.split('/');
    const reciterId = parts[2];
    const chapterId = Number(query.chapter) || 1;

    try {
      const audioPath = await resolveDataFile(`audio/reciters/${reciterId}/${chapterId}.json`);
      return JSON.parse(await fs.readFile(audioPath, 'utf-8'));
    } catch {
      try {
        const timestampPath = await resolveDataFile(`audio-timestamps/${chapterId}.json`);
        return JSON.parse(await fs.readFile(timestampPath, 'utf-8'));
      } catch {
        const paddedChapter = String(chapterId).padStart(3, '0');
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

    let timingsData: any = null;
    try {
      const audioPath = await resolveDataFile(`audio/reciters/${reciterId}/${chapterId}.json`);
      timingsData = JSON.parse(await fs.readFile(audioPath, 'utf-8'));
    } catch {
      try {
        const timestampPath = await resolveDataFile(`audio-timestamps/${chapterId}.json`);
        timingsData = JSON.parse(await fs.readFile(timestampPath, 'utf-8'));
      } catch {}
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
    const stitched = await stitchTranslations(rangeVerses, translationIds, true);
    const rawLines = stitched.map((v) => `${v.text_uthmani} (${v.verse_key})`);

    return {
      result: rawLines.join('\n'),
    };
  }

  throw new Error(`Endpoint not supported locally: ${cleanPath}`);
}
