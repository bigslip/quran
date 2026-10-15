# Phase 1 Remediation Plan

**Goal:** Resolve all critical and important defects identified during the Phase 1 Senior Engineering audit across all 4 domains (Foundation, Forms, Layout/Nav, Feedback/Overlays), and achieve 100% unit test coverage for all DLS primitives.

---

## Tasks Overview

- [ ] **Task 1: Foundation & Typography Primitives (Domain 1)**
  - Fix `Button` loading click bug and props typing (`React.ButtonHTMLAttributes`).
  - Fix `SpinnerSize.Large` enum case mismatch (`'large'`).
  - Fix `QuranWord` deprecated `onKeyPress` to `onKeyDown`.
  - Create `Button.test.tsx` and `Separator.test.tsx`.
  - Verify all tests pass.

- [ ] **Task 2: Layout & Navigation Primitives (Domain 3)**
  - Fix `Pagination` semantic `<nav>`, `aria-current="page"`, and `aria-label`s.
  - Fix `Link.module.scss` focus visible indicator.
  - Fix `Tabs` automatic direction injection (`dir={useDirection()}`).
  - Fix `Breadcrumb` DLS `Link` import.
  - Implement DLS `Container` primitive (`Container.tsx`, `Container.module.scss`, `Container.test.tsx`).
  - Create `Pagination.test.tsx` and expand `Tabs.test.tsx`.
  - Verify all tests pass.

- [ ] **Task 3: Feedback, Progress, Selection & Overlays (Domain 4)**
  - Fix `Tooltip` `aria-label` clobbering on child triggers.
  - Fix `Badge` accessibility and remove `role="status"` from parent container.
  - Fix `ContentModal` `Dialog.Title` accessible naming and localized close button.
  - Fix `Toast` default duration and ARIA live regions.
  - Create `Toast.test.tsx`, `Modal.test.tsx`, and `Tooltip.test.tsx`.
  - Verify all tests pass.

- [ ] **Task 4: Form Primitives & FormBuilder (Domain 2)**
  - Fix `Input`, `TextArea`, and `Combobox` `<label htmlFor>` association.
  - Fix `aria-invalid` and `aria-describedby` support on inputs.
  - Fix `Select` falsy value handling (`value !== undefined`) and caret text overlap.
  - Fix `FormBuilder` error passing (`type={InputType.Error}`) and `ValidationErrors` double translation.
  - Create `Input.test.tsx`, `Select.test.tsx`, `Checkbox.test.tsx`, `RadioGroup.test.tsx`, `Combobox.test.tsx`, and `FormBuilder.test.tsx`.
  - Verify all tests pass.

- [ ] **Task 5: Final Phase 1 Full Verification**
  - Run full test suite: `yarn --ignore-engines vitest run`
  - Run TypeScript check: `npx tsc --noEmit`
  - Confirm 100% green build.
