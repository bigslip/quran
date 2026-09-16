# Mobile App Phase 1B Implementation Plan: Surah Catalog & Index (Figma Node 1:289)

> **For agentic workers:** REQUIRED SUB-SKILL: Use \`superpowers:subagent-driven-development\` to implement this plan task-by-task.

**Goal:** Implement the complete, offline-capable Sanctuary Surah Catalog & Index screen matching Figma node \`1:289\` with 3 view modes (Surahs, Juz, Revelation Order), real-time search, elevated Islamic card components, and seamless navigation to the Surah Reader.

**Architecture:** React Native with Expo Router, TypeScript, Expo SQLite with offline \`quran.db\`, Sanctuary Design System tokens (\`colors\`, \`typography\`, \`spacing\`), and RTL layout.

---

## Global Constraints
- **Platform**: iOS 15+ and Android 10+ (API 29+)
- **Directionality**: RTL primary (Persian/Arabic) with logical properties (\`marginEnd\`, \`marginStart\`, \`paddingStart\`, \`paddingEnd\`)
- **Typography**: \`Vazirmatn-Regular\` (UI text), \`UthmanicHafs\` (Arabic calligraphy and verse snippets)
- **Colors**: Sanctuary Theme
  - Background: \`#08130E\`
  - Header & Cards: \`#132A20\`, \`#0D1F17\`
  - Gold Accents: \`#C5A880\`, \`#D4AF37\`
  - Vibrant Emerald: \`#10B981\`
  - Borders: \`#1B3D2F\`, \`#2D6A4F\`
- **Touch Targets**: All interactive elements must have minimum 44x44px touch targets
- **Offline First**: Zero network calls; all data served instantly from \`mobile/assets/data/quran.db\`

---

## Tasks

### Task 1: Juz Data Model & Query Services
- Add \`Juz\` interface in \`mobile/src/types/quran.ts\`:
  - \`juz_number: number\`
  - \`page_start: number\`
  - \`page_end: number\`
  - \`verses_count: number\`
  - \`first_chapter_id: number\`
  - \`first_verse_key: string\`
  - \`first_surah_name_arabic: string\`
  - \`first_surah_name_fa: string\`
  - \`preview_text: string\`
- Implement \`getAllJuzs(): Promise<Juz[]>\` in \`mobile/src/services/db/surahService.ts\` querying the embedded SQLite \`verses\` and \`chapters\` tables.
- Add unit tests in \`mobile/src/services/db/database.test.mjs\` asserting all 30 Juzs are retrieved with valid page ranges and starting Surahs.

### Task 2: Elevated SurahCardItem & JuzCardItem Components
- Implement \`mobile/src/components/catalog/SurahCardItem.tsx\`:
  - Octagonal or geometric circular badge for Surah number (or revelation rank when in revelation order mode)
  - Arabic calligraphy title in \`UthmanicHafs\` with \`goldAccent\` (\`#C5A880\`)
  - Persian name and English/simple name subtitle
  - Makki / Madani chip badge with subtle emerald tint
  - Verse count badge (\`verses_count\` آیه)
  - Accessible touch target (>= 44x44px) and smooth press opacity
  - Press triggers navigation to \`/surah/[id]\`
- Implement \`mobile/src/components/catalog/JuzCardItem.tsx\`:
  - Geometric Juz number badge (جزء ۱ .. ۳۰)
  - Starting Surah name and starting Ayah number
  - Page range indicator (\`صفحات ۱ تا ۲۱\`)
  - Total verses badge (\`۱۴۸ آیه\`)
  - Arabic preview snippet in \`UthmanicHafs\`
  - Accessible touch target (>= 44x44px) navigating to \`/surah/[first_chapter_id]\`
- Verify RTL alignment and test render in isolation.

### Task 3: Segmented Catalog Tab Switcher & Search Bar
- Implement \`mobile/src/components/catalog/CatalogTabSwitcher.tsx\`:
  - 3 tabs: **سوره‌ها (Surahs)** | **جزءها (Juz)** | **ترتیب نزول (Revelation Order)**
  - Segmented pill design with Sanctuary emerald background and gold active indicator
  - Fully accessible touch targets (>= 44px height)
- Connect real-time search filtering:
  - When on "سوره‌ها" or "ترتیب نزول": filter by Persian name, Arabic name, English name, or Surah number
  - When on "جزءها": filter by Juz number (e.g. "30", "جزء ۳۰") or Surah name in the Juz
  - Show empty state ("موردی یافت نشد") with clear button when no results match

### Task 4: Screen Integration & Comprehensive Verification
- Update \`mobile/src/app/(tabs)/surahs.tsx\`:
  - Header with ambient radial glow, Sanctuary title, and SearchBar
  - Integrated \`CatalogTabSwitcher\`
  - High-performance \`FlatList\` with memoized items and layout optimizations
  - Navigation handlers to \`/surah/[id]\`
- Add automated tests in \`mobile/src/services/db/database.test.mjs\` covering Juz queries, Surah ordering, and revelation order.
- Verify TypeScript types.
