# Mobile App Phase 1C Implementation Plan: Surah View Reader (Figma Node 1:673)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task.

**Goal:** Implement the complete, offline-capable Sanctuary Surah View Reader matching Figma node `1:673` featuring a dual-mode reading engine (Continuous Reflowable vs. 604-page Physical Mushaf replica), ornate Bismillah and Surah calligraphic banners, Word-by-Word highlighting, and a synchronized floating audio playback dock.

**Architecture:** React Native with Expo Router, TypeScript, Expo SQLite with offline `quran.db`, Zustand reading store, Sanctuary Design System tokens (`colors`, `typography`, `spacing`), and RTL layout.

---

## Global Constraints
- **Platform**: iOS 15+ and Android 10+ (API 29+)
- **Directionality**: RTL primary (Persian/Arabic) with logical properties (`marginEnd`, `marginStart`, `paddingStart`, `paddingEnd`)
- **Typography**: `Vazirmatn-Regular` (UI text), `UthmanicHafs` (Arabic calligraphy and Uthmani text), `IndoPakNastaleeq` (IndoPak script)
- **Colors**: Sanctuary Theme
  - Background: `#08130E`
  - Floating Dock & Cards: `#132A20`, `#0D1F17`
  - Gold Accents: `#C5A880`, `#D4AF37`
  - Vibrant Emerald: `#10B981`
  - Borders: `#1B3D2F`, `#2D6A4F`
- **Touch Targets**: All interactive elements must have minimum 44x44px touch targets
- **Offline First**: Zero network calls; all data served instantly from `mobile/assets/data/quran.db`

---

## Tasks

### Task 1: Reading Engine Services & Zustand Store Enhancements
- In `mobile/src/services/db/verseService.ts`:
  - Add `getVersesByPage(pageNumber: number): Promise<Verse[]>`
  - Add `getPageWords(pageNumber: number): Promise<Word[]>`
- In `mobile/src/stores/useReadingStore.ts`:
  - Add view mode state: `viewMode: 'continuous' | 'mushaf'`
  - Add font family choice: `quranFont: 'hafs' | 'indopak'`
  - Add active playing verse key: `activeVerseKey: string | null`
  - Add playback status: `isPlaying: boolean`
  - Add translation selection: `activeTranslation: 'makarem' | 'ansarian' | 'both'`
- Add unit tests in `mobile/src/services/db/database.test.mjs` verifying page-based queries across pages 1 to 604.

### Task 2: Surah Calligraphic Header & Bismillah Banner
- Implement `mobile/src/components/reader/SurahHeaderBanner.tsx`:
  - Ornate Islamic geometric header with gold calligraphy
  - Arabic title in `fonts.quranHafs`
  - Persian title, translation place (مکی / مدنی), verse count, and revelation order badge
  - Touch target for chapter info / tafsir overview
- Implement `mobile/src/components/reader/BismillahBanner.tsx`:
  - Sacred Bismillah calligraphy in `fonts.quranHafs` with gold radial glow
  - Automatically omitted for Surah 9 (At-Tawbah)

### Task 3: Dual-Mode Verses View (Continuous Verse Card & Mushaf Page View)
- Implement `mobile/src/components/reader/ContinuousVerseCard.tsx`:
  - Concentric geometric verse number badge
  - Sacred Arabic text in selected font (`UthmanicHafs` or `IndoPakNastaleeq`) with adjustable font scale
  - Word-by-Word inline view with Persian glosses below each word
  - Persian translation text (Makarem / Ansarian) with high contrast
  - Action buttons (Play, Bookmark, Share, Insights trigger) with >= 44x44px touch targets
  - Active audio highlight styling with emerald/gold glow border
- Implement `mobile/src/components/reader/MushafPageView.tsx`:
  - 15-line physical Mushaf replica using `page_number` and `line_number` from `words` table
  - Page header (Juz number, Surah name, page number) and footer
  - Page navigation buttons / pager controls (previous page, next page)

### Task 4: Synchronized Bottom Audio Dock & Reader Settings Drawer
- Implement `mobile/src/components/reader/AudioPlaybackDock.tsx`:
  - Floating bottom dock with glassmorphic Sanctuary surface (`colors.surfaceFloating`, `colors.borderIridescent`)
  - Currently playing Ayah indicator (`سوره الفاتحة • آیه ۱`)
  - Playback controls: Previous Ayah, Play/Pause, Next Ayah, Repeat toggle
  - Touch targets >= 44x44px
- Implement `mobile/src/components/reader/ReaderSettingsModal.tsx`:
  - Font scale stepper (0.8x to 1.6x)
  - View mode toggle (`پیوسته` vs `مصحف چاپی`)
  - Font family switcher (`عثمان طه (حفص)` vs `اردو / شبه‌قاره`)
  - Translation switcher (`مکارم شیرازی` vs `انصاریان` vs `هر دو`)
  - Word-by-word toggle

### Task 5: Screen Integration & Comprehensive Verification
- Update `mobile/src/app/surah/[id].tsx`:
  - Top navigation bar with back navigation, Surah title, view mode toggle, and settings trigger
  - Render Continuous View or Mushaf Page View depending on `viewMode`
  - Floating `AudioPlaybackDock` at bottom
  - `ReaderSettingsModal` sheet
- Add automated tests in `mobile/src/components/reader/readerComponents.test.mjs` and `mobile/src/services/db/database.test.mjs`
- Verify web test suite and mobile test suite.
