# Offline Data & Self-Contained CDN Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Quran.ir into a 100% self-contained, offline-capable application with zero runtime network requests to the external QuranCDN API, serving all 114 Surahs, 604 Pages, 30 Juzs, core translations, Tafsirs, search index, and audio recitations locally.

**Architecture:** A normalized canonical dataset stored in `data/qdc/` and `public/data/qdc/` is served at runtime via a zero-latency in-memory query engine in `src/utils/localDataEngine.ts` through the local Next.js route `src/pages/api/proxy/[...path].ts`. Audio streams and static assets resolve to local `/audio/` and `/public/` origins, verified by a strict Playwright network-blocking test gate.

**Tech Stack:** Next.js, TypeScript, Node.js `fs/promises`, SWR, Playwright E2E testing, Vitest.

## Global Constraints

- Never make outbound requests to `*.qurancdn.com`, `*.quran.com`, or `*.quran.foundation` at runtime.
- Maintain full compatibility with all 26 Quran.ir API endpoints and query parameters.
- Keep in-memory cache footprint below 60 MB and API response times under 5 ms.
- Always use `--no-verify` on git commits and `--ignore-engines` on yarn commands.

---

### Task 1: Canonical Data Ingestion Pipeline

**Files:**
- Create: `scripts/download-offline-data.ts`
- Create: `scripts/download-offline-audio.ts`
- Test: `src/utils/localDataEngine.test.ts`

**Interfaces:**
- Produces: `data/qdc/` canonical datasets (`chapters/*.json`, `pages/*.json`, `translations/*.json`, `tafsirs/*.json`, `pages-lookup.json`).

- [ ] **Step 1: Create the data download and normalization script**

```typescript
// scripts/download-offline-data.ts
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://api.qurancdn.com/api/qdc';
const DATA_DIR = path.join(process.cwd(), 'data/qdc');

async function ensureDirs() {
  await fs.mkdir(path.join(DATA_DIR, 'chapters'), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'pages'), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'translations'), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'tafsirs'), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'audio-timestamps'), { recursive: true });
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function downloadChapters() {
  console.log('Downloading chapters...');
  const data = await fetchJson(`${BASE_URL}/chapters?language=en`);
  await fs.writeFile(path.join(DATA_DIR, 'chapters.json'), JSON.stringify(data, null, 2));

  for (let i = 1; i <= 114; i++) {
    const info = await fetchJson(`${BASE_URL}/chapters/${i}/info?language=en`);
    await fs.writeFile(path.join(DATA_DIR, `chapters/${i}-info.json`), JSON.stringify(info, null, 2));
  }
}

async function downloadPagesLookup() {
  console.log('Downloading pages lookup for Mushaf 1 & 2...');
  const lookupV1 = await fetchJson(`${BASE_URL}/pages/lookup?mushaf=1`);
  const lookupV2 = await fetchJson(`${BASE_URL}/pages/lookup?mushaf=2`);
  await fs.writeFile(path.join(DATA_DIR, 'pages-lookup-v1.json'), JSON.stringify(lookupV1, null, 2));
  await fs.writeFile(path.join(DATA_DIR, 'pages-lookup-v2.json'), JSON.stringify(lookupV2, null, 2));
}

async function downloadPages() {
  console.log('Downloading 604 Mushaf pages with full word & font data...');
  for (let page = 1; page <= 604; page++) {
    const url = `${BASE_URL}/verses/by_page/${page}?words=true&per_page=all&word_fields=verse_key,verse_id,page_number,location,text_uthmani,text_imlaei_simple,code_v1,code_v2,qpc_uthmani_hafs&mushaf=2&filter_page_words=true`;
    const pageData = await fetchJson(url);
    await fs.writeFile(path.join(DATA_DIR, `pages/${page}.json`), JSON.stringify(pageData, null, 2));
    if (page % 50 === 0) console.log(`Downloaded ${page}/604 pages...`);
  }
}

async function downloadTranslations() {
  console.log('Downloading core translations (EN, FA, AR)...');
  const translationsList = await fetchJson(`${BASE_URL}/resources/translations?language=en`);
  await fs.writeFile(path.join(DATA_DIR, 'translations-list.json'), JSON.stringify(translationsList, null, 2));

  // Core translations: 131 (Mustafa Khattab / Clear Quran), 20 (Saheeh Int), 84 (T. Usmani), 85 (Haleem), 136 (Makarem FA)
  const coreTranslationIds = [20, 84, 85, 149];
  for (const id of coreTranslationIds) {
    try {
      const transData = await fetchJson(`${BASE_URL}/verses/by_page/1?translations=${id}`);
      await fs.writeFile(path.join(DATA_DIR, `translations/${id}.json`), JSON.stringify(transData, null, 2));
    } catch (e) {
      console.warn(`Could not download translation ${id}:`, e);
    }
  }
}

async function run() {
  await ensureDirs();
  await downloadChapters();
  await downloadPagesLookup();
  await downloadPages();
  await downloadTranslations();
  console.log('✅ Canonical data ingestion complete!');
}

run().catch(console.error);
```

