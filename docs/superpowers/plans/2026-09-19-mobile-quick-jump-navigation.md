# "Go To" Quick Jump Navigation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a comprehensive, universal "Go To" Quick Jump Navigation system across the
Quran.ir mobile app, enabling readers to jump instantaneously to any Surah:Ayah, Page (1–604), or
Juz (1–30) with visual destination preview and smooth in-place or cross-chapter transitions.

**Architecture:** A lightweight SQLite resolution engine (`quickJumpService.ts`) resolves
destinations in under 1ms with Node.js in-memory test compatibility and Persian/Arabic numeral
parsing. An interactive visual modal (`QuickJumpModal.tsx`) provides 3 segmented sub-tabs
(`SurahAyahJumpTab`, `PageJumpTab`, `JuzJumpTab`) with real-time Persian destination preview badges,
context-aware initial positions, and keyboard avoidance. Tapping the reader top bar or jump buttons
executes in-place auto-scrolling with a 2.5-second golden aura glow (same Surah) or router
deep-linking (different Surah).

**Tech Stack:** React Native 0.86, Expo SDK 57, Expo Router, Expo SQLite, Lucide React Native,
Node.js Test Runner.

## Global Constraints

- **Language:** All user communications, commit messages, and PR documentation must strictly be in
  **English**.
- **Persian Typography & Numerals:** All UI-facing labels, tags, digits, and milestone texts must
  use authentic Persian typography (`toPersianDigits`, Vazirmatn). User numeric inputs must support
  both Western (`0-9`) and Eastern/Persian (`۰-۹` / `٠-٩`) numerals via `parseLocalizedNumber()`.
- **Zero Native Failure:** All SQLite operations must support Node.js in-memory fallbacks via
  `adaptDatabase()` and `setQuickJumpDatabase()` so `yarn --cwd mobile test` runs cleanly in pure
  Node.js environments.
- **WCAG Compliance:** All interactive touch targets must be at least 44x44 points (`minHeight: 44`,
  `minWidth: 44`, or `hitSlop`).
- **Zero Slider Dependency:** Do not import `@react-native-community/slider` as it is not installed.
  Use Stepper controls (`-۱۰`, `-۱`, `+۱`, `+۱۰`), direct Persian numeric inputs, and milestone
  chips.
- **Type Safety:** `yarn --cwd mobile typecheck` must pass with 0 errors after each task.

---

### Task 1: Quick Jump Contracts & Service Layer (`quickJumpContracts.ts`, `quickJumpService.ts`)

**Files:**

- Create: `mobile/src/services/db/quickJumpContracts.ts`
- Create: `mobile/src/services/db/quickJumpService.ts`
- Test: `mobile/src/services/db/quickJumpService.test.mjs`

**Interfaces:**

- Produces:

  - `JumpDestination`, `JuzCardInfo` types
  - `toAsciiDigits(str: string): string`
  - `parseLocalizedNumber(str: string): number`
  - `setQuickJumpDatabase(db: SQLiteLikeDb | any | null): void`
  - `resolveAyahDestination(chapterId: number, verseNumber: number): Promise<JumpDestination>`
    (clamped to `1..chapter.verses_count`)
  - `resolvePageDestination(pageNumber: number): Promise<JumpDestination>` (clamped to `1..604`)
  - `resolveJuzDestination(juzNumber: number): Promise<JumpDestination>` (clamped to `1..30`)
  - `getAllJuzCards(): Promise<JuzCardInfo[]>` (cached in-memory)
  - `formatDestinationPreview(destination: JumpDestination): string`

- [x] **Step 1: Create `mobile/src/services/db/quickJumpContracts.ts`**

Define `JumpDestination`, `JuzCardInfo`, `toAsciiDigits`, `parseLocalizedNumber`, and
`formatDestinationPreview`.

- [x] **Step 2: Write failing unit test for `quickJumpService`**

Create `mobile/src/services/db/quickJumpService.test.mjs` verifying:

- Ayah destination resolution for Al-Fatihah 1:1, Al-Baqarah 2:255 (Page 42, Juz 3), and An-Nas
  114:6 (Page 604, Juz 30).
