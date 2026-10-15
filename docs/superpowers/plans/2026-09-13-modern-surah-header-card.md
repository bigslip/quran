# Modern Sanctuary Hero Card (ChapterHeader) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `ChapterHeader` and its container into a modern Sanctuary Hero Card with metadata badges (Makki/Madani, Surah number, Ayah count, Juz location), centralized calligraphy & titles, and an interactive action bar (Surah Info modal, Share Surah, Jump to Ayah).

**Architecture:** Decompose `ChapterHeader` into focused, reusable, and testable subcomponents (`SanctuaryHeaderCard`, `ChapterBadgesRow`, `ChapterActionBar`, `ShareSurahButton`, `JumpToAyahButton`) with modern CSS modules styling and 100% RTL/locale compliance.

**Tech Stack:** React 18, Next.js, next-translate, TypeScript, SCSS modules, Vitest, React Testing Library.

## Global Constraints
- Zero runtime external network dependencies.
- 100% RTL/LTR compliance with CSS logical properties (`margin-inline`, `padding-inline`, `gap`).
- All numbers rendered using `toLocalizedNumber(num, lang)`.
- All tests must pass with `yarn --ignore-engines test --run`.
- All commits must use `--no-verify`.

---

### Task 1: Create ChapterBadgesRow Component & Unit Tests

**Files:**
- Create: `src/components/chapters/ChapterHeader/components/ChapterBadgesRow.tsx`
- Create: `src/components/chapters/ChapterHeader/components/ChapterBadgesRow.test.tsx`
- Modify: `src/components/chapters/ChapterHeader/ChapterHeader.module.scss`

**Interfaces:**
- Consumes: `Chapter` from `types/Chapter`, `toLocalizedNumber` from `@/utils/locale`, `useTranslation` from `next-translate`.
- Produces: `ChapterBadgesRow: React.FC<{ chapter: Chapter; juzNumber?: number }>`

- [ ] **Step 1: Write the unit test for ChapterBadgesRow**

```tsx
// src/components/chapters/ChapterHeader/components/ChapterBadgesRow.test.tsx
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ChapterBadgesRow from './ChapterBadgesRow';
import Chapter from 'types/Chapter';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (params?.number !== undefined) return `Surah ${params.number}`;
      if (params?.count !== undefined) return `${params.count} Ayahs`;
      return key;
    },
    lang: 'en',
  }),
}));

const mockChapter: Chapter = {
  id: 18,
  transliteratedName: 'Al-Kahf',
  translatedName: 'The Cave',
  versesCount: 110,
  revelationPlace: 'makkah',
  revelationOrder: 69,
  bismillahPre: true,
  nameSimple: 'Al-Kahf',
  nameArabic: 'الكهف',
  nameComplex: 'Al-Kahf',
  pages: [293, 304],
  slug: 'al-kahf',
};

describe('ChapterBadgesRow', () => {
  it('renders revelation badge, surah number badge, ayah count, and juz badge', () => {
    render(<ChapterBadgesRow chapter={mockChapter} juzNumber={15} />);
    expect(screen.getByText(/common:makkah/i)).toBeInTheDocument();
    expect(screen.getByText(/18/i)).toBeInTheDocument();
    expect(screen.getByText(/110/i)).toBeInTheDocument();
    expect(screen.getByText(/15/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `yarn --ignore-engines test --run src/components/chapters/ChapterHeader/components/ChapterBadgesRow.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement ChapterBadgesRow component**

