# Persian & Multi-Language Word-by-Word (WBW) Translation System

- **Author**: Antigravity & Quran.ir Engineering Team
- **Date**: 2026-09-15
- **Status**: Ready for Review / Implementation

---

## 1. Executive Summary & Goals

### 1.1 Objective
Provide accurate, 1-to-1 aligned **Persian (Farsi)** Word-by-Word (WBW) translations for all **77,430 Quranic word tokens** across all 114 Surahs in Quran.ir, with full offline capability, zero layout shift, and an extensible architecture for adding additional languages (such as Urdu, Turkish, and Indonesian).

### 1.2 User Experience
- **Inline WBW View**: When enabled, the Persian meaning displays directly beneath each Arabic word.
- **Hover / Click Tooltips**: Hovering or clicking any Quranic word displays the Persian meaning badge with study mode navigation.
- **Settings Drawer Control**: Users can switch WBW translation language between English, Persian, Urdu, etc. in real-time, with immediate UI response.

---

## 2. System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Offline Ingestion Pipeline
        A[Quran.com API Resource 552] --> B[scripts/ingest-wbw.js]
        B --> C[Persian Orthography Normalizer]
        C --> D[Integrity & Word Count Auditor]
        D --> E[Save to data/qdc/wbw/fa/{chapterId}.json & data/qdc/wbw/fa.json]
    end

    subgraph Runtime Serving Pipeline
        F[Client / SSR Request: /verses/by_chapter/:id?word_translation_language=fa] --> G[src/utils/localDataEngine.ts]
        G --> H{word_translation_language === 'fa'?}
        H -- Yes --> I[Load wbw/fa/{chapterId}.json & Overlay word.translation]
        H -- No --> J[Default English translation]
        I --> K[Unified Verse Response with Persian Words]
        J --> K
        K --> L[Quran Reader UI: TranslationView / ReadingView / Tooltip]
    end
```

---

## 3. Data Storage & File Structure

### 3.1 Directory Layout
```
data/qdc/
├── wbw/
│   ├── fa.json                 # Complete unified dictionary (~600KB gzipped)
│   ├── fa/
│   │   ├── 1.json              # Surah 1 word translations mapped by location: { "1:1:1": "به نام", ... }
│   │   ├── 2.json
│   │   └── ... 114.json
│   ├── ur/                     # (Future) Urdu WBW shards
│   └── tr/                     # (Future) Turkish WBW shards
```

### 3.2 Shard Schema (`data/qdc/wbw/fa/{chapterId}.json`)
```json
{
  "chapterId": 1,
  "language": "fa",
  "languageName": "persian",
  "languageId": 43,
  "words": {
    "1:1:1": "به نام",
    "1:1:2": "خداوند",
    "1:1:3": "بخشنده",
    "1:1:4": "مهربان",
    "1:2:1": "ستایش",
    "1:2:2": "مخصوص خداست",
    "1:2:3": "پروردگار",
    "1:2:4": "جهانیان"
  }
}
```

---

## 4. Ingestion & Normalization Pipeline (`scripts/ingest-wbw.js`)

1. **Extraction**:
   - Iterate chapters `1..114`.
   - Fetch `/api/v4/verses/by_chapter/${chapterId}?language=fa&words=true&word_fields=text_uthmani,translation&word_translation_language=fa&per_page=300`.
2. **Normalization**:
   - Convert Arabic Yeh (`ي`) -> Persian Yeh (`ی`).
   - Convert Arabic Kaf (`ك`) -> Persian Kaf (`ک`).
   - Standardize Persian half-spaces (nim-faseleh `\u200c`).
   - Strip stray numbering or non-lexical tokens.
3. **Validation**:
   - Compare each location against Quran.ir's master word tokens in `data/qdc/pages/*.json`.
   - Assert `100%` coverage with zero missing keys.
4. **Serialization**:
   - Write per-chapter shards and unified index with atomic writes.

---

## 5. Runtime Engine Integration (`src/utils/localDataEngine.ts`)

In `localDataEngine.ts`:
1. Check `query.word_translation_language` or `query.wordTranslationLanguage`.
2. If language !== `'en'` (e.g. `'fa'`), load `wbw/${lang}/${chapterId}.json` (or read from in-memory cache).
3. In `stitchTranslations` or verse formatting:
   ```ts
   if (wbwMap && verse.words) {
     verse.words = verse.words.map((word) => {
       const location = word.location || `${verse.verse_key}:${word.position}`;
       const translatedText = wbwMap[location];
       if (translatedText) {
         return {
           ...word,
           translation: {
             text: translatedText,
             language_name: 'persian',
             language_id: 43,
           },
         };
       }
       return word;
     });
   }
   ```
4. Expose all available WBW languages in `/resources/word_by_word_translations`.

---

## 6. Verification & Quality Assurance

1. **Dataset Integrity Test**:
   - Verify all 77,430 word positions across 6,236 verses exist in `data/qdc/wbw/fa.json`.
   - Zero undefined or null translations.
2. **Unit Tests**:
   - Add unit tests in `src/utils/localDataEngine.test.ts` testing `word_translation_language=fa` on chapter, juz, and page endpoints.
3. **Browser E2E Verification**:
   - Test `/al-fatihah?wbw_locale=fa` and `/fa/al-fatihah` in Playwright.
   - Verify inline words display Persian under each Arabic word.
   - Verify hover tooltip and click popover show Persian translation.
