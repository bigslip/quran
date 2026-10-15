# Mobile App Phase 1D Implementation Plan: Ayah Insights & Tadabbur Drawer (Figma Node 1:995)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete, offline-capable Ayah Insights / Tadabbur Drawer matching Figma node `1:995` featuring deep linguistic word analysis, Persian Tafsir excerpts (Nemouneh & Al-Mizan), AI-assisted contemplative themes, and personal reflection journaling.

**Architecture:** React Native bottom sheet modal with Expo SQLite offline integration, Zustand reading store hooks, Sanctuary design system tokens (`colors`, `typography`, `spacing`), and RTL layout.

**Tech Stack:** React Native, Expo SDK 52+, TypeScript, SQLite (`quran.db`), Zustand, Lucide React Native icons.

## Global Constraints

- **Platform**: iOS 15+ and Android 10+ (API 29+)
- **Directionality**: RTL primary (Persian/Arabic) with logical layout properties
- **Typography**: `Vazirmatn-Regular` (UI text), `UthmanicHafs` (Arabic calligraphy and Uthmani scripture), `IndoPakNastaleeq` (IndoPak script)
- **Colors**: Sanctuary Theme:
  - Background: `#08130E`
  - Floating Dock & Cards: `#132A20`, `#0D1F17`
  - Gold Accents: `#C5A880`, `#D4AF37`
  - Vibrant Emerald: `#10B981`
  - Borders: `#1B3D2F`, `#2D6A4F`
- **Touch Targets**: All interactive elements must strictly have minimum 44x44px touch targets (`accessibilityRole="button"`, `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`)
- **Offline First**: Instant responses with zero mandatory network dependencies; queries served from `mobile/assets/data/quran.db` and local offline storage

---

## Tasks

### Task 1: Offline Ayah Insights & Tafsir Data Service
**Files:**
- Create: `mobile/src/services/db/ayahInsightsService.ts`
- Modify: `mobile/src/types/quran.ts`
- Test: `mobile/src/services/db/database.test.mjs`

**Interfaces:**
- Produces:
  ```ts
  export interface WordLinguisticInfo {
    id: number;
    verse_key: string;
    position: number;
    text_uthmani: string;
    text_indopak?: string;
    translation_fa: string;
    root_arabic?: string;
    lemma?: string;
    part_of_speech?: string;
  }

  export interface TafsirExcerpt {
    id: string;
    author_name: string; // 'مکارم شیرازی (نمونه)' | 'علامه طباطبایی (المیزان)' | 'حجت‌الاسلام قرائتی (نور)'
    title: string;
    text: string;
    points?: string[];
  }

  export interface AyahInsight {
    verse_key: string;
    chapter_id: number;
    verse_number: number;
    linguistic_summary: string;
    contemplative_theme: string;
    words: WordLinguisticInfo[];
    tafsirs: TafsirExcerpt[];
  }

  export async function getAyahInsight(verseKey: string): Promise<AyahInsight>;
  export async function getWordLinguisticBreakdown(verseKey: string): Promise<WordLinguisticInfo[]>;
  export async function getTafsirExcerpts(verseKey: string): Promise<TafsirExcerpt[]>;
  export async function savePersonalReflection(verseKey: string, text: string): Promise<void>;
  export async function getPersonalReflection(verseKey: string): Promise<string | null>;
  ```

- [x] **Step 1: Write tests for `ayahInsightsService` in `database.test.mjs`**
- [x] **Step 2: Implement `ayahInsightsService.ts` with root extraction and Tafsir synthesis**
- [x] **Step 3: Run `node --test mobile/src/services/db/database.test.mjs` and verify pass**
- [x] **Step 4: Commit `feat(mobile): implement offline Ayah insights and tafsir data service`**

---

### Task 2: Ayah Scripture Preview & Interactive Word Card
**Files:**
- Create: `mobile/src/components/insights/AyahScripturePreviewCard.tsx`
- Create: `mobile/src/components/insights/insightsContracts.ts`
- Test: `mobile/src/components/insights/insightsComponents.test.mjs`

