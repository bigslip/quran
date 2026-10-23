/* eslint-disable max-lines, react-func/max-lines-per-function, @typescript-eslint/naming-convention, no-restricted-syntax, no-await-in-loop, jsdoc/require-returns, no-underscore-dangle, no-restricted-globals */
import fs from 'fs/promises';
import path from 'path';

import {
  SearchNavigationResult,
  SearchNavigationType,
} from '@/types/Search/SearchNavigationResult';

export interface SearchEngineIndex {
  generatedAt: string;
  totalChapters: number;
  totalJuzs: number;
  totalPages: number;
  totalPopularAyahs: number;
  totalVerses: number;
  chapters: Array<{
    type: string;
    resultType: string;
    id: number;
    key: string;
    name: string;
    nameArabic: string;
    nameComplex: string;
    transliteratedName: string;
    translatedName: string;
    revelationPlace: string;
    versesCount: number;
    pages: [number, number];
    slug?: string;
    aliases: string[];
  }>;
  juzs: Array<{
    type: string;
    resultType: string;
    id: number;
    key: string;
    juzNumber: number;
    name: string;
    nameArabic: string;
    aliases: string[];
  }>;
  pages: Array<{
    type: string;
    resultType: string;
    id: number;
    key: string;
    pageNumber: number;
    name: string;
    nameArabic: string;
    firstVerseKey: string;
    lastVerseKey: string;
    aliases: string[];
  }>;
  popularAyahs: Array<{
    type: string;
    resultType: string;
    key: string;
    name: string;
    arabic: string;
    aliases: string[];
  }>;
  verses: Array<{
    id: number;
    key: string;
    verseKey: string;
    verseNumber: number;
    chapterId: number;
    pageNumber: number;
    juzNumber: number;
    hizbNumber: number;
    textUthmani: string;
    textImlaeiSimple: string;
    enTranslation?: string;
    faTranslation?: string;
  }>;
}

let searchIndexCache: SearchEngineIndex | null = null;
let searchIndexPromise: Promise<SearchEngineIndex> | null = null;

/**
 * Normalizes Eastern Arabic (٠-٩) and Persian (۰-۹) numerals to ASCII digits (0-9).
 */
export function normalizeNumerals(text: string): string {
  if (!text) return '';
  return text
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9');
}

/**
 * Removes Arabic tashkeel / harakat (diacritics) and tatweel.
 */
export function removeArabicDiacritics(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Tashkeel & Quranic annotation marks
    .replace(/\u0640/g, ''); // Tatweel
}

/**
 * Normalizes Arabic and Persian characters for flexible matching.
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return removeArabicDiacritics(text)
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[يىئ]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ؤ]/g, 'و')
    .trim();
}

/**
 * Normalizes English / Latin text: lowercase, remove non-alphanumeric (except colon/hyphen).
 */
