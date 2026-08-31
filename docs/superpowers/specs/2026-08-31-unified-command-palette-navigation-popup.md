# UI/UX Specification: Unified Command Palette & Quick Navigation Popup

- **Status:** Approved for Implementation
- **Author:** Principal Product Designer & Staff Frontend Architect
- **Date:** 2026-08-31
- **Branch:** `feature/modern-spiritual-sanctuary-ui-ux`

---

## 1. Executive Summary & Design Vision

Replaces all legacy slide-in side drawers for search and Quran text navigation (`SearchDrawer` and `SidebarNavigation`) with a **Unified, Centered Spotlight Command Palette Popup Modal**.

### 1.1 Problems Solved
- **Side Drawer Friction:** Slide-in side drawers push or heavily obstruct the reading canvas, feel disjointed on wide desktop screens, and separate text search from Quranic chapter navigation.
- **Unified Navigation Experience:** Combining global text search, instant Surah switching, Juz jumping, Page jumping, and direct Ayah navigation (`e.g. 2:255`) into a single, lightning-fast, keyboard-accessible popup dialog (`⌘K`).

---

## 2. Component Architecture & Interactions

### 2.1 Trigger Points
1. **Top Navbar Command Bar (`⌘K` / `Ctrl+K`)**: Opens the Command Palette in "All / Search" mode.
2. **Reader Context Menu Chapter Title**: Clicking the Surah title in the sticky reader navigation opens the Command Palette pre-focused on the Surah/Verse switcher.
3. **Mobile Search Button**: Opens the Command Palette in full-screen modal mode optimized for touch.

### 2.2 Modal Structure & Visual Layout

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  🔍  Search Quran, Surah (e.g. Kahf or 18), Verse (2:255), Juz, or Page...      [🎙️]   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [✦ All]   [📖 Surahs (114)]   [📑 Juz (30)]   [📄 Pages (604)]   [⚡ Direct Jump]      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ✨ DIRECT JUMP                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ ⚡ Jump to Surah Al-Baqarah, Ayah 255 (Ayat Al-Kursi)                Press ↵ to go │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  📖 SURAHS                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ [ 18 ]  Al-Kahf (The Cave)  •  110 Ayahs  •  Meccan                الكهف  [Active]│  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │ [ 19 ]  Maryam (Mary)  •  98 Ayahs  •  Meccan                       مريم          │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │ [ 20 ]  Taha  •  135 Ayahs  •  Meccan                                 طه          │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  ↑↓ to navigate  •  ↵ to select  •  Tab to switch category  •  Esc to close            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Visual Design (Royal Indigo & Celestial Emerald)
- **Backdrop:** `backdrop-filter: blur(24px) saturate(180%)`, background `rgba(3, 7, 18, 0.75)`.
- **Dialog Surface:** Frosted Obsidian Glass `rgba(10, 16, 30, 0.92)` with iridescent cyan border `1px solid rgba(0, 242, 254, 0.25)` and outer celestial glow shadow `0 24px 64px rgba(0, 0, 0, 0.6), 0 0 32px rgba(0, 242, 254, 0.15)`.
- **Active Item Highlight:** Soft celestial gradient background `linear-gradient(90deg, rgba(0, 242, 254, 0.12) 0%, rgba(79, 172, 254, 0.05) 100%)` with electric cyan indicator bar on the leading edge.

---

## 3. Keyboard & Accessibility (WAI-ARIA)

- `role="dialog"` and `aria-modal="true"` with focus trapped inside modal while open.
- Auto-focus on search input on open.
- `ArrowDown` / `ArrowUp` for list item navigation with `aria-activedescendant`.
- `Enter` immediately executes navigation and closes modal.
- `Escape` closes modal and returns focus to trigger element.
- Tab bar navigation accessible via `Tab` / `Shift+Tab` or Left/Right arrow keys.

---

## 4. Implementation Tasks

1. **Task 1: Redux & State Management Alignment**:
   - Update Redux `navbar` / `commandPalette` slice so both navbar search and reader chapter navigation open the unified Command Palette popup dialog.
2. **Task 2: Create `CommandPaletteModal` Component**:
   - Build `src/components/CommandPalette/` (Modal, SearchInput, CategoryTabs, NavigationList, DirectJumpItem, SurahListItem, JuzListItem, PageListItem, KeyboardShortcutsFooter).
   - Integrate Fuse.js / instant chapter data filtering and direct `verse:ayah` parser.
3. **Task 3: Connect Navbar & Reader Triggers**:
   - Connect Navbar search pill, mobile search button, and `ChapterNavigation.tsx` in `ContextMenu` to open `CommandPaletteModal`.
4. **Task 4: Chrome Verification & Testing**:
   - Verify keyboard navigation (`↑`/`↓`/`Enter`/`Esc`), search queries, Surah switching from reader, and multi-viewport responsiveness with 0 errors.