- Clamping of out-of-bounds verses (e.g. Al-Kawthar 108:50 clamped to 108:3).
- Persian numeral parsing (e.g. `۲۵۵` and `٤٢` parsed to integers).
- Page destination resolution for Page 1, Page 42, Page 293 (Al-Kahf), and Page 604.
- Juz destination resolution for all 30 Juzs (e.g. Juz 30 -> Surah 78 Ayah 1 Page 582).
- `getAllJuzCards()` returning all 30 Juz cards.

- [x] **Step 3: Implement `quickJumpService.ts`**

Implement query methods against `quran.db` using `adaptDatabase()` with parameter-binding and
Node.js in-memory test compatibility via `setQuickJumpDatabase()`.

- [x] **Step 4: Run tests & typecheck**

Run: `node --test mobile/src/services/db/quickJumpService.test.mjs` Run:
`yarn --cwd mobile typecheck`

- [x] **Step 5: Commit Task 1**

```bash
git add mobile/src/services/db/quickJumpContracts.ts mobile/src/services/db/quickJumpService.ts mobile/src/services/db/quickJumpService.test.mjs
git commit -m "feat(mobile): implement quick jump resolution service for surah, page, and juz"
```

---

### Task 2: Sub-Tab Components for Quick Jump Modal

**Files:**

- Create: `mobile/src/components/navigation/SurahAyahJumpTab.tsx`
- Create: `mobile/src/components/navigation/PageJumpTab.tsx`
- Create: `mobile/src/components/navigation/JuzJumpTab.tsx`

**Features:**

- **`SurahAyahJumpTab`**:
  - Filterable list of 114 Surahs with Persian search bar.
  - Selected Surah display with revelation badge (`مکی` / `مدنی`) and total verse count.
  - Interactive Ayah stepper (`-` / `+`) with direct numeric input clamped between `1` and
    `chapter.verses_count`.
  - Quick Ayah chips (`آیه ۱`, `آیه ۲۵`, `آیه ۵۰`, `آخرین آیه`) with WCAG `hitSlop`.
- **`PageJumpTab`**:
  - Large page input with Persian numerals (`۱ تا ۶۰۴`).
  - Fast page steppers: `-۱۰`, `-۱`, `+۱`, `+۱۰` with minimum 44x44px touch targets.
  - Milestone chips: `شروع مصحف (ص ۱)`, `سوره کهف (ص ۲۹۳)`, `سوره یاسین (ص ۴۴۰)`, `جزء ۳۰ (ص ۵۸۲)`.
  - Live preview card showing chapters contained on that page.
- **`JuzJumpTab`**:

  - 30 visual Juz cards in a 2-column scrollable grid.
  - Shows `جزء X`, starting Surah in Arabic calligraphy and Persian name, and starting Page badge.
  - Tapping selects destination immediately.

- [x] **Step 1: Implement `SurahAyahJumpTab.tsx`**
- [x] **Step 2: Implement `PageJumpTab.tsx`**
- [x] **Step 3: Implement `JuzJumpTab.tsx`**
- [x] **Step 4: Run typecheck**

Run: `yarn --cwd mobile typecheck`

- [x] **Step 5: Commit Task 2**

```bash
git add mobile/src/components/navigation/SurahAyahJumpTab.tsx mobile/src/components/navigation/PageJumpTab.tsx mobile/src/components/navigation/JuzJumpTab.tsx
git commit -m "feat(mobile): create surah-ayah, page, and juz jump tab components"
```

---

### Task 3: Main Quick Jump Modal (`QuickJumpModal.tsx`)

**Files:**

- Create: `mobile/src/components/navigation/QuickJumpModal.tsx`
- Create: `mobile/src/components/navigation/index.ts`
- Create & Test: `mobile/src/components/navigation/quickJumpModal.test.mjs`

**Features:**

- Wrapped in `KeyboardAvoidingView` with `keyboardShouldPersistTaps="handled"` on inner lists.
- Context-aware initial position props: `initialChapterId`, `initialVerseNumber`,
  `initialPageNumber`, `initialTab`.
- Header with title `پرش سریع به متن قرآن` and 44x44px close button.
- Segmented 3-tab bar (`سوره و آیه`, `صفحه`, `جزء`).
- Dynamic destination preview banner (`سوره بقره • آیه ۲۵۵ • صفحه ۴۲ • جزء ۳`).
- Primary action button: `مشاهده و شروع تلاوت` (minHeight 48px).

