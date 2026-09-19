# Specification & Design: "Go To" Quick Jump Navigation System

**Author:** Antigravity Engineering  
**Date:** September 19, 2026  
**Status:** Approved for Implementation  
**Target:** Quran.ir Mobile App (`mobile/`)

---

## 1. Executive Summary & Goals

This document specifies the architecture, data models, user interface, and navigation logic for the
**"Go To" Quick Jump Navigation System** in the Quran.ir mobile application.

### Key Objectives

1. **Universal Multi-Mode Navigation**: Enable instant jumping across all three primary recitation
   paradigms:
   - **سوره و آیه (Surah & Ayah)**: Select Surah and pick/enter any Ayah number (1 to verse count).
   - **صفحه (Medina Mushaf Page 1–604)**: Instant jumping to any page with real-time chapter
     preview.
   - **جزء (Juz 1–30)**: Direct navigation to any of the 30 Juz portions.
2. **Seamless Reader Integration**:
   - Tapping the reader top bar title block or navigation icon opens the modal.
   - Same-chapter jumps execute in-place without screen reload (scrolling with a 2.5-second golden
     aura highlight or setting `currentPage`).
   - Cross-chapter jumps leverage the existing `/surah/[id]?verse=[verseNumber]` deep-linking
     engine.
3. **Global Home & Catalog Access**:
   - Provide direct quick-jump triggers from the Home tab (`index.tsx`) and the Surah Catalog tab
     (`surahs.tsx`).
4. **Offline Sub-Millisecond Resolution**:
   - All mapping and destination resolution runs locally against the pre-bundled `quran.db` SQLite
     database with Node.js in-memory test fallbacks.

---

## 2. Architecture & Data Resolution Engine (`quickJumpService.ts`)

```
┌────────────────────────────────────────────────────────┐
│                   QuickJumpModal                       │
│     (Tabs: Surah & Ayah  |  Page 1-604  |  Juz 1-30)   │
└───────────────────────────┬────────────────────────────┘
                            │ Selects Destination
                            ▼
              ┌───────────────────────────┐
              │     quickJumpService      │
              │  (Offline SQLite queries) │
              └─────────────┬─────────────┘
                            │ Returns JumpDestination
                            ▼
            ┌───────────────────────────────┐
            │       JumpDestination         │
            │ • chapterId: number           │
            │ • verseNumber: number         │
            │ • pageNumber: number (1..604) │
            │ • juzNumber: number (1..30)   │
            │ • chapterNameFa: string       │
            │ • chapterNameArabic: string   │
            └───────────────┬───────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                     ▼
 [In Same Surah]                      [Different Surah]
 • Continuous: In-place auto-scroll   • router.push(
 • Mushaf: setCurrentPage(page)           '/surah/[id]?verse=[verse]')
```

### 2.1 Interface Definition

```typescript
export interface JumpDestination {
  chapterId: number;
  verseNumber: number;
  pageNumber: number;
  juzNumber: number;
  chapterNameFa: string;
  chapterNameArabic: string;
}

export interface JuzCardInfo {
  juzNumber: number;
  startingChapterId: number;
  startingVerseNumber: number;
  startingPageNumber: number;
  chapterNameFa: string;
  chapterNameArabic: string;
  totalVerses: number;
}
```

### 2.2 Resolution Methods

1. **`resolveAyahDestination(chapterId: number, verseNumber: number): Promise<JumpDestination>`**

   - Validates chapter exists (`1 <= chapterId <= 114`).
   - Clamps verse number between `1` and `chapter.verses_count`.
   - Queries `quran.db`:
     ```sql
     SELECT v.chapter_id, v.verse_number, v.page_number, v.juz_number,
            c.name_fa AS chapter_name_fa, c.name_arabic AS chapter_name_arabic
     FROM verses v
     JOIN chapters c ON c.id = v.chapter_id
     WHERE v.chapter_id = ? AND v.verse_number = ?
     LIMIT 1;
     ```

2. **`resolvePageDestination(pageNumber: number): Promise<JumpDestination>`**

   - Clamps `pageNumber` between `1` and `604`.
   - Queries the first verse on that page:
     ```sql
     SELECT v.chapter_id, v.verse_number, v.page_number, v.juz_number,
            c.name_fa AS chapter_name_fa, c.name_arabic AS chapter_name_arabic
     FROM verses v
     JOIN chapters c ON c.id = v.chapter_id
     WHERE v.page_number = ?
     ORDER BY v.id ASC
     LIMIT 1;
     ```

3. **`resolveJuzDestination(juzNumber: number): Promise<JumpDestination>`**

   - Clamps `juzNumber` between `1` and `30`.
   - Pre-computed mapping or query finding the first verse of that Juz:
     ```sql
     SELECT v.chapter_id, v.verse_number, v.page_number, v.juz_number,
            c.name_fa AS chapter_name_fa, c.name_arabic AS chapter_name_arabic
     FROM verses v
     JOIN chapters c ON c.id = v.chapter_id
     WHERE v.juz_number = ?
     ORDER BY v.id ASC
     LIMIT 1;
     ```

