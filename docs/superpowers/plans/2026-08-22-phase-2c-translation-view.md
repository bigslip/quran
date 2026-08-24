# Phase 2c: TranslationView Components

This plan covers extending the `TranslationView` core components to support WAI-ARIA and HTML attribute forwarding. This allows the feedback progress overlay (which anchors to specific elements by injecting `data-` and `aria-` attributes) to correctly target the root wrapper elements in the Translation View.

## Components to Update

### 1. `TranslationViewCell` (`src/components/QuranReader/TranslationView/TranslationViewCell.tsx`)
- Update `TranslationViewCellProps` to extend `React.HTMLAttributes<HTMLDivElement>`.
- Extract `className` and `...props` from props in the functional component signature.
- Spread `className` and `...props` onto the outermost `div` that represents the translation cell.
- Write tests in `src/components/QuranReader/TranslationView/TranslationViewCell.test.tsx` verifying prop spreading and rendering.

### 2. `TranslationText` (`src/components/QuranReader/TranslationView/TranslationText/index.tsx`)
- Update `TranslationTextProps` to extend `React.HTMLAttributes<HTMLDivElement>`.
- Extract `className` and `...props` from props.
- Spread onto the root wrapper `div`.
- Write tests in `src/components/QuranReader/TranslationView/TranslationText/index.test.tsx` verifying prop spreading and rendering.

### 3. `TranslationView` (`src/components/QuranReader/TranslationView/index.tsx`)
- Update `TranslationViewProps` to extend `React.HTMLAttributes<HTMLDivElement>`.
- Extract `className` and `...props` from props.
- Spread onto the root wrapper `div`.
- Write tests in `src/components/QuranReader/TranslationView/index.test.tsx` verifying prop spreading and rendering.

## Execution
We will execute these tasks directly without creating sub-agents to minimize Redux context mocking issues overhead, as done in Phase 2a and 2b. All tests will be executed and verified before advancing to the next component.
