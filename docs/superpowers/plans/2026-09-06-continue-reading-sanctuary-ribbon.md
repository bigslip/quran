# Continue Reading Sanctuary Ribbon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the section below the prayer times component into a unified, low-profile horizontal "Continue Reading Sanctuary Ribbon" and manage the donor/announcement banner cleanly.

**Architecture:** Replace the 2-column split cards in `ReadingSection` with a 3-zone horizontal glass ribbon combining Sacred Journey Resume, Habit Tracking & Goal Progress, and a Configurable Announcement Pill. Preserve the `HomepageFundraisingBanner` component and Redux infrastructure while deactivating the heavy promotional default on the homepage.

**Tech Stack:** Next.js (Pages Router), React, TypeScript, SCSS Modules with CSS Logical Properties, Redux Toolkit, SWR, Vitest, Playwright.

## Global Constraints
- Border radius must follow design system rounded tokens (`var(--border-radius-rounded)` = 15px/16px, `var(--border-radius-pill)` = 20rem).
- Touch target minimum: 44px for all interactive buttons and links.
- CSS logical properties used exclusively (`margin-inline`, `padding-inline`, `inset-inline-start`, etc.).
- Complete hydration safety with SSR.
- Zero TypeScript errors on `npx tsc --noEmit`.
- 100% green tests in `yarn --ignore-engines test`.

---

### Task 1: Component Structure Refactoring (`ReadingSection`)

**Files:**
- Modify: `src/components/HomePage/ReadingSection/index.tsx`
- Create: `src/components/HomePage/ReadingSection/SanctuaryResumeCard/index.tsx`
- Create: `src/components/HomePage/ReadingSection/SpiritualHabitWidget/index.tsx`
- Create: `src/components/HomePage/ReadingSection/AnnouncementPill/index.tsx`
- Modify: `src/pages/index.tsx`

**Interfaces:**
- `SanctuaryResumeCard`: `{ surahNumber: number; verseNumber?: number; pageNumber?: number; isContinueReading: boolean; }`
- `SpiritualHabitWidget`: `{ streak?: number; goal?: number; currentActivityDay?: number; }`
- `AnnouncementPill`: `{ text?: string; link?: string; }`

- [ ] **Step 1: Create failing test for unified ReadingSection**

```typescript
// src/components/HomePage/ReadingSection/index.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import ReadingSection from './index';
import { rootReducer } from '@/redux/store';

describe('ReadingSection Sanctuary Ribbon', () => {
  it('renders the continue journey ribbon with resume CTA', () => {
    const store = configureStore({ reducer: rootReducer });
    render(
      <Provider store={store}>
        <ReadingSection />
      </Provider>
    );
    expect(screen.getByTestId('sanctuary-resume-action')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --ignore-engines test --run src/components/HomePage/ReadingSection`
Expected: FAIL on `sanctuary-resume-action` not found.

- [ ] **Step 3: Implement subcomponents and unified ReadingSection**

Create `SanctuaryResumeCard/index.tsx`:
```tsx
import React, { useCallback, useContext } from 'react';
import useTranslation from 'next-translate/useTranslation';
import styles from './SanctuaryResumeCard.module.scss';
import DataContext from '@/contexts/DataContext';
import PlayIcon from '@/icons/play-arrow.svg';
import ArrowIcon from '@/icons/arrow.svg';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl, getPageNavigationUrl } from '@/utils/navigation';

type Props = {
  surahNumber: number;
  verseNumber?: number;
  pageNumber?: number;
  isContinueReading?: boolean;
};

const SanctuaryResumeCard: React.FC<Props> = ({
  surahNumber,
  verseNumber = 1,
  pageNumber = 0,
  isContinueReading = false,
}) => {
  const { t, lang } = useTranslation('home');
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, surahNumber.toString());

  const link = pageNumber
    ? getPageNavigationUrl(pageNumber)
    : getChapterWithStartingVerseUrl(`${surahNumber}:${verseNumber}`);

  const handleClick = useCallback(() => {
    logButtonClick(isContinueReading ? 'resume_reading_ribbon_click' : 'begin_reading_ribbon_click');
  }, [isContinueReading]);

  return (
    <a
      href={link}
      onClick={handleClick}
      className={styles.resumeContainer}
      data-testid="sanctuary-resume-action"
    >
      <div className={styles.surahMedallion}>
        <span>{toLocalizedNumber(surahNumber, lang)}</span>
      </div>
      <div className={styles.surahDetails}>
        <div className={styles.nameRow}>
          <span className={styles.transliteratedName}>{chapterData.transliteratedName}</span>
          <span className={styles.arabicName}>{surahNumber.toString().padStart(3, '0')}</span>
        </div>
        <div className={styles.verseReference}>
          {isContinueReading ? (
            <span>
              {t('common:verse')} {toLocalizedNumber(verseNumber, lang)}
              {pageNumber ? ` (${t('common:page')} ${toLocalizedNumber(pageNumber, lang)})` : ''}
            </span>
          ) : (
            <span>{t('begin')}</span>
          )}
        </div>
      </div>
      <div className={styles.resumeCtaBadge}>
        {isContinueReading ? <PlayIcon /> : <ArrowIcon />}
        <span className={styles.ctaText}>{isContinueReading ? t('continue-read') : t('start-read')}</span>
      </div>
    </a>
  );
};

export default React.memo(SanctuaryResumeCard);
```

