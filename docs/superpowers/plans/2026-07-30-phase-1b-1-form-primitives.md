# Phase 1b.1 Form Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 8 essential form and interactive primitive components (TextArea, Checkbox, RadioGroup, Select, Combobox, StarRating, Slider, Switch) for the DLS, strictly following our TDD process, styling conventions, and Radix UI primitives where applicable.

**Architecture:** Each component is implemented as a standalone directory in `src/components/dls/` or `src/components/dls/Forms/`. Each directory contains the component code, SCSS module, Storybook story, and Vitest unit tests. Radix UI primitives are used to provide robust accessibility and keyboard navigation.

**Tech Stack:** React, Next.js, Radix UI, SCSS Modules, Vitest, React Testing Library, Storybook.

## Global Constraints

- Must use SCSS modules (`*.module.scss`) and existing CSS variable tokens (`var(--color-...)`, `var(--font-...)`).
- Strictly adhere to WAI-ARIA guidelines (mostly handled by Radix UI).
- Tests must pass in Vitest (`yarn vitest run <file>`).
- Stories must function correctly in Storybook.

---

### Task 27: TextArea

**Files:**
- Create: `src/components/dls/Forms/TextArea/TextArea.tsx`
- Create: `src/components/dls/Forms/TextArea/TextArea.module.scss`
- Create: `src/components/dls/Forms/TextArea/TextArea.stories.tsx`
- Create: `src/components/dls/Forms/TextArea/TextArea.test.tsx`

- [ ] **Step 1: Write the failing test**

  Create `src/components/dls/Forms/TextArea/TextArea.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import TextArea from './TextArea';

  describe('TextArea', () => {
    it('renders a textarea element', () => {
      render(<TextArea aria-label="Comments" />);
      expect(screen.getByRole('textbox', { name: /comments/i })).toBeInTheDocument();
    });

    it('passes props correctly', () => {
      render(<TextArea aria-label="Note" placeholder="Type here..." disabled />);
      const el = screen.getByRole('textbox');
      expect(el).toHaveAttribute('placeholder', 'Type here...');
      expect(el).toBeDisabled();
    });

    it('calls onChange when typing', () => {
      const onChange = vi.fn();
      render(<TextArea aria-label="Input" onChange={onChange} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello' } });
      expect(onChange).toHaveBeenCalled();
    });

    it('renders error state', () => {
      render(<TextArea aria-label="Input" hasError />);
      expect(screen.getByRole('textbox')).toHaveAttribute('data-error', 'true');
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Forms/TextArea/TextArea.test.tsx
  ```

- [ ] **Step 3: Implement SCSS**

  Create `src/components/dls/Forms/TextArea/TextArea.module.scss`:

  ```scss
  .textArea {
    width: 100%;
    min-height: 5rem;
    padding: 0.75rem 1rem;
    font-size: var(--font-size-base);
    color: var(--color-text-default);
    background-color: var(--color-background-default);
    border: 1px solid var(--color-borders-hairline);
    border-radius: var(--border-radius-default);
    resize: vertical;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;

    &::placeholder {
      color: var(--color-text-faded);
    }

    &:focus {
      outline: none;
      border-color: var(--color-primary-medium);
      box-shadow: 0 0 0 2px var(--color-primary-faint);
    }

    &:disabled {
      background-color: var(--color-background-alternative);
      color: var(--color-text-faded);
      cursor: not-allowed;
    }

    &[data-error='true'] {
      border-color: var(--color-error-medium);
      &:focus {
        box-shadow: 0 0 0 2px var(--color-error-faint);
      }
    }
  }
  ```

- [ ] **Step 4: Implement component**

  Create `src/components/dls/Forms/TextArea/TextArea.tsx`:

  ```tsx
  import { TextareaHTMLAttributes, forwardRef } from 'react';
  import classnames from 'classnames';
  import styles from './TextArea.module.scss';

  export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    hasError?: boolean;
    autoGrow?: boolean; // Basic prop signature, auto-grow logic can be added later if needed via ref
  }

  const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className, hasError, autoGrow, ...rest }, ref) => {
      return (
        <textarea
          ref={ref}
          className={classnames(styles.textArea, className)}
          data-error={hasError ? 'true' : undefined}
          {...rest}
        />
      );
    }
  );

  TextArea.displayName = 'TextArea';
  export default TextArea;
  ```

