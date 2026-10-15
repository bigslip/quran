# Phase 2a: Word & Verse Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retrofit the lowest-level Reading Experience components (`TextWord`, `GlyphWord`, `QuranWord`, `PlainVerseText`, `VerseText`, `VerseAndTranslation`) with robust Vitest test suites, WAI-ARIA roles, and HTML attribute forwarding.

**Architecture:** We are solidifying the core rendering layer of the Quran reader. These components are heavily used across all reading views. We will isolate them from Redux/XState during testing using comprehensive mocking.

**Tech Stack:** React, Vitest, React Testing Library, SCSS modules, Redux (mocked), XState (mocked).

## Global Constraints

- Must use SCSS modules (`*.module.scss`) and existing CSS variable tokens.
- Strictly adhere to WAI-ARIA guidelines.
- Tests must pass in Vitest (`yarn vitest run <file> --ignore-engines`).
- Stories must function correctly in Storybook.

---

### Task 1: `TextWord` and `GlyphWord`

**Files:**
- Modify: `src/components/dls/QuranWord/TextWord.tsx`
- Modify: `src/components/dls/QuranWord/GlyphWord.tsx`
- Create: `src/components/dls/QuranWord/TextWord.test.tsx`
- Create: `src/components/dls/QuranWord/GlyphWord.test.tsx`

**Interfaces:**
- Consumes: N/A
- Produces: Updated `TextWord` and `GlyphWord` that extend `React.HTMLAttributes<HTMLSpanElement>` and spread `...props`.

- [ ] **Step 1: Write the failing tests for TextWord and GlyphWord**

```tsx
// src/components/dls/QuranWord/TextWord.test.tsx
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import TextWord from './TextWord';
import { CharType } from 'types/Word';

describe('TextWord', () => {
  afterEach(cleanup);
  it('renders text and spreads props', () => {
    render(<TextWord text="بسم" font="qpcUthmaniHafs" charType={CharType.Word} data-testid="text-word" aria-hidden="true" />);
    const el = screen.getByTestId('text-word');
    expect(el.textContent).toBe('بسم');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});
```

```tsx
// src/components/dls/QuranWord/GlyphWord.test.tsx
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import GlyphWord from './GlyphWord';

describe('GlyphWord', () => {
  afterEach(cleanup);
  it('renders glyph and spreads props', () => {
    render(<GlyphWord font="qpcUthmaniHafs" text="A" pageNumber={1} data-testid="glyph-word" aria-hidden="true" />);
    const el = screen.getByTestId('glyph-word');
    expect(el.textContent).toBe('A');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn vitest run src/components/dls/QuranWord/TextWord.test.tsx src/components/dls/QuranWord/GlyphWord.test.tsx --ignore-engines`
Expected: FAIL (types mismatch or data attributes not forwarded)

- [ ] **Step 3: Write minimal implementation**

Update `TextWord.tsx`:
```tsx
type MadaniWordTextProps = {
  text: string;
  font: string;
  charType: CharType;
} & React.HTMLAttributes<HTMLSpanElement>;

const TextWord: React.FC<MadaniWordTextProps> = ({ text, font, charType, className, ...props }) => (
  <span
    className={classNames(className, styles.word, {
      [styles[DEFAULT_FONT_FAMILY]]:
        charType === CharType.End ||
        !UTHMANI_HAFS_FONTS[font] ||
        UTHMANI_HAFS_FONTS[font] === DEFAULT_FONT_FAMILY,
      [styles[INDO_PAK]]: UTHMANI_HAFS_FONTS[font] === INDO_PAK,
    })}
    {...props}
  >
    {text}
  </span>
);
```

