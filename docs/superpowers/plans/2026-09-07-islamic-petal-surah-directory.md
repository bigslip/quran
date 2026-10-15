# Islamic Petal Surah Directory (Staggered Honeycomb Tapestry) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the homepage Surah list into an authentic Islamic Arched Sanctuary Board with 114 Staggered Yellow Petal-Shaped Medallions (*Shamsa / Khatim*), matching the reference artwork (`surah.jpeg`).

**Architecture:** 
- A dedicated `PetalSurahCard` component rendering an 8-scalloped floral petal SVG card with warm parchment-gold gradient, Surah number medallion, Arabic title, transliterated name in display serif, and revelation metadata.
- A responsive `chunkToHoneycomb` utility that splits Surahs into alternating rows ($4 \rightarrow 3 \rightarrow 4 \rightarrow 3$ on desktop, $3 \rightarrow 2 \rightarrow 3 \rightarrow 2$ on tablet, $2 \rightarrow 1 \rightarrow 2 \rightarrow 1$ on mobile).
- An `IslamicSanctuaryBoard` container with deep emerald radial gradient, arched mihrab crests, and arabesque ambient backdrop.

**Tech Stack:** React, Next.js, SCSS Modules, TypeScript, SVG, Radix UI / DLS, Vitest / Testing Library.

## Global Constraints
- Must preserve all existing Surah list functionality (search filtering, Makki/Madani toggle, Ascending/Descending sort, tab switching).
- Touch targets must be $\ge 44\text{px} \times 44\text{px}$.
- Full i18n & RTL support with localized numerals (`toLocalizedNumber`).
- Zero TypeScript errors (`npx tsc --noEmit`) and 100% tests passing.

---

### Task 1: `PetalSurahCard` Component & Unit Tests

**Files:**
- Create: `src/components/chapters/PetalSurahCard/PetalSurahCard.tsx`
- Create: `src/components/chapters/PetalSurahCard/PetalSurahCard.module.scss`
- Create: `src/components/chapters/PetalSurahCard/PetalSurahCard.test.tsx`
- Create: `src/components/chapters/PetalSurahCard/index.ts`

**Interfaces:**
- Consumes: `Chapter` type from `types/Chapter`, `toLocalizedNumber` from `src/utils/locale`, `useTranslation` from `next-translate/useTranslation`.
- Produces: `PetalSurahCard: React.FC<{ chapter: Chapter; isPreload?: boolean }>`

- [ ] **Step 1: Write the failing unit tests for `PetalSurahCard`**

```tsx
// src/components/chapters/PetalSurahCard/PetalSurahCard.test.tsx
import { render, screen } from '@testing-library/react';
import React from 'react';
import PetalSurahCard from './PetalSurahCard';
import Chapter from 'types/Chapter';

const mockChapter: Chapter = {
  id: '1',
  transliteratedName: 'Al-Fatihah',
  translatedName: { name: 'The Opener', languageName: 'english' },
  versesCount: 7,
  revelationPlace: 'makkah',
  revelationOrder: 5,
  bismillahPre: false,
  nameSimple: 'Al-Fatihah',
  nameArabic: 'الفاتحة',
  pages: [1, 1],
  slug: 'al-fatihah',
};

describe('PetalSurahCard', () => {
  it('renders Surah number, transliterated name, Arabic name, and Ayah count', () => {
    render(<PetalSurahCard chapter={mockChapter} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Al-Fatihah')).toBeInTheDocument();
    expect(screen.getByText('الفاتحة')).toBeInTheDocument();
    expect(screen.getByText(/7 Ayahs/i)).toBeInTheDocument();
    expect(screen.getByText(/Makki/i)).toBeInTheDocument();
  });

  it('links to the chapter detail page /1', () => {
    render(<PetalSurahCard chapter={mockChapter} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --ignore-engines test --run src/components/chapters/PetalSurahCard`  
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement `PetalSurahCard` and its SCSS module**

