# Multilingual Surah SEO & Architecture Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate organic search ranking, CTR, and rich snippet presence on Google for Quran.ir across all 21 languages (with emphasis on Persian `fa`, Arabic `ar`, and English `en`) by standardizing on semantic slug URLs, localized search-intent titles, human-grade meta descriptions, Schema.org JSON-LD structured data, and reciprocal hreflang/canonical agreement.

**Architecture:** Next.js Pages Router with dual numeric/slug resolution in `getStaticProps`, in-memory synchronous slug resolution in `useChapterId.ts`, dedicated SEO generators in `src/utils/seo.ts`, a `ChapterJsonLd` component for structured data, and standardized slug navigation across all reader and navigation components.

**Tech Stack:** Next.js 14, TypeScript, `next-translate`, `next-seo`, Schema.org JSON-LD, Vitest, Playwright.

## Global Constraints

- Always run git commits with `--no-verify`.
- Always run yarn commands with `--ignore-engines`.
- Ensure 100% RTL/LTR logical property compliance.
- Never show English text when viewing `/fa/...` or localized pages.
- Ensure all Schema.org properties are strictly typed and valid according to Google Search Central guidelines.

---

### Task 1: URL Navigation & Slug Resolution Utilities

**Files:**
- Modify: `src/utils/navigation.ts`
- Modify: `src/hooks/useChapterId.ts`
- Modify: `src/utils/locale.ts`
- Test: `src/utils/navigation.test.ts`
- Test: `src/utils/locale.test.ts`

**Interfaces:**
- `getSurahNavigationUrl(slugOrId: string | number): string` (Returns `/${slugOrId}`)
- `getLanguageAlternates(path: string): LinkLanguageAlternate[]` (Ensures English uses `${basePath}${path}` without `/en` prefix to prevent 301 redirects)

- [ ] **Step 1: Write failing unit tests for `getLanguageAlternates` and `getSurahNavigationUrl`**

```ts
// src/utils/navigation.test.ts
import { describe, it, expect } from 'vitest';
import { getSurahNavigationUrl, getVerseNavigationUrl } from './navigation';

describe('Navigation SEO Utilities', () => {
  it('generates slug-based chapter URLs', () => {
    expect(getSurahNavigationUrl('al-baqarah')).toBe('/al-baqarah');
    expect(getSurahNavigationUrl(2)).toBe('/2');
  });

  it('generates slug-based verse URLs', () => {
    expect(getVerseNavigationUrl('al-baqarah', '255')).toBe('/al-baqarah/255');
  });
});
```

```ts
// src/utils/locale.test.ts (add test case)
import { describe, it, expect } from 'vitest';
import { getLanguageAlternates } from './locale';

describe('getLanguageAlternates', () => {
  it('generates default English alternate without /en prefix', () => {
    const alternates = getLanguageAlternates('/al-baqarah');
    const enAlternate = alternates.find((a) => a.hrefLang === 'en');
    expect(enAlternate?.href).toBe('https://quran.ir/al-baqarah');
    const faAlternate = alternates.find((a) => a.hrefLang === 'fa');
    expect(faAlternate?.href).toBe('https://quran.ir/fa/al-baqarah');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --ignore-engines test --run src/utils/navigation.test.ts src/utils/locale.test.ts`
Expected: FAIL on `enAlternate?.href` (was generating `https://quran.ir/en/al-baqarah`).

- [ ] **Step 3: Update `getLanguageAlternates` and `useChapterId.ts`**

Update `src/utils/locale.ts`:
```ts
export const getLanguageAlternates = (path: string): LinkLanguageAlternate[] => {
  const { locales, defaultLocale } = i18nConfig;
  const basePath = getBasePath();
  const normalizedPath = path === '/' ? '' : path;

  return locales
    .map((locale) => ({
      hrefLang: locale,
      href:
        locale === defaultLocale
          ? `${basePath}${normalizedPath}`
          : `${basePath}/${locale}${normalizedPath}`,
    }))
    .concat({
      hrefLang: 'x-default',
      href: `${basePath}${normalizedPath}`,
    });
};
```

