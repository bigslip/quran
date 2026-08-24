# Phase 1b.2 Layout Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 8 essential layout and overlay primitive components (ContentModal, ConfirmationModal, Collapsible, HoverCard, ClickableHoverCard, PopoverMenu, HelperTooltip, Progress) for the DLS, strictly following our TDD process, styling conventions, and Radix UI primitives where applicable.

**Architecture:** Each component is implemented as a standalone directory in `src/components/dls/`. Each directory contains the component code, SCSS module, Storybook story, and Vitest unit tests. Built upon primitives from Phase 1a and Phase 1b where applicable (Modal, Tooltip, Popover).

**Tech Stack:** React, Next.js, Radix UI, SCSS Modules, Vitest, React Testing Library, Storybook.

## Global Constraints

- Must use SCSS modules (`*.module.scss`) and existing CSS variable tokens (`var(--color-...)`, `var(--font-...)`).
- Strictly adhere to WAI-ARIA guidelines (mostly handled by Radix UI).
- Tests must pass in Vitest (`yarn vitest run <file>`).
- Stories must function correctly in Storybook.

---

### Task 35: ContentModal

**Files:**
- Create: `src/components/dls/ContentModal/ContentModal.tsx`
- Create: `src/components/dls/ContentModal/ContentModal.module.scss`
- Create: `src/components/dls/ContentModal/ContentModal.stories.tsx`
- Create: `src/components/dls/ContentModal/ContentModal.test.tsx`

- [ ] **Step 1: Write the failing test**

  Create `src/components/dls/ContentModal/ContentModal.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import ContentModal from './ContentModal';

  // Mock Modal since we just want to test ContentModal wrapping logic
  vi.mock('@/components/dls/Modal/Modal', () => ({
    default: ({ children, isOpen, onEscapeKeyDown }: any) => (
      isOpen ? <div data-testid="modal" onKeyDown={onEscapeKeyDown}>{children}</div> : null
    )
  }));

  describe('ContentModal', () => {
    it('renders header, body, and footer', () => {
      render(
        <ContentModal isOpen={true} header="My Header" footer={<span>My Footer</span>}>
          My Body
        </ContentModal>
      );
      expect(screen.getByText('My Header')).toBeInTheDocument();
      expect(screen.getByText('My Body')).toBeInTheDocument();
      expect(screen.getByText('My Footer')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <ContentModal isOpen={false} header="My Header">
          My Body
        </ContentModal>
      );
      expect(screen.queryByText('My Header')).not.toBeInTheDocument();
    });

    it('calls onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(<ContentModal isOpen={true} onClose={onClose} hasCloseButton />);
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/ContentModal/ContentModal.test.tsx
  ```

- [ ] **Step 3: Implement SCSS**

  Create `src/components/dls/ContentModal/ContentModal.module.scss`:

  ```scss
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 80vh;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--color-borders-hairline);
    
    .title {
      font-size: var(--font-size-large);
      font-weight: 600;
      color: var(--color-text-default);
      margin: 0;
    }
  }

  .closeButton {
    background: transparent;
    border: none;
    color: var(--color-text-faded);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: var(--border-radius-default);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--color-background-alternative);
      color: var(--color-text-default);
    }
  }

  .content {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
    color: var(--color-text-default);
  }

  .footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-borders-hairline);
    background: var(--color-background-default);
    border-radius: 0 0 var(--border-radius-default) var(--border-radius-default);
  }
  ```

- [ ] **Step 4: Implement component**

  Create `src/components/dls/ContentModal/ContentModal.tsx`:

  ```tsx
  import React, { ReactNode } from 'react';
  import classnames from 'classnames';
  import Modal from '@/components/dls/Modal/Modal';
  import styles from './ContentModal.module.scss';

  export interface ContentModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    header?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
    hasCloseButton?: boolean;
    className?: string;
  }

  const ContentModal: React.FC<ContentModalProps> = ({
    isOpen = false,
    onClose,
    header,
    footer,
    children,
    hasCloseButton = false,
    className,
  }) => {
    return (
      <Modal isOpen={isOpen} onClickOutside={onClose} onEscapeKeyDown={onClose}>
        <div className={classnames(styles.container, className)}>
          {header && (
            <div className={styles.header}>
              <div className={styles.title}>{header}</div>
              {hasCloseButton && (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Close"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className={styles.content}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </Modal>
    );
  };

  export default ContentModal;
  ```