- [x] **Step 1: Implement `QuickJumpModal.tsx`**
- [x] **Step 2: Export from `mobile/src/components/navigation/index.ts`**
- [x] **Step 3: Write and run component contract tests in `quickJumpModal.test.mjs`**
- [x] **Step 4: Run typecheck & test**

Run: `node --test mobile/src/components/navigation/quickJumpModal.test.mjs` Run:
`yarn --cwd mobile typecheck`

- [x] **Step 5: Commit Task 3**

```bash
git add mobile/src/components/navigation/QuickJumpModal.tsx mobile/src/components/navigation/index.ts mobile/src/components/navigation/quickJumpModal.test.mjs
git commit -m "feat(mobile): implement main QuickJumpModal with keyboard avoidance and context awareness"
```

---

### Task 4: Surah Reader Top Bar Integration (`surah/[id].tsx`)

**Files:**

- Modify: `mobile/src/app/surah/[id].tsx`
- Test: `mobile/src/app/surah/surahReaderQuickJump.test.mjs`

**Features:**

- Add navigation compass icon button (`Compass` from `lucide-react-native`) in the top bar.
- Make the `topBarTitleBlock` touchable so clicking chapter title opens the Quick Jump modal.
- Implement `handleJumpToDestination`:

  - **Same-Surah**:
    - **Continuous mode**: In-place `scrollToIndex` to verse with 2.5s golden aura glow.
    - **Mushaf mode**: In-place `setCurrentPage(destination.pageNumber)` AND
      `setActiveVerseKey(`${destination.chapterId}:${destination.verseNumber}`)`.
    - Update `router.setParams({ verse: String(destination.verseNumber) })` and mark
      `handledVerseRef` to prevent re-trigger on viewMode toggle.
    - Update `setLastRead`.
  - **Different-Surah**:
    - Navigates via
      `router.push('/surah/${destination.chapterId}?verse=${destination.verseNumber}')`.

- [x] **Step 1: Update `surah/[id].tsx`**
- [x] **Step 2: Add integration tests in `surahReaderDeepLink.test.mjs`**
- [x] **Step 3: Run typecheck & tests**

Run: `yarn --cwd mobile test` Run: `yarn --cwd mobile typecheck`

- [x] **Step 4: Commit Task 4**

```bash
git add mobile/src/app/surah/[id].tsx mobile/src/app/surah/surahReaderDeepLink.test.mjs
git commit -m "feat(mobile): integrate quick jump modal and in-place navigation in surah reader"
```

---

### Task 5: Home & Catalog Quick Jump Integration (`(tabs)/index.tsx`, `(tabs)/surahs.tsx`)

**Files:**

- Modify: `mobile/src/app/(tabs)/index.tsx`
- Modify: `mobile/src/app/(tabs)/surahs.tsx`
- Test: `mobile/src/components/navigation/quickJumpNavigation.test.mjs`

**Features:**

- In `index.tsx`: Add a "پرش سریع" quick-jump action banner in the home dashboard.
- In `surahs.tsx`: Add a quick-jump compass icon in the catalog header toolbar.
- Lazy-mount modal queries so database operations only run when modal is open (`visible === true`).
- Opens `QuickJumpModal` and navigates directly to the chosen Surah/verse upon destination
  selection.

- [x] **Step 1: Update `(tabs)/index.tsx`**
- [x] **Step 2: Update `(tabs)/surahs.tsx`**
- [x] **Step 3: Run typecheck & tests**

Run: `yarn --cwd mobile test` Run: `yarn --cwd mobile typecheck`

- [x] **Step 4: Commit Task 5**

```bash
git add mobile/src/app/(tabs)/index.tsx mobile/src/app/(tabs)/surahs.tsx mobile/src/components/navigation/quickJumpNavigation.test.mjs
git commit -m "feat(mobile): integrate universal quick jump triggers in home and catalog screens"
```

---

### Task 6: Final Verification & Standards Check

- [x] **Step 1: Run full mobile test suite (`yarn --cwd mobile test`)**
- [x] **Step 2: Run TypeScript typecheck (`yarn --cwd mobile typecheck`)**
- [x] **Step 3: Run agent check (`yarn ai:check`)**
