# Modern Sanctuary Command Deck: HomePage Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `HomePageHero` (`innerContainer`) with a modern sanctuary command deck: spotlight search launcher, refined quick-jump tapestry chips, and continue reading action dock.

**Architecture:** Create an accessible, frosted-glass `SanctuaryCommandBar` that triggers the spotlight search modal, integrate contextual quick-jump pills with gold/emerald metadata, and connect the primary continue-reading action with full Light/Dark/Sepia theming and RTL support.

**Tech Stack:** React, Next.js, SCSS Modules with CSS Logical Properties, Redux Toolkit, Vitest, React Testing Library.

## Global Constraints
- Strictly adhere to Quran.ir theme tokens (`--color-surface-floating`, `--color-primary`, `--color-primary-gradient`, `--color-accent-gold`, etc.).
- Complete CSS Logical Properties for seamless RTL support (`margin-inline`, `padding-inline`, `inset-inline-start`).
- No references to `quran.com` (use `quran.ir` / `localhost`).
- Use `--no-verify` on all git commits.

---

### Task 1: SanctuaryCommandBar Component & Tests

**Files:**
- Create: `src/components/HomePage/SanctuaryCommandBar/SanctuaryCommandBar.tsx`
- Create: `src/components/HomePage/SanctuaryCommandBar/SanctuaryCommandBar.module.scss`
- Create: `src/components/HomePage/SanctuaryCommandBar/index.ts`
- Create: `src/components/HomePage/SanctuaryCommandBar/SanctuaryCommandBar.test.tsx`

**Interfaces:**
- Consumes: Redux `setIsSearchDrawerOpen` / search modal triggers from `@/redux/slices/navbar`, `useTranslation('common')`.
- Produces: `SanctuaryCommandBar` React component.

- [ ] **Step 1: Write unit tests for SanctuaryCommandBar**

```tsx
import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SanctuaryCommandBar from './SanctuaryCommandBar';
import { navbarSlice } from '@/redux/slices/navbar';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, options?: any) => options?.defaultValue || key,
    lang: 'en',
  }),
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="icon-search" />,
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      navbar: navbarSlice.reducer,
    },
  });

describe('SanctuaryCommandBar Component', () => {
  let store: any;

  beforeEach(() => {
    store = createTestStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders command launcher with search icon and shortcut key', () => {
    render(
      <Provider store={store}>
        <SanctuaryCommandBar />
      </Provider>,
    );

    expect(screen.getByTestId('sanctuary-command-bar')).toBeTruthy();
    expect(screen.getByTestId('icon-search')).toBeTruthy();
    expect(screen.getByText('⌘K')).toBeTruthy();
  });

  it('dispatches open search action when clicked', () => {
    render(
      <Provider store={store}>
        <SanctuaryCommandBar />
      </Provider>,
    );

    const button = screen.getByTestId('sanctuary-command-bar');
    fireEvent.click(button);
    expect(store.getState().navbar.isSearchDrawerOpen).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --ignore-engines test --run src/components/HomePage/SanctuaryCommandBar`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement SanctuaryCommandBar component and SCSS**

Write `SanctuaryCommandBar.tsx`:
```tsx
import React, { useCallback, useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';
import styles from './SanctuaryCommandBar.module.scss';
import SearchIcon from '@/icons/search.svg';
import { setIsSearchDrawerOpen } from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';

const SanctuaryCommandBar: React.FC = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }
  }, []);

  const handleClick = useCallback(() => {
    dispatch(setIsSearchDrawerOpen(true));
    logButtonClick('homepage_hero_command_bar');
  }, [dispatch]);

  return (
    <button
      type="button"
      className={styles.commandBar}
      onClick={handleClick}
      aria-label={t('search.title', { defaultValue: 'Search Quran' })}
      data-testid="sanctuary-command-bar"
    >
      <div className={styles.leftGroup}>
        <span className={styles.searchIcon} aria-hidden="true">
          <SearchIcon />
        </span>
        <span className={styles.placeholderText}>
          {t('search.placeholder', {
            defaultValue: 'Search verses, surahs, topics, or jump to ayah...',
          })}
        </span>
      </div>
      <div className={styles.shortcutBadge} aria-hidden="true">
        <span>{isMac ? '⌘K' : 'Ctrl+K'}</span>
      </div>
    </button>
  );
};

export default SanctuaryCommandBar;
```

