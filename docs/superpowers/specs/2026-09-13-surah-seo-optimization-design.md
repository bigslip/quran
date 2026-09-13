# Design Specification: Multilingual Surah SEO Optimization

**Date**: 2026-09-13  
**Status**: Approved  
**Scope**: URL structure, canonicalization, localized search-intent titles, human-grade meta descriptions, Schema.org JSON-LD structured data, and multilingual `hreflang` / sitemap synchronization.

---

## 1. Objectives & Overview

### 1.1 Goal
Elevate organic search visibility, click-through rates (CTR), and search relevance across all 21 supported languages on Quran.ir, with primary emphasis on Persian (`fa`), Arabic (`ar`), and English (`en`).

### 1.2 Problems Addressed
1. **Numeric URL Pollution**: Internal links across navigation, drawer lists, and cards previously linked to raw numeric IDs (`/2` or `/fa/2`), forfeiting URL keyword ranking power.
2. **Missing Search Intent in Titles**: Page `<title>` tags were previously basic strings (e.g. `Surah Al-Baqarah - 1-286`), missing high-volume user query keywords (*"متن و ترجمه"*, *"صوت"*, *"تفسیر"*).
3. **Machine-Translated Meta Descriptions**: Broken automated translations in `locales/*/chapter.json` (e.g. *"دستور داد ۲ در قرآن است"*) degraded snippet quality in search result pages.
4. **Lack of Structured Data (JSON-LD)**: No Schema.org rich snippets for Breadcrumbs, Chapter/CreativeWork, or AudioObject.

---

## 2. Architecture & URL Routing Strategy

### 2.1 Standardized Slug Navigation
- All internal links (Sidebar Navigation `SurahList`, `QuickSurahJumps`, `VerseControls`, `EndOfSurahSection`, `SearchPreInput`, and `ChapterHeader`) will generate URLs using the canonical chapter slug (`chapter.slug` or `getChapterData(...)?.slug`).
  - English: `/al-baqarah`
  - Persian: `/fa/al-baqarah`
  - Verses: `/al-baqarah/255` or `/fa/al-baqarah/255`
- Helper function `getSurahNavigationUrl(slugOrId)` will resolve chapter slugs cleanly, accepting either slug strings or numeric IDs and preferring slug format.

### 2.2 Canonical Consolidation
- Numeric routes (`/2`, `/fa/2`) and legacy aliases remain 100% supported via `[chapterId]/index.tsx`.
- The `<link rel="canonical">` tag will always point to the canonical slug URL (`https://quran.ir/al-baqarah` or `https://quran.ir/fa/al-baqarah`) to prevent duplicate content penalties and consolidate link equity.

---

## 3. Localized Search Intent Titles (`<title>`)

### 3.1 Title Formulas
The `getSEOTitle()` generator in `src/pages/[chapterId]/index.tsx` and `src/pages/[chapterId]/[verseId]/index.tsx` will construct high-CTR titles tailored to localized search behavior:

1. **Persian (`fa`)**:
   - **Surah Page**: `سوره بقره (Al-Baqarah) - متن، ترجمه و تلاوت صوتی | قرآن کریم`
   - **Single Verse**: `آیه ۲۵۵ سوره بقره (آیت الکرسی) - متن و ترجمه | قرآن کریم`
   - **Verse Range**: `آیات ۱ تا ۱۰ سوره بقره - متن و ترجمه | قرآن کریم`
2. **Arabic (`ar`)**:
   - **Surah Page**: `سورة البقرة - قراءة واستماع وتفسير | القرآن الكريم`
   - **Single Verse**: `سورة البقرة آية ۲۵۵ (آية الكرسي) - قراءة وتفسير | القرآن الكريم`
3. **English (`en`)**:
   - **Surah Page**: `Surah Al-Baqarah (The Cow) - Read, Translation & Audio | Quran.ir`
   - **Single Verse**: `Surah Al-Baqarah - Verse 255 (Ayatul Kursi) - Translation & Tafsir | Quran.ir`