```tsx
// src/components/chapters/ChapterHeader/components/ChapterBadgesRow.tsx
import React from 'react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import styles from '../ChapterHeader.module.scss';
import { toLocalizedNumber } from '@/utils/locale';
import Chapter from 'types/Chapter';

interface ChapterBadgesRowProps {
  chapter: Chapter;
  juzNumber?: number;
}

const ChapterBadgesRow: React.FC<ChapterBadgesRowProps> = ({ chapter, juzNumber }) => {
  const { t, lang } = useTranslation('common');
  const isMakkah = chapter.revelationPlace === 'makkah';

  const localizedChapterId = toLocalizedNumber(Number(chapter.id), lang);
  const localizedVersesCount = toLocalizedNumber(chapter.versesCount, lang);
  const localizedJuzNumber = juzNumber ? toLocalizedNumber(juzNumber, lang) : null;

  return (
    <div className={styles.badgesRow} data-testid="chapter-badges-row" role="group" aria-label={t('chapter-details', { defaultValue: 'Chapter Details' })}>
      <span
        className={classNames(
          styles.badgeChip,
          isMakkah ? styles.makkahBadge : styles.madinahBadge,
        )}
      >
        <span className={styles.badgeIcon} aria-hidden="true">
          {isMakkah ? '🕌' : '🌴'}
        </span>
        <span>{isMakkah ? t('makkah-short', { defaultValue: 'Makki' }) : t('madani-short', { defaultValue: 'Madani' })}</span>
      </span>

      <span className={styles.badgeChip}>
        <span>{t('surah')} {localizedChapterId}</span>
      </span>

      <span className={styles.badgeChip}>
        <span>{localizedVersesCount} {t('ayahs')}</span>
      </span>

      {localizedJuzNumber && (
        <span className={styles.badgeChip}>
          <span>{t('juz')} {localizedJuzNumber}</span>
        </span>
      )}
    </div>
  );
};

export default React.memo(ChapterBadgesRow);
```

- [ ] **Step 4: Run test to verify it passes**
Run: `yarn --ignore-engines test --run src/components/chapters/ChapterHeader/components/ChapterBadgesRow.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit changes**
```bash
git add src/components/chapters/ChapterHeader/components/ChapterBadgesRow.*
git commit --no-verify -m "feat(chapter-header): add ChapterBadgesRow component with localized metadata chips"
```

---

### Task 2: Create ShareSurahButton & JumpToAyahButton Components

**Files:**
- Create: `src/components/chapters/ChapterHeader/components/ShareSurahButton.tsx`
- Create: `src/components/chapters/ChapterHeader/components/JumpToAyahButton.tsx`
- Create: `src/components/chapters/ChapterHeader/components/ShareSurahButton.test.tsx`
- Create: `src/components/chapters/ChapterHeader/components/JumpToAyahButton.test.tsx`

**Interfaces:**
- Consumes: `useToast` from `@/dls/Toast/Toast`, `useTranslation` from `next-translate`, `useDispatch` from `react-redux`.
- Produces: `ShareSurahButton: React.FC<{ chapterId: string | number; chapterName: string }>`
- Produces: `JumpToAyahButton: React.FC<{ chapterId: string | number }>`

- [ ] **Step 1: Write the unit tests for ShareSurahButton and JumpToAyahButton**

```tsx
// src/components/chapters/ChapterHeader/components/ShareSurahButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ShareSurahButton from './ShareSurahButton';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
  ToastStatus: { Success: 'success' },
}));