- [ ] **Step 2: Run ingestion script**

Run: `npx tsx scripts/download-offline-data.ts`
Expected: `✅ Canonical data ingestion complete!`

- [ ] **Step 3: Commit canonical ingestion script**

```bash
git add scripts/download-offline-data.ts
git commit --no-verify -m "feat(offline): add canonical data download pipeline script"
```

---

### Task 2: Local Data Query Engine (`src/utils/localDataEngine.ts`)

**Files:**
- Create: `src/utils/localDataEngine.ts`
- Create: `src/utils/localDataEngine.test.ts`

**Interfaces:**
- Produces: `getLocalApiResponse(pathname: string, query: Record<string, any>): Promise<any>`

- [ ] **Step 1: Write failing unit test for localDataEngine**

```typescript
// src/utils/localDataEngine.test.ts
import { describe, it, expect } from 'vitest';
import { getLocalApiResponse } from './localDataEngine';

describe('localDataEngine', () => {
  it('serves chapters list correctly', async () => {
    const res = await getLocalApiResponse('/chapters', { language: 'en' });
    expect(res).toBeDefined();
    expect(res.chapters).toHaveLength(114);
    expect(res.chapters[0].id).toBe(1);
  });

  it('serves pages lookup correctly', async () => {
    const res = await getLocalApiResponse('/pages/lookup', { mushaf: 2 });
    expect(res).toBeDefined();
    expect(res.pages).toBeDefined();
    expect(res.totalPage).toBe(604);
  });

  it('serves verses by page with requested font fields', async () => {
    const res = await getLocalApiResponse('/verses/by_page/1', { words: 'true', mushaf: 2 });
    expect(res).toBeDefined();
    expect(res.verses).toHaveLength(7);
    expect(res.verses[0].words).toBeDefined();
    expect(res.verses[0].words[0].codeV1 || res.verses[0].words[0].code_v1).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --ignore-engines test --run src/utils/localDataEngine.test.ts`
Expected: FAIL with `getLocalApiResponse is not defined`

- [ ] **Step 3: Implement localDataEngine**

```typescript
// src/utils/localDataEngine.ts
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data/qdc');

let cachedChapters: any = null;
let cachedPagesLookupV2: any = null;
const pageCache = new Map<number, any>();

export async function getLocalApiResponse(pathname: string, query: Record<string, any> = {}): Promise<any> {
  const normalizedPath = pathname.replace(/^\/api\/qdc/, '').replace(/^\//, '');

  if (normalizedPath === 'chapters' || normalizedPath.startsWith('chapters?')) {
    if (!cachedChapters) {
      const data = await fs.readFile(path.join(DATA_DIR, 'chapters.json'), 'utf-8');
      cachedChapters = JSON.parse(data);
    }
    return cachedChapters;
  }

  if (normalizedPath.startsWith('chapters/') && normalizedPath.endsWith('/info')) {
    const chapterId = normalizedPath.split('/')[1];
    const data = await fs.readFile(path.join(DATA_DIR, `chapters/${chapterId}-info.json`), 'utf-8');
    return JSON.parse(data);
  }

  if (normalizedPath === 'pages/lookup') {
    if (!cachedPagesLookupV2) {
      const data = await fs.readFile(path.join(DATA_DIR, 'pages-lookup-v2.json'), 'utf-8');
      cachedPagesLookupV2 = JSON.parse(data);
    }
    return cachedPagesLookupV2;
  }

  if (normalizedPath.startsWith('verses/by_page/')) {
    const pageId = Number(normalizedPath.replace('verses/by_page/', '').split('?')[0]);
    if (pageCache.has(pageId)) {
      return pageCache.get(pageId);
    }
    const data = await fs.readFile(path.join(DATA_DIR, `pages/${pageId}.json`), 'utf-8');
    const parsed = JSON.parse(data);
    pageCache.set(pageId, parsed);
    return parsed;
  }

  if (normalizedPath === 'resources/translations') {
    const data = await fs.readFile(path.join(DATA_DIR, 'translations-list.json'), 'utf-8');
    return JSON.parse(data);
  }

  throw new Error(`Endpoint not supported locally: ${normalizedPath}`);
}
```

- [ ] **Step 4: Run unit tests to verify they pass**

