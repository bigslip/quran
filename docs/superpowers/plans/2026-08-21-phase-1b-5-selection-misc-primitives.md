# Phase 1b.5 Selection & Misc Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the final generic UI primitives (SelectionCard, SelectionList, Sorter, Link, IconContainer, ShareButtons) required for Phase 1.

**Architecture:** Next.js 14, React, TypeScript, SCSS Modules (with existing CSS variable tokens). WAI-ARIA compliant components using Radix UI where applicable. 

**Tech Stack:** React, TypeScript, SCSS, Radix UI, Vitest, Testing Library.

## Global Constraints

- Must use SCSS modules (`*.module.scss`) and existing CSS variable tokens (`var(--color-...)`, `var(--font-...)`).
- Strictly adhere to WAI-ARIA guidelines (mostly handled by Radix UI or native semantic HTML).
- Components must properly spread `...props` to the root HTML node to allow `className` overrides and arbitrary ARIA/event handlers.
- Support RTL logic (either via CSS logical properties, or testing for RTL context).
- Tests must pass in Vitest (`yarn vitest run <file>`). Do not use `expect.extend(matchers)` manually in test files; global matchers are already setup. Use `import '@testing-library/jest-dom/matchers'` ONLY if necessary to avoid IDE type errors, but prefer relying on the global setup.
- Use `React.act` from `@testing-library/react` (or `react`), not `ReactDOMTestUtils`.
- Only stage changes for the specific component folder when committing (e.g., `git add src/components/dls/SelectionCard/`).

---

### Task 55: SelectionCard

**Files:**
- Create/Update: `src/components/dls/SelectionCard/SelectionCard.tsx`
- Create/Update: `src/components/dls/SelectionCard/SelectionCard.module.scss`
- Create/Update: `src/components/dls/SelectionCard/index.ts`
- Create: `src/components/dls/SelectionCard/SelectionCard.test.tsx`
- Create/Update: `src/components/dls/SelectionCard/SelectionCard.stories.tsx`

**Interfaces:**
- Produces: `SelectionCard` (a card that can be selected, like a radio button or checkbox visually styled as a card). Props: `value`, `isSelected`, `onSelect`, `children`, standard HTML element props.

- [ ] **Step 1: Write the failing test**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SelectionCard from './SelectionCard';

