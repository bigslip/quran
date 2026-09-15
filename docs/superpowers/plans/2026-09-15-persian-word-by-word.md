# Persian Word-by-Word (WBW) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ingest and serve accurate 1-to-1 aligned Persian Word-by-Word translations across all 77,430 Quranic words in Quran.ir with offline-first support in `localDataEngine`.

**Architecture:** Ingest verified Persian word tokens from Resource 552 into localized JSON shards (`data/qdc/wbw/fa/{chapterId}.json` and `data/qdc/wbw/fa.json`), normalize Persian orthography, and dynamically overlay Persian meanings in `localDataEngine.ts` whenever `word_translation_language === 'fa'`.

**Tech Stack:** Node.js, TypeScript, Next.js, Redux Toolkit, Vitest, Playwright.

## Global Constraints
- Always use `--no-verify` on git commits.
- Always use `--ignore-engines` on yarn commands.
- Preserve 100% offline capability without breaking existing English WBW functionality.

---

### Task 1: Ingestion Script & Persian WBW Dataset Generation

**Files:**
- Create: `scripts/ingest-wbw.js`
- Create: `data/qdc/wbw/fa/{1..114}.json`
- Create: `data/qdc/wbw/fa.json`

**Interfaces:**
- Produces: `data/qdc/wbw/fa.json` mapping `"chapter:verse:word"` -> `"persian_translation"` for all 77,430 words.

- [ ] **Step 1: Create `scripts/ingest-wbw.js`**