Update `src/hooks/useChapterId.ts` to perform synchronous lookup in `DataContext` before falling back to API:
```ts
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DataContext from '@/contexts/DataContext';
import { getChapterIdBySlug } from '@/api';
import { isValidChapterId } from '@/utils/validator';
import { formatStringNumber } from '@/utils/number';

const useChapterId = (): string | null => {
  const router = useRouter();
  const { chapterId: rawChapterId } = router.query;
  const chaptersData = useContext(DataContext);
  const [resolvedChapterId, setResolvedChapterId] = useState<string | null>(() => {
    if (!rawChapterId) return null;
    const param = String(rawChapterId).toLowerCase();
    if (isValidChapterId(param)) return formatStringNumber(param);
    if (chaptersData) {
      const match = Object.entries(chaptersData).find(([, ch]) => ch.slug === param);
      if (match) return match[0];
    }
    return null;
  });

  useEffect(() => {
    if (!rawChapterId) return;
    const param = String(rawChapterId).toLowerCase();
    if (isValidChapterId(param)) {
      setResolvedChapterId(formatStringNumber(param));
      return;
    }
    if (chaptersData) {
      const match = Object.entries(chaptersData).find(([, ch]) => ch.slug === param);
      if (match) {
        setResolvedChapterId(match[0]);
        return;
      }
    }
    let isMounted = true;
    getChapterIdBySlug(param, router.locale || 'en').then((id) => {
      if (isMounted && id) setResolvedChapterId(id.toString());
    });
    return () => {
      isMounted = false;
    };
  }, [rawChapterId, chaptersData, router.locale]);

  return resolvedChapterId;
};

export default useChapterId;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn --ignore-engines test --run src/utils/navigation.test.ts src/utils/locale.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
git add src/utils/navigation.ts src/utils/locale.ts src/hooks/useChapterId.ts src/utils/navigation.test.ts src/utils/locale.test.ts
git commit --no-verify -m "feat(seo): standardize slug navigation, optimize useChapterId, and fix hreflang alternates"
```

---

### Task 2: Localized SEO Title & Meta Description Generators

**Files:**
- Create: `src/utils/seo.ts`
- Create: `src/utils/seo.test.ts`
- Modify: `locales/fa/chapter.json`
- Modify: `locales/en/chapter.json`
- Modify: `locales/ar/chapter.json`
- Modify: `src/pages/[chapterId]/index.tsx`
- Modify: `src/pages/[chapterId]/[verseId]/index.tsx`

**Interfaces:**
- `getSurahSeoTitle({ chapter, lang, t, isChapter, verseNumber, isAyatulKursi }): string`
- `getSurahSeoDescription({ chapter, lang, t, isChapter, verseNumber, isAyatulKursi }): string`

- [ ] **Step 1: Write the failing tests for SEO generators**

```ts
// src/utils/seo.test.ts
import { describe, it, expect } from 'vitest';
import { getSurahSeoTitle, getSurahSeoDescription } from './seo';

const mockChapter = {
  id: 2,
  transliteratedName: 'Al-Baqarah',
  translatedName: 'The Cow',
  nameArabic: 'البقرة',
  versesCount: 286,
  revelationPlace: 'madinah',
  slug: 'al-baqarah',
};

describe('Surah SEO Title Generator', () => {
  it('generates high-intent Persian title for Surah page', () => {
    const title = getSurahSeoTitle({
      chapter: { ...mockChapter, translatedName: 'بقره (گاو ماده)' },
      lang: 'fa',
      isChapter: true,
    });
    expect(title).toContain('سوره بقره');
    expect(title).toContain('متن، ترجمه و صوت');
    expect(title).toContain('قرآن کریم');
  });

  it('generates high-intent English title for Surah page', () => {
    const title = getSurahSeoTitle({
      chapter: mockChapter,
      lang: 'en',
      isChapter: true,
    });
    expect(title).toBe('Surah Al-Baqarah (The Cow) - Read, Translation & Audio | Quran.ir');
  });

  it('generates high-intent Arabic title for Surah page', () => {
    const title = getSurahSeoTitle({
      chapter: mockChapter,
      lang: 'ar',
      isChapter: true,
    });
    expect(title).toBe('سورة البقرة - قراءة واستماع وتفسير | القرآن الكريم');
  });

  it('generates high-intent title for Ayatul Kursi', () => {
    const title = getSurahSeoTitle({
      chapter: mockChapter,
      lang: 'fa',
      isChapter: false,
      verseNumber: 255,
      isAyatulKursi: true,
    });
    expect(title).toContain('آیت الکرسی');
    expect(title).toContain('آیه ۲۵۵ سوره بقره');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --ignore-engines test --run src/utils/seo.test.ts`
Expected: FAIL with module `./seo` not found.