export function normalizeLatinText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove combining diacritics
    .replace(/[āáàâä]/gi, 'a')
    .replace(/[ēéèêë]/gi, 'e')
    .replace(/[īíìîï]/gi, 'i')
    .replace(/[ōóòôö]/gi, 'o')
    .replace(/[ūúùûü]/gi, 'u')
    .replace(/[ĥħ]/gi, 'h')
    .replace(/[ṣš]/gi, 's')
    .replace(/[ṭ]/gi, 't')
    .replace(/[ḍ]/gi, 'd')
    .replace(/[ẓž]/gi, 'z')
    .replace(/['’`´ʿʻ]/g, '') // remove apostrophes
    .toLowerCase()
    .replace(/[-]/g, ' ')
    .replace(/[^a-z0-9:\s]/g, ' ') // replace punctuation with space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clean and normalize general search query string.
 */
export function normalizeQuery(query: string): string {
  if (!query) return '';
  const numNormalized = normalizeNumerals(query);
  return numNormalized.trim();
}

/**
 * Safely loads the search index from local files with in-memory caching.
 */
export async function getSearchIndex(): Promise<SearchEngineIndex> {
  if (searchIndexCache) return searchIndexCache;

  if (!searchIndexPromise) {
    searchIndexPromise = (async () => {
      const candidates = [
        path.join(process.cwd(), 'data', 'search', 'search-index.json'),
        path.join(process.cwd(), 'public', 'data', 'search', 'search-index.json'),
        path.join(process.cwd(), 'data', 'qdc', 'search-index.json'),
      ];

      for (const filePath of candidates) {
        try {
          const raw = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(raw) as SearchEngineIndex;
          searchIndexCache = data;
          return data;
        } catch {
          // try next path
        }
      }

      // If no pre-built index exists, return minimal fallback
      searchIndexCache = {
        generatedAt: new Date().toISOString(),
        totalChapters: 0,
        totalJuzs: 0,
        totalPages: 0,
        totalPopularAyahs: 0,
        totalVerses: 0,
        chapters: [],
        juzs: [],
        pages: [],
        popularAyahs: [],
        verses: [],
      };
      return searchIndexCache;
    })();
  }

  return searchIndexPromise;
}

/**
 * Reset cache for test suites.
 */
export function _resetSearchIndexCache(): void {
  searchIndexCache = null;
  searchIndexPromise = null;
}

/**
 * Highlighting helper: wraps query terms with `<mark>term</mark>`.
 */
export function highlightText(text: string, query: string): string {
  if (!text || !query) return text;
  const terms = query
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  if (terms.length === 0) return text;

  let highlighted = text;
  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const before = highlighted;
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');

    // If direct match didn't match and term has Arabic/Persian chars, try diacritic-insensitive matching
    if (highlighted === before && /[\u0600-\u06FF]/.test(term)) {
      const normTerm = normalizeArabicText(term);
      if (normTerm.length > 1) {
        const diacriticsPattern = '[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*';
        const charPatterns = Array.from(normTerm).map((ch) => {
          if (ch === 'ا') return '[اأإآٱ]';
          if (ch === 'ه') return '[هة]';
          if (ch === 'ی') return '[یيىئ]';
          if (ch === 'ک') return '[کك]';
          if (ch === 'و') return '[وؤ]';
          return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        });
        const arRegex = new RegExp(
          `(${charPatterns.join(diacriticsPattern)}${diacriticsPattern})`,
          'gi',
        );
        highlighted = highlighted.replace(arRegex, '<mark>$1</mark>');
      }
    }
  }
  return highlighted;
}

/**
 * Resolves instant navigation destinations for `/navigate?query=...`
 */
export async function handleNavigateQuery(rawQuery: string): Promise<SearchNavigationResult[]> {
  const query = normalizeQuery(rawQuery);
  if (!query) return [];

  const index = await getSearchIndex();
  const latinNormalized = normalizeLatinText(query);
  const arabicNormalized = normalizeArabicText(query);

  const results: SearchNavigationResult[] = [];
  const seenKeys = new Set<string>();

  const addResult = (res: SearchNavigationResult) => {
    const dedupeKey = `${res.resultType}_${res.key}`;
    if (!seenKeys.has(dedupeKey)) {
      seenKeys.add(dedupeKey);
      results.push(res);
    }
  };

  // -------------------------------------------------------------
  // 1. Exact Verse Key Pattern (e.g., "1:1", "2:255", "36:58")
  // -------------------------------------------------------------
  const verseKeyMatch = query.match(/^(\d{1,3})\s*:\s*(\d{1,3})$/);
  if (verseKeyMatch) {
    const chapterId = Number(verseKeyMatch[1]);
    const verseNum = Number(verseKeyMatch[2]);
    const chapter = index.chapters.find((c) => c.id === chapterId);

    if (chapter && verseNum >= 1 && verseNum <= chapter.versesCount) {
      const verseKey = `${chapterId}:${verseNum}`;
      const verseData = index.verses.find((v) => v.verseKey === verseKey);
      addResult({
        resultType: SearchNavigationType.AYAH,
        name: `Surah ${chapter.name} ${verseKey}`,
        key: verseKey,
        arabic: verseData?.textUthmani || chapter.nameArabic,
        isArabic: false,
      });
    }
  }

  // -------------------------------------------------------------
  // 2. Verse Range Pattern (e.g., "1:1-7", "2:255-257", "36:1-10")
  // -------------------------------------------------------------
  const verseRangeMatch = query.match(/^(\d{1,3})\s*:\s*(\d{1,3})\s*[-–—]\s*(\d{1,3})$/);
  if (verseRangeMatch) {
    const chapterId = Number(verseRangeMatch[1]);
    const fromVerse = Number(verseRangeMatch[2]);
    const toVerse = Number(verseRangeMatch[3]);
    const chapter = index.chapters.find((c) => c.id === chapterId);

    if (chapter && fromVerse >= 1 && toVerse >= fromVerse && fromVerse <= chapter.versesCount) {
      const rangeKey = `${chapterId}:${fromVerse}-${Math.min(toVerse, chapter.versesCount)}`;
      addResult({
        resultType: SearchNavigationType.RANGE,
        name: `Surah ${chapter.name} ${rangeKey}`,
        key: rangeKey,
      });
    }
  }

  // -------------------------------------------------------------
  // 3. Natural Language Chapter + Verse (e.g. "surah 2 ayah 255", "surah baqarah 255", "chapter 36 verse 58", "2 255")
  // -------------------------------------------------------------
  const naturalVerseMatch = latinNormalized.match(
    /^(?:surah|chapter)?\s*([a-z\s]+|\d{1,3})\s+(?:ayah|verse|ayat)?\s*(\d{1,3})$/,
  );
  if (
    naturalVerseMatch &&
    !latinNormalized.startsWith('page') &&
    !latinNormalized.startsWith('juz')
  ) {
    const chIdentifier = naturalVerseMatch[1].trim();
    const verseNum = Number(naturalVerseMatch[2]);

    let chapter = !isNaN(Number(chIdentifier))
      ? index.chapters.find((c) => c.id === Number(chIdentifier))
      : null;

    if (!chapter) {
      const cleanCh = chIdentifier.replace(/[^a-z0-9]/g, '');
      const cleanChNoAl = cleanCh.replace(/^al/, '');
      chapter =
        index.chapters.find((c) => {
          const cNameClean = normalizeLatinText(c.name).replace(/[^a-z0-9]/g, '');
          return (
            cNameClean === cleanCh ||
            (cleanChNoAl.length > 0 && cNameClean.replace(/^al/, '') === cleanChNoAl) ||
            c.aliases.some((a) => {
              const aClean = normalizeLatinText(a).replace(/[^a-z0-9]/g, '');
              return (
                aClean.length > 0 &&
                (aClean === cleanCh ||
                  (cleanChNoAl.length > 0 && aClean.replace(/^al/, '') === cleanChNoAl))
              );
            })
          );
        }) || null;
    }

    if (chapter && verseNum >= 1 && verseNum <= chapter.versesCount) {
      const verseKey = `${chapter.id}:${verseNum}`;
      const verseData = index.verses.find((v) => v.verseKey === verseKey);
      addResult({
        resultType: SearchNavigationType.AYAH,
        name: `Surah ${chapter.name} ${verseKey}`,
        key: verseKey,
        arabic: verseData?.textUthmani || chapter.nameArabic,
      });
    }
  }

  // -------------------------------------------------------------
  // 4. Page Pattern (e.g., "page 50", "p 50", "p50", "page50", "صفحة 50")
  // -------------------------------------------------------------
  const pageMatch =
    latinNormalized.match(/^(?:page|p)\s*(\d{1,3})$/) ||
    arabicNormalized.match(/^(?:صفحه|صفحة)\s*(\d{1,3})$/);
  if (pageMatch) {
    const pageNum = Number(pageMatch[1]);
    if (pageNum >= 1 && pageNum <= 604) {
      addResult({
        resultType: SearchNavigationType.PAGE,
        name: `Page ${pageNum}`,
        key: String(pageNum),
      });
    }
  }

  // -------------------------------------------------------------
  // 5. Juz Pattern (e.g., "juz 29", "j 29", "j29", "juz29", "para 30", "جزء 30")
  // -------------------------------------------------------------
  const juzMatch =
    latinNormalized.match(/^(?:juz|j|para|sipara)\s*(\d{1,2})$/) ||
    arabicNormalized.match(/^(?:جزء|پاره)\s*(\d{1,2})$/);
  if (juzMatch) {
    const juzNum = Number(juzMatch[1]);
    if (juzNum >= 1 && juzNum <= 30) {
      addResult({
        resultType: SearchNavigationType.JUZ,
        name: `Juz ${juzNum}`,
        key: String(juzNum),
      });
    }
  }

  // -------------------------------------------------------------
  // 6. Hizb / Rub el Hizb Pattern
  // -------------------------------------------------------------
  const hizbMatch = latinNormalized.match(/^(?:hizb|h)\s*(\d{1,2})$/);
  if (hizbMatch) {
    const hizbNum = Number(hizbMatch[1]);
    if (hizbNum >= 1 && hizbNum <= 60) {
      addResult({
        resultType: SearchNavigationType.HIZB,
        name: `Hizb ${hizbNum}`,
        key: String(hizbNum),
      });
    }
  }

  const rubMatch = latinNormalized.match(/^(?:rub|rub el hizb)\s*(\d{1,3})$/);
  if (rubMatch) {
    const rubNum = Number(rubMatch[1]);
    if (rubNum >= 1 && rubNum <= 240) {
      addResult({
        resultType: SearchNavigationType.RUB_EL_HIZB,
        name: `Rub el Hizb ${rubNum}`,
        key: String(rubNum),
      });
    }
  }

  // -------------------------------------------------------------
  // 7. Popular Ayahs Matching (e.g., "ayatul kursi", "throne verse", "amanar rasul", "nur", "yasin 58")
  // -------------------------------------------------------------
  const hasArabicQueryChars = /[\u0600-\u06FF]/.test(arabicNormalized);
  for (const popular of index.popularAyahs) {
    const matchesAlias = popular.aliases.some((alias) => {
      const normAlias = normalizeLatinText(alias);
      const normArAlias = normalizeArabicText(alias);
      const isLatinMatch =
        normAlias.length > 0 &&
        latinNormalized.length > 0 &&
        (normAlias === latinNormalized ||
          latinNormalized.includes(normAlias) ||
          normAlias.includes(latinNormalized));
      const isArabicMatch =
        hasArabicQueryChars &&
        normArAlias.length > 0 &&
        /[\u0600-\u06FF]/.test(normArAlias) &&
        (normArAlias === arabicNormalized ||
          arabicNormalized.includes(normArAlias) ||
          normArAlias.includes(arabicNormalized));
      return isLatinMatch || isArabicMatch;
    });

    if (matchesAlias || popular.key === query) {
      addResult({
        resultType: SearchNavigationType.AYAH,
        name: popular.name,
        key: popular.key,
        arabic: popular.arabic,
        isArabic: false,
      });
    }
  }

  // -------------------------------------------------------------
  // 8. Surah Name Matching (Exact & Fuzzy)
  // -------------------------------------------------------------
  const matchedChapters: { score: number; chapter: (typeof index.chapters)[0] }[] = [];
  const queryAr = arabicNormalized.replace(/^(?:سوره|سورة)\s+/, '').trim();
  const queryArWithoutAl = queryAr.replace(/^ال/, '');

  for (const ch of index.chapters) {
    const cleanSimple = normalizeLatinText(ch.name);
    const cleanComplex = normalizeLatinText(ch.nameComplex);
    const cleanAr = normalizeArabicText(ch.nameArabic);
    const cleanArWithoutAl = cleanAr.replace(/^ال/, '');
    const cleanTranslated = normalizeLatinText(ch.translatedName);
    const cleanQuery = latinNormalized;

    let score = 0;

    if (cleanQuery.length > 0) {
      // Exact ID
      if (String(ch.id) === cleanQuery) {
        score = 100;
      }
      // Exact name match
      else if (cleanSimple === cleanQuery || cleanComplex === cleanQuery) {
        score = 90;
      }
      // Starts with query
      else if (cleanSimple.startsWith(cleanQuery) || cleanComplex.startsWith(cleanQuery)) {
        score = 80;
      }
      // Translated name match (e.g. "The Cow", "The Opener", "Cave")
      else if (cleanTranslated === cleanQuery || cleanTranslated.includes(cleanQuery)) {
        score = 70;
      }
      // Aliases match
      else if (
        ch.aliases.some((a) => {
          const na = normalizeLatinText(a);
          return na.length > 0 && na.includes(cleanQuery);
        })
      ) {
        score = 60;
      }
      // Substring match
      else if (cleanSimple.includes(cleanQuery)) {
        score = 50;
      }
    }

    if (score === 0 && hasArabicQueryChars && queryAr.length > 0) {
      // Exact Arabic name match (with or without leading Al-)
      if (
        cleanAr === queryAr ||
        cleanArWithoutAl === queryAr ||
        cleanArWithoutAl === queryArWithoutAl
      ) {
        score = 95;
      }
      // Arabic starts with
      else if (
        cleanAr.startsWith(queryAr) ||
        (queryArWithoutAl.length > 0 && cleanArWithoutAl.startsWith(queryArWithoutAl))
      ) {
        score = 85;
      }
      // Arabic aliases match
      else if (
        ch.aliases.some((a) => {
          const na = normalizeArabicText(a);
          return (
            na.length > 0 &&
            /[\u0600-\u06FF]/.test(na) &&
            (na.includes(queryAr) || (queryArWithoutAl.length > 1 && na.includes(queryArWithoutAl)))
          );
        })
      ) {
        score = 75;
      }
      // Arabic substring match
      else if (
        cleanAr.includes(queryAr) ||
        (queryArWithoutAl.length > 1 && cleanAr.includes(queryArWithoutAl))
      ) {
        score = 65;
      }
    }

    if (score > 0) {
      matchedChapters.push({ score, chapter: ch });
    }
  }

  matchedChapters.sort((a, b) => b.score - a.score);

  for (const { chapter } of matchedChapters.slice(0, 5)) {
    addResult({
      resultType: SearchNavigationType.SURAH,
      name: `Surah ${chapter.name}`,
      key: String(chapter.id),
      arabic: chapter.nameArabic,
    });
  }

  // If query is pure number (e.g. "50", "29"), also offer page and juz suggestions
  const numVal = Number(latinNormalized);
  if (!isNaN(numVal)) {
    if (numVal >= 1 && numVal <= 604) {
      addResult({
        resultType: SearchNavigationType.PAGE,
        name: `Page ${numVal}`,
        key: String(numVal),
      });
    }
    if (numVal >= 1 && numVal <= 30) {
      addResult({
        resultType: SearchNavigationType.JUZ,
        name: `Juz ${numVal}`,
        key: String(numVal),
      });
    }
  }

  return results;
}

export interface LocalSearchParams {
  query: string;
  page?: number | string;
  perPage?: number | string;
  size?: number | string;
  translationIds?: string | number[];
  highlight?: boolean | number | string;
  mode?: string;
}

/**
 * Handles full search queries for `/search?query=...`
 */
export async function handleSearchQuery(params: LocalSearchParams): Promise<any> {
  const rawQuery = params.query || '';
  const query = normalizeQuery(rawQuery);
  const page = Math.max(1, Number(params.page) || 1);
  const perPage = Math.max(1, Number(params.perPage || params.size) || 10);
  const shouldHighlight =
    params.highlight === 1 ||
    params.highlight === true ||
    params.highlight === '1' ||
    params.highlight === 'true';

  if (!query) {
    return {
      result: {
        navigation: [],
        verses: [],
      },
      pagination: {
        totalRecords: 0,
        total_records: 0,
        currentPage: page,
        current_page: page,
        totalPages: 0,
        total_pages: 0,
        perPage,
        per_page: perPage,
        nextPage: null,
        next_page: null,
      },
    };
  }

  const index = await getSearchIndex();

  // 1. Get Instant Navigation Matches
  const navigationResults = await handleNavigateQuery(query);

  // 2. Perform Full-Text Verse Search
  const latinNormalized = normalizeLatinText(query);
  const arabicNormalized = normalizeArabicText(query);
  const queryWords = latinNormalized.split(' ').filter((w) => w.length > 1);

  const matchedVerses: {
    score: number;
    verse: (typeof index.verses)[0];
    matchType: 'arabic' | 'translation';
    matchedField: 'arabic' | 'fa' | 'en';
  }[] = [];

  for (const v of index.verses) {
    let score = 0;
    let matchType: 'arabic' | 'translation' = 'translation';
    let matchedField: 'arabic' | 'fa' | 'en' = 'en';

    // A. Check exact verse key (e.g. "2:255")
    if (v.verseKey === query || v.verseKey === latinNormalized) {
      score = 200;
      matchType = 'translation';
      matchedField = 'en';
    }

    // B. Check Arabic text match
    if (score === 0 && arabicNormalized.length > 1) {
      const cleanArImlaei = normalizeArabicText(v.textImlaeiSimple || '');
      const cleanArUthmani = normalizeArabicText(v.textUthmani || '');

      if (cleanArImlaei.includes(arabicNormalized) || cleanArUthmani.includes(arabicNormalized)) {
        score = 150;
        matchType = 'arabic';
        matchedField = 'arabic';
      }
    }

    // C. Check English translation match
    if (score === 0 && v.enTranslation && latinNormalized.length > 1) {
      const cleanEn = normalizeLatinText(v.enTranslation);
      if (cleanEn.includes(latinNormalized)) {
        score = 100;
        matchType = 'translation';
        matchedField = 'en';
      } else if (queryWords.length > 0 && queryWords.every((w) => cleanEn.includes(w))) {
        score = 80;
        matchType = 'translation';
        matchedField = 'en';
      }
    }

    // D. Check Persian translation match
    if (score === 0 && v.faTranslation && arabicNormalized.length > 1) {
      const cleanFa = normalizeArabicText(v.faTranslation);
      if (cleanFa.includes(arabicNormalized)) {
        score = 90;
        matchType = 'translation';
        matchedField = 'fa';
      }
    }

    if (score > 0) {
      matchedVerses.push({ score, verse: v, matchType, matchedField });
    }
  }

  // Sort matched verses by relevance score and then verse ID
  matchedVerses.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.verse.id - b.verse.id;
  });

  const totalRecords = matchedVerses.length;
  const totalPages = Math.ceil(totalRecords / perPage) || 0;
  const startIndex = (page - 1) * perPage;
  const paginatedMatches = matchedVerses.slice(startIndex, startIndex + perPage);

  const formattedVerses = paginatedMatches.map(({ verse, matchType, matchedField }) => {
    const chapter = index.chapters.find((c) => c.id === verse.chapterId);
    const chapterName = chapter ? chapter.name : `Surah ${verse.chapterId}`;

    const arabicText =
      shouldHighlight && matchType === 'arabic'
        ? highlightText(verse.textUthmani, rawQuery)
        : verse.textUthmani;

    let translationText =
      matchedField === 'fa'
        ? verse.faTranslation || verse.enTranslation || ''
        : verse.enTranslation || verse.faTranslation || '';
    if (shouldHighlight && matchType === 'translation') {
      translationText = highlightText(translationText, rawQuery);
    }

    return {
      resultType:
        matchType === 'arabic' ? SearchNavigationType.AYAH : SearchNavigationType.TRANSLATION,
      name: translationText || verse.textImlaeiSimple,
      key: verse.verseKey,
      arabic: arabicText,
      isArabic: false,
      isTransliteration: false,
      chapterName,
    };
  });

  const nextPage = page < totalPages ? page + 1 : null;

  return {
    result: {
      navigation: navigationResults,
      verses: formattedVerses,
    },
    pagination: {
      totalRecords,
      total_records: totalRecords,
      currentPage: page,
      current_page: page,
      totalPages,
      total_pages: totalPages,
      perPage,
      per_page: perPage,
      nextPage,
      next_page: nextPage,
    },
  };
}