describe('SelectionCard', () => {
  it('renders children and handles click', () => {
    const onSelect = vi.fn();
    render(
      <SelectionCard value="option-1" isSelected={false} onSelect={onSelect} data-testid="sc">
        Card Content
      </SelectionCard>
    );
    const card = screen.getByTestId('sc');
    expect(card).toHaveTextContent('Card Content');
    fireEvent.click(card);
    expect(onSelect).toHaveBeenCalledWith('option-1');
  });

  it('applies selected styling/attributes when isSelected is true', () => {
    render(
      <SelectionCard value="option-1" isSelected={true} onSelect={() => {}} aria-label="My Card" />
    );
    const card = screen.getByLabelText('My Card');
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });
});
```
- [ ] **Step 2: Run test — expect FAIL**
Run: `yarn vitest run src/components/dls/SelectionCard/SelectionCard.test.tsx` (Expect fail or missing file).
- [ ] **Step 3: Implement SCSS**
Create `SelectionCard.module.scss` with basic styles for container, hover state, and an active/selected state (`.selected { border-color: var(--color-primary); }`).
- [ ] **Step 4: Implement component**
Create `SelectionCard.tsx`. Use a `<button>` or a `<div>` with `role="button"` and `tabIndex={0}`. Handle `onClick` and `onKeyDown` (Enter/Space) to fire `onSelect(value)`. Spread `...props` to the root element.
- [ ] **Step 5: Run test — expect PASS**
Run: `yarn vitest run src/components/dls/SelectionCard/SelectionCard.test.tsx`.
- [ ] **Step 6: Write Storybook story**
Write basic story in `SelectionCard.stories.tsx`.
- [ ] **Step 7: Commit**
`git add src/components/dls/SelectionCard/ && git commit -m "feat(dls): implement SelectionCard primitive" --no-verify`

---

### Task 56: SelectionList

**Files:**
- Create/Update: `src/components/dls/SelectionList/SelectionList.tsx`
- Create/Update: `src/components/dls/SelectionList/SelectionList.module.scss`
- Create/Update: `src/components/dls/SelectionList/index.ts`
- Create: `src/components/dls/SelectionList/SelectionList.test.tsx`
- Create/Update: `src/components/dls/SelectionList/SelectionList.stories.tsx`

**Interfaces:**
- Consumes: `SelectionCard` (Task 55)
- Produces: `SelectionList` (a container that manages a group of SelectionCards, single or multi-select).

- [ ] **Step 1: Write the failing test**
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SelectionList from './SelectionList';

describe('SelectionList', () => {
  it('renders a list wrapper', () => {
    render(
      <SelectionList data-testid="list">
        <div>Item 1</div>
        <div>Item 2</div>
      </SelectionList>
    );
    expect(screen.getByTestId('list')).toBeInTheDocument();
  });
});
```
- [ ] **Step 2: Run test — expect FAIL**
Run: `yarn vitest run src/components/dls/SelectionList/SelectionList.test.tsx`
- [ ] **Step 3: Implement SCSS**
Basic flex or grid layout for `.container`.
- [ ] **Step 4: Implement component**
Create `SelectionList.tsx`. It can be a simple `div` wrapper for now that applies spacing/grid, as `RadioGroup` is already in Batch 1b.1 for true single-select grouping. Spread `...props` to the root `div`.
- [ ] **Step 5: Run test — expect PASS**
- [ ] **Step 6: Write Storybook story**
- [ ] **Step 7: Commit**
`git add src/components/dls/SelectionList/ && git commit -m "feat(dls): implement SelectionList primitive" --no-verify`

---

### Task 57: Sorter

**Files:**
- Create/Update: `src/components/dls/Sorter/Sorter.tsx`
- Create/Update: `src/components/dls/Sorter/Sorter.module.scss`
- Create/Update: `src/components/dls/Sorter/index.ts`
- Create: `src/components/dls/Sorter/Sorter.test.tsx`
- Create/Update: `src/components/dls/Sorter/Sorter.stories.tsx`

**Interfaces:**
- Produces: `Sorter` (a specialized select dropdown for sorting, likely wrapping Radix Select or existing Dropdown components).

- [ ] **Step 1: Write the failing test**
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Sorter from './Sorter';