**Interfaces:**
- Produces:
  ```ts
  export interface AyahScripturePreviewCardProps {
    verseKey: string;
    textUthmani: string;
    textIndopak?: string;
    translationFa?: string;
    words: WordLinguisticInfo[];
    activeWordPosition: number;
    onSelectWord: (position: number) => void;
    quranFont?: 'hafs' | 'indopak';
    style?: StyleProp<ViewStyle>;
    testID?: string;
  }
  ```

- [x] **Step 1: Create `insightsContracts.ts` with layout, sizing, and formatting helpers**
- [x] **Step 2: Build `AyahScripturePreviewCard.tsx` with word tap highlight and active word badge**
- [x] **Step 3: Write tests for word selection, typography, and accessibility**
- [x] **Step 4: Commit `feat(mobile): implement AyahScripturePreviewCard with interactive word highlight`**

---

### Task 3: Tafsir Excerpt Viewer & Personal Reflection Journal
**Files:**
- Create: `mobile/src/components/insights/TafsirTabContent.tsx`
- Create: `mobile/src/components/insights/PersonalReflectionCard.tsx`
- Test: `mobile/src/components/insights/insightsComponents.test.mjs`

**Interfaces:**
- Produces:
  ```ts
  export interface TafsirTabContentProps {
    tafsirs: TafsirExcerpt[];
    selectedTafsirId: string;
    onSelectTafsir: (id: string) => void;
    contemplativeTheme?: string;
    style?: StyleProp<ViewStyle>;
    testID?: string;
  }

  export interface PersonalReflectionCardProps {
    verseKey: string;
    initialReflection?: string;
    onSaveReflection: (note: string) => Promise<void>;
    style?: StyleProp<ViewStyle>;
    testID?: string;
  }
  ```

- [x] **Step 1: Build `TafsirTabContent.tsx` with source switcher pills and bullet takeaways**
- [x] **Step 2: Build `PersonalReflectionCard.tsx` with note input and persistence**
- [x] **Step 3: Add unit tests in `insightsComponents.test.mjs`**
- [x] **Step 4: Commit `feat(mobile): implement TafsirTabContent and PersonalReflectionCard`**

---

### Task 4: Ayah Insights Drawer Main Sheet
**Files:**
- Create: `mobile/src/components/insights/AyahInsightsDrawer.tsx`
- Create: `mobile/src/components/insights/index.ts`
- Modify: `mobile/src/components/reader/index.ts`
- Test: `mobile/src/components/insights/insightsComponents.test.mjs`

**Interfaces:**
- Produces:
  ```ts
  export interface AyahInsightsDrawerProps {
    visible: boolean;
    verse: Verse | null;
    chapterNameFa?: string;
    onClose: () => void;
    onPlayVerse?: (verse: Verse) => void;
    onBookmarkVerse?: (verse: Verse) => void;
    isBookmarked?: boolean;
    quranFont?: 'hafs' | 'indopak';
    testID?: string;
  }
  ```

- [x] **Step 1: Implement `AyahInsightsDrawer.tsx` with Sanctuary bottom sheet modal**
- [x] **Step 2: Wire 3 segmented tabs: Tafsir & Reflections, Vocabulary Breakdown, Personal Notes**
- [x] **Step 3: Export from `components/insights/index.ts`**
- [x] **Step 4: Write tests verifying touch targets (>= 44x44px), tab switching, and contracts**
- [x] **Step 5: Commit `feat(mobile): implement AyahInsightsDrawer sanctuary sheet`**

---

### Task 5: Screen Integration & Comprehensive Verification
**Files:**
- Modify: `mobile/src/app/surah/[id].tsx`
- Test: `mobile/src/components/reader/readerComponents.test.mjs`
- Test: `mobile/src/components/insights/insightsComponents.test.mjs`

- [x] **Step 1: Wire `handleVerseInsights` in `surah/[id].tsx` to open `AyahInsightsDrawer`**
- [x] **Step 2: Bind selected verse and chapter metadata to drawer**
- [x] **Step 3: Run full mobile test suites (`insightsComponents.test.mjs`, `readerComponents.test.mjs`, `database.test.mjs`, `catalogComponents.test.mjs`)**
- [x] **Step 4: Run web regression suite (`yarn --ignore-engines test --run`)**
- [x] **Step 5: Commit `feat(mobile): wire AyahInsightsDrawer into surah reader screen`**
- [x] **Step 6: Execute Whole-Phase Code Review for Phase 1D**