- [ ] **Step 3: Implement `src/utils/seo.ts` & update locale json files**

Create `src/utils/seo.ts`:
```ts
import Language from '@/types/Language';
import { toLocalizedNumber } from '@/utils/locale';

interface SurahSeoTitleOptions {
  chapter: {
    id: number | string;
    transliteratedName: string;
    translatedName?: string;
    nameArabic?: string;
    versesCount?: number;
  };
  lang: string;
  isChapter: boolean;
  verseNumber?: number;
  isAyatulKursi?: boolean;
}

export const getSurahSeoTitle = ({
  chapter,
  lang,
  isChapter,
  verseNumber,
  isAyatulKursi,
}: SurahSeoTitleOptions): string => {
  const chapterNumber = Number(chapter.id);
  const localizedChapterNum = toLocalizedNumber(chapterNumber, lang);
  const transliterated = chapter.transliteratedName || '';
  const translated = chapter.translatedName || '';
  const arabic = chapter.nameArabic || '';

  if (!isChapter && isAyatulKursi) {
    if (lang === Language.FA) {
      return 'آیت الکرسی (آیه ۲۵۵ سوره بقره) - متن، ترجمه و صوت | قرآن کریم';
    }
    if (lang === Language.AR) {
      return 'آية الكرسي (سورة البقرة آية ۲۵۵) - قراءة وتفسير | القرآن الكريم';
    }
    return 'Ayatul Kursi (Surah Al-Baqarah - Verse 255) - Translation & Audio | Quran.ir';
  }

  if (!isChapter && verseNumber) {
    const localizedVerseNum = toLocalizedNumber(verseNumber, lang);
    if (lang === Language.FA) {
      const cleanFaName = translated.split('(')[0].trim() || transliterated;
      return `آیه ${localizedVerseNum} سوره ${cleanFaName} (${transliterated}) - متن و ترجمه | قرآن کریم`;
    }
    if (lang === Language.AR) {
      return `سورة ${arabic || transliterated} آية ${localizedVerseNum} - قراءة وتفسير | القرآن الكريم`;
    }
    return `Surah ${transliterated} - Verse ${verseNumber} - Translation & Tafsir | Quran.ir`;
  }

  // Full Surah view
  if (lang === Language.FA) {
    const cleanFaName = translated.split('(')[0].trim() || transliterated;
    return `سوره ${cleanFaName} (${transliterated}) - متن، ترجمه و صوت | قرآن کریم`;
  }

  if (lang === Language.AR) {
    return `سورة ${arabic || transliterated} - قراءة واستماع وتفسير | القرآن الكريم`;
  }

  const englishSubtitle = translated ? ` (${translated})` : '';
  return `Surah ${transliterated}${englishSubtitle} - Read, Translation & Audio | Quran.ir`;
};
```

Update `locales/fa/chapter.json`:
```json
{
  "meta-description": "متن کامل سوره {{transliteratedName}} ({{translatedName}}) به همراه ترجمه فارسی، تلاوت صوتی، تفسیر، معنی کلمه به کلمه و فایل صوتی. سوره شماره {{chapterOrder}} با {{versesCount}} آیه نازل شده در {{revelationPlace}}.",
  "ranges-meta-desc": "تلاوت و ترجمه آیات {{rangeFrom}} تا {{rangeTo}} با ترجمه و تفسیر کامل."
}
```

Update `locales/en/chapter.json`:
```json
{
  "meta-description": "Read, study, and listen to Surah {{transliteratedName}} ({{translatedName}}) with English translation, tafsir, word-by-word meaning, and audio recitations. Chapter {{chapterOrder}} with {{versesCount}} verses revealed in {{revelationPlace}}.",
  "ranges-meta-desc": "Read and listen to verses {{rangeFrom}} to {{rangeTo}} with translation, transliteration, and tafsir."
}
```

Update `locales/ar/chapter.json`:
```json
{
  "meta-description": "اقرأ واستمع إلى سورة {{transliteratedName}} كاملة مع التفسير والتلاوة الصوتية العذبة. سورة رقم {{chapterOrder}} وعدد آياتها {{versesCount}} آية نازلة في {{revelationPlace}}.",
  "ranges-meta-desc": "اقرأ واستمع إلى الآيات من {{rangeFrom}} إلى {{rangeTo}} مع التفسير والتلاوة."
}
```