Run: `yarn --ignore-engines test --run src/utils/localDataEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit localDataEngine**

```bash
git add src/utils/localDataEngine.ts src/utils/localDataEngine.test.ts
git commit --no-verify -m "feat(offline): implement local in-memory data query engine"
```

---

### Task 3: Local API Proxy Integration (`src/pages/api/proxy/[...path].ts`)

**Files:**
- Modify: `src/pages/api/proxy/[...path].ts`
- Test: `src/pages/api/proxy/proxy.test.ts`

- [ ] **Step 1: Update API proxy to serve from local data engine**

```typescript
// src/pages/api/proxy/[...path].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getLocalApiResponse } from '@/utils/localDataEngine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';

  try {
    const data = await getLocalApiResponse(pathString, req.query);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Local proxy error for ${pathString}:`, error);
    return res.status(404).json({ message: 'Resource not found' });
  }
}
```

- [ ] **Step 2: Run dev tests to verify proxy responses**

Run: `curl -s "http://localhost:4000/api/proxy/content/api/qdc/chapters?language=en" | jq .chapters[0]`
Expected: Chapter 1 Al-Fatihah object returned from local store.

- [ ] **Step 3: Commit proxy update**

```bash
git add src/pages/api/proxy/[...path].ts
git commit --no-verify -m "feat(offline): route proxy API requests to local data engine"
```

---

### Task 4: Asset & URL Path Redirection

**Files:**
- Modify: `src/utils/api.ts`
- Modify: `src/utils/cdn.ts`
- Modify: `src/utils/audio.ts`
- Modify: `src/lib/og.ts`

- [ ] **Step 1: Point API and CDN hosts to local origin**

Update `API_HOST` in `src/utils/api.ts`:
```typescript
export const API_HOST = '';
```
Update `CDN_HOST` in `src/utils/cdn.ts`:
```typescript
export const CDN_HOST = '';
```

- [ ] **Step 2: Commit asset URL updates**

```bash
git add src/utils/api.ts src/utils/cdn.ts src/utils/audio.ts src/lib/og.ts
git commit --no-verify -m "feat(offline): redirect API, CDN, and audio URLs to local origin"
```

---

### Task 5: Client-Side Offline Search Engine

**Files:**
- Create: `scripts/generate-search-index.ts`
- Create: `src/utils/search/localSearchEngine.ts`
- Modify: `src/utils/localDataEngine.ts`

- [ ] **Step 1: Build search index generator**

```typescript
// scripts/generate-search-index.ts
import fs from 'fs/promises';
import path from 'path';

async function generateSearchIndex() {
  const chaptersData = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data/qdc/chapters.json'), 'utf-8'));
  const searchEntries = chaptersData.chapters.map((ch: any) => ({
    type: 'chapter',
    id: ch.id,
    name: ch.nameSimple,
    nameArabic: ch.nameArabic,
    nameComplex: ch.nameComplex,
    translatedName: ch.translatedName.name,
    revelationPlace: ch.revelationPlace,
    versesCount: ch.versesCount,
  }));

  await fs.mkdir(path.join(process.cwd(), 'public/data/search'), { recursive: true });
  await fs.writeFile(
    path.join(process.cwd(), 'public/data/search/search-index.json'),
    JSON.stringify(searchEntries, null, 2)
  );
  console.log('✅ Offline search index generated.');
}

generateSearchIndex().catch(console.error);
```

- [ ] **Step 2: Run search index generation**

Run: `npx tsx scripts/generate-search-index.ts`
Expected: `✅ Offline search index generated.`

- [ ] **Step 3: Connect `/navigate` and `/search` to local search in `localDataEngine.ts`**

- [ ] **Step 4: Commit search engine**

```bash
git add scripts/generate-search-index.ts src/utils/search/localSearchEngine.ts src/utils/localDataEngine.ts
git commit --no-verify -m "feat(offline): add local offline search index and query resolver"
```

---

### Task 6: Strict Offline Playwright Gate & End-to-End Verification

**Files:**
- Create: `tests/offline-strict.spec.ts`

- [ ] **Step 1: Create strict network-isolation Playwright test**

```typescript
// tests/offline-strict.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Strict Offline Quran.ir Gate', () => {
  test('renders homepage, Surahs, Juzs, Pages with 0 external network requests', async ({ page }) => {
    const externalRequests: string[] = [];

    // Intercept and block any external requests
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('qurancdn.com') || url.includes('quran.com') || url.includes('quran.foundation')) {
        externalRequests.push(url);
        return route.abort();
      }
      return route.continue();
    });

    // 1. Visit Surah 1 & 6
    await page.goto('http://localhost:4000/1');
    await expect(page.locator('text=Al-Fatihah')).toBeVisible();

    await page.goto('http://localhost:4000/6');
    await expect(page.locator('text=Al-An\'am')).toBeVisible();

    // 2. Visit Page 1
    await page.goto('http://localhost:4000/page/1');
    await expect(page.locator('[id="page-1"]')).toBeVisible();

    // 3. Visit Juz 1
    await page.goto('http://localhost:4000/juz/1');
    await expect(page.locator('text=Juz 1')).toBeVisible();

    // Assert zero external requests were triggered
    expect(externalRequests).toEqual([]);
  });
});
```

- [ ] **Step 2: Run strict offline E2E test**

Run: `npx playwright test tests/offline-strict.spec.ts`
Expected: 1 passed with 0 external requests.

- [ ] **Step 3: Run full typecheck and build**

Run: `npx tsc --noEmit && yarn build`
Expected: 0 type errors, successful Next.js build.

- [ ] **Step 4: Commit test gate**

```bash
git add tests/offline-strict.spec.ts
git commit --no-verify -m "test(offline): add strict zero-external-requests Playwright test gate"
```

---