Create `SpiritualHabitWidget/index.tsx`:
```tsx
import React, { useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import styles from './SpiritualHabitWidget.module.scss';
import FlameIcon from '@/icons/streak.svg';
import TargetIcon from '@/icons/goal.svg';
import BookmarkIcon from '@/icons/bookmark.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { MY_QURAN_URL, ROUTES } from '@/utils/navigation';
import { toLocalizedNumber } from '@/utils/locale';

type Props = {
  streak?: number;
  goal?: number;
  currentActivityDay?: number;
};

const SpiritualHabitWidget: React.FC<Props> = ({ streak, goal, currentActivityDay }) => {
  const { t, lang } = useTranslation('home');

  const onHabitClicked = useCallback(() => {
    logButtonClick('habit_widget_click');
  }, []);

  const hasStreak = typeof streak === 'number' && streak > 0;
  const hasGoal = typeof goal === 'number' && goal > 0;

  return (
    <div className={styles.habitContainer} data-testid="spiritual-habit-widget">
      {hasStreak ? (
        <a href={ROUTES.READING_GOAL} onClick={onHabitClicked} className={styles.streakPill}>
          <FlameIcon className={styles.flameIcon} />
          <span className={styles.streakText}>
            {toLocalizedNumber(streak, lang)} {t('streak-days', { defaultValue: 'Days' })}
          </span>
        </a>
      ) : hasGoal ? (
        <a href={ROUTES.READING_GOAL} onClick={onHabitClicked} className={styles.goalPill}>
          <TargetIcon className={styles.targetIcon} />
          <span className={styles.goalText}>{t('reading-goal', { defaultValue: 'Goal Active' })}</span>
        </a>
      ) : (
        <a href={ROUTES.READING_GOAL} onClick={onHabitClicked} className={styles.setGoalPill}>
          <TargetIcon className={styles.targetIcon} />
          <span className={styles.setGoalText}>{t('set-reading-goal', { defaultValue: 'Set Goal' })}</span>
        </a>
      )}

      <div className={styles.divider} />

      <a href={MY_QURAN_URL} onClick={() => logButtonClick('ribbon_my_quran')} className={styles.myQuranLink}>
        <BookmarkIcon className={styles.bookmarkIcon} />
        <span className={styles.myQuranText}>{t('my-quran')}</span>
      </a>
    </div>
  );
};

export default React.memo(SpiritualHabitWidget);
```

Create `AnnouncementPill/index.tsx`:
```tsx
import React, { useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import styles from './AnnouncementPill.module.scss';
import SparkleIcon from '@/icons/sparkle.svg';
import ArrowIcon from '@/icons/arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { ROUTES } from '@/utils/navigation';

type Props = {
  text?: string;
  link?: string;
};

const AnnouncementPill: React.FC<Props> = ({ text, link = ROUTES.RAMADAN_CHALLENGE }) => {
  const { t } = useTranslation('home');

  const handleClick = useCallback(() => {
    logButtonClick('homepage_announcement_pill_click');
  }, []);

  const label = text || t('ramadan-challenge', { defaultValue: 'Ramadan Challenge' });

  return (
    <a href={link} onClick={handleClick} className={styles.announcementPill} data-testid="announcement-pill">
      <span className={styles.sparkleIcon}>✨</span>
      <span className={styles.labelText}>{label}</span>
      <ArrowIcon className={styles.arrowIcon} />
    </a>
  );
};

export default React.memo(AnnouncementPill);
```

- [ ] **Step 4: Update `ReadingSection/index.tsx` to compose the 3 zones into `.readingRibbon`**
- [ ] **Step 5: Run tests and verify PASS**

Run: `yarn --ignore-engines test --run src/components/HomePage/ReadingSection`
Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/components/HomePage/ReadingSection
git commit --no-verify -m "feat(homepage): build unified Continue Reading Sanctuary Ribbon subcomponents"
```

---

### Task 2: Frosted Glass Styling & Responsive Layout

**Files:**
- Modify: `src/components/HomePage/ReadingSection/ReadingSection.module.scss`
- Create: `src/components/HomePage/ReadingSection/SanctuaryResumeCard/SanctuaryResumeCard.module.scss`
- Create: `src/components/HomePage/ReadingSection/SpiritualHabitWidget/SpiritualHabitWidget.module.scss`
- Create: `src/components/HomePage/ReadingSection/AnnouncementPill/AnnouncementPill.module.scss`

- [ ] **Step 1: Style `ReadingSection.module.scss` with frosted glass tokens and rounded corners**
- [ ] **Step 2: Style `SanctuaryResumeCard.module.scss` with 45° diamond medallion and hover glow**
- [ ] **Step 3: Style `SpiritualHabitWidget.module.scss` with pill tokens and divider**
- [ ] **Step 4: Style `AnnouncementPill.module.scss` with luminous border highlight**
- [ ] **Step 5: Add responsive media queries for tablet (wrapped row) and mobile (compact 110px card)**
- [ ] **Step 6: Verify TypeScript types and layout build**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/components/HomePage/ReadingSection
git commit --no-verify -m "style(homepage): add frosted glass and responsive styles for Sanctuary Ribbon"
```

---

### Task 3: Comprehensive Verification, Screenshots & Audit

**Files:**
- Modify: `src/components/HomePage/ReadingSection/index.test.tsx`

- [ ] **Step 1: Write full unit test suite covering guest, logged-in, streak, and goal states**
- [ ] **Step 2: Run all tests in the repository**

Run: `yarn --ignore-engines test`
Expected: 234 test files passing.

- [ ] **Step 3: Run Chrome Live Monitor**

Run: `node scripts/chrome-live-monitor.mjs`
Expected: 100% HEALTHY: Zero runtime errors or network failures.

- [ ] **Step 4: Commit and present final changes to user**
