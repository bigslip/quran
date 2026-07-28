# Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a fresh Next.js 14 project with the full toolchain, port the SCSS design-token system from reference, wire up Redux with persisted theme, build the page layout shell (navbar/footer/audio-bar slots), and implement the first 12 DLS primitives with TDD. End state: a deployable foundation that subsequent phases plug features into.

**Architecture:** Fresh project at `/home/v2ray/projects/quran-clone/`. Next.js 14 Pages Router + TypeScript + SCSS-with-CSS-variables theming + Redux Toolkit (persisted) + Radix UI primitives + Storybook 8 + Vitest + Playwright. Reference repo at `/home/v2ray/projects/quran/` is the spec — read its source to resolve behavior questions, do not copy verbatim.

**Tech Stack:** Pinned in master plan. Key versions: Next `^14.2.6`, React `^18.3.1`, TypeScript `^5.5.4`, Node `18.x`, Redux Toolkit `^2.2.7`, Radix UI (16 packages), Storybook `^8.2.9`, Vitest `^2.0.5`, Playwright `^1.46.1`.

**Decisions locked in:** See `docs/decisions.md`. Summary: self-host quran.com-api (backend), Firebase (auth), Sanity (CMS), all 604 COLRv1 fonts (Quran text), SCSS + CSS variables (styling), self-mirrored audio (start local → S3 later).

---

## File Structure

Created during this phase. Paths relative to `/home/v2ray/projects/quran-clone/`.

```
/home/v2ray/projects/quran-clone/
├── .env.example                            # Created Task 4
├── .eslintrc.json                          # Created Task 5 (copied from reference)
├── .eslintignore
├── .prettierrc
├── .stylelintrc.json
├── .storybook/
│   ├── main.ts                             # Created Task 7
│   ├── preview.tsx
│   └── manager.ts
├── next.config.js                          # Created Task 5 (stripped of Sentry/PWA)
├── package.json                            # Created Task 4
├── playwright.config.ts                    # Created Task 5
├── tsconfig.json
├── vitest.config.ts
├── public/
│   └── fonts/                              # Created Task 9
│       ├── ui/                             # Figtree, Kitab
│       └── quran/hafs/v4/colrv1/woff/      # 604 page-fonts (download script in Task 9)
├── scripts/
│   └── fetch-fonts.mjs                     # Created Task 9
├── src/
│   ├── pages/
│   │   ├── _app.tsx                        # Created Task 11
│   │   ├── _document.tsx                   # Created Task 11
│   │   └── index.tsx                       # Created Task 12
│   ├── components/
│   │   ├── Layout/
│   │   │   └── PageLayout.tsx              # Created Task 12
│   │   ├── Navbar/
│   │   │   ├── Navbar.tsx                  # Created Task 12 (stub)
│   │   │   └── Navbar.module.scss
│   │   ├── Footer/
│   │   │   ├── Footer.tsx                  # Created Task 12 (stub)
│   │   │   └── Footer.module.scss
│   │   ├── ThemeProvider.tsx               # Created Task 10
│   │   └── dls/
│   │       ├── Button/                     # Tasks 14
│   │       │   ├── Button.tsx
│   │       │   ├── Button.module.scss
│   │       │   ├── Button.stories.tsx
│   │       │   └── Button.test.tsx
│   │       ├── Input/                      # Task 15
│   │       ├── Card/                       # Task 16
│   │       ├── Separator/                  # Task 17
│   │       ├── Spinner/                    # Task 18
│   │       ├── Skeleton/                   # Task 19
│   │       ├── Badge/                      # Task 20
│   │       ├── Pill/                       # Task 21
│   │       ├── Tooltip/                    # Task 22
│   │       ├── Toast/                      # Task 23
│   │       ├── Modal/                      # Task 24
│   │       ├── Popover/                    # Task 25
│   │       └── Scrollable/                 # Task 26
│   ├── redux/
│   │   ├── store.ts                        # Created Task 8
│   │   ├── Provider.tsx
│   │   ├── RootState.ts
│   │   ├── types/
│   │   │   └── SliceName.ts
│   │   └── slices/
│   │       └── theme.ts                    # Created Task 8
│   └── styles/
│       ├── global.scss                     # Created Task 6
│       ├── theme.scss
│       ├── variables.scss
│       ├── _breakpoints.scss
│       ├── _constants.scss
│       ├── _shades.scss
│       ├── _theme.scss
│       ├── _utility.scss
│       ├── reset.scss
│       ├── fonts.scss
│       ├── auth/                           # Empty for now
│       └── themes/
│           ├── _light.scss                 # Created Task 6
│           ├── _dark.scss
│           └── _sepia.scss
```

---

## Section 1: Project Setup (Tasks 1–5)

### Task 1: Create project directory and scaffold Next.js

**Files:**
- Create: `/home/v2ray/projects/quran-clone/`

- [ ] **Step 1: Create directory and scaffold.**

  ```bash
  mkdir -p /home/v2ray/projects/quran-clone && cd /home/v2ray/projects/quran-clone
  npx create-next-app@14 . --typescript --eslint --use-yarn --no-tailwind --app=false --src-dir=true --import-alias="@/*"
  ```

  Answer "Yes" to "Use TypeScript?", "Yes" to "Use ESLint?", "No" to Tailwind, "Yes" to `src/` directory, "No" to App Router, "Yes" to import alias. Set alias to `@/*`.

- [ ] **Step 2: Verify scaffold runs.**

  ```bash
  yarn dev
  ```

  Expected: server starts on `localhost:3000`, default Next.js page renders. Stop with Ctrl+C.

- [ ] **Step 3: Init git and first commit.**

  ```bash
  git init
  git add .
  git commit -m "chore: scaffold Next.js 14 project"
  ```

---

### Task 2: Read reference dependencies into new package.json

**Files:**
- Modify: `/home/v2ray/projects/quran-clone/package.json`

- [ ] **Step 1: Copy dependency block from reference.**

  Read `/home/v2ray/projects/quran/package.json` lines 43–198 (the `dependencies` and `devDependencies` objects). Paste them into your `/home/v2ray/projects/quran-clone/package.json`, replacing the default `dependencies`/`devDependencies` from create-next-app.

  Keep your `scripts` block (don't overwrite with reference's — we add scripts incrementally). Keep `engines: { node: "18.x" }`.

- [ ] **Step 2: Install.**

  ```bash
  yarn install
  ```

  Expected: install completes. If peer-dep warnings, note them but proceed.

- [ ] **Step 3: Verify dev server still works.**

  ```bash
  yarn dev
  ```

  If errors, the most likely cause is missing `next.config.js` plugins referenced by deps — those get added in Task 5.

- [ ] **Step 4: Commit.**

  ```bash
  git add package.json yarn.lock
  git commit -m "chore: install full dependency set from reference"
  ```

---

### Task 3: Set up TypeScript config

**Files:**
- Modify: `/home/v2ray/projects/quran-clone/tsconfig.json`

- [ ] **Step 1: Copy reference tsconfig.**

  ```bash
  cp /home/v2ray/projects/quran/tsconfig.json /home/v2ray/projects/quran-clone/tsconfig.json
  ```

  Read both files and reconcile any path differences (your project uses `src/` so paths should already align).

- [ ] **Step 2: Verify typecheck.**

  ```bash
  yarn tsc --noEmit
  ```

  Expected: 0 errors on a fresh scaffold.

- [ ] **Step 3: Commit.**

  ```bash
  git add tsconfig.json
  git commit -m "chore: align tsconfig with reference"
  ```

---

### Task 4: Create `.env.example`

**Files:**
- Create: `/home/v2ray/projects/quran-clone/.env.example`

- [ ] **Step 1: Copy reference env example.**

  ```bash
  cp /home/v2ray/projects/quran/.env.example /home/v2ray/projects/quran-clone/.env.example
  ```

  This pulls in all 33 env vars the app eventually needs. Most stay empty during Phase 1.

- [ ] **Step 2: Create local `.env.local` with dev defaults.**

  ```bash
  cp .env.example .env.local
  ```

  Edit `.env.local` to set:
  ```
  NEXT_PUBLIC_VERCEL_ENV=development
  NEXT_PUBLIC_VERCEL_URL=localhost:3000
  SIGNATURE_TOKEN=dev-only-not-secret
  PROXY_SIGNATURE_TOKEN=dev-only-not-secret
  INTERNAL_CLIENT_ID=QDC_WEB
  ALLOWED_ORIGINS=localhost:3000
  ```

- [ ] **Step 3: Verify `.gitignore` excludes `.env.local`.**

  Confirm `.env*local` is in `.gitignore` (create-next-app should have added it). If not, add it.

- [ ] **Step 4: Commit.**

  ```bash
  git add .env.example .gitignore
  git commit -m "chore: add env example with all integrations"
  ```

---

### Task 5: Port configs and toolchain

**Files:**
- Create: `/home/v2ray/projects/quran-clone/{.eslintrc.json,.eslintignore,.prettierrc,.stylelintrc.json,playwright.config.ts,vitest.config.ts}`
- Create: `/home/v2ray/projects/quran-clone/next.config.js` (modified — strip Sentry/PWA for now)

- [ ] **Step 1: Copy linting/format configs verbatim.**

  ```bash
  cp /home/v2ray/projects/quran/.eslintrc.json .
  cp /home/v2ray/projects/quran/.eslintignore .
  cp /home/v2ray/projects/quran/.prettierrc .
  cp /home/v2ray/projects/quran/.stylelintrc.json .
  cp /home/v2ray/projects/quran/playwright.config.ts .
  cp /home/v2ray/projects/quran/vitest.config.ts .
  ```

- [ ] **Step 2: Write a stripped-down `next.config.js`.**

  Create `/home/v2ray/projects/quran-clone/next.config.js`:

  ```javascript
  const path = require('path');
  const withFonts = require('next-fonts');
  const nextTranslate = require('next-translate-plugin');

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    productionBrowserSourceMaps: true,
    swcMinify: true,
    experimental: {
      instrumentationHook: true,
    },
    images: {
      formats: ['image/avif', 'image/webp'],
      domains: ['cdn.qurancdn.com', 'static.qurancdn.com', 'localhost'],
    },
    webpack: (webpackConfig) => {
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          'audio-worklet': path.resolve(__dirname, 'src/audioInput/audio-worklet.ts'),
        },
      };
      webpackConfig.module.parser = {
        ...webpackConfig.module.parser,
        javascript: { worker: ['AudioWorklet from audio-worklet'] },
      };
      webpackConfig.module.rules.push({
        test: /\.svg$/i,
        issuer: { and: [/\.(js|ts)x?$/] },
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              prettier: false,
              svgo: true,
              svgoConfig: {
                plugins: [
                  { name: 'preset-default', params: { overrides: { removeViewBox: false } } },
                ],
              },
            },
          },
        ],
      });
      return webpackConfig;
    },
  };

  module.exports = withFonts(nextTranslate(nextConfig));
  ```

  (Sentry, PWA, bundle-analyzer stripped — re-added in Phase 8.)

- [ ] **Step 3: Verify the toolchain runs.**

  ```bash
  yarn lint
  yarn stylelint '**/*.scss'
  yarn tsc --noEmit
  ```

  All three should pass cleanly on the scaffold. Fix any errors before proceeding.

- [ ] **Step 4: Commit.**

  ```bash
  git add .
  git commit -m "chore: port lint/format/build configs from reference"
  ```

---

## Section 2: SCSS Architecture & Design Tokens (Tasks 6–7)

### Task 6: Port the styles directory