- [ ] **Step 5: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Forms/TextArea/TextArea.test.tsx
  ```

- [ ] **Step 6: Write Storybook story**

  Create `src/components/dls/Forms/TextArea/TextArea.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import TextArea from './TextArea';

  const meta = {
    title: 'dls/Forms/TextArea',
    component: TextArea,
    tags: ['autodocs'],
  } as Meta<typeof TextArea>;
  export default meta;

  export const Default: StoryObj<typeof TextArea> = {
    args: {
      placeholder: 'Enter your message...',
      'aria-label': 'Message',
    },
  };

  export const ErrorState: StoryObj<typeof TextArea> = {
    args: {
      placeholder: 'Enter your message...',
      'aria-label': 'Message',
      hasError: true,
      defaultValue: 'Invalid input',
    },
  };

  export const Disabled: StoryObj<typeof TextArea> = {
    args: {
      placeholder: 'Cannot type here',
      'aria-label': 'Disabled',
      disabled: true,
    },
  };
  ```

- [ ] **Step 7: Verify in Storybook**

  ```bash
  yarn storybook
  ```
  Check that it renders properly, shows error borders, and disabled styles.

- [ ] **Step 8: Commit**

  ```bash
  git add src/components/dls/Forms/TextArea
  git commit -m "feat(dls): add TextArea form primitive"
  ```

---

### Task 28: Checkbox

**Files:**
- Create: `src/components/dls/Forms/Checkbox/Checkbox.tsx`
- Create: `src/components/dls/Forms/Checkbox/Checkbox.module.scss`
- Create: `src/components/dls/Forms/Checkbox/Checkbox.stories.tsx`
- Create: `src/components/dls/Forms/Checkbox/Checkbox.test.tsx`

**Note:** We need `@radix-ui/react-checkbox`. The agent will install it if not present, but assume it will be there.

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add @radix-ui/react-checkbox
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/Forms/Checkbox/Checkbox.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Checkbox from './Checkbox';

  describe('Checkbox', () => {
    it('renders and defaults to unchecked', () => {
      render(<Checkbox id="cb1" label="Agree" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      expect(screen.getByText('Agree')).toBeInTheDocument();
    });

    it('can be defaultChecked', () => {
      render(<Checkbox id="cb2" label="Agree" defaultChecked />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('calls onCheckedChange when clicked', () => {
      const onChange = vi.fn();
      render(<Checkbox id="cb3" label="Agree" onCheckedChange={onChange} />);
      fireEvent.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('is disabled when disabled prop is true', () => {
      render(<Checkbox id="cb4" label="Agree" disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Forms/Checkbox/Checkbox.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/Forms/Checkbox/Checkbox.module.scss`:

  ```scss
  .wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .root {
    all: unset;
    background-color: var(--color-background-default);
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 4px;
    border: 1px solid var(--color-borders-hairline);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    cursor: pointer;

    &:hover {
      background-color: var(--color-background-alternative);
    }
    
    &:focus-visible {
      outline: 2px solid var(--color-primary-faint);
      outline-offset: 2px;
    }

    &[data-state='checked'] {
      background-color: var(--color-primary-medium);
      border-color: var(--color-primary-medium);
      color: var(--color-text-inverse);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-inverse);
  }

  .label {
    color: var(--color-text-default);
    font-size: var(--font-size-small);
    line-height: 1;
    user-select: none;
    cursor: pointer;

    &[data-disabled='true'] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/Forms/Checkbox/Checkbox.tsx`:

  ```tsx
  'use client';
  import * as React from 'react';
  import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
  import classnames from 'classnames';
  import styles from './Checkbox.module.scss';

  export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
    label?: React.ReactNode;
  }

  const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
    ({ className, label, id, disabled, ...props }, ref) => (
      <div className={styles.wrapper}>
        <CheckboxPrimitive.Root
          ref={ref}
          id={id}
          disabled={disabled}
          className={classnames(styles.root, className)}
          {...props}
        >
          <CheckboxPrimitive.Indicator className={styles.indicator}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <label htmlFor={id} className={styles.label} data-disabled={disabled}>
            {label}
          </label>
        )}
      </div>
    )
  );

  Checkbox.displayName = 'Checkbox';
  export default Checkbox;
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Forms/Checkbox/Checkbox.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/Forms/Checkbox/Checkbox.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Checkbox from './Checkbox';

  const meta = {
    title: 'dls/Forms/Checkbox',
    component: Checkbox,
    tags: ['autodocs'],
  } as Meta<typeof Checkbox>;
  export default meta;

  export const Default: StoryObj<typeof Checkbox> = {
    args: {
      id: 'terms',
      label: 'Accept terms and conditions',
    },
  };

  export const Checked: StoryObj<typeof Checkbox> = {
    args: {
      id: 'newsletter',
      label: 'Subscribe to newsletter',
      defaultChecked: true,
    },
  };

  export const Disabled: StoryObj<typeof Checkbox> = {
    args: {
      id: 'disabled',
      label: 'Disabled option',
      disabled: true,
    },
  };
  ```

