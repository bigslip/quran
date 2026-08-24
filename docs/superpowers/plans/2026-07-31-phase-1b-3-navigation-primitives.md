# Phase 1b.3 Navigation Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 6 essential navigation and feedback primitive components (Tabs, TabSwitcher, Pagination, Breadcrumb, Link, Toast) for the DLS, strictly following our TDD process, styling conventions, and Radix UI primitives where applicable.

**Architecture:** Each component is implemented as a standalone directory in `src/components/dls/`. Each directory contains the component code, SCSS module, Storybook story, and Vitest unit tests. Built upon Radix UI primitives (e.g. `@radix-ui/react-tabs`, `@radix-ui/react-toast`).

**Tech Stack:** React, Next.js, Radix UI, SCSS Modules, Vitest, React Testing Library, Storybook.

## Global Constraints

- Must use SCSS modules (`*.module.scss`) and existing CSS variable tokens (`var(--color-...)`, `var(--font-...)`).
- Strictly adhere to WAI-ARIA guidelines (mostly handled by Radix UI).
- Tests must pass in Vitest (`yarn vitest run <file>`).
- Stories must function correctly in Storybook.

---

### Task 43: Tabs

**Files:**
- Create: `src/components/dls/Tabs/Tabs.tsx`
- Create: `src/components/dls/Tabs/Tabs.module.scss`
- Create: `src/components/dls/Tabs/Tabs.stories.tsx`
- Create: `src/components/dls/Tabs/Tabs.test.tsx`

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add @radix-ui/react-tabs
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/Tabs/Tabs.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

  describe('Tabs', () => {
    it('renders tabs and switches content on click', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="manage account">
            <TabsTrigger value="tab1">Account</TabsTrigger>
            <TabsTrigger value="tab2">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Account settings</TabsContent>
          <TabsContent value="tab2">Change your password</TabsContent>
        </Tabs>
      );
      
      expect(screen.getByText('Account settings')).toBeInTheDocument();
      expect(screen.queryByText('Change your password')).not.toBeInTheDocument();
      
      fireEvent.click(screen.getByRole('tab', { name: /password/i }));
      
      expect(screen.queryByText('Account settings')).not.toBeInTheDocument();
      expect(screen.getByText('Change your password')).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Tabs/Tabs.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/Tabs/Tabs.module.scss`:

  ```scss
  .root {
    display: flex;
    flex-direction: column;
  }

  .list {
    display: flex;
    flex-shrink: 0;
    border-bottom: 1px solid var(--color-borders-hairline);
    margin-bottom: 1rem;
  }

  .trigger {
    background-color: transparent;
    padding: 0.75rem 1.25rem;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-base);
    color: var(--color-text-faded);
    user-select: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;

    &:hover {
      color: var(--color-text-default);
    }

    &[data-state='active'] {
      color: var(--color-primary-medium);
      border-bottom-color: var(--color-primary-medium);
      font-weight: 500;
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary-medium);
      outline-offset: -2px;
    }
  }

  .content {
    flex-grow: 1;
    padding: 1rem 0;
    color: var(--color-text-default);
    
    &[data-state='inactive'] {
      display: none;
    }

    &:focus-visible {
      outline: none;
    }
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/Tabs/Tabs.tsx`:

  ```tsx
  import React from 'react';
  import * as TabsPrimitive from '@radix-ui/react-tabs';
  import classnames from 'classnames';
  import styles from './Tabs.module.scss';

  export const Tabs = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
  >(({ className, ...props }, ref) => (
    <TabsPrimitive.Root
      ref={ref}
      className={classnames(styles.root, className)}
      {...props}
    />
  ));
  Tabs.displayName = TabsPrimitive.Root.displayName;

  export const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
  >(({ className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={classnames(styles.list, className)}
      {...props}
    />
  ));
  TabsList.displayName = TabsPrimitive.List.displayName;

  export const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
  >(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={classnames(styles.trigger, className)}
      {...props}
    />
  ));
  TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

  export const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
  >(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={classnames(styles.content, className)}
      {...props}
    />
  ));
  TabsContent.displayName = TabsPrimitive.Content.displayName;
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Tabs/Tabs.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/Tabs/Tabs.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

  const meta = {
    title: 'dls/Tabs',
    component: Tabs,
    tags: ['autodocs'],
  } as Meta<typeof Tabs>;
  export default meta;

  export const Default: StoryObj<typeof Tabs> = {
    render: () => (
      <Tabs defaultValue="account" style={{ width: '400px' }}>
        <TabsList aria-label="Manage your account">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Make changes to your account here. Click save when you're done.
        </TabsContent>
        <TabsContent value="password">
          Change your password here. After saving, you'll be logged out.
        </TabsContent>
        <TabsContent value="settings">
          Manage your personal settings.
        </TabsContent>
      </Tabs>
    ),
  };
  ```

- [ ] **Step 8: Verify in Storybook & Commit**

  ```bash
  git add src/components/dls/Tabs
  git commit -m "feat(dls): add Tabs primitive (Radix)"
  ```

---

### Task 44: TabSwitcher

**Files:**
- Create: `src/components/dls/TabSwitcher/TabSwitcher.tsx`
- Create: `src/components/dls/TabSwitcher/TabSwitcher.module.scss`
- Create: `src/components/dls/TabSwitcher/TabSwitcher.stories.tsx`
- Create: `src/components/dls/TabSwitcher/TabSwitcher.test.tsx`

- [ ] **Step 1: Write the failing test**

  Create `src/components/dls/TabSwitcher/TabSwitcher.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import TabSwitcher from './TabSwitcher';

  describe('TabSwitcher', () => {
    it('renders options and calls onChange', () => {
      const onChange = vi.fn();
      render(
        <TabSwitcher
          options={[
            { label: 'Map', value: 'map' },
            { label: 'List', value: 'list' },
          ]}
          value="map"
          onChange={onChange}
        />
      );
      
      expect(screen.getByRole('button', { name: 'Map' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument();
      
      fireEvent.click(screen.getByRole('button', { name: 'List' }));
      expect(onChange).toHaveBeenCalledWith('list');
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/TabSwitcher/TabSwitcher.test.tsx
  ```

- [ ] **Step 3: Implement SCSS**

  Create `src/components/dls/TabSwitcher/TabSwitcher.module.scss`:

  ```scss
  .container {
    display: inline-flex;
    background-color: var(--color-background-alternative);
    border-radius: var(--border-radius-rounded);
    padding: 0.25rem;
  }

  .tab {
    background: transparent;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-rounded);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-faded);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: var(--color-text-default);
    }

    &.active {
      background-color: var(--color-background-default);
      color: var(--color-primary-medium);
      box-shadow: var(--shadow-small);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary-medium);
      outline-offset: 2px;
    }
  }
  ```

- [ ] **Step 4: Implement component**

  Create `src/components/dls/TabSwitcher/TabSwitcher.tsx`:

  ```tsx
  import React from 'react';
  import classnames from 'classnames';
  import styles from './TabSwitcher.module.scss';

  export interface TabOption {
    label: string;
    value: string;
  }

  export interface TabSwitcherProps {
    options: TabOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
  }

  const TabSwitcher: React.FC<TabSwitcherProps> = ({
    options,
    value,
    onChange,
    className,
  }) => {
    return (
      <div className={classnames(styles.container, className)} role="group">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="button"
            className={classnames(styles.tab, {
              [styles.active]: value === option.value,
            })}
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  export default TabSwitcher;
  ```

- [ ] **Step 5: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/TabSwitcher/TabSwitcher.test.tsx
  ```

- [ ] **Step 6: Write Storybook story**

  Create `src/components/dls/TabSwitcher/TabSwitcher.stories.tsx`:

  ```tsx
  import { useState } from 'react';
  import type { Meta, StoryObj } from '@storybook/react';
  import TabSwitcher from './TabSwitcher';

  const meta = {
    title: 'dls/TabSwitcher',
    component: TabSwitcher,
    tags: ['autodocs'],
  } as Meta<typeof TabSwitcher>;
  export default meta;

  export const Default: StoryObj<typeof TabSwitcher> = {
    render: () => {
      const [view, setView] = useState('grid');
      return (
        <TabSwitcher
          value={view}
          onChange={setView}
          options={[
            { label: 'Grid', value: 'grid' },
            { label: 'List', value: 'list' },
            { label: 'Map', value: 'map' },
          ]}
        />
      );
    },
  };
  ```

- [ ] **Step 7: Verify in Storybook & Commit**

  ```bash
  git add src/components/dls/TabSwitcher
  git commit -m "feat(dls): add TabSwitcher primitive"
  ```

---

### Task 45: Pagination

**Files:**
- Create: `src/components/dls/Pagination/Pagination.tsx`
- Create: `src/components/dls/Pagination/Pagination.module.scss`
- Create: `src/components/dls/Pagination/Pagination.stories.tsx`
- Create: `src/components/dls/Pagination/Pagination.test.tsx`

- [ ] **Step 1: Write the failing test**

  Create `src/components/dls/Pagination/Pagination.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Pagination from './Pagination';

  describe('Pagination', () => {
    it('renders current page and handles next/prev', () => {
      const onPageChange = vi.fn();
      render(
        <Pagination
          currentPage={5}
          totalPages={10}
          onPageChange={onPageChange}
        />
      );
      
      expect(screen.getByText('5')).toBeInTheDocument();
      
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(onPageChange).toHaveBeenCalledWith(6);
      
      fireEvent.click(screen.getByRole('button', { name: /previous/i }));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Pagination/Pagination.test.tsx
  ```

- [ ] **Step 3: Implement SCSS**

  Create `src/components/dls/Pagination/Pagination.module.scss`:

  ```scss
  .container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .navButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--color-borders-hairline);
    background: var(--color-background-default);
    color: var(--color-text-default);
    border-radius: var(--border-radius-default);
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: var(--color-background-alternative);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary-medium);
      outline-offset: 2px;
    }
  }

  .pageInfo {
    font-size: var(--font-size-small);
    color: var(--color-text-faded);
    user-select: none;
    min-width: 4rem;
    text-align: center;
    
    strong {
      color: var(--color-text-default);
      font-weight: 500;
    }
  }
  ```

- [ ] **Step 4: Implement component**

  Create `src/components/dls/Pagination/Pagination.tsx`:

  ```tsx
  import React from 'react';
  import classnames from 'classnames';
  import styles from './Pagination.module.scss';

  export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
  }

  const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className,
  }) => {
    return (
      <nav className={classnames(styles.container, className)} aria-label="Pagination Navigation">
        <button
          type="button"
          className={styles.navButton}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className={styles.pageInfo}>
          <strong>{currentPage}</strong> of {totalPages}
        </div>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </nav>
    );
  };

  export default Pagination;
  ```

- [ ] **Step 5: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Pagination/Pagination.test.tsx
  ```

- [ ] **Step 6: Write Storybook story**

  Create `src/components/dls/Pagination/Pagination.stories.tsx`:

  ```tsx
  import { useState } from 'react';
  import type { Meta, StoryObj } from '@storybook/react';
  import Pagination from './Pagination';

  const meta = {
    title: 'dls/Pagination',
    component: Pagination,
    tags: ['autodocs'],
  } as Meta<typeof Pagination>;
  export default meta;

  export const Default: StoryObj<typeof Pagination> = {
    render: () => {
      const [page, setPage] = useState(1);
      return (
        <Pagination
          currentPage={page}
          totalPages={10}
          onPageChange={setPage}
        />
      );
    },
  };
  ```

- [ ] **Step 7: Verify in Storybook & Commit**

  ```bash
  git add src/components/dls/Pagination
  git commit -m "feat(dls): add Pagination primitive"
  ```

---

### Task 46: Breadcrumb

**Files:**
- Create: `src/components/dls/Breadcrumb/Breadcrumb.tsx`
- Create: `src/components/dls/Breadcrumb/Breadcrumb.module.scss`
- Create: `src/components/dls/Breadcrumb/Breadcrumb.stories.tsx`
- Create: `src/components/dls/Breadcrumb/Breadcrumb.test.tsx`

- [ ] **Step 1: Write the failing test**

  Create `src/components/dls/Breadcrumb/Breadcrumb.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import Breadcrumb from './Breadcrumb';

  describe('Breadcrumb', () => {
    it('renders breadcrumb items and separators', () => {
      render(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Surahs', href: '/surahs' },
            { label: 'Al-Fatihah' },
          ]}
        />
      );
      
      expect(screen.getByText('Home')).toHaveAttribute('href', '/');
      expect(screen.getByText('Surahs')).toHaveAttribute('href', '/surahs');
      expect(screen.getByText('Al-Fatihah')).not.toHaveAttribute('href');
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Breadcrumb/Breadcrumb.test.tsx
  ```

- [ ] **Step 3: Implement SCSS**

  Create `src/components/dls/Breadcrumb/Breadcrumb.module.scss`:

  ```scss
  .container {
    display: flex;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .item {
    display: flex;
    align-items: center;
    font-size: var(--font-size-small);
  }

  .link {
    color: var(--color-text-faded);
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: var(--color-primary-medium);
      text-decoration: underline;
    }
  }

  .current {
    color: var(--color-text-default);
    font-weight: 500;
  }

  .separator {
    color: var(--color-text-faded);
    margin: 0 0.5rem;
    opacity: 0.5;
  }
  ```

- [ ] **Step 4: Implement component**

  Create `src/components/dls/Breadcrumb/Breadcrumb.tsx`:

  ```tsx
  import React from 'react';
  import classnames from 'classnames';
  import Link from 'next/link';
  import styles from './Breadcrumb.module.scss';

  export interface BreadcrumbItem {
    label: string;
    href?: string;
  }

  export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
  }

  const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
    return (
      <nav aria-label="Breadcrumb" className={className}>
        <ol className={styles.container}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className={styles.item} aria-current={isLast ? 'page' : undefined}>
                {item.href && !isLast ? (
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={classnames({ [styles.current]: isLast })}>
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <span className={styles.separator} aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  };

  export default Breadcrumb;
  ```

- [ ] **Step 5: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Breadcrumb/Breadcrumb.test.tsx
  ```

- [ ] **Step 6: Write Storybook story**

  Create `src/components/dls/Breadcrumb/Breadcrumb.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Breadcrumb from './Breadcrumb';

  const meta = {
    title: 'dls/Breadcrumb',
    component: Breadcrumb,
    tags: ['autodocs'],
  } as Meta<typeof Breadcrumb>;
  export default meta;

  export const Default: StoryObj<typeof Breadcrumb> = {
    args: {
      items: [
        { label: 'Home', href: '/' },
        { label: 'My Quran', href: '/my-quran' },
        { label: 'Notes' },
      ],
    },
  };
  ```

- [ ] **Step 7: Verify in Storybook & Commit**

  ```bash
  git add src/components/dls/Breadcrumb
  git commit -m "feat(dls): add Breadcrumb primitive"
  ```

---

### Task 47: Link

**Files:**
- Create: `src/components/dls/Link/Link.tsx`
- Create: `src/components/dls/Link/Link.module.scss`
- Create: `src/components/dls/Link/Link.stories.tsx`
- Create: `src/components/dls/Link/Link.test.tsx`

- [ ] **Step 1: Write the failing test**

  Create `src/components/dls/Link/Link.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import Link from './Link';

  describe('Link', () => {
    it('renders a next/link when internal', () => {
      render(<Link href="/about">About Us</Link>);
      expect(screen.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/about');
    });

    it('renders an anchor tag when external', () => {
      render(<Link href="https://example.com" isExternal>External</Link>);
      const link = screen.getByRole('link', { name: 'External' });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Link/Link.test.tsx
  ```

- [ ] **Step 3: Implement SCSS**

  Create `src/components/dls/Link/Link.module.scss`:

  ```scss
  .link {
    color: var(--color-primary-medium);
    text-decoration: none;
    transition: color 0.2s, text-decoration 0.2s;

    &:hover {
      text-decoration: underline;
      color: var(--color-primary-dark);
    }
  }

  .variant-ghost {
    color: var(--color-text-faded);
    
    &:hover {
      color: var(--color-text-default);
    }
  }
  ```

- [ ] **Step 4: Implement component**

  Create `src/components/dls/Link/Link.tsx`:

  ```tsx
  import React, { ReactNode } from 'react';
  import NextLink, { LinkProps as NextLinkProps } from 'next/link';
  import classnames from 'classnames';
  import styles from './Link.module.scss';

  export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps | 'href'> {
    href: string | object;
    children: ReactNode;
    isExternal?: boolean;
    variant?: 'default' | 'ghost';
    className?: string;
  }

  const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({
    href,
    children,
    isExternal = false,
    variant = 'default',
    className,
    ...props
  }, ref) => {
    const combinedClasses = classnames(
      styles.link,
      {
        [styles[`variant-${variant}`]]: variant !== 'default',
      },
      className
    );

    if (isExternal) {
      return (
        <a
          ref={ref}
          href={href as string}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClasses}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <NextLink ref={ref} href={href} className={combinedClasses} {...props as NextLinkProps}>
        {children}
      </NextLink>
    );
  });
  Link.displayName = 'Link';

  export default Link;
  ```

- [ ] **Step 5: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Link/Link.test.tsx
  ```

- [ ] **Step 6: Write Storybook story**

  Create `src/components/dls/Link/Link.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Link from './Link';

  const meta = {
    title: 'dls/Link',
    component: Link,
    tags: ['autodocs'],
  } as Meta<typeof Link>;
  export default meta;

  export const Internal: StoryObj<typeof Link> = {
    args: {
      href: '/surahs',
      children: 'Go to Surahs',
    },
  };

  export const External: StoryObj<typeof Link> = {
    args: {
      href: 'https://quran.com',
      isExternal: true,
      children: 'Quran.com',
    },
  };

  export const Ghost: StoryObj<typeof Link> = {
    args: {
      href: '/',
      variant: 'ghost',
      children: 'Ghost Link',
    },
  };
  ```

- [ ] **Step 7: Verify in Storybook & Commit**

  ```bash
  git add src/components/dls/Link
  git commit -m "feat(dls): add Link primitive"
  ```

---

### Task 48: Toast

**Files:**
- Create: `src/components/dls/Toast/Toast.tsx`
- Create: `src/components/dls/Toast/Toast.module.scss`
- Create: `src/components/dls/Toast/Toast.stories.tsx`
- Create: `src/components/dls/Toast/Toast.test.tsx`

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add @radix-ui/react-toast
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/Toast/Toast.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from './Toast';

  describe('Toast', () => {
    it('renders a toast when open', async () => {
      const TestToast = () => (
        <ToastProvider>
          <Toast open={true}>
            <ToastTitle>Success!</ToastTitle>
            <ToastDescription>Your settings have been saved.</ToastDescription>
            <ToastClose>Close</ToastClose>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      );

      render(<TestToast />);
      
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Your settings have been saved.')).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Toast/Toast.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/Toast/Toast.module.scss`:

  ```scss
  .viewport {
    position: fixed;
    bottom: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 0.5rem;
    width: 390px;
    max-width: 100vw;
    margin: 0;
    list-style: none;
    z-index: 2147483647;
    outline: none;
  }

  .toast {
    background-color: var(--color-background-default);
    border: 1px solid var(--color-borders-hairline);
    border-radius: var(--border-radius-default);
    box-shadow: var(--shadow-medium);
    padding: 1rem;
    display: grid;
    grid-template-areas: "title action" "description action";
    grid-template-columns: auto max-content;
    column-gap: 1rem;
    align-items: center;
    color: var(--color-text-default);

    &[data-state='open'] {
      animation: slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    &[data-state='closed'] {
      animation: hide 100ms ease-in forwards;
    }
    &[data-swipe='move'] {
      transform: translateX(var(--radix-toast-swipe-move-x));
    }
    &[data-swipe='cancel'] {
      transform: translateX(0);
      transition: transform 200ms ease-out;
    }
    &[data-swipe='end'] {
      animation: swipeOut 100ms ease-out forwards;
    }
  }

  .title {
    grid-area: title;
    font-weight: 600;
    font-size: var(--font-size-base);
    color: var(--color-text-default);
  }

  .description {
    grid-area: description;
    margin: 0;
    color: var(--color-text-faded);
    font-size: var(--font-size-small);
  }

  .close {
    grid-area: action;
    background: transparent;
    border: 1px solid var(--color-borders-hairline);
    color: var(--color-text-faded);
    border-radius: var(--border-radius-default);
    padding: 0.25rem 0.5rem;
    font-size: var(--font-size-small);
    cursor: pointer;

    &:hover {
      background: var(--color-background-alternative);
      color: var(--color-text-default);
    }
  }

  @keyframes slideIn {
    from { transform: translateX(calc(100% + 1.5rem)); }
    to { transform: translateX(0); }
  }

  @keyframes hide {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes swipeOut {
    from { transform: translateX(var(--radix-toast-swipe-end-x)); }
    to { transform: translateX(calc(100% + 1.5rem)); }
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/Toast/Toast.tsx`:

  ```tsx
  import React from 'react';
  import * as ToastPrimitive from '@radix-ui/react-toast';
  import classnames from 'classnames';
  import styles from './Toast.module.scss';

  export const ToastProvider = ToastPrimitive.Provider;

  export const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
  >(({ className, ...props }, ref) => (
    <ToastPrimitive.Viewport
      ref={ref}
      className={classnames(styles.viewport, className)}
      {...props}
    />
  ));
  ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

  export const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
  >(({ className, ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      className={classnames(styles.toast, className)}
      {...props}
    />
  ));
  Toast.displayName = ToastPrimitive.Root.displayName;

  export const ToastTitle = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
  >(({ className, ...props }, ref) => (
    <ToastPrimitive.Title
      ref={ref}
      className={classnames(styles.title, className)}
      {...props}
    />
  ));
  ToastTitle.displayName = ToastPrimitive.Title.displayName;

  export const ToastDescription = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
  >(({ className, ...props }, ref) => (
    <ToastPrimitive.Description
      ref={ref}
      className={classnames(styles.description, className)}
      {...props}
    />
  ));
  ToastDescription.displayName = ToastPrimitive.Description.displayName;

  export const ToastAction = ToastPrimitive.Action;

  export const ToastClose = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Close>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
  >(({ className, ...props }, ref) => (
    <ToastPrimitive.Close
      ref={ref}
      className={classnames(styles.close, className)}
      {...props}
    />
  ));
  ToastClose.displayName = ToastPrimitive.Close.displayName;
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Toast/Toast.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/Toast/Toast.stories.tsx`:

  ```tsx
  import { useState } from 'react';
  import type { Meta, StoryObj } from '@storybook/react';
  import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from './Toast';
  import Button from '@/components/dls/Button/Button';

  const meta = {
    title: 'dls/Toast',
    component: Toast,
    tags: ['autodocs'],
  } as Meta<typeof Toast>;
  export default meta;

  export const Default: StoryObj<typeof Toast> = {
    render: () => {
      const [open, setOpen] = useState(false);
      return (
        <ToastProvider swipeDirection="right">
          <Button onClick={() => setOpen(true)}>Show Toast</Button>
          <Toast open={open} onOpenChange={setOpen}>
            <ToastTitle>Saved Successfully</ToastTitle>
            <ToastDescription>Your profile settings have been updated.</ToastDescription>
            <ToastClose>Dismiss</ToastClose>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      );
    },
  };
  ```

- [ ] **Step 8: Verify in Storybook & Commit**

  ```bash
  git add src/components/dls/Toast
  git commit -m "feat(dls): add Toast primitive (Radix)"
  ```

---