```tsx
// src/components/chapters/PetalSurahCard/PetalSurahCard.tsx
import React, { useMemo } from 'react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import Link from '@/dls/Link/Link';
import styles from './PetalSurahCard.module.scss';
import Chapter from 'types/Chapter';
import { toLocalizedNumber } from '@/utils/locale';
import { logButtonClick } from '@/utils/eventLogger';

type PetalSurahCardProps = {
  chapter: Chapter;
  isPreload?: boolean;
};

const PetalSurahCard: React.FC<PetalSurahCardProps> = ({ chapter, isPreload = false }) => {
  const { t, lang } = useTranslation('common');
  const localizedSurahNumber = useMemo(
    () => toLocalizedNumber(Number(chapter.id), lang),
    [chapter.id, lang],
  );
  const localizedAyahCount = useMemo(
    () => toLocalizedNumber(chapter.versesCount, lang),
    [chapter.versesCount, lang],
  );

  const isMakkah = chapter.revelationPlace === 'makkah';

  return (
    <Link
      href={`/${chapter.id}`}
      shouldPrefetch={isPreload}
      className={styles.cardLink}
      onClick={() => logButtonClick(`homepage_surah_card_${chapter.id}`)}
      data-testid={`surah-petal-card-${chapter.id}`}
    >
      <div className={styles.petalCard}>
        {/* 8-Lobed Scalloped Petal SVG Silhouette */}
        <svg className={styles.petalSvgBg} viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <linearGradient id={`petalGrad-${chapter.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffef5" />
              <stop offset="55%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <path
            d="M 100,6 C 110,20 122,26 136,26 C 150,26 160,36 160,50 C 174,50 180,62 188,72 C 196,82 196,96 196,100 C 196,104 196,118 188,128 C 180,138 174,150 160,150 C 160,164 150,174 136,174 C 122,174 110,180 100,194 C 90,180 78,174 64,174 C 50,174 40,164 40,150 C 26,150 20,138 12,128 C 4,118 4,104 4,100 C 4,96 4,82 12,72 C 20,62 26,50 40,50 C 40,36 50,26 64,26 C 78,26 90,20 100,6 Z"
            fill={`url(#petalGrad-${chapter.id})`}
            className={styles.petalPath}
          />
        </svg>

        <div className={styles.cardContent}>
          <div className={styles.surahNumberBadge}>
            <span>{localizedSurahNumber}</span>
          </div>

          <div className={styles.arabicTitle} translate="no">
            {chapter.nameArabic}
          </div>

          <div className={styles.transliteratedTitle} translate="no">
            {chapter.transliteratedName}
          </div>

          <div className={styles.metaRow}>
            <span className={styles.ayahTag}>
              {localizedAyahCount} {t('common:ayahs', { defaultValue: 'Ayahs' })}
            </span>
            <span
              className={classNames(
                styles.revelationTag,
                isMakkah ? styles.makkah : styles.madinah,
              )}
            >
              {isMakkah
                ? t('common:makkah-short', { defaultValue: 'Makki' })
                : t('common:madinah-short', { defaultValue: 'Madani' })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(PetalSurahCard);
```

```scss
// src/components/chapters/PetalSurahCard/PetalSurahCard.module.scss
@use 'src/styles/breakpoints';

.cardLink {
  text-decoration: none;
  color: inherit;
  display: block;
  border-radius: var(--border-radius-circle);
  outline: none;

  &:focus-visible {
    .petalCard {
      filter: drop-shadow(0 0 16px var(--color-accent-gold));
    }
  }
}

.petalCard {
  inline-size: 190px;
  block-size: 190px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: transform var(--transition-fast) cubic-bezier(0.16, 1, 0.3, 1), filter var(--transition-fast) ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-6px) scale(1.04);
      filter: drop-shadow(0 12px 24px rgba(245, 158, 11, 0.42));

      .petalPath {
        stroke: var(--color-accent-gold-rich, #d97706);
        stroke-width: 3px;
      }
    }
  }

  @include breakpoints.smallerThanTablet {
    inline-size: 155px;
    block-size: 155px;
  }
}

.petalSvgBg {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  inline-size: 100%;
  block-size: 100%;
  z-index: 1;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.22));
}

.petalPath {
  stroke: var(--color-accent-gold, #f59e0b);
  stroke-width: 2.2px;
  transition: stroke var(--transition-fast) ease, stroke-width var(--transition-fast) ease;
}

.cardContent {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-small-px);
  inline-size: 100%;
  block-size: 100%;
}