4. **General Multilingual Formula**:
   - Formula: `{Surah} {TransliteratedName} ({TranslatedName}) - {ActionKeywords} | {SiteName}`

---

## 4. Human-Grade Localized Meta Descriptions

### 4.1 Description Format
Update `locales/*/chapter.json` and `src/pages/[chapterId]/index.tsx` `getDescription()` to generate natural, keyword-rich snippets:

- **Persian (`fa`)**:
  ```json
  "meta-description": "متن کامل سوره {{transliteratedName}} ({{translatedName}}) به همراه ترجمه فارسی، تلاوت صوتی، تفسیر، معنی کلمه به کلمه و فایل صوتی. سوره شماره {{chapterOrder}} با {{versesCount}} آیه نازل شده در {{revelationPlace}}."
  ```
- **English (`en`)**:
  ```json
  "meta-description": "Read, study, and listen to Surah {{transliteratedName}} ({{translatedName}}) with English translation, tafsir, word-by-word meaning, and audio recitations. Chapter {{chapterOrder}} with {{versesCount}} verses revealed in {{revelationPlace}}."
  ```
- **Arabic (`ar`)**:
  ```json
  "meta-description": "اقرأ واستمع إلى سورة {{transliteratedName}} كاملة مع التفسير والتلاوة الصوتية بصوت أشهر القراء. سورة رقم {{chapterOrder}} وعدد آياتها {{versesCount}} آية، نزلت في {{revelationPlace}}."
  ```

---

## 5. Schema.org JSON-LD Structured Data

### 5.1 Components & Schemas
A new reusable JSON-LD component `ChapterJsonLd` will be added to `[chapterId]/index.tsx`:

1. **`BreadcrumbList`**:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "BreadcrumbList",
     "itemListElement": [
       {
         "@type": "ListItem",
         "position": 1,
         "name": "Quran",
         "item": "https://quran.ir"
       },
       {
         "@type": "ListItem",
         "position": 2,
         "name": "Surah Al-Baqarah",
         "item": "https://quran.ir/al-baqarah"
       }
     ]
   }
   ```
2. **`Chapter` / `CreativeWork`**:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "Chapter",
     "name": "Surah Al-Baqarah",
     "alternateName": ["البقرة", "بقره (گاو ماده)"],
     "position": 2,
     "inLanguage": "fa",
     "isPartOf": {
       "@type": "Book",
       "name": "The Holy Quran",
       "url": "https://quran.ir"
     }
   }
   ```
3. **`AudioObject`**:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "AudioObject",
     "name": "Surah Al-Baqarah Recitation",
     "description": "Audio recitation of Surah Al-Baqarah",
     "contentUrl": "https://audio.qurancdn.com/...",
     "encodingFormat": "audio/mp3"
   }
   ```

---

## 6. Hreflang & Sitemap Synchronization

1. **`getLanguageAlternates`**:
   Ensure `src/utils/locale.ts` generates clean alternate links pointing to each locale's slug path.
2. **`next-sitemap.js`**:
   Ensure all localized Surah slugs are correctly enumerated for static and incremental sitemap builds.

---

## 7. Testing & Verification

1. **Unit Tests**:
   - Verify `getSEOTitle()` produces correct localized search intent titles for `fa`, `en`, and `ar`.
   - Verify `getSurahNavigationUrl()` outputs slug paths.
   - Verify `ChapterJsonLd` generates valid Schema.org JSON without syntax or encoding errors.
2. **Visual & DOM Verification**:
   - Inspect rendered `<head>` tags on `/fa/al-baqarah`, `/fa/2`, `/al-baqarah`, and `/2` using Playwright/DevTools.
   - Verify Google Rich Results test compliance on JSON-LD output.
3. **Regression Guard**:
   - Run complete test suite `yarn --ignore-engines test --run`.
   - Run typecheck `npx tsc --noEmit`.