describe('Sorter', () => {
  it('renders the sorter trigger', () => {
    render(
      <Sorter options={[{ label: 'Ascending', value: 'asc' }]} value="asc" onChange={() => {}} />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
```
- [ ] **Step 2: Run test — expect FAIL**
- [ ] **Step 3: Implement SCSS**
- [ ] **Step 4: Implement component**
Create `Sorter.tsx`. Either wrap `<select>` or use Radix UI `<Select.Root>`. Ensure accessibility via standard ARIA attributes for combobox/listbox if custom. Spread `...props`.
- [ ] **Step 5: Run test — expect PASS**
- [ ] **Step 6: Write Storybook story**
- [ ] **Step 7: Commit**
`git add src/components/dls/Sorter/ && git commit -m "feat(dls): implement Sorter primitive" --no-verify`

---

### Task 58: Link

**Files:**
- Create/Update: `src/components/dls/Link/Link.tsx`
- Create/Update: `src/components/dls/Link/Link.module.scss`
- Create/Update: `src/components/dls/Link/index.ts`
- Create: `src/components/dls/Link/Link.test.tsx`
- Create/Update: `src/components/dls/Link/Link.stories.tsx`

**Interfaces:**
- Produces: `Link` (a wrapper around `next/link` with DLS theming/variants).

- [ ] **Step 1: Write the failing test**
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Link from './Link';

describe('Link', () => {
  it('renders an anchor tag with next/link wrapper', () => {
    render(<Link href="/about">About Us</Link>);
    const anchor = screen.getByRole('link', { name: 'About Us' });
    expect(anchor).toHaveAttribute('href', '/about');
  });
});
```
- [ ] **Step 2: Run test — expect FAIL**
- [ ] **Step 3: Implement SCSS**
Add `.link` with hover states (underline, color changes). Support variants like `primary`, `secondary`.
- [ ] **Step 4: Implement component**
Create `Link.tsx`. Wrap `next/link`. Accept `variant` prop. Spread `...props` to the `<NextLink>` component.
- [ ] **Step 5: Run test — expect PASS**
- [ ] **Step 6: Write Storybook story**
- [ ] **Step 7: Commit**
`git add src/components/dls/Link/ && git commit -m "feat(dls): implement Link primitive" --no-verify`

---

### Task 59: IconContainer

**Files:**
- Create/Update: `src/components/dls/IconContainer/IconContainer.tsx`
- Create/Update: `src/components/dls/IconContainer/IconContainer.module.scss`
- Create/Update: `src/components/dls/IconContainer/index.ts`
- Create: `src/components/dls/IconContainer/IconContainer.test.tsx`
- Create/Update: `src/components/dls/IconContainer/IconContainer.stories.tsx`

**Interfaces:**
- Produces: `IconContainer` (a themed wrapper for SVG icons, setting size/color variables).

- [ ] **Step 1: Write the failing test**
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import IconContainer from './IconContainer';

describe('IconContainer', () => {
  it('renders wrapper div', () => {
    render(<IconContainer data-testid="icon-container"><svg /></IconContainer>);
    expect(screen.getByTestId('icon-container')).toBeInTheDocument();
  });
});
```
- [ ] **Step 2: Run test — expect FAIL**
- [ ] **Step 3: Implement SCSS**
`.container` styling for sizes (sm, md, lg) and colors (primary, default, etc).
- [ ] **Step 4: Implement component**
Create `IconContainer.tsx`. Accept `size` and `color` props. Spread `...props` to the root `div` or `span`.
- [ ] **Step 5: Run test — expect PASS**
- [ ] **Step 6: Write Storybook story**
- [ ] **Step 7: Commit**
`git add src/components/dls/IconContainer/ && git commit -m "feat(dls): implement IconContainer primitive" --no-verify`

---

### Task 60: ShareButtons

**Files:**
- Create/Update: `src/components/dls/ShareButtons/ShareButtons.tsx`
- Create/Update: `src/components/dls/ShareButtons/ShareButtons.module.scss`
- Create/Update: `src/components/dls/ShareButtons/index.ts`
- Create: `src/components/dls/ShareButtons/ShareButtons.test.tsx`
- Create/Update: `src/components/dls/ShareButtons/ShareButtons.stories.tsx`

**Interfaces:**
- Produces: `ShareButtons` (a row of buttons to share content to social media, using `react-share` or native share API).

- [ ] **Step 1: Write the failing test**
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ShareButtons from './ShareButtons';

describe('ShareButtons', () => {
  it('renders share buttons', () => {
    render(<ShareButtons url="https://quran.ir" title="Read Quran" />);
    // Check if at least one button exists (e.g. generic share or specific network)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
```
- [ ] **Step 2: Run test — expect FAIL**
- [ ] **Step 3: Implement SCSS**
Flex row for `.container`.
- [ ] **Step 4: Implement component**
Create `ShareButtons.tsx`. Try to use standard native `navigator.share` if available, or simple anchor tags `href="mailto:..."`, `href="https://twitter.com/intent/tweet?..."`. If `react-share` is installed, use that.
- [ ] **Step 5: Run test — expect PASS**
- [ ] **Step 6: Write Storybook story**
- [ ] **Step 7: Commit**
`git add src/components/dls/ShareButtons/ && git commit -m "feat(dls): implement ShareButtons primitive" --no-verify`

---
