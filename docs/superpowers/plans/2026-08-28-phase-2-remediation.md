# Phase 2 Complete Remediation Plan

> **For agentic workers:** Execute this plan step-by-step. Each task must be verified with passing tests before committing.

**Goal:** Remediate all critical, important, and minor issues identified across the 3 domains of Phase 2 (Word & Verse Core, Reading View Containers, Translation & Tafsir Views).

---

## Task 1: Phase 2a — Word & Verse Core Layer

### Files to Modify:
- `src/components/Verse/PlayVerseAudioButton.tsx`: Add optional chaining to `chapterData?.transliteratedName ?? chapterId`.
- `src/components/Verse/VerseAndTranslation.tsx`: Destructure all domain props (`chaptersData`, `chapter`, `from`, `to`, `titleText`, `quranFont`, `translationsLimit`, `arabicVerseClassName`, `translationClassName`, `fixedFontScale`, `className`) before spreading `...htmlProps` onto the root `div`.
- `src/components/dls/InlineWordByWord/index.tsx`: Extend `React.HTMLAttributes<HTMLParagraphElement>` and forward `...props` to the `<p>` element.
- `src/components/Verse/PlainVerseText/PlainVerseTextWord/index.tsx`: Extend `React.HTMLAttributes<HTMLDivElement>` and spread `...props`.
- `src/components/dls/QuranWord/TajweedWordImage.tsx`: Extend `React.HTMLAttributes<HTMLSpanElement>` and spread `...props`.
- `src/components/dls/QuranWord/getToolTipText.tsx`: Add optional chaining `{word[tooltipTextType]?.text}`.
- `src/components/Verse/VerseText.tsx`: Replace `any` type with `React.ElementType`.
- `src/components/dls/QuranWord/QuranWord.test.tsx`: Expand test cases for keyboard interaction and audio highlighting.
- `src/components/dls/QuranWord/GlyphWord.test.tsx`: Add fallback font rendering tests (`isFontLoaded=false`).

### Verification:
`yarn --ignore-engines vitest run src/components/dls/QuranWord src/components/Verse`

---

## Task 2: Phase 2c — Translation View & Tafsir Layer

### Files to Modify:
- `src/components/QuranReader/TranslationView/BottomActionsTabs.tsx`: Restrict `handleTabKeyDown` to `Enter` and `Space`.
- `src/components/QuranReader/TranslationView/TranslationViewCell.tsx`: Update `areVersesEqual` comparator to compare `prevProps.className === nextProps.className`.
- `src/components/QuranReader/TranslationView/TranslationText/FootnoteText.tsx`: Add `aria-label={t('common:close')}` to close button.
- `src/components/QuranReader/TafsirView/LanguageAndTafsirSelection.tsx`: Add `aria-pressed={selected}` to selection button.
- `src/components/QuranReader/TranslationView/TranslationViewCell.test.tsx` & `TranslationText/index.test.tsx`: Expand test assertions.

### Verification:
`yarn --ignore-engines vitest run src/components/QuranReader/TranslationView src/components/QuranReader/TafsirView`

---

## Task 3: Phase 2b — Reading View & Page Containers

### Files to Modify:
- `src/components/QuranReader/ReadingView/Page.tsx`: Add `role="region"` and `aria-label={pageNumber ? `Page ${pageNumber}` : undefined}`.
- `src/components/QuranReader/ReadingView/PageFooter.tsx`: Add accessible label to page number.
- `src/components/QuranReader/ReadingView/groupLinesByVerses.ts`: Optimize array flattening with `verses.flatMap(getVerseWords)`.
- `src/components/QuranReader/ReadingView/PageContainer.tsx`: Forward `className` to `<ReadingViewSkeleton className={className} />`.
- `src/components/QuranReader/ReadingView/Line.test.tsx` & `TranslatedAyah.test.tsx` & `Page.test.tsx` & `PageContainer.test.tsx`: Expand test assertions.

### Verification:
`yarn --ignore-engines vitest run src/components/QuranReader/ReadingView`

---

## Task 4: Final Full Codebase Verification

- Run full test suite: `yarn --ignore-engines vitest run`
- Run TypeScript check: `npx tsc --noEmit`