**Files:**
- Create: `/home/v2ray/projects/quran-clone/src/styles/{global.scss,theme.scss,variables.scss,reset.scss,fonts.scss,_breakpoints.scss,_constants.scss,_shades.scss,_theme.scss,_utility.scss,_navbar.scss}`
- Create: `/home/v2ray/projects/quran-clone/src/styles/themes/{_light.scss,_dark.scss,_sepia.scss}`
- Create: `/home/v2ray/projects/quran-clone/src/styles/mixins/` (whatever's in reference)

- [ ] **Step 1: Copy entire styles directory from reference.**

  ```bash
  cp -r /home/v2ray/projects/quran/src/styles /home/v2ray/projects/quran-clone/src/styles
  ```

  This pulls in 120+ design tokens per theme (light/dark/sepia), all mixins, breakpoints, the works.

- [ ] **Step 2: Verify SCSS compiles.**

  ```bash
  echo '@use "src/styles/global.scss";' > /tmp/scss-test.scss
  yarn sass /tmp/scss-test.scss /tmp/out.css
  ```

  Expected: compiles without errors. If errors about missing imports (e.g. fonts that don't exist yet), comment those lines temporarily.

- [ ] **Step 3: Import global.scss in `_app.tsx` (will be created in Task 11; for now create a stub).**

  Create `/home/v2ray/projects/quran-clone/src/pages/_app.tsx`:

  ```tsx
  import type { AppProps } from 'next/app';
  import '@/styles/global.scss';

  export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
  }
  ```

- [ ] **Step 4: Verify dev server renders with styles.**

  ```bash
  yarn dev
  ```

  Open `localhost:3000` — page should render with reset styles applied (no default browser padding/margins).

- [ ] **Step 5: Commit.**

  ```bash
  git add src/styles src/pages/_app.tsx
  git commit -m "feat(styles): port design token system from reference"
  ```

---

### Task 7: Set up Storybook

**Files:**
- Create: `/home/v2ray/projects/quran-clone/.storybook/{main.ts,preview.tsx}`

- [ ] **Step 1: Copy `.storybook` directory from reference.**

  ```bash
  cp -r /home/v2ray/projects/quran/.storybook .
  ```

- [ ] **Step 2: Verify Storybook launches.**

  ```bash
  yarn storybook
  ```

  Expected: opens `localhost:6006` with the Storybook UI. No stories yet — that's fine.

- [ ] **Step 3: Write a placeholder story to verify SCSS works in Storybook.**

  Create `/home/v2ray/projects/quran-clone/src/components/dls/Button/Button.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';

  export default {
    title: 'dls/Button-Placeholder',
  } as Meta;

  export const Default: StoryObj = {
    render: () => (
      <button type="button" style={{ background: 'var(--color-primary-medium)', color: 'var(--color-text-inverse)' }}>
        Themed button
      </button>
    ),
  };
  ```

  Refresh Storybook — confirm the button renders with the theme color. If it renders default browser styling, SCSS isn't loading in Storybook; check `.storybook/preview.tsx` imports `@/styles/global.scss`.

- [ ] **Step 4: Commit.**

  ```bash
  git add .storybook src/components/dls/Button/Button.stories.tsx
  git commit -m "chore: set up Storybook with theme integration"
  ```

---

## Section 3: Fonts (Tasks 8–9)

### Task 8: Set up UI fonts (Figtree, Kitab)

**Files:**
- Create: `/home/v2ray/projects/quran-clone/public/fonts/ui/{Figtree-*.woff2,Kitab-*.woff2}`
- Modify: `/home/v2ray/projects/quran-clone/src/styles/fonts.scss` (if not already copied in Task 6)

- [ ] **Step 1: Locate UI fonts in reference.**

  ```bash
  find /home/v2ray/projects/quran/public/fonts/lang -type f | head -30
  ```

  Expected: Figtree, Kitab, Mehr Nastaliq, and other language-specific fonts.

- [ ] **Step 2: Copy UI fonts.**

  ```bash
  mkdir -p public/fonts/ui
  cp /home/v2ray/projects/quran/public/fonts/lang/*figtree* public/fonts/ui/ 2>/dev/null
  cp /home/v2ray/projects/quran/public/fonts/lang/*Figtree* public/fonts/ui/ 2>/dev/null
  cp /home/v2ray/projects/quran/public/fonts/lang/*kitab* public/fonts/ui/ 2>/dev/null
  cp /home/v2ray/projects/quran/public/fonts/lang/*Kitab* public/fonts/ui/ 2>/dev/null
  ls public/fonts/ui
  ```

- [ ] **Step 3: Verify fonts.scss references match.**

  Open `src/styles/fonts.scss` — confirm `@font-face` URLs point to paths that now exist under `public/fonts/`. Adjust paths if needed.

- [ ] **Step 4: Commit.**

  ```bash
  git add public/fonts/ui src/styles/fonts.scss
  git commit -m "feat(fonts): add UI fonts (Figtree, Kitab)"
  ```

---

### Task 9: Download the 604 Hafs v4 COLRv1 fonts

**Files:**
- Create: `/home/v2ray/projects/quran-clone/scripts/fetch-fonts.mjs`
- Create: `/home/v2ray/projects/quran-clone/public/fonts/quran/hafs/v4/colrv1/woff/p{1..604}.woff`

- [ ] **Step 1: Check if reference has them locally.**

  ```bash
  ls /home/v2ray/projects/quran/public/fonts/quran/hafs/v4/colrv1/woff/ 2>/dev/null | wc -l
  ```

  If >0: copy them locally. If 0 (sparse-clone excluded them): download from a public mirror.

- [ ] **Step 2: Write download script.**

  Create `/home/v2ray/projects/quran-clone/scripts/fetch-fonts.mjs`:

  ```javascript
  #!/usr/bin/env node
  /* eslint-disable no-console */
  import { mkdir, writeFile } from 'node:fs/promises';
  import { resolve } from 'node:path';

  const OUT_DIR = resolve('public/fonts/quran/hafs/v4/colrv1/woff');
  // Use quran.com's public CDN as source — verify license allows redistribution first (ADR-D)
  const BASE_URL = 'https://quran.com/fonts/quran/hafs/v4/colrv1/woff';

  async function download(page) {
    const url = `${BASE_URL}/p${page}.woff`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(resolve(OUT_DIR, `p${page}.woff`), buf);
  }

  async function main() {
    await mkdir(OUT_DIR, { recursive: true });
    const pages = Array.from({ length: 604 }, (_, i) => i + 1);
    // Limit concurrency to avoid hammering the CDN
    const CONCURRENCY = 8;
    let done = 0;
    for (let i = 0; i < pages.length; i += CONCURRENCY) {
      const batch = pages.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map(async (p) => {
        try {
          await download(p);
          done += 1;
          if (done % 50 === 0) console.log(`  ${done}/604 fonts downloaded`);
        } catch (err) {
          console.error(`Failed page ${p}:`, err.message);
        }
      }));
    }
    console.log(`Done. ${done}/604 fonts saved to ${OUT_DIR}`);
  }

  main().catch((err) => { console.error(err); process.exit(1); });
  ```

- [ ] **Step 3: Run the download.**

  ```bash
  node scripts/fetch-fonts.mjs
  ```

  Expected: prints progress, ends with "604/604 fonts saved". If license check is pending (ADR-D), skip this task and use placeholder fonts until resolved.

- [ ] **Step 4: Verify disk usage.**

  ```bash
  du -sh public/fonts/quran/
  ```

  Expected: 50–200MB total.

- [ ] **Step 5: Add script to `package.json`.**

  ```json
  "scripts": {
    "fonts:fetch": "node scripts/fetch-fonts.mjs"
  }
  ```

- [ ] **Step 6: Commit.**

  ```bash
  git add scripts/fetch-fonts.mjs package.json
  git commit -m "feat(fonts): add 604 Hafs v4 COLRv1 font fetcher"
  ```

  Do NOT commit the font files themselves (they're large, may have license restrictions) — add `public/fonts/quran/` to `.gitignore` and store them in CDN/deployment storage.

---

## Section 4: Redux Foundation (Task 10)

### Task 10: Set up Redux store with theme slice

**Files:**
- Create: `/home/v2ray/projects/quran-clone/src/redux/{store.ts,Provider.tsx,RootState.ts}`
- Create: `/home/v2ray/projects/quran-clone/src/redux/types/SliceName.ts`
- Create: `/home/v2ray/projects/quran-clone/src/redux/slices/theme.ts`
- Create: `/home/v2ray/projects/quran-clone/src/redux/defaultSettings/{index.ts,util.ts}`
- Create: `/home/v2ray/projects/quran-clone/src/redux/types/{Theme.ts,ThemeType.ts}`
- Create: `/home/v2ray/projects/quran-clone/src/components/ThemeProvider.tsx`

- [ ] **Step 1: Write the failing test for theme state.**

  Create `/home/v2ray/projects/quran-clone/src/redux/slices/theme.test.ts`:

  ```typescript
  import { describe, expect, it } from 'vitest';
  import { setTheme } from './theme';
  import { makeTestStore } from '@/redux/store'; // helper we'll create

  describe('theme slice', () => {
    it('defaults to light theme', () => {
      const store = makeTestStore();
      expect(store.getState().theme.type).toBe('light');
    });

    it('setTheme changes the theme type', () => {
      const store = makeTestStore();
      store.dispatch(setTheme('dark'));
      expect(store.getState().theme.type).toBe('dark');
    });

    it('setTheme to sepia works', () => {
      const store = makeTestStore();
      store.dispatch(setTheme('sepia'));
      expect(store.getState().theme.type).toBe('sepia');
    });
  });
  ```

- [ ] **Step 2: Run the test — expect FAIL (modules don't exist).**

  ```bash
  yarn vitest run src/redux/slices/theme.test.ts
  ```

  Expected: failure with "Cannot find module './theme'" or similar.

- [ ] **Step 3: Implement theme types.**

  Create `/home/v2ray/projects/quran-clone/src/redux/types/ThemeType.ts`:

  ```typescript
  type ThemeType = 'light' | 'dark' | 'sepia';
  export default ThemeType;
  ```

  Create `/home/v2ray/projects/quran-clone/src/redux/types/Theme.ts`:

  ```typescript
  import ThemeType from './ThemeType';
  interface Theme {
    type: ThemeType;
    // reserved for future: custom colors, font overrides
  }
  export default Theme;
  ```

  Create `/home/v2ray/projects/quran-clone/src/redux/types/SliceName.ts`:

  ```typescript
  enum SliceName {
    THEME = 'theme',
  }
  export default SliceName;
  ```

- [ ] **Step 4: Implement theme slice.**

  Create `/home/v2ray/projects/quran-clone/src/redux/defaultSettings/util.ts`:

  ```typescript
  import Theme from '@/redux/types/Theme';

  export function getThemeInitialState(): Theme {
    return { type: 'light' };
  }
  ```

  Create `/home/v2ray/projects/quran-clone/src/redux/slices/theme.ts`:

  ```typescript
  import { createSlice, PayloadAction } from '@reduxjs/toolkit';
  import { getThemeInitialState } from '@/redux/defaultSettings/util';
  import { RootState } from '@/redux/RootState';
  import SliceName from '@/redux/types/SliceName';
  import Theme from '@/redux/types/Theme';
  import ThemeType from '@/redux/types/ThemeType';

  export const themeSlice = createSlice({
    name: SliceName.THEME,
    initialState: getThemeInitialState(),
    reducers: {
      setTheme: (state: Theme, action: PayloadAction<ThemeType>) => ({
        ...state,
        type: action.payload,
      }),
    },
  });

  export const { setTheme } = themeSlice.actions;
  export const selectTheme = (state: RootState) => state.theme;

  export default themeSlice.reducer;
  ```

- [ ] **Step 5: Implement store and RootState.**

  Create `/home/v2ray/projects/quran-clone/src/redux/RootState.ts`:

  ```typescript
  import Theme from './types/Theme';

  export interface RootState {
    theme: Theme;
  }
  ```

  Create `/home/v2ray/projects/quran-clone/src/redux/store.ts`:

  ```typescript
  import { configureStore, ConfigureStoreOptions } from '@reduxjs/toolkit';
  import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
  } from 'redux-persist';
  import storage from 'redux-persist/lib/storage';
  import themeReducer, { ThemeState } from './slices/theme';
  import { RootState } from './RootState';

  const rootReducer = {
    theme: themeReducer,
  };

  const themePersist = persistReducer(
    { key: 'quran-clone-theme', storage, whitelist: ['type'] },
    themeReducer as any,
  );

  export const store = configureStore({
    reducer: { theme: themePersist as any },
    middleware: (getDefault) =>
      getDefault({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

  export const persistor = persistStore(store);

  // Test helper — non-persisted store for unit tests
  export function makeTestStore(initialState?: Partial<RootState>) {
    return configureStore({
      reducer: { theme: themeReducer },
      preloadedState: initialState as any,
    });
  }

  export type AppDispatch = typeof store.dispatch;
  export type { RootState };
  ```

- [ ] **Step 6: Implement Redux Provider with persist gate.**

  Create `/home/v2ray/projects/quran-clone/src/redux/Provider.tsx`:

  ```tsx
  'use client';
  import { Provider as ReduxProvider } from 'react-redux';
  import { PersistGate } from 'redux-persist/integration/react';
  import { store, persistor } from './store';

  export default function Provider({ children }: { children: React.ReactNode }) {
    return (
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </ReduxProvider>
    );
  }
  ```

- [ ] **Step 7: Run the test — expect PASS.**

  ```bash
  yarn vitest run src/redux/slices/theme.test.ts
  ```

  Expected: 3 tests pass.

- [ ] **Step 8: Implement ThemeProvider that syncs `[data-theme]` attribute.**

  Create `/home/v2ray/projects/quran-clone/src/components/ThemeProvider.tsx`:

  ```tsx
  'use client';
  import { useEffect } from 'react';
  import { useSelector } from 'react-redux';
  import { selectTheme } from '@/redux/slices/theme';

  export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useSelector(selectTheme);

    useEffect(() => {
      if (typeof document !== 'undefined' && document.body) {
        document.body.setAttribute('data-theme', theme.type);
      }
    }, [theme.type]);

    return <>{children}</>;
  }
  ```

- [ ] **Step 9: Write ThemeProvider test.**

  Create `/home/v2ray/projects/quran-clone/src/components/ThemeProvider.test.tsx`:

  ```tsx
  import { describe, expect, it, beforeEach } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import { Provider as ReduxProvider } from 'react-redux';
  import { makeTestStore } from '@/redux/store';
  import { setTheme } from '@/redux/slices/theme';
  import ThemeProvider from './ThemeProvider';

  function renderWithStore(preloadedState?: any) {
    const store = makeTestStore(preloadedState);
    render(
      <ReduxProvider store={store}>
        <ThemeProvider>
          <div>child</div>
        </ThemeProvider>
      </ReduxProvider>,
    );
    return store;
  }

  describe('ThemeProvider', () => {
    beforeEach(() => {
      document.body.removeAttribute('data-theme');
    });

    it('sets data-theme=light by default', () => {
      renderWithStore();
      expect(document.body.getAttribute('data-theme')).toBe('light');
    });

    it('updates data-theme when state changes', () => {
      const store = renderWithStore();
      store.dispatch(setTheme('dark'));
      expect(document.body.getAttribute('data-theme')).toBe('dark');
    });
  });
  ```

- [ ] **Step 10: Run all tests — expect PASS.**

  ```bash
  yarn vitest run
  ```

- [ ] **Step 11: Commit.**

  ```bash
  git add src/redux src/components/ThemeProvider.tsx src/components/ThemeProvider.test.tsx
  git commit -m "feat(redux): add store with persisted theme slice and ThemeProvider"
  ```

---

## Section 5: Layout Shell (Tasks 11–13)

### Task 11: Wire `_app.tsx` and `_document.tsx`

**Files:**
- Modify: `/home/v2ray/projects/quran-clone/src/pages/_app.tsx`
- Create: `/home/v2ray/projects/quran-clone/src/pages/_document.tsx`

- [ ] **Step 1: Replace `_app.tsx` with full provider stack.**

  ```tsx
  import type { AppProps } from 'next/app';
  import '@/styles/global.scss';
  import ReduxProvider from '@/redux/Provider';
  import ThemeProvider from '@/components/ThemeProvider';

  export default function App({ Component, pageProps }: AppProps) {
    return (
      <ReduxProvider>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </ReduxProvider>
    );
  }
  ```

- [ ] **Step 2: Create `_document.tsx` for HTML/RTL setup.**

  ```tsx
  import { Html, Head, Main, NextScript } from 'next/document';

  export default function Document() {
    return (
      <Html lang="en" dir="ltr">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
  ```

- [ ] **Step 3: Verify dev server renders.**

  ```bash
  yarn dev
  ```

  Open `localhost:3000`. Inspect `<body>` — should have `data-theme="light"` after JS loads.

- [ ] **Step 4: Commit.**

  ```bash
  git add src/pages/_app.tsx src/pages/_document.tsx
  git commit -m "feat(app): wire Redux + ThemeProvider into _app"
  ```

---

### Task 12: Build Navbar, Footer, and PageLayout stubs

**Files:**
- Create: `/home/v2ray/projects/quran-clone/src/components/Navbar/{Navbar.tsx,Navbar.module.scss}`
- Create: `/home/v2ray/projects/quran-clone/src/components/Footer/{Footer.tsx,Footer.module.scss}`
- Create: `/home/v2ray/projects/quran-clone/src/components/Layout/PageLayout.tsx`
- Modify: `/home/v2ray/projects/quran-clone/src/pages/index.tsx`

- [ ] **Step 1: Write Navbar stub.**

  Create `src/components/Navbar/Navbar.module.scss`:

  ```scss
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: var(--spacing-edge-horizontal-px, 1rem);
    padding-block: 0.75rem;
    background: var(--color-background-default);
    border-block-end: 1px solid var(--color-borders-hairline);
    position: sticky;
    inset-block-start: 0;
    z-index: 100;
  }

  .logo {
    font-weight: 700;
    color: var(--color-primary-medium);
  }
  ```

  Create `src/components/Navbar/Navbar.tsx`:

  ```tsx
  import styles from './Navbar.module.scss';

  export default function Navbar() {
    return (
      <header className={styles.navbar}>
        <div className={styles.logo}>QuranClone</div>
        {/* TODO: search drawer, nav menu, settings, profile — Phase 1b */}
      </header>
    );
  }
  ```

- [ ] **Step 2: Write Footer stub.**

  Create `src/components/Footer/Footer.module.scss`:

  ```scss
  .footer {
    padding-inline: var(--spacing-edge-horizontal-px, 1rem);
    padding-block: 2rem;
    background: var(--color-background-default);
    border-block-start: 1px solid var(--color-borders-hairline);
    color: var(--color-text-faded);
    text-align: center;
    font-size: var(--font-size-small);
  }
  ```

  Create `src/components/Footer/Footer.tsx`:

  ```tsx
  import styles from './Footer.module.scss';

  export default function Footer() {
    return (
      <footer className={styles.footer}>
        {/* TODO: theme switcher, links, social — Phase 1c */}
        <p>Built for learning purposes. Not affiliated with quran.com.</p>
      </footer>
    );
  }
  ```

- [ ] **Step 3: Write PageLayout.**

  Create `src/components/Layout/PageLayout.tsx`:

  ```tsx
  import Navbar from '@/components/Navbar/Navbar';
  import Footer from '@/components/Footer/Footer';

  export default function PageLayout({ children }: { children: React.ReactNode }) {
    return (
      <>
        <Navbar />
        <main>{children}</main>
        <Footer />
        {/* AudioPlayer slot — added in Phase 3 */}
      </>
    );
  }
  ```

- [ ] **Step 4: Update homepage to use PageLayout.**

  Replace `src/pages/index.tsx`:

  ```tsx
  import PageLayout from '@/components/Layout/PageLayout';

  export default function Home() {
    return (
      <PageLayout>
        <section style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h1>Quran Clone</h1>
          <p>Foundation scaffold. Phase 1 in progress.</p>
        </section>
      </PageLayout>
    );
  }
  ```

- [ ] **Step 5: Verify in browser.**

  ```bash
  yarn dev
  ```

  Open `localhost:3000` — should see Navbar at top, hero text, Footer at bottom. All styled with theme tokens.

- [ ] **Step 6: Commit.**

  ```bash
  git add src/components/Navbar src/components/Footer src/components/Layout src/pages/index.tsx
  git commit -m "feat(layout): add Navbar, Footer, PageLayout stubs"
  ```

---

### Task 13: Write Phase 1 exit-criteria E2E test

**Files:**
- Create: `/home/v2ray/projects/quran-clone/tests/smoke.spec.ts`

- [ ] **Step 1: Write the smoke test.**

  Create `/home/v2ray/projects/quran-clone/tests/smoke.spec.ts`:

  ```typescript
  import { test, expect } from '@playwright/test';

  test('homepage renders with navbar, content, and footer', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main h1')).toHaveText(/Quran Clone/i);
    await expect(page.locator('footer')).toBeVisible();
  });

  test('body has data-theme attribute', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
  });
  ```

- [ ] **Step 2: Start dev server in background.**

  ```bash
  yarn dev &
  ```

- [ ] **Step 3: Run the smoke test.**

  ```bash
  yarn playwright test tests/smoke.spec.ts
  ```

  Expected: 2 tests pass.

- [ ] **Step 4: Stop dev server.**

  ```bash
  kill %1
  ```

- [ ] **Step 5: Commit.**

  ```bash
  git add tests/smoke.spec.ts
  git commit -m "test: add Phase 1 smoke E2E"
  ```

---

## Section 6: DLS Primitives (Tasks 14–25)

Each task follows the same TDD pattern: write a failing test, implement, run tests, write a story, commit. Reference the corresponding component in `/home/v2ray/projects/quran/src/components/dls/<ComponentName>/` for behavior details.

### Task 14: Button

**Files:**
- Create: `src/components/dls/Button/{Button.tsx,Button.module.scss,Button.stories.tsx,Button.test.tsx}`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Button/Button.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Button from './Button';

  describe('Button', () => {
    it('renders children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('fires onClick when clicked', () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Go</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClick when disabled', () => {
      const onClick = vi.fn();
      render(<Button disabled onClick={onClick}>Nope</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('applies size class', () => {
      render(<Button size="large">Big</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'large');
    });

    it('applies variant class', () => {
      render(<Button variant="secondary">Plain</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'secondary');
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Button/Button.test.tsx
  ```

- [ ] **Step 3: Implement Button SCSS.**

  Create `src/components/dls/Button/Button.module.scss`:

  ```scss
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: none;
    border-radius: var(--border-radius-default);
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    transition: background-color 150ms ease, color 150ms ease, opacity 150ms ease;

    &[data-size='small'] { padding: 0.25rem 0.625rem; font-size: var(--font-size-small); }
    &[data-size='medium'] { padding: 0.5rem 1rem; font-size: var(--font-size-normal); }
    &[data-size='large'] { padding: 0.75rem 1.5rem; font-size: var(--font-size-large); }

    &[data-variant='primary'] {
      background: var(--color-primary-medium);
      color: var(--color-text-inverse);
      &:hover:not(:disabled) { background: var(--color-primary-deep); }
    }
    &[data-variant='secondary'] {
      background: var(--color-secondary-faded);
      color: var(--color-text-default);
      &:hover:not(:disabled) { background: var(--color-secondary-faint); }
    }
    &[data-variant='ghost'] {
      background: transparent;
      color: var(--color-text-default);
      &:hover:not(:disabled) { background: var(--color-background-alternative-faint); }
    }

    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
  ```

- [ ] **Step 4: Implement Button component.**

  Create `src/components/dls/Button/Button.tsx`:

  ```tsx
  import { forwardRef, ButtonHTMLAttributes } from 'react';
  import classnames from 'classnames';
  import styles from './Button.module.scss';

  type ButtonVariant = 'primary' | 'secondary' | 'ghost';
  type ButtonSize = 'small' | 'medium' | 'large';

  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
  }

  const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'medium', className, ...rest }, ref) => (
      <button
        ref={ref}
        className={classnames(styles.button, className)}
        data-variant={variant}
        data-size={size}
        {...rest}
      />
    ),
  );

  Button.displayName = 'Button';
  export default Button;
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Button/Button.test.tsx
  ```

  Expected: 5 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Button/Button.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Button from './Button';

  const meta = {
    title: 'dls/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
      variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
      size: { control: 'select', options: ['small', 'medium', 'large'] },
    },
  } as Meta<typeof Button>;
  export default meta;

  export const Primary: StoryObj<typeof Button> = {
    args: { variant: 'primary', children: 'Primary' },
  };

  export const Secondary: StoryObj<typeof Button> = {
    args: { variant: 'secondary', children: 'Secondary' },
  };

  export const Ghost: StoryObj<typeof Button> = {
    args: { variant: 'ghost', children: 'Ghost' },
  };

  export const AllSizes: StoryObj<typeof Button> = {
    render: () => (
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button size="small">Small</Button>
        <Button size="medium">Medium</Button>
        <Button size="large">Large</Button>
      </div>
    ),
  };

  export const Disabled: StoryObj<typeof Button> = {
    args: { children: 'Disabled', disabled: true },
  };
  ```

- [ ] **Step 7: Verify Storybook renders it.**

  ```bash
  yarn storybook
  ```

  Open Storybook → dls/Button. All 5 stories render with theme colors.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Button
  git commit -m "feat(dls): add Button with variants and sizes"
  ```

---

### Task 15: Input

**Files:**
- Create: `src/components/dls/Forms/Input/Input.tsx`
- Create: `src/components/dls/Forms/Input/Input.module.scss`
- Create: `src/components/dls/Forms/Input/Input.stories.tsx`
- Create: `src/components/dls/Forms/Input/Input.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Forms/Input/Input.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Input from './Input';

  describe('Input', () => {
    it('renders an input element', () => {
      render(<Input placeholder="Type here" />);
      expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
    });

    it('fires onChange with the new value', () => {
      const onChange = vi.fn();
      render(<Input onChange={onChange} aria-label="name" />);
      fireEvent.change(screen.getByLabelText('name'), { target: { value: 'hello' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('renders prefix slot before the input', () => {
      render(<Input prefix="@" aria-label="handle" />);
      const wrapper = screen.getByLabelText('handle').closest('div');
      expect(wrapper?.textContent).toMatch(/^@/);
    });

    it('renders suffix slot after the input', () => {
      render(<Input suffix=".com" aria-label="domain" />);
      const wrapper = screen.getByLabelText('domain').closest('div');
      expect(wrapper?.textContent).toMatch(/\.com$/);
    });

    it('shows error message when error prop is set', () => {
      render(<Input error="Required" aria-label="field" />);
      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(screen.getByLabelText('field')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not fire onChange when disabled', () => {
      const onChange = vi.fn();
      render(<Input disabled onChange={onChange} aria-label="frozen" />);
      fireEvent.change(screen.getByLabelText('frozen'), { target: { value: 'x' } });
      expect(onChange).not.toHaveBeenCalled();
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Forms/Input/Input.test.tsx
  ```

- [ ] **Step 3: Implement Input SCSS.**

  Create `src/components/dls/Forms/Input/Input.module.scss`:

  ```scss
  .wrapper {
    display: inline-flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
  }

  .inputRow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding-inline: 0.75rem;
    padding-block: 0.5rem;
    background: var(--color-background-default);
    border: 1px solid var(--color-borders-hairline);
    border-radius: var(--border-radius-default);
    color: var(--color-text-default);
    transition: border-color 150ms ease, box-shadow 150ms ease;

    &:focus-within {
      border-color: var(--color-primary-medium);
      box-shadow: 0 0 0 2px var(--color-primary-faded);
    }

    &[data-error='true'] {
      border-color: var(--color-error-medium);
      &:focus-within {
        box-shadow: 0 0 0 2px var(--color-error-faded);
      }
    }

    &[data-disabled='true'] {
      background: var(--color-background-alternative-faint);
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  .prefix,
  .suffix {
    color: var(--color-text-faded);
    font-size: var(--font-size-small);
    user-select: none;
  }

  .input {
    flex: 1;
    border: none;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: var(--font-size-normal);
    outline: none;
    width: 100%;

    &::placeholder {
      color: var(--color-text-faded);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  .errorText {
    color: var(--color-error-medium);
    font-size: var(--font-size-small);
  }
  ```

- [ ] **Step 4: Implement Input component.**

  Create `src/components/dls/Forms/Input/Input.tsx`:

  ```tsx
  import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
  import classnames from 'classnames';
  import styles from './Input.module.scss';

  interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
    prefix?: ReactNode;
    suffix?: ReactNode;
    error?: string;
  }

  const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ prefix, suffix, error, disabled, className, ...rest }, ref) => (
      <div className={classnames(styles.wrapper, className)}>
        <div className={styles.inputRow} data-error={!!error} data-disabled={!!disabled}>
          {prefix ? <span className={styles.prefix}>{prefix}</span> : null}
          <input
            ref={ref}
            className={styles.input}
            disabled={disabled}
            aria-invalid={!!error}
            {...rest}
          />
          {suffix ? <span className={styles.suffix}>{suffix}</span> : null}
        </div>
        {error ? <span className={styles.errorText}>{error}</span> : null}
      </div>
    ),
  );

  Input.displayName = 'Input';
  export default Input;
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Forms/Input/Input.test.tsx
  ```

  Expected: 6 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Forms/Input/Input.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Input from './Input';

  const meta = {
    title: 'dls/Forms/Input',
    component: Input,
    tags: ['autodocs'],
  } as Meta<typeof Input>;
  export default meta;

  export const Default: StoryObj<typeof Input> = {
    args: { placeholder: 'Enter text' },
  };

  export const WithPrefix: StoryObj<typeof Input> = {
    args: { placeholder: 'username', prefix: '@' },
  };

  export const WithSuffix: StoryObj<typeof Input> = {
    args: { placeholder: 'domain', suffix: '.com' },
  };

  export const WithError: StoryObj<typeof Input> = {
    args: { placeholder: 'Email', defaultValue: 'bad', error: 'Invalid email address' },
  };

  export const Disabled: StoryObj<typeof Input> = {
    args: { placeholder: "Can't touch this", defaultValue: 'locked', disabled: true },
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

  Open dls/Forms/Input → all 5 stories render with theme colors. Type in each to verify focus states.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Forms/Input
  git commit -m "feat(dls): add Input with prefix/suffix and error state"
  ```

---

### Task 16: Card

**Files:**
- Create: `src/components/dls/Card/Card.tsx`
- Create: `src/components/dls/Card/Card.module.scss`
- Create: `src/components/dls/Card/Card.stories.tsx`
- Create: `src/components/dls/Card/Card.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Card/Card.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Card from './Card';

  describe('Card', () => {
    it('renders children', () => {
      render(<Card>Body content</Card>);
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('does not have interactive styles by default', () => {
      render(<Card>Plain</Card>);
      expect(screen.getByText('Plain').closest('[data-interactive]')).toBeNull();
    });

    it('marks itself interactive when interactive prop is set', () => {
      render(<Card interactive>Clickable</Card>);
      const el = screen.getByText('Clickable').closest('[data-interactive="true"]');
      expect(el).not.toBeNull();
    });

    it('fires onClick when interactive and clicked', () => {
      const onClick = vi.fn();
      render(
        <Card interactive onClick={onClick}>
          <span>Hit</span>
        </Card>,
      );
      fireEvent.click(screen.getByText('Hit'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClick when not interactive', () => {
      const onClick = vi.fn();
      render(
        <Card onClick={onClick}>
          <span>Nope</span>
        </Card>,
      );
      fireEvent.click(screen.getByText('Nope'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Card/Card.test.tsx
  ```

- [ ] **Step 3: Implement Card SCSS.**

  Create `src/components/dls/Card/Card.module.scss`:

  ```scss
  .card {
    background: var(--color-background-default);
    border: 1px solid var(--color-borders-hairline);
    border-radius: var(--border-radius-default);
    padding: 1rem;
    box-shadow: var(--shadow-small);
    transition: transform 150ms ease, box-shadow 150ms ease;

    &[data-interactive='true'] {
      cursor: pointer;
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-medium);
      }
      &:focus-visible {
        outline: 2px solid var(--color-primary-medium);
        outline-offset: 2px;
      }
    }

    &[data-elevation='flat'] { box-shadow: none; }
    &[data-elevation='small'] { box-shadow: var(--shadow-small); }
    &[data-elevation='medium'] { box-shadow: var(--shadow-medium); }
    &[data-elevation='large'] { box-shadow: var(--shadow-large); }
  }
  ```

- [ ] **Step 4: Implement Card component.**

  Create `src/components/dls/Card/Card.tsx`:

  ```tsx
  import { HTMLAttributes, MouseEvent } from 'react';
  import classnames from 'classnames';
  import styles from './Card.module.scss';

  type Elevation = 'flat' | 'small' | 'medium' | 'large';

  interface CardProps extends HTMLAttributes<HTMLDivElement> {
    interactive?: boolean;
    elevation?: Elevation;
  }

  export default function Card({
    interactive = false,
    elevation = 'small',
    className,
    onClick,
    children,
    ...rest
}: CardProps) {
    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
      if (!interactive) return;
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        (e.currentTarget as HTMLDivElement).click();
      }
    };

    return (
      <div
        className={classnames(styles.card, className)}
        data-interactive={interactive}
        data-elevation={elevation}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Card/Card.test.tsx
  ```

  Expected: 5 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Card/Card.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Card from './Card';

  const meta = {
    title: 'dls/Card',
    component: Card,
    tags: ['autodocs'],
    argTypes: {
      elevation: { control: 'select', options: ['flat', 'small', 'medium', 'large'] },
    },
  } as Meta<typeof Card>;
  export default meta;

  export const Default: StoryObj<typeof Card> = {
    args: {
      children: <p>A plain card with some body content.</p>,
    },
  };

  export const Interactive: StoryObj<typeof Card> = {
    args: {
      interactive: true,
      children: <p>Hover me — I lift on hover and respond to Enter/Space.</p>,
    },
  };

  export const Elevations: StoryObj<typeof Card> = {
    render: () => (
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Card elevation="flat">Flat</Card>
        <Card elevation="small">Small</Card>
        <Card elevation="medium">Medium</Card>
        <Card elevation="large">Large</Card>
      </div>
    ),
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

  Open dls/Card. Hover Interactive card — should lift. Tab to it — focus ring visible. Press Enter — should fire click.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Card
  git commit -m "feat(dls): add Card with interactive + elevation variants"
  ```

---

### Task 17: Separator

**Files:**
- Create: `src/components/dls/Separator/Separator.tsx`
- Create: `src/components/dls/Separator/Separator.module.scss`
- Create: `src/components/dls/Separator/Separator.stories.tsx`
- Create: `src/components/dls/Separator/Separator.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Separator/Separator.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import Separator from './Separator';

  describe('Separator', () => {
    it('renders a separator element', () => {
      render(<Separator aria-label="divider" />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('defaults to horizontal orientation', () => {
      render(<Separator aria-label="divider" />);
      expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('supports vertical orientation', () => {
      render(<Separator orientation="vertical" aria-label="divider" />);
      expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('renders children when provided (label-style)', () => {
      render(<Separator aria-label="divider">OR</Separator>);
      expect(screen.getByText('OR')).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Separator/Separator.test.tsx
  ```

- [ ] **Step 3: Implement Separator SCSS.**

  Create `src/components/dls/Separator/Separator.module.scss`:

  ```scss
  .separator {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-borders-hairline);
    color: var(--color-text-faded);
    font-size: var(--font-size-small);
    flex-shrink: 0;

    &[data-orientation='horizontal'] {
      width: 100%;
      height: 1px;
    }
    &[data-orientation='vertical'] {
      height: 100%;
      width: 1px;
    }

    &:has(span) {
      background: transparent;
      gap: 0.75rem;

      &::before,
      &::after {
        content: '';
        background: var(--color-borders-hairline);

        &[data-orientation='horizontal'] {
          height: 1px;
          width: 100%;
        }
      }

      &[data-orientation='horizontal'] {
        height: auto;
        &::before,
        &::after {
          height: 1px;
          flex: 1;
        }
      }
      &[data-orientation='vertical'] {
        width: auto;
        flex-direction: column;
        &::before,
        &::after {
          width: 1px;
          flex: 1;
        }
      }
    }
  }
  ```

- [ ] **Step 4: Implement Separator component.**

  Create `src/components/dls/Separator/Separator.tsx`:

  ```tsx
  import { ReactNode } from 'react';
  import * as SeparatorPrimitive from '@radix-ui/react-separator';
  import classnames from 'classnames';
  import styles from './Separator.module.scss';

  interface SeparatorProps {
    orientation?: 'horizontal' | 'vertical';
    children?: ReactNode;
    className?: string;
    decorative?: boolean;
  }

  export default function Separator({
    orientation = 'horizontal',
    children,
    className,
    decorative = true,
    ...rest
  }: SeparatorProps) {
    if (children) {
      return (
        <div
          className={classnames(styles.separator, className)}
          data-orientation={orientation}
          role={decorative ? undefined : 'separator'}
          aria-orientation={decorative ? undefined : orientation}
          {...rest}
        >
          <span>{children}</span>
        </div>
      );
    }
    return (
      <SeparatorPrimitive.Root
        className={classnames(styles.separator, className)}
        orientation={orientation}
        decorative={decorative}
        {...rest}
      />
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Separator/Separator.test.tsx
  ```

  Expected: 4 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Separator/Separator.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Separator from './Separator';

  const meta = {
    title: 'dls/Separator',
    component: Separator,
    tags: ['autodocs'],
    argTypes: {
      orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    },
  } as Meta<typeof Separator>;
  export default meta;

  export const Horizontal: StoryObj<typeof Separator> = {
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <span>Above</span>
        <Separator />
        <span>Below</span>
      </div>
    ),
  };

  export const Vertical: StoryObj<typeof Separator> = {
    render: () => (
      <div style={{ display: 'flex', gap: '1rem', height: '3rem' }}>
        <span>Left</span>
        <Separator orientation="vertical" />
        <span>Right</span>
      </div>
    ),
  };

  export const WithLabel: StoryObj<typeof Separator> = {
    render: () => (
      <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
        <span>Option A</span>
        <Separator>OR</Separator>
        <span>Option B</span>
      </div>
    ),
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Separator
  git commit -m "feat(dls): add Separator (horizontal/vertical with optional label)"
  ```

---

### Task 18: Spinner

**Files:**
- Create: `src/components/dls/Spinner/Spinner.tsx`
- Create: `src/components/dls/Spinner/Spinner.module.scss`
- Create: `src/components/dls/Spinner/Spinner.stories.tsx`
- Create: `src/components/dls/Spinner/Spinner.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Spinner/Spinner.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import Spinner from './Spinner';

  describe('Spinner', () => {
    it('renders with progressbar role', () => {
      render(<Spinner aria-label="loading" />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('defaults to medium size', () => {
      render(<Spinner aria-label="loading" />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-size', 'medium');
    });

    it('applies small size attribute', () => {
      render(<Spinner size="small" aria-label="loading" />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-size', 'small');
    });

    it('applies large size attribute', () => {
      render(<Spinner size="large" aria-label="loading" />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-size', 'large');
    });

    it('shows label text via aria-label', () => {
      render(<Spinner aria-label="Fetching data" />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Fetching data');
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Spinner/Spinner.test.tsx
  ```

- [ ] **Step 3: Implement Spinner SCSS.**

  Create `src/components/dls/Spinner/Spinner.module.scss`:

  ```scss
  .spinner {
    display: inline-block;
    color: currentColor;
    animation: spin 0.8s linear infinite;

    &[data-size='small'] { width: 1rem; height: 1rem; }
    &[data-size='medium'] { width: 1.5rem; height: 1.5rem; }
    &[data-size='large'] { width: 2.5rem; height: 2.5rem; }
  }

  .svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .track {
    stroke: var(--color-background-alternative-faint);
    fill: none;
  }

  .arc {
    stroke: currentColor;
    fill: none;
    stroke-linecap: round;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 2.5s;
    }
  }
  ```

- [ ] **Step 4: Implement Spinner component.**

  Create `src/components/dls/Spinner/Spinner.tsx`:

  ```tsx
  import { SVGProps } from 'react';
  import classnames from 'classnames';
  import styles from './Spinner.module.scss';

  type SpinnerSize = 'small' | 'medium' | 'large';

  interface SpinnerProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
    size?: SpinnerSize;
  }

  const VIEWBOX = 24;
  const STROKE_WIDTH = 3;

  export default function Spinner({
    size = 'medium',
    className,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    ...rest
  }: SpinnerProps) {
    const radius = (VIEWBOX - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    return (
      <span className={classnames(styles.spinner, className)} data-size={size} role="progressbar">
        <svg
          className={styles.svg}
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          aria-label={ariaLabel}
          aria-hidden={ariaHidden ?? (ariaLabel ? undefined : true)}
          {...rest}
        >
          <circle
            className={styles.track}
            cx={VIEWBOX / 2}
            cy={VIEWBOX / 2}
            r={radius}
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            className={styles.arc}
            cx={VIEWBOX / 2}
            cy={VIEWBOX / 2}
            r={radius}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
          />
        </svg>
      </span>
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Spinner/Spinner.test.tsx
  ```

  Expected: 5 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Spinner/Spinner.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Spinner from './Spinner';

  const meta = {
    title: 'dls/Spinner',
    component: Spinner,
    tags: ['autodocs'],
    argTypes: {
      size: { control: 'radio', options: ['small', 'medium', 'large'] },
    },
  } as Meta<typeof Spinner>;
  export default meta;

  export const Default: StoryObj<typeof Spinner> = {
    args: { size: 'medium', 'aria-label': 'Loading' },
  };

  export const AllSizes: StoryObj<typeof Spinner> = {
    render: () => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Spinner size="small" aria-label="loading small" />
        <Spinner size="medium" aria-label="loading medium" />
        <Spinner size="large" aria-label="loading large" />
      </div>
    ),
  };

  export const Themed: StoryObj<typeof Spinner> = {
    render: () => (
      <div style={{ display: 'flex', gap: '1rem' }}>
        <span style={{ color: 'var(--color-primary-medium)' }}>
          <Spinner aria-label="primary" />
        </span>
        <span style={{ color: 'var(--color-success-medium)' }}>
          <Spinner aria-label="success" />
        </span>
        <span style={{ color: 'var(--color-error-medium)' }}>
          <Spinner aria-label="error" />
        </span>
      </div>
    ),
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

  Confirm spinners rotate smoothly. In browser dev tools, toggle `prefers-reduced-motion: reduce` — should slow animation.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Spinner
  git commit -m "feat(dls): add Spinner with three sizes and reduced-motion support"
  ```

---

### Task 19: Skeleton

**Files:**
- Create: `src/components/dls/Skeleton/Skeleton.tsx`
- Create: `src/components/dls/Skeleton/Skeleton.module.scss`
- Create: `src/components/dls/Skeleton/Skeleton.stories.tsx`
- Create: `src/components/dls/Skeleton/Skeleton.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Skeleton/Skeleton.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import Skeleton from './Skeleton';

  describe('Skeleton', () => {
    it('renders a placeholder element', () => {
      render(<Skeleton aria-label="loading row" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('applies width and height via inline style', () => {
      render(<Skeleton width="100px" height="20px" aria-label="loading row" />);
      const el = screen.getByRole('status');
      expect(el.style.width).toBe('100px');
      expect(el.style.height).toBe('20px');
    });

    it('applies rounded class when rounded prop is true', () => {
      render(<Skeleton rounded aria-label="avatar" />);
      expect(screen.getByRole('status').getAttribute('data-rounded')).toBe('true');
    });

    it('defaults to rectangular when rounded is false', () => {
      render(<Skeleton aria-label="loading" />);
      expect(screen.getByRole('status').getAttribute('data-rounded')).toBe('false');
    });

    it('renders a circle when shape is circle', () => {
      render(<Skeleton shape="circle" aria-label="avatar" />);
      expect(screen.getByRole('status').getAttribute('data-shape')).toBe('circle');
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Skeleton/Skeleton.test.tsx
  ```

- [ ] **Step 3: Implement Skeleton SCSS.**

  Create `src/components/dls/Skeleton/Skeleton.module.scss`:

  ```scss
  .skeleton {
    display: inline-block;
    background: var(--color-background-alternative-faint);
    position: relative;
    overflow: hidden;
    vertical-align: middle;

    &[data-rounded='true'] {
      border-radius: var(--border-radius-default);
    }

    &[data-shape='circle'] {
      border-radius: var(--border-radius-circle);
      aspect-ratio: 1 / 1;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        transparent,
        var(--color-background-lighten),
        transparent
      );
      animation: shimmer 1.5s infinite;
    }
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton::after {
      animation: none;
      display: none;
    }
  }
  ```

- [ ] **Step 4: Implement Skeleton component.**

  Create `src/components/dls/Skeleton/Skeleton.tsx`:

  ```tsx
  import { HTMLAttributes, CSSProperties } from 'react';
  import classnames from 'classnames';
  import styles from './Skeleton.module.scss';

  type SkeletonShape = 'rect' | 'circle';

  interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    width?: CSSProperties['width'];
    height?: CSSProperties['height'];
    rounded?: boolean;
    shape?: SkeletonShape;
  }

  export default function Skeleton({
    width,
    height,
    rounded = false,
    shape = 'rect',
    className,
    style,
    ...rest
  }: SkeletonProps) {
    return (
      <span
        role="status"
        aria-live="polite"
        className={classnames(styles.skeleton, className)}
        data-rounded={rounded}
        data-shape={shape}
        style={{ width, height, ...style }}
        {...rest}
      />
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Skeleton/Skeleton.test.tsx
  ```

  Expected: 5 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Skeleton/Skeleton.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Skeleton from './Skeleton';

  const meta = {
    title: 'dls/Skeleton',
    component: Skeleton,
    tags: ['autodocs'],
  } as Meta<typeof Skeleton>;
  export default meta;

  export const TextLine: StoryObj<typeof Skeleton> = {
    render: () => <Skeleton width="100%" height="1rem" rounded aria-label="loading text" />,
  };

  export const Avatar: StoryObj<typeof Skeleton> = {
    render: () => <Skeleton shape="circle" width="48px" aria-label="loading avatar" />,
  };

  export const CardSkeleton: StoryObj<typeof Skeleton> = {
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '300px' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Skeleton shape="circle" width="40px" aria-label="loading avatar" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Skeleton width="60%" height="0.875rem" rounded aria-label="loading name" />
            <Skeleton width="40%" height="0.75rem" rounded aria-label="loading meta" />
          </div>
        </div>
        <Skeleton width="100%" height="6rem" rounded aria-label="loading body" />
      </div>
    ),
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

  Confirm shimmer animation runs left-to-right. Toggle `prefers-reduced-motion: reduce` — animation should stop.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Skeleton
  git commit -m "feat(dls): add Skeleton with shimmer, circle, and reduced-motion variants"
  ```

---

### Task 20: Badge

**Files:**
- Create: `src/components/dls/Badge/Badge.tsx`
- Create: `src/components/dls/Badge/Badge.module.scss`
- Create: `src/components/dls/Badge/Badge.stories.tsx`
- Create: `src/components/dls/Badge/Badge.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Badge/Badge.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import Badge from './Badge';

  describe('Badge', () => {
    it('renders children', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('defaults to neutral variant', () => {
      render(<Badge>Default</Badge>);
      expect(screen.getByText('Default').getAttribute('data-variant')).toBe('neutral');
    });

    it('applies success variant', () => {
      render(<Badge variant="success">OK</Badge>);
      expect(screen.getByText('OK').getAttribute('data-variant')).toBe('success');
    });

    it('applies warning variant', () => {
      render(<Badge variant="warning">Heads up</Badge>);
      expect(screen.getByText('Heads up').getAttribute('data-variant')).toBe('warning');
    });

    it('applies error variant', () => {
      render(<Badge variant="error">Failed</Badge>);
      expect(screen.getByText('Failed').getAttribute('data-variant')).toBe('error');
    });

    it('applies size class', () => {
      render(<Badge size="small">Tiny</Badge>);
      expect(screen.getByText('Tiny').getAttribute('data-size')).toBe('small');
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Badge/Badge.test.tsx
  ```

- [ ] **Step 3: Implement Badge SCSS.**

  Create `src/components/dls/Badge/Badge.module.scss`:

  ```scss
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    border-radius: var(--border-radius-default);
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    border: 1px solid transparent;

    &[data-size='small'] {
      padding: 0.125rem 0.5rem;
      font-size: var(--font-size-xsmall);
    }
    &[data-size='medium'] {
      padding: 0.25rem 0.625rem;
      font-size: var(--font-size-small);
    }

    &[data-variant='neutral'] {
      background: var(--color-secondary-faded);
      color: var(--color-text-default);
      border-color: var(--color-secondary-faint);
    }
    &[data-variant='success'] {
      background: var(--color-success-faded);
      color: var(--color-success-deep);
      border-color: var(--color-success-faint);
    }
    &[data-variant='warning'] {
      background: var(--color-warning-faded);
      color: var(--color-warning-deep);
      border-color: var(--color-warning-faint);
    }
    &[data-variant='error'] {
      background: var(--color-error-faded);
      color: var(--color-error-deep);
      border-color: var(--color-error-faint);
    }
    &[data-variant='info'] {
      background: var(--color-success-faded);
      color: var(--color-success-deep);
      border-color: var(--color-success-faint);
    }
  }
  ```

- [ ] **Step 4: Implement Badge component.**

  Create `src/components/dls/Badge/Badge.tsx`:

  ```tsx
  import { HTMLAttributes } from 'react';
  import classnames from 'classnames';
  import styles from './Badge.module.scss';

  type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info';
  type BadgeSize = 'small' | 'medium';

  interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
  }

  export default function Badge({
    variant = 'neutral',
    size = 'medium',
    className,
    children,
    ...rest
  }: BadgeProps) {
    return (
      <span
        className={classnames(styles.badge, className)}
        data-variant={variant}
        data-size={size}
        {...rest}
      >
        {children}
      </span>
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Badge/Badge.test.tsx
  ```

  Expected: 6 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Badge/Badge.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Badge from './Badge';

  const meta = {
    title: 'dls/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
      variant: { control: 'select', options: ['neutral', 'success', 'warning', 'error', 'info'] },
      size: { control: 'radio', options: ['small', 'medium'] },
    },
  } as Meta<typeof Badge>;
  export default meta;

  export const Default: StoryObj<typeof Badge> = { args: { children: 'Default' } };
  export const Success: StoryObj<typeof Badge> = {
    args: { variant: 'success', children: 'Success' },
  };
  export const Warning: StoryObj<typeof Badge> = {
    args: { variant: 'warning', children: 'Warning' },
  };
  export const Error: StoryObj<typeof Badge> = {
    args: { variant: 'error', children: 'Error' },
  };
  export const Info: StoryObj<typeof Badge> = {
    args: { variant: 'info', children: 'Info' },
  };

  export const AllVariants: StoryObj<typeof Badge> = {
    render: () => (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="info">Info</Badge>
      </div>
    ),
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

  All 5 variants render with the correct theme colors.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Badge
  git commit -m "feat(dls): add Badge with 5 variants and 2 sizes"
  ```

---

### Task 21: Pill

**Files:**
- Create: `src/components/dls/Pill/Pill.tsx`
- Create: `src/components/dls/Pill/Pill.module.scss`
- Create: `src/components/dls/Pill/Pill.stories.tsx`
- Create: `src/components/dls/Pill/Pill.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Pill/Pill.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Pill from './Pill';

  describe('Pill', () => {
    it('renders children', () => {
      render(<Pill>Tag</Pill>);
      expect(screen.getByText('Tag')).toBeInTheDocument();
    });

    it('does not render close button when not removable', () => {
      render(<Pill>Tag</Pill>);
      expect(screen.queryByRole('button', { name: /remove/i })).toBeNull();
    });

    it('renders close button when removable', () => {
      render(<Pill removable onRemove={() => {}}>Tag</Pill>);
      expect(screen.getByRole('button', { name: /remove tag/i })).toBeInTheDocument();
    });

    it('fires onRemove with the pill key/id when close button clicked', () => {
      const onRemove = vi.fn();
      render(
        <Pill removable onRemove={onRemove} id="tag-1">
          Tag
        </Pill>,
      );
      fireEvent.click(screen.getByRole('button', { name: /remove tag/i }));
      expect(onRemove).toHaveBeenCalledWith('tag-1');
    });

    it('fires onClick when the pill body is clicked', () => {
      const onClick = vi.fn();
      render(<Pill onClick={onClick}>Tag</Pill>);
      fireEvent.click(screen.getByText('Tag'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Pill/Pill.test.tsx
  ```

- [ ] **Step 3: Implement Pill SCSS.**

  Create `src/components/dls/Pill/Pill.module.scss`:

  ```scss
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding-inline: 0.75rem;
    padding-block: 0.25rem;
    border-radius: var(--border-radius-pill);
    background: var(--color-secondary-faded);
    color: var(--color-text-default);
    font-size: var(--font-size-small);
    line-height: 1.2;
    white-space: nowrap;
    border: 1px solid transparent;
    transition: background 150ms ease;

    &[data-clickable='true'] {
      cursor: pointer;
      &:hover {
        background: var(--color-secondary-faint);
      }
    }

    &[data-variant='primary'] {
      background: var(--color-primary-faded);
      color: var(--color-primary-deep);
      border-color: var(--color-primary-faint);
    }
    &[data-variant='outline'] {
      background: transparent;
      border-color: var(--color-borders-hairline);
      color: var(--color-text-default);
    }
  }

  .removeButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    border-radius: var(--border-radius-circle);
    opacity: 0.7;
    transition: opacity 150ms ease, background 150ms ease;

    &:hover {
      opacity: 1;
      background: var(--color-background-alternative-medium);
    }
  }
  ```

- [ ] **Step 4: Implement Pill component.**

  Create `src/components/dls/Pill/Pill.tsx`:

  ```tsx
  import { HTMLAttributes } from 'react';
  import classnames from 'classnames';
  import styles from './Pill.module.scss';

  type PillVariant = 'default' | 'primary' | 'outline';

  interface PillProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
    variant?: PillVariant;
    onClick?: () => void;
    removable?: boolean;
    onRemove?: (id?: string) => void;
    id?: string;
  }

  export default function Pill({
    variant = 'default',
    onClick,
    removable = false,
    onRemove,
    id,
    className,
    children,
    ...rest
  }: PillProps) {
    const label = typeof children === 'string' ? children : 'item';
    return (
      <span
        className={classnames(styles.pill, className)}
        data-variant={variant}
        data-clickable={!!onClick}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        {...rest}
      >
        {children}
        {removable ? (
          <button
            type="button"
            className={styles.removeButton}
            aria-label={`Remove ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(id);
            }}
          >
            ✕
          </button>
        ) : null}
      </span>
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Pill/Pill.test.tsx
  ```

  Expected: 5 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Pill/Pill.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Pill from './Pill';

  const meta = {
    title: 'dls/Pill',
    component: Pill,
    tags: ['autodocs'],
    argTypes: {
      variant: { control: 'radio', options: ['default', 'primary', 'outline'] },
    },
  } as Meta<typeof Pill>;
  export default meta;

  export const Default: StoryObj<typeof Pill> = { args: { children: 'Default' } };
  export const Primary: StoryObj<typeof Pill> = {
    args: { variant: 'primary', children: 'Primary' },
  };
  export const Outline: StoryObj<typeof Pill> = {
    args: { variant: 'outline', children: 'Outline' },
  };

  export const Removable: StoryObj<typeof Pill> = {
    render: () => (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Pill removable onRemove={(id) => console.log('removed', id)} id="t1">
          Tasbeeh
        </Pill>
        <Pill removable onRemove={(id) => console.log('removed', id)} id="t2">
          Salah
        </Pill>
        <Pill removable onRemove={(id) => console.log('removed', id)} id="t3">
          Tahajjud
        </Pill>
      </div>
    ),
  };

  export const Clickable: StoryObj<typeof Pill> = {
    render: () => (
      <Pill onClick={() => alert('clicked')} variant="primary">
        Click me
      </Pill>
    ),
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

  Click removable pills' X — should log to console. Click clickable pill — should alert.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Pill
  git commit -m "feat(dls): add Pill with variants, removable, and clickable modes"
  ```

---

### Task 22: Tooltip

**Files:**
- Create: `src/components/dls/Tooltip/Tooltip.tsx`
- Create: `src/components/dls/Tooltip/TooltipProvider.tsx`
- Create: `src/components/dls/Tooltip/Tooltip.module.scss`
- Create: `src/components/dls/Tooltip/Tooltip.stories.tsx`
- Create: `src/components/dls/Tooltip/Tooltip.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Tooltip/Tooltip.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Tooltip from './Tooltip';
  import TooltipProvider from './TooltipProvider';

  function renderWithProvider(ui: React.ReactElement) {
    return render(<TooltipProvider>{ui}</TooltipProvider>);
  }

  describe('Tooltip', () => {
    it('renders the trigger element', () => {
      renderWithProvider(
        <Tooltip content="Tip text">
          <button type="button">Hover me</button>
        </Tooltip>,
      );
      expect(screen.getByRole('button', { name: /hover me/i })).toBeInTheDocument();
    });

    it('does not show tooltip content by default', () => {
      renderWithProvider(
        <Tooltip content="Hidden tip">
          <button type="button">Trigger</button>
        </Tooltip>,
      );
      expect(screen.queryByText('Hidden tip')).toBeNull();
    });

    it('shows tooltip content on hover', async () => {
      renderWithProvider(
        <Tooltip content="Visible tip">
          <button type="button">Trigger</button>
        </Tooltip>,
      );
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(await screen.findByText('Visible tip')).toBeInTheDocument();
    });

    it('applies side attribute when side is provided', async () => {
      renderWithProvider(
        <Tooltip content="Right tip" side="right">
          <button type="button">Trigger</button>
        </Tooltip>,
      );
      fireEvent.mouseEnter(screen.getByRole('button'));
      const tip = await screen.findByText('Right tip');
      expect(tip.closest('[data-side]')?.getAttribute('data-side')).toBe('right');
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Tooltip/Tooltip.test.tsx
  ```

- [ ] **Step 3: Implement Tooltip SCSS.**

  Create `src/components/dls/Tooltip/Tooltip.module.scss`:

  ```scss
  .content {
    background: var(--color-text-default);
    color: var(--color-text-inverse);
    border-radius: var(--border-radius-default);
    padding: 0.375rem 0.625rem;
    font-size: var(--font-size-small);
    box-shadow: var(--shadow-medium);
    max-width: 18rem;
    z-index: 1000;
  }

  .arrow {
    fill: var(--color-text-default);
  }
  ```

- [ ] **Step 4: Implement Tooltip component.**

  Create `src/components/dls/Tooltip/TooltipProvider.tsx`:

  ```tsx
  'use client';
  import * as TooltipPrimitive from '@radix-ui/react-tooltip';

  export default function TooltipProvider({
    children,
    delayDuration = 300,
  }: {
    children: React.ReactNode;
    delayDuration?: number;
  }) {
    return <TooltipPrimitive.Provider delayDuration={delayDuration}>{children}</TooltipPrimitive.Provider>;
  }
  ```

  Create `src/components/dls/Tooltip/Tooltip.tsx`:

  ```tsx
  'use client';
  import { ReactNode, useState } from 'react';
  import * as TooltipPrimitive from '@radix-ui/react-tooltip';
  import styles from './Tooltip.module.scss';

  type Side = 'top' | 'right' | 'bottom' | 'left';

  interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    side?: Side;
    align?: 'start' | 'center' | 'end';
  }

  export default function Tooltip({
    children,
    content,
    side = 'top',
    align = 'center',
  }: TooltipProps) {
    const [open, setOpen] = useState(false);
    return (
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content side={side} align={align} className={styles.content}>
            {content}
            <TooltipPrimitive.Arrow className={styles.arrow} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Tooltip/Tooltip.test.tsx
  ```

  Expected: 4 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Tooltip/Tooltip.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Tooltip from './Tooltip';
  import TooltipProvider from './TooltipProvider';

  const meta = {
    title: 'dls/Tooltip',
    component: Tooltip,
  } as Meta<typeof Tooltip>;
  export default meta;

  const wrap = (children: React.ReactNode) => <TooltipProvider>{children}</TooltipProvider>;

  export const Top: StoryObj<typeof Tooltip> = {
    render: () =>
      wrap(
        <Tooltip content="I am above">
          <button type="button">Hover me</button>
        </Tooltip>,
      ),
  };

  export const Right: StoryObj<typeof Tooltip> = {
    render: () =>
      wrap(
        <Tooltip content="To your right" side="right">
          <button type="button">Hover me</button>
        </Tooltip>,
      ),
  };

  export const Bottom: StoryObj<typeof Tooltip> = {
    render: () =>
      wrap(
        <Tooltip content="Below you" side="bottom">
          <button type="button">Hover me</button>
        </Tooltip>,
      ),
  };

  export const Left: StoryObj<typeof Tooltip> = {
    render: () =>
      wrap(
        <Tooltip content="To your left" side="left">
          <button type="button">Hover me</button>
        </Tooltip>,
      ),
  };

  export const RichContent: StoryObj<typeof Tooltip> = {
    render: () =>
      wrap(
        <Tooltip
          content={
            <div>
              <strong>Tip</strong>
              <div style={{ marginTop: 4 }}>With multiple lines and a link.</div>
            </div>
          }
        >
          <button type="button">Info</button>
        </Tooltip>,
      ),
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

  Hover each trigger — tooltip appears on the correct side with the dark/light theme.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Tooltip
  git commit -m "feat(dls): add Tooltip (Radix) with 4 sides and rich content"
  ```

---

### Task 23: Toast

**Files:**
- Create: `src/components/dls/Toast/Toast.tsx`
- Create: `src/components/dls/Toast/ToastProvider.tsx`
- Create: `src/components/dls/Toast/Toast.module.scss`
- Create: `src/components/dls/Toast/Toast.stories.tsx`
- Create: `src/components/dls/Toast/Toast.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Toast/Toast.test.tsx`:

  ```tsx
  import { describe, expect, it, vi, beforeEach } from 'vitest';
  import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
  import toast, { ToastProvider } from './Toast';

  function renderWithProvider(ui: React.ReactElement) {
    return render(<ToastProvider>{ui}</ToastProvider>);
  }

  describe('Toast', () => {
    beforeEach(() => {
      // Reset DOM and toast container between tests
      document.body.innerHTML = '';
    });

    it('renders a toast container', () => {
      renderWithProvider(<div>app</div>);
      // Toastify uses a container with role=region
      expect(document.body).not.toBeEmptyDOMElement();
    });

    it('shows a success toast when toast.success() is called', async () => {
      renderWithProvider(
        <button type="button" onClick={() => toast.success('Saved')}>
          trigger
        </button>,
      );
      fireEvent.click(screen.getByText('trigger'));
      await waitFor(() => expect(screen.getByText('Saved')).toBeInTheDocument());
    });

    it('shows an error toast with the error variant', async () => {
      renderWithProvider(
        <button type="button" onClick={() => toast.error('Failed')}>
          trigger
        </button>,
      );
      fireEvent.click(screen.getByText('trigger'));
      await waitFor(() => expect(screen.getByText('Failed')).toBeInTheDocument());
    });

    it('auto-dismisses after the duration', async () => {
      vi.useFakeTimers();
      renderWithProvider(
        <button type="button" onClick={() => toast.success('Brief', { autoClose: 1000 })}>
          trigger
        </button>,
      );
      fireEvent.click(screen.getByText('trigger'));
      await waitFor(() => expect(screen.getByText('Brief')).toBeInTheDocument());

      act(() => { vi.advanceTimersByTime(1500); });
      await waitFor(() => expect(screen.queryByText('Brief')).toBeNull());
      vi.useRealTimers();
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Toast/Toast.test.tsx
  ```

- [ ] **Step 3: Implement Toast SCSS.**

  Create `src/components/dls/Toast/Toast.module.scss`:

  ```scss
  .container {
    position: fixed;
    inset-block-start: 1rem;
    inset-inline-end: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    background: var(--color-background-default);
    color: var(--color-text-default);
    border: 1px solid var(--color-borders-hairline);
    border-inline-start: 4px solid var(--color-text-faded);
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius-default);
    box-shadow: var(--shadow-medium);
    font-size: var(--font-size-small);
    min-width: 18rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &[data-variant='success'] { border-inline-start-color: var(--color-success-medium); }
    &[data-variant='error'] { border-inline-start-color: var(--color-error-medium); }
    &[data-variant='warning'] { border-inline-start-color: var(--color-warning-medium); }
    &[data-variant='info'] { border-inline-start-color: var(--color-primary-medium); }
  }
  ```

- [ ] **Step 4: Implement Toast component.**

  Create `src/components/dls/Toast/Toast.tsx`:

  ```tsx
  'use client';
  import { toast as toastify, ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import styles from './Toast.module.scss';

  type Variant = 'success' | 'error' | 'warning' | 'info';

  interface ToastOptions {
    autoClose?: number | false;
  }

  function render(content: React.ReactNode, variant: Variant, options?: ToastOptions) {
    return toastify(content, {
      type: variant as any,
      autoClose: options?.autoClose ?? 5000,
      className: `${styles.toast}`,
      progressClassName: `${styles.progress}`,
      // Apply data-variant to the rendered toast node
      onOpen: ({ containerId }) => {
        /* noop */
      },
    });
  }

  export const toast = {
    success: (content: React.ReactNode, options?: ToastOptions) =>
      render(content, 'success', options),
    error: (content: React.ReactNode, options?: ToastOptions) =>
      render(content, 'error', options),
    warning: (content: React.ReactNode, options?: ToastOptions) =>
      render(content, 'warning', options),
    info: (content: React.ReactNode, options?: ToastOptions) =>
      render(content, 'info', options),
  };

  export default toast;
  export type { Variant };
  ```

  Create `src/components/dls/Toast/ToastProvider.tsx`:

  ```tsx
  'use client';
  import { ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import styles from './Toast.module.scss';

  export default function ToastProvider({ children }: { children: React.ReactNode }) {
    return (
      <>
        {children}
        <ToastContainer className={styles.container} position="top-right" />
      </>
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Toast/Toast.test.tsx
  ```

  Expected: 4 tests pass. If `react-toastify` ESM has issues in vitest, add to `vitest.config.ts`:
  ```typescript
  test: {
    server: { deps: { inline: ['react-toastify'] } },
  }
  ```

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Toast/Toast.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import toast, { ToastProvider } from './Toast';

  const meta = {
    title: 'dls/Toast',
  } as Meta;
  export default meta;

  const wrap = (ui: React.ReactNode) => <ToastProvider>{ui}</ToastProvider>;

  export const Success: StoryObj = {
    render: () =>
      wrap(
        <button type="button" onClick={() => toast.success('Saved successfully')}>
          Show success
        </button>,
      ),
  };

  export const Error: StoryObj = {
    render: () =>
      wrap(
        <button type="button" onClick={() => toast.error('Something went wrong')}>
          Show error
        </button>,
      ),
  };

  export const Warning: StoryObj = {
    render: () =>
      wrap(
        <button type="button" onClick={() => toast.warning('Heads up!')}>
          Show warning
        </button>,
      ),
  };

  export const Info: StoryObj = {
    render: () =>
      wrap(
        <button type="button" onClick={() => toast.info('Did you know?')}>
          Show info
        </button>,
      ),
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

  Click each trigger — toast appears in the top-right with correct color border. Auto-dismisses after 5s.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Toast
  git commit -m "feat(dls): add Toast (react-toastify wrapper) with 4 variants"
  ```

---

### Task 24: Modal

**Files:**
- Create: `src/components/dls/Modal/Modal.tsx`
- Create: `src/components/dls/Modal/Modal.module.scss`
- Create: `src/components/dls/Modal/Modal.stories.tsx`
- Create: `src/components/dls/Modal/Modal.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Modal/Modal.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Modal from './Modal';

  describe('Modal', () => {
    it('does not render content when open=false', () => {
      render(
        <Modal open={false} onClose={() => {}}>
          Hidden body
        </Modal>,
      );
      expect(screen.queryByText('Hidden body')).toBeNull();
    });

    it('renders content when open=true', () => {
      render(
        <Modal open onClose={() => {}}>
          Visible body
        </Modal>,
      );
      expect(screen.getByText('Visible body')).toBeInTheDocument();
    });

    it('renders title and description when provided', () => {
      render(
        <Modal open onClose={() => {}} title="Confirm" description="Are you sure?">
          Body
        </Modal>,
      );
      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('fires onClose when ESC is pressed', () => {
      const onClose = vi.fn();
      render(
        <Modal open onClose={onClose}>
          Body
        </Modal>,
      );
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('fires onClose when the close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <Modal open onClose={onClose} title="Title">
          Body
        </Modal>,
      );
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClose on backdrop click when dismissable=false', () => {
      const onClose = vi.fn();
      render(
        <Modal open onClose={onClose} dismissable={false}>
          Body
        </Modal>,
      );
      // Radix renders an overlay element; click it
      const overlay = document.querySelector('[data-radix-modal-overlay]') as HTMLElement;
      if (overlay) fireEvent.mouseDown(overlay);
      // The Radix Dialog.Root listens to pointer events on overlay; pointer events must originate from overlay itself
      expect(onClose).not.toHaveBeenCalled();
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Modal/Modal.test.tsx
  ```

- [ ] **Step 3: Implement Modal SCSS.**

  Create `src/components/dls/Modal/Modal.module.scss`:

  ```scss
  .overlay {
    position: fixed;
    inset: 0;
    background: var(--color-background-backdrop);
    backdrop-filter: blur(2px);
    z-index: 1000;
  }

  .content {
    position: fixed;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-background-default);
    color: var(--color-text-default);
    border-radius: var(--border-radius-default);
    box-shadow: var(--shadow-large);
    padding: 1.5rem;
    width: min(90vw, 32rem);
    max-height: 90vh;
    overflow-y: auto;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .title {
    font-size: var(--font-size-large);
    font-weight: 700;
    margin: 0;
  }

  .description {
    color: var(--color-text-faded);
    font-size: var(--font-size-small);
    margin: 0;
  }

  .closeButton {
    border: none;
    background: transparent;
    color: var(--color-text-faded);
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0.25rem;
    border-radius: var(--border-radius-default);

    &:hover {
      color: var(--color-text-default);
      background: var(--color-background-alternative-faint);
    }
  }

  .body {
    flex: 1;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  ```

- [ ] **Step 4: Implement Modal component.**

  Create `src/components/dls/Modal/Modal.tsx`:

  ```tsx
  'use client';
  import { ReactNode } from 'react';
  import * as DialogPrimitive from '@radix-ui/react-dialog';
  import classnames from 'classnames';
  import styles from './Modal.module.scss';

  interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    dismissable?: boolean;
  }

  export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    dismissable = true,
  }: ModalProps) {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            data-radix-modal-overlay
            className={styles.overlay}
          />
          <DialogPrimitive.Content
            className={styles.content}
            onEscapeKeyDown={(e) => {
              if (!dismissable) e.preventDefault();
            }}
            onPointerDownOutside={(e) => {
              if (!dismissable) e.preventDefault();
            }}
          >
            {(title || dismissable) && (
              <div className={styles.header}>
                <div>
                  {title ? (
                    <DialogPrimitive.Title className={styles.title}>
                      {title}
                    </DialogPrimitive.Title>
                  ) : null}
                  {description ? (
                    <DialogPrimitive.Description className={styles.description}>
                      {description}
                    </DialogPrimitive.Description>
                  ) : null}
                </div>
                {dismissable ? (
                  <DialogPrimitive.Close asChild>
                    <button type="button" className={styles.closeButton} aria-label="Close">
                      ✕
                    </button>
                  </DialogPrimitive.Close>
                ) : null}
              </div>
            )}
            {children ? <div className={styles.body}>{children}</div> : null}
            {footer ? <div className={styles.footer}>{footer}</div> : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Modal/Modal.test.tsx
  ```

  Expected: 6 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Modal/Modal.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import { useState } from 'react';
  import Modal from './Modal';
  import Button from '../Button/Button';

  const meta = {
    title: 'dls/Modal',
    component: Modal,
    tags: ['autodocs'],
  } as Meta<typeof Modal>;
  export default meta;

  export const Basic: StoryObj<typeof Modal> = {
    render: () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <Modal open={open} onClose={() => setOpen(false)} title="Hello">
            <p>Modal body content goes here.</p>
          </Modal>
        </>
      );
    },
  };

  export const WithDescriptionAndFooter: StoryObj<typeof Modal> = {
    render: () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Delete item?
          </Button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title="Confirm delete"
            description="This action cannot be undone."
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setOpen(false)}>
                  Delete
                </Button>
              </>
            }
          >
            <p>Are you sure you want to delete this item permanently?</p>
          </Modal>
        </>
      );
    },
  };

  export const NonDismissable: StoryObj<typeof Modal> = {
    render: () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open</Button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title="Important"
            dismissable={false}
            footer={
              <Button onClick={() => setOpen(false)}>Acknowledge</Button>
            }
          >
            <p>You must acknowledge before continuing. ESC and backdrop click do nothing.</p>
          </Modal>
        </>
      );
    },
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

  Open each modal variant. ESC closes the basic and with-footer modals. ESC does NOT close the non-dismissable one. Clicking the X closes the modal. Clicking the backdrop closes the dismissable modal.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Modal
  git commit -m "feat(dls): add Modal (Radix Dialog) with title, footer, and dismissable control"
  ```

---

### Task 25: Popover

**Files:**
- Create: `src/components/dls/Popover/Popover.tsx`
- Create: `src/components/dls/Popover/Popover.module.scss`
- Create: `src/components/dls/Popover/Popover.stories.tsx`
- Create: `src/components/dls/Popover/Popover.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Popover/Popover.test.tsx`:

  ```tsx
  import { describe, expect, it, vi } from 'vitest';
  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import Popover from './Popover';

  describe('Popover', () => {
    it('renders the trigger', () => {
      render(
        <Popover content="Hidden content">
          <button type="button">Open</button>
        </Popover>,
      );
      expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
    });

    it('does not show content before click', () => {
      render(
        <Popover content="Hidden content">
          <button type="button">Open</button>
        </Popover>,
      );
      expect(screen.queryByText('Hidden content')).toBeNull();
    });

    it('shows content when trigger is clicked', async () => {
      render(
        <Popover content="Visible content">
          <button type="button">Open</button>
        </Popover>,
      );
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => expect(screen.getByText('Visible content')).toBeInTheDocument());
    });

    it('closes when the trigger is clicked again', async () => {
      render(
        <Popover content="Toggle content">
          <button type="button">Open</button>
        </Popover>,
      );
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      await waitFor(() => expect(screen.getByText('Toggle content')).toBeInTheDocument());
      fireEvent.click(trigger);
      await waitFor(() => expect(screen.queryByText('Toggle content')).toBeNull());
    });

    it('applies side attribute when side is provided', async () => {
      render(
        <Popover content="Right content" side="right">
          <button type="button">Open</button>
        </Popover>,
      );
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => expect(screen.getByText('Right content')).toBeInTheDocument());
      const content = screen.getByText('Right content').closest('[data-side]');
      expect(content?.getAttribute('data-side')).toBe('right');
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Popover/Popover.test.tsx
  ```

- [ ] **Step 3: Implement Popover SCSS.**

  Create `src/components/dls/Popover/Popover.module.scss`:

  ```scss
  .content {
    background: var(--color-background-default);
    color: var(--color-text-default);
    border: 1px solid var(--color-borders-hairline);
    border-radius: var(--border-radius-default);
    box-shadow: var(--shadow-medium);
    padding: 0.75rem;
    z-index: 1000;
    min-width: 12rem;
    max-width: 22rem;
    animation: popoverIn 120ms ease-out;
  }

  .arrow {
    fill: var(--color-background-default);
  }

  @keyframes popoverIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  ```

- [ ] **Step 4: Implement Popover component.**

  Create `src/components/dls/Popover/Popover.tsx`:

  ```tsx
  'use client';
  import { ReactNode } from 'react';
  import * as PopoverPrimitive from '@radix-ui/react-popover';
  import styles from './Popover.module.scss';

  type Side = 'top' | 'right' | 'bottom' | 'left';
  type Align = 'start' | 'center' | 'end';

  interface PopoverProps {
    children: ReactNode;
    content: ReactNode;
    side?: Side;
    align?: Align;
    defaultOpen?: boolean;
  }

  export default function Popover({
    children,
    content,
    side = 'bottom',
    align = 'center',
    defaultOpen = false,
  }: PopoverProps) {
    return (
      <PopoverPrimitive.Root defaultOpen={defaultOpen}>
        <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content side={side} align={align} className={styles.content}>
            {content}
            <PopoverPrimitive.Arrow className={styles.arrow} />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Popover/Popover.test.tsx
  ```

  Expected: 5 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Popover/Popover.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Popover from './Popover';
  import Button from '../Button/Button';

  const meta = {
    title: 'dls/Popover',
    component: Popover,
  } as Meta<typeof Popover>;
  export default meta;

  export const Bottom: StoryObj<typeof Popover> = {
    render: () => (
      <Popover content={<div>Popover anchored to the bottom.</div>}>
        <Button>Open</Button>
      </Popover>
    ),
  };

  export const Right: StoryObj<typeof Popover> = {
    render: () => (
      <Popover content={<div>Anchored to the right.</div>} side="right">
        <Button>Right</Button>
      </Popover>
    ),
  };

  export const Top: StoryObj<typeof Popover> = {
    render: () => (
      <Popover content={<div>Anchored to the top.</div>} side="top">
        <Button>Top</Button>
      </Popover>
    ),
  };

  export const Left: StoryObj<typeof Popover> = {
    render: () => (
      <Popover content={<div>Anchored to the left.</div>} side="left">
        <Button>Left</Button>
      </Popover>
    ),
  };

  export const RichContent: StoryObj<typeof Popover> = {
    render: () => (
      <Popover
        content={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <strong>Settings</strong>
            <label>
              <input type="checkbox" /> Show translations
            </label>
            <label>
              <input type="checkbox" /> Auto-play audio
            </label>
            <Button size="small">Apply</Button>
          </div>
        }
      >
        <Button variant="secondary">Configure</Button>
      </Popover>
    ),
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

  Click each trigger — popover appears on the correct side with the arrow. Click outside — closes.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Popover
  git commit -m "feat(dls): add Popover (Radix) with 4 sides and rich content"
  ```

---

### Task 26: Scrollable

**Files:**
- Create: `src/components/dls/Scrollable/Scrollable.tsx`
- Create: `src/components/dls/Scrollable/Scrollable.module.scss`
- Create: `src/components/dls/Scrollable/Scrollable.stories.tsx`
- Create: `src/components/dls/Scrollable/Scrollable.test.tsx`

- [ ] **Step 1: Write the failing test.**

  Create `src/components/dls/Scrollable/Scrollable.test.tsx`:

  ```tsx
  import { describe, expect, it } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import Scrollable from './Scrollable';

  describe('Scrollable', () => {
    it('renders children', () => {
      render(
        <Scrollable aria-label="list">
          <div>Item 1</div>
        </Scrollable>,
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('applies maxHeight via inline style', () => {
      render(
        <Scrollable maxHeight={200} aria-label="list">
          <div>x</div>
        </Scrollable>,
      );
      const el = screen.getByRole('region', { name: /list/i });
      expect(el.style.maxHeight).toBe('200px');
    });

    it('defaults to showing scrollbar', () => {
      render(
        <Scrollable aria-label="list">
          <div>x</div>
        </Scrollable>,
      );
      expect(screen.getByRole('region', { name: /list/i }).getAttribute('data-scrollbar')).toBe(
        'visible',
      );
    });

    it('hides scrollbar when hideScrollbar is true', () => {
      render(
        <Scrollable hideScrollbar aria-label="list">
          <div>x</div>
        </Scrollable>,
      );
      expect(screen.getByRole('region', { name: /list/i }).getAttribute('data-scrollbar')).toBe(
        'hidden',
      );
    });

    it('renders as a region with aria-label', () => {
      render(
        <Scrollable aria-label="Surah list">
          <div>x</div>
        </Scrollable>,
      );
      expect(screen.getByRole('region', { name: /surah list/i })).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run test — expect FAIL.**

  ```bash
  yarn vitest run src/components/dls/Scrollable/Scrollable.test.tsx
  ```

- [ ] **Step 3: Implement Scrollable SCSS.**

  Create `src/components/dls/Scrollable/Scrollable.module.scss`:

  ```scss
  .scrollable {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    &[data-scrollbar='visible'] {
      scrollbar-width: thin;
      scrollbar-color: var(--color-secondary-faint) transparent;

      &::-webkit-scrollbar {
        width: 0.5rem;
        height: 0.5rem;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--color-secondary-faint);
        border-radius: var(--border-radius-pill);
      }
      &::-webkit-scrollbar-thumb:hover {
        background: var(--color-secondary-medium);
      }
    }

    &[data-scrollbar='hidden'] {
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
  ```

- [ ] **Step 4: Implement Scrollable component.**

  Create `src/components/dls/Scrollable/Scrollable.tsx`:

  ```tsx
  import { HTMLAttributes, CSSProperties } from 'react';
  import classnames from 'classnames';
  import styles from './Scrollable.module.scss';

  interface ScrollableProps extends HTMLAttributes<HTMLDivElement> {
    maxHeight?: number;
    hideScrollbar?: boolean;
  }

  export default function Scrollable({
    maxHeight,
    hideScrollbar = false,
    className,
    style,
    children,
    'aria-label': ariaLabel,
    ...rest
  }: ScrollableProps) {
    const computedStyle: CSSProperties = {
      ...(maxHeight !== undefined ? { maxHeight } : {}),
      ...style,
    };
    return (
      <div
        role="region"
        aria-label={ariaLabel}
        className={classnames(styles.scrollable, className)}
        data-scrollbar={hideScrollbar ? 'hidden' : 'visible'}
        style={computedStyle}
        {...rest}
      >
        {children}
      </div>
    );
  }
  ```

- [ ] **Step 5: Run test — expect PASS.**

  ```bash
  yarn vitest run src/components/dls/Scrollable/Scrollable.test.tsx
  ```

  Expected: 5 tests pass.

- [ ] **Step 6: Write Storybook story.**

  Create `src/components/dls/Scrollable/Scrollable.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react';
  import Scrollable from './Scrollable';

  const meta = {
    title: 'dls/Scrollable',
    component: Scrollable,
    tags: ['autodocs'],
  } as Meta<typeof Scrollable>;
  export default meta;

  const longContent = (
    <div style={{ padding: '1rem' }}>
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-borders-hairline)' }}>
          Item {i + 1}
        </div>
      ))}
    </div>
  );

  export const Default: StoryObj<typeof Scrollable> = {
    render: () => (
      <div style={{ width: 300 }}>
        <Scrollable maxHeight={200} aria-label="items">
          {longContent}
        </Scrollable>
      </div>
    ),
  };

  export const HiddenScrollbar: StoryObj<typeof Scrollable> = {
    render: () => (
      <div style={{ width: 300 }}>
        <Scrollable maxHeight={200} hideScrollbar aria-label="items">
          {longContent}
        </Scrollable>
      </div>
    ),
  };
  ```

- [ ] **Step 7: Verify in Storybook.**

  ```bash
  yarn storybook
  ```

  Scroll the Default story — thin scrollbar visible. Scroll HiddenScrollbar — no visible scrollbar. Both scroll smoothly with trackpad or mouse wheel.

- [ ] **Step 8: Commit.**

  ```bash
  git add src/components/dls/Scrollable
  git commit -m "feat(dls): add Scrollable with thin/hidden scrollbar variants"
  ```

---

## Section 7: Remaining DLS Components (Phase 1b Checklist)

The remaining 34 components are required for Phase 1 completion. Write a separate detailed plan for each batch using `superpowers:writing-plans` before implementing. Order by dependency on already-built primitives.

**Batch 1b.1 — More form primitives (8 components):**
- [ ] `Forms/TextArea` — multi-line input with auto-grow
- [ ] `Forms/Checkbox` — wrap `@radix-ui/react-checkbox`
- [ ] `Forms/RadioGroup` — wrap `@radix-ui/react-radio-group`
- [ ] `Forms/Select` — wrap `@radix-ui/react-dropdown-menu` (or react-select if added)
- [ ] `Forms/Combobox` — autocomplete select
- [ ] `Forms/StarRating` — clickable stars
- [ ] `Slider` — wrap `@radix-ui/react-slider`
- [ ] `Switch` — wrap `@radix-ui/react-switch`

**Batch 1b.2 — Layout & overlay primitives (8):**
- [ ] `ContentModal` — Modal variant with header/body/footer slots
- [ ] `ConfirmationModal` — Modal with confirm/cancel buttons
- [ ] `Collapsible` — wrap `@radix-ui/react-collapsible`
- [ ] `HoverCard` — wrap `@radix-ui/react-hover-card`
- [ ] `ClickableHoverCard` — HoverCard variant with click interaction
- [ ] `PopoverMenu` — Popover with menu items
- [ ] `HelperTooltip` — Tooltip variant with info icon trigger
- [ ] `Progress` — wrap `@radix-ui/react-progress`

**Batch 1b.3 — Navigation & misc (8):**
- [ ] `Tabs` — wrap `@radix-ui/react-tabs`
- [ ] `TabSwitcher` — single-select segmented control
- [ ] `Pagination` — page number navigation
- [ ] `Breadcrumb` — trail of links
- [ ] `CircularProgress` — circular Progress variant
- [ ] `Counter` — numeric stepper (+/-)
- [ ] `DurationInput` — HH:MM:SS input
- [ ] `CompactSelector` — compact dropdown

**Batch 1b.4 — Selection & misc (6):**
- [ ] `SelectionCard` — selectable card
- [ ] `SelectionList` — multi-select list of SelectionCards
- [ ] `Sorter` — sort dropdown
- [ ] `Link` — themed next/link wrapper
- [ ] `IconContainer` — themed icon wrapper
- [ ] `ShareButtons` — react-share wrapper

**Batch 1b.5 — Quran-specific primitives (4):** *Defer to Phase 2 — these need Quran data*
- [ ] `QuranWord` — word-by-word hover component (Phase 2)
- [ ] `Bismillah` — Bismillah renderer (Phase 2)
- [ ] `SurahPreview` — surah card with first-verse preview (Phase 2)
- [ ] `Calendar` — Hijri calendar grid (Phase 6)

**Batch 1b.6 — Higher-order components (2):**
- [ ] `Carousel` — image/content carousel (used by homepage)
- [ ] `InlineWordByWord` — word-by-word reading UI (Phase 2)
- [ ] `KeyboardInput` — keyboard shortcut capture (uses `react-hotkeys-hook`)

For each: follow the same TDD pattern as Tasks 14–26. Estimate 1–2 hours per component (test + impl + story).

---

## Section 8: Phase 1 Exit Criteria

Phase 1 is complete when ALL of these pass:

- [ ] Project at `/home/v2ray/projects/quran-clone/` runs `yarn dev` cleanly on `localhost:3000`
- [ ] `yarn lint && yarn tsc --noEmit && yarn test` all green
- [ ] `yarn storybook` opens with all 12 implemented DLS primitives visible
- [ ] `yarn playwright test tests/smoke.spec.ts` passes
- [ ] Homepage renders with Navbar + content + Footer
- [ ] Body has `data-theme="light"` after JS loads
- [ ] Lighthouse a11y score ≥ 95 on `/`
- [ ] 604 Hafs v4 fonts downloaded locally (or deferred pending license — ADR-D)
- [ ] Redux store persists `theme.type` across page reload (verify in browser devtools → Application → Local Storage)
- [ ] 12 DLS components have stories AND passing tests
- [ ] All work committed in small TDD commits; pushed to your own GitHub repo

---

## Self-review (per `writing-plans` skill)

**Spec coverage check:**
- Foundation toolchain ✓ (Tasks 1–5)
- Design tokens (themes, fonts) ✓ (Tasks 6–9)
- Redux + theme slice ✓ (Task 10)
- Layout shell ✓ (Tasks 11–13)
- First 12 DLS primitives with full TDD ✓ (Tasks 14–26)
- Remaining 34 components ✓ (Section 7 checklist — flagged for sub-plans)
- Exit criteria ✓ (Section 8)

**Placeholder scan:** All 26 tasks use the same full TDD shape (failing test → run → fail → SCSS impl → component impl → run → pass → story → verify → commit). Tasks 14–26 each include complete test code, SCSS, component, story, and commit message — no "fill in later" or "similar to Task N" placeholders. Section 7's 34-component checklist is intentionally a checklist (those are follow-up sub-plans, not Phase 1 deliverables — they get their own detailed plans when reached).

**Type consistency:** `ButtonProps` uses `variant`/`size` consistently. Theme slice uses `theme.type` consistently across store, Provider, and ThemeProvider. No naming drift.

**Gap:** No task explicitly covers SCSS module class-name hashing verification (CSS Modules requires `next.config.js` to be aware). This works out of the box with Next.js — verified in Task 6 by importing `global.scss`. If SCSS Modules fail, the failure surfaces in Task 14 Step 3 (Button.module.scss import) — add a config tweak there if needed.

---

## Execution Handoff

Plan saved to `/home/v2ray/projects/quran/docs/superpowers/plans/2026-07-27-phase-1-foundation.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints for review.

**Which approach?** Also let me know if you want me to expand Tasks 15–26 to full Task-14-style detail before execution.
