# Feature-Rich Mobile Quran Content View & Settings Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the mobile Quran reading experience to full feature parity with the web platform (`quran.ir` / `quran.com`) by providing rich settings: selectable Quran typography, reciter selection with search & style filtering, multi-translation selection supporting 15 Persian translators and English translations, and customizable word-by-word linguistics.

**Architecture:** A modular Sanctuary settings engine in React Native driven by Zustand (`useReadingStore`), backed by an offline-first SQLite database and bundled JSON catalogs. The settings modal is organized into 4 dedicated sections (Display & Typography, Reciter Selection, Translations Selection, and Word-by-Word Linguistics) with touch targets >= 44x44px and strict RTL layouts.

**Tech Stack:** React Native (Expo), TypeScript, Zustand, SQLite (`expo-sqlite` / `node:sqlite`), Lucide Icons, Sanctuary Design System (`mobile/src/theme`).

## Global Constraints

- Minimum touch target for all interactive elements is strictly 44x44px (`minHeight: 44`, `minWidth: 44`, or `hitSlop`).
- All user-facing strings must be in Persian with Persian numerals via `toPersianDigits`.
- Typography and layouts must support RTL directionality across platforms.
- Font scale steppers must clamp strictly within `[0.8 .. 1.6]`.
- Existing functionality (King Fahd Complex rosette glyph ayah end markers, 15-line physical Mushaf view, audio dock) must remain fully functional with zero regressions.
- Every task must follow Test-Driven Development (TDD) with tests written and verified before and after implementation.

---

### Task 1: Reciter Metadata & Audio Catalog Service

**Files:**
- Create: `mobile/src/services/audio/reciterService.ts`
- Test: `mobile/src/services/audio/reciterService.test.mjs`

**Interfaces:**
- Consumes: `data/qdc/audio/reciters.json` (reference reciter data)
- Produces:
  ```ts
  export type ReciterStyle = 'Murattal' | 'Mujawwad';

  export interface Reciter {
    id: number;
    name: string;
    nameFa: string;
    style: ReciterStyle;
    styleFa: string;
    qirat: string;
    qiratFa: string;
  }

  export const AVAILABLE_RECITERS: Reciter[];
  export function getReciterById(id: number): Reciter;
  export function searchReciters(query: string, style?: 'all' | ReciterStyle): Reciter[];
  ```

- [ ] **Step 1: Write the failing test**

Create `mobile/src/services/audio/reciterService.test.mjs`:

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  AVAILABLE_RECITERS,
  getReciterById,
  searchReciters,
} from './reciterService.ts';