- [ ] **Step 5: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/ContentModal/ContentModal.test.tsx
  ```

- [ ] **Step 6: Write Storybook story**

  Create `src/components/dls/ContentModal/ContentModal.stories.tsx`:

  ```tsx
  import { useState } from 'react';
  import type { Meta, StoryObj } from '@storybook/react';
  import ContentModal from './ContentModal';
  import Button from '@/components/dls/Button/Button';

  const meta = {
    title: 'dls/ContentModal',
    component: ContentModal,
    tags: ['autodocs'],
  } as Meta<typeof ContentModal>;
  export default meta;

  export const Default: StoryObj<typeof ContentModal> = {
    render: () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
          <ContentModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            header="Terms of Service"
            hasCloseButton
            footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsOpen(false)}>Accept</Button>
              </div>
            }
          >
            <p>Please read these terms carefully before using our service.</p>
            <p style={{ marginTop: '1rem' }}>By using the service, you agree to be bound by these terms.</p>
          </ContentModal>
        </>
      );
    },
  };
  ```

- [ ] **Step 7: Verify in Storybook & Commit**

  ```bash
  git add src/components/dls/ContentModal
  git commit -m "feat(dls): add ContentModal primitive"
  ```

---

### Task 36: ConfirmationModal

**Files:**
- Create: `src/components/dls/ConfirmationModal/ConfirmationModal.tsx`
- Create: `src/components/dls/ConfirmationModal/ConfirmationModal.stories.tsx`
- Create: `src/components/dls/ConfirmationModal/ConfirmationModal.test.tsx`

- [ ] **Step 1: Write the failing test**

  Create `src/components/dls/ConfirmationModal/ConfirmationModal.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import ConfirmationModal from './ConfirmationModal';

  vi.mock('@/components/dls/ContentModal/ContentModal', () => ({
    default: ({ isOpen, header, footer, children }: any) => (
      isOpen ? (
        <div data-testid="content-modal">
          <div>{header}</div>
          <div>{children}</div>
          <div>{footer}</div>
        </div>
      ) : null
    )
  }));

  describe('ConfirmationModal', () => {
    it('renders title and body', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          title="Delete item?"
          body="Are you sure you want to delete this?"
        />
      );
      expect(screen.getByText('Delete item?')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button clicked', () => {
      const onConfirm = vi.fn();
      render(<ConfirmationModal isOpen={true} onConfirm={onConfirm} confirmText="Yes, delete" />);
      fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button clicked', () => {
      const onCancel = vi.fn();
      render(<ConfirmationModal isOpen={true} onCancel={onCancel} cancelText="No, wait" />);
      fireEvent.click(screen.getByRole('button', { name: 'No, wait' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/ConfirmationModal/ConfirmationModal.test.tsx
  ```

- [ ] **Step 3: Implement component**

  Create `src/components/dls/ConfirmationModal/ConfirmationModal.tsx`:

  ```tsx
  import React, { ReactNode } from 'react';
  import ContentModal from '@/components/dls/ContentModal/ContentModal';
  import Button from '@/components/dls/Button/Button';

  export interface ConfirmationModalProps {
    isOpen?: boolean;
    title?: ReactNode;
    body?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    isConfirmDanger?: boolean;
  }

  const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen = false,
    title = 'Confirm',
    body,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isConfirmDanger = false,
  }) => {
    const footer = (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
        )}
        {onConfirm && (
          <Button
            variant={isConfirmDanger ? 'primary' : 'primary'} // We don't have a danger variant in Button yet, fallback to primary
            onClick={onConfirm}
            style={isConfirmDanger ? { backgroundColor: 'var(--color-error-medium)' } : undefined}
          >
            {confirmText}
          </Button>
        )}
      </div>
    );

    return (
      <ContentModal
        isOpen={isOpen}
        onClose={onCancel}
        header={title}
        footer={footer}
        hasCloseButton
      >
        <p style={{ margin: 0, color: 'var(--color-text-faded)' }}>{body}</p>
      </ContentModal>
    );
  };

  export default ConfirmationModal;
  ```

- [ ] **Step 4: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/ConfirmationModal/ConfirmationModal.test.tsx
  ```

- [ ] **Step 5: Write Storybook story**

  Create `src/components/dls/ConfirmationModal/ConfirmationModal.stories.tsx`:

  ```tsx
  import { useState } from 'react';
  import type { Meta, StoryObj } from '@storybook/react';
  import ConfirmationModal from './ConfirmationModal';
  import Button from '@/components/dls/Button/Button';

  const meta = {
    title: 'dls/ConfirmationModal',
    component: ConfirmationModal,
    tags: ['autodocs'],
  } as Meta<typeof ConfirmationModal>;
  export default meta;

  export const Default: StoryObj<typeof ConfirmationModal> = {
    render: () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Delete Account</Button>
          <ConfirmationModal
            isOpen={isOpen}
            onCancel={() => setIsOpen(false)}
            onConfirm={() => setIsOpen(false)}
            title="Delete Account?"
            body="Are you absolutely sure you want to delete your account? This action cannot be undone."
            confirmText="Yes, delete"
            cancelText="Cancel"
            isConfirmDanger
          />
        </>
      );
    },
  };
  ```

- [ ] **Step 6: Verify in Storybook & Commit**

  ```bash
  git add src/components/dls/ConfirmationModal
  git commit -m "feat(dls): add ConfirmationModal primitive"
  ```

---

### Task 37: Collapsible

**Files:**
- Create: `src/components/dls/Collapsible/Collapsible.tsx`
- Create: `src/components/dls/Collapsible/Collapsible.module.scss`
- Create: `src/components/dls/Collapsible/Collapsible.stories.tsx`
- Create: `src/components/dls/Collapsible/Collapsible.test.tsx`

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add @radix-ui/react-collapsible
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/Collapsible/Collapsible.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Collapsible from './Collapsible';

  describe('Collapsible', () => {
    it('renders title and allows toggling content', () => {
      render(
        <Collapsible title="More Info">
          {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
        </Collapsible>
      );
      
      expect(screen.getByText('More Info')).toBeInTheDocument();
      // Collapsed by default
      expect(screen.queryByText('Hidden content revealed')).not.toBeInTheDocument();
      
      fireEvent.click(screen.getByRole('button', { name: /more info/i }));
      expect(screen.getByText('Hidden content revealed')).toBeInTheDocument();
    });

    it('can be defaultOpen', () => {
      render(
        <Collapsible title="More Info" isDefaultOpen>
          {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
        </Collapsible>
      );
      expect(screen.getByText('Hidden content revealed')).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Collapsible/Collapsible.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/Collapsible/Collapsible.module.scss`:

  ```scss
  .root {
    width: 100%;
  }

  .trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem;
    background: transparent;
    border: none;
    border-radius: var(--border-radius-default);
    color: var(--color-text-default);
    font-size: var(--font-size-base);
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-background-alternative);
    }
    
    &:focus-visible {
      outline: 2px solid var(--color-primary-medium);
      outline-offset: 2px;
    }
  }

  .titleWrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon {
    transition: transform 0.2s;
    color: var(--color-text-faded);

    &[data-state='open'] {
      transform: rotate(180deg);
    }
  }

  .content {
    overflow: hidden;
    &[data-state='open'] {
      animation: slideDown 300ms ease-out forwards;
    }
    &[data-state='closed'] {
      animation: slideUp 300ms ease-out forwards;
    }
  }

  @keyframes slideDown {
    from { height: 0; opacity: 0; }
    to { height: var(--radix-collapsible-content-height); opacity: 1; }
  }

  @keyframes slideUp {
    from { height: var(--radix-collapsible-content-height); opacity: 1; }
    to { height: 0; opacity: 0; }
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/Collapsible/Collapsible.tsx`:

  ```tsx
  import React, { useState } from 'react';
  import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
  import classnames from 'classnames';
  import styles from './Collapsible.module.scss';

  interface ChildrenRenderProps {
    isOpen: boolean;
  }

  export interface CollapsibleProps {
    title: React.ReactNode;
    children: (props: ChildrenRenderProps) => React.ReactNode;
    isDefaultOpen?: boolean;
    className?: string;
  }

  const Collapsible: React.FC<CollapsibleProps> = ({
    title,
    children,
    isDefaultOpen = false,
    className,
  }) => {
    const [isOpen, setIsOpen] = useState(isDefaultOpen);

    return (
      <CollapsiblePrimitive.Root
        className={classnames(styles.root, className)}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <CollapsiblePrimitive.Trigger className={styles.trigger}>
          <div className={styles.titleWrapper}>{title}</div>
          <svg
            className={styles.icon}
            data-state={isOpen ? 'open' : 'closed'}
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Content className={styles.content}>
          {children({ isOpen })}
        </CollapsiblePrimitive.Content>
      </CollapsiblePrimitive.Root>
    );
  };

  export default Collapsible;
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Collapsible/Collapsible.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/Collapsible/Collapsible.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Collapsible from './Collapsible';

  const meta = {
    title: 'dls/Collapsible',
    component: Collapsible,
    tags: ['autodocs'],
  } as Meta<typeof Collapsible>;
  export default meta;

  export const Default: StoryObj<typeof Collapsible> = {
    args: {
      title: 'Advanced Settings',
      children: ({ isOpen }) => (
        <div style={{ padding: '1rem', background: 'var(--color-background-alternative)', borderRadius: '4px', marginTop: '0.5rem' }}>
          {isOpen && <p style={{ margin: 0 }}>Here are some advanced settings that are usually hidden to keep the UI clean.</p>}
        </div>
      )
    },
  };
  ```

- [ ] **Step 8: Verify in Storybook & Commit**

  ```bash
  git add package.json yarn.lock src/components/dls/Collapsible
  git commit -m "feat(dls): add Collapsible primitive (Radix)"
  ```

---

### Task 38: HoverCard

**Files:**
- Create: `src/components/dls/HoverCard/index.tsx`
- Create: `src/components/dls/HoverCard/HoverCard.module.scss`
- Create: `src/components/dls/HoverCard/HoverCard.stories.tsx`
- Create: `src/components/dls/HoverCard/HoverCard.test.tsx`

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add @radix-ui/react-hover-card
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/HoverCard/HoverCard.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen, waitFor } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import HoverCard from './index';

  describe('HoverCard', () => {
    it('renders trigger and shows content on hover', async () => {
      render(
        <HoverCard content={<div>Hidden Info</div>}>
          <span>Hover me</span>
        </HoverCard>
      );
      
      expect(screen.getByText('Hover me')).toBeInTheDocument();
      expect(screen.queryByText('Hidden Info')).not.toBeInTheDocument();
      
      await userEvent.hover(screen.getByText('Hover me'));
      await waitFor(() => {
        expect(screen.getByText('Hidden Info')).toBeInTheDocument();
      });
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/HoverCard/HoverCard.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/HoverCard/HoverCard.module.scss`:

  ```scss
  .content {
    background-color: var(--color-background-default);
    border: 1px solid var(--color-borders-hairline);
    border-radius: var(--border-radius-default);
    padding: 1rem;
    box-shadow: var(--shadow-medium);
    animation-duration: 200ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1000;

    &[data-state='open'] {
      &[data-side='top'] { animation-name: slideDownAndFade; }
      &[data-side='right'] { animation-name: slideLeftAndFade; }
      &[data-side='bottom'] { animation-name: slideUpAndFade; }
      &[data-side='left'] { animation-name: slideRightAndFade; }
    }
  }

  .arrow {
    fill: var(--color-background-default);
    stroke: var(--color-borders-hairline);
    stroke-width: 1px;
  }

  @keyframes slideUpAndFade {
    from { opacity: 0; transform: translateY(2px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideRightAndFade {
    from { opacity: 0; transform: translateX(-2px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideDownAndFade {
    from { opacity: 0; transform: translateY(-2px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideLeftAndFade {
    from { opacity: 0; transform: translateX(2px); }
    to { opacity: 1; transform: translateX(0); }
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/HoverCard/index.tsx`:

  ```tsx
  import React, { ReactNode } from 'react';
  import * as RadixHoverCard from '@radix-ui/react-hover-card';
  import classnames from 'classnames';
  import styles from './HoverCard.module.scss';

  export interface HoverCardProps {
    children: ReactNode;
    content: ReactNode;
    openDelay?: number;
    closeDelay?: number;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
  }

  const HoverCard: React.FC<HoverCardProps> = ({
    children,
    content,
    openDelay = 200,
    closeDelay = 300,
    side = 'bottom',
    align = 'center',
    className,
  }) => {
    return (
      <RadixHoverCard.Root openDelay={openDelay} closeDelay={closeDelay}>
        <RadixHoverCard.Trigger asChild>
          {children}
        </RadixHoverCard.Trigger>
        <RadixHoverCard.Portal>
          <RadixHoverCard.Content
            className={classnames(styles.content, className)}
            side={side}
            align={align}
            sideOffset={5}
          >
            {content}
            <RadixHoverCard.Arrow className={styles.arrow} />
          </RadixHoverCard.Content>
        </RadixHoverCard.Portal>
      </RadixHoverCard.Root>
    );
  };

  export default HoverCard;
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/HoverCard/HoverCard.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/HoverCard/HoverCard.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import HoverCard from './index';

  const meta = {
    title: 'dls/HoverCard',
    component: HoverCard,
    tags: ['autodocs'],
  } as Meta<typeof HoverCard>;
  export default meta;

  export const Default: StoryObj<typeof HoverCard> = {
    args: {
      children: <span style={{ textDecoration: 'underline', cursor: 'pointer', padding: '2rem' }}>Hover over me</span>,
      content: (
        <div style={{ maxWidth: '200px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Detailed Info</h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-faded)' }}>This is the hidden content that gets revealed when you hover over the trigger element.</p>
        </div>
      )
    },
  };
  ```

- [ ] **Step 8: Verify in Storybook & Commit**

  ```bash
  git add package.json yarn.lock src/components/dls/HoverCard
  git commit -m "feat(dls): add HoverCard primitive (Radix)"
  ```

---

### Task 39: ClickableHoverCard

**Files:**
- Create: `src/components/dls/ClickableHoverCard/index.tsx`
- Create: `src/components/dls/ClickableHoverCard/ClickableHoverCard.stories.tsx`
- Create: `src/components/dls/ClickableHoverCard/ClickableHoverCard.test.tsx`

- [ ] **Step 1: Write the failing test**

  Create `src/components/dls/ClickableHoverCard/ClickableHoverCard.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen, waitFor } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import ClickableHoverCard from './index';

  describe('ClickableHoverCard', () => {
    it('behaves as a popover on click', async () => {
      render(
        <ClickableHoverCard content={<div>Hidden Info</div>}>
          <button type="button">Action</button>
        </ClickableHoverCard>
      );
      
      expect(screen.queryByText('Hidden Info')).not.toBeInTheDocument();
      
      // Click should open it
      await userEvent.click(screen.getByRole('button', { name: 'Action' }));
      await waitFor(() => {
        expect(screen.getByText('Hidden Info')).toBeInTheDocument();
      });
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/ClickableHoverCard/ClickableHoverCard.test.tsx
  ```

- [ ] **Step 3: Implement component**

  Create `src/components/dls/ClickableHoverCard/index.tsx`:

  ```tsx
  import React, { ReactNode } from 'react';
  import HoverCard from '@/components/dls/HoverCard';
  import Popover from '@/components/dls/Popover'; // Popover was built in phase 1b

  export interface ClickableHoverCardProps {
    children: ReactNode;
    content: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
  }

  // Mobile/touch uses Popover (click), desktop uses HoverCard + Popover
  // For simplicity we just use Popover as the click handler wrapping HoverCard content
  const ClickableHoverCard: React.FC<ClickableHoverCardProps> = ({
    children,
    content,
    side = 'bottom',
  }) => {
    return (
      <Popover content={content} useTooltipStyles={false}>
        <HoverCard content={content} side={side}>
          {/* We need to wrap children in a span if they are strings, or forward ref properly */}
          <span style={{ cursor: 'pointer' }}>{children}</span>
        </HoverCard>
      </Popover>
    );
  };

  export default ClickableHoverCard;
  ```

- [ ] **Step 4: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/ClickableHoverCard/ClickableHoverCard.test.tsx
  ```

- [ ] **Step 5: Write Storybook story**

  Create `src/components/dls/ClickableHoverCard/ClickableHoverCard.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import ClickableHoverCard from './index';

  const meta = {
    title: 'dls/ClickableHoverCard',
    component: ClickableHoverCard,
    tags: ['autodocs'],
  } as Meta<typeof ClickableHoverCard>;
  export default meta;

  export const Default: StoryObj<typeof ClickableHoverCard> = {
    args: {
      children: 'Hover or click me',
      content: <div style={{ padding: '1rem', width: '200px' }}>This works for hover on desktop, and click on mobile devices!</div>
    },
  };
  ```

- [ ] **Step 6: Verify in Storybook & Commit**

  ```bash
  git add src/components/dls/ClickableHoverCard
  git commit -m "feat(dls): add ClickableHoverCard primitive"
  ```

---

### Task 40: PopoverMenu

**Files:**
- Create: `src/components/dls/PopoverMenu/PopoverMenu.tsx`
- Create: `src/components/dls/PopoverMenu/PopoverMenu.module.scss`
- Create: `src/components/dls/PopoverMenu/PopoverMenu.stories.tsx`
- Create: `src/components/dls/PopoverMenu/PopoverMenu.test.tsx`

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add @radix-ui/react-dropdown-menu
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/PopoverMenu/PopoverMenu.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import { PopoverMenu, PopoverMenuItem } from './PopoverMenu';

  describe('PopoverMenu', () => {
    it('renders a menu that opens on click', async () => {
      render(
        <PopoverMenu trigger={<button>Open Menu</button>}>
          <PopoverMenuItem onClick={() => {}}>Item 1</PopoverMenuItem>
          <PopoverMenuItem onClick={() => {}}>Item 2</PopoverMenuItem>
        </PopoverMenu>
      );
      
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });

    it('fires onClick on menu items', async () => {
      const onClick = vi.fn();
      render(
        <PopoverMenu trigger={<button>Open Menu</button>}>
          <PopoverMenuItem onClick={onClick}>Clickable</PopoverMenuItem>
        </PopoverMenu>
      );
      
      fireEvent.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => screen.getByText('Clickable'));
      
      fireEvent.click(screen.getByText('Clickable'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/PopoverMenu/PopoverMenu.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/PopoverMenu/PopoverMenu.module.scss`:

  ```scss
  .content {
    min-width: 200px;
    background-color: var(--color-background-default);
    border: 1px solid var(--color-borders-hairline);
    border-radius: var(--border-radius-default);
    padding: 0.25rem;
    box-shadow: var(--shadow-medium);
    z-index: 1000;
  }

  .item {
    font-size: var(--font-size-small);
    line-height: 1;
    color: var(--color-text-default);
    border-radius: 3px;
    display: flex;
    align-items: center;
    height: 2.25rem;
    padding: 0 1rem;
    position: relative;
    user-select: none;
    outline: none;
    cursor: pointer;

    &[data-disabled] {
      color: var(--color-text-faded);
      pointer-events: none;
    }

    &[data-highlighted] {
      background-color: var(--color-primary-faint);
      color: var(--color-primary-deep);
    }
  }

  .itemIcon {
    margin-inline-end: 0.5rem;
    display: flex;
    align-items: center;
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/PopoverMenu/PopoverMenu.tsx`:

  ```tsx
  import React, { ReactNode } from 'react';
  import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
  import classnames from 'classnames';
  import styles from './PopoverMenu.module.scss';

  export interface PopoverMenuProps {
    trigger: ReactNode;
    children: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
  }

  export const PopoverMenu: React.FC<PopoverMenuProps> = ({
    trigger,
    children,
    side = 'bottom',
    align = 'start',
    className,
  }) => {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          {trigger}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={classnames(styles.content, className)}
            side={side}
            align={align}
            sideOffset={5}
          >
            {children}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  };

  export interface PopoverMenuItemProps {
    children: ReactNode;
    icon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }

  export const PopoverMenuItem: React.FC<PopoverMenuItemProps> = ({
    children,
    icon,
    onClick,
    disabled,
    className,
  }) => {
    return (
      <DropdownMenu.Item
        className={classnames(styles.item, className)}
        onClick={onClick}
        disabled={disabled}
      >
        {icon && <span className={styles.itemIcon}>{icon}</span>}
        {children}
      </DropdownMenu.Item>
    );
  };
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/PopoverMenu/PopoverMenu.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/PopoverMenu/PopoverMenu.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import { PopoverMenu, PopoverMenuItem } from './PopoverMenu';
  import Button from '@/components/dls/Button/Button';

  const meta = {
    title: 'dls/PopoverMenu',
    component: PopoverMenu,
    tags: ['autodocs'],
  } as Meta<typeof PopoverMenu>;
  export default meta;

  export const Default: StoryObj<typeof PopoverMenu> = {
    render: () => (
      <PopoverMenu trigger={<Button>Actions</Button>}>
        <PopoverMenuItem onClick={() => alert('Edit')}>Edit Profile</PopoverMenuItem>
        <PopoverMenuItem onClick={() => alert('Settings')}>Account Settings</PopoverMenuItem>
        <PopoverMenuItem disabled>Billing (Unavailable)</PopoverMenuItem>
        <PopoverMenuItem onClick={() => alert('Logout')}>Log Out</PopoverMenuItem>
      </PopoverMenu>
    ),
  };
  ```

- [ ] **Step 8: Verify in Storybook & Commit**

  ```bash
  git add package.json yarn.lock src/components/dls/PopoverMenu
  git commit -m "feat(dls): add PopoverMenu primitive (Radix Dropdown)"
  ```

---

### Task 41: HelperTooltip

**Files:**
- Create: `src/components/dls/HelperTooltip/HelperTooltip.tsx`
- Create: `src/components/dls/HelperTooltip/HelperTooltip.stories.tsx`
- Create: `src/components/dls/HelperTooltip/HelperTooltip.test.tsx`

- [ ] **Step 1: Write the failing test**

  Create `src/components/dls/HelperTooltip/HelperTooltip.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen, waitFor } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import HelperTooltip from './HelperTooltip';

  describe('HelperTooltip', () => {
    it('renders a question mark icon by default', () => {
      render(<HelperTooltip>Help text</HelperTooltip>);
      expect(screen.getByRole('button')).toBeInTheDocument();
      // Should have some generic accessible name if we rely on tooltips
    });

    it('shows help text on hover', async () => {
      render(<HelperTooltip>Some advanced configuration</HelperTooltip>);
      await userEvent.hover(screen.getByRole('button'));
      await waitFor(() => {
        expect(screen.getByText('Some advanced configuration')).toBeInTheDocument();
      });
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/HelperTooltip/HelperTooltip.test.tsx
  ```

- [ ] **Step 3: Implement component**

  Create `src/components/dls/HelperTooltip/HelperTooltip.tsx`:

  ```tsx
  import React from 'react';
  import Tooltip from '@/components/dls/Tooltip/Tooltip';

  export interface HelperTooltipProps {
    children: React.ReactNode;
  }

  const HelperTooltip: React.FC<HelperTooltipProps> = ({ children }) => {
    return (
      <Tooltip text={children}>
        <button
          type="button"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-faded)',
            cursor: 'help',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            borderRadius: '100%',
          }}
          aria-label="Help"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
      </Tooltip>
    );
  };

  export default HelperTooltip;
  ```

- [ ] **Step 4: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/HelperTooltip/HelperTooltip.test.tsx
  ```

- [ ] **Step 5: Write Storybook story**

  Create `src/components/dls/HelperTooltip/HelperTooltip.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import HelperTooltip from './HelperTooltip';

  const meta = {
    title: 'dls/HelperTooltip',
    component: HelperTooltip,
    tags: ['autodocs'],
  } as Meta<typeof HelperTooltip>;
  export default meta;

  export const Default: StoryObj<typeof HelperTooltip> = {
    render: () => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Tajweed Rules</span>
        <HelperTooltip>
          Displays color-coded tajweed rules to help with proper pronunciation.
        </HelperTooltip>
      </div>
    ),
  };
  ```

- [ ] **Step 6: Verify in Storybook & Commit**

  ```bash
  git add src/components/dls/HelperTooltip
  git commit -m "feat(dls): add HelperTooltip primitive"
  ```

---

### Task 42: Progress

**Files:**
- Create: `src/components/dls/Progress/index.tsx`
- Create: `src/components/dls/Progress/Progress.module.scss`
- Create: `src/components/dls/Progress/Progress.stories.tsx`
- Create: `src/components/dls/Progress/Progress.test.tsx`

- [ ] **Step 1: Install dependency**

  ```bash
  yarn add @radix-ui/react-progress
  ```

- [ ] **Step 2: Write the failing test**

  Create `src/components/dls/Progress/Progress.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import Progress from './index';

  describe('Progress', () => {
    it('renders a progress bar', () => {
      render(<Progress value={50} />);
      const pb = screen.getByRole('progressbar');
      expect(pb).toBeInTheDocument();
      expect(pb).toHaveAttribute('aria-valuenow', '50');
    });

    it('restricts value between 0 and 100', () => {
      render(<Progress value={150} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    });
  });
  ```

- [ ] **Step 3: Run test — expect FAIL**

  ```bash
  yarn vitest run src/components/dls/Progress/Progress.test.tsx
  ```

- [ ] **Step 4: Implement SCSS**

  Create `src/components/dls/Progress/Progress.module.scss`:

  ```scss
  .root {
    position: relative;
    overflow: hidden;
    background: var(--color-borders-hairline);
    border-radius: 99999px;
    width: 100%;
    
    &[data-size='small'] { height: 4px; }
    &[data-size='medium'] { height: 8px; }
    &[data-size='large'] { height: 12px; }
  }

  .indicator {
    background-color: var(--color-primary-medium);
    width: 100%;
    height: 100%;
    transition: transform 660ms cubic-bezier(0.65, 0, 0.35, 1);
  }
  ```

- [ ] **Step 5: Implement component**

  Create `src/components/dls/Progress/index.tsx`:

  ```tsx
  import React from 'react';
  import * as RadixProgress from '@radix-ui/react-progress';
  import classnames from 'classnames';
  import styles from './Progress.module.scss';

  export interface ProgressProps {
    value: number;
    size?: 'small' | 'medium' | 'large';
    className?: string;
  }

  const Progress: React.FC<ProgressProps> = ({
    value,
    size = 'medium',
    className,
  }) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(100, Math.max(0, value || 0));

    return (
      <RadixProgress.Root
        className={classnames(styles.root, className)}
        value={clampedValue}
        data-size={size}
      >
        <RadixProgress.Indicator
          className={styles.indicator}
          style={{ transform: `translateX(-${100 - clampedValue}%)` }}
        />
      </RadixProgress.Root>
    );
  };

  export default Progress;
  ```

- [ ] **Step 6: Run test — expect PASS**

  ```bash
  yarn vitest run src/components/dls/Progress/Progress.test.tsx
  ```

- [ ] **Step 7: Write Storybook story**

  Create `src/components/dls/Progress/Progress.stories.tsx`:

  ```tsx
  import { useState, useEffect } from 'react';
  import type { Meta, StoryObj } from '@storybook/react';
  import Progress from './index';

  const meta = {
    title: 'dls/Progress',
    component: Progress,
    tags: ['autodocs'],
    argTypes: {
      size: { control: 'select', options: ['small', 'medium', 'large'] }
    }
  } as Meta<typeof Progress>;
  export default meta;

  export const Default: StoryObj<typeof Progress> = {
    args: {
      value: 65,
      size: 'medium',
    },
  };

  export const Animated: StoryObj<typeof Progress> = {
    render: () => {
      const [progress, setProgress] = useState(10);
      useEffect(() => {
        const timer = setTimeout(() => setProgress(85), 500);
        return () => clearTimeout(timer);
      }, []);
      return <Progress value={progress} />;
    },
  };
  ```

- [ ] **Step 8: Verify in Storybook & Commit**

  ```bash
  git add package.json yarn.lock src/components/dls/Progress
  git commit -m "feat(dls): add Progress primitive (Radix)"
  ```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-30-phase-1b-2-layout-primitives.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