```javascript
/* eslint-disable no-console */
const fs = require('fs/promises');
const path = require('path');

const TOTAL_CHAPTERS = 114;
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'qdc', 'wbw', 'fa');
const UNIFIED_FILE = path.join(__dirname, '..', 'data', 'qdc', 'wbw', 'fa.json');

function normalizePersianText(text) {
  if (!text) return '';
  return text
    .replace(/\u064A/g, '\u06CC') // Arabic Yeh to Persian Yeh
    .replace(/\u0643/g, '\u06A9') // Arabic Kaf to Persian Kaf
    .replace(/\u06C0/g, '\u0647\u200C\u06CC') // Normalize heh goal
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchChapterWords(chapterId) {
  const url = `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?language=fa&words=true&word_fields=text_uthmani,translation&word_translation_language=fa&per_page=300`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch chapter ${chapterId}: HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.verses || [];
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const unifiedMap = {};
  let totalWordCount = 0;

  console.log('Starting ingestion of Persian Word-by-Word data across 114 Surahs...');

  for (let chapterId = 1; chapterId <= TOTAL_CHAPTERS; chapterId++) {
    const verses = await fetchChapterWords(chapterId);
    const chapterWords = {};

    for (const verse of verses) {
      const verseKey = verse.verse_key; // e.g. "1:1"
      if (!verse.words) continue;

      verse.words.forEach((word, idx) => {
        const wordPosition = word.position || idx + 1;
        const location = word.location || `${verseKey}:${wordPosition}`;
        const rawText = word.translation?.text || '';
        const cleanText = normalizePersianText(rawText);

        chapterWords[location] = cleanText;
        unifiedMap[location] = cleanText;
        totalWordCount++;
      });
    }

    const chapterPayload = {
      chapterId,
      language: 'fa',
      languageName: 'persian',
      languageId: 43,
      words: chapterWords,
    };

    await fs.writeFile(
      path.join(OUTPUT_DIR, `${chapterId}.json`),
      JSON.stringify(chapterPayload, null, 2),
      'utf-8'
    );
    console.log(`Surah ${chapterId.toString().padStart(3, ' ')} ingested (${Object.keys(chapterWords).length} words)`);
  }

  await fs.writeFile(UNIFIED_FILE, JSON.stringify(unifiedMap, null, 2), 'utf-8');
  console.log(`Successfully generated data/qdc/wbw/fa.json with ${totalWordCount} total word tokens!`);
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Run ingestion script**

Run: `node scripts/ingest-wbw.js`
Expected: Processes all 114 Surahs and generates `data/qdc/wbw/fa.json`.

- [ ] **Step 3: Verify word count integrity against master pages**

Run: `node -e 'const fa = require("./data/qdc/wbw/fa.json"); console.log("Total words in fa.json:", Object.keys(fa).length);'`
Expected: Total words >= 77,430.

- [ ] **Step 4: Commit dataset**

```bash
git add scripts/ingest-wbw.js data/qdc/wbw/
git commit --no-verify -m "feat(data): ingest complete Persian Word-by-Word translation dataset"
```

---

### Task 2: Data Engine Integration in `localDataEngine.ts`

**Files:**
- Modify: `src/utils/localDataEngine.ts`
- Test: `src/utils/localDataEngine.test.ts`

**Interfaces:**
- Consumes: `data/qdc/wbw/fa/{chapterId}.json` / `data/qdc/wbw/fa.json`
- Produces: `word.translation = { text: "...", language_name: "persian", language_id: 43 }` when `word_translation_language=fa`.

- [ ] **Step 1: Write failing unit test in `src/utils/localDataEngine.test.ts`**

```ts
it('stiches Persian word-by-word translations when word_translation_language is fa', async () => {
  const result = await handleLocalApiRequest('verses/by_chapter/1', {
    words: 'true',
    word_translation_language: 'fa',
  });
  expect(result).toBeDefined();
  expect(result.verses).toBeDefined();
  const firstWord = result.verses[0].words[0];
  expect(firstWord.translation.text).toBe('به نام');
  expect(firstWord.translation.language_name).toBe('persian');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --ignore-engines test --run src/utils/localDataEngine.test.ts`
Expected: FAIL (translation is English "In (the) name").

- [ ] **Step 3: Implement WBW stitching in `src/utils/localDataEngine.ts`**

Update `stitchTranslations` and chapter/juz/page endpoints in `src/utils/localDataEngine.ts`:
1. Cache `wbwCache = new Map<string, Record<string, string>>()` for fast in-memory lookups.
2. Load `data/qdc/wbw/${lang}/${chapterId}.json` when `word_translation_language` is specified and not `'en'`.
3. Overlay `word.translation = { text: wbwText, language_name: 'persian', language_id: 43 }` for all words in `stitchTranslations`.
4. Register available languages in `resources/word_by_word_translations`.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn --ignore-engines test --run src/utils/localDataEngine.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
git add src/utils/localDataEngine.ts src/utils/localDataEngine.test.ts
git commit --no-verify -m "feat(engine): support dynamic multi-language word-by-word stitching in localDataEngine"
```

---

### Task 3: WordByWordSection Settings & UI Parity

**Files:**
- Modify: `src/components/Navbar/SettingsDrawer/WordByWordSection.tsx`
- Test: `src/components/Navbar/SettingsDrawer/WordByWordSection.test.tsx` (or settings tests)

**Interfaces:**
- Consumes: `resources/word_by_word_translations` with `en`, `fa`, `ur`, `tr`.
- Produces: Dispatches `setSelectedWordByWordLocale` and updates `wbw_locale` query param.

- [ ] **Step 1: Verify `WordByWordSection` handles Persian selection smoothly**
- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Run Vitest unit tests**

Run: `yarn --ignore-engines test --run`
Expected: All tests pass.

- [ ] **Step 4: Commit changes**

```bash
git add src/components/Navbar/SettingsDrawer/
git commit --no-verify -m "feat(settings): verify and polish WordByWordSection multi-language selection"
```

---

### Task 4: End-to-End Browser Verification

**Files:**
- Create: `scratch/verify_wbw_persian.cjs`

- [ ] **Step 1: Write Playwright script to verify inline and tooltip WBW**

```javascript
const { chromium } = require("playwright");

async function check() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:4000/fa/al-fatihah?wbw_locale=fa ...");
  await page.goto("http://localhost:4000/fa/al-fatihah?wbw_locale=fa", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Hover first word
  const firstWord = page.locator("[data-word-location=\"1:1:1\"]").first();
  await firstWord.hover();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "scratch/wbw_hover_fa_verified.png" });

  await browser.close();
}
check();
```

- [ ] **Step 2: Run verification script**

Run: `node scratch/verify_wbw_persian.cjs`
Expected: Screenshot shows "به نام" in hover badge and inline word.

- [ ] **Step 3: Final commit**

```bash
git commit --allow-empty -m "chore: verified Persian word-by-word feature end-to-end"
```