4. **`getAllJuzCards(): Promise<JuzCardInfo[]>`**
   - Queries and caches all 30 Juz cards with starting Surah names, starting pages, and verse
     counts.

---

## 3. UI/UX Component Architecture

### 3.1 Modal Layout (`QuickJumpModal.tsx`)

- Container: Slide-up modal with transparent dark backdrop and gesture dismiss.
- Header:
  - Title: `پرش سریع به متن قرآن`
  - Close button with minimum $44 \times 44\text{px}$ touch target.
- Segmented Tab Bar:
  - 3 tabs: `سوره و آیه` (Surah & Ayah), `صفحه` (Page), `جزء` (Juz).
  - Selected tab highlighted with emerald pill (`#10B981`) and gold indicator.
- Footer Action Bar:
  - Primary button: `مشاهده و شروع تلاوت` (48px height, emerald background `#10B981`, bold Vazirmatn
    text).
  - Shows destination preview badge (e.g., `سوره بقره • آیه ۲۵۵ • صفحه ۴۲ • جزء ۳`).

### 3.2 Sub-Tabs

1. **`SurahAyahJumpTab.tsx`**:

   - Search input filtering all 114 Surahs by Persian name, Arabic title, or ID.
   - Surah picker chips/dropdown with revelation badges (`مکی` / `مدنی`) and verse counts.
   - Ayah selector: Numeric stepper (`-` / `+`) + direct numeric input with auto-clamping (`1` to
     `verses_count`).
   - Quick Ayah jumps (e.g. `آیه ۱`, `آیه ۲۵`, `آیه ۵۰`, `آخرین آیه`).

2. **`PageJumpTab.tsx`**:

   - Large numeric input showing page number with Persian digits (`۱ تا ۶۰۴`).
   - Interactive slider for rapid page skimming across the 604 pages.
   - Milestone quick-jump chips:
     - `شروع مصحف (ص ۱)`
     - `سوره کهف (ص ۲۹۳)`
     - `سوره یاسین (ص ۴۴۰)`
     - `جزء عمّ (ص ۵۸۲)`
   - Live preview card showing the chapter name and starting verse for the selected page.

3. **`JuzJumpTab.tsx`**:
   - 2-column scrollable grid of 30 Juz cards.
   - Each card displays:
     - `جزء ۱` to `جزء ۳۰` with Persian numerals.
     - Starting Surah name in Persian and Arabic calligraphy.
     - Starting page badge (`صفحه X`).
   - Tapping any Juz selects it and updates the destination preview.

---

## 4. Navigation Execution & Reader Integration

### 4.1 In-Reader Execution ([`surah/[id].tsx`](file:///Users/reza/Develop/private/quran/mobile/src/app/surah/%5Bid%5D.tsx))

```typescript
const handleJumpToDestination = (destination: JumpDestination) => {
  setIsQuickJumpOpen(false);

  // Case 1: Same Surah
  if (destination.chapterId === chapterId) {
    if (viewMode === 'mushaf') {
      setCurrentPage(destination.pageNumber);
      setLastRead(chapterId, destination.verseNumber, chapter?.name_fa || '');
    } else {
      const index = verses.findIndex((v) => v.verse_number === destination.verseNumber);
      if (index >= 0) {
        setHighlightedVerseKey(`${chapterId}:${destination.verseNumber}`);
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.15 });
        setLastRead(chapterId, destination.verseNumber, chapter?.name_fa || '');
        setTimeout(() => setHighlightedVerseKey(null), 2500);
      }
    }
    return;
  }

  // Case 2: Different Surah (Router Push with verse param)
  router.push(`/surah/${destination.chapterId}?verse=${destination.verseNumber}` as any);
};
```

### 4.2 Home & Catalog Integration

- **`index.tsx`**: Add a Quick Jump action card in the home dashboard with a direct trigger button
  `پرش سریع به آیه یا صفحه`.
- **`surahs.tsx`**: Add a Quick Jump icon button in the header next to search.

---

## 5. Verification & Testing Strategy

1. **Unit Tests (`quickJumpService.test.mjs`)**:
   - Verify `resolveAyahDestination` bounds, validation, and metadata for Al-Fatihah 1:1, Al-Baqarah
     2:255, and An-Nas 114:6.
   - Verify `resolvePageDestination` for Page 1, Page 42, Page 293 (Al-Kahf), and Page 604.
   - Verify `resolveJuzDestination` for all 30 Juzs (e.g. Juz 1 -> 1:1 Page 1, Juz 30 -> 78:1 Page
     582).
   - Verify `getAllJuzCards` returns exactly 30 cards with valid metadata.
2. **Component & Contract Tests (`quickJumpModal.test.mjs`)**:
   - Verify WCAG minimum $44 \times 44\text{px}$ touch targets.
   - Verify Persian formatting helpers (`toPersianDigits`, destination formatting).
   - Test tab switching (`surah` -> `page` -> `juz`).
   - Test clamping logic for invalid page numbers (`< 1` or `> 604`).
3. **Integration Verification**:
   - `yarn --cwd mobile test` (all tests passing).
   - `yarn --cwd mobile typecheck` (0 errors).
   - `yarn --ignore-engines ai:check` (51/51 symlinks verified).