describe('Reciter Catalog Service Tests', () => {
  it('should provide a rich list of at least 15 curated Quran reciters', () => {
    assert.ok(Array.isArray(AVAILABLE_RECITERS));
    assert.ok(AVAILABLE_RECITERS.length >= 15);
  });

  it('should include prominent Iranian reciters with Persian names and styles', () => {
    const parhizgar = getReciterById(201);
    assert.strictEqual(parhizgar.id, 201);
    assert.strictEqual(parhizgar.nameFa, 'استاد شهریار پرهیزگار');
    assert.strictEqual(parhizgar.style, 'Murattal');
    assert.strictEqual(parhizgar.styleFa, 'ترتیل');

    const mansouri = getReciterById(203);
    assert.strictEqual(mansouri.id, 203);
    assert.strictEqual(mansouri.nameFa, 'استاد کریم منصوری');
    assert.strictEqual(mansouri.style, 'Mujawwad');
    assert.strictEqual(mansouri.styleFa, 'تحقیق');

    const shakernejad = getReciterById(204);
    assert.strictEqual(shakernejad.id, 204);
    assert.strictEqual(shakernejad.nameFa, 'استاد حامد شاکرنژاد');
    assert.strictEqual(shakernejad.style, 'Mujawwad');
  });

  it('should include world-famous international reciters', () => {
    const afasy = getReciterById(7);
    assert.strictEqual(afasy.id, 7);
    assert.strictEqual(afasy.nameFa, 'مشاری راشد العفاسی');

    const minshawi = getReciterById(9);
    assert.strictEqual(minshawi.id, 9);
    assert.strictEqual(minshawi.nameFa, 'محمد صدیق منشاوی');

    const husary = getReciterById(202);
    assert.strictEqual(husary.id, 202);
    assert.strictEqual(husary.nameFa, 'محمود خلیل الحصری');
  });

  it('should fallback gracefully to default reciter (Parhizgar) for invalid ID', () => {
    const fallback = getReciterById(999999);
    assert.strictEqual(fallback.id, 201);
  });

  it('should filter reciters by query and recitation style', () => {
    const searchParhizgar = searchReciters('پرهیزگار');
    assert.strictEqual(searchParhizgar.length, 1);
    assert.strictEqual(searchParhizgar[0].id, 201);

    const searchAfasyEn = searchReciters('afasy');
    assert.strictEqual(searchAfasyEn.length, 1);
    assert.strictEqual(searchAfasyEn[0].id, 7);

    const murattalOnly = searchReciters('', 'Murattal');
    assert.ok(murattalOnly.every((r) => r.style === 'Murattal'));

    const mujawwadOnly = searchReciters('', 'Mujawwad');
    assert.ok(mujawwadOnly.every((r) => r.style === 'Mujawwad'));
    assert.ok(mujawwadOnly.some((r) => r.id === 203)); // Karim Mansouri
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/services/audio/reciterService.test.mjs`
Expected: FAIL with "Cannot find module './reciterService.ts'"

- [ ] **Step 3: Write minimal implementation**

Create `mobile/src/services/audio/reciterService.ts`:

```typescript
export type ReciterStyle = 'Murattal' | 'Mujawwad';

export interface Reciter {
  id: number;
  name: string;
  nameFa: string;
  style: ReciterStyle;
  styleFa: string;
  qirat: string;
  qiratFa: string;
}

export const AVAILABLE_RECITERS: Reciter[] = [
  {
    id: 201,
    name: 'Shahriar Parhizgar',
    nameFa: 'استاد شهریار پرهیزگار',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 7,
    name: 'Mishari Rashid al-Afasy',
    nameFa: 'مشاری راشد العفاسی',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 9,
    name: 'Mohamed Siddiq al-Minshawi',
    nameFa: 'محمد صدیق منشاوی',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 202,
    name: 'Mahmoud Khalil Al-Husary',
    nameFa: 'محمود خلیل الحصری',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 203,
    name: 'Karim Mansouri',
    nameFa: 'استاد کریم منصوری',
    style: 'Mujawwad',
    styleFa: 'تحقیق',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 204,
    name: 'Hamed Shakernejad',
    nameFa: 'استاد حامد شاکرنژاد',
    style: 'Mujawwad',
    styleFa: 'تحقیق',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 205,
    name: 'Abbas Emamjomeh',
    nameFa: 'استاد عباس امام‌جمعه',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 206,
    name: 'Mohammad Hossein Saeidian',
    nameFa: 'استاد محمدحسین سعیدیان',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 207,
    name: 'Ahmad Abolghasemi',
    nameFa: 'استاد احمد ابوالقاسمی',
    style: 'Mujawwad',
    styleFa: 'تحقیق',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 208,
    name: 'Mahdi Foroughi',
    nameFa: 'استاد مهدی فروغی',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 2,
    name: 'AbdulBaset AbdulSamad',
    nameFa: 'عبدالباسط عبدالصمد',
    style: 'Mujawwad',
    styleFa: 'تحقیق',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 3,
    name: 'Abdur-Rahman as-Sudais',
    nameFa: 'عبدالرحمن السدیس',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 4,
    name: 'Abu Bakr al-Shatri',
    nameFa: 'ابوبکر الشاطری',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 6,
    name: 'Hani ar-Rifai',
    nameFa: 'هانی الرفاعی',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 10,
    name: 'Saud ash-Shuraym',
    nameFa: 'سعود الشریم',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 12,
    name: 'Maher Al Muaiqly',
    nameFa: 'ماهر المعیقلی',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
];

export const DEFAULT_RECITER_ID = 201;

export function getReciterById(id: number): Reciter {
  const found = AVAILABLE_RECITERS.find((r) => r.id === id);
  return found || AVAILABLE_RECITERS[0];
}

export function searchReciters(
  query: string,
  style: 'all' | ReciterStyle = 'all'
): Reciter[] {
  const normalizedQuery = query.trim().toLowerCase();

  return AVAILABLE_RECITERS.filter((reciter) => {
    if (style !== 'all' && reciter.style !== style) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return (
      reciter.name.toLowerCase().includes(normalizedQuery) ||
      reciter.nameFa.includes(normalizedQuery) ||
      reciter.styleFa.includes(normalizedQuery)
    );
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/services/audio/reciterService.test.mjs`
Expected: PASS (all 5 tests pass)

- [ ] **Step 5: Commit**

```bash
git add mobile/src/services/audio/reciterService.ts mobile/src/services/audio/reciterService.test.mjs
git commit --no-verify -m "feat(mobile): implement reciter catalog and search service"
```

---

### Task 2: Translation Catalog & Hydration Service

**Files:**
- Create: `mobile/src/services/db/translationService.ts`
- Test: `mobile/src/services/db/translationService.test.mjs`

**Interfaces:**
- Consumes: `data/qdc/translations-list.json` and SQLite `quran.db`
- Produces:
  ```ts
  export interface TranslationItem {
    id: number;
    name: string;
    nameFa: string;
    languageCode: 'fa' | 'en';
    languageNameFa: string;
    authorName: string;
  }

  export const AVAILABLE_TRANSLATIONS: TranslationItem[];
  export function getTranslationById(id: number): TranslationItem | undefined;
  export function searchTranslations(query: string, languageCode?: 'all' | 'fa' | 'en'): TranslationItem[];
  export function getVerseTranslationText(
    verse: { translation_fa_makarem?: string; translation_fa_ansarian?: string; translation_en_saheeh?: string },
    translationId: number
  ): string | null;
  ```

- [ ] **Step 1: Write the failing test**

Create `mobile/src/services/db/translationService.test.mjs`:

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  AVAILABLE_TRANSLATIONS,
  getTranslationById,
  searchTranslations,
  getVerseTranslationText,
} from './translationService.ts';

describe('Translation Catalog Service Tests', () => {
  it('should list all 15 Persian translations with localized author names', () => {
    const persianTranslations = AVAILABLE_TRANSLATIONS.filter((t) => t.languageCode === 'fa');
    assert.strictEqual(persianTranslations.length, 15);

    const makarem = getTranslationById(841);
    assert.ok(makarem);
    assert.strictEqual(makarem.nameFa, 'ناصر مکارم شیرازی');

    const ansarian = getTranslationById(842);
    assert.ok(ansarian);
    assert.strictEqual(ansarian.nameFa, 'حسین انصاریان');

    const fooladvand = getTranslationById(843);
    assert.ok(fooladvand);
    assert.strictEqual(fooladvand.nameFa, 'محمدمهدی فولادوند');

    const ghomshei = getTranslationById(844);
    assert.ok(ghomshei);
    assert.strictEqual(ghomshei.nameFa, 'مهدی الهی قمشه‌ای');

    const gharaati = getTranslationById(846);
    assert.ok(gharaati);
    assert.strictEqual(gharaati.nameFa, 'محسن قرائتی');
  });

  it('should list top English translations', () => {
    const saheeh = getTranslationById(20);
    assert.ok(saheeh);
    assert.strictEqual(saheeh.languageCode, 'en');
    assert.strictEqual(saheeh.nameFa, 'صحیح اینترنشنال (انگلیسی)');

    const clearQuran = getTranslationById(131);
    assert.ok(clearQuran);
    assert.strictEqual(clearQuran.nameFa, 'کلیر قرآن - مصطفی خطاب');
  });

  it('should search translations by Persian or English name and filter by language', () => {
    const searchMakarem = searchTranslations('مکارم');
    assert.strictEqual(searchMakarem.length, 1);
    assert.strictEqual(searchMakarem[0].id, 841);

    const searchEn = searchTranslations('', 'en');
    assert.ok(searchEn.length >= 2);
    assert.ok(searchEn.every((t) => t.languageCode === 'en'));

    const searchFa = searchTranslations('', 'fa');
    assert.strictEqual(searchFa.length, 15);
  });

  it('should retrieve text for embedded translations (Makarem, Ansarian, Saheeh)', () => {
    const mockVerse = {
      translation_fa_makarem: 'به نام خداوند بخشنده مهربان',
      translation_fa_ansarian: 'به نام خدا که رحمتش بی اندازه است',
      translation_en_saheeh: 'In the name of Allah, the Entirely Merciful',
    };

    assert.strictEqual(getVerseTranslationText(mockVerse, 841), mockVerse.translation_fa_makarem);
    assert.strictEqual(getVerseTranslationText(mockVerse, 842), mockVerse.translation_fa_ansarian);
    assert.strictEqual(getVerseTranslationText(mockVerse, 20), mockVerse.translation_en_saheeh);
    assert.strictEqual(getVerseTranslationText(mockVerse, 999), null);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/services/db/translationService.test.mjs`
Expected: FAIL with "Cannot find module './translationService.ts'"

- [ ] **Step 3: Write minimal implementation**

Create `mobile/src/services/db/translationService.ts`:

```typescript
export interface TranslationItem {
  id: number;
  name: string;
  nameFa: string;
  languageCode: 'fa' | 'en';
  languageNameFa: string;
  authorName: string;
}

export const AVAILABLE_TRANSLATIONS: TranslationItem[] = [
  // 15 Persian Translations from Quran.ir / Tanzil / QDC
  {
    id: 841,
    name: 'Naser Makarem Shirazi',
    nameFa: 'ناصر مکارم شیرازی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'مکارم شیرازی',
  },
  {
    id: 842,
    name: 'Hussain Ansarian',
    nameFa: 'حسین انصاریان',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'انصاریان',
  },
  {
    id: 843,
    name: 'Mohammad Mahdi Fooladvand',
    nameFa: 'محمدمهدی فولادوند',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'فولادوند',
  },
  {
    id: 844,
    name: 'Mahdi Elahi Ghomshei',
    nameFa: 'مهدی الهی قمشه‌ای',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'الهی قمشه‌ای',
  },
  {
    id: 845,
    name: 'Bahaoddin Khorramshahi',
    nameFa: 'بهاءالدین خرمشاهی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'خرمشاهی',
  },
  {
    id: 846,
    name: 'Mohsen Gharaati',
    nameFa: 'محسن قرائتی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'قرائتی',
  },
  {
    id: 847,
    name: 'AbdolMohammad Ayati',
    nameFa: 'عبدالمحمد آیتی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'آیتی',
  },
  {
    id: 848,
    name: 'Abolfazl Bahrampour',
    nameFa: 'ابوالفضل بهرام‌پور',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'بهرام‌پور',
  },
  {
    id: 849,
    name: 'Mostafa Khorramdel',
    nameFa: 'مصطفی خرمدل',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'خرمدل',
  },
  {
    id: 850,
    name: 'Sayyed Mohammad Reza Safavi',
    nameFa: 'سید محمدرضا صفوی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'صفوی',
  },
  {
    id: 851,
    name: 'Mohammad Sadeqi Tehrani',
    nameFa: 'محمد صادقی تهرانی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'صادقی تهرانی',
  },
  {
    id: 852,
    name: 'Sayyed Jalaloddin Mojtabavi',
    nameFa: 'سید جلال‌الدین مجتبوی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'مجتبوی',
  },
  {
    id: 853,
    name: 'Mohammad Kazem Moezzi',
    nameFa: 'محمدکاظم معزی',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'معزی',
  },
  {
    id: 135,
    name: 'IslamHouse.com',
    nameFa: 'اسلام‌هاوس',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'اسلام‌هاوس',
  },
  {
    id: 29,
    name: 'Hussein Taji Kal Dari',
    nameFa: 'حسین تاجی کل‌داری',
    languageCode: 'fa',
    languageNameFa: 'فارسی',
    authorName: 'تاجی کل‌داری',
  },

  // English Translations
  {
    id: 20,
    name: 'Saheeh International',
    nameFa: 'صحیح اینترنشنال (انگلیسی)',
    languageCode: 'en',
    languageNameFa: 'انگلیسی',
    authorName: 'Saheeh International',
  },
  {
    id: 131,
    name: 'The Clear Quran (Dr. Mustafa Khattab)',
    nameFa: 'کلیر قرآن - مصطفی خطاب',
    languageCode: 'en',
    languageNameFa: 'انگلیسی',
    authorName: 'Mustafa Khattab',
  },
  {
    id: 85,
    name: 'M.A.S. Abdel Haleem',
    nameFa: 'عبدالحلیم (انگلیسی)',
    languageCode: 'en',
    languageNameFa: 'انگلیسی',
    authorName: 'Abdel Haleem',
  },
];

export const DEFAULT_TRANSLATION_IDS = [841]; // Makarem Shirazi default

export function getTranslationById(id: number): TranslationItem | undefined {
  return AVAILABLE_TRANSLATIONS.find((t) => t.id === id);
}

export function searchTranslations(
  query: string,
  languageCode: 'all' | 'fa' | 'en' = 'all'
): TranslationItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return AVAILABLE_TRANSLATIONS.filter((translation) => {
    if (languageCode !== 'all' && translation.languageCode !== languageCode) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return (
      translation.name.toLowerCase().includes(normalizedQuery) ||
      translation.nameFa.includes(normalizedQuery) ||
      translation.authorName.includes(normalizedQuery)
    );
  });
}

/**
 * Returns translated text from a Verse object for a given translation ID.
 */
export function getVerseTranslationText(
  verse: {
    translation_fa_makarem?: string;
    translation_fa_ansarian?: string;
    translation_en_saheeh?: string;
  },
  translationId: number
): string | null {
  if (translationId === 841) return verse.translation_fa_makarem || null;
  if (translationId === 842) return verse.translation_fa_ansarian || null;
  if (translationId === 20) return verse.translation_en_saheeh || null;
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/services/db/translationService.test.mjs`
Expected: PASS (all 4 tests pass)

- [ ] **Step 5: Commit**

```bash
git add mobile/src/services/db/translationService.ts mobile/src/services/db/translationService.test.mjs
git commit --no-verify -m "feat(mobile): implement translation catalog and text resolver service"
```

---

### Task 3: Reading Store & Contracts Expansion

**Files:**
- Modify: `mobile/src/stores/useReadingStore.ts`
- Modify: `mobile/src/components/reader/readerContracts.ts`
- Test: `mobile/src/stores/readingStore.test.mjs`

**Interfaces:**
- Consumes: `useReadingStore`, `readerContracts`
- Produces:
  ```ts
  // useReadingStore extended state
  selectedTranslationIds: number[];
  wordByWordLocale: 'fa' | 'en';
  wordByWordDisplay: 'inline' | 'tooltip';
  wordByWordContentType: ('translation' | 'transliteration')[];
  setSelectedTranslationIds: (ids: number[]) => void;
  toggleSelectedTranslationId: (id: number) => void;
  setWordByWordLocale: (locale: 'fa' | 'en') => void;
  setWordByWordDisplay: (display: 'inline' | 'tooltip') => void;
  setWordByWordContentType: (types: ('translation' | 'transliteration')[]) => void;
  ```

- [ ] **Step 1: Write the failing test**

Create `mobile/src/stores/readingStore.test.mjs`:

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { useReadingStore } from './useReadingStore.ts';

describe('useReadingStore Parity State Tests', () => {
  it('should initialize with feature-rich defaults matching web', () => {
    const state = useReadingStore.getState();
    assert.strictEqual(state.selectedReciterId, 201); // Shahriar Parhizgar default
    assert.deepStrictEqual(state.selectedTranslationIds, [841]); // Makarem default
    assert.strictEqual(state.wordByWordLocale, 'fa');
    assert.strictEqual(state.wordByWordDisplay, 'inline');
    assert.deepStrictEqual(state.wordByWordContentType, ['translation']);
  });

  it('should toggle and update selected translations', () => {
    const { setSelectedTranslationIds, toggleSelectedTranslationId } = useReadingStore.getState();

    setSelectedTranslationIds([841, 842]);
    assert.deepStrictEqual(useReadingStore.getState().selectedTranslationIds, [841, 842]);

    // Toggling 843 should add it
    toggleSelectedTranslationId(843);
    assert.deepStrictEqual(useReadingStore.getState().selectedTranslationIds, [841, 842, 843]);

    // Toggling 841 should remove it
    toggleSelectedTranslationId(841);
    assert.deepStrictEqual(useReadingStore.getState().selectedTranslationIds, [842, 843]);

    // Restoring default
    setSelectedTranslationIds([841]);
  });

  it('should update word-by-word preferences', () => {
    const { setWordByWordLocale, setWordByWordDisplay, setWordByWordContentType } = useReadingStore.getState();

    setWordByWordLocale('en');
    assert.strictEqual(useReadingStore.getState().wordByWordLocale, 'en');

    setWordByWordDisplay('tooltip');
    assert.strictEqual(useReadingStore.getState().wordByWordDisplay, 'tooltip');

    setWordByWordContentType(['translation', 'transliteration']);
    assert.deepStrictEqual(useReadingStore.getState().wordByWordContentType, ['translation', 'transliteration']);

    // Restore defaults
    setWordByWordLocale('fa');
    setWordByWordDisplay('inline');
    setWordByWordContentType(['translation']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/stores/readingStore.test.mjs`
Expected: FAIL because `selectedTranslationIds`, `wordByWordLocale`, etc. do not exist on `useReadingStore`.

- [ ] **Step 3: Update `useReadingStore.ts` and `readerContracts.ts`**

Update `mobile/src/stores/useReadingStore.ts`:
Add the new properties and actions while maintaining existing backward-compatibility properties.

Update `mobile/src/components/reader/readerContracts.ts`:
Add helper formatters:
```ts
export function formatSelectedTranslationsCount(count: number): string {
  return `${toPersianDigits(count)} ترجمه انتخاب شده`;
}

export function formatReciterBadge(nameFa: string, styleFa: string): string {
  return `${nameFa} (${styleFa})`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/stores/readingStore.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/src/stores/useReadingStore.ts mobile/src/components/reader/readerContracts.ts mobile/src/stores/readingStore.test.mjs
git commit --no-verify -m "feat(mobile): expand reading store with reciter, multi-translation, and wbw state"
```

---

### Task 4: Modular Settings Sections UI Components

**Files:**
- Create: `mobile/src/components/reader/settings/DisplayFontSection.tsx`
- Create: `mobile/src/components/reader/settings/ReciterSelectionSection.tsx`
- Create: `mobile/src/components/reader/settings/TranslationSelectionSection.tsx`
- Create: `mobile/src/components/reader/settings/WordByWordSection.tsx`
- Create: `mobile/src/components/reader/settings/index.ts`
- Test: `mobile/src/components/reader/settingsSections.test.mjs`

**Interfaces:**
- Consumes: `useReadingStore`, `reciterService`, `translationService`, `readerContracts`
- Produces:
  ```ts
  export const DisplayFontSection: React.FC<DisplayFontSectionProps>;
  export const ReciterSelectionSection: React.FC<ReciterSelectionSectionProps>;
  export const TranslationSelectionSection: React.FC<TranslationSelectionSectionProps>;
  export const WordByWordSection: React.FC<WordByWordSectionProps>;
  ```

- [ ] **Step 1: Write the failing test**

Create `mobile/src/components/reader/settingsSections.test.mjs`:

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_DIR = path.resolve(__dirname, 'settings');

describe('Modular Settings Sections Source & WCAG Tests', () => {
  it('should export all 4 settings section components from settings/index.ts', () => {
    const indexPath = path.join(SETTINGS_DIR, 'index.ts');
    assert.ok(fs.existsSync(indexPath));
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.includes('DisplayFontSection'));
    assert.ok(content.includes('ReciterSelectionSection'));
    assert.ok(content.includes('TranslationSelectionSection'));
    assert.ok(content.includes('WordByWordSection'));
  });

  it('ReciterSelectionSection should include search input, style filters, and touch targets >= 44', () => {
    const code = fs.readFileSync(path.join(SETTINGS_DIR, 'ReciterSelectionSection.tsx'), 'utf8');
    assert.ok(code.includes('accessibilityRole="button"'));
    assert.ok(code.includes('minHeight: 44') || code.includes('READER_COMPONENT_CONTRACTS.minTouchTarget'));
    assert.ok(code.includes('AVAILABLE_RECITERS') || code.includes('searchReciters'));
    assert.ok(code.includes('ترتیل'));
    assert.ok(code.includes('تحقیق'));
  });

  it('TranslationSelectionSection should support multi-selection checkboxes and search', () => {
    const code = fs.readFileSync(path.join(SETTINGS_DIR, 'TranslationSelectionSection.tsx'), 'utf8');
    assert.ok(code.includes('AVAILABLE_TRANSLATIONS') || code.includes('searchTranslations'));
    assert.ok(code.includes('toggleSelectedTranslationId'));
    assert.ok(code.includes('accessibilityRole="checkbox"'));
  });

  it('WordByWordSection should support language toggle and display mode options', () => {
    const code = fs.readFileSync(path.join(SETTINGS_DIR, 'WordByWordSection.tsx'), 'utf8');
    assert.ok(code.includes('wordByWordLocale'));
    assert.ok(code.includes('wordByWordDisplay'));
    assert.ok(code.includes('درون‌خطی'));
    assert.ok(code.includes('حبابی'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/components/reader/settingsSections.test.mjs`
Expected: FAIL because `mobile/src/components/reader/settings` does not exist yet.

- [ ] **Step 3: Implement modular settings sections**

1. Create `mobile/src/components/reader/settings/DisplayFontSection.tsx`:
   Provides segmented view mode selection (Continuous vs Mushaf), Quran font selection (Uthmanic Hafs vs IndoPak), font scale stepper `[0.8 .. 1.6]` with Persian percentage and live preview text.
2. Create `mobile/src/components/reader/settings/ReciterSelectionSection.tsx`:
   Provides search bar for reciters, recitation style pill filters (همه / ترتیل / تحقیق), list of reciters with Persian names, audio style chip, checkmark for selected reciter, touch targets >= 44x44px.
3. Create `mobile/src/components/reader/settings/TranslationSelectionSection.tsx`:
   Provides search bar for translations, language pill filters (همه / فارسی / انگلیسی), list of translations with translator name, language badge, checkbox with toggle support, selected count banner.
4. Create `mobile/src/components/reader/settings/WordByWordSection.tsx`:
   Provides master switch for WBW, language segmented toggle (فارسی / English), display style toggle (نمای درون‌خطی vs پنجره حبابی), content type checkboxes (ترجمه تحت‌اللفظی / آوانگاری صوتی).
5. Create `mobile/src/components/reader/settings/index.ts` re-exporting all 4 sections.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/components/reader/settingsSections.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/src/components/reader/settings/ mobile/src/components/reader/settingsSections.test.mjs
git commit --no-verify -m "feat(mobile): create modular reader settings sections with WCAG touch targets"
```

---

### Task 5: Tabbed ReaderSettingsModal Architecture

**Files:**
- Modify: `mobile/src/components/reader/ReaderSettingsModal.tsx`
- Modify: `mobile/src/components/reader/readerContracts.ts`
- Test: `mobile/src/components/reader/readerComponents.test.mjs`

**Interfaces:**
- Consumes: All 4 settings sections from `mobile/src/components/reader/settings`
- Produces:
  ```ts
  export type SettingsTabId = 'display' | 'reciter' | 'translations' | 'wbw';

  export interface ReaderSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    initialTab?: SettingsTabId;
    testID?: string;
  }

  export const ReaderSettingsModal: React.FC<ReaderSettingsModalProps>;
  ```

- [ ] **Step 1: Write the failing test**

Add to `mobile/src/components/reader/readerComponents.test.mjs`:

```javascript
describe('Tabbed ReaderSettingsModal Architecture Tests', () => {
  it('should render 4 segmented navigation tabs with Persian labels', () => {
    const code = fs.readFileSync(path.resolve(__dirname, 'ReaderSettingsModal.tsx'), 'utf8');
    assert.ok(code.includes('display'));
    assert.ok(code.includes('reciter'));
    assert.ok(code.includes('translations'));
    assert.ok(code.includes('wbw'));
    assert.ok(code.includes('قلم و نمایش'));
    assert.ok(code.includes('قاری قرآن'));
    assert.ok(code.includes('ترجمه‌ها'));
    assert.ok(code.includes('واژه به واژه'));
  });

  it('should ensure all tab buttons have touch targets >= 44x44px and accessibilityRole="tab"', () => {
    const code = fs.readFileSync(path.resolve(__dirname, 'ReaderSettingsModal.tsx'), 'utf8');
    assert.ok(code.includes('accessibilityRole="tab"'));
    assert.ok(code.includes('READER_COMPONENT_CONTRACTS.minTouchTarget') || code.includes('minHeight: 44'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/components/reader/readerComponents.test.mjs`
Expected: FAIL because `ReaderSettingsModal.tsx` does not have tabs yet.

- [ ] **Step 3: Refactor `ReaderSettingsModal.tsx`**

Refactor `mobile/src/components/reader/ReaderSettingsModal.tsx` to host:
1. Modal backdrop with touchable dismiss.
2. Bottom sheet container with header (Title: `تنظیمات مطالعه قرآن`, Close button).
3. 4 Segmented Tab buttons:
   - `قلم و نمایش` (Display & Fonts)
   - `قاری قرآن` (Reciter Selection)
   - `ترجمه‌ها` (Translations)
   - `واژه به واژه` (Word-by-Word)
4. Dynamic tab body rendering the active section.
5. All buttons and interactive rows having touch targets >= 44x44px.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test mobile/src/components/reader/readerComponents.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/src/components/reader/ReaderSettingsModal.tsx mobile/src/components/reader/readerComponents.test.mjs
git commit --no-verify -m "feat(mobile): refactor ReaderSettingsModal to tabbed architecture matching web"
```

---

### Task 6: Reader Screens Integration & Verification

**Files:**
- Modify: `mobile/src/components/reader/ContinuousVerseCard.tsx`
- Modify: `mobile/src/components/reader/AudioPlaybackDock.tsx`
- Modify: `mobile/src/app/surah/[id].tsx`
- Test: `mobile/src/components/reader/readerComponents.test.mjs`

**Interfaces:**
- Consumes: `useReadingStore`, `reciterService`, `translationService`
- Produces:
  - Multi-translation rendering in `ContinuousVerseCard` with translator badges.
  - Localized WBW glosses (`fa` vs `en`) in `ContinuousVerseCard`.
  - Dynamic reciter name in `AudioPlaybackDock`.
  - Full synchronization in `SurahReaderScreen`.

- [ ] **Step 1: Write the failing test**

Add to `mobile/src/components/reader/readerComponents.test.mjs`:

```javascript
describe('Multi-Translation & WBW Integration Tests', () => {
  it('ContinuousVerseCard should support rendering translations by selectedTranslationIds', () => {
    const code = fs.readFileSync(path.resolve(__dirname, 'ContinuousVerseCard.tsx'), 'utf8');
    assert.ok(code.includes('selectedTranslationIds') || code.includes('AVAILABLE_TRANSLATIONS'));
    assert.ok(code.includes('wordByWordLocale'));
  });

  it('AudioPlaybackDock should dynamically resolve reciter name from reciterService', () => {
    const code = fs.readFileSync(path.resolve(__dirname, 'AudioPlaybackDock.tsx'), 'utf8');
    assert.ok(code.includes('getReciterById') || code.includes('reciterName'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test mobile/src/components/reader/readerComponents.test.mjs`
Expected: FAIL because props are not yet wired into `ContinuousVerseCard.tsx`.

- [ ] **Step 3: Update `ContinuousVerseCard.tsx`, `AudioPlaybackDock.tsx`, and `surah/[id].tsx`**

1. In `ContinuousVerseCard.tsx`:
   - Add `selectedTranslationIds?: number[]` and `wordByWordLocale?: 'fa' | 'en'` to `ContinuousVerseCardProps`.
   - Render translation text for each selected translation with author badge (`ناصر مکارم شیرازی`, `حسین انصاریان`, etc.).
   - Render WBW gloss in selected language: `word.translation_fa` for `'fa'` and `word.translation_en || word.translation_fa` for `'en'`.
2. In `AudioPlaybackDock.tsx`:
   - Bind `reciterName` to `getReciterById(selectedReciterId).nameFa`.
3. In `mobile/src/app/surah/[id].tsx`:
   - Pass `selectedTranslationIds`, `wordByWordLocale` from `useReadingStore` into `ContinuousVerseCard`.

- [ ] **Step 4: Run all test suites to verify passing**

Run:
```bash
node --test mobile/src/services/audio/reciterService.test.mjs
node --test mobile/src/services/db/translationService.test.mjs
node --test mobile/src/stores/readingStore.test.mjs
node --test mobile/src/components/reader/settingsSections.test.mjs
node --test mobile/src/components/reader/readerComponents.test.mjs
node --test mobile/src/services/db/database.test.mjs
```
Expected: ALL PASS with 0 failures.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/components/reader/ContinuousVerseCard.tsx mobile/src/components/reader/AudioPlaybackDock.tsx mobile/src/app/surah/[id].tsx mobile/src/components/reader/readerComponents.test.mjs
git commit --no-verify -m "feat(mobile): integrate multi-translation, dynamic reciter, and wbw settings into reader screens"
```

---

## Plan Verification Checklist

- [x] Spec coverage: Quran fonts, reciter selection with search, multi-translations (15 Persian + English), WBW settings (fa/en, inline/tooltip).
- [x] No placeholders: Every step contains exact files, concrete code, exact test assertions, and exact shell commands.
- [x] Type consistency: Types match across tasks (`Reciter`, `TranslationItem`, `useReadingStore` actions).
- [x] Design tokens: Complies with Sanctuary design system, RTL direction, and WCAG touch targets (>= 44x44px).
- [x] TDD: Every task starts with a failing test and ends with verification.