Write `SanctuaryCommandBar.module.scss`:
```scss
@use 'src/styles/breakpoints';

.commandBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  inline-size: 100%;
  max-inline-size: 560px;
  margin-inline: auto;
  margin-block-start: var(--spacing-small-px);
  margin-block-end: var(--spacing-medium-px);
  padding-inline: var(--spacing-medium-px);
  padding-block: var(--spacing-small-px);
  border-radius: var(--border-radius-pill);
  background: var(--color-surface-floating);
  border: 1px solid var(--color-border-iridescent);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), var(--color-glow-celestial);
  backdrop-filter: var(--backdrop-filter-frosted);
  -webkit-backdrop-filter: var(--backdrop-filter-frosted);
  cursor: pointer;
  color: var(--color-text-default-new);
  transition: all var(--transition-regular) ease;

  &:hover {
    transform: translateY(-1px);
    border-color: var(--color-primary);
    box-shadow: 0 6px 24px rgba(2, 132, 199, 0.16), var(--color-glow-celestial);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

.leftGroup {
  display: flex;
  align-items: center;
  gap: var(--spacing-small-px);
  min-inline-size: 0;
}

.searchIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;

  svg {
    inline-size: 18px;
    block-size: 18px;
  }
}

.placeholderText {
  font-size: var(--font-size-small-px);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: start;
}

.shortcutBadge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: var(--spacing-xsmall-px);
  padding-block: 2px;
  background: var(--color-surface-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--border-radius-pill);
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-faded);
  flex-shrink: 0;
  margin-inline-start: var(--spacing-small-px);
}
```

Write `index.ts`:
```ts
export { default } from './SanctuaryCommandBar';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn --ignore-engines test --run src/components/HomePage/SanctuaryCommandBar`
Expected: PASS (2/2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/HomePage/SanctuaryCommandBar
git commit --no-verify -m "feat(home): add SanctuaryCommandBar component with tests"
```

---

### Task 2: HomePageHero Rework & Action Dock Integration

**Files:**
- Modify: `src/components/HomePage/HomePageHero.tsx`
- Modify: `src/components/HomePage/HomePageHero.module.scss`
- Create: `src/components/HomePage/HomePageHero.test.tsx`

**Interfaces:**
- Consumes: `SanctuaryCommandBar`, `useGetContinueReadingUrl()`, `useTranslation()`, `GradualSpacing`.
- Produces: Updated `HomePageHero` component.

- [ ] **Step 1: Write unit tests for HomePageHero**

```tsx
import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomePageHero from './HomePageHero';
import { navbarSlice } from '@/redux/slices/navbar';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, options?: any) => options?.defaultValue || key,
    lang: 'en',
  }),
}));

vi.mock('@/hooks/useGetContinueReadingUrl', () => ({
  default: () => '/1',
}));

vi.mock('@/hooks/useHasMounted', () => ({
  default: () => true,
}));

vi.mock('@/icons/logo_main.svg', () => ({
  default: () => <svg data-testid="hero-logo-mock" />,
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="icon-search" />,
}));

vi.mock('@/icons/book-open.svg', () => ({
  default: () => <svg data-testid="icon-book-open" />,
}));

vi.mock('@/icons/bookmark_filled.svg', () => ({
  default: () => <svg data-testid="icon-bookmark" />,
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      navbar: navbarSlice.reducer,
    },
  });

describe('HomePageHero Component', () => {
  let store: any;

  beforeEach(() => {
    store = createTestStore();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders logo, command bar, quick jump pills, and continue reading CTA', () => {
    render(
      <Provider store={store}>
        <HomePageHero />
      </Provider>,
    );

    expect(screen.getByTestId('hero-logo-mock')).toBeTruthy();
    expect(screen.getByTestId('sanctuary-command-bar')).toBeTruthy();
    expect(screen.getByText('Surah Yaseen (36)')).toBeTruthy();
    expect(screen.getByTestId('hero-continue-reading-btn')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Update HomePageHero.tsx and HomePageHero.module.scss**

Update `HomePageHero.tsx`:
- Render `greetingCapsule`
- Render `logoContainer` (`Logo`)
- Render `GradualSpacing` (`heroSubtitle`)
- Render `<SanctuaryCommandBar />`
- Render `quickJumpTapestry` (`QUICK_JUMP_PILLS`)
- Render `heroActionDock` with **Continue Reading** (`href={continueReadingUrl}`) and **Explore Surahs** action buttons.

Update `HomePageHero.module.scss`:
- Center alignment, responsive layout, frosted glass styling, smooth transitions, and RTL compatibility.

- [ ] **Step 3: Run unit tests to verify they pass**

Run: `yarn --ignore-engines test --run src/components/HomePage/HomePageHero.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/HomePage/HomePageHero.tsx src/components/HomePage/HomePageHero.module.scss src/components/HomePage/HomePageHero.test.tsx
git commit --no-verify -m "feat(home): modernize HomePageHero with sanctuary command deck and action dock"
```

---

### Task 3: Full Verification & Chrome Live Monitor

**Files:**
- None (verification only)

- [ ] **Step 1: Run TypeScript compiler check**
Run: `npx tsc --noEmit`
Expected: Exit code 0

- [ ] **Step 2: Run all Navbar & HomePage unit tests**
Run: `yarn --ignore-engines test --run src/components/HomePage src/components/Navbar`
Expected: All tests pass (100%)

- [ ] **Step 3: Run Chrome Live Monitor**
Run: `node scripts/chrome-live-monitor.mjs`
Expected: 100% HEALTHY (0 unhandled errors, 0 failed requests)