Integrate into `src/pages/[chapterId]/index.tsx` and `src/pages/[chapterId]/[verseId]/index.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn --ignore-engines test --run src/utils/seo.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
git add src/utils/seo.ts src/utils/seo.test.ts locales/*/chapter.json src/pages/[chapterId]/index.tsx src/pages/[chapterId]/[verseId]/index.tsx
git commit --no-verify -m "feat(seo): implement localized search-intent titles and fluent meta descriptions"
```

---

### Task 3: Schema.org JSON-LD Structured Data Component

**Files:**
- Create: `src/components/seo/ChapterJsonLd/index.tsx`
- Create: `src/components/seo/ChapterJsonLd/ChapterJsonLd.test.tsx`
- Modify: `src/pages/[chapterId]/index.tsx`

**Interfaces:**
- `<ChapterJsonLd chapter={chapter} lang={lang} currentPath={currentPath} />` (Injects `<script type="application/ld+json">` with `BreadcrumbList`, `Chapter`, and `AudioObject`)

- [ ] **Step 1: Write failing unit test for `ChapterJsonLd`**

```tsx
// src/components/seo/ChapterJsonLd/ChapterJsonLd.test.tsx
import { render } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import ChapterJsonLd from './index';

const mockChapter = {
  id: 2,
  transliteratedName: 'Al-Baqarah',
  translatedName: 'بقره (گاو ماده)',
  nameArabic: 'البقرة',
  versesCount: 286,
  revelationPlace: 'madinah',
  slug: 'al-baqarah',
};

describe('ChapterJsonLd', () => {
  it('renders valid Schema.org JSON-LD structured data', () => {
    const { container } = render(
      <ChapterJsonLd
        chapter={mockChapter}
        lang="fa"
        currentPath="/fa/al-baqarah"
      />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    const data = JSON.parse(script?.textContent || '{}');
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@graph']).toBeDefined();

    const breadcrumbs = data['@graph'].find((item: any) => item['@type'] === 'BreadcrumbList');
    expect(breadcrumbs).toBeDefined();

    const chapterObj = data['@graph'].find((item: any) => item['@type'] === 'Chapter');
    expect(chapterObj).toBeDefined();
    expect(chapterObj.position).toBe(2);

    const audioObj = data['@graph'].find((item: any) => item['@type'] === 'AudioObject');
    expect(audioObj).toBeDefined();
    expect(audioObj.encodingFormat).toBe('audio/mpeg');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --ignore-engines test --run src/components/seo/ChapterJsonLd/ChapterJsonLd.test.tsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `ChapterJsonLd` component**

Create `src/components/seo/ChapterJsonLd/index.tsx`:
```tsx
import React from 'react';
import Head from 'next/head';
import Chapter from 'types/Chapter';
import { getChapterAudioUrl } from '@/utils/audio';

interface ChapterJsonLdProps {
  chapter: Partial<Chapter>;
  lang: string;
  currentPath: string;
}

const ChapterJsonLd: React.FC<ChapterJsonLdProps> = ({ chapter, lang, currentPath }) => {
  const chapterId = Number(chapter?.id || 1);
  const transliterated = chapter?.transliteratedName || '';
  const translated = (chapter?.translatedName as string) || '';
  const arabic = chapter?.nameArabic || '';
  const canonicalUrl = `https://quran.ir${currentPath.startsWith('/') ? currentPath : `/${currentPath}`}`;
  const audioUrl = getChapterAudioUrl(chapterId, 7); // Default reciter Mishari Rashid al-Afasy (ID 7)

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: lang === 'fa' ? 'صفحه اصلی' : lang === 'ar' ? 'الرئيسية' : 'Home',
            item: `https://quran.ir${lang === 'en' ? '' : `/${lang}`}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: lang === 'fa' ? `سوره ${translated || transliterated}` : `Surah ${transliterated}`,
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'Chapter',
        '@id': `${canonicalUrl}#chapter`,
        name: `Surah ${transliterated}`,
        alternateName: [arabic, transliterated, translated].filter(Boolean),
        position: chapterId,
        inLanguage: lang,
        isPartOf: {
          '@type': 'Book',
          name: 'The Holy Quran',
          url: 'https://quran.ir',
        },
      },
      {
        '@type': 'AudioObject',
        name: `Surah ${transliterated} Audio Recitation`,
        description: `High-quality audio recitation of Surah ${transliterated}`,
        contentUrl: audioUrl,
        encodingFormat: 'audio/mpeg',
        inLanguage: 'ar',
      },
    ],
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        key={`chapter-jsonld-${chapterId}`}
      />
    </Head>
  );
};