- [ ] **Step 8: Verify in Storybook & Commit**

  ```bash
  git add package.json yarn.lock src/components/dls/Forms/Checkbox
  git commit -m "feat(dls): add Checkbox primitive (Radix)"
  ```

---

### Task 29: RadioGroup

**Files:**
- Create: `src/components/dls/Forms/RadioGroup/RadioGroup.tsx`
- Create: `src/components/dls/Forms/RadioGroup/RadioGroup.module.scss`
- Create: `src/components/dls/Forms/RadioGroup/RadioGroup.stories.tsx`
- Create: `src/components/dls/Forms/RadioGroup/RadioGroup.test.tsx`

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add @radix-ui/react-radio-group
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/Forms/RadioGroup/RadioGroup.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import { RadioGroup, RadioGroupItem } from './RadioGroup';

  describe('RadioGroup', () => {
    it('renders radio items and allows selection', () => {
      const onValueChange = vi.fn();
      render(
        <RadioGroup defaultValue="default" onValueChange={onValueChange} aria-label="View density">
          <RadioGroupItem value="default" id="r1" label="Default" />
          <RadioGroupItem value="comfortable" id="r2" label="Comfortable" />
          <RadioGroupItem value="compact" id="r3" label="Compact" />
        </RadioGroup>
      );
      
      expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Compact' })).not.toBeChecked();

      fireEvent.click(screen.getByRole('radio', { name: 'Compact' }));
      expect(onValueChange).toHaveBeenCalledWith('compact');
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Forms/RadioGroup/RadioGroup.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/Forms/RadioGroup/RadioGroup.module.scss`:

  ```scss
  .root {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .itemWrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .item {
    all: unset;
    background-color: var(--color-background-default);
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 100%;
    border: 1px solid var(--color-borders-hairline);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background-color: var(--color-background-alternative);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary-faint);
      outline-offset: 2px;
    }

    &[data-state='checked'] {
      border-color: var(--color-primary-medium);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: relative;

    &::after {
      content: '';
      display: block;
      width: 0.625rem;
      height: 0.625rem;
      border-radius: 50%;
      background-color: var(--color-primary-medium);
    }
  }

  .label {
    color: var(--color-text-default);
    font-size: var(--font-size-small);
    line-height: 1;
    cursor: pointer;

    &[data-disabled='true'] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/Forms/RadioGroup/RadioGroup.tsx`:

  ```tsx
  'use client';
  import * as React from 'react';
  import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
  import classnames from 'classnames';
  import styles from './RadioGroup.module.scss';

  export const RadioGroup = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
  >(({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root
        className={classnames(styles.root, className)}
        {...props}
        ref={ref}
      />
    );
  });
  RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

  export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
    label?: React.ReactNode;
  }

  export const RadioGroupItem = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    RadioGroupItemProps
  >(({ className, label, id, disabled, ...props }, ref) => {
    return (
      <div className={styles.itemWrapper}>
        <RadioGroupPrimitive.Item
          ref={ref}
          className={classnames(styles.item, className)}
          id={id}
          disabled={disabled}
          {...props}
        >
          <RadioGroupPrimitive.Indicator className={styles.indicator} />
        </RadioGroupPrimitive.Item>
        {label && (
          <label className={styles.label} htmlFor={id} data-disabled={disabled}>
            {label}
          </label>
        )}
      </div>
    );
  });
  RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Forms/RadioGroup/RadioGroup.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/Forms/RadioGroup/RadioGroup.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import { RadioGroup, RadioGroupItem } from './RadioGroup';

  const meta = {
    title: 'dls/Forms/RadioGroup',
    component: RadioGroup,
  } as Meta<typeof RadioGroup>;
  export default meta;

  export const Default: StoryObj<typeof RadioGroup> = {
    render: () => (
      <RadioGroup defaultValue="comfortable" aria-label="View density">
        <RadioGroupItem value="default" id="r1" label="Default" />
        <RadioGroupItem value="comfortable" id="r2" label="Comfortable" />
        <RadioGroupItem value="compact" id="r3" label="Compact" disabled />
      </RadioGroup>
    ),
  };
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add package.json yarn.lock src/components/dls/Forms/RadioGroup
  git commit -m "feat(dls): add RadioGroup primitive (Radix)"
  ```

---

### Task 30: Select

**Files:**
- Create: `src/components/dls/Forms/Select/Select.tsx`
- Create: `src/components/dls/Forms/Select/Select.module.scss`
- Create: `src/components/dls/Forms/Select/Select.stories.tsx`
- Create: `src/components/dls/Forms/Select/Select.test.tsx`

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add @radix-ui/react-select
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/Forms/Select/Select.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import { Select, SelectTrigger, SelectContent, SelectItem } from './Select';

  // ResizeObserver is needed for Radix UI Popper (which Select uses internally)
  if (typeof window !== 'undefined' && !window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  describe('Select', () => {
    it('renders a trigger button', () => {
      render(
        <Select>
          <SelectTrigger placeholder="Choose theme" />
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Choose theme')).toBeInTheDocument();
    });

    it('opens content and allows selection', async () => {
      const onValueChange = vi.fn();
      render(
        <Select onValueChange={onValueChange}>
          <SelectTrigger placeholder="Choose theme" />
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      );
      
      fireEvent.click(screen.getByRole('combobox'));
      await waitFor(() => expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument());
      
      fireEvent.click(screen.getByRole('option', { name: 'Dark' }));
      expect(onValueChange).toHaveBeenCalledWith('dark');
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Forms/Select/Select.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/Forms/Select/Select.module.scss`:

  ```scss
  .trigger {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    border-radius: var(--border-radius-default);
    padding: 0 1rem;
    font-size: var(--font-size-small);
    line-height: 1;
    height: 2.25rem;
    gap: 0.5rem;
    background-color: var(--color-background-default);
    color: var(--color-text-default);
    border: 1px solid var(--color-borders-hairline);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    cursor: pointer;

    &:hover {
      background-color: var(--color-background-alternative);
    }
    
    &:focus {
      outline: none;
      border-color: var(--color-primary-medium);
      box-shadow: 0 0 0 2px var(--color-primary-faint);
    }

    &[data-disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .icon {
    color: var(--color-text-faded);
  }

  .content {
    overflow: hidden;
    background-color: var(--color-background-default);
    border-radius: var(--border-radius-default);
    box-shadow: var(--shadow-medium);
    border: 1px solid var(--color-borders-hairline);
    z-index: 1000;
  }

  .viewport {
    padding: 0.25rem;
  }

  .item {
    font-size: var(--font-size-small);
    line-height: 1;
    color: var(--color-text-default);
    border-radius: 3px;
    display: flex;
    align-items: center;
    height: 2rem;
    padding: 0 2rem 0 1.5rem;
    position: relative;
    user-select: none;
    cursor: pointer;

    &[data-disabled] {
      color: var(--color-text-faded);
      pointer-events: none;
    }

    &[data-highlighted] {
      outline: none;
      background-color: var(--color-background-alternative-faint);
      color: var(--color-text-default);
    }
  }

  .itemIndicator {
    position: absolute;
    left: 0;
    width: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary-medium);
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/Forms/Select/Select.tsx`:

  ```tsx
  'use client';
  import * as React from 'react';
  import * as SelectPrimitive from '@radix-ui/react-select';
  import classnames from 'classnames';
  import styles from './Select.module.scss';

  export const Select = SelectPrimitive.Root;

  export const SelectGroup = SelectPrimitive.Group;

  export const SelectValue = SelectPrimitive.Value;

  export const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { placeholder?: string }
  >(({ className, children, placeholder, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={classnames(styles.trigger, className)}
      {...props}
    >
      {children || <SelectPrimitive.Value placeholder={placeholder} />}
      <SelectPrimitive.Icon asChild>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.icon}>
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  ));
  SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

  export const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
  >(({ className, children, position = 'popper', ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={classnames(styles.content, className)}
        position={position}
        sideOffset={4}
        {...props}
      >
        <SelectPrimitive.Viewport className={styles.viewport}>
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ));
  SelectContent.displayName = SelectPrimitive.Content.displayName;

  export const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
  >(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={classnames(styles.item, className)}
      {...props}
    >
      <span className={styles.itemIndicator}>
        <SelectPrimitive.ItemIndicator>
          <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
            <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  ));
  SelectItem.displayName = SelectPrimitive.Item.displayName;
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Forms/Select/Select.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/Forms/Select/Select.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import { Select, SelectTrigger, SelectContent, SelectItem, SelectGroup } from './Select';

  const meta = {
    title: 'dls/Forms/Select',
    component: Select,
  } as Meta<typeof Select>;
  export default meta;

  export const Default: StoryObj<typeof Select> = {
    render: () => (
      <Select>
        <SelectTrigger placeholder="Select a language" aria-label="Language" />
        <SelectContent>
          <SelectGroup>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ar">Arabic</SelectItem>
            <SelectItem value="ur">Urdu</SelectItem>
            <SelectItem value="fr" disabled>French (Coming soon)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    ),
  };
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add package.json yarn.lock src/components/dls/Forms/Select
  git commit -m "feat(dls): add Select primitive (Radix)"
  ```

---

### Task 31: Combobox (Autocomplete)

Because Radix UI does not have a combobox primitive yet, and implementing a fully accessible one from scratch is extremely complex (managing focus, aria-activedescendant, filtering, etc.), we will use `cmdk` (Command K) combined with our Radix Popover primitive. `cmdk` is standard for this in the Radix ecosystem.

**Files:**
- Create: `src/components/dls/Forms/Combobox/Combobox.tsx`
- Create: `src/components/dls/Forms/Combobox/Combobox.module.scss`
- Create: `src/components/dls/Forms/Combobox/Combobox.stories.tsx`
- Create: `src/components/dls/Forms/Combobox/Combobox.test.tsx`

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add cmdk
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/Forms/Combobox/Combobox.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import { Combobox } from './Combobox';

  // ResizeObserver polyfill for Popover
  if (typeof window !== 'undefined' && !window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  const items = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];

  describe('Combobox', () => {
    it('renders placeholder and opens list on click', async () => {
      render(<Combobox placeholder="Select fruit" items={items} />);
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      
      fireEvent.click(trigger);
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    it('filters items when typing', async () => {
      render(<Combobox placeholder="Select fruit" items={items} />);
      fireEvent.click(screen.getByRole('combobox'));
      
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
      const input = screen.getByPlaceholderText('Search...');
      fireEvent.change(input, { target: { value: 'ban' } });
      
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.queryByText('Apple')).toBeNull();
    });

    it('calls onSelect when an item is selected', async () => {
      const onSelect = vi.fn();
      render(<Combobox placeholder="Select fruit" items={items} onSelect={onSelect} />);
      fireEvent.click(screen.getByRole('combobox'));
      
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Cherry'));
      
      expect(onSelect).toHaveBeenCalledWith('cherry');
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Forms/Combobox/Combobox.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/Forms/Combobox/Combobox.module.scss`:

  ```scss
  .trigger {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    width: 200px;
    height: 2.25rem;
    padding: 0 1rem;
    font-size: var(--font-size-small);
    border-radius: var(--border-radius-default);
    background-color: var(--color-background-default);
    color: var(--color-text-default);
    border: 1px solid var(--color-borders-hairline);
    cursor: pointer;

    &[data-placeholder] {
      color: var(--color-text-faded);
    }
  }

  .content {
    width: 200px;
    padding: 0;
    overflow: hidden;
    background-color: var(--color-background-default);
    border-radius: var(--border-radius-default);
    box-shadow: var(--shadow-medium);
    border: 1px solid var(--color-borders-hairline);
    z-index: 1000;
  }

  .input {
    width: 100%;
    border: none;
    border-bottom: 1px solid var(--color-borders-hairline);
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-small);
    color: var(--color-text-default);
    background: transparent;
    outline: none;

    &::placeholder {
      color: var(--color-text-faded);
    }
  }

  .list {
    max-height: 200px;
    overflow-y: auto;
    padding: 0.25rem;
  }

  .empty {
    padding: 1rem;
    text-align: center;
    font-size: var(--font-size-small);
    color: var(--color-text-faded);
  }

  .item {
    font-size: var(--font-size-small);
    padding: 0.5rem;
    border-radius: 3px;
    cursor: pointer;
    color: var(--color-text-default);
    display: flex;
    align-items: center;
    justify-content: space-between;

    &[data-selected='true'] {
      background-color: var(--color-background-alternative-faint);
    }

    /* cmdk uses aria-selected for keyboard navigation highlighting */
    &[aria-selected='true'] {
      background-color: var(--color-primary-faint);
      color: var(--color-primary-medium);
    }
  }

  .icon {
    opacity: 0;
    &[data-visible='true'] {
      opacity: 1;
    }
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/Forms/Combobox/Combobox.tsx`:

  ```tsx
  'use client';
  import * as React from 'react';
  import * as PopoverPrimitive from '@radix-ui/react-popover';
  import { Command } from 'cmdk';
  import classnames from 'classnames';
  import styles from './Combobox.module.scss';

  export interface ComboboxItem {
    value: string;
    label: string;
  }

  export interface ComboboxProps {
    items: ComboboxItem[];
    value?: string;
    onSelect?: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
  }

  export function Combobox({
    items,
    value,
    onSelect,
    placeholder = 'Select...',
    searchPlaceholder = 'Search...',
    emptyText = 'No results found.',
  }: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    
    const selectedItem = React.useMemo(
      () => items.find((item) => item.value === value),
      [items, value]
    );

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger
          role="combobox"
          aria-expanded={open}
          className={styles.trigger}
          data-placeholder={!selectedItem ? 'true' : undefined}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content className={styles.content} sideOffset={4} align="start">
            <Command>
              <Command.Input placeholder={searchPlaceholder} className={styles.input} />
              <Command.List className={styles.list}>
                <Command.Empty className={styles.empty}>{emptyText}</Command.Empty>
                {items.map((item) => (
                  <Command.Item
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      onSelect?.(currentValue === value ? '' : currentValue);
                      setOpen(false);
                    }}
                    className={styles.item}
                    data-selected={value === item.value ? 'true' : undefined}
                  >
                    {item.label}
                    <svg
                      width="12" height="12" viewBox="0 0 15 15" fill="none"
                      className={styles.icon}
                      data-visible={value === item.value ? 'true' : 'false'}
                    >
                      <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" />
                    </svg>
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Forms/Combobox/Combobox.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/Forms/Combobox/Combobox.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import { useState } from 'react';
  import { Combobox } from './Combobox';

  const meta = {
    title: 'dls/Forms/Combobox',
    component: Combobox,
  } as Meta<typeof Combobox>;
  export default meta;

  export const Default: StoryObj<typeof Combobox> = {
    render: () => {
      const [val, setVal] = useState('');
      return (
        <Combobox
          placeholder="Select framework"
          value={val}
          onSelect={setVal}
          items={[
            { value: 'next', label: 'Next.js' },
            { value: 'sveltekit', label: 'SvelteKit' },
            { value: 'nuxt', label: 'Nuxt' },
            { value: 'remix', label: 'Remix' },
            { value: 'astro', label: 'Astro' },
          ]}
        />
      );
    },
  };
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add package.json yarn.lock src/components/dls/Forms/Combobox
  git commit -m "feat(dls): add Combobox primitive (cmdk + radix popover)"
  ```

---

### Task 32: StarRating

**Files:**
- Create: `src/components/dls/Forms/StarRating/StarRating.tsx`
- Create: `src/components/dls/Forms/StarRating/StarRating.module.scss`
- Create: `src/components/dls/Forms/StarRating/StarRating.stories.tsx`
- Create: `src/components/dls/Forms/StarRating/StarRating.test.tsx`

- [ ] **Step 1: Write the failing test**

  Create `src/components/dls/Forms/StarRating/StarRating.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import StarRating from './StarRating';

  describe('StarRating', () => {
    it('renders 5 stars by default', () => {
      render(<StarRating />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('highlights up to the selected rating', () => {
      render(<StarRating rating={3} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveAttribute('data-active', 'true');
      expect(buttons[2]).toHaveAttribute('data-active', 'true');
      expect(buttons[3]).toHaveAttribute('data-active', 'false');
    });

    it('calls onChange with the clicked rating', () => {
      const onChange = vi.fn();
      render(<StarRating rating={0} onChange={onChange} />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[3]); // 4th star
      expect(onChange).toHaveBeenCalledWith(4);
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Forms/StarRating/StarRating.test.tsx
  ```

- [ ] **Step 3: Implement SCSS**

  Create `src/components/dls/Forms/StarRating/StarRating.module.scss`:

  ```scss
  .container {
    display: flex;
    gap: 0.25rem;
  }

  .star {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--color-secondary-faint); // outline color
    transition: transform 0.1s;

    &:hover {
      transform: scale(1.1);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary-medium);
      border-radius: 2px;
    }

    &[data-active='true'] {
      color: #F59E0B; // amber-500, a common bright gold for stars
    }

    &[disabled] {
      cursor: not-allowed;
      &:hover {
        transform: none;
      }
    }
  }
  ```

- [ ] **Step 4: Implement component**

  Create `src/components/dls/Forms/StarRating/StarRating.tsx`:

  ```tsx
  'use client';
  import { useState } from 'react';
  import classnames from 'classnames';
  import styles from './StarRating.module.scss';

  interface StarRatingProps {
    rating?: number;
    maxRating?: number;
    onChange?: (rating: number) => void;
    disabled?: boolean;
    className?: string;
  }

  export default function StarRating({
    rating = 0,
    maxRating = 5,
    onChange,
    disabled = false,
    className,
  }: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const activeRating = hoverRating !== null ? hoverRating : rating;

    return (
      <div className={classnames(styles.container, className)}>
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= activeRating;

          return (
            <button
              key={starValue}
              type="button"
              className={styles.star}
              data-active={isActive}
              disabled={disabled}
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => !disabled && setHoverRating(starValue)}
              onMouseLeave={() => !disabled && setHoverRating(null)}
              aria-label={`Rate ${starValue} stars`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Forms/StarRating/StarRating.test.tsx
  ```

- [ ] **Step 6: Write Storybook story**

  Create `src/components/dls/Forms/StarRating/StarRating.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import { useState } from 'react';
  import StarRating from './StarRating';

  const meta = {
    title: 'dls/Forms/StarRating',
    component: StarRating,
  } as Meta<typeof StarRating>;
  export default meta;

  export const Interactive: StoryObj<typeof StarRating> = {
    render: () => {
      const [rating, setRating] = useState(0);
      return <StarRating rating={rating} onChange={setRating} />;
    },
  };

  export const ReadOnly: StoryObj<typeof StarRating> = {
    args: {
      rating: 4,
      disabled: true,
    },
  };
  ```

- [ ] **Step 7: Commit**

  ```bash
  git add src/components/dls/Forms/StarRating
  git commit -m "feat(dls): add StarRating primitive"
  ```

---

### Task 33: Slider

**Files:**
- Create: `src/components/dls/Forms/Slider/Slider.tsx`
- Create: `src/components/dls/Forms/Slider/Slider.module.scss`
- Create: `src/components/dls/Forms/Slider/Slider.stories.tsx`
- Create: `src/components/dls/Forms/Slider/Slider.test.tsx`

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add @radix-ui/react-slider
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/Forms/Slider/Slider.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Slider from './Slider';

  describe('Slider', () => {
    it('renders slider and has correct accessibility role', () => {
      render(<Slider defaultValue={[50]} aria-label="Volume" />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('aria-valuenow', '50');
    });

    it('can be dragged (triggers onValueChange)', () => {
      const onValueChange = vi.fn();
      render(<Slider defaultValue={[50]} onValueChange={onValueChange} aria-label="Volume" />);
      
      const slider = screen.getByRole('slider');
      // Radix relies on pointer events or arrow keys. Let's test keyboard interaction.
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      
      expect(onValueChange).toHaveBeenCalledWith([51]);
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Forms/Slider/Slider.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/Forms/Slider/Slider.module.scss`:

  ```scss
  .root {
    position: relative;
    display: flex;
    align-items: center;
    user-select: none;
    touch-action: none;
    width: 100%;
    height: 1.25rem;
  }

  .track {
    background-color: var(--color-borders-hairline);
    position: relative;
    flex-grow: 1;
    border-radius: 9999px;
    height: 0.25rem;
  }

  .range {
    position: absolute;
    background-color: var(--color-primary-medium);
    border-radius: 9999px;
    height: 100%;
  }

  .thumb {
    display: block;
    width: 1rem;
    height: 1rem;
    background-color: var(--color-background-default);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    border: 1px solid var(--color-borders-hairline);
    border-radius: 10px;
    transition: border-color 0.1s;
    
    &:hover {
      background-color: var(--color-background-alternative);
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px var(--color-primary-faint);
      border-color: var(--color-primary-medium);
    }
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/Forms/Slider/Slider.tsx`:

  ```tsx
  'use client';
  import * as React from 'react';
  import * as SliderPrimitive from '@radix-ui/react-slider';
  import classnames from 'classnames';
  import styles from './Slider.module.scss';

  export const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
  >(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={classnames(styles.root, className)}
      {...props}
    >
      <SliderPrimitive.Track className={styles.track}>
        <SliderPrimitive.Range className={styles.range} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={styles.thumb} aria-label={props['aria-label']} />
    </SliderPrimitive.Root>
  ));

  Slider.displayName = SliderPrimitive.Root.displayName;
  export default Slider;
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Forms/Slider/Slider.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/Forms/Slider/Slider.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Slider from './Slider';

  const meta = {
    title: 'dls/Forms/Slider',
    component: Slider,
  } as Meta<typeof Slider>;
  export default meta;

  export const Default: StoryObj<typeof Slider> = {
    render: () => (
      <div style={{ width: 300, padding: 20 }}>
        <Slider defaultValue={[50]} max={100} step={1} aria-label="Volume" />
      </div>
    ),
  };
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add package.json yarn.lock src/components/dls/Forms/Slider
  git commit -m "feat(dls): add Slider primitive (Radix)"
  ```

---

### Task 34: Switch

**Files:**
- Create: `src/components/dls/Forms/Switch/Switch.tsx`
- Create: `src/components/dls/Forms/Switch/Switch.module.scss`
- Create: `src/components/dls/Forms/Switch/Switch.stories.tsx`
- Create: `src/components/dls/Forms/Switch/Switch.test.tsx`

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add @radix-ui/react-switch
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/Forms/Switch/Switch.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Switch from './Switch';

  describe('Switch', () => {
    it('renders as a button with switch role', () => {
      render(<Switch aria-label="Airplane mode" />);
      const btn = screen.getByRole('switch');
      expect(btn).toBeInTheDocument();
      expect(btn).not.toBeChecked();
    });

    it('can be defaultChecked', () => {
      render(<Switch aria-label="Airplane mode" defaultChecked />);
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('toggles on click and calls onCheckedChange', () => {
      const onCheckedChange = vi.fn();
      render(<Switch aria-label="Airplane mode" onCheckedChange={onCheckedChange} />);
      const btn = screen.getByRole('switch');
      fireEvent.click(btn);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('renders a label if provided', () => {
      render(<Switch id="airplane" label="Airplane mode" />);
      expect(screen.getByText('Airplane mode')).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Forms/Switch/Switch.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/Forms/Switch/Switch.module.scss`:

  ```scss
  .wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .root {
    all: unset;
    width: 2.5rem;
    height: 1.5rem;
    background-color: var(--color-borders-hairline);
    border-radius: 9999px;
    position: relative;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    &:focus-visible {
      outline: 2px solid var(--color-primary-faint);
      outline-offset: 2px;
    }

    &[data-state='checked'] {
      background-color: var(--color-primary-medium);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .thumb {
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    background-color: white;
    border-radius: 9999px;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
    transition: transform 100ms;
    transform: translateX(0.125rem);
    will-change: transform;

    &[data-state='checked'] {
      transform: translateX(1.125rem);
    }
  }

  .label {
    color: var(--color-text-default);
    font-size: var(--font-size-small);
    line-height: 1;
    cursor: pointer;
    user-select: none;

    &[data-disabled='true'] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/Forms/Switch/Switch.tsx`:

  ```tsx
  'use client';
  import * as React from 'react';
  import * as SwitchPrimitive from '@radix-ui/react-switch';
  import classnames from 'classnames';
  import styles from './Switch.module.scss';

  export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
    label?: React.ReactNode;
  }

  const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
    ({ className, label, id, disabled, ...props }, ref) => (
      <div className={styles.wrapper}>
        <SwitchPrimitive.Root
          ref={ref}
          id={id}
          disabled={disabled}
          className={classnames(styles.root, className)}
          {...props}
        >
          <SwitchPrimitive.Thumb className={styles.thumb} />
        </SwitchPrimitive.Root>
        {label && (
          <label className={styles.label} htmlFor={id} data-disabled={disabled}>
            {label}
          </label>
        )}
      </div>
    )
  );

  Switch.displayName = SwitchPrimitive.Root.displayName;
  export default Switch;
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Forms/Switch/Switch.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/Forms/Switch/Switch.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Switch from './Switch';

  const meta = {
    title: 'dls/Forms/Switch',
    component: Switch,
  } as Meta<typeof Switch>;
  export default meta;

  export const Default: StoryObj<typeof Switch> = {
    args: {
      id: 'airplane-mode',
      label: 'Airplane Mode',
    },
  };

  export const Checked: StoryObj<typeof Switch> = {
    args: {
      id: 'wifi',
      label: 'Wi-Fi',
      defaultChecked: true,
    },
  };

  export const Disabled: StoryObj<typeof Switch> = {
    args: {
      id: 'bluetooth',
      label: 'Bluetooth',
      disabled: true,
    },
  };
  ```

- [ ] **Step 8: Verify in Storybook & Commit**

  ```bash
  git add package.json yarn.lock src/components/dls/Forms/Switch
  git commit -m "feat(dls): add Switch primitive (Radix)"
  ```

---