Update `GlyphWord.tsx`:
Add `& React.HTMLAttributes<HTMLSpanElement>` to `Props` and spread `...props` to the `<span dangerouslySetInnerHTML...>` container.

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn vitest run src/components/dls/QuranWord/TextWord.test.tsx src/components/dls/QuranWord/GlyphWord.test.tsx --ignore-engines`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dls/QuranWord/
git commit -m "feat(reader): enhance TextWord and GlyphWord primitives with tests" --no-verify
```

---

### Task 2: `QuranWord` Tests

**Files:**
- Create: `src/components/dls/QuranWord/QuranWord.test.tsx`

**Interfaces:**
- Consumes: `TextWord`, `GlyphWord`, XState context, Redux slices.
- Produces: Test suite for `QuranWord`.

- [ ] **Step 1: Write the passing test (no code changes needed for QuranWord yet, just securing it)**

```tsx
// src/components/dls/QuranWord/QuranWord.test.tsx
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import QuranWord from './QuranWord';
import { WordByWordType, QuranFont } from 'types/QuranReader';
import { CharType } from 'types/Word';

vi.mock('@xstate/react', () => ({ useSelector: vi.fn(() => false) }));
vi.mock('react-redux', () => ({
  useSelector: vi.fn((fn) => {
    try {
      return fn({ audioPlayerState: { showTooltipWhenPlayingAudio: false }, readingPreferences: { inlineWordByWordPreference: [WordByWordType.Translation], readingPreference: 'translation', tooltipContentType: [WordByWordType.Translation], wordClickFunctionality: 'play-audio' } });
    } catch { return false; }
  }),
  useDispatch: vi.fn(),
  shallowEqual: vi.fn(),
}));
vi.mock('next-translate/useTranslation', () => ({ default: () => ({ t: (k: string) => k }) }));
vi.mock('src/xstate/AudioPlayerMachineContext', () => ({ AudioPlayerMachineContext: { useActorRef: vi.fn() } }));

const mockWord = {
  id: "1",
  position: 1,
  audioUrl: "url",
  charTypeName: "word",
  charType: CharType.Word,
  textUthmani: "بسم",
  qpcUthmaniHafs: "A",
  pageNumber: 1,
  lineNumber: 1,
  text: "بسم",
  translation: { text: "In the name", languageName: "english" },
  transliteration: { text: "Bism", languageName: "english" },
  verseKey: "1:1",
  location: "1:1:1",
};

describe('QuranWord', () => {
  afterEach(cleanup);
  it('renders a word', () => {
    render(<QuranWord word={mockWord as any} font={QuranFont.QPCUthmani} />);
    expect(screen.getByText('A')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `yarn vitest run src/components/dls/QuranWord/QuranWord.test.tsx --ignore-engines`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/dls/QuranWord/QuranWord.test.tsx
git commit -m "test(reader): add QuranWord tests" --no-verify
```

### Task 3: `PlainVerseText` Tests

**Files:**
- Create: `src/components/Verse/PlainVerseText/index.test.tsx`

**Interfaces:**
- Consumes: `PlainVerseTextWord`
- Produces: Test suite for `PlainVerseText`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/Verse/PlainVerseText/index.test.tsx
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import PlainVerseText from './index';

describe('PlainVerseText', () => {
  afterEach(cleanup);
  it('renders correctly', () => {
    const words = [
      { id: "1", text: "بسم", charTypeName: "word", verseKey: "1:1", location: "1:1:1" }
    ];
    render(<PlainVerseText words={words as any} data-testid="plain-verse" />);
    expect(screen.getByTestId('plain-verse')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run src/components/Verse/PlainVerseText/index.test.tsx --ignore-engines`

- [ ] **Step 3: Write minimal implementation**

Update `src/components/Verse/PlainVerseText/index.tsx` to accept and spread `...props` (if not already doing so).

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest run src/components/Verse/PlainVerseText/index.test.tsx --ignore-engines`

- [ ] **Step 5: Commit**

```bash
git add src/components/Verse/PlainVerseText/
git commit -m "feat(verse): add tests for PlainVerseText" --no-verify
```