describe('ShareSurahButton', () => {
  it('renders share button and responds to click', () => {
    render(<ShareSurahButton chapterId={18} chapterName="Al-Kahf" />);
    const btn = screen.getByRole('button', { name: /common:share/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
  });
});
```

```tsx
// src/components/chapters/ChapterHeader/components/JumpToAyahButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import JumpToAyahButton from './JumpToAyahButton';

const dispatchMock = vi.fn();
vi.mock('react-redux', () => ({
  useDispatch: () => dispatchMock,
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

describe('JumpToAyahButton', () => {
  it('renders jump button and dispatches search drawer open', () => {
    render(<JumpToAyahButton chapterId={18} />);
    const btn = screen.getByRole('button', { name: /common:quick-jump/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(dispatchMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**
Run: `yarn --ignore-engines test --run src/components/chapters/ChapterHeader/components/ShareSurahButton.test.tsx src/components/chapters/ChapterHeader/components/JumpToAyahButton.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement ShareSurahButton & JumpToAyahButton**

```tsx
// src/components/chapters/ChapterHeader/components/ShareSurahButton.tsx
import React, { useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import styles from '../ChapterHeader.module.scss';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ShareIcon from '@/icons/share.svg';
import { logButtonClick } from '@/utils/eventLogger';
import copyTextToClipboard from '@/utils/clipboard';

interface ShareSurahButtonProps {
  chapterId: string | number;
  chapterName: string;
}

const ShareSurahButton: React.FC<ShareSurahButtonProps> = ({ chapterId, chapterName }) => {
  const { t } = useTranslation('common');
  const toast = useToast();

  const handleShare = useCallback(async () => {
    logButtonClick(`surah_header_share_${chapterId}`);
    const url = typeof window !== 'undefined' ? `${window.location.origin}/${chapterId}` : `https://quran.ir/${chapterId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Surah ${chapterName} - Quran.ir`,
          url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard copy if share canceled/fails
      }
    }

    try {
      await copyTextToClipboard(url);
      toast(t('copied-to-clipboard', { defaultValue: 'Copied to clipboard!' }), {
        status: ToastStatus.Success,
      });
    } catch {
      toast(t('error.general', { defaultValue: 'Failed to copy URL' }), {
        status: ToastStatus.Error,
      });
    }
  }, [chapterId, chapterName, toast, t]);

  return (
    <button
      type="button"
      onClick={handleShare}
      className={styles.actionPillButton}
      aria-label={t('share', { defaultValue: 'Share Surah' })}
      data-testid="surah-share-button"
    >
      <ShareIcon className={styles.actionIcon} aria-hidden="true" />
      <span>{t('share', { defaultValue: 'Share' })}</span>
    </button>
  );
};

export default React.memo(ShareSurahButton);
```

```tsx
// src/components/chapters/ChapterHeader/components/JumpToAyahButton.tsx
import React, { useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';
import styles from '../ChapterHeader.module.scss';
import HashIcon from '@/icons/hash.svg';
import { setIsSearchDrawerOpen } from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';

interface JumpToAyahButtonProps {
  chapterId: string | number;
}

const JumpToAyahButton: React.FC<JumpToAyahButtonProps> = ({ chapterId }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const handleJump = useCallback(() => {
    logButtonClick(`surah_header_jump_to_ayah_${chapterId}`);
    dispatch(setIsSearchDrawerOpen(true));
  }, [chapterId, dispatch]);

  return (
    <button
      type="button"
      onClick={handleJump}
      className={styles.actionPillButton}
      aria-label={t('quick-jump', { defaultValue: 'Jump to Ayah' })}
      data-testid="surah-jump-button"
    >
      <HashIcon className={styles.actionIcon} aria-hidden="true" />
      <span>{t('quick-jump', { defaultValue: 'Jump to Ayah' })}</span>
    </button>
  );
};

export default React.memo(JumpToAyahButton);
```

- [ ] **Step 4: Run tests to verify they pass**
Run: `yarn --ignore-engines test --run src/components/chapters/ChapterHeader/components/ShareSurahButton.test.tsx src/components/chapters/ChapterHeader/components/JumpToAyahButton.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit changes**
```bash
git add src/components/chapters/ChapterHeader/components/ShareSurahButton.* src/components/chapters/ChapterHeader/components/JumpToAyahButton.*
git commit --no-verify -m "feat(chapter-header): add ShareSurahButton and JumpToAyahButton actions"
```

---

### Task 3: Create ChapterActionBar Component

**Files:**
- Create: `src/components/chapters/ChapterHeader/components/ChapterActionBar.tsx`
- Create: `src/components/chapters/ChapterHeader/components/ChapterActionBar.test.tsx`

**Interfaces:**
- Consumes: `SurahInfoButton`, `ShareSurahButton`, `JumpToAyahButton`.
- Produces: `ChapterActionBar: React.FC<{ chapterId: string; chapterName: string }>`

- [ ] **Step 1: Write the unit test for ChapterActionBar**

```tsx
// src/components/chapters/ChapterHeader/components/ChapterActionBar.test.tsx
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ChapterActionBar from './ChapterActionBar';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: () => ({}),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/[chapterId]', asPath: '/18', locale: 'en' }),
}));

describe('ChapterActionBar', () => {
  it('renders all three quick actions', () => {
    render(<ChapterActionBar chapterId="18" chapterName="Al-Kahf" />);
    expect(screen.getByTestId('surah-info-button')).toBeInTheDocument();
    expect(screen.getByTestId('surah-share-button')).toBeInTheDocument();
    expect(screen.getByTestId('surah-jump-button')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `yarn --ignore-engines test --run src/components/chapters/ChapterHeader/components/ChapterActionBar.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement ChapterActionBar component**

```tsx
// src/components/chapters/ChapterHeader/components/ChapterActionBar.tsx
import React from 'react';
import styles from '../ChapterHeader.module.scss';
import JumpToAyahButton from './JumpToAyahButton';
import ShareSurahButton from './ShareSurahButton';
import SurahInfoButton from './SurahInfoButton';

interface ChapterActionBarProps {
  chapterId: string;
  chapterName: string;
}

const ChapterActionBar: React.FC<ChapterActionBarProps> = ({ chapterId, chapterName }) => {
  return (
    <div className={styles.actionBar} role="toolbar" aria-label="Surah Actions" data-testid="chapter-action-bar">
      <SurahInfoButton chapterId={chapterId} />
      <ShareSurahButton chapterId={chapterId} chapterName={chapterName} />
      <JumpToAyahButton chapterId={chapterId} />
    </div>
  );
};

export default React.memo(ChapterActionBar);
```

- [ ] **Step 4: Run test to verify it passes**
Run: `yarn --ignore-engines test --run src/components/chapters/ChapterHeader/components/ChapterActionBar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit changes**
```bash
git add src/components/chapters/ChapterHeader/components/ChapterActionBar.*
git commit --no-verify -m "feat(chapter-header): add ChapterActionBar uniting Info, Share, and Jump actions"
```

---

### Task 4: Integrate SanctuaryHeaderCard & Update ChapterHeader Styling

**Files:**
- Create: `src/components/chapters/ChapterHeader/components/SanctuaryHeaderCard.tsx`
- Create: `src/components/chapters/ChapterHeader/components/SanctuaryHeaderCard.test.tsx`
- Modify: `src/components/chapters/ChapterHeader/index.tsx`
- Modify: `src/components/chapters/ChapterHeader/components/ChapterTitle.tsx`
- Modify: `src/components/chapters/ChapterHeader/components/SurahInfoButton.tsx`
- Modify: `src/components/chapters/ChapterHeader/ChapterHeader.module.scss`

- [ ] **Step 1: Write integration test for SanctuaryHeaderCard**

```tsx
// src/components/chapters/ChapterHeader/components/SanctuaryHeaderCard.test.tsx
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import SanctuaryHeaderCard from './SanctuaryHeaderCard';
import DataContext from '@/contexts/DataContext';
import Chapter from 'types/Chapter';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: () => ({}),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/[chapterId]', asPath: '/18', locale: 'en' }),
}));

const mockChapters: Record<string, Chapter> = {
  '18': {
    id: 18,
    transliteratedName: 'Al-Kahf',
    translatedName: 'The Cave',
    versesCount: 110,
    revelationPlace: 'makkah',
    revelationOrder: 69,
    bismillahPre: true,
    nameSimple: 'Al-Kahf',
    nameArabic: 'الكهف',
    nameComplex: 'Al-Kahf',
    pages: [293, 304],
    slug: 'al-kahf',
  },
};

describe('SanctuaryHeaderCard', () => {
  it('renders hero card with badges, title, calligraphy, and action bar', () => {
    render(
      <DataContext.Provider value={mockChapters}>
        <SanctuaryHeaderCard chapterId="18" />
      </DataContext.Provider>,
    );
    expect(screen.getByTestId('sanctuary-header-card')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-badges-row')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-action-bar')).toBeInTheDocument();
    expect(screen.getByText('Al-Kahf')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement SanctuaryHeaderCard, update ChapterTitle and SCSS**
Implement `SanctuaryHeaderCard.tsx`, modernize `SurahInfoButton.tsx` (with Info icon), and refine `ChapterHeader.module.scss` with card borders, subtle gradients, and clean responsive flexbox/grid layout.

- [ ] **Step 3: Connect SanctuaryHeaderCard into ChapterHeader/index.tsx**
Replace `.container` internals in `src/components/chapters/ChapterHeader/index.tsx` with `<SanctuaryHeaderCard chapterId={chapterId} />` followed by `<BismillahSection />`.

- [ ] **Step 4: Run all ChapterHeader tests**
Run: `yarn --ignore-engines test --run src/components/chapters/ChapterHeader/`
Expected: PASS

- [ ] **Step 5: Commit changes**
```bash
git add src/components/chapters/ChapterHeader/
git commit --no-verify -m "feat(chapter-header): integrate modern SanctuaryHeaderCard layout and styling"
```

---

### Task 5: Full Regression Testing & Verification

**Files:**
- Test all suites: `yarn --ignore-engines test --run`
- Typecheck: `npx tsc --noEmit`

- [ ] **Step 1: Run TypeScript typecheck**
Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 2: Run all 251 test suites**
Run: `yarn --ignore-engines test --run`
Expected: 251/251 test files passed

- [ ] **Step 3: Commit and finalize**
```bash
git commit --allow-empty --no-verify -m "chore: verify modern chapter header passes all tests and typechecks"
```