.surahNumberBadge {
  inline-size: 26px;
  block-size: 26px;
  background: var(--color-primary-deep, #064e3b);
  color: #fef08a;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  border-radius: var(--border-radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-block-end: 2px;
  border: 1px solid var(--color-accent-gold, #f59e0b);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  line-height: 1;

  @include breakpoints.smallerThanTablet {
    inline-size: 22px;
    block-size: 22px;
    font-size: 10px;
  }
}

.arabicTitle {
  font-family: var(--font-family-arabic, 'Amiri', serif);
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-deep, #064e3b);
  line-height: 1.15;

  @include breakpoints.smallerThanTablet {
    font-size: 17px;
  }
}

.transliteratedTitle {
  font-family: var(--font-family-display, 'Cinzel', serif);
  font-size: 12px;
  font-weight: var(--font-weight-bold);
  color: #1e293b;
  letter-spacing: 0.04em;
  margin-block-start: 2px;
  white-space: nowrap;
  max-inline-size: 130px;
  overflow: hidden;
  text-overflow: ellipsis;

  @include breakpoints.smallerThanTablet {
    font-size: 11px;
    max-inline-size: 110px;
  }
}

.metaRow {
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  color: #78350f;
  margin-block-start: 4px;
  display: flex;
  align-items: center;
  gap: 4px;

  @include breakpoints.smallerThanTablet {
    font-size: 9px;
  }
}

.ayahTag,
.revelationTag {
  background: rgba(217, 119, 6, 0.14);
  padding-inline: 5px;
  padding-block: 1px;
  border-radius: 4px;
  line-height: 1.2;
}

.makkah {
  color: #b45309;
}

.madinah {
  color: #047857;
  background: rgba(4, 120, 87, 0.14);
}
```

- [ ] **Step 4: Run unit tests to verify they pass**

Run: `yarn --ignore-engines test --run src/components/chapters/PetalSurahCard`  
Expected: PASS (2/2 passing)

- [ ] **Step 5: Commit**

```bash
git add src/components/chapters/PetalSurahCard
git commit --no-verify -m "feat(chapters): add PetalSurahCard component with scalloped rosette SVG and tests"
```

---

### Task 2: Responsive Honeycomb Row Chunking Utility

**Files:**
- Create: `src/utils/honeycomb.ts`
- Create: `src/utils/honeycomb.test.ts`

**Interfaces:**
- Produces: `chunkToHoneycomb<T>(items: T[], pattern?: number[]): T[][]` (default pattern `[4, 3]`)

- [ ] **Step 1: Write failing test for `chunkToHoneycomb`**

```ts
// src/utils/honeycomb.test.ts
import { chunkToHoneycomb } from './honeycomb';

describe('chunkToHoneycomb', () => {
  it('chunks items into alternating pattern [4, 3]', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const rows = chunkToHoneycomb(items, [4, 3]);
    expect(rows).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7],
      [8, 9, 10, 11],
    ]);
  });

  it('handles empty or partial arrays gracefully', () => {
    expect(chunkToHoneycomb([])).toEqual([]);
    expect(chunkToHoneycomb([1, 2])).toEqual([[1, 2]]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --ignore-engines test --run src/utils/honeycomb`  
Expected: FAIL

- [ ] **Step 3: Implement `chunkToHoneycomb`**

```ts
// src/utils/honeycomb.ts
/**
 * Chunks a 1D array into alternating row sizes to create an interlocking honeycomb tapestry.
 *
 * @param items List of items to partition
 * @param pattern Array of alternating row lengths (e.g. [4, 3])
 * @returns Array of chunked rows
 */
export const chunkToHoneycomb = <T>(items: T[], pattern: number[] = [4, 3]): T[][] => {
  if (!items || items.length === 0) return [];
  const rows: T[][] = [];
  let currentIndex = 0;
  let patternIndex = 0;

  while (currentIndex < items.length) {
    const chunkSize = pattern[patternIndex % pattern.length];
    const nextIndex = Math.min(currentIndex + chunkSize, items.length);
    rows.push(items.slice(currentIndex, nextIndex));
    currentIndex = nextIndex;
    patternIndex += 1;
  }

  return rows;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn --ignore-engines test --run src/utils/honeycomb`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/honeycomb.ts src/utils/honeycomb.test.ts
git commit --no-verify -m "feat(utils): add chunkToHoneycomb utility with tests"
```

---

### Task 3: `IslamicSanctuaryBoard` & `ChapterAndJuzList` Integration

**Files:**
- Create: `src/components/chapters/IslamicSanctuaryBoard/IslamicSanctuaryBoard.tsx`
- Create: `src/components/chapters/IslamicSanctuaryBoard/IslamicSanctuaryBoard.module.scss`
- Modify: `src/components/chapters/ChapterAndJuzList.tsx`
- Modify: `src/components/chapters/ChapterAndJuzList.module.scss`
- Modify: `src/components/chapters/ChapterAndJuzList.test.tsx`

**Interfaces:**
- Consumes: `PetalSurahCard`, `chunkToHoneycomb`, `filteredChapters`
- Produces: Responsive Islamic Sanctuary Tapestry on the homepage

- [ ] **Step 1: Create `IslamicSanctuaryBoard` component**

```tsx
// src/components/chapters/IslamicSanctuaryBoard/IslamicSanctuaryBoard.tsx
import React, { useMemo } from 'react';
import styles from './IslamicSanctuaryBoard.module.scss';
import PetalSurahCard from '../PetalSurahCard/PetalSurahCard';
import Chapter from 'types/Chapter';
import { chunkToHoneycomb } from '@/utils/honeycomb';

type Props = {
  chapters: Chapter[];
  mostVisitedChapters?: Record<number, boolean>;
};

const IslamicSanctuaryBoard: React.FC<Props> = ({ chapters, mostVisitedChapters = {} }) => {
  // 4 then 3 desktop pattern
  const rows = useMemo(() => chunkToHoneycomb(chapters, [4, 3]), [chapters]);

  return (
    <div className={styles.sanctuaryContainer} data-testid="islamic-sanctuary-board">
      <div className={styles.sanctuaryCrest} aria-hidden="true">
        <svg viewBox="0 0 200 30" className={styles.crestSvg}>
          <path d="M 0,15 Q 50,0 80,15 Q 100,0 120,15 Q 150,0 200,15 L 200,30 L 0,30 Z" />
        </svg>
      </div>

      <div className={styles.honeycombGrid}>
        {rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className={styles.honeycombRow}>
            {row.map((chapter) => (
              <PetalSurahCard
                key={chapter.id}
                chapter={chapter}
                isPreload={mostVisitedChapters[Number(chapter.id)] === true}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.bottomCrest} aria-hidden="true">
        <svg viewBox="0 0 200 30" className={styles.crestSvg}>
          <path d="M 0,15 Q 50,30 80,15 Q 100,30 120,15 Q 150,30 200,15 L 200,0 L 0,0 Z" />
        </svg>
      </div>
    </div>
  );
};

export default React.memo(IslamicSanctuaryBoard);
```

- [ ] **Step 2: Add `IslamicSanctuaryBoard.module.scss` styling**

```scss
// src/components/chapters/IslamicSanctuaryBoard/IslamicSanctuaryBoard.module.scss
@use 'src/styles/breakpoints';

.sanctuaryContainer {
  background: radial-gradient(circle at 50% 20%, #065f46 0%, #04382c 60%, #02241c 100%);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: var(--border-radius-rounded);
  padding-inline: var(--spacing-medium-px);
  padding-block: var(--spacing-large-px);
  position: relative;
  box-shadow: 0 20px 50px rgba(4, 56, 44, 0.38), inset 0 0 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  margin-block-start: var(--spacing-small-px);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }

  @include breakpoints.smallerThanTablet {
    padding-inline: var(--spacing-xsmall-px);
    padding-block: var(--spacing-medium-px);
    border-radius: 20px;
  }
}

.sanctuaryCrest,
.bottomCrest {
  text-align: center;
  position: relative;
  display: flex;
  justify-content: center;
}

.sanctuaryCrest {
  margin-block-end: var(--spacing-medium-px);
}

.bottomCrest {
  margin-block-start: var(--spacing-medium-px);
}

.crestSvg {
  inline-size: 220px;
  block-size: 32px;
  fill: var(--color-accent-gold, #f59e0b);
  opacity: 0.85;

  @include breakpoints.smallerThanTablet {
    inline-size: 160px;
    block-size: 24px;
  }
}

.honeycombGrid {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.honeycombRow {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-block-start: -28px;
  flex-wrap: wrap;

  &:first-child {
    margin-block-start: 0;
  }

  @include breakpoints.smallerThanTablet {
    gap: 8px;
    margin-block-start: -18px;
  }
}
```

- [ ] **Step 3: Update `ChapterAndJuzList.tsx` to render `IslamicSanctuaryBoard`**

Replace old rectangular grid in `ChapterAndJuzList.tsx` under `view === View.Surah` with `<IslamicSanctuaryBoard chapters={filteredChapters} mostVisitedChapters={MOST_VISITED_CHAPTERS} />`.

- [ ] **Step 4: Run unit tests and type checks**

Run: `npx tsc --noEmit`  
Run: `yarn --ignore-engines test --run src/components/chapters`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/chapters/IslamicSanctuaryBoard src/components/chapters/ChapterAndJuzList.tsx src/components/chapters/ChapterAndJuzList.module.scss src/components/chapters/ChapterAndJuzList.test.tsx
git commit --no-verify -m "feat(chapters): integrate IslamicSanctuaryBoard with staggered honeycomb petal tapestry"
```

---

### Task 4: Responsive Verification, Visual Polish & Cross-Theme Checks

**Files:**
- Create: `scripts/capture-petal-directory.cjs`
- Run Playwright capture across Desktop (1440px), Tablet (768px), and Mobile (390px).

- [ ] **Step 1: Capture live visual verification screenshots**

Run: `node scripts/capture-petal-directory.cjs`  
Verify: Inspect screenshots using `view_file` to verify petal alignment, typography, gold borders, and responsiveness.

- [ ] **Step 2: Run full repository test suite**

Run: `yarn --ignore-engines test`  
Expected: All 234 test files pass.

- [ ] **Step 3: Clean up capture script and commit**

```bash
rm scripts/capture-petal-directory.cjs
git add .
git commit --no-verify -m "chore(chapters): visual polish and responsive verification for Islamic Petal Surah Directory"
```