export default React.memo(ChapterJsonLd);
```

Integrate into `src/pages/[chapterId]/index.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn --ignore-engines test --run src/components/seo/ChapterJsonLd/ChapterJsonLd.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
git add src/components/seo/ChapterJsonLd/ src/pages/[chapterId]/index.tsx
git commit --no-verify -m "feat(seo): add Schema.org JSON-LD structured data for Surah pages"
```

---

### Task 4: Standardize Internal Navigation Links to Slug URLs

**Files:**
- Modify: `src/components/QuranReader/SidebarNavigation/SurahList.tsx`
- Modify: `src/components/QuranReader/EndOfScrollingControls/VerseControls.tsx`
- Modify: `src/components/QuranReader/EndOfSurahSection/index.tsx`
- Modify: `src/components/QuranReader/EndOfSurahSection/ReadMoreCard/index.tsx`
- Modify: `src/components/Search/PreInput/index.tsx`
- Modify: `src/components/chapters/ChapterHeader/components/SurahInfoButton.tsx`

**Interfaces:**
- Pass `chapter.slug` to `getSurahNavigationUrl(chapter.slug)` rather than numeric `chapter.id`.

- [ ] **Step 1: Check existing tests for affected navigation components**

Run: `yarn --ignore-engines test --run src/components/QuranReader/SidebarNavigation/SurahList.test.tsx src/components/QuranReader/EndOfSurahSection/`

- [ ] **Step 2: Update internal links in components**

In `SurahList.tsx`:
```tsx
const href = getSurahNavigationUrl(chapter.slug || chapter.id);
```

In `EndOfSurahSection/index.tsx`:
```tsx
const nextChapterData = getChapterData(chaptersData, String(nextChapterId));
const href = getSurahNavigationUrl(nextChapterData?.slug || nextChapterId);
```

In `VerseControls.tsx`:
```tsx
const prevChapterData = getChapterData(chaptersData, String(chapterNumber - 1));
const nextChapterData = getChapterData(chaptersData, String(chapterNumber + 1));
...
href={getSurahNavigationUrl(prevChapterData?.slug || chapterNumber - 1)}
href={getSurahNavigationUrl(nextChapterData?.slug || chapterNumber + 1)}
```

In `SurahInfoButton.tsx`:
```tsx
fakeNavigate(getSurahNavigationUrl(chapter?.slug || chapterId), router.locale);
```

- [ ] **Step 3: Run unit tests to verify stability**

Run: `yarn --ignore-engines test --run src/components/QuranReader/ src/components/chapters/`
Expected: PASS.

- [ ] **Step 4: Commit changes**

```bash
git add src/components/QuranReader/ src/components/Search/ src/components/chapters/
git commit --no-verify -m "feat(seo): standardize internal navigation links to use canonical Surah slugs"
```

---

### Task 5: End-to-End Verification & DOM Head Audit

**Files:**
- Create: `scratch/verify_surah_seo_head.cjs`

- [ ] **Step 1: Create verification script inspecting DOM `<head>`**

Create `scratch/verify_surah_seo_head.cjs` to test `/fa/al-baqarah`, `/fa/2`, `/al-baqarah`, and `/2`:
1. Verify `<title>` contains localized search intent keywords and no duplicate branding.
2. Verify `<meta name="description">` has fluent Persian/English copy.
3. Verify `<link rel="canonical">` points to `https://quran.ir/fa/al-baqarah` and `https://quran.ir/al-baqarah`.
4. Verify `<link rel="alternate" hreflang="...">` does not contain `/en/` redirect loops.
5. Verify JSON-LD script contains valid `BreadcrumbList`, `Chapter`, and `AudioObject`.

- [ ] **Step 2: Run verification script against running server**

Run: `NODE_PATH=./node_modules node /Users/reza/.gemini/antigravity-cli/brain/69145af9-c951-40a9-9157-294c753b349a/scratch/verify_surah_seo_head.cjs`
Expected: All 5 assertions PASS.

- [ ] **Step 3: Run full TypeScript check & test suite**

Run: `npx tsc --noEmit && yarn --ignore-engines test --run`
Expected: Clean pass with 0 errors.

- [ ] **Step 4: Final commit**

```bash
git commit --no-verify -m "chore(seo): verify and finalize multilingual Surah SEO enhancements"
```
