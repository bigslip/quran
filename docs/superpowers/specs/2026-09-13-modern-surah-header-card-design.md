# Design Specification: Modern Sanctuary Hero Card (ChapterHeader)

- **Date**: 2026-09-13
- **Status**: Approved
- **Scope**: `src/components/chapters/ChapterHeader/`, `src/components/chapters/ChapterHeader/components/`, `src/components/chapters/ChapterHeader/ChapterHeader.module.scss`

---

## 1. Overview & Objectives
Transform the Surah header (`ChapterHeader`) into an elevated, modern **Sanctuary Hero Card** that provides rich contextual metadata (Revelation place, Surah number, Ayah count, Juz location), beautiful centralized calligraphy and titles, and quick interactive actions (Surah Info modal, Share Surah link, and Quick Ayah Jump) while maintaining 100% RTL/LTR compliance across all 19 supported locales.

---

## 2. Component Architecture & Hierarchy

### Component Tree
```
src/components/chapters/ChapterHeader/
├── index.tsx (Main orchestrator & container wrapper)
├── ChapterHeader.module.scss (Sanctuary card styling, responsive layouts, badges & action bar)
└── components/
    ├── SanctuaryHeaderCard.tsx (Hero card containing badges, calligraphy, titles, action bar)
    ├── ChapterBadgesRow.tsx (Makki/Madani badge, Surah number, Ayah count, Juz chip)
    ├── ChapterTitle.tsx (Arabic calligraphy + transliterated & translated titles)
    ├── ChapterActionBar.tsx (Surah Info, Share Surah, Jump to Ayah buttons)
    ├── SurahInfoButton.tsx (Enhanced info pill button with Info icon + modal trigger)
    ├── ShareSurahButton.tsx (Share trigger with Clipboard copy & Toast feedback)
    ├── JumpToAyahButton.tsx (Quick jump button triggering CommandBar/Verse jump)
    ├── BismillahSection.tsx (Centered Bismillah calligraphy & translation)
    └── TranslationSettingsButton.tsx / ReadingModeActions.tsx (Top reading control bar)
```

---

## 3. Detailed Specifications

### A. Sanctuary Hero Card Container
- **Styling**: Elevated container with subtle gradient (`var(--color-background-elevated-new)`), hairline border (`var(--color-borders-hairline)`), rounded corners (`var(--border-radius-large)` or `var(--border-radius-rounded)`), and soft ambient shadow (`var(--shadow-chapter-header-actions)`).
- **Responsive Layout**:
  - Desktop: Centered card (`max-inline-size: 760px`, `padding: var(--spacing-large-px)`).
  - Mobile / Tablet: Full width with safe inline padding (`padding: var(--spacing-medium2-px)`).

### B. Metadata Badges Row
- **Revelation Place Badge**:
  - `Makki`: 🕌 `t('common:makkah')` / `t('common:makkah-short')` with green/gold ambient tint.
  - `Madani`: 🌴 `t('common:madinah')` / `t('common:madinah-short')` with teal/blue ambient tint.
- **Surah Index Badge**: `t('common:surah') {{toLocalizedNumber(chapter.id, lang)}}`.
- **Ayahs Count Badge**: `{{toLocalizedNumber(chapter.versesCount, lang)}} t('common:ayahs')`.
- **Juz Range Badge**: `t('common:juz') {{toLocalizedNumber(juzNumber, lang)}}`.

### C. Calligraphy & Typographic Hierarchy
- **Arabic Calligraphy**: `ChapterIconContainer` with `ChapterIconsSize.Massive` / `Large`, fully responsive and CLS-safe.
- **Transliterated Title**: `chapter.transliteratedName` (`font-size: var(--font-size-xlarge2)`, `font-weight: 700`, `line-height: 1.2`).
- **Translated Title**: `chapter.translatedName` (`font-size: var(--font-size-medium)`, `color: var(--color-text-faded-new)`, `font-weight: 500`).

### D. Interactive Action Toolbar
1. **Surah Info Button (`SurahInfoButton`)**:
   - Modern pill with info icon + label `t('quran-reader:surah-info')`.
   - Triggers `SurahInfoContent` modal with rich themes, background, and virtues.
2. **Share Surah Button (`ShareSurahButton`)**:
   - Icon + label `t('common:share')`.
   - Invokes `navigator.share` on supported mobile browsers; copies canonical URL to clipboard with success toast notification on desktop.
3. **Quick Jump Button (`JumpToAyahButton`)**:
   - Icon + label `t('common:quick-jump', { defaultValue: 'Jump to Ayah' })`.
   - Opens the CommandBar / Search Drawer primed for Ayah navigation.

### E. Bismillah Presentation
- Placed beneath the Hero Card with clean spacing.
- Preserves business rules: Hidden for Surah 9 (At-Tawbah) and Surah 1 (Al-Fatihah).

---

## 4. Internationalization & Accessibility (a11y)
- **RTL/LTR Support**: Strict use of CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline-start`, `gap`).
- **Numeral Localization**: All numbers rendered via `toLocalizedNumber(num, lang)`.
- **Screen Reader Support**: Semantic HTML with clear `aria-label` attributes on all action buttons and badges.

---

## 5. Verification & Testing Strategy
- Unit tests for `SanctuaryHeaderCard`, `ChapterBadgesRow`, and `ChapterActionBar`.
- Regression testing of existing `ChapterHeader.test.tsx` and Quran reader views.
- Full test pass (`yarn --ignore-engines test --run`) and zero TypeScript errors (`npx tsc --noEmit`).
